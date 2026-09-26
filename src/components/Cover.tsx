import type { Playlist } from '../data'

type CoverProps = {
  playlist: Playlist
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Cover({ playlist, size = 'md' }: CoverProps) {
  return (
    <div
      className={`cover cover-${size}`}
      style={{
        background: `linear-gradient(145deg, ${playlist.color}, ${playlist.color2})`,
      }}
      aria-hidden="true"
    >
      <span>{playlist.title.slice(0, 1)}</span>
    </div>
  )
}
