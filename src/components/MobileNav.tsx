import type { View } from '../data'

type MobileNavProps = {
  view: View
  onNavigate: (view: View) => void
}

export function MobileNav({ view, onNavigate }: MobileNavProps) {
  return (
    <nav className="mobile-nav" aria-label="Điều hướng chính">
      <button
        type="button"
        className={view.name === 'game' ? 'is-active' : undefined}
        onClick={() =>
          onNavigate({ name: 'game', id: view.name === 'game' ? view.id : null })
        }
      >
        Chơi
      </button>
      <button
        type="button"
        className={view.name === 'home' ? 'is-active' : undefined}
        onClick={() => onNavigate({ name: 'home' })}
      >
        Trang chủ
      </button>
      <button
        type="button"
        className={view.name === 'search' ? 'is-active' : undefined}
        onClick={() => onNavigate({ name: 'search' })}
      >
        Tìm
      </button>
      <button
        type="button"
        className={view.name === 'library' ? 'is-active' : undefined}
        onClick={() => onNavigate({ name: 'library' })}
      >
        Thư viện
      </button>
    </nav>
  )
}
