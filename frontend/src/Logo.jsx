function Logo() {
  const etapes = ['#8A8F98', '#2F6FED', '#E8A33D', '#8B5CF6', '#DB4C79', '#3F9142']

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {etapes.map((couleur, i) => (
          <span key={i} className="w-1 h-4 rounded-full" style={{ backgroundColor: couleur }} />
        ))}
      </div>
      <span className="font-display text-xl font-semibold text-ink tracking-tight">TaskFlow</span>
    </div>
  )
}

export default Logo