import { useState, useEffect } from 'react'
import CreerProjet from './CreerProjet'
import { API_URL } from './config'

function ListeProjets({ token, user, onSelectionnerProjet }) {
  const [projets, setProjets] = useState([])

  function chargerProjets() {
    fetch(`${API_URL}/projects`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setProjets(data) })
  }

  useEffect(() => { chargerProjets() }, [token])

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">Mes projets</h1>

      <CreerProjet token={token} onProjetCree={chargerProjets} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">        {projets.map((projet) => {
          const estProprietaire = projet.proprietaire._id === user.id
          return (
            <button
              key={projet._id}
              onClick={() => onSelectionnerProjet(projet)}
              className="text-left bg-surface border border-line rounded-xl p-5 hover:border-ink hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h2 className="font-display font-semibold text-ink leading-snug">{projet.titre}</h2>
                {estProprietaire && (
                  <span className="shrink-0 text-[11px] font-mono uppercase tracking-wide text-ink-soft border border-line rounded-full px-2 py-0.5">
                    Propriétaire
                  </span>
                )}
              </div>
              <p className="text-sm text-ink-soft line-clamp-2">{projet.description}</p>
            </button>
          )
        })}
      </div>

      {projets.length === 0 && (
        <p className="text-sm text-ink-soft mt-6">Aucun projet pour l'instant — créez-en un ci-dessus.</p>
      )}
    </div>
  )
}

export default ListeProjets