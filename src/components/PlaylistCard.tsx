import { getPlaylist } from '../data'
import { usePlayer } from '../player'
import { Cover } from './Cover'
import type { MouseEvent } from 'react'

type PlaylistCardProps = {
  playlistId: string
  onOpen: (playlistId: string) => void
}

export function PlaylistCard({ playlistId, onOpen }: PlaylistCardProps) {
  const playlist = getPlaylist(playlistId)
  const { playPlaylist, current, isPlaying, togglePlay } = usePlayer()

  if (!playlist) return null

  const active = current ? playlist.trackIds.includes(current.id) : false

  function handlePlay(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    if (active) togglePlay()
    else playPlaylist(playlistId)
  }

  return (
    <article className="media-card" onClick={() => onOpen(playlistId)}>
      <div className="media-art">
        <Cover playlist={playlist} size="lg" />
        <button
          type="button"
          className={active && isPlaying ? 'card-play is-on' : 'card-play'}
          aria-label={active && isPlaying ? `Tạm dừng ${playlist.title}` : `Phát ${playlist.title}`}
          onClick={handlePlay}
        >
          {active && isPlaying ? '❚❚' : '▶'}
        </button>
      </div>
      <strong>{playlist.title}</strong>
      <p>{playlist.description}</p>
    </article>
  )
}
