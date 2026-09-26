import { roms } from './romCatalog'

export type View =
  | { name: 'home' }
  | { name: 'search' }
  | { name: 'library' }
  | { name: 'playlist'; id: string }
  | { name: 'game'; id: string | null }

export type Track = {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  playlistId: string
  filename?: string
  size?: number
}

export type Playlist = {
  id: string
  title: string
  description: string
  owner: string
  kind: 'album' | 'playlist'
  color: string
  color2: string
  trackIds: string[]
}

const collections = [
  { id: 'pokemon', title: 'Pokémon', color: '#3d8b5a', color2: '#102418', match: /pok[eé]mon/i },
  { id: 'mario', title: 'Mario', color: '#c4453a', color2: '#2a1010', match: /mario/i },
  { id: 'zelda', title: 'The Legend of Zelda', color: '#2a6f9a', color2: '#0b1c2a', match: /zelda/i },
  { id: 'sonic', title: 'Sonic', color: '#3b6cff', color2: '#0d1833', match: /sonic/i },
  { id: 'castlevania', title: 'Castlevania', color: '#6b2d7a', color2: '#1c0c22', match: /castlevania/i },
  { id: 'megaman', title: 'Mega Man', color: '#3d7ec7', color2: '#102033', match: /mega\s?man|rockman/i },
  { id: 'finalfantasy', title: 'Final Fantasy', color: '#1ed760', color2: '#12381f', match: /final fantasy/i },
  { id: 'kirby', title: 'Kirby', color: '#e07a8a', color2: '#2a1218', match: /kirby/i },
]

export const tracks: Track[] = roms.map((rom) => ({
  id: rom.id,
  title: rom.title,
  artist: 'Game Boy Advance',
  album: 'downloaded_roms',
  duration: 0,
  playlistId: 'roms',
  filename: rom.filename,
  size: rom.size,
}))

const collectionPlaylists: Playlist[] = collections
  .map((collection) => {
    const trackIds = tracks
      .filter((track) => collection.match.test(track.title))
      .map((track) => track.id)
    return {
      id: collection.id,
      title: collection.title,
      description: `${trackIds.length} game trong thư viện.`,
      owner: 'downloaded_roms',
      kind: 'playlist' as const,
      color: collection.color,
      color2: collection.color2,
      trackIds,
    }
  })
  .filter((playlist) => playlist.trackIds.length > 0)

export const playlists: Playlist[] = [
  {
    id: 'roms',
    title: 'downloaded_roms',
    description: `${tracks.length} ROM GBA trong máy.`,
    owner: 'GBA Pocket',
    kind: 'playlist',
    color: '#1ed760',
    color2: '#12381f',
    trackIds: tracks.map((track) => track.id),
  },
  ...collectionPlaylists,
]

export const homeShelves = [
  { id: 'library', title: 'Thư viện máy', playlistIds: ['roms', ...collectionPlaylists.slice(0, 5).map((item) => item.id)] },
  { id: 'series', title: 'Theo series', playlistIds: collectionPlaylists.map((item) => item.id) },
]

export const searchChips = collectionPlaylists.map((item) => item.title)

export function getPlaylist(id: string): Playlist | undefined {
  return playlists.find((item) => item.id === id)
}

export function getTrack(id: string): Track | undefined {
  return tracks.find((item) => item.id === id)
}

export function getPlaylistTracks(playlist: Playlist): Track[] {
  return playlist.trackIds
    .map((id) => getTrack(id))
    .filter((track): track is Track => track !== undefined)
}

export function formatTime(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(safe / 60)
  const rest = safe % 60
  return `${minutes}:${rest.toString().padStart(2, '0')}`
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(0)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

export function formatTrackMeta(track: Track): string {
  if (track.size && track.size > 0) return formatSize(track.size)
  if (track.duration > 0) return formatTime(track.duration)
  return '—'
}

export function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Chào buổi sáng'
  if (hour < 18) return 'Chào buổi chiều'
  return 'Chào buổi tối'
}
