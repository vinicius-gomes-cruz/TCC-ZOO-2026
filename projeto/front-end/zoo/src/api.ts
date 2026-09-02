export const API_BASE = import.meta.env.VITE_API_URL ?? '';

export type PerfilUsuario = 'ADMINISTRADOR' | 'FUNCIONARIO'

export type UsuarioLoginResponse = {
  accessToken: string
  refreshToken: string
  id: number
  nome: string
  usuario: string
  perfil: PerfilUsuario
}

export type UsuarioAutenticadoResponse = {
  id: number
  nome: string
  usuario: string
  perfil: PerfilUsuario
}

export type UsuarioSistemaResponse = {
  id: number
  nome: string
  usuario: string
  perfil: PerfilUsuario
  ativo: boolean
}

export type UsuarioSistemaRequest = {
  nome: string
  usuario: string
  senha?: string
  perfil: PerfilUsuario
  ativo: boolean
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status} - ${res.statusText}${text ? `: ${text}` : ''}`)
  }

  if (res.status === 204) return null

  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return res.json()
  }

  return res.text()
}

/* ── Autenticação ───────────────────────────────────────────── */

export async function login(payload: { usuario: string; senha: string }): Promise<UsuarioLoginResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  })
  return handleResponse(res)
}

export async function refresh(): Promise<UsuarioLoginResponse> {
  const res = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })
  return handleResponse(res)
}

export async function obterUsuarioAutenticado(): Promise<UsuarioAutenticadoResponse> {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    credentials: 'include',
  })
  return handleResponse(res)
}

export async function logout(): Promise<void> {
  const res = await fetch(`${API_BASE}/api/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })

  if (!res.ok && res.status !== 401) {
    throw new Error(`HTTP ${res.status} - ${res.statusText}`)
  }
}

/* ── Usuários (somente admin) ─────────────────────────────── */

export async function listarUsuarios(): Promise<UsuarioSistemaResponse[]> {
  const res = await fetch(`${API_BASE}/api/usuarios`, {
    credentials: 'include',
  })
  return handleResponse(res)
}

export async function criarUsuario(payload: UsuarioSistemaRequest): Promise<UsuarioSistemaResponse> {
  const res = await fetch(`${API_BASE}/api/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  })
  return handleResponse(res)
}

export async function atualizarUsuario(id: number, payload: UsuarioSistemaRequest): Promise<UsuarioSistemaResponse> {
  const res = await fetch(`${API_BASE}/api/usuarios/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  })
  return handleResponse(res)
}

export async function excluirUsuario(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/usuarios/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`)
}

/* ── Habitats ────────────────────────────────────────────── */

export async function getHabitats() {
  const res = await fetch(`${API_BASE}/api/habitats`, {
    credentials: 'include',
  })
  return handleResponse(res)
}

export async function createHabitat(payload: any) {
  const res = await fetch(`${API_BASE}/api/habitats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  })
  return handleResponse(res)
}

export async function updateHabitat(id: number, payload: any) {
  const res = await fetch(`${API_BASE}/api/habitats/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  })
  return handleResponse(res)
}

export async function deleteHabitat(id: number) {
  const res = await fetch(`${API_BASE}/api/habitats/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`)
}

/* ── Biotério (Caixas) ─────────────────────────────────────── */

export type CaixaRequestPayload = {
  numeroCaixa?: number | null
  grupoFemeas?: string | null
  idadeFemeas?: string | null
  crias?: string | null
  machosRotativos?: string | null
  dataNascimento?: string | null
  dataDesmame?: string | null
  animalId?: number | null
}

export type AnimalResumo = {
  id: number
  nomePopular: string | null
  apelido: string | null
  especie: string | null
  camposBioterio: string | null
}

export type BioterioAnotacaoRequestPayload = {
  dataAnotacao?: string | null
  texto: string
}

export type ItemEstoqueRacao = {
  id: number
  nome: string
  quantidade: number
  unidade: string
  dataEntrada: string
  noBioterio: boolean
  quantidadePacotes: number | null
  pesoPorPacote: number | null
}

export async function getCaixas() {
  const res = await fetch(`${API_BASE}/api/caixas`, {
    credentials: 'include',
  })
  return handleResponse(res)
}

export async function createCaixa(payload: CaixaRequestPayload) {
  const res = await fetch(`${API_BASE}/api/caixas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  })
  return handleResponse(res)
}

export async function updateCaixa(id: number, payload: CaixaRequestPayload) {
  const res = await fetch(`${API_BASE}/api/caixas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  })
  return handleResponse(res)
}

export async function deleteCaixa(id: number) {
  const res = await fetch(`${API_BASE}/api/caixas/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} - ${res.statusText}`)
  }
}

export async function getBioterioAnotacoes(data?: string) {
  const query = data ? `?data=${encodeURIComponent(data)}` : ''
  const res = await fetch(`${API_BASE}/api/bioterio/anotacoes${query}`, {
    credentials: 'include',
  })
  return handleResponse(res)
}

export async function createBioterioAnotacao(payload: BioterioAnotacaoRequestPayload) {
  const res = await fetch(`${API_BASE}/api/bioterio/anotacoes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  })
  return handleResponse(res)
}

export async function updateBioterioAnotacao(id: number, payload: BioterioAnotacaoRequestPayload) {
  const res = await fetch(`${API_BASE}/api/bioterio/anotacoes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  })
  return handleResponse(res)
}

export async function deleteBioterioAnotacao(id: number) {
  const res = await fetch(`${API_BASE}/api/bioterio/anotacoes/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} - ${res.statusText}`)
  }
}

export async function getAnimalsByHabitat(habitatId: number) {
  const res = await fetch(`${API_BASE}/api/animais/habitat/${habitatId}`, {
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function getAnimais(): Promise<AnimalResumo[]> {
  const res = await fetch(`${API_BASE}/api/animais`, {
    credentials: 'include',
  })
  return handleResponse(res)
}

export async function updateCamposBioterioAnimal(animalId: number, camposBioterio: string): Promise<AnimalResumo> {
  const res = await fetch(`${API_BASE}/api/animais/${animalId}/campos-bioterio`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ camposBioterio }),
    credentials: 'include',
  })
  return handleResponse(res)
}

export async function createAnimal(payload: any) {
  const res = await fetch(`${API_BASE}/api/animais`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function updateAnimal(id: number, payload: any) {
  const res = await fetch(`${API_BASE}/api/animais/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function deleteAnimal(id: number) {
  const res = await fetch(`${API_BASE}/api/animais/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
}

/* ── Estoque geral (Alimentos/Materiais) ───────────────────── */

export async function listarItensEstoque(tipo?: 'ALIMENTO' | 'MATERIAL' | 'RACAO') {
  const query = tipo ? `?tipo=${tipo}` : ''
  const res = await fetch(`${API_BASE}/api/estoque/itens${query}`, {
    credentials: 'include',
  })
  return handleResponse(res)
}

export async function criarItemEstoque(payload: any) {
  const res = await fetch(`${API_BASE}/api/estoque/itens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  })
  return handleResponse(res)
}

export async function deletarItemEstoque(id: number) {
  const res = await fetch(`${API_BASE}/api/estoque/itens/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`)
}

export async function adicionarPacotesEstoque(id: number, pacotes: number) {
  const res = await fetch(`${API_BASE}/api/estoque/itens/${id}/adicionar-pacotes`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pacotes }),
    credentials: 'include',
  })
  return handleResponse(res)
}

export async function listarRacoesDisponiveis(): Promise<ItemEstoqueRacao[]> {
  const res = await fetch(`${API_BASE}/api/estoque/racao/disponiveis`, {
    credentials: 'include',
  })
  return handleResponse(res)
}

export async function listarRacoesNoBioterio(): Promise<ItemEstoqueRacao[]> {
  const res = await fetch(`${API_BASE}/api/estoque/racao/no-bioterio`, {
    credentials: 'include',
  })
  return handleResponse(res)
}

export async function enviarRacaoParaBioterio(id: number, pacotes: number): Promise<ItemEstoqueRacao> {
  const res = await fetch(`${API_BASE}/api/estoque/itens/${id}/enviar-bioterio`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pacotes }),
    credentials: 'include',
  })
  return handleResponse(res)
}

export async function finalizarRacaoNoBioterio(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/estoque/itens/${id}/finalizar-bioterio`, {
    method: 'PATCH',
    credentials: 'include',
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`)
}

/* ── Estoque de Alimentação ──────────────────────────────────── */

export async function criarAlimentacaoPorHabitat(habitatId: number, payload: any) {
  const res = await fetch(`${API_BASE}/api/estoque/habitat/${habitatId}/alimentacao`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function listarAlimentacoesPorHabitat(habitatId: number) {
  const res = await fetch(`${API_BASE}/api/estoque/habitat/${habitatId}/alimentacoes`, {
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function listarAlimentacoesAbertasPorHabitat(habitatId: number) {
  const res = await fetch(`${API_BASE}/api/estoque/habitat/${habitatId}/alimentacoes/abertas`, {
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function criarAlimentacao(animalId: number, payload: any) {
  const res = await fetch(`${API_BASE}/api/estoque/animal/${animalId}/alimentacao`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function listarAlimentacoesPorAnimal(animalId: number) {
  const res = await fetch(`${API_BASE}/api/estoque/animal/${animalId}/alimentacoes`, {
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function listarAlimentacoesAbertas(animalId: number) {
  const res = await fetch(`${API_BASE}/api/estoque/animal/${animalId}/alimentacoes/abertas`, {
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function obterAlimentacao(id: number) {
  const res = await fetch(`${API_BASE}/api/estoque/alimentacao/${id}`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
  return res.json();
}

export async function updateAlimentacao(id: number, payload: any) {
  const res = await fetch(`${API_BASE}/api/estoque/alimentacao/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`)
  return res.json()
}

export async function registrarAberturaAlimentacao(id: number, data?: string) {
  const url = data 
    ? `${API_BASE}/api/estoque/alimentacao/${id}/abrir?data=${data}`
    : `${API_BASE}/api/estoque/alimentacao/${id}/abrir`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
  return res.json();
}

export async function registrarTerminoAlimentacao(id: number, data?: string) {
  const url = data
    ? `${API_BASE}/api/estoque/alimentacao/${id}/terminar?data=${data}`
    : `${API_BASE}/api/estoque/alimentacao/${id}/terminar`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
  return res.json();
}

export async function deletarAlimentacao(id: number) {
  const res = await fetch(`${API_BASE}/api/estoque/alimentacao/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
}

