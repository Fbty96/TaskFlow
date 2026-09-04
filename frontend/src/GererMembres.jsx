import { useState } from 'react'
import { API_URL } from './config'

function GererMembres({ token, projetId, membres, onMembreAjoute }) {
  const [email, setEmail] = useState('')
  const [erreur, setErreur] = useState('')

  function handleAjouter(e) {
    e.preventDefault()
    setErreur('')

    fetch(`${API_URL}/users/recherche?email=${encodeURIComponent(email)}`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then((res) => res.json())
      .then((utilisateur) => {
        if (!utilisateur._id) { setErreur(utilisateur.message || "Utilisateur introuvable"); return }
        return fetch(`${API_URL}/projects/${projetId}/membres`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ membreId: utilisateur._id })
        })
      })
      .then((res) => res?.json())
      .then((data) => { if (data) { setEmail(''); onMembreAjoute() } })
  }
  function retirerMembre(membreId) {
  fetch(`${API_URL}/projects/${projetId}/membres/${membreId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(() => onMembreAjoute())
 }

  return (
    <div className="bg-surface border border-line rounded-xl p-3 sm:w-72 shrink-0">
      <h3 className="text-sm font-medium text-ink mb-2">Membres</h3>

      {membres.length > 0 && (
        <ul className="flex flex-wrap gap-1.5 mb-3">
          {membres.map((membre) => (
            <li key={membre._id} className="text-xs bg-paper border border-line rounded-full px-2.5 py-1 text-ink-soft">{membre.nom}
            <button onClick={() => retirerMembre(membre._id)} className="hover:text-step-testing"> × </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAjouter} className="flex gap-2">
        <input type="email" placeholder="Email à inviter" value={email} onChange={(e) => setEmail(e.target.value)}
          className="flex-1 min-w-0 rounded-lg border border-line px-3 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink focus:border-ink" />
        <button type="submit" className="bg-ink text-paper rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-ink/90 transition-colors">+</button>
      </form>
      {erreur && <p className="text-xs text-step-testing mt-1.5">{erreur}</p>}
    </div>
  )
}

export default GererMembres