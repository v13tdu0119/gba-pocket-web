import { formatTrackMeta, type Track } from '../data'
import { usePlayer } from '../player'

type TrackRowProps = {
  track: Track
  index: number
  queue: Track[]
}

export function TrackRow({ track, index, queue }: TrackRowProps) {
  const { current, isPlaying, playTrack, likedIds, toggleLike } = usePlayer()
  const active = current?.id === track.id
  const liked = likedIds.includes(track.id)

  return (
    <div className={active ? 'track-row is-active' : 'track-row'}>
      <button
        type="button"
        className="track-main"
        onClick={() => playTrack(track, queue)}
      >
        <span className="track-index">
          {active && isPlaying ? '♪' : index + 1}
        </span>
        <span className="track-copy">
          <strong>{track.title}</strong>
          <em>{track.artist}</em>
        </span>
        <span className="track-album">{track.filename ?? track.album}</span>
        <span className="track-time">{formatTrackMeta(track)}</span>
      </button>
      <button
        type="button"
        className={liked ? 'icon-btn is-liked' : 'icon-btn'}
        aria-label={liked ? `Bỏ thích ${track.title}` : `Thích ${track.title}`}
        onClick={() => toggleLike(track.id)}
      >
        ♥
      </button>
    </div>
  )
}
