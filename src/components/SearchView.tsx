import { useState } from 'react'
import { playlists, searchChips, tracks } from '../data'
import { PlaylistCard } from './PlaylistCard'
import { TrackRow } from './TrackRow'

type SearchViewProps = {
  onOpenPlaylist: (playlistId: string) => void
}

export function SearchView({ onOpenPlaylist }: SearchViewProps) {
  const [query, setQuery] = useState('')
  const needle = query.trim().toLowerCase()
  const foundPlaylists = playlists.filter((item) => {
    const hay = `${item.title} ${item.description} ${item.owner}`.toLowerCase()
    return hay.includes(needle)
  })
  const foundTracks = tracks.filter((item) => {
    const hay = `${item.title} ${item.artist} ${item.album}`.toLowerCase()
    return hay.includes(needle)
  })

  return (
    <div className="view">
      <h1>Tìm kiếm</h1>
      <label className="view-search">
        <span className="sr-only">Tìm kiếm</span>
        <input
          type="search"
          value={query}
          placeholder="Tìm playlist hoặc game"
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      {needle.length === 0 ? (
        <section className="shelf">
          <h2>Duyệt theo mood</h2>
          <div className="chip-grid">
            {searchChips.map((chip) => (
              <button
                key={chip}
                type="button"
                className="mood-chip"
                onClick={() => setQuery(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
        </section>
      ) : foundPlaylists.length === 0 && foundTracks.length === 0 ? (
        <p className="empty">Không thấy kết quả cho “{query.trim()}”.</p>
      ) : (
        <>
          {foundPlaylists.length > 0 && (
            <section className="shelf">
              <h2>Playlist</h2>
              <div className="shelf-row">
                {foundPlaylists.map((item) => (
                  <PlaylistCard
                    key={item.id}
                    playlistId={item.id}
                    onOpen={onOpenPlaylist}
                  />
                ))}
              </div>
            </section>
          )}
          {foundTracks.length > 0 && (
            <section className="shelf">
              <h2>Bài hát</h2>
              <div className="track-list">
                {foundTracks.map((track, index) => (
                  <TrackRow
                    key={track.id}
                    track={track}
                    index={index}
                    queue={foundTracks}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
