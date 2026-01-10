import {
  fetchCatalogueEntries,
  fetchCharacterManifest,
  fetchCharacterSpec,
  getBasePath,
  getCharacterPngPath,
  getProseVariants,
  withDevCacheBust
} from './site-data.js';

const ZIP_MIME = 'application/zip';
const JSON_MIME = 'application/json';
const PNG_MIME = 'image/png';
const DEFAULT_AVATAR_FILENAME = 'avatarImage.png';
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

function resolveAssetUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const base = getBasePath();
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  return `${base}${normalized}`;
}

function getSpecFileName(variant) {
  return `spec_v2.${variant}.json`;
}

function getEmbeddedPngName() {
  return DEFAULT_AVATAR_FILENAME;
}

async function fetchPngAsset(slug, variantSlug = null) {
  const resolved = resolveAssetUrl(getCharacterPngPath(slug, variantSlug));
  if (!resolved) return null;
  const response = await fetch(withDevCacheBust(resolved));
  if (!response.ok) return null;
  const blob = await response.blob();
  return { blob, name: resolved.split('/').pop() || `${slug}.png` };
}

async function writeEmbeddedPng(folder, slug, variant, spec, variantSlug = null) {
  const pngAsset = await fetchPngAsset(slug, variantSlug);
  if (!pngAsset) {
    folder.file(`${slug}--${variant}-png-metadata.json`, stringifyJson(spec));
    return { embedded: false, missing: true };
  }
  try {
    const embedded = await embedMetadataInPng(pngAsset.blob, stringifyJson(spec));
    folder.file(getEmbeddedPngName(), embedded);
    return { embedded: true, missing: false };
  } catch (error) {
    folder.file(getEmbeddedPngName(), pngAsset.blob);
    folder.file(`${slug}--${variant}-metadata.json`, stringifyJson(spec));
    return { embedded: false, missing: false };
  }
}

export async function downloadSelection({ slug, manifest, proseVariant, outputType, variantSlug = null }) {
  const variants = getProseVariants(manifest);
  const resolvedVariant = proseVariant || variants[0] || 'schema-like';
  const spec = await fetchCharacterSpec(slug, resolvedVariant, variantSlug);

  if (outputType === 'json') {
    downloadBlob(getSpecFileName(resolvedVariant), JSON_MIME, stringifyJson(spec));
    return;
  }

  if (outputType === 'png') {
    const pngAsset = await fetchPngAsset(slug, variantSlug);
    if (pngAsset) {
      try {
        const embedded = await embedMetadataInPng(pngAsset.blob, stringifyJson(spec));
        downloadBlob(getEmbeddedPngName(), PNG_MIME, embedded);
      } catch (error) {
        downloadBlob(getEmbeddedPngName(), PNG_MIME, pngAsset.blob);
        downloadBlob(`${slug}--${resolvedVariant}-metadata.json`, JSON_MIME, stringifyJson(spec));
      }
      return;
    }
    downloadBlob(`${slug}--${resolvedVariant}-png-metadata.json`, JSON_MIME, stringifyJson(spec));
  }
}

export async function downloadCharacterBundle({ slug, manifest }) {
  const JSZip = ensureZipSupport();
  const zip = new JSZip();
  const variants = getProseVariants(manifest);
  const variantSlugs = manifest?.x?.variantSlugs || manifest?.variantSlugs || [];
  const rootFolder = zip.folder(slug);

  rootFolder.file('manifest.json', stringifyJson(manifest));

  for (const variant of variants) {
    const spec = await fetchCharacterSpec(slug, variant);
    rootFolder.file(getSpecFileName(variant), stringifyJson(spec));
    await writeEmbeddedPng(rootFolder, slug, variant, spec);
  }

  for (const variantSlug of variantSlugs) {
    const variantFolder = zip.folder(`${slug}/variants/${variantSlug}`);
    for (const variant of variants) {
      const spec = await fetchCharacterSpec(slug, variant, variantSlug);
      variantFolder.file(getSpecFileName(variant), stringifyJson(spec));
      await writeEmbeddedPng(variantFolder, slug, variant, spec, variantSlug);
    }
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(`${slug}-bundle.zip`, ZIP_MIME, blob);
}

export async function downloadSiteBundle() {
  const JSZip = ensureZipSupport();
  const entries = await fetchCatalogueEntries();
  const zip = new JSZip();

  for (const entry of entries) {
    const slug = entry.slug;
    const manifest = entry.manifest || await fetchCharacterManifest(slug);
    const variants = getProseVariants(manifest);
    const variantSlugs = manifest?.x?.variantSlugs || manifest?.variantSlugs || [];
    const folder = zip.folder(slug);
    folder.file('manifest.json', stringifyJson(manifest));
    for (const variant of variants) {
      const spec = await fetchCharacterSpec(slug, variant);
      folder.file(getSpecFileName(variant), stringifyJson(spec));
      await writeEmbeddedPng(folder, slug, variant, spec);
    }
    for (const variantSlug of variantSlugs) {
      const variantFolder = zip.folder(`${slug}/variants/${variantSlug}`);
      for (const variant of variants) {
        const spec = await fetchCharacterSpec(slug, variant, variantSlug);
        variantFolder.file(getSpecFileName(variant), stringifyJson(spec));
        await writeEmbeddedPng(variantFolder, slug, variant, spec, variantSlug);
      }
    }
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob('bot-catalogue-downloads.zip', ZIP_MIME, blob);
}
