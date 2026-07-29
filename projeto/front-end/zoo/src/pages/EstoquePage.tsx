import { useEffect, useState } from 'react'
import {
  criarAlimentacao,
  listarAlimentacoesPorAnimal,
  deletarAlimentacao,
  getAnimalsByHabitat,
  getHabitats,
} from '../api'

interface Alimentacao {
  id: number
  nome: string
  tipo: string
  cardapio?: string | null
  diaSemana?: string | null
  quantidade: number
  dataChegada: string
  dataAbertura: string | null
  dataTermino: string | null
}

type DiaSemana =
  | 'SEGUNDA'
  | 'TERCA'
  | 'QUARTA'
  | 'QUINTA'
  | 'SEXTA'
  | 'SABADO'
  | 'DOMINGO'

interface Animal {
  id: number
  nomePopular: string
  especie: string
}

interface Habitat {
  id: number
  nome: string
}

const emptyForm = {
  cardapio: 'Cardápio Semanal',
  diaSemana: 'SEGUNDA' as DiaSemana,
  nome: '',
}

const diasSemanaOptions: Array<{ value: DiaSemana; label: string }> = [
  { value: 'SEGUNDA', label: 'Segunda-feira' },
  { value: 'TERCA', label: 'Terça-feira' },
  { value: 'QUARTA', label: 'Quarta-feira' },
  { value: 'QUINTA', label: 'Quinta-feira' },
  { value: 'SEXTA', label: 'Sexta-feira' },
  { value: 'SABADO', label: 'Sábado' },
  { value: 'DOMINGO', label: 'Domingo' },
]

const diaSemanaOrdem: Record<DiaSemana, number> = {
  SEGUNDA: 1,
  TERCA: 2,
  QUARTA: 3,
  QUINTA: 4,
  SEXTA: 5,
  SABADO: 6,
  DOMINGO: 7,
}

const formatarDiaSemana = (dia?: string | null) => {
  const option = diasSemanaOptions.find((item) => item.value === dia)
  return option?.label ?? (dia || 'A definir')
}

export default function EstoquePage() {
  const [habitats, setHabitats] = useState<Habitat[]>([])
  const [animaisSelecionados, setAnimaisSelecionados] = useState<Animal[]>([])
  const [animalIdSelecionado, setAnimalIdSelecionado] = useState<number | null>(null)
  const [alimentacoes, setAlimentacoes] = useState<Alimentacao[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    getHabitats()
      .then((list: Habitat[]) => setHabitats(list))
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const loadAlimentacoes = async (animalId: number) => {
    try {
      setLoading(true)
      const data = await listarAlimentacoesPorAnimal(animalId)
      setAlimentacoes(Array.isArray(data) ? data : [])
      setError(null)
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAnimal = async (animal: Animal) => {
    setAnimalIdSelecionado(animal.id)
    await loadAlimentacoes(animal.id)
  }

  const handleSelectHabitat = async (habitatId: number) => {
    try {
      setLoading(true)
      const animais = await getAnimalsByHabitat(habitatId)
      setAnimaisSelecionados(Array.isArray(animais) ? animais : [])
      setAnimalIdSelecionado(null)
      setAlimentacoes([])
      setError(null)
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setForm(emptyForm)
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!animalIdSelecionado) {
      setError('Selecione um animal primeiro')
      return
    }

    setSaving(true)
    try {
      const payload = {
        cardapio: form.cardapio,
        diaSemana: form.diaSemana,
        nome: form.nome,
      }
      await criarAlimentacao(animalIdSelecionado, payload)
      await loadAlimentacoes(animalIdSelecionado)
      setShowModal(false)
      setForm(emptyForm)
      setError(null)
    } catch (err) {
      setError(String(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAlimentacao = async (id: number) => {
    if (!window.confirm('Deseja excluir esta alimentação?')) return

    setSaving(true)
    try {
      await deletarAlimentacao(id)
      if (animalIdSelecionado) {
        await loadAlimentacoes(animalIdSelecionado)
      }
      setError(null)
    } catch (err) {
      setError(String(err))
    } finally {
      setSaving(false)
    }
  }

  const animalSelecionado = animaisSelecionados.find((a) => a.id === animalIdSelecionado)

  const alimentacoesPorCardapio = alimentacoes.reduce<Record<string, Alimentacao[]>>((acc, item) => {
    const cardapio = item.cardapio?.trim() || 'Cardápio Semanal'
    if (!acc[cardapio]) {
      acc[cardapio] = []
    }
    acc[cardapio].push(item)
    return acc
  }, {})

  const cardapiosOrdenados = Object.entries(alimentacoesPorCardapio)
    .sort(([a], [b]) => a.localeCompare(b, 'pt-BR'))
    .map(([cardapio, lista]) => ({
      cardapio,
      itens: [...lista].sort((x, y) => {
        const ordemX = x.diaSemana ? diaSemanaOrdem[x.diaSemana as DiaSemana] ?? 99 : 99
        const ordemY = y.diaSemana ? diaSemanaOrdem[y.diaSemana as DiaSemana] ?? 99 : 99

        if (ordemX !== ordemY) return ordemX - ordemY
        return x.nome.localeCompare(y.nome, 'pt-BR')
      }),
    }))

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Estoque de Alimentação</h1>
          <p className="page-subtitle">Organize os cardápios semanais com a alimentação de cada dia</p>
        </div>
        <button 
          className="btn-primary" 
          onClick={openCreate}
          disabled={!animalIdSelecionado}
          title={animalIdSelecionado ? 'Adicionar novo item' : 'Selecione um animal primeiro'}
        >
          + Novo Item
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {loading && habitats.length === 0 ? (
        <div className="loading">Carregando...</div>
      ) : habitats.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🌿</div>
          <p>Nenhum habitat disponível.</p>
        </div>
      ) : (
        <>
          {/* Seleção de Habitat */}
          <div className="grid">
            {habitats.map((habitat) => (
              <div
                key={habitat.id}
                className="card card-clickable"
                role="button"
                tabIndex={0}
                onClick={() => handleSelectHabitat(habitat.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleSelectHabitat(habitat.id)
                  }
                }}
              >
                <div className="card-icon">🌿</div>
                <h3 className="card-title">{habitat.nome}</h3>
              </div>
            ))}
          </div>

          {/* Seleção de Animal */}
          {animaisSelecionados.length > 0 && (
            <>
              <h2 className="section-title">Selecione um Animal</h2>
              <div className="grid">
                {animaisSelecionados.map((animal) => (
                  <div
                    key={animal.id}
                    className={`card ${animalIdSelecionado === animal.id ? 'card-selected' : 'card-clickable'}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelectAnimal(animal)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleSelectAnimal(animal)
                      }
                    }}
                  >
                    <div className="card-icon">🦁</div>
                    <h3 className="card-title">{animal.nomePopular}</h3>
                    <p className="card-subtitle">{animal.especie}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Lista de Alimentações */}
          {animalIdSelecionado && (
            <>
              <h2 className="section-title">Alimentações de {animalSelecionado?.nomePopular}</h2>

              {loading ? (
                <div className="loading">Carregando alimentações...</div>
              ) : alimentacoes.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📦</div>
                  <p>Nenhuma alimentação registrada para este animal.</p>
                </div>
              ) : (
                cardapiosOrdenados.map(({ cardapio, itens }) => (
                  <div key={cardapio} className="table-container" style={{ marginBottom: 16 }}>
                    <h3 className="section-title section-title-cardapio">{cardapio}</h3>
                    <table className="table table-cardapio">
                      <thead>
                        <tr>
                          <th>Dia da Semana</th>
                          <th>Alimentação do Dia</th>
                          <th className="col-acoes">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {itens.map((alimentacao) => (
                          <tr key={alimentacao.id}>
                            <td>{formatarDiaSemana(alimentacao.diaSemana)}</td>
                            <td className="font-weight-bold">{alimentacao.nome}</td>
                            <td className="col-acoes">
                              <div className="action-menu">
                                <button
                                  className="action-btn"
                                  onClick={() => setOpenMenuId(openMenuId === alimentacao.id ? null : alimentacao.id)}
                                  title="Mais ações"
                                >
                                  ⋯
                                </button>
                                {openMenuId === alimentacao.id && (
                                  <div className="action-dropdown">
                                    <button
                                      className="action-item danger"
                                      onClick={() => {
                                        setOpenMenuId(null)
                                        handleDeleteAlimentacao(alimentacao.id)
                                      }}
                                    >
                                      🗑️ Excluir
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))
              )}
            </>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Novo Item do Cardápio</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <label>
                Cardápio <span className="required">*</span>
                <input
                  required
                  placeholder="Ex: Cardápio Semanal Primatas"
                  value={form.cardapio}
                  onChange={(e) => setForm({ ...form, cardapio: e.target.value })}
                />
              </label>
              <label>
                Dia da Semana <span className="required">*</span>
                <select
                  required
                  value={form.diaSemana}
                  onChange={(e) => setForm({ ...form, diaSemana: e.target.value as DiaSemana })}
                >
                  {diasSemanaOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                O que o animal vai comer <span className="required">*</span>
                <input
                  required
                  placeholder="Ex: Banana, folhas e legumes"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                />
              </label>
              <div className="modal-buttons">
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}