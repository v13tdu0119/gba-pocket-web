import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import {
  useEmulator,
  useEmulatorCanvas,
  useEmulatorKeyboard,
} from '@gba-kit/gba-react'
import type { EmulatorBridge } from '@gba-kit/gba-browser'
import { applySkipBiosIo, prepareCartridge } from '../emulatorBoot'
import { formatSize, getTrack, tracks } from '../data'
import { inspectRom } from '../romInspect'
import { loadRomBuffer } from '../romLoader'
import { usePlayer } from '../player'

type GameStageProps = {
  gameId: string | null
  onSelectGame: (id: string) => void
}

export function GameStage({ gameId, onSelectGame }: GameStageProps) {
  const game = gameId ? getTrack(gameId) : undefined
  const { emulator } = useEmulator()
  const canvasRef = useEmulatorCanvas(emulator)
  const screenRef = useRef<HTMLDivElement>(null)
  useEmulatorKeyboard(emulator)
  useGbaAspectFit(screenRef, canvasRef)
  const { playTrack } = usePlayer()
  const [phase, setPhase] = useState<'idle' | 'loading' | 'running' | 'error'>(
    'idle',
  )
  const [message, setMessage] = useState('Chọn một game trong Playlist ROM.')
  const [hint, setHint] = useState<string | null>(null)
  const [soundOn, setSoundOn] = useState(false)

  useEffect(() => {
    const unlock = () => {
      emulator.enableAudio()
      setSoundOn(emulator.audioEnabled)
    }
    window.addEventListener('pointerdown', unlock)
    window.addEventListener('keydown', unlock)
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [emulator])

  useEffect(() => {
    if (!game?.filename) {
      emulator.pause()
      setPhase('idle')
      setHint(null)
      setMessage('Chọn một game trong Playlist ROM.')
      return
    }

    let cancelled = false
    const selected = game
    const timers: number[] = []

    async function boot() {
      setPhase('loading')
      setHint(null)
      setMessage('Đang tải file...')
      try {
        const rom = await loadRomBuffer(selected.filename ?? '', (status) => {
          if (!cancelled) setMessage(status)
        })
        if (cancelled) return
        const info = inspectRom(rom)
        if (info.kind !== 'gba') {
          throw new Error(info.reason ?? 'ROM này không chạy được trên GBA Pocket.')
        }
        setMessage('Đang khởi chạy...')
        emulator.loadRom(rom)
        prepareCartridge(emulator)
        applySkipBiosIo(emulator)
        emulator.run()
        emulator.enableAudio()
        if (cancelled) {
          emulator.pause()
          return
        }
        setSoundOn(emulator.audioEnabled)
        setPhase('running')
        playTrack(selected, tracks)
        scheduleWarningSkip(emulator, () => canvasRef.current, timers, () => cancelled, setHint)
      } catch (error) {
        if (cancelled) return
        setPhase('error')
        setMessage(error instanceof Error ? error.message : 'Không chạy được game.')
      }
    }

    void boot()
    return () => {
      cancelled = true
      for (const timer of timers) window.clearTimeout(timer)
      emulator.gba.input.setButtons(0)
      emulator.pause()
    }
  }, [canvasRef, emulator, game, playTrack])

  return (
    <div className={game ? 'view stage-view is-playing' : 'view stage-view'}>
      <article className="stage-card">
        <header className="stage-head">
          <div
            className="stage-cover"
            style={{ background: game ? coverFor(game.title) : '#1ed760' }}
          >
            {(game?.title ?? 'G').slice(0, 1)}
          </div>
          <div>
            <p className="eyebrow">{game ? 'ROM đã chọn' : 'Chưa chọn game'}</p>
            <h1>{game?.title ?? 'GBA Pocket'}</h1>
            <p className="lede">
              {game
                ? `${game.filename} · ${formatSize(game.size ?? 0)}`
                : 'Bấm một tựa trong Playlist ROM để giải nén và chơi trên card này.'}
            </p>
          </div>
          <button
            type="button"
            className={soundOn ? 'sound-toggle is-on' : 'sound-toggle'}
            aria-pressed={soundOn}
            aria-label={soundOn ? 'Tắt tiếng' : 'Bật tiếng'}
            onClick={() => setSoundOn(emulator.toggleAudio())}
          >
            {soundOn ? 'Tiếng' : 'Tắt'}
          </button>
        </header>

        <div className="stage-screen" ref={screenRef}>
          <canvas ref={canvasRef} className="gba-canvas" />
          {phase !== 'running' && (
            <div className={phase === 'error' ? 'stage-overlay is-error' : 'stage-overlay'}>
              {phase === 'loading' && <span className="spinner" aria-hidden="true" />}
              <p>{message}</p>
            </div>
          )}
        </div>

        <p className="stage-keys">
          D-pad: phím mũi tên · A: Z · B: X · Start: Enter · Select: Backspace · L/R: A/S
          {hint ? ` · ${hint}` : ''}
        </p>
      </article>

      {!game && (
        <section className="stage-mobile-list">
          <h2>Tất cả game</h2>
          <ul>
            {tracks.map((track) => (
              <li key={track.id}>
                <button type="button" onClick={() => onSelectGame(track.id)}>
                  {track.title}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

const GBA_WIDTH = 240
const GBA_HEIGHT = 160

function useGbaAspectFit(
  screenRef: RefObject<HTMLDivElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
) {
  useLayoutEffect(() => {
    const screen = screenRef.current
    const canvas = canvasRef.current
    if (!screen || !canvas) return

    const fit = () => {
      const scale = Math.min(screen.clientWidth / GBA_WIDTH, screen.clientHeight / GBA_HEIGHT)
      canvas.style.width = `${GBA_WIDTH * scale}px`
      canvas.style.height = `${GBA_HEIGHT * scale}px`
    }

    const observer = new ResizeObserver(fit)
    observer.observe(screen)
    fit()
    return () => observer.disconnect()
  }, [canvasRef, screenRef])
}

const START_BUTTON = 3
const A_BUTTON = 0

function tapButton(emulator: EmulatorBridge, button: number, holdMs = 180) {
  emulator.gba.input.press(button)
  window.setTimeout(() => emulator.gba.input.release(button), holdMs)
}

function canvasFill(canvas: HTMLCanvasElement | null) {
  if (!canvas || canvas.width === 0) return { white: 0, black: 0 }
  const ctx = canvas.getContext('2d')
  if (!ctx) return { white: 0, black: 0 }
  const { width, height } = canvas
  const pixels = ctx.getImageData(0, 0, width, height).data
  let white = 0
  let black = 0
  const total = width * height
  for (let i = 0; i < pixels.length; i += 4) {
    const lum = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3
    if (lum > 240) white += 1
    if (lum < 15) black += 1
  }
  return { white: white / total, black: black / total }
}

function scheduleWarningSkip(
  emulator: EmulatorBridge,
  getCanvas: () => HTMLCanvasElement | null,
  timers: number[],
  isCancelled: () => boolean,
  setHint: (hint: string | null) => void,
) {
  const attempts = [700, 1500, 2600, 4000]
  for (const [index, delay] of attempts.entries()) {
    timers.push(
      window.setTimeout(() => {
        if (isCancelled()) return
        const fill = canvasFill(getCanvas())
        if (fill.white >= 0.65) {
          tapButton(emulator, START_BUTTON, 280)
          tapButton(emulator, A_BUTTON, 280)
          setHint(
            index < attempts.length - 1
              ? 'Màn hình trắng — đang nhấn Start/A để bỏ qua cảnh báo Nintendo.'
              : 'Vẫn trắng. Thử Enter/Z. Một số ROM (DS, dump lỗi) không chạy trên emulator này.',
          )
          return
        }
        if (fill.black >= 0.97) {
          setHint('Màn hình đen kéo dài — thử Enter hoặc Z, hoặc chọn lại game.')
          return
        }
        setHint(null)
      }, delay),
    )
  }

  timers.push(
    window.setTimeout(() => {
      if (isCancelled()) return
      const fill = canvasFill(getCanvas())
      if (fill.white < 0.65 && fill.black < 0.92) setHint(null)
    }, 5500),
  )
}

function coverFor(title: string): string {
  const colors = ['#1ed760', '#3d8b5a', '#c4453a', '#2a6f9a', '#5b4bff', '#e07a8a', '#d4a017']
  let hash = 0
  for (const char of title) hash = char.charCodeAt(0) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length] ?? '#1ed760'
}
