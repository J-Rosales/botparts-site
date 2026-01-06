import { compileCharacter, emitPngPlaceholder, emitSillyTavernJson, emitTextPacks } from './generation.js';
import { fetchCharacterData, fetchIndexData, getBasePath, withDevCacheBust } from './site-data.js';

const ZIP_MIME = 'application/zip';
const JSON_MIME = 'application/json';
const TEXT_MIME = 'text/plain';
const PNG_MIME = 'image/png';
const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function ensureZipSupport() {
  if (!window.JSZip) {
    throw new Error('JSZip is required to create ZIP downloads.');
  }
  return window.JSZip;
}

export function downloadBlob(filename, mime, bytes) {
  const blob = bytes instanceof Blob ? bytes : new Blob([bytes], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function stringifyJson(payload) {
  return JSON.stringify(payload, null, 2);
}

function resolveSourceUrl(character, entry = null) {
  return (
    character?.provenance?.original?.url ||
    character?.source?.url ||
    entry?.source?.url ||
    ''
  );
}

function resolveTransformId(character) {
  return character?.transforms?.[0]?.id || 'natural';
}

function crc32(bytes) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function buildChunk(type, data) {
  const length = data.length;
  const chunk = new Uint8Array(12 + length);
  const view = new DataView(chunk.buffer);
  view.setUint32(0, length);
  chunk.set(type, 4);
  chunk.set(data, 8);
  const crc = crc32(chunk.subarray(4, 8 + length));
  view.setUint32(8 + length, crc);
  return chunk;
}

function buildTextChunk(keyword, text) {
  const encoder = new TextEncoder();
  const keywordBytes = encoder.encode(keyword);
  const textBytes = encoder.encode(text);
  const data = new Uint8Array(keywordBytes.length + 1 + textBytes.length);
  data.set(keywordBytes, 0);
  data[keywordBytes.length] = 0;
  data.set(textBytes, keywordBytes.length + 1);
  return buildChunk(new Uint8Array([0x74, 0x45, 0x58, 0x74]), data);
}

async function embedMetadataInPng(blob, metadataJson, keyword = 'chara') {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < PNG_SIGNATURE.length; i += 1) {
    if (bytes[i] !== PNG_SIGNATURE[i]) {
      throw new Error('Invalid PNG signature.');
    }
  }

  let offset = PNG_SIGNATURE.length;
  let iendOffset = -1;

  while (offset < bytes.length) {
    const view = new DataView(buffer, offset, 8);
    const length = view.getUint32(0);
    const type = String.fromCharCode(
      bytes[offset + 4],
      bytes[offset + 5],
      bytes[offset + 6],
      bytes[offset + 7]
    );
    if (type === 'IEND') {
      iendOffset = offset;
      break;
    }
    offset += 12 + length;
  }

  if (iendOffset === -1) {
    throw new Error('PNG missing IEND chunk.');
  }

  const textChunk = buildTextChunk(keyword, metadataJson);
  const before = bytes.subarray(0, iendOffset);
  const after = bytes.subarray(iendOffset);
  const combined = new Uint8Array(before.length + textChunk.length + after.length);
  combined.set(before, 0);
  combined.set(textChunk, before.length);
  combined.set(after, before.length + textChunk.length);
  return new Blob([combined], { type: PNG_MIME });
}

function deriveDefaults(modules = []) {
  const defaults = new Set();
  const groupDefaults = new Map();

  modules.forEach((module) => {
    if (module.type === 'required' || module.defaultEnabled) {
      defaults.add(module.id);
    }
    if (module.group && module.type === 'oneOf' && module.defaultEnabled) {
      groupDefaults.set(module.group, module.id);
    }
  });

  modules.forEach((module) => {
    if (module.group && module.type === 'oneOf' && !groupDefaults.has(module.group)) {
      groupDefaults.set(module.group, module.id);
    }
  });

  groupDefaults.forEach((moduleId) => defaults.add(moduleId));
  return defaults;
}

function resolveAssetUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const base = getBasePath();
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  return `${base}${normalized}`;
}

async function fetchPngAsset(character) {
  const candidate =
    character?.cardImage ||
    character?.image ||
    character?.media?.cardPng ||
    character?.media?.card ||
    character?.assets?.cardPng ||
    null;
  const resolved = resolveAssetUrl(candidate);
  if (!resolved) return null;
  const response = await fetch(withDevCacheBust(resolved));
  if (!response.ok) return null;
  const blob = await response.blob();
  const name = candidate.split('/').pop() || `${character.slug}.png`;
  return { blob, name };
}

function buildBaseFileName(slug, transformId) {
  return `${slug}-${transformId}`;
}

function buildManifest(compiled, transformId, sourceUrl) {
  return {
    slug: compiled.meta?.slug || '',
    name: compiled.meta?.name || '',
    version: compiled.meta?.version || '',
    transform: transformId,
    modules: compiled.modules || [],
    source: sourceUrl || null,
    generatedAt: new Date().toISOString()
  };
}

async function writePngToZip(folder, compiled, transformId, character, jsonPayload) {
  const pngAsset = await fetchPngAsset(character);
  const baseName = buildBaseFileName(compiled.meta?.slug || 'character', transformId);
  if (pngAsset) {
    try {
      const embedded = await embedMetadataInPng(pngAsset.blob, stringifyJson(jsonPayload));
      folder.file(`${baseName}.png`, embedded);
      return { usedPlaceholder: false, embedded: true };
    } catch (error) {
      folder.file(`${baseName}.png`, pngAsset.blob);
      folder.file(`${baseName}-metadata.json`, stringifyJson(jsonPayload));
      return { usedPlaceholder: false, embedded: false };
    }
  }
  const placeholder = emitPngPlaceholder(compiled, transformId);
  folder.file(`${baseName}-png-metadata.json`, stringifyJson(placeholder));
  return { usedPlaceholder: true, embedded: false };
}

export async function downloadSelection({ character, moduleIds, transformId, outputType }) {
  const compiled = compileCharacter(character, moduleIds);
  const resolvedTransform = transformId || resolveTransformId(character);
  const baseName = buildBaseFileName(compiled.meta?.slug || 'character', resolvedTransform);

  if (outputType === 'json') {
    const payload = emitSillyTavernJson(compiled, resolvedTransform);
    downloadBlob(`${baseName}.json`, JSON_MIME, stringifyJson(payload));
    return;
  }

  if (outputType === 'text') {
    const packs = emitTextPacks(compiled, resolvedTransform);
    packs.forEach((pack) => {
      downloadBlob(pack.name, TEXT_MIME, pack.content || '');
    });
    return;
  }

  if (outputType === 'png') {
    const pngAsset = await fetchPngAsset(character);
    if (pngAsset) {
      const metadata = emitSillyTavernJson(compiled, resolvedTransform);
      try {
        const embedded = await embedMetadataInPng(pngAsset.blob, stringifyJson(metadata));
        downloadBlob(`${baseName}.png`, PNG_MIME, embedded);
      } catch (error) {
        downloadBlob(`${baseName}.png`, PNG_MIME, pngAsset.blob);
        downloadBlob(`${baseName}-metadata.json`, JSON_MIME, stringifyJson(metadata));
      }
      return;
    }
    const placeholder = emitPngPlaceholder(compiled, resolvedTransform);
    downloadBlob(`${baseName}-png-metadata.json`, JSON_MIME, stringifyJson(placeholder));
  }
}

export async function downloadCharacterBundle({ character, moduleIds, transformId }) {
  const JSZip = ensureZipSupport();
  const compiled = compileCharacter(character, moduleIds);
  const resolvedTransform = transformId || resolveTransformId(character);
  const baseName = buildBaseFileName(compiled.meta?.slug || 'character', resolvedTransform);
  const zip = new JSZip();
  const folder = zip.folder(compiled.meta?.slug || 'character');

  const jsonPayload = emitSillyTavernJson(compiled, resolvedTransform);
  folder.file(`${baseName}.json`, stringifyJson(jsonPayload));

  const textPacks = emitTextPacks(compiled, resolvedTransform);
  textPacks.forEach((pack) => {
    folder.file(pack.name, pack.content || '');
  });

  await writePngToZip(folder, compiled, resolvedTransform, character, jsonPayload);

  const sourceUrl = resolveSourceUrl(character);
  const manifest = buildManifest(compiled, resolvedTransform, sourceUrl);
  folder.file('manifest.json', stringifyJson(manifest));

  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(`${baseName}-bundle.zip`, ZIP_MIME, blob);
}

export async function downloadSiteBundle() {
  const JSZip = ensureZipSupport();
  const index = await fetchIndexData();
  const entries = (index.entries || []).slice().sort((a, b) => a.slug.localeCompare(b.slug));
  const zip = new JSZip();
  const manifestLines = [];
  const manifestEntries = [];

  for (const entry of entries) {
    const character = await fetchCharacterData(entry.slug);
    const defaults = deriveDefaults(character.modules || []);
    const resolvedTransform = resolveTransformId(character);
    const compiled = compileCharacter(character, Array.from(defaults));
    const baseName = buildBaseFileName(compiled.meta?.slug || entry.slug, resolvedTransform);
    const folder = zip.folder(compiled.meta?.slug || entry.slug);
    const jsonPayload = emitSillyTavernJson(compiled, resolvedTransform);
    folder.file(`${baseName}.json`, stringifyJson(jsonPayload));

    await writePngToZip(folder, compiled, resolvedTransform, character, jsonPayload);

    const sourceUrl = resolveSourceUrl(character, entry);
    manifestLines.push(`${compiled.meta?.slug || entry.slug} | ${compiled.meta?.name || entry.name || ''} | ${sourceUrl || 'source unknown'}`);
    manifestEntries.push({
      slug: compiled.meta?.slug || entry.slug,
      name: compiled.meta?.name || entry.name || '',
      version: compiled.meta?.version || '',
      transform: resolvedTransform,
      modules: Array.from(defaults),
      source: sourceUrl || null
    });
  }

  zip.file('manifest.txt', manifestLines.join('\n'));
  zip.file('manifest.json', stringifyJson({ generatedAt: new Date().toISOString(), entries: manifestEntries }));

  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob('bot-catalogue-downloads.zip', ZIP_MIME, blob);
}
