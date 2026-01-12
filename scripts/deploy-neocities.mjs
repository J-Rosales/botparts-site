import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";

const API_BASE = "https://neocities.org/api";
const DEFAULT_DIR = "dist";
const DEFAULT_MAX_BYTES = 8 * 1024 * 1024; // keep requests reasonably sized

function parseArgs(argv) {
  const out = { dir: DEFAULT_DIR, clean: false, maxBytes: DEFAULT_MAX_BYTES };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dir") out.dir = argv[++i];
    else if (a === "--clean") out.clean = true;
    else if (a === "--max-bytes") out.maxBytes = Number(argv[++i]);
  }
  return out;
}

function readSecretsFile(filepath) {
  if (!fs.existsSync(filepath)) return {};
  const txt = fs.readFileSync(filepath, "utf8");
  const lines = txt.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith("#"));
  const kv = {};
  for (const line of lines) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!m) continue;
    const k = m[1];
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    kv[k] = v;
  }
  return kv;
}

function getApiKey() {
  if (process.env.NEOCITIES_API_KEY) return process.env.NEOCITIES_API_KEY.trim();
  const secrets = readSecretsFile(path.resolve(".secrets"));
  if (secrets.NEOCITIES_API_KEY) return secrets.NEOCITIES_API_KEY.trim();
  throw new Error("Missing NEOCITIES_API_KEY (set env var or add to .secrets).");
}

async function walkFiles(rootDir) {
  const out = [];
  async function rec(dir) {
    const entries = await fsp.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) await rec(p);
      else if (e.isFile()) out.push(p);
    }
  }
  await rec(rootDir);
  return out;
}

function toPosix(p) {
  return p.split(path.sep).join("/");
}

async function neocitiesList(apiKey) {
  const res = await fetch(`${API_BASE}/list`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const json = await res.json();
  if (!res.ok || json.result !== "success") throw new Error(`list failed: ${JSON.stringify(json)}`);
  return json.files ?? [];
}

async function neocitiesDelete(apiKey, paths) {
  if (paths.length === 0) return;
  const body = new URLSearchParams();
  for (const p of paths) body.append("filenames[]", p);

  const res = await fetch(`${API_BASE}/delete`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body,
  });
  const json = await res.json();
  if (!res.ok || json.result !== "success") throw new Error(`delete failed: ${JSON.stringify(json)}`);
}

async function neocitiesUploadBatch(apiKey, items) {
  const form = new FormData();
  for (const it of items) {
    const buf = await fsp.readFile(it.localPath);
    form.append(it.remotePath, new Blob([buf]), path.posix.basename(it.remotePath));
  }

  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });
  const json = await res.json();
  if (!res.ok || json.result !== "success") throw new Error(`upload failed: ${JSON.stringify(json)}`);
}

async function main() {
  const { dir, clean, maxBytes } = parseArgs(process.argv);
  const apiKey = getApiKey();

  const root = path.resolve(dir);
  if (!fs.existsSync(root)) throw new Error(`Directory not found: ${root}`);

  const localFiles = await walkFiles(root);
  const uploadItems = [];
  for (const f of localFiles) {
    const rel = path.relative(root, f);
    const remotePath = toPosix(rel); // upload relative paths into site root
    const st = await fsp.stat(f);
    uploadItems.push({ localPath: f, remotePath, size: st.size });
  }

  if (clean) {
    const remote = await neocitiesList(apiKey);
    const remoteFiles = remote.filter(x => !x.is_directory).map(x => x.path);
    const localSet = new Set(uploadItems.map(x => x.remotePath));

    // Neocities forbids deleting index.html via API. :contentReference[oaicite:1]{index=1}
    const toDelete = remoteFiles.filter(p => p !== "index.html" && !localSet.has(p));
    await neocitiesDelete(apiKey, toDelete);
  }

  // Chunk uploads by total bytes to avoid giant requests.
  let batch = [];
  let batchBytes = 0;
  for (const it of uploadItems) {
    if (batch.length > 0 && batchBytes + it.size > maxBytes) {
      await neocitiesUploadBatch(apiKey, batch);
      batch = [];
      batchBytes = 0;
    }
    batch.push(it);
    batchBytes += it.size;
  }
  if (batch.length > 0) await neocitiesUploadBatch(apiKey, batch);

  console.log(`Deployed ${uploadItems.length} files from ${dir}${clean ? " (with cleanup)" : ""}.`);
}

main().catch(err => {
  console.error(err?.stack ?? String(err));
  process.exit(1);
});
