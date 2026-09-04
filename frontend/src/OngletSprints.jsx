import { useState, useEffect } from 'react'
import { API_URL } from './config'

function OngletSprints({ token, projet, sprintsSelectionnes, onChangerSelection }) {
  const [sprints, setSprints] = useState([])
  const [taches, setTaches] = useState([])

  useEffect(() => {
    fetch(`${API_URL}/projects/${projet._id}/sprints`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setSprints(data) })

    fetch(`${API_URL}/backlogs/${projet.backlog}/tasks`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setTaches(data) })
  }, [projet, token])

  function toggleSprint(sprintId) {
    if (sprintsSelectionnes.includes(sprintId)) {
      onChangerSelection(sprintsSelectionnes.filter((id) => id !== sprintId))
    } else {
      onChangerSelection([...sprintsSelectionnes, sprintId])
    }
  }

  const statutStyle = {
    planifie: 'bg-paper text-ink-soft border-line',
    actif: 'bg-ink text-paper border-ink',
    termine: 'bg-paper text-ink-soft border-line line-through'
  }

  return (
    <div>
      <p className="text-sm text-ink-soft mb-4">
        Cochez un ou plusieurs sprints pour filtrer l'onglet Tâches. La création et la répartition des sprints se font depuis "Gérer le projet".
      </p>

      {sprintsSelectionnes.length > 0 && (
        <button
          onClick={() => onChangerSelection([])}
          className="text-sm text-ink-soft hover:text-ink underline underline-offset-2 mb-4"
        >
          Réinitialiser le filtre
        </button>
      )}

      <div className="space-y-2">
        {sprints.length === 0 && (
          <p className="text-sm text-ink-soft italic">Aucun sprint pour l'instant.</p>
        )}
        {sprints.map((sprint) => {
          const tachesDuSprint = taches.filter((t) => t.sprint?._id === sprint._id)
          const coche = sprintsSelectionnes.includes(sprint._id)

          return (
            <label
              key={sprint._id}
              className={`block bg-surface border rounded-lg p-4 cursor-pointer transition-colors ${coche ? 'border-ink' : 'border-line'}`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={coche}
                  onChange={() => toggleSprint(sprint._id)}
                  className="mt-1 accent-ink"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <h4 className="text-sm font-medium text-ink">{sprint.nom}</h4>
                    <span className={`text-xs border rounded-full px-2 py-0.5 ${statutStyle[sprint.statut]}`}>
                      {sprint.statut}
                    </span>
                  </div>
                  {sprint.objectif && <p className="text-xs text-ink-soft mb-1">{sprint.objectif}</p>}
                  <p className="text-xs text-ink-soft font-mono">
                    {new Date(sprint.dateDebut).toLocaleDateString()} → {new Date(sprint.dateFin).toLocaleDateString()}
                    {' · '}{tachesDuSprint.length} tâche{tachesDuSprint.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </label>
          )
        })}
      </div>
    </div>
  )
}

export default OngletSprints