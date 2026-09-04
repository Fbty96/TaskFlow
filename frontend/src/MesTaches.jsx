import { useState, useEffect } from 'react'
import { API_URL } from './config'

function MesTaches({ token }) {
  const [taches, setTaches] = useState([])

  useEffect(() => {
    fetch(`${API_URL}/mes-taches`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setTaches(data) })
  }, [token])

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">Mes tâches</h1>

      {taches.length === 0 && (
        <p className="text-sm text-ink-soft">Aucune tâche pour l'instant.</p>
      )}

      <div className="space-y-2">
        {taches.map((tache) => (
          <div key={tache._id} className="bg-surface border border-line rounded-lg p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-ink">{tache.titre}</p>
              <p className="text-xs text-ink-soft mt-0.5">{tache.backlog?.projet?.titre}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span
                className="text-xs font-mono px-2 py-1 rounded"
                style={{ backgroundColor: `${tache.statutActuel.couleur}20`, color: tache.statutActuel.couleur }}
              >
                {tache.statutActuel.nom}
              </span>
              <span className="font-mono text-[11px] text-ink-soft border border-line rounded px-1.5 py-0.5">P{tache.priorite}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MesTaches