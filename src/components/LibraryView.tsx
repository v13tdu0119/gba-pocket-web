import { playlists, tracks } from '../data'
import { usePlayer } from '../player'
import { PlaylistCard } from './PlaylistCard'
import { TrackRow } from './TrackRow'

type LibraryViewProps = {
  onOpenPlaylist: (playlistId: string) => void
}

export function LibraryView({ onOpenPlaylist }: LibraryViewProps) {
  const { likedIds } = usePlayer()
  const likedTracks = tracks.filter((track) => likedIds.includes(track.id))

  return (
    <div className="view">
      <h1>Thư viện</h1>
      <section className="shelf">
        <h2>Bài đã thích</h2>
        {likedTracks.length > 0 ? (
          <div className="track-list">
            {likedTracks.map((track, index) => (
              <TrackRow
                key={track.id}
                track={track}
                index={index}
                queue={likedTracks}
              />
            ))}
          </div>
        ) : (
          <p className="empty">Chưa thích bài nào. Nhấn ♥ trên player hoặc danh sách.</p>
        )}
      </section>
      <section className="shelf">
        <h2>Album & playlist</h2>
        <div className="shelf-row">
          {playlists.map((item) => (
            <PlaylistCard key={item.id} playlistId={item.id} onOpen={onOpenPlaylist} />
          ))}
        </div>
      </section>
    </div>
  )
}
