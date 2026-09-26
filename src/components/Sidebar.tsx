import { useMemo, useState } from 'react'
import { formatSize, type View } from '../data'
import { useRomSession } from '../romSession'

type SidebarProps = {
  view: View
  collapsed: boolean
  onToggle: () => void
  onNavigate: (view: View) => void
  onSelectGame: (id: string) => void
}

const navItems: { name: 'home' | 'search' | 'library'; label: string }[] = [
  { name: 'home', label: 'Trang chủ' },
  { name: 'search', label: 'Tìm kiếm' },
  { name: 'library', label: 'Thư viện' },
]

export function Sidebar({ view, collapsed, onToggle, onNavigate, onSelectGame }: SidebarProps) {
  const { tracks } = useRomSession()
  const [filter, setFilter] = useState('')
  const selectedId = view.name === 'game' ? view.id : null
  const visible = useMemo(() => {
    const needle = filter.trim().toLowerCase()
    if (!needle) return tracks
    return tracks.filter((track) => {
      const hay = `${track.title} ${track.filename ?? ''}`.toLowerCase()
      return hay.includes(needle)
    })
  }, [filter, tracks])

  return (
    <aside className={collapsed ? 'sidebar is-collapsed' : 'sidebar'}>
      <div className="sidebar-card">
        <div className="brand-row">
          <button
            type="button"
            className="brand"
            onClick={() => onNavigate({ name: 'game', id: null })}
          >
            <span className="brand-mark" />
            <span className="brand-name">GBA Pocket</span>
          </button>
          <button
            type="button"
            className="sidebar-toggle"
            aria-label={collapsed ? 'Mở panel trái' : 'Thu nhỏ panel trái'}
            aria-expanded={!collapsed}
            onClick={onToggle}
          >
            ‹
          </button>
        </div>
        <nav className="side-nav">
          {navItems.map((item) => (
            <button
              key={item.name}
              type="button"
              className={view.name === item.name ? 'side-link is-active' : 'side-link'}
              onClick={() => onNavigate({ name: item.name })}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="sidebar-card sidebar-library">
        <p className="side-label">Playlist ROM</p>
        <label className="rom-filter">
          <span className="sr-only">Lọc game</span>
          <input
            type="search"
            value={filter}
            placeholder={`Lọc ${tracks.length} game...`}
            onChange={(event) => setFilter(event.target.value)}
          />
        </label>
        <ul className="side-playlists">
          {visible.map((track) => (
            <li key={track.id}>
              <button
                type="button"
                className={selectedId === track.id ? 'side-playlist is-active' : 'side-playlist'}
                onClick={() => onSelectGame(track.id)}
              >
                <span>
                  <strong>{track.title}</strong>
                  <em>{formatSize(track.size ?? 0)}</em>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
