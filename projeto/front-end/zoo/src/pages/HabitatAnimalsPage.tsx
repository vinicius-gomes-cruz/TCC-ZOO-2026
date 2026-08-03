import { useEffect, useState } from 'react'
import {
  createAnimal,
  criarAlimentacaoPorHabitat,
  deleteAnimal,
  deletarAlimentacao,
  getAnimalsByHabitat,
  listarAlimentacoesPorHabitat,
  updateAnimal,
} from '../api'
import type { Habitat } from './HabitatPage'

interface Animal {
  id?: number
  nomePopular: string
  nomeCientifico: string
  especie: string
  numeroMicrochipOuAnilha: string
  localizacaoMicrochip: string
  apelido: string
  observacaoSaude: string
  tratamentosFeitos: string
  alimentacao: string
}

interface Alimentacao {
  id: number
  nome: string
  cardapio?: string | null
  diaSemana?: string | null
}

type DiaSemana =
  | 'SEGUNDA'
  | 'TERCA'
  | 'QUARTA'
  | 'QUINTA'
  | 'SEXTA'
  | 'SABADO'
  | 'DOMINGO'

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

const emptyCardapioForm = {
  cardapio: 'Cardápio Semanal',
}

const emptySemanaAlimentacao: Record<DiaSemana, string> = {
  SEGUNDA: '',
  TERCA: '',
  QUARTA: '',
  QUINTA: '',
  SEXTA: '',
  SABADO: '',
  DOMINGO: '',
}

const formatarDiaSemana = (dia?: string | null) => {
  const option = diasSemanaOptions.find((item) => item.value === dia)
  return option?.label ?? (dia || 'A definir')
}

interface HabitatAnimalsPageProps {
  habitat: Habitat
  onBack: () => void
}

const emptyAnimal: Animal = {
  nomePopular: '',
  nomeCientifico: '',
  especie: '',
  numeroMicrochipOuAnilha: '',
  localizacaoMicrochip: '',
  apelido: '',
  observacaoSaude: '',
  tratamentosFeitos: '',
  alimentacao: '',
}

const speciesPalette = [
  { background: '#e8f5e9', color: '#1b5e20' },
  { background: '#e3f2fd', color: '#0d47a1' },
  { background: '#fff8e1', color: '#e65100' },
  { background: '#f3e5f5', color: '#4a148c' },
]

function getSpeciesVisual(species: string) {
  const normalized = species?.trim() || 'Animal'
  const hash = Array.from(normalized).reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const palette = speciesPalette[hash % speciesPalette.length]
  const words = normalized.split(/\s+/)
  const label =
    words.length > 1
      ? `${words[0][0] ?? ''}${words[1][0] ?? ''}`.toUpperCase()
      : (words[0]?.slice(0, 2) ?? 'AN').toUpperCase()

  return { label, palette }
}

export default function HabitatAnimalsPage({ habitat, onBack }: HabitatAnimalsPageProps) {
  const [animals, setAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAnimalModal, setShowAnimalModal] = useState(false)
  const [form, setForm] = useState<Animal>(emptyAnimal)
  const [editingAnimalId, setEditingAnimalId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [alimentacoes, setAlimentacoes] = useState<Alimentacao[]>([])
  const [loadingAlimentacoes, setLoadingAlimentacoes] = useState(false)
  const [showCardapioModal, setShowCardapioModal] = useState(false)
  const [cardapioForm, setCardapioForm] = useState(emptyCardapioForm)
  const [semanaAlimentacaoForm, setSemanaAlimentacaoForm] = useState<Record<DiaSemana, string>>(emptySemanaAlimentacao)
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const [cardapioSelecionado, setCardapioSelecionado] = useState<string>('TODOS')

  const load = () => {
    if (!habitat.id) return
    setLoading(true)
    setError(null)
    getAnimalsByHabitat(habitat.id)
      .then((list: Animal[]) => setAnimals(list))
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false))
  }

  useEffect(load, [habitat.id])

  const loadAlimentacoes = async (habitatId: number) => {
    try {
      setLoadingAlimentacoes(true)
      const data = await listarAlimentacoesPorHabitat(habitatId)
      setAlimentacoes(Array.isArray(data) ? data : [])
      setError(null)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoadingAlimentacoes(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!habitat.id) return

    setSaving(true)
    try {
      const payload = {
        nomePopular: form.nomePopular,
        nomeCientifico: form.nomeCientifico,
        especie: form.especie,
        numeroMicrochipOuAnilha: form.numeroMicrochipOuAnilha,
        localizacaoMicrochip: form.localizacaoMicrochip,
        apelido: form.apelido,
        observacaoSaude: form.observacaoSaude,
        tratamentosFeitos: form.tratamentosFeitos,
        alimentacao: form.alimentacao,
        habitatId: habitat.id,
      }

      if (editingAnimalId) {
        await updateAnimal(editingAnimalId, payload)
      } else {
        await createAnimal(payload)
      }
      setShowAnimalModal(false)
      setForm(emptyAnimal)
      setEditingAnimalId(null)
      load()
    } catch (e) {
      setError(String(e))
    } finally {
      setSaving(false)
    }
  }

  const openCreateAnimal = () => {
    setEditingAnimalId(null)
    setForm(emptyAnimal)
    setShowAnimalModal(true)
  }

  const openEditAnimal = (animal: Animal) => {
    setEditingAnimalId(animal.id ?? null)
    setForm({
      nomePopular: animal.nomePopular ?? '',
      nomeCientifico: animal.nomeCientifico ?? '',
      especie: animal.especie ?? '',
      numeroMicrochipOuAnilha: animal.numeroMicrochipOuAnilha ?? '',
      localizacaoMicrochip: animal.localizacaoMicrochip ?? '',
      apelido: animal.apelido ?? '',
      observacaoSaude: animal.observacaoSaude ?? '',
      tratamentosFeitos: animal.tratamentosFeitos ?? '',
      alimentacao: animal.alimentacao ?? '',
    })
    setShowAnimalModal(true)
  }

  const handleDeleteAnimal = async (animalId?: number) => {
    if (!animalId || !window.confirm('Deseja remover este animal?')) return
    try {
      await deleteAnimal(animalId)
      load()
    } catch (e) {
      setError(String(e))
    }
  }

  const openCreateCardapio = () => {
    if (!habitat.id) {
      setError('Habitat inválido para criar cardápio')
      return
    }
    setCardapioForm(emptyCardapioForm)
    setSemanaAlimentacaoForm(emptySemanaAlimentacao)
    setShowCardapioModal(true)
  }

  const handleSubmitCardapio = async (e: React.FormEvent) => {
    e.preventDefault()
    const habitatId = habitat.id
    if (!habitatId) {
      setError('Habitat inválido para salvar cardápio')
      return
    }

    setSaving(true)
    try {
      const itensSemana = diasSemanaOptions
        .map(({ value }) => ({
          diaSemana: value,
          nome: semanaAlimentacaoForm[value].trim(),
        }))
        .filter((item) => item.nome.length > 0)

      if (itensSemana.length === 0) {
        setError('Preencha ao menos um dia da semana')
        setSaving(false)
        return
      }

      await Promise.all(
        itensSemana.map((item) =>
          criarAlimentacaoPorHabitat(habitatId, {
            cardapio: cardapioForm.cardapio,
            diaSemana: item.diaSemana,
            nome: item.nome,
          })
        )
      )

      await loadAlimentacoes(habitatId)
      setCardapioSelecionado(cardapioForm.cardapio.trim() || 'Cardápio Semanal')

      setShowCardapioModal(false)
      setCardapioForm(emptyCardapioForm)
      setSemanaAlimentacaoForm(emptySemanaAlimentacao)
      setError(null)
    } catch (e) {
      setError(String(e))
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAlimentacao = async (id: number) => {
    if (!window.confirm('Deseja excluir esta alimentação?')) return
    if (!habitat.id) return

    setSaving(true)
    try {
      await deletarAlimentacao(id)
      await loadAlimentacoes(habitat.id)
      setError(null)
    } catch (e) {
      setError(String(e))
    } finally {
      setSaving(false)
    }
  }

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

  const nomesCardapios = cardapiosOrdenados.map((item) => item.cardapio)
  const cardapiosFiltrados =
    cardapioSelecionado === 'TODOS'
      ? cardapiosOrdenados
      : cardapiosOrdenados.filter((item) => item.cardapio === cardapioSelecionado)

  useEffect(() => {
    if (nomesCardapios.length === 0) {
      if (cardapioSelecionado !== 'TODOS') {
        setCardapioSelecionado('TODOS')
      }
      return
    }

    if (cardapioSelecionado !== 'TODOS' && !nomesCardapios.includes(cardapioSelecionado)) {
      setCardapioSelecionado(nomesCardapios[0])
    }
  }, [nomesCardapios, cardapioSelecionado])

  useEffect(() => {
    if (!habitat.id) return
    void loadAlimentacoes(habitat.id)
  }, [habitat.id])

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Habitat: {habitat.nome}</h1>
          <p className="page-subtitle">Gerencie os animais deste habitat</p>
        </div>
        <div className="page-actions">
          <button className="btn-secondary" onClick={onBack}>
            ← Voltar
          </button>
          <button className="btn-primary" onClick={openCreateAnimal}>
            + Novo Animal
          </button>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Carregando animais...</div>
      ) : (
        <>
          <div className="card animals-panel">
            {animals.length === 0 ? (
              <div className="empty">Nenhum animal cadastrado neste habitat.</div>
            ) : (
              <div className="animal-list">
                {animals.map((animal) => {
                  const visual = getSpeciesVisual(animal.especie)
                  return (
                    <div key={animal.id} className="animal-chip">
                      <span
                        className="animal-species-badge"
                        style={{ background: visual.palette.background, color: visual.palette.color }}
                        title={`Espécie: ${animal.especie}`}
                      >
                        {visual.label}
                      </span>
                      <div className="animal-chip-info">
                        <span className="animal-chip-nome">{animal.apelido || animal.nomePopular || 'Sem nome'}</span>
                        <span className="animal-chip-especie">
                          {animal.nomeCientifico ? `${animal.especie} • ${animal.nomeCientifico}` : animal.especie}
                        </span>
                        <div className="animal-chip-meta">
                          {animal.numeroMicrochipOuAnilha && (
                            <span>Microchip/Anilha: {animal.numeroMicrochipOuAnilha}</span>
                          )}
                          {animal.localizacaoMicrochip && (
                            <span>Localização: {animal.localizacaoMicrochip}</span>
                          )}
                          {animal.alimentacao && <span>Alimentação: {animal.alimentacao}</span>}
                          {animal.observacaoSaude && <span>Saúde: {animal.observacaoSaude}</span>}
                          {animal.tratamentosFeitos && <span>Tratamentos: {animal.tratamentosFeitos}</span>}
                        </div>
                      </div>
                      <div className="animal-chip-actions">
                        <button
                          className="animal-chip-edit"
                          onClick={() => openEditAnimal(animal)}
                          title="Editar animal"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          className="animal-chip-remove"
                          onClick={() => handleDeleteAnimal(animal.id)}
                          title="Remover animal"
                        >
                          🗑️ Excluir
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <>
              <div className="page-header" style={{ marginTop: 24, marginBottom: 12 }}>
                <div>
                  <h2 className="page-title" style={{ fontSize: 22 }}>Cardápios do habitat</h2>
                  <p className="page-subtitle">Gerencie a alimentação semanal vinculada ao habitat</p>
                </div>
                <button
                  className="btn-primary"
                  onClick={openCreateCardapio}
                  disabled={!habitat.id}
                  title={habitat.id ? 'Adicionar novo item' : 'Habitat inválido'}
                >
                  + Novo Item
                </button>
              </div>

              {loadingAlimentacoes ? (
                <div className="loading">Carregando alimentações...</div>
              ) : alimentacoes.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📦</div>
                  <p>Nenhuma alimentação registrada para este habitat.</p>
                </div>
              ) : (
                <>
                  <div className="cardapio-filter" style={{ marginBottom: 12 }}>
                    {nomesCardapios.map((nomeCardapio) => (
                      <button
                        key={nomeCardapio}
                        type="button"
                        className={`cardapio-filter-btn ${cardapioSelecionado === nomeCardapio ? 'active' : ''}`}
                        onClick={() => setCardapioSelecionado(nomeCardapio)}
                      >
                        {nomeCardapio}
                      </button>
                    ))}
                    <button
                      type="button"
                      className={`cardapio-filter-btn cardapio-filter-btn-all ${cardapioSelecionado === 'TODOS' ? 'active' : ''}`}
                      onClick={() => setCardapioSelecionado('TODOS')}
                    >
                      Ver todos
                    </button>
                  </div>

                  {cardapiosFiltrados.map(({ cardapio, itens }) => (
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
                  ))}
                </>
              )}
            </>
        </>
      )}

      {showAnimalModal && (
        <div className="modal-overlay" onClick={() => setShowAnimalModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingAnimalId ? 'Editar Animal' : 'Novo Animal'}</h2>
              <button className="modal-close" onClick={() => setShowAnimalModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <label>
                Nome popular <span className="required">*</span>
                <input
                  required
                  value={form.nomePopular}
                  onChange={(e) => setForm((prev) => ({ ...prev, nomePopular: e.target.value }))}
                />
              </label>

              <label>
                Nome científico
                <input
                  value={form.nomeCientifico}
                  onChange={(e) => setForm((prev) => ({ ...prev, nomeCientifico: e.target.value }))}
                />
              </label>

              <label>
                Espécie <span className="required">*</span>
                <input
                  required
                  value={form.especie}
                  onChange={(e) => setForm((prev) => ({ ...prev, especie: e.target.value }))}
                />
              </label>

              <div className="modal-form-row">
                <label>
                  Nº microchip/anilha
                  <input
                    value={form.numeroMicrochipOuAnilha}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        numeroMicrochipOuAnilha: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Localização do microchip
                  <input
                    value={form.localizacaoMicrochip}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        localizacaoMicrochip: e.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              <label>
                Apelido
                <input
                  value={form.apelido}
                  onChange={(e) => setForm((prev) => ({ ...prev, apelido: e.target.value }))}
                />
              </label>

              <label>
                Observação de saúde
                <textarea
                  rows={2}
                  value={form.observacaoSaude}
                  onChange={(e) => setForm((prev) => ({ ...prev, observacaoSaude: e.target.value }))}
                />
              </label>

              <label>
                Tratamentos feitos
                <textarea
                  rows={2}
                  value={form.tratamentosFeitos}
                  onChange={(e) => setForm((prev) => ({ ...prev, tratamentosFeitos: e.target.value }))}
                />
              </label>

              <label>
                Alimentação
                <textarea
                  rows={2}
                  value={form.alimentacao}
                  onChange={(e) => setForm((prev) => ({ ...prev, alimentacao: e.target.value }))}
                />
              </label>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAnimalModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Salvando...' : editingAnimalId ? 'Salvar Alterações' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCardapioModal && (
        <div className="modal-overlay" onClick={() => setShowCardapioModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Novo Item do Cardápio</h2>
              <button className="modal-close" onClick={() => setShowCardapioModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmitCardapio} className="modal-form">
              <label>
                Cardápio <span className="required">*</span>
                <input
                  required
                  placeholder="Ex: Cardápio Semanal Primatas"
                  value={cardapioForm.cardapio}
                  onChange={(e) => setCardapioForm({ ...cardapioForm, cardapio: e.target.value })}
                />
              </label>

              {diasSemanaOptions.map((option) => (
                <label key={option.value}>
                  {option.label}
                  <input
                    placeholder="Ex: Banana, folhas e legumes"
                    value={semanaAlimentacaoForm[option.value]}
                    onChange={(e) =>
                      setSemanaAlimentacaoForm((prev) => ({
                        ...prev,
                        [option.value]: e.target.value,
                      }))
                    }
                  />
                </label>
              ))}

              <div className="modal-buttons">
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar semana'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCardapioModal(false)}
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
