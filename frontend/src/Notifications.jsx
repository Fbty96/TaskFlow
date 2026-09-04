import { useState, useEffect } from 'react'
import { API_URL } from './config'
function Notifications({ token , onChangement }) {
  const [notifications, setNotifications] = useState([])

  function charger() {
    fetch(`${API_URL}/notifications`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setNotifications(data) })
  }

  useEffect(() => { charger() }, [token])

  function marquerLue(id) {
    fetch(`${API_URL}/notifications/${id}/lu`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(() => { charger(); onChangement() })
  }

  const nonLues = notifications.filter((n) => !n.lu)

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">Notifications</h1>

      {notifications.length === 0 && (
        <p className="text-sm text-ink-soft">Aucune notification pour l'instant.</p>
      )}

      <div className="space-y-2">
        {notifications.map((n) => (
          <div
            key={n._id}
            onClick={() => !n.lu && marquerLue(n._id)}
            className={`border rounded-lg p-4 flex items-start justify-between gap-4 transition-colors ${
              n.lu ? 'bg-surface border-line' : 'bg-paper border-ink/20 cursor-pointer hover:border-ink/40'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                {!n.lu && <span className="w-1.5 h-1.5 rounded-full bg-step-progress shrink-0" />}
                <span className="text-xs font-mono uppercase tracking-wide text-ink-soft">{n.type}</span>
              </div>
              <p className={`text-sm ${n.lu ? 'text-ink-soft' : 'text-ink font-medium'}`}>{n.message}</p>
              <p className="text-xs text-ink-soft/70 mt-1 font-mono">
                {new Date(n.dateEnvoi).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Notifications