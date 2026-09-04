import { useState, useEffect } from 'react'
import { DndContext, useDraggable, useDroppable, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'
import DetailTache from './DetailTache'
import VueListe from './VueListe'
import { API_URL } from './config'
import { formatEcheance } from './utils'
import { IconDescription, IconComment } from './icons'

function useDebounce(valeur, delai) {
  const [valeurDebounced, setValeurDebounced] = useState(valeur)
  useEffect(() => {
    const timer = setTimeout(() => setValeurDebounced(valeur), delai)
    return () => clearTimeout(timer)
  }, [valeur, delai])
  return valeurDebounced
}

function CarteTache({ tache, onOuvrir }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: tache._id })
  const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : undefined
  const echeanceInfo = formatEcheance(tache.echeance)

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}
      onClick={() => onOuvrir(tache)}
      className="bg-surface border border-line rounded-lg p-3 mb-2 cursor-grab active:cursor-grabbing hover:border-ink/40 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-medium text-ink leading-snug">{tache.titre}</h4>
        <span className="shrink-0 font-mono text-[10px] text-ink-soft border border-line rounded px-1.5 py-0.5">P{tache.priorite}</span>
      </div>

      {echeanceInfo && (
        <span className={`inline-block text-[11px] font-mono px-1.5 py-0.5 rounded mb-2 ${echeanceInfo.enRetard ? 'bg-step-testing/15 text-step-testing font-medium' : 'bg-paper text-ink-soft'}`}>
          {echeanceInfo.enRetard ? '⚠ ' : ''}{echeanceInfo.texte}
        </span>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-ink-soft">
          {tache.description && <IconDescription className="w-3.5 h-3.5" />}
          {tache.nombreCommentaires > 0 && (
            <span className="flex items-center gap-1 text-[11px]">
              <IconComment className="w-3.5 h-3.5" />
              {tache.nombreCommentaires}
            </span>
          )}
        </div>

        {tache.assigneA && (
          <div className="w-6 h-6 rounded-full bg-ink text-paper text-[11px] font-medium flex items-center justify-center shrink-0" title={tache.assigneA.nom}>
            {tache.assigneA.nom.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  )
}

function Colonne({ etape, taches, onOuvrir }) {
  const { setNodeRef, isOver } = useDroppable({ id: etape._id })

  return (
    <div
      ref={setNodeRef}
      className="rounded-xl border border-line transition-colors w-[75vw] shrink-0 sm:w-auto sm:shrink"
      style={{ backgroundColor: isOver ? `${etape.couleur}1A` : `${etape.couleur}0D` }}
    >
      <div className="h-1 rounded-t-xl" style={{ backgroundColor: etape.couleur }} />
      <div className="px-3 py-3 min-h-[80px]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-ink">{etape.nom}</h3>
          <span className="font-mono text-[11px] text-ink-soft">{taches.length}</span>
        </div>
        {taches.length === 0 && (
          <p className="text-xs text-ink-soft/60 italic">Aucune tâche ici</p>
        )}
        {taches.map((tache) => <CarteTache key={tache._id} tache={tache} onOuvrir={onOuvrir} />)}
      </div>
    </div>
  )
}

function OngletTaches({ token, projet, user, sprintsSelectionnes }) {
  const [etapes, setEtapes] = useState([])
  const [taches, setTaches] = useState([])
  const [tacheOuverte, setTacheOuverte] = useState(null)
  const [recherche, setRecherche] = useState('')
  const [filtreAssigne, setFiltreAssigne] = useState('')
  const [filtrePriorite, setFiltrePriorite] = useState('')
  const [sprints, setSprints] = useState([])
  const [modeAffichage, setModeAffichage] = useState('kanban')

  const estProprietaire = projet.proprietaire._id === user.id

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  useEffect(() => {
    fetch(`${API_URL}/projects/${projet._id}/sprints`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setSprints(data) })
  }, [projet, token])

  useEffect(() => {
    fetch(`${API_URL}/projects/${projet._id}/workflow`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setEtapes(data.etapes))
  }, [projet, token])

  function chargerTaches() {
    fetch(`${API_URL}/backlogs/${projet.backlog}/tasks`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setTaches(data) })
  }

  useEffect(() => { chargerTaches() }, [projet, token]) 
  useEffect(() => {
   const source = new EventSource(`${API_URL}/projects/${projet._id}/events?token=${token}`)
   source.onmessage = () => {
     chargerTaches()
   }
   return () => source.close()
  }, [projet, token])

  function handleDragEnd(event) {
    const { active, over } = event
    if (!over) return
    fetch(`${API_URL}/tasks/${active.id}/statut`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ statutId: over.id })
    }).then((res) => res.json()).then(() => chargerTaches())
  }

  const membresDisponibles = [projet.proprietaire, ...projet.membres]
  const rechercheDebounced = useDebounce(recherche, 300)

  const tachesFiltrees = taches.filter((t) => {
    const correspondRecherche = t.titre.toLowerCase().includes(rechercheDebounced.toLowerCase())
    const correspondAssigne = !filtreAssigne || t.assigneA?._id === filtreAssigne
    const correspondPriorite = !filtrePriorite || t.priorite === Number(filtrePriorite)
    const correspondSprint = !sprintsSelectionnes || sprintsSelectionnes.length === 0 || sprintsSelectionnes.includes(t.sprint?._id)
    return correspondRecherche && correspondAssigne && correspondPriorite && correspondSprint
  })

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Rechercher une tâche..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="rounded-lg border border-line px-3 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink focus:border-ink w-48"
        />
        <select
          value={filtreAssigne}
          onChange={(e) => setFiltreAssigne(e.target.value)}
          className="rounded-lg border border-line px-3 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink focus:border-ink"
        >
          <option value="">Tous les assignés</option>
          {membresDisponibles.map((m) => (
            <option key={m._id} value={m._id}>{m.nom}</option>
          ))}
        </select>
        <select
          value={filtrePriorite}
          onChange={(e) => setFiltrePriorite(e.target.value)}
          className="rounded-lg border border-line px-3 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink focus:border-ink"
        >
          <option value="">Toutes priorités</option>
          <option value="1">P1</option>
          <option value="2">P2</option>
          <option value="3">P3</option>
        </select>
        {(recherche || filtreAssigne || filtrePriorite) && (
          <button
            onClick={() => { setRecherche(''); setFiltreAssigne(''); setFiltrePriorite('') }}
            className="text-sm text-ink-soft hover:text-ink underline underline-offset-2"
          >
            Réinitialiser
          </button>
        )}
      </div>

      <div className="flex gap-1 mb-4">
        <button
          onClick={() => setModeAffichage('kanban')}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${modeAffichage === 'kanban' ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-paper'}`}
        >
          Kanban
        </button>
        <button
          onClick={() => setModeAffichage('liste')}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${modeAffichage === 'liste' ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-paper'}`}
        >
          Liste
        </button>
      </div>

      {modeAffichage === 'kanban' ? (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto sm:overflow-visible pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {etapes.map((etape) => (
              <Colonne
                key={etape._id}
                etape={etape}
                taches={tachesFiltrees.filter((t) => t.statutActuel._id === etape._id)}
                onOuvrir={setTacheOuverte}
              />
            ))}
          </div>
        </DndContext>
      ) : (
        <VueListe taches={tachesFiltrees} onOuvrir={setTacheOuverte} />
      )}

      {tacheOuverte && (
        <DetailTache
          token={token}
          tache={tacheOuverte}
          projet={projet}
          sprints={sprints}
          estProprietaire={estProprietaire}
          onFermer={() => setTacheOuverte(null)}
          onTacheModifiee={chargerTaches}
          onTacheSupprimee={() => { setTacheOuverte(null); chargerTaches() }}
        />
      )}
    </div>
  )
}

export default OngletTaches