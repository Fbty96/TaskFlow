import { useState } from 'react'

function CalendrierVue({ taches, onOuvrir }) {
  const [moisActuel, setMoisActuel] = useState(new Date())

  const annee = moisActuel.getFullYear()
  const mois = moisActuel.getMonth()

  const premierJour = new Date(annee, mois, 1)
  const dernierJour = new Date(annee, mois + 1, 0)
  const nombreJours = dernierJour.getDate()
  const decalage = (premierJour.getDay() + 6) % 7
  const joursMoisPrecedent = new Date(annee, mois, 0).getDate()

  const cellules = []
  for (let i = decalage - 1; i >= 0; i--) {
    cellules.push({ jour: joursMoisPrecedent - i, courant: false })
  }
  for (let j = 1; j <= nombreJours; j++) {
    cellules.push({ jour: j, courant: true })
  }
  let jourSuivant = 1
  while (cellules.length % 7 !== 0) {
    cellules.push({ jour: jourSuivant, courant: false })
    jourSuivant++
  }

  function tachesDuJour(jour, courant) {
    if (!courant) return []
    return taches.filter((t) => {
      if (!t.echeance) return false
      const d = new Date(t.echeance)
      return d.getDate() === jour && d.getMonth() === mois && d.getFullYear() === annee
    })
  }

  const nomMois = moisActuel.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  const joursNoms = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.']
  const aujourdHui = new Date()

  function changerMois(delta) {
    setMoisActuel(new Date(annee, mois + delta, 1))
  }

  return (
    <div className="bg-surface border border-line rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <h2 className="font-display text-2xl font-semibold text-ink capitalize">{nomMois}</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setMoisActuel(new Date())} className="text-sm font-medium text-ink-soft hover:text-ink border border-line rounded-lg px-3 py-1.5 transition-colors">
            Aujourd'hui
          </button>
          <button onClick={() => changerMois(-1)} className="w-8 h-8 rounded-lg border border-line text-ink-soft hover:text-ink hover:border-ink flex items-center justify-center text-sm">‹</button>
          <button onClick={() => changerMois(1)} className="w-8 h-8 rounded-lg border border-line text-ink-soft hover:text-ink hover:border-ink flex items-center justify-center text-sm">›</button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-line">
        {joursNoms.map((j, i) => (
          <div key={j} className={`text-xs font-medium text-ink-soft text-right px-2 py-2 ${i >= 5 ? 'bg-paper' : ''} ${i > 0 ? 'border-l border-line' : ''}`}>
            {j}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cellules.map((cel, i) => {
          const tachesJour = tachesDuJour(cel.jour, cel.courant)
          const estWeekend = i % 7 >= 5
          const estAujourdhui = cel.courant && cel.jour === aujourdHui.getDate() && mois === aujourdHui.getMonth() && annee === aujourdHui.getFullYear()

          return (
            <div
              key={i}
              className={`min-h-[110px] p-2 border-t ${i % 7 > 0 ? 'border-l' : ''} border-line ${estWeekend ? 'bg-paper' : ''} ${!cel.courant ? 'opacity-40' : ''}`}
            >
              <div className="flex justify-end mb-1">
                <span className={`text-sm font-mono w-6 h-6 flex items-center justify-center rounded-full ${estAujourdhui ? 'bg-ink text-paper font-medium' : 'text-ink-soft'}`}>
                  {cel.jour}
                </span>
              </div>
              <div className="space-y-1">
                {tachesJour.slice(0, 2).map((t) => (
                  <button
                    key={t._id}
                    onClick={() => onOuvrir(t)}
                    className="w-full text-left text-[11px] px-1.5 py-0.5 rounded truncate"
                    style={{ backgroundColor: `${t.statutActuel.couleur}20`, color: t.statutActuel.couleur }}
                  >
                    {t.titre}
                  </button>
                ))}
                {tachesJour.length > 2 && (
                  <p className="text-[10px] text-ink-soft pl-1.5">+{tachesJour.length - 2} autres</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CalendrierVue