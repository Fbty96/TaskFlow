import { useState } from 'react'
import { formatEcheance } from './utils'

function VueListe({ taches, onOuvrir }) {
  const [tri, setTri] = useState({ colonne: null, ordre: 'asc' })

  function basculerTri(colonne) {
    if (tri.colonne === colonne) {
      setTri({ colonne, ordre: tri.ordre === 'asc' ? 'desc' : 'asc' })
    } else {
      setTri({ colonne, ordre: 'asc' })
    }
  }

  const tachesTriees = [...taches].sort((a, b) => {
    if (!tri.colonne) return 0

    let valeurA, valeurB
    if (tri.colonne === 'priorite') {
      valeurA = a.priorite
      valeurB = b.priorite
    } else if (tri.colonne === 'statut') {
      valeurA = a.statutActuel.ordre
      valeurB = b.statutActuel.ordre
    } else if (tri.colonne === 'assigne') {
      valeurA = a.assigneA?.nom || ''
      valeurB = b.assigneA?.nom || ''
    }

    if (valeurA < valeurB) return tri.ordre === 'asc' ? -1 : 1
    if (valeurA > valeurB) return tri.ordre === 'asc' ? 1 : -1
    return 0
  })

  function fleche(colonne) {
    if (tri.colonne !== colonne) return ''
    return tri.ordre === 'asc' ? ' ↑' : ' ↓'
  }

  return (
    <div className="bg-surface border border-line rounded-xl overflow-hidden">
      <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-2 border-b border-line bg-paper text-xs font-medium text-ink-soft">
        <span>Titre</span>
        <button onClick={() => basculerTri('statut')} className="hover:text-ink text-left">Statut{fleche('statut')}</button>
        <button onClick={() => basculerTri('assigne')} className="hover:text-ink text-left">Assigné à{fleche('assigne')}</button>
        <button onClick={() => basculerTri('priorite')} className="hover:text-ink text-left">Priorité{fleche('priorite')}</button>
        <span>Échéance</span>
      </div>

      {tachesTriees.length === 0 && (
        <p className="text-sm text-ink-soft p-4">Aucune tâche ne correspond.</p>
      )}

      {tachesTriees.map((tache) => {
        const echeanceInfo = formatEcheance(tache.echeance)

        return (
          <div
            key={tache._id}
            onClick={() => onOuvrir(tache)}
            className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-3 border-b border-line last:border-b-0 items-center cursor-pointer hover:bg-paper transition-colors"
          >
            <div>
              <p className="text-sm font-medium text-ink">{tache.titre}</p>
              {tache.description && <p className="text-xs text-ink-soft mt-0.5 line-clamp-1">{tache.description}</p>}
            </div>
            <span
              className="text-xs font-mono px-2 py-1 rounded whitespace-nowrap"
              style={{ backgroundColor: `${tache.statutActuel.couleur}20`, color: tache.statutActuel.couleur }}
            >
              {tache.statutActuel.nom}
            </span>
            <span className="text-xs text-ink-soft whitespace-nowrap">
              {tache.assigneA ? tache.assigneA.nom : '—'}
            </span>
            <span className="font-mono text-[11px] text-ink-soft border border-line rounded px-1.5 py-0.5 whitespace-nowrap">
              P{tache.priorite}
            </span>
            <span className={`text-xs whitespace-nowrap ${echeanceInfo?.enRetard ? 'text-step-testing font-medium' : 'text-ink-soft'}`}>
              {echeanceInfo ? `${echeanceInfo.enRetard ? '⚠ ' : ''}${echeanceInfo.texte}` : '—'}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default VueListe