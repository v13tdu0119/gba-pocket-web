import JSZip from 'jszip'

export async function loadRomBuffer(
  filename: string,
  onStatus: (message: string) => void,
  packed?: ArrayBuffer,
): Promise<ArrayBuffer> {
  const bytes = packed ?? (await fetchLocalRom(filename, onStatus))
  if (filename.toLowerCase().endsWith('.zip')) {
    onStatus('Đang giải nén ROM...')
    return unzipGba(bytes)
  }
  return bytes
}

async function fetchLocalRom(
  filename: string,
  onStatus: (message: string) => void,
): Promise<ArrayBuffer> {
  onStatus('Đang tải file...')
  const response = await fetch(`/roms/${encodeURIComponent(filename)}`)
  if (!response.ok) {
    throw new Error('Chọn file .gba hoặc .zip từ máy — site không chứa ROM.')
  }
  return response.arrayBuffer()
}

async function unzipGba(packed: ArrayBuffer): Promise<ArrayBuffer> {
  const zip = await JSZip.loadAsync(packed)
  const files = Object.values(zip.files).filter((file) => !file.dir)
  if (files.some((file) => /\.nds$/i.test(file.name))) {
    throw new Error('ZIP này chứa ROM Nintendo DS. GBA Pocket chỉ chạy game Game Boy Advance.')
  }
  if (files.length > 0 && files.every((file) => /\.ips$/i.test(file.name))) {
    throw new Error('ZIP này chỉ có file patch IPS, không có ROM để chạy.')
  }
  const roms = files.filter((file) => /\.(gba|agb|bin|mb)$/i.test(file.name))
  const preferred = roms.filter((file) => /\.(gba|agb)$/i.test(file.name))
  const pool = preferred.length > 0 ? preferred : roms
  const playable = pool.filter((file) => !/bios|firmware|\.sav/i.test(file.name))
  const candidates = playable.length > 0 ? playable : pool
  const entry = candidates.sort((a, b) => uncompressedSize(b) - uncompressedSize(a))[0]
  if (!entry) {
    throw new Error('Trong ZIP không có file .gba.')
  }
  return entry.async('arraybuffer')
}

function uncompressedSize(file: JSZip.JSZipObject): number {
  const data = (file as { _data?: { uncompressedSize?: number } })._data
  return data?.uncompressedSize ?? 0
}
