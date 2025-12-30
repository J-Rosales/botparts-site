import { compileCharacter, emitPngPlaceholder, emitSillyTavernJson, emitTextPacks } from './generation.js';
import { fetchCharacterData, fetchIndexData, getBasePath } from './site-data.js';

const ZIP_MIME = 'application/zip';
const JSON_MIME = 'application/json';
const TEXT_MIME = 'text/plain';
const PNG_MIME = 'image/png';

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
  const response = await fetch(resolved);
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

async function writePngToZip(folder, compiled, transformId, character) {
  const pngAsset = await fetchPngAsset(character);
  const baseName = buildBaseFileName(compiled.meta?.slug || 'character', transformId);
  if (pngAsset) {
    folder.file(`${baseName}.png`, pngAsset.blob);
    return { usedPlaceholder: false };
  }
  const placeholder = emitPngPlaceholder(compiled, transformId);
  folder.file(`${baseName}-png-metadata.json`, stringifyJson(placeholder));
  return { usedPlaceholder: true };
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
      downloadBlob(`${baseName}.png`, PNG_MIME, pngAsset.blob);
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

  await writePngToZip(folder, compiled, resolvedTransform, character);

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

    await writePngToZip(folder, compiled, resolvedTransform, character);

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
