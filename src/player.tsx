import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getPlaylist, getPlaylistTracks, tracks, type Track } from './data'

type PlayerContextValue = {
  current: Track | null
  queue: Track[]
  isPlaying: boolean
  progress: number
  volume: number
  likedIds: string[]
  playTrack: (track: Track, queue?: Track[]) => void
  playPlaylist: (playlistId: string) => void
  togglePlay: () => void
  next: () => void
  prev: () => void
  seek: (seconds: number) => void
  setVolume: (value: number) => void
  toggleLike: (trackId: string) => void
}

const PlayerContext = createContext<PlayerContextValue | null>(null)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<Track | null>(tracks[0] ?? null)
  const [queue, setQueue] = useState<Track[]>(tracks)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(0.72)
  const [likedIds, setLikedIds] = useState<string[]>([])

  const playTrack = useCallback((track: Track, nextQueue?: Track[]) => {
    setCurrent(track)
    setProgress(0)
    setIsPlaying(true)
    if (nextQueue) setQueue(nextQueue)
  }, [])

  const playPlaylist = useCallback(
    (playlistId: string) => {
      const playlist = getPlaylist(playlistId)
      if (!playlist) return
      const list = getPlaylistTracks(playlist)
      if (list[0]) playTrack(list[0], list)
    },
    [playTrack],
  )

  const next = useCallback(() => {
    if (!current || queue.length === 0) return
    const index = queue.findIndex((track) => track.id === current.id)
    const following = queue[index + 1] ?? queue[0]
    if (!following) return
    setCurrent(following)
    setProgress(0)
    setIsPlaying(true)
  }, [current, queue])

  const prev = useCallback(() => {
    if (!current) return
    if (progress > 3) {
      setProgress(0)
      return
    }
    const index = queue.findIndex((track) => track.id === current.id)
    const previous = queue[index - 1] ?? queue[queue.length - 1]
    if (!previous) return
    setCurrent(previous)
    setProgress(0)
    setIsPlaying(true)
  }, [current, progress, queue])

  const togglePlay = useCallback(() => {
    if (!current) return
    setIsPlaying((value) => !value)
  }, [current])

  const seek = useCallback((seconds: number) => {
    setProgress(Math.max(0, seconds))
  }, [])

  const toggleLike = useCallback((trackId: string) => {
    setLikedIds((ids) =>
      ids.includes(trackId) ? ids.filter((id) => id !== trackId) : [...ids, trackId],
    )
  }, [])

  useEffect(() => {
    if (!isPlaying || !current || current.duration <= 0) return
    const timer = window.setInterval(() => {
      setProgress((value) => value + 0.25)
    }, 250)
    return () => window.clearInterval(timer)
  }, [isPlaying, current])

  useEffect(() => {
    if (current && current.duration > 0 && progress >= current.duration) next()
  }, [current, progress, next])

  const value = useMemo(
    () => ({
      current,
      queue,
      isPlaying,
      progress,
      volume,
      likedIds,
      playTrack,
      playPlaylist,
      togglePlay,
      next,
      prev,
      seek,
      setVolume,
      toggleLike,
    }),
    [
      current,
      queue,
      isPlaying,
      progress,
      volume,
      likedIds,
      playTrack,
      playPlaylist,
      togglePlay,
      next,
      prev,
      seek,
      toggleLike,
    ],
  )

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}

export function usePlayer(): PlayerContextValue {
  const context = useContext(PlayerContext)
  if (!context) {
    throw new Error('usePlayer phải nằm trong PlayerProvider')
  }
  return context
}
