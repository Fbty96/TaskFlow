import { useState } from 'react'
import { API_URL } from './config'

function CreerTache({ token, backlogId, onTacheCreee }) {
  const [titre, setTitre] = useState('')
  const [description, setDescription] = useState('')
  const [priorite, setPriorite] = useState(1)
  const [echeance, setEcheance] = useState('')
  const [erreur, setErreur] = useState('')
  const [ouvert, setOuvert] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setErreur('')

    fetch(`${API_URL}/backlogs/${backlogId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        titre,
        description,
        priorite: Number(priorite),
        echeance: echeance || null
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data._id) {
          setTitre(''); setDescription(''); setPriorite(1); setEcheance(''); setOuvert(false)
          onTacheCreee(data)
        } else {
          setErreur(data.message || "Erreur lors de la création")
        }
      })
  }

  if (!ouvert) {
    return (
      <button onClick={() => setOuvert(true)}
        className="border border-dashed border-line rounded-xl px-4 py-3 text-sm font-medium text-ink-soft hover:text-ink hover:border-ink transition-colors">
        + Nouvelle tâche
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-line rounded-xl p-4 flex flex-col sm:flex-row gap-2 flex-1">
      <input type="text" placeholder="Titre" value={titre} onChange={(e) => setTitre(e.target.value)}
        className="flex-1 rounded-lg border border-line px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink focus:border-ink" autoFocus />
      <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)}
        className="flex-1 rounded-lg border border-line px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink focus:border-ink" />
      <input type="date" value={echeance} onChange={(e) => setEcheance(e.target.value)}
        className="rounded-lg border border-line px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink focus:border-ink" />
      <select value={priorite} onChange={(e) => setPriorite(e.target.value)}
        className="rounded-lg border border-line px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink focus:border-ink">
        <option value={1}>P1</option><option value={2}>P2</option><option value={3}>P3</option>
      </select>
      <button type="submit" className="bg-ink text-paper rounded-lg px-4 py-2 text-sm font-medium hover:bg-ink/90 transition-colors whitespace-nowrap">Ajouter</button>
      {erreur && <p className="text-sm text-step-testing sm:ml-2 self-center">{erreur}</p>}
    </form>
  )
}

export default CreerTache