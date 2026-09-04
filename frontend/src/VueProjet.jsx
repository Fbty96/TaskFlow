import { useState } from 'react'
import GererMembres from './GererMembres'
import OngletTaches from './OngletTaches'
import OngletSprints from './OngletSprints'
import OngletStatistiques from './OngletStatistiques'

function VueProjet({ token, projet, user, onProjetMisAJour, onOuvrirAdmin }) {
  const [onglet, setOnglet] = useState('taches')
  const [sprintsSelectionnes, setSprintsSelectionnes] = useState([])
  const estProprietaire = projet.proprietaire?._id === user.id

  const onglets = [
    { id: 'taches', label: 'Tâches' },
    { id: 'sprints', label: 'Sprints' },
    { id: 'statistiques', label: 'Statistiques' }
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
        <h1 className="font-display text-3xl font-semibold text-ink tracking-tight">{projet.titre}</h1>
        {estProprietaire && (
          <div className="sm:w-72 shrink-0">
            <GererMembres token={token} projetId={projet._id} membres={projet.membres} onMembreAjoute={onProjetMisAJour} />
          </div>
        )}
      </div>

      {estProprietaire && (
        <button
          onClick={onOuvrirAdmin}
          className="block text-sm font-medium text-ink border border-line rounded-lg px-3 py-1.5 hover:border-ink transition-colors mb-6"
        >
          Gérer le projet →
        </button>
      )}

      <div className="inline-flex gap-1 bg-paper border border-line rounded-lg p-1 mb-6">
        {onglets.map((o) => (
          <button
            key={o.id}
            onClick={() => setOnglet(o.id)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              onglet === o.id ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {onglet === 'taches' && (
        <OngletTaches token={token} projet={projet} user={user} sprintsSelectionnes={sprintsSelectionnes} />
      )}
      {onglet === 'sprints' && (
        <OngletSprints token={token} projet={projet} sprintsSelectionnes={sprintsSelectionnes} onChangerSelection={setSprintsSelectionnes} />
      )}
      {onglet === 'statistiques' && <OngletStatistiques token={token} projet={projet} />}
    </div>
  )
}

export default VueProjet