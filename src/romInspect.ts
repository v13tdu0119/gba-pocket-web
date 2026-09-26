export type RomKind = 'gba' | 'nds' | 'gb' | 'invalid'

export type RomInfo = {
  kind: RomKind
  title: string
  size: number
  reason?: string
}

export function inspectRom(buffer: ArrayBuffer): RomInfo {
  const bytes = new Uint8Array(buffer)
  if (bytes.length < 0xc0) {
    return {
      kind: 'invalid',
      title: '',
      size: bytes.length,
      reason: 'File quá nhỏ, không phải ROM GBA.',
    }
  }

  if (bytes.length > 0x2000000 || looksLikeNds(bytes)) {
    return {
      kind: 'nds',
      title: ascii(bytes, 0, 12),
      size: bytes.length,
      reason: 'Đây là ROM Nintendo DS. Emulator này chỉ chạy Game Boy Advance.',
    }
  }

  if (bytes[0xb2] === 0x96) {
    return {
      kind: 'gba',
      title: ascii(bytes, 0xa0, 12),
      size: bytes.length,
    }
  }

  if (bytes.length <= 0x200000 && looksLikeGb(bytes)) {
    return {
      kind: 'gb',
      title: ascii(bytes, 0x134, 15),
      size: bytes.length,
      reason:
        'Đây là ROM Game Boy/GBC. Chỉ chạy được khi đã đóng gói Goomba thành file .gba.',
    }
  }

  return {
    kind: 'invalid',
    title: '',
    size: bytes.length,
    reason: 'Không thấy header GBA hợp lệ.',
  }
}

function ascii(bytes: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...bytes.subarray(start, start + length)).replace(
    /[\0\x80-\xff]+/g,
    '',
  ).trim()
}

function looksLikeNds(bytes: Uint8Array): boolean {
  if (bytes.length < 0x40) return false
  const arm9 = bytes[0x20] | (bytes[0x21] << 8) | (bytes[0x22] << 16) | (bytes[0x23] << 24)
  const arm7 = bytes[0x30] | (bytes[0x31] << 8) | (bytes[0x32] << 16) | (bytes[0x33] << 24)
  return arm9 >= 0x200 && arm9 < bytes.length && arm7 >= 0x200 && arm7 < bytes.length
}

function looksLikeGb(bytes: Uint8Array): boolean {
  return bytes.length >= 0x150 && bytes[0x104] === 0xce && bytes[0x105] === 0xed
}
