import { useState } from 'react'
import { ConfirmSwitch } from './components/ConfirmSwitch'
import { GameStage } from './components/GameStage'
import { HomeView } from './components/HomeView'
import { LibraryView } from './components/LibraryView'
import { MobileNav } from './components/MobileNav'
import { PlaylistView } from './components/PlaylistView'
import { SearchView } from './components/SearchView'
import { Sidebar } from './components/Sidebar'
import { type View } from './data'
import { PlayerProvider } from './player'
import { RomSessionProvider, useRomSession } from './romSession'

type NavState = {
  stack: View[]
  index: number
}

export default function App() {
  return (
    <RomSessionProvider>
      <PlayerProvider>
        <Shell />
      </PlayerProvider>
    </RomSessionProvider>
  )
}

function Shell() {
  const [nav, setNav] = useState<NavState>({
    stack: [{ name: 'game', id: null }],
    index: 0,
  })
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [pendingGameId, setPendingGameId] = useState<string | null>(null)
  const { getTrack } = useRomSession()
  const view = nav.stack[nav.index] ?? { name: 'home' }
  const currentGameId = view.name === 'game' ? view.id : null
  const pendingTrack = pendingGameId ? getTrack(pendingGameId) : undefined
  const currentTrack = currentGameId ? getTrack(currentGameId) : undefined

  function navigate(next: View) {
    setNav((current) => {
      const stack = [...current.stack.slice(0, current.index + 1), next]
      return { stack, index: stack.length - 1 }
    })
  }

  function openPlaylist(id: string) {
    navigate({ name: 'playlist', id })
  }

  function openGame(id: string) {
    if (currentGameId && currentGameId !== id) {
      setPendingGameId(id)
      return
    }
    navigate({ name: 'game', id })
  }

  return (
    <div className={sidebarOpen ? 'app' : 'app is-collapsed'}>
      <Sidebar
        view={view}
        collapsed={!sidebarOpen}
        onToggle={() => setSidebarOpen((open) => !open)}
        onNavigate={navigate}
        onSelectGame={openGame}
      />

      <div className="main">
        <div className="content">
          {view.name === 'home' && <HomeView onOpenPlaylist={openPlaylist} />}
          {view.name === 'search' && (
            <SearchView onOpenPlaylist={openPlaylist} />
          )}
          {view.name === 'library' && <LibraryView onOpenPlaylist={openPlaylist} />}
          {view.name === 'playlist' && <PlaylistView playlistId={view.id} />}
          {view.name === 'game' && (
            <GameStage gameId={view.id} onSelectGame={openGame} />
          )}
        </div>
      </div>

      <MobileNav view={view} onNavigate={navigate} />

      {pendingTrack && currentTrack && (
        <ConfirmSwitch
          currentTitle={currentTrack.title}
          nextTitle={pendingTrack.title}
          onCancel={() => setPendingGameId(null)}
          onConfirm={() => {
            navigate({ name: 'game', id: pendingTrack.id })
            setPendingGameId(null)
          }}
        />
      )}
    </div>
  )
}
