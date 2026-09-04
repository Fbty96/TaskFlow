import { useState } from 'react'
import { API_URL } from './config'

function CreerProjet({ token, onProjetCree }) {
  const [titre, setTitre] = useState('')
  const [description, setDescription] = useState('')
  const [erreur, setErreur] = useState('')
  const [ouvert, setOuvert] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setErreur('')

    fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ titre, description })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.project) {
          setTitre(''); setDescription(''); setOuvert(false)
          onProjetCree()
        } else {
          setErreur(data.message || "Erreur lors de la création")
        }
      })
  }

  if (!ouvert) {
    return (
      <button
        onClick={() => setOuvert(true)}
        className="border border-dashed border-line rounded-xl px-4 py-3 text-sm font-medium text-ink-soft hover:text-ink hover:border-ink transition-colors"
      >
        + Nouveau projet
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-line rounded-xl p-5 space-y-3">
      <input type="text" placeholder="Titre du projet" value={titre} onChange={(e) => setTitre(e.target.value)}
        className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink focus:border-ink" autoFocus />
      <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)}
        className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink focus:border-ink" />
      {erreur && <p className="text-sm text-step-testing">{erreur}</p>}
      <div className="flex gap-2">
        <button type="submit" className="bg-ink text-paper rounded-lg px-4 py-2 text-sm font-medium hover:bg-ink/90 transition-colors">Créer</button>
        <button type="button" onClick={() => setOuvert(false)} className="text-sm text-ink-soft hover:text-ink px-2 transition-colors">Annuler</button>
      </div>
    </form>
  )
}

export default CreerProjet