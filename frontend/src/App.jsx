import { useState, useEffect } from 'react'
import Login from './Login'
import Register from './Register'
import ListeProjets from './ListeProjets'
import VueProjet from './VueProjet'
import MesTaches from './MesTaches'
import Notifications from './Notifications'
import CalendrierVue from './CalendrierVue'
import EcranAdmin from './EcranAdmin'
import Logo from './Logo'
import { API_URL } from './config'

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(() => {
    const userSauvegarde = localStorage.getItem('user')
    return userSauvegarde ? JSON.parse(userSauvegarde) : null
  })
  const [projetSelectionne, setProjetSelectionne] = useState(null)
  const [afficherRegister, setAfficherRegister] = useState(false)
  const [vue, setVue] = useState('projets')
  const [tachesCalendrier, setTachesCalendrier] = useState([])
  const [nombreNotifsNonLues, setNombreNotifsNonLues] = useState(0)
  const [nombreEnRetard, setNombreEnRetard] = useState(0)
  const [modeAdmin, setModeAdmin] = useState(false)

  function chargerCompteurNotifications() {
    fetch(`${API_URL}/notifications`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setNombreNotifsNonLues(data.filter((n) => !n.lu).length) })
  }

  function chargerCompteurEnRetard() {
    fetch(`${API_URL}/mes-taches`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const maintenant = new Date()
          setNombreEnRetard(data.filter((t) => t.echeance && new Date(t.echeance) < maintenant).length)
        }
      })
  }

  useEffect(() => {
    if (token) {
      chargerCompteurNotifications()
      chargerCompteurEnRetard()
    }
  }, [token])

  useEffect(() => {
    if (!token) return

    const verifier = setInterval(() => {
      fetch(`${API_URL}/notifications`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then((res) => {
          if (res.status === 401) {
            handleDeconnexion()
          }
        })
    }, 60000)

    return () => clearInterval(verifier)
  }, [token])

  function handleLoginSuccess(nouveauToken, nouvelUser) {
    localStorage.setItem('token', nouveauToken)
    localStorage.setItem('user', JSON.stringify(nouvelUser))
    setToken(nouveauToken)
    setUser(nouvelUser)
  }

  function handleRegisterSuccess() {
    setAfficherRegister(false)
  }

  function handleDeconnexion() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    setProjetSelectionne(null)
  }

  function rafraichirProjet() {
    fetch(`${API_URL}/projects/${projetSelectionne._id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setProjetSelectionne(data))
  }

  function chargerTachesCalendrier() {
    fetch(`${API_URL}/mes-taches`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTachesCalendrier(data)
        }
      })
  }

  function allerVers(nouvelleVue) {
    setVue(nouvelleVue)
    setProjetSelectionne(null)
    setModeAdmin(false)

    if (nouvelleVue === 'calendrier') {
      chargerTachesCalendrier()
    }
  }

  function ouvrirProjet(projet) {
    setProjetSelectionne(projet)
    setModeAdmin(false)
  }

  if (!token) {
    if (afficherRegister) {
      return <Register onRegisterSuccess={handleRegisterSuccess} onBasculerVersLogin={() => setAfficherRegister(false)} />
    }
    return <Login onLoginSuccess={handleLoginSuccess} onBasculerVersRegister={() => setAfficherRegister(true)} />
  }

  return (
    <div className="min-h-screen bg-paper flex">
      <aside className="w-56 shrink-0 border-r border-line bg-surface min-h-screen hidden sm:flex flex-col">
        <div className="p-5 border-b border-line">
          <Logo />
        </div>

        <nav className="p-3 flex flex-col gap-1">
          <button
            onClick={() => allerVers('mes-taches')}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${vue === 'mes-taches' && !projetSelectionne ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-paper hover:text-ink'}`}
          >
            <span>Mes tâches</span>
            {nombreEnRetard > 0 && (
              <span className={`text-[11px] font-mono rounded-full px-1.5 py-0.5 ${vue === 'mes-taches' && !projetSelectionne ? 'bg-paper text-step-testing' : 'bg-step-testing/15 text-step-testing'}`}>
                {nombreEnRetard}
              </span>
            )}
          </button>

          <button
            onClick={() => allerVers('calendrier')}
            className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${vue === 'calendrier' && !projetSelectionne ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-paper hover:text-ink'}`}
          >
            Calendrier
          </button>

          <button
            onClick={() => allerVers('notifications')}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${vue === 'notifications' && !projetSelectionne ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-paper hover:text-ink'}`}
          >
            <span>Notifications</span>
            {nombreNotifsNonLues > 0 && (
              <span className={`text-[11px] font-mono rounded-full px-1.5 py-0.5 ${vue === 'notifications' && !projetSelectionne ? 'bg-paper text-ink' : 'bg-ink text-paper'}`}>
                {nombreNotifsNonLues}
              </span>
            )}
          </button>

          <div className="h-px bg-line my-2" />

          <button
            onClick={() => allerVers('projets')}
            className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${vue === 'projets' && !projetSelectionne ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-paper hover:text-ink'}`}
          >
            Mes projets
          </button>
        </nav>

        <div className="mt-auto p-4 border-t border-line flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-ink text-paper text-xs font-medium flex items-center justify-center shrink-0">
            {user.nom.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink truncate">{user.nom}</p>
            <button
              onClick={handleDeconnexion}
              className="text-xs text-ink-soft hover:text-ink underline underline-offset-2 transition-colors"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="border-b border-line bg-surface sm:hidden">
          <div className="px-4 py-3 flex items-center justify-between">
            <Logo />
            <button onClick={handleDeconnexion} className="text-xs text-ink-soft underline underline-offset-2">
              Déconnexion
            </button>
          </div>
        </header>

        <main className="px-4 sm:px-8 py-8">
          {projetSelectionne && modeAdmin ? (
            <EcranAdmin
              token={token}
              projet={projetSelectionne}
              onRetour={() => setModeAdmin(false)}
            />
          ) : projetSelectionne ? (
            <>
              <button
                onClick={() => setProjetSelectionne(null)}
                className="text-sm text-ink-soft hover:text-ink mb-6 transition-colors"
              >
                ← Retour aux projets
              </button>
              <VueProjet
                token={token}
                projet={projetSelectionne}
                user={user}
                onProjetMisAJour={rafraichirProjet}
                onOuvrirAdmin={() => setModeAdmin(true)}
              />
            </>
          ) : vue === 'mes-taches' ? (
            <MesTaches token={token} user={user} onSelectionnerProjet={ouvrirProjet} />
          ) : vue === 'calendrier' ? (
            <CalendrierVue
              taches={tachesCalendrier}
              onOuvrir={(tache) => console.log(tache)}
            />
          ) : vue === 'notifications' ? (
            <Notifications token={token} onChangement={chargerCompteurNotifications} />
          ) : (
            <ListeProjets token={token} user={user} onSelectionnerProjet={ouvrirProjet} />
          )}
        </main>
      </div>
    </div>
  )
}

export default App