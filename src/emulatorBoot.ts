import type { EmulatorBridge } from '@gba-kit/gba-browser'
import { attachFlashChip, detachFlashChip } from './flashChip'

const WAITCNT = 0x04000204
const POSTFLG = 0x04000300
const DISPCNT = 0x04000000

export function prepareCartridge(emulator: EmulatorBridge): void {
  const bus = emulator.gba.bus as Parameters<typeof attachFlashChip>[0] & {
    save: { type: string | null }
  }
  const saveType = bus.save.type
  if (saveType === 'flash1m' || saveType === 'flash512') {
    attachFlashChip(bus, saveType === 'flash1m')
    return
  }
  detachFlashChip(bus)
}

/** Match post-BIOS I/O the official firmware leaves before jumping to ROM. */
export function applySkipBiosIo(emulator: EmulatorBridge): void {
  emulator.gba.bus.write16(WAITCNT, 0x4317)
  emulator.gba.bus.write16(POSTFLG, 1)
  emulator.gba.bus.write16(DISPCNT, 0x0080)
}
