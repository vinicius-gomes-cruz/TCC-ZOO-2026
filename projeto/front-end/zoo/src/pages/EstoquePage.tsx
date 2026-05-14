import { useEffect, useState } from 'react'
import {
  criarAlimentacao,
  listarAlimentacoesPorAnimal,
  registrarAberturaAlimentacao,
  registrarTerminoAlimentacao,
  deletarAlimentacao,
  getAnimalsByHabitat,
  getHabitats,
} from '../api'

interface Alimentacao {
  id: number
  nome: string
  tipo: string
  quantidade: number
  dataChegada: string
  dataAbertura: string | null
  dataTermino: string | null
}

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
  nome: '',
  tipo: '',
  quantidade: '',
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
        nome: form.nome,
        tipo: form.tipo,
        quantidade: parseInt(form.quantidade),
        dataChegada: new Date().toISOString().split('T')[0],
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

  const handleAbrirAlimentacao = async (id: number) => {
    setSaving(true)
    try {
      await registrarAberturaAlimentacao(id)
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

  const handleTerminarAlimentacao = async (id: number) => {
    setSaving(true)
    try {
      await registrarTerminoAlimentacao(id)
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

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Estoque de Alimentação</h1>
          <p className="page-subtitle">Gerencie o estoque de alimentos dos animais</p>
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
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th>Tipo</th>
                        <th>Quantidade</th>
                        <th>Data Chegada</th>
                        <th>Data Abertura</th>
                        <th>Data Término</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alimentacoes.map((alimentacao) => (
                        <tr key={alimentacao.id}>
                          <td className="font-weight-bold">{alimentacao.nome}</td>
                          <td>{alimentacao.tipo}</td>
                          <td className="text-center">{alimentacao.quantidade}</td>
                          <td className="text-muted">
                            {new Date(alimentacao.dataChegada).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="text-muted">
                            {alimentacao.dataAbertura
                              ? new Date(alimentacao.dataAbertura).toLocaleDateString('pt-BR')
                              : '—'}
                          </td>
                          <td className="text-muted">
                            {alimentacao.dataTermino
                              ? new Date(alimentacao.dataTermino).toLocaleDateString('pt-BR')
                              : '—'}
                          </td>
                          <td>
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
                                  {!alimentacao.dataAbertura && (
                                    <button
                                      className="action-item"
                                      onClick={() => {
                                        setOpenMenuId(null)
                                        handleAbrirAlimentacao(alimentacao.id)
                                      }}
                                    >
                                      ✓ Registrar Abertura
                                    </button>
                                  )}
                                  {alimentacao.dataAbertura && !alimentacao.dataTermino && (
                                    <button
                                      className="action-item"
                                      onClick={() => {
                                        setOpenMenuId(null)
                                        handleTerminarAlimentacao(alimentacao.id)
                                      }}
                                    >
                                      ✓ Registrar Término
                                    </button>
                                  )}
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
              <h2>Novo Item de Alimentação</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <label>
                Nome do Produto <span className="required">*</span>
                <input
                  required
                  placeholder="Ex: Ração Premium"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                />
              </label>
              <label>
                Tipo <span className="required">*</span>
                <input
                  required
                  placeholder="Ex: Ração, Frutas, Verduras"
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                />
              </label>
              <label>
                Quantidade <span className="required">*</span>
                <input
                  required
                  type="number"
                  placeholder="Ex: 50"
                  value={form.quantidade}
                  onChange={(e) => setForm({ ...form, quantidade: e.target.value })}
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