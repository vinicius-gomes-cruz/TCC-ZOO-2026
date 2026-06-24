export default function BioterioPage() {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bioterio</h1>
          <p className="page-subtitle">Gerencie o bioterio do zoológico</p>
        </div>
        <button className="btn-primary">
          + Novo Item
        </button>
      </div>

      <div className="empty-state">
        <div className="empty-state-icon">🧬</div>
        <p>Nenhum item do bioterio cadastrado. Clique em "Novo Item" para começar.</p>
      </div>
    </div>
  )
}