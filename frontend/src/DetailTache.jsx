import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { API_URL } from './config'
import { formatEcheance } from './utils'
import ConfirmationModale from './ConfirmationModale'

function DetailTache({ token, tache, projet, sprints, estProprietaire, onFermer, onTacheModifiee, onTacheSupprimee }) {
  const [commentaires, setCommentaires] = useState([])
  const [contenu, setContenu] = useState('')
  const [confirmationOuverte, setConfirmationOuverte] = useState(false)

  const echeanceInfo = formatEcheance(tache.echeance)

  function chargerCommentaires() {
    fetch(`${API_URL}/tasks/${tache._id}/comments`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setCommentaires(data) })
  }

  useEffect(() => { chargerCommentaires() }, [tache])

  function handleSubmit(e) {
    e.preventDefault()
    if (!contenu.trim()) return

    fetch(`${API_URL}/tasks/${tache._id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ contenu })
    })
      .then((res) => res.json())
      .then(() => onFermer())
  }

  function confirmerSuppression() {
    fetch(`${API_URL}/tasks/${tache._id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(() => onTacheSupprimee())
  }

  function handleAssigner(e) {
    const utilisateurId = e.target.value

    if (!utilisateurId) {
      fetch(`${API_URL}/tasks/${tache._id}/assignation`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(() => onTacheModifiee())
      return
    }

    fetch(`${API_URL}/tasks/${tache._id}/assignation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ utilisateurId })
    }).then(() => onTacheModifiee())
  }

  const membresDisponibles = [projet.proprietaire, ...projet.membres]
  const dateCreation = tache.createdAt ? new Date(tache.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : null

  return createPortal(
    <div className="fixed inset-0 bg-ink/30 flex items-center justify-center p-4 z-50" onClick={onFermer}>
      <div className="bg-surface rounded-xl border border-line max-w-lg w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-line flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">{tache.titre}</h2>
            <p className="text-sm text-ink-soft mt-1">{tache.description}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {estProprietaire && (
              <button
                onClick={() => setConfirmationOuverte(true)}
                className="text-xs text-step-testing hover:underline underline-offset-2"
              >
                Supprimer
              </button>
            )}
            <button onClick={onFermer} className="text-ink-soft hover:text-ink text-xl leading-none">×</button>
          </div>
        </div>

        <div className="px-5 py-3 border-b border-line flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-ink-soft">
          <span>Priorité : <span className="font-mono text-ink">P{tache.priorite}</span></span>
          {tache.dureeEstimee && <span>Durée estimée : <span className="text-ink">{tache.dureeEstimee}h</span></span>}
          {dateCreation && <span>Créée le : <span className="text-ink">{dateCreation}</span></span>}
          <span>
            Sprint : <span className="text-ink">{tache.sprint?.nom || 'Backlog'}</span>
          </span>
        </div>

        {echeanceInfo && (
          <div className="px-5 py-2 border-b border-line">
            <span className={`text-xs font-mono ${echeanceInfo.enRetard ? 'text-step-testing font-medium' : 'text-ink-soft'}`}>
              {echeanceInfo.enRetard ? '⚠ En retard — échéance : ' : 'Échéance : '}{echeanceInfo.texte}
            </span>
          </div>
        )}

        <div className="px-5 py-3 border-b border-line">
          <label className="block text-xs font-medium text-ink-soft mb-1">Assigné à</label>
          <select
            defaultValue={tache.assigneA?._id || ''}
            onChange={handleAssigner}
            className="w-full rounded-lg border border-line px-3 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink focus:border-ink"
          >
            <option value="">Personne</option>
            {membresDisponibles.map((m) => (
              <option key={m._id} value={m._id}>{m.nom}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {commentaires.length === 0 && (
            <p className="text-sm text-ink-soft">Aucun commentaire pour l'instant.</p>
          )}
          {commentaires.map((c) => (
            <div key={c._id} className="bg-paper border border-line rounded-lg p-3">
              <p className="text-xs font-medium text-ink mb-1">{c.auteur?.nom}</p>
              <p className="text-sm text-ink-soft">{c.contenu}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-line flex gap-2">
          <input
            type="text"
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            placeholder="Ajouter un commentaire..."
            className="flex-1 rounded-lg border border-line px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink focus:border-ink"
          />
          <button type="submit" className="bg-ink text-paper rounded-lg px-4 py-2 text-sm font-medium hover:bg-ink/90 transition-colors">
            Envoyer
          </button>
        </form>
      </div>

      {confirmationOuverte && (
        <ConfirmationModale
          titre="Supprimer la tâche"
          message={`Êtes-vous sûr de vouloir supprimer "${tache.titre}" ? Cette action est irréversible.`}
          onConfirmer={confirmerSuppression}
          onAnnuler={() => setConfirmationOuverte(false)}
        />
      )}
    </div>,
    document.body
  )
}

export default DetailTache