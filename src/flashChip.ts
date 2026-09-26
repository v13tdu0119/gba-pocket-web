type FlashPhase = 'ready' | 'unlock1' | 'unlock2' | 'program' | 'bank'

const BANK = 0x10000

/** JEDEC flash used by Pokémon gen 3 and other FLASH1M / FLASH512 carts. */
export class FlashChip {
  private readonly data: Uint8Array
  private readonly banks: number
  private readonly maker: number
  private readonly device: number
  private bank = 0
  private idMode = false
  private eraseArmed = false
  private phase: FlashPhase = 'ready'

  constructor(size1M: boolean) {
    this.banks = size1M ? 2 : 1
    this.data = new Uint8Array(this.banks * BANK).fill(0xff)
    if (size1M) {
      this.maker = 0xc2
      this.device = 0x09
    } else {
      this.maker = 0x32
      this.device = 0x1b
    }
  }

  read(address: number): number {
    const offset = address & 0xffff
    if (this.idMode) {
      if (offset === 0) return this.maker
      if (offset === 1) return this.device
    }
    return this.data[this.bank * BANK + offset] ?? 0xff
  }

  write(address: number, value: number): void {
    const offset = address & 0xffff
    const byte = value & 0xff

    if (this.phase === 'program') {
      const index = this.bank * BANK + offset
      this.data[index] = (this.data[index] ?? 0xff) & byte
      this.phase = 'ready'
      return
    }

    if (this.phase === 'bank') {
      this.bank = this.banks > 1 ? byte & 1 : 0
      this.phase = 'ready'
      return
    }

    if (this.phase === 'ready') {
      if (offset === 0x5555 && byte === 0xaa) this.phase = 'unlock1'
      else if (byte === 0xf0) this.resetMode()
      return
    }

    if (this.phase === 'unlock1') {
      this.phase = offset === 0x2aaa && byte === 0x55 ? 'unlock2' : 'ready'
      return
    }

    this.phase = 'ready'
    if (offset === 0x5555) {
      if (byte === 0x90) this.idMode = true
      else if (byte === 0xf0) this.resetMode()
      else if (byte === 0x80) this.eraseArmed = true
      else if (byte === 0xa0) this.phase = 'program'
      else if (byte === 0xb0) this.phase = 'bank'
      else if (byte === 0x10 && this.eraseArmed) {
        this.data.fill(0xff)
        this.eraseArmed = false
      }
      return
    }

    if (this.eraseArmed && byte === 0x30) {
      const start = this.bank * BANK + (offset & ~0xfff)
      this.data.fill(0xff, start, start + 0x1000)
      this.eraseArmed = false
    }
  }

  private resetMode() {
    this.idMode = false
    this.eraseArmed = false
  }
}

type FlashBus = {
  read8(address: number): number
  read16(address: number): number
  read32(address: number): number
  write8(address: number, value: number): void
  write16(address: number, value: number): void
  write32(address: number, value: number): void
  __flashOrig?: FlashBus
  __flash?: FlashChip | null
}

function inSramWindow(address: number): boolean {
  return ((address >>> 24) & 0xff) === 0x0e
}

export function attachFlashChip(bus: FlashBus, size1M: boolean): void {
  if (!bus.__flashOrig) {
    bus.__flashOrig = {
      read8: bus.read8.bind(bus),
      read16: bus.read16.bind(bus),
      read32: bus.read32.bind(bus),
      write8: bus.write8.bind(bus),
      write16: bus.write16.bind(bus),
      write32: bus.write32.bind(bus),
    }

    bus.read8 = (address) => {
      if (bus.__flash && inSramWindow(address)) return bus.__flash.read(address)
      return bus.__flashOrig!.read8(address)
    }
    bus.read16 = (address) => {
      if (bus.__flash && inSramWindow(address)) {
        const lo = bus.__flash.read(address)
        return lo | (lo << 8)
      }
      return bus.__flashOrig!.read16(address)
    }
    bus.read32 = (address) => {
      if (bus.__flash && inSramWindow(address)) {
        const lo = bus.__flash.read(address)
        return lo * 0x01010101
      }
      return bus.__flashOrig!.read32(address)
    }
    bus.write8 = (address, value) => {
      if (bus.__flash && inSramWindow(address)) {
        bus.__flash.write(address, value)
        return
      }
      bus.__flashOrig!.write8(address, value)
    }
    bus.write16 = (address, value) => {
      if (bus.__flash && inSramWindow(address)) {
        bus.__flash.write(address, value)
        return
      }
      bus.__flashOrig!.write16(address, value)
    }
    bus.write32 = (address, value) => {
      if (bus.__flash && inSramWindow(address)) {
        bus.__flash.write(address, value)
        return
      }
      bus.__flashOrig!.write32(address, value)
    }
  }

  bus.__flash = new FlashChip(size1M)
}

export function detachFlashChip(bus: FlashBus): void {
  if (bus.__flashOrig) bus.__flash = null
}
