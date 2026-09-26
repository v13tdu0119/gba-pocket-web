import { greeting, homeShelves } from '../data'
import { PlaylistCard } from './PlaylistCard'

type HomeViewProps = {
  onOpenPlaylist: (playlistId: string) => void
}

export function HomeView({ onOpenPlaylist }: HomeViewProps) {
  return (
    <div className="view">
      <h1>{greeting()}</h1>
      {homeShelves.map((shelf) => (
        <section key={shelf.id} className="shelf">
          <h2>{shelf.title}</h2>
          <div className="shelf-row">
            {shelf.playlistIds.map((id) => (
              <PlaylistCard key={id} playlistId={id} onOpen={onOpenPlaylist} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
