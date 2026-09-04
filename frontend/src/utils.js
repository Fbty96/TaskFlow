export function formatEcheance(echeance) {
  if (!echeance) return null

  const date = new Date(echeance)
  const maintenant = new Date()
  const enRetard = date < maintenant

  const texte = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })

  return { texte, enRetard }
}