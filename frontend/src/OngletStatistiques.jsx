import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { API_URL } from './config'

function OngletStatistiques({ token, projet }) {
  const [taches, setTaches] = useState([])
  const [etapes, setEtapes] = useState([])

  useEffect(() => {
    fetch(`${API_URL}/backlogs/${projet.backlog}/tasks`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setTaches(data) })

    fetch(`${API_URL}/projects/${projet._id}/workflow`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => setEtapes(data.etapes))
  }, [projet, token])

  const parStatut = etapes.map((etape) => ({
    nom: etape.nom,
    valeur: taches.filter((t) => t.statutActuel._id === etape._id).length,
    couleur: etape.couleur
  })).filter((s) => s.valeur > 0)

  const membresDisponibles = [projet.proprietaire, ...projet.membres]
  const parMembre = [
    ...membresDisponibles.map((m) => ({
      nom: m.nom,
      valeur: taches.filter((t) => t.assigneA?._id === m._id).length
    })),
    { nom: 'Non assigné', valeur: taches.filter((t) => !t.assigneA).length }
  ].filter((m) => m.valeur > 0)

  const parPriorite = [1, 2, 3].map((p) => ({
    nom: `P${p}`,
    valeur: taches.filter((t) => t.priorite === p).length
  })).filter((p) => p.valeur > 0)

  if (taches.length === 0) {
    return <p className="text-sm text-ink-soft">Aucune tâche à analyser pour l'instant.</p>
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-surface border border-line rounded-xl p-5">
        <h3 className="text-sm font-medium text-ink mb-4">Tâches par statut</h3>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={parStatut} dataKey="valeur" nameKey="nom" cx="50%" cy="50%" outerRadius={80}>
              {parStatut.map((entry, index) => (
                <Cell key={index} fill={entry.couleur} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-surface border border-line rounded-xl p-5">
        <h3 className="text-sm font-medium text-ink mb-4">Tâches par membre</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={parMembre}>
            <XAxis dataKey="nom" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="valeur" fill="#16171B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-surface border border-line rounded-xl p-5 lg:col-span-2">
        <h3 className="text-sm font-medium text-ink mb-4">Tâches par priorité</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={parPriorite} layout="vertical">
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="nom" tick={{ fontSize: 12 }} width={40} />
            <Tooltip />
            <Bar dataKey="valeur" fill="#8A8F98" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default OngletStatistiques