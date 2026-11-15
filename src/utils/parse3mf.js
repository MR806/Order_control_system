/**
 * parse3mf.js
 * Pure-browser 3MF file parser (no external dependencies).
 *
 * A .3mf file is a ZIP archive. This module walks the ZIP Central Directory,
 * extracts XML text entries, and reads metadata from multiple slicer formats:
 *   - Bambu Studio / Orca Slicer  (Metadata/slice_info.config)
 *   - PrusaSlicer / SuperSlicer   (Metadata/Slic3r_PE.config)
 *   - Generic 3MF                 (3D/3dmodel.model  — model name only)
 *
 * Returns: { name, weightGrams, printTimeHours, source, raw }
 */

// ── ZIP helpers ──────────────────────────────────────────────────────────────

function readUint16(view, offset) {
  return view.getUint16(offset, true);
}
function readUint32(view, offset) {
  return view.getUint32(offset, true);
}

/**
 * Walk the ZIP End-of-Central-Directory record and Central Directory to
 * collect every file entry as { name, compressedSize, localHeaderOffset, compression }.
 */
function listZipEntries(buffer) {
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);
  const len = bytes.length;

  // Find End-of-Central-Directory signature: 0x06054b50
  let eocdOffset = -1;
  for (let i = len - 22; i >= 0; i--) {
    if (
      bytes[i] === 0x50 &&
      bytes[i + 1] === 0x4b &&
      bytes[i + 2] === 0x05 &&
      bytes[i + 3] === 0x06
    ) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset === -1) throw new Error('Not a valid ZIP / 3MF file.');

  const cdSize = readUint32(view, eocdOffset + 12);
  const cdOffset = readUint32(view, eocdOffset + 16);

  const entries = [];
  let pos = cdOffset;
  const cdEnd = cdOffset + cdSize;

  while (pos < cdEnd) {
    // Central directory file header signature: 0x02014b50
    if (
      bytes[pos] !== 0x50 ||
      bytes[pos + 1] !== 0x4b ||
      bytes[pos + 2] !== 0x01 ||
      bytes[pos + 3] !== 0x02
    ) break;

    const compression = readUint16(view, pos + 10);
    const compressedSize = readUint32(view, pos + 20);
    const fileNameLength = readUint16(view, pos + 28);
    const extraLength = readUint16(view, pos + 30);
    const commentLength = readUint16(view, pos + 32);
    const localHeaderOffset = readUint32(view, pos + 42);

    const nameBytes = bytes.slice(pos + 46, pos + 46 + fileNameLength);
    const name = new TextDecoder().decode(nameBytes);

    entries.push({ name, compressedSize, localHeaderOffset, compression });
    pos += 46 + fileNameLength + extraLength + commentLength;
  }

  return entries;
}

/**
 * Read a single file's raw bytes from a local ZIP header.
 */
function readZipFileData(buffer, entry) {
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);
  const { localHeaderOffset, compressedSize } = entry;

  const fileNameLength = readUint16(view, localHeaderOffset + 26);
  const extraLength = readUint16(view, localHeaderOffset + 28);
  const dataStart = localHeaderOffset + 30 + fileNameLength + extraLength;

  return bytes.slice(dataStart, dataStart + compressedSize);
}

/**
 * Decompress a DEFLATE-compressed ZIP entry using DecompressionStream (Chrome 80+, Firefox 113+).
 */
async function inflate(compressedBytes) {
  const ds = new DecompressionStream('deflate-raw');
  const writer = ds.writable.getWriter();
  writer.write(compressedBytes);
  writer.close();
  const chunks = [];
  const reader = ds.readable.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  const totalLen = chunks.reduce((s, c) => s + c.length, 0);
  const result = new Uint8Array(totalLen);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

/**
 * Extract a file from the ZIP as a UTF-8 string.
 * compression: 0 = stored, 8 = deflate
 */
async function extractText(buffer, entry) {
  const raw = readZipFileData(buffer, entry);
  let decoded;
  if (entry.compression === 0) {
    decoded = raw;
  } else if (entry.compression === 8) {
    decoded = await inflate(raw);
  } else {
    throw new Error(`Unsupported ZIP compression: ${entry.compression}`);
  }
  return new TextDecoder('utf-8').decode(decoded);
}

// ── Slicer-specific parsers ──────────────────────────────────────────────────

/**
 * Bambu Studio / Orca Slicer: Metadata/slice_info.config (XML)
 * Example content:
 *   <slice_info>
 *     <filament_weight>45.32</filament_weight>
 *     <print_time>3h 25m</print_time>
 *   </slice_info>
 */
function parseBambuSliceInfo(xml) {
  const result = {};

  // Weight
  const wMatch = xml.match(/<filament_weight[^>]*>\s*([\d.]+)\s*<\/filament_weight>/i);
  if (wMatch) result.weightGrams = parseFloat(wMatch[1]);

  // Time — could be "3h 25m 10s", "1h", "45m", etc.
  const tMatch = xml.match(/<print_time[^>]*>(.*?)<\/print_time>/i);
  if (tMatch) result.printTimeHours = parseTimeString(tMatch[1]);

  // Filament Color (#RRGGBB)
  const cMatch = xml.match(/<(?:filament_color|color)[^>]*>#?([0-9a-fA-F]{6})<\/(?:filament_color|color)>/i);
  if (cMatch) {
    result.colorHex = `#${cMatch[1]}`;
    result.color = `#${cMatch[1]}`;
  }

  return result;
}

/**
 * Also check Bambu Metadata/model_settings.config for filament used
 * and Metadata/project_settings.config for time.
 */
function parseBambuProjectSettings(xml) {
  const result = {};
  // filament_total_weight
  const wMatch = xml.match(/"filament_total_weight"\s*:\s*"([\d.]+)"/);
  if (wMatch) result.weightGrams = parseFloat(wMatch[1]);
  return result;
}

/**
 * PrusaSlicer / SuperSlicer: Metadata/Slic3r_PE.config (INI-like)
 * Keys: filament_used_g, estimated_print_time, output_filename_format
 */
function parsePrusaConfig(text) {
  const result = {};

  // Weight — sum of all values in filament_used_g array
  const wMatch = text.match(/filament_used_g\s*=\s*([^\r\n]+)/i);
  if (wMatch) {
    const nums = wMatch[1].split(',').map((v) => parseFloat(v.trim())).filter((n) => !isNaN(n));
    if (nums.length > 0) result.weightGrams = nums.reduce((s, n) => s + n, 0);
  }

  // Time
  const tMatch = text.match(/estimated_print_time\s*=\s*([^\r\n]+)/i);
  if (tMatch) result.printTimeHours = parseTimeString(tMatch[1].trim());

  // Filament Color
  const cMatch = text.match(/filament_colour\s*=\s*#?([0-9a-fA-F]{6})/i);
  if (cMatch) {
    result.colorHex = `#${cMatch[1]}`;
    result.color = `#${cMatch[1]}`;
  }

  return result;
}

/**
 * Generic 3MF: 3D/3dmodel.model — look for <model> metadata and object names
 */
function parseGenericModel(xml) {
  const result = {};

  // Model name from <metadata name="Title"> or <metadata name="Description">
  const titleMatch = xml.match(/<metadata[^>]+name=["']Title["'][^>]*>(.*?)<\/metadata>/is);
  if (titleMatch) result.name = titleMatch[1].trim();

  // Fall back to first object name attribute
  if (!result.name) {
    const objMatch = xml.match(/<object[^>]+name=["']([^"']+)["']/i);
    if (objMatch) result.name = objMatch[1].trim();
  }

  return result;
}

// ── Time string parser ───────────────────────────────────────────────────────

/**
 * Convert strings like "3h 25m 10s", "1 hour 10 mins", "00:03:25", "1234" (seconds) → decimal hours
 */
function parseTimeString(str) {
  if (!str) return null;
  str = str.trim();

  // HH:MM:SS
  const colonMatch = str.match(/^(\d+):(\d+):(\d+)$/);
  if (colonMatch) {
    const [, h, m, s] = colonMatch.map(Number);
    return +(h + m / 60 + s / 3600).toFixed(2);
  }

  // MM:SS
  const mmss = str.match(/^(\d+):(\d+)$/);
  if (mmss) {
    const [, m, s] = mmss.map(Number);
    return +(m / 60 + s / 3600).toFixed(2);
  }

  // Plain seconds number
  if (/^\d+$/.test(str)) {
    return +(parseInt(str, 10) / 3600).toFixed(2);
  }

  // "3h 25m 10s" / "3 hours 25 mins"
  let hours = 0, minutes = 0, seconds = 0;
  const hMatch = str.match(/(\d+)\s*h/i);
  const mMatch = str.match(/(\d+)\s*m(?!s)/i);
  const sMatch = str.match(/(\d+)\s*s/i);
  if (hMatch) hours = parseInt(hMatch[1], 10);
  if (mMatch) minutes = parseInt(mMatch[1], 10);
  if (sMatch) seconds = parseInt(sMatch[1], 10);
  if (hours || minutes || seconds) {
    return +(hours + minutes / 60 + seconds / 3600).toFixed(2);
  }

  return null;
}

// ── Main export ──────────────────────────────────────────────────────────────

/**
 * Parse a 3MF File object and return extracted metadata.
 *
 * @param {File} file  — A .3mf file from an <input type="file">
 * @returns {Promise<{ name: string|null, weightGrams: number|null, printTimeHours: number|null, source: string, raw: object }>}
 */
export async function parse3mf(file) {
  const buffer = await file.arrayBuffer();
  const entries = listZipEntries(buffer);

  const findEntry = (pattern) =>
    entries.find((e) => pattern.test(e.name.replace(/\\/g, '/')));

  const result = {
    name: null,
    weightGrams: null,
    printTimeHours: null,
    color: null,
    colorHex: null,
    source: 'generic',
    raw: {},
  };

  // ── 1. Generic model name from 3D/3dmodel.model ──────────────────────────
  const modelEntry = findEntry(/^3D\/3dmodel\.model$/i);
  if (modelEntry) {
    try {
      const xml = await extractText(buffer, modelEntry);
      const generic = parseGenericModel(xml);
      if (generic.name) result.name = generic.name;
      result.raw.modelXml = xml.slice(0, 500); // keep snippet for debugging
    } catch (_) { /* non-fatal */ }
  }

  // ── 2. Bambu / Orca: Metadata/slice_info.config ──────────────────────────
  const bambuSlice = findEntry(/Metadata\/slice_info\.config$/i);
  if (bambuSlice) {
    try {
      const xml = await extractText(buffer, bambuSlice);
      const data = parseBambuSliceInfo(xml);
      if (data.weightGrams != null) result.weightGrams = data.weightGrams;
      if (data.printTimeHours != null) result.printTimeHours = data.printTimeHours;
      if (data.color) result.color = data.color;
      if (data.colorHex) result.colorHex = data.colorHex;
      result.source = 'bambu/orca';
      result.raw.sliceInfo = xml.slice(0, 1000);
    } catch (_) { /* non-fatal */ }
  }

  // ── 3. Bambu / Orca: Metadata/project_settings.config ───────────────────
  if (result.weightGrams == null) {
    const bambuProject = findEntry(/Metadata\/project_settings\.config$/i);
    if (bambuProject) {
      try {
        const text = await extractText(buffer, bambuProject);
        const data = parseBambuProjectSettings(text);
        if (data.weightGrams != null) result.weightGrams = data.weightGrams;
        if (result.source === 'generic') result.source = 'bambu/orca';
      } catch (_) { /* non-fatal */ }
    }
  }

  // ── 4. PrusaSlicer / SuperSlicer: Metadata/Slic3r_PE.config ─────────────
  const prusaEntry = findEntry(/Metadata\/Slic3r_PE\.config$/i);
  if (prusaEntry) {
    try {
      const text = await extractText(buffer, prusaEntry);
      const data = parsePrusaConfig(text);
      if (data.weightGrams != null) result.weightGrams = data.weightGrams;
      if (data.printTimeHours != null) result.printTimeHours = data.printTimeHours;
      if (data.color && !result.color) result.color = data.color;
      if (data.colorHex && !result.colorHex) result.colorHex = data.colorHex;
      result.source = 'prusa';
    } catch (_) { /* non-fatal */ }
  }

  // ── 5. Use filename as fallback name ─────────────────────────────────────
  if (!result.name) {
    result.name = file.name.replace(/\.3mf$/i, '').replace(/[_-]/g, ' ').trim() || null;
  }

  return result;
}
