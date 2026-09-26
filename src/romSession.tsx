import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { getTrack as getCatalogTrack, tracks as catalogTracks, type Track } from './data'

type RomSessionValue = {
  tracks: Track[]
  getTrack: (id: string) => Track | undefined
  getRomBytes: (id: string) => ArrayBuffer | undefined
  addFiles: (files: File[]) => Promise<Track[]>
}

const RomSessionContext = createContext<RomSessionValue | null>(null)

export function RomSessionProvider({ children }: { children: ReactNode }) {
  const [userTracks, setUserTracks] = useState<Track[]>([])
  const buffers = useRef(new Map<string, ArrayBuffer>())

  const tracks = useMemo(() => [...userTracks, ...catalogTracks], [userTracks])

  const getTrack = useCallback(
    (id: string) => userTracks.find((track) => track.id === id) ?? getCatalogTrack(id),
    [userTracks],
  )

  const getRomBytes = useCallback((id: string) => buffers.current.get(id), [])

  const addFiles = useCallback(async (files: File[]) => {
    const added: Track[] = []
    for (const file of files) {
      const buffer = await file.arrayBuffer()
      const id = `local-${crypto.randomUUID()}`
      buffers.current.set(id, buffer)
      added.push({
        id,
        title: titleFromFilename(file.name),
        artist: 'Game Boy Advance',
        album: 'Máy này',
        duration: 0,
        playlistId: 'roms',
        filename: file.name,
        size: file.size,
      })
    }
    setUserTracks((current) => [...current, ...added])
    return added
  }, [])

  const value = useMemo(
    () => ({ tracks, getTrack, getRomBytes, addFiles }),
    [addFiles, getRomBytes, getTrack, tracks],
  )

  return <RomSessionContext.Provider value={value}>{children}</RomSessionContext.Provider>
}

export function useRomSession(): RomSessionValue {
  const value = useContext(RomSessionContext)
  if (!value) throw new Error('useRomSession phải nằm trong RomSessionProvider')
  return value
}

export function titleFromFilename(filename: string): string {
  return filename
    .replace(/\.(zip|gba|gb|gbc|agb)$/i, '')
    .replace(/_/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim() || filename
}
