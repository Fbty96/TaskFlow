import { useState, useEffect } from 'react'
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core'
import CreerTache from './CreerTache'
import { API_URL } from './config'

function CarteTacheSprint({ tache }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: tache._id })
    const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : undefined

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}
            className="bg-surface border border-line rounded-lg p-2.5 mb-2 cursor-grab active:cursor-grabbing hover:border-ink/40 transition-colors">
            <p className="text-sm text-ink leading-snug">{tache.titre}</p>
            <span
                className="inline-block mt-1.5 text-[10px] font-mono px-1.5 py-0.5 rounded"
                style={{ backgroundColor: `${tache.statutActuel.couleur}20`, color: tache.statutActuel.couleur }}
            >
                {tache.statutActuel.nom}
            </span>
        </div>
    )
}

function ColonneSprint({ id, titre, taches }) {
    const { setNodeRef, isOver } = useDroppable({ id })

    return (
        <div ref={setNodeRef} className={`rounded-xl border border-line min-w-[220px] w-[220px] shrink-0 transition-colors ${isOver ? 'bg-ink/[0.03]' : 'bg-paper'}`}>
            <div className="px-3 py-3 border-b border-line flex items-center justify-between">
                <h3 className="text-sm font-medium text-ink">{titre}</h3>
                <span className="font-mono text-[11px] text-ink-soft">{taches.length}</span>
            </div>
            <div className="p-2 min-h-[100px]">
                {taches.length === 0 && <p className="text-xs text-ink-soft/60 italic px-1">Vide</p>}
                {taches.map((tache) => <CarteTacheSprint key={tache._id} tache={tache} />)}
            </div>
        </div>
    )
}

function EcranAdmin({ token, projet, onRetour }) {
    const [etapes, setEtapes] = useState([])
    const [workflowId, setWorkflowId] = useState(null)
    const [nouvelleEtape, setNouvelleEtape] = useState('')
    const [sprints, setSprints] = useState([])
    const [taches, setTaches] = useState([])
    const [nom, setNom] = useState('')
    const [objectif, setObjectif] = useState('')
    const [dateDebut, setDateDebut] = useState('')
    const [dateFin, setDateFin] = useState('')
    const [ouvertSprint, setOuvertSprint] = useState(false)

    function chargerWorkflow() {
        fetch(`${API_URL}/projects/${projet._id}/workflow`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then((res) => res.json())
            .then((data) => { setWorkflowId(data.workflow._id); setEtapes(data.etapes) })
    }

    function chargerSprints() {
        fetch(`${API_URL}/projects/${projet._id}/sprints`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then((res) => res.json())
            .then((data) => { if (Array.isArray(data)) setSprints(data) })
    }

    function chargerTaches() {
        fetch(`${API_URL}/backlogs/${projet.backlog}/tasks`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then((res) => res.json())
            .then((data) => { if (Array.isArray(data)) setTaches(data) })
    }

    useEffect(() => { chargerWorkflow(); chargerSprints(); chargerTaches() }, [projet, token])

    function ajouterEtape(e) {
        e.preventDefault()
        if (!nouvelleEtape.trim()) return
        fetch(`${API_URL}/workflow-steps`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ workflowId, nom: nouvelleEtape, ordre: etapes.length + 1, couleur: '#8A8F98' })
        }).then(() => { setNouvelleEtape(''); chargerWorkflow() })
    }

    function modifierEtape(id, champ, valeur) {
        fetch(`${API_URL}/workflow-steps/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ [champ]: valeur })
        }).then(() => chargerWorkflow())
    }

    function supprimerEtape(id) {
        fetch(`${API_URL}/workflow-steps/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(() => chargerWorkflow())
    }

    function creerSprint(e) {
        e.preventDefault()
        fetch(`${API_URL}/projects/${projet._id}/sprints`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ nom, objectif, dateDebut, dateFin })
        }).then(() => {
            setNom(''); setObjectif(''); setDateDebut(''); setDateFin(''); setOuvertSprint(false)
            chargerSprints()
        })
    }

    function handleDragEnd(event) {
        const { active, over } = event
        if (!over) return
        const sprintId = over.id === 'backlog' ? null : over.id
        fetch(`${API_URL}/tasks/${active.id}/sprint`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ sprintId })
        }).then(() => chargerTaches())
    }

    const tachesBacklog = taches.filter((t) => !t.sprint)

    return (
        <div>
            <button onClick={onRetour} className="text-sm text-ink-soft hover:text-ink mb-4 transition-colors">
                ← Retour au projet
            </button>

            <div className="flex items-center gap-2 mb-8">
                <h1 className="font-display text-3xl font-semibold text-ink tracking-tight">Gérer {projet.titre}</h1>
                <span className="text-[11px] font-mono uppercase tracking-wide text-ink-soft border border-line rounded-full px-2 py-0.5">Admin</span>
            </div>

            <div className="space-y-10">
                <section>
                    <h2 className="font-display text-lg font-semibold text-ink mb-1">Tâches</h2>
                    <p className="text-sm text-ink-soft mb-4">Les nouvelles tâches sont ajoutées directement au backlog.</p>
                    <CreerTache token={token} backlogId={projet.backlog} onTacheCreee={chargerTaches} />
                </section>
                <section>
                    <h2 className="font-display text-lg font-semibold text-ink mb-1">Workflow</h2>
                    <p className="text-sm text-ink-soft mb-4">Personnalisez les colonnes de votre tableau.</p>

                    <div className="space-y-2 mb-4 max-w-lg">
                        {etapes.map((etape) => (
                            <div key={etape._id} className="bg-surface border border-line rounded-lg p-3 flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: etape.couleur }} />
                                <input
                                    type="text"
                                    defaultValue={etape.nom}
                                    onBlur={(e) => modifierEtape(etape._id, 'nom', e.target.value)}
                                    className="flex-1 min-w-0 text-sm text-ink bg-transparent focus:outline-none focus:bg-paper rounded px-2 py-1"
                                />
                                <input
                                    type="color"
                                    defaultValue={etape.couleur}
                                    onChange={(e) => modifierEtape(etape._id, 'couleur', e.target.value)}
                                    className="w-7 h-7 rounded cursor-pointer border border-line"
                                />
                                <button onClick={() => supprimerEtape(etape._id)} className="text-ink-soft hover:text-step-testing text-sm shrink-0">
                                    Supprimer
                                </button>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={ajouterEtape} className="flex gap-2 max-w-md">
                        <input
                            type="text"
                            placeholder="Nom de la nouvelle étape"
                            value={nouvelleEtape}
                            onChange={(e) => setNouvelleEtape(e.target.value)}
                            className="flex-1 rounded-lg border border-line px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink focus:border-ink"
                        />
                        <button type="submit" className="bg-ink text-paper rounded-lg px-4 py-2 text-sm font-medium hover:bg-ink/90 transition-colors">
                            Ajouter
                        </button>
                    </form>
                </section>

                <section>
                    <h2 className="font-display text-lg font-semibold text-ink mb-1">Sprints</h2>
                    <p className="text-sm text-ink-soft mb-4">Créez vos sprints et répartissez les tâches par glisser-déposer.</p>

                    {!ouvertSprint ? (
                        <button
                            onClick={() => setOuvertSprint(true)}
                            className="border border-dashed border-line rounded-xl px-4 py-3 text-sm font-medium text-ink-soft hover:text-ink hover:border-ink transition-colors mb-6"
                        >
                            + Nouveau sprint
                        </button>
                    ) : (
                        <form onSubmit={creerSprint} className="bg-surface border border-line rounded-xl p-4 space-y-3 mb-6 max-w-md">
                            <input type="text" placeholder="Nom du sprint" value={nom} onChange={(e) => setNom(e.target.value)}
                                className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink focus:border-ink" autoFocus />
                            <input type="text" placeholder="Objectif (optionnel)" value={objectif} onChange={(e) => setObjectif(e.target.value)}
                                className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink focus:border-ink" />
                            <div className="flex gap-2">
                                <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)}
                                    className="flex-1 rounded-lg border border-line px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink focus:border-ink" />
                                <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)}
                                    className="flex-1 rounded-lg border border-line px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink focus:border-ink" />
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" className="bg-ink text-paper rounded-lg px-4 py-2 text-sm font-medium hover:bg-ink/90 transition-colors">Créer</button>
                                <button type="button" onClick={() => setOuvertSprint(false)} className="text-sm text-ink-soft hover:text-ink px-2">Annuler</button>
                            </div>
                        </form>
                    )}

                    <DndContext onDragEnd={handleDragEnd}>
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            <ColonneSprint id="backlog" titre="Backlog" taches={tachesBacklog} />
                            {sprints.map((sprint) => (
                                <ColonneSprint
                                    key={sprint._id}
                                    id={sprint._id}
                                    titre={sprint.nom}
                                    taches={taches.filter((t) => t.sprint?._id === sprint._id)}
                                />
                            ))}
                        </div>
                    </DndContext>
                </section>
            </div>
        </div>
    )
}

export default EcranAdmin