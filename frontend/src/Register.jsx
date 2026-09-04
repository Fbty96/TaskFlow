import { useState } from 'react'
import { API_URL } from './config'
import Logo from './Logo'

function Register({ onRegisterSuccess, onBasculerVersLogin }) {
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [erreur, setErreur] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setErreur('')

    fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom, email, motDePasse })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.id) {
          onRegisterSuccess()
        } else {
          setErreur(data.message || "Erreur lors de l'inscription")
        }
      })
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <div className="bg-surface border border-line rounded-xl p-8">
          <h1 className="font-display text-2xl font-semibold text-ink mb-1">Créer un compte</h1>
          <p className="text-sm text-ink-soft mb-6">Commencez à organiser vos projets</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Nom</label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink focus:border-ink"
                placeholder="Votre nom"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink focus:border-ink"
                placeholder="vous@exemple.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Mot de passe</label>
              <input
                type="password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink focus:border-ink"
                placeholder="••••••••"
              />
            </div>

            {erreur && <p className="text-sm text-step-testing">{erreur}</p>}

            <button
              type="submit"
              className="w-full bg-ink text-paper rounded-lg py-2.5 text-sm font-medium hover:bg-ink/90 transition-colors"
            >
              S'inscrire
            </button>
          </form>

          <p className="text-sm text-ink-soft text-center mt-6">
            Déjà un compte ?{' '}
            <button
              type="button"
              onClick={onBasculerVersLogin}
              className="text-ink font-medium underline underline-offset-2 hover:no-underline"
            >
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register