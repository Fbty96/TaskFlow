import { useState } from 'react'
import Logo from './Logo'
import { API_URL } from './config'

function Login({ onLoginSuccess, onBasculerVersRegister }) {
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [erreur, setErreur] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setErreur('')

    fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, motDePasse })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.token) {
          onLoginSuccess(data.token, data.user)
        } else {
          setErreur(data.message || "Erreur de connexion")
        }
      })
  }

  const etapes = [
    { nom: 'To Do', couleur: '#8A8F98' },
    { nom: 'In Progress', couleur: '#2F6FED' },
    { nom: 'Review', couleur: '#E8A33D' },
    { nom: 'To Test', couleur: '#8B5CF6' },
    { nom: 'Testing', couleur: '#DB4C79' },
    { nom: 'Done', couleur: '#3F9142' }
  ]

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center bg-paper px-4">
        <div className="w-full max-w-sm">
          <div className="flex justify-center lg:justify-start mb-8">
            <Logo />
          </div>

          <h1 className="font-display text-2xl font-semibold text-ink mb-1">Connexion</h1>
          <p className="text-sm text-ink-soft mb-6">Reprenez le fil de vos projets</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink transition-shadow focus:outline-none focus:ring-2 focus:ring-ink focus:border-ink"
                placeholder="vous@exemple.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Mot de passe</label>
              <input
                type="password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink transition-shadow focus:outline-none focus:ring-2 focus:ring-ink focus:border-ink"
                placeholder="••••••••"
              />
            </div>

            {erreur && <p className="text-sm text-step-testing">{erreur}</p>}

            <button
              type="submit"
              className="w-full bg-ink text-paper rounded-lg py-2.5 text-sm font-medium transition-all hover:bg-ink/90 active:scale-[0.98]"
            >
              Se connecter
            </button>
          </form>

          <p className="text-sm text-ink-soft text-center lg:text-left mt-6">
            Pas encore de compte ?{' '}
            <button
              type="button"
              onClick={onBasculerVersRegister}
              className="text-ink font-medium underline underline-offset-2 hover:no-underline"
            >
              S'inscrire
            </button>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-ink relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-90" style={{
          background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.06), transparent 40%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.04), transparent 45%)'
        }} />

        <div className="relative z-10 max-w-sm px-8">
          <div className="flex gap-2 mb-8">
            {etapes.map((etape, i) => (
              <div
                key={i}
                className="h-16 rounded-full transition-transform hover:scale-y-110"
                style={{ backgroundColor: etape.couleur, width: '10px' }}
              />
            ))}
          </div>

          <h2 className="font-display text-3xl font-semibold text-paper leading-tight mb-3">
            Chaque tâche a sa place.
          </h2>
          <p className="text-sm text-paper/60 leading-relaxed">
            Suivez la progression de vos projets à travers un workflow que vous personnalisez entièrement — de la première idée jusqu'au travail terminé.
          </p>

          <div className="mt-10 space-y-2">
            {etapes.map((etape, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: etape.couleur }} />
                <span className="text-xs font-mono text-paper/50">{etape.nom}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login