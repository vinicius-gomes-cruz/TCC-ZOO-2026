import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  createAnimal,
  createCaixa,
  deleteAnimal,
  deleteCaixa,
  enviarRacaoParaBioterio,
  finalizarRacaoNoBioterio,
  getAnimais,
  getCaixas,
  listarRacoesDisponiveis,
  listarRacoesNoBioterio,
  updateCaixa,
  type AnimalResumo,
  type CaixaRequestPayload,
  type ItemEstoqueRacao,
} from '../api'
import BioterioAnotacoesPage from './BioterioAnotacoesPage'

type AnimalDaCaixa = {
  id: number
  nomePopular: string | null
  apelido: string | null
  especie: string | null
  camposBioterio: string | null
} | null

type Caixa = {
  id: number
  numeroCaixa: number | null
  grupoFemeas: string | null
  idadeFemeas: string | null
  crias: string | null
  machosRotativos: string | null
  dataNascimento: string | null
  dataDesmame: string | null
  animal: AnimalDaCaixa
}

type CampoCaixa =
  | 'grupoFemeas'
  | 'idadeFemeas'
  | 'machosRotativos'
  | 'crias'
  | 'dataNascimento'
  | 'dataDesmame'

const OPCOES_CAMPOS: Array<{ key: CampoCaixa; label: string }> = [
  { key: 'grupoFemeas', label: 'Grupo de Fêmeas' },
  { key: 'idadeFemeas', label: 'Idade das Fêmeas' },
  { key: 'machosRotativos', label: 'Grupo de Machos' },
  { key: 'crias', label: 'Crias' },
  { key: 'dataNascimento', label: 'Data de Nascimento' },
  { key: 'dataDesmame', label: 'Data de Desmame' },
]

const CAMPOS_PADRAO: CampoCaixa[] = OPCOES_CAMPOS.map((opcao) => opcao.key)

const textoOuTraco = (valor?: string | null) => {
  const texto = valor?.trim()
  return texto && texto.length > 0 ? texto : '—'
}

const identificadorCaixa = (caixa: Caixa) => caixa.numeroCaixa ?? caixa.id

const nomeAnimal = (animal: AnimalDaCaixa) => {
  if (!animal) return 'Sem animal definido'
  return animal.apelido?.trim() || animal.nomePopular?.trim() || animal.especie?.trim() || 'Animal sem nome'
}

const parseCamposBioterio = (camposBioterio?: string | null): CampoCaixa[] => {
  if (!camposBioterio?.trim()) return CAMPOS_PADRAO

  const campos = camposBioterio
    .split(',')
    .map((valor) => valor.trim() as CampoCaixa)
    .filter((valor) => CAMPOS_PADRAO.includes(valor))

  return campos.length > 0 ? campos : CAMPOS_PADRAO
}

export default function BioterioPage() {
  const [telaInterna, setTelaInterna] = useState<'caixas' | 'anotacoes'>('caixas')
  const [caixas, setCaixas] = useState<Caixa[]>([])
  const [animais, setAnimais] = useState<AnimalResumo[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingCaixa, setEditingCaixa] = useState<Caixa | null>(null)
  const [racoesDisponiveis, setRacoesDisponiveis] = useState<ItemEstoqueRacao[]>([])
  const [racoesNoBioterio, setRacoesNoBioterio] = useState<ItemEstoqueRacao[]>([])
  const [showPegarRacao, setShowPegarRacao] = useState(false)
  const [racaoSelecionada, setRacaoSelecionada] = useState('')
  const [pacotesParaEnviar, setPacotesParaEnviar] = useState('')
  const [animalFiltroId, setAnimalFiltroId] = useState('')
  const [showNovoAnimalModal, setShowNovoAnimalModal] = useState(false)
  const [novoAnimalNome, setNovoAnimalNome] = useState('')
  const [novoAnimalCampos, setNovoAnimalCampos] = useState<CampoCaixa[]>(CAMPOS_PADRAO)
  const [savingAnimal, setSavingAnimal] = useState(false)
  const [deletingAnimal, setDeletingAnimal] = useState(false)
  const [form, setForm] = useState({
    animalId: '',
    numeroCaixa: '',
    camposHabilitados: CAMPOS_PADRAO,
    grupoFemeas: '',
    idadeFemeas: '',
    crias: '',
    machosRotativos: '',
    dataNascimento: '',
    dataDesmame: '',
  })

  const load = () => {
    setLoading(true)
    setError(null)

    getCaixas()
      .then((list) => setCaixas(Array.isArray(list) ? (list as Caixa[]) : []))
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false))

    listarRacoesDisponiveis()
      .then((list) => setRacoesDisponiveis(Array.isArray(list) ? list : []))
      .catch(() => setRacoesDisponiveis([]))

    listarRacoesNoBioterio()
      .then((list) => setRacoesNoBioterio(Array.isArray(list) ? list : []))
      .catch(() => setRacoesNoBioterio([]))

    getAnimais()
      .then((list) => {
        const animaisLista = Array.isArray(list) ? list : []
        const animaisOrdenados = animaisLista
          .slice()
          .sort((a, b) => nomeAnimal(a).localeCompare(nomeAnimal(b), 'pt-BR'))

        setAnimais(animaisOrdenados)
        setAnimalFiltroId((atual) => {
          if (atual && animaisOrdenados.some((animal) => String(animal.id) === atual)) {
            return atual
          }
          return animaisOrdenados[0] ? String(animaisOrdenados[0].id) : ''
        })
      })
      .catch(() => setAnimais([]))
  }

  useEffect(load, [])

  const handleCreateCaixaDireto = async () => {
    if (!animalFiltroId) {
      setError('Selecione um animal antes de criar a caixa.')
      return
    }

    try {
      setSaving(true)
      setError(null)
      await createCaixa({ animalId: Number(animalFiltroId) })
      load()
    } catch (e) {
      setError(String(e))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (caixa: Caixa) => {
    if (!window.confirm(`Deseja excluir a Caixa #${identificadorCaixa(caixa)}?`)) return

    try {
      setSaving(true)
      setError(null)
      await deleteCaixa(caixa.id)
      load()
    } catch (e) {
      setError(String(e))
    } finally {
      setSaving(false)
    }
  }

  const openEdit = (caixa: Caixa) => {
    setError(null)
    setEditingCaixa(caixa)
    const campos = parseCamposBioterio(caixa.animal?.camposBioterio)
    setForm({
      animalId: caixa.animal?.id ? String(caixa.animal.id) : '',
      numeroCaixa: caixa.numeroCaixa ? String(caixa.numeroCaixa) : '',
      camposHabilitados: campos,
      grupoFemeas: caixa.grupoFemeas ?? '',
      idadeFemeas: caixa.idadeFemeas ?? '',
      crias: caixa.crias ?? '',
      machosRotativos: caixa.machosRotativos ?? '',
      dataNascimento: caixa.dataNascimento ?? '',
      dataDesmame: caixa.dataDesmame ?? '',
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingCaixa(null)
  }

  const handleCriarAnimal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nome = novoAnimalNome.trim()
    if (!nome) {
      setError('Informe o nome do animal.')
      return
    }

    if (novoAnimalCampos.length === 0) {
      setError('Selecione ao menos um campo para o animal.')
      return
    }

    try {
      setSavingAnimal(true)
      setError(null)
      const animalCriado = await createAnimal({
        nomePopular: nome,
        camposBioterio: novoAnimalCampos.join(','),
      }) as AnimalResumo

      const novaLista = [...animais, animalCriado].sort((a, b) => nomeAnimal(a).localeCompare(nomeAnimal(b), 'pt-BR'))
      setAnimais(novaLista)
      setAnimalFiltroId(String(animalCriado.id))
      setNovoAnimalNome('')
      setNovoAnimalCampos(CAMPOS_PADRAO)
      setShowNovoAnimalModal(false)
    } catch (e) {
      setError(String(e))
    } finally {
      setSavingAnimal(false)
    }
  }

  const handleChangeAnimal = (animalId: string) => {
    const animalSelecionado = animais.find((animal) => String(animal.id) === animalId)
    setForm((prev) => ({
      ...prev,
      animalId,
      camposHabilitados: parseCamposBioterio(animalSelecionado?.camposBioterio),
    }))
  }

  const handleExcluirAnimalSelecionado = async () => {
    if (!animalFiltroId) return

    const animalSelecionado = animais.find((animal) => String(animal.id) === animalFiltroId)
    if (!animalSelecionado) return

    const totalCaixas = caixas.filter((caixa) => String(caixa.animal?.id ?? '') === animalFiltroId).length
    if (totalCaixas > 0) {
      setError('Não é possível excluir este animal porque existem caixas vinculadas. Exclua as caixas primeiro.')
      return
    }

    if (!window.confirm(`Deseja excluir o animal "${nomeAnimal(animalSelecionado)}"?`)) return

    try {
      setDeletingAnimal(true)
      setError(null)
      await deleteAnimal(Number(animalFiltroId))

      const novaLista = animais.filter((animal) => String(animal.id) !== animalFiltroId)
      setAnimais(novaLista)
      setAnimalFiltroId(novaLista[0] ? String(novaLista[0].id) : '')
    } catch (e) {
      setError(String(e))
    } finally {
      setDeletingAnimal(false)
    }
  }

  const alternarCampoNovoAnimal = (campo: CampoCaixa) => {
    setNovoAnimalCampos((prev) => {
      if (prev.includes(campo)) {
        return prev.filter((item) => item !== campo)
      }
      return [...prev, campo]
    })
  }

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const animalId = Number(form.animalId)
    if (!animalId) {
      setError('Selecione o animal da caixa.')
      return
    }

    const numeroCaixa = form.numeroCaixa.trim() ? Number(form.numeroCaixa) : null
    if (numeroCaixa !== null && (!Number.isInteger(numeroCaixa) || numeroCaixa <= 0)) {
      setError('Número da caixa deve ser um número inteiro positivo.')
      return
    }

    const payload: CaixaRequestPayload = {
      numeroCaixa,
      animalId,
      grupoFemeas: form.grupoFemeas.trim() || null,
      idadeFemeas: form.idadeFemeas.trim() || null,
      crias: form.crias.trim() || null,
      machosRotativos: form.machosRotativos.trim() || null,
      dataNascimento: form.dataNascimento || null,
      dataDesmame: form.dataDesmame || null,
    }

    try {
      setSaving(true)
      setError(null)

      if (editingCaixa) {
        await updateCaixa(editingCaixa.id, payload)
      }

      closeModal()
      load()
    } catch (e) {
      setError(String(e))
    } finally {
      setSaving(false)
    }
  }

  const handleEnviarParaBioterio = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const id = Number(racaoSelecionada)
    const pacotes = Number(pacotesParaEnviar)
    if (!id) {
      setError('Selecione uma ração')
      return
    }
    if (!Number.isInteger(pacotes) || pacotes <= 0) {
      setError('Informe um número inteiro de pacotes válido')
      return
    }
    try {
      setSaving(true)
      setError(null)
      await enviarRacaoParaBioterio(id, pacotes)
      setShowPegarRacao(false)
      setRacaoSelecionada('')
      setPacotesParaEnviar('')
      load()
    } catch (e) {
      setError('Não foi possível enviar a ração para o biotério.')
    } finally {
      setSaving(false)
    }
  }

  const handleFinalizarRacao = async (id: number) => {
    if (!window.confirm('Confirma que esta ração acabou? Ela será removida do estoque.')) return

    try {
      setSaving(true)
      setError(null)
      await finalizarRacaoNoBioterio(id)
      load()
    } catch (e) {
      setError('Não foi possível finalizar a ração.')
    } finally {
      setSaving(false)
    }
  }

  const animalSelecionado = animais.find((animal) => String(animal.id) === animalFiltroId) ?? null
  const camposVisiveisAnimal = parseCamposBioterio(animalSelecionado?.camposBioterio)
  const exibirCampo = (campo: CampoCaixa) => camposVisiveisAnimal.includes(campo)

  const caixasFiltradas = animalFiltroId
    ? caixas
      .filter((caixa) => String(caixa.animal?.id ?? '') === animalFiltroId)
      .slice()
      .sort((a, b) => {
        const numeroA = a.numeroCaixa ?? Number.MAX_SAFE_INTEGER
        const numeroB = b.numeroCaixa ?? Number.MAX_SAFE_INTEGER
        if (numeroA !== numeroB) return numeroA - numeroB
        return a.id - b.id
      })
    : []

  if (telaInterna === 'anotacoes') {
    return <BioterioAnotacoesPage onVoltar={() => setTelaInterna('caixas')} />
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bioterio</h1>
          <p className="page-subtitle">Gerencie as caixas do biotério</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" onClick={() => setTelaInterna('anotacoes')}>
            Ver anotações
          </button>
          <button className="btn-primary" onClick={handleCreateCaixaDireto} disabled={saving}>
            + Nova Caixa
          </button>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="table-container" style={{ marginBottom: 16, padding: 16 }}>
        <h2 className="section-title" style={{ marginTop: 0 }}>Ração no biotério</h2>

        {racoesNoBioterio.length === 0 ? (
          <p style={{ marginTop: 0 }}>Nenhuma ração no biotério no momento.</p>
        ) : (
          <table className="table" style={{ marginBottom: 16 }}>
            <thead>
              <tr>
                <th>Ração</th>
                <th>Pacotes</th>
                <th>Peso Total</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {racoesNoBioterio.map((r) => (
                <tr key={r.id}>
                  <td className="font-weight-bold">{r.nome}</td>
                  <td>{r.quantidadePacotes ?? '—'}</td>
                  <td>{r.quantidade} {r.unidade}</td>
                  <td>
                    <button className="btn-secondary" onClick={() => handleFinalizarRacao(r.id)} disabled={saving}>
                      Acabou
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {racoesDisponiveis.length > 0 && (
          <button className="btn-primary" style={{ marginTop: 8 }} onClick={() => setShowPegarRacao(true)} disabled={saving}>
            Pegar ração do estoque
          </button>
        )}

        {showPegarRacao && (
          <div className="modal-overlay" onClick={() => setShowPegarRacao(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Pegar ração do estoque</h2>
                <button className="modal-close" onClick={() => setShowPegarRacao(false)} aria-label="Fechar modal">
                  ✕
                </button>
              </div>

              {error && <div className="alert-error">{error}</div>}

              <form className="modal-form" onSubmit={handleEnviarParaBioterio}>
                <label>
                  Ração
                  <select
                    value={racaoSelecionada}
                    onChange={(e) => setRacaoSelecionada(e.target.value)}
                    required
                  >
                    <option value="">Selecione...</option>
                    {racoesDisponiveis.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nome} ({r.quantidadePacotes} pacotes - {r.quantidade} {r.unidade})
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Quantidade de pacotes
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    placeholder="Ex: 2"
                    value={pacotesParaEnviar}
                    onChange={(e) => setPacotesParaEnviar(e.target.value)}
                  />
                </label>

                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowPegarRacao(false)} disabled={saving}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Enviando...' : 'Confirmar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {!loading && (
        <div className="table-container bioterio-filtro-card">
          <div className="page-header bioterio-filtro-header">
            <label className="bioterio-filtro-field">
              Animal
              <select
                value={animalFiltroId}
                onChange={(e) => setAnimalFiltroId(e.target.value)}
                disabled={animais.length === 0}
              >
                {animais.length === 0 ? (
                  <option value="">Nenhum animal cadastrado</option>
                ) : (
                  animais.map((animal) => (
                    <option key={animal.id} value={animal.id}>
                      {nomeAnimal(animal)}
                    </option>
                  ))
                )}
              </select>
            </label>

            <div className="page-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleExcluirAnimalSelecionado}
                disabled={animais.length === 0 || deletingAnimal || savingAnimal}
              >
                {deletingAnimal ? 'Excluindo...' : 'Excluir Animal'}
              </button>
              <button type="button" className="btn-primary" onClick={() => setShowNovoAnimalModal(true)}>
                + Adicionar Animal
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : caixas.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🧬</div>
          <p>Nenhuma caixa cadastrada. Clique em "+ Nova Caixa" para começar.</p>
        </div>
      ) : (
        <>
        <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Caixa</th>
              {exibirCampo('grupoFemeas') && <th>Grupo de Fêmeas</th>}
              {exibirCampo('machosRotativos') && <th>Grupo de Machos</th>}
              {exibirCampo('crias') && <th>Crias</th>}
              {exibirCampo('dataNascimento') && <th>Data de Nascimento</th>}
              {exibirCampo('dataDesmame') && <th>Data de Desmame</th>}
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {caixasFiltradas.map((caixa) => (
              <tr key={caixa.id}>
                <td>#{identificadorCaixa(caixa)}</td>
                {exibirCampo('grupoFemeas') && <td>{textoOuTraco(caixa.grupoFemeas)}</td>}
                {exibirCampo('machosRotativos') && <td>{textoOuTraco(caixa.machosRotativos)}</td>}
                {exibirCampo('crias') && <td>{textoOuTraco(caixa.crias)}</td>}
                {exibirCampo('dataNascimento') && <td>{textoOuTraco(caixa.dataNascimento)}</td>}
                {exibirCampo('dataDesmame') && <td>{textoOuTraco(caixa.dataDesmame)}</td>}
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-secondary" onClick={() => openEdit(caixa)} disabled={saving}>
                      Editar
                    </button>
                    <button className="btn-secondary" onClick={() => handleDelete(caixa)} disabled={saving}>
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        </>
      )}

      {showNovoAnimalModal && (
        <div className="modal-overlay" onClick={() => setShowNovoAnimalModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Adicionar animal</h2>
              <button className="modal-close" onClick={() => setShowNovoAnimalModal(false)} aria-label="Fechar modal">
                ✕
              </button>
            </div>

            {error && <div className="alert-error">{error}</div>}

            <form className="modal-form" onSubmit={handleCriarAnimal}>
              <label>
                Nome do animal
                <input
                  value={novoAnimalNome}
                  onChange={(e) => setNovoAnimalNome(e.target.value)}
                  placeholder="Ex: Camundongo Branco"
                  required
                />
              </label>

              <fieldset className="bioterio-checkbox-fieldset">
                <legend className="bioterio-checkbox-legend">
                  Campos necessários para o animal
                </legend>

                <div className="bioterio-checkbox-list">
                  {OPCOES_CAMPOS.map((opcao) => (
                    <label key={opcao.key} className="bioterio-checkbox-item">
                      <input
                        type="checkbox"
                        className="bioterio-checkbox-input"
                        checked={novoAnimalCampos.includes(opcao.key)}
                        onChange={() => alternarCampoNovoAnimal(opcao.key)}
                      />
                      {opcao.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowNovoAnimalModal(false)} disabled={savingAnimal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={savingAnimal}>
                  {savingAnimal ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{`Editar Caixa #${editingCaixa ? identificadorCaixa(editingCaixa) : ''}`}</h2>
              <button className="modal-close" onClick={closeModal} aria-label="Fechar modal">
                ✕
              </button>
            </div>

            {error && <div className="alert-error">{error}</div>}

            <form className="modal-form" onSubmit={handleSave}>
              <label>
                Animal da caixa
                <select
                  value={form.animalId}
                  onChange={(e) => handleChangeAnimal(e.target.value)}
                  required
                >
                  <option value="">Selecione...</option>
                  {animais.map((animal) => (
                    <option key={animal.id} value={animal.id}>
                      {nomeAnimal(animal)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Número da caixa (opcional)
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.numeroCaixa}
                  onChange={(e) => setForm((prev) => ({ ...prev, numeroCaixa: e.target.value }))}
                />
              </label>

              {form.camposHabilitados.includes('grupoFemeas') && (
              <label>
                Grupo de Fêmeas
                <input
                  value={form.grupoFemeas}
                  onChange={(e) => setForm((prev) => ({ ...prev, grupoFemeas: e.target.value }))}
                />
              </label>
              )}

              {form.camposHabilitados.includes('idadeFemeas') && (
                <label>
                  Idade das Fêmeas
                  <input
                    value={form.idadeFemeas}
                    onChange={(e) => setForm((prev) => ({ ...prev, idadeFemeas: e.target.value }))}
                  />
                </label>
              )}

              {form.camposHabilitados.includes('crias') && (
                <label>
                  Crias
                  <textarea
                    rows={3}
                    value={form.crias}
                    onChange={(e) => setForm((prev) => ({ ...prev, crias: e.target.value }))}
                  />
                </label>
              )}

              {form.camposHabilitados.includes('machosRotativos') && (
                <label>
                  Grupo de Machos
                  <input
                    value={form.machosRotativos}
                    onChange={(e) => setForm((prev) => ({ ...prev, machosRotativos: e.target.value }))}
                  />
                </label>
              )}

              {form.camposHabilitados.includes('dataNascimento') && (
                <label>
                  Data de Nascimento
                  <input
                    type="date"
                    value={form.dataNascimento}
                    onChange={(e) => setForm((prev) => ({ ...prev, dataNascimento: e.target.value }))}
                  />
                </label>
              )}

              {form.camposHabilitados.includes('dataDesmame') && (
                <label>
                  Data de Desmame
                  <input
                    type="date"
                    value={form.dataDesmame}
                    onChange={(e) => setForm((prev) => ({ ...prev, dataDesmame: e.target.value }))}
                  />
                </label>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal} disabled={saving}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}