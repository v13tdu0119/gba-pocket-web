import { formatSize, getPlaylist, getPlaylistTracks } from '../data'
import { usePlayer } from '../player'
import { Cover } from './Cover'
import { TrackRow } from './TrackRow'

type PlaylistViewProps = {
  playlistId: string
}

export function PlaylistView({ playlistId }: PlaylistViewProps) {
  const playlist = getPlaylist(playlistId)
  const { playPlaylist, current, isPlaying, togglePlay } = usePlayer()

  if (!playlist) {
    return (
      <div className="view">
        <p className="empty">Không tìm thấy playlist này.</p>
      </div>
    )
  }

  const list = getPlaylistTracks(playlist)
  const totalBytes = list.reduce((sum, track) => sum + (track.size ?? 0), 0)
  const active = current ? playlist.trackIds.includes(current.id) : false

  return (
    <div className="view playlist-view">
      <header
        className="playlist-hero"
        style={{
          background: `linear-gradient(180deg, ${playlist.color} 0%, transparent 100%)`,
        }}
      >
        <Cover playlist={playlist} size="xl" />
        <div>
          <p className="eyebrow">{playlist.kind === 'album' ? 'Album' : 'Playlist'}</p>
          <h1>{playlist.title}</h1>
          <p className="lede">{playlist.description}</p>
          <p className="meta">
            {playlist.owner} · {list.length} game · {formatSize(totalBytes)}
          </p>
          <button
            type="button"
            className="play-btn large"
            onClick={() => {
              if (active) togglePlay()
              else playPlaylist(playlist.id)
            }}
          >
            {active && isPlaying ? 'Tạm dừng' : 'Phát'}
          </button>
        </div>
      </header>

      <div className="track-list has-head">
        <div className="track-head">
          <span>#</span>
          <span>Tiêu đề</span>
          <span className="track-album">Album</span>
          <span>Dung lượng</span>
        </div>
        {list.map((track, index) => (
          <TrackRow key={track.id} track={track} index={index} queue={list} />
        ))}
      </div>
    </div>
  )
}
