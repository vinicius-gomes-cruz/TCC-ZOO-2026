export const API_BASE = import.meta.env.VITE_API_URL ?? '';

export type PerfilUsuario = 'ADMINISTRADOR' | 'FUNCIONARIO'

export type UsuarioLoginResponse = {
  accessToken: string
  refreshToken: string
  id: number
  nome: string
  email: string
  perfil: PerfilUsuario
}

export type UsuarioAutenticadoResponse = {
  id: number
  nome: string
  email: string
  perfil: PerfilUsuario
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

export async function login(payload: { email: string; senha: string }): Promise<UsuarioLoginResponse> {
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
}

export type BioterioAnotacaoRequestPayload = {
  dataAnotacao?: string | null
  texto: string
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

export async function listarItensEstoque(tipo?: 'ALIMENTO' | 'MATERIAL') {
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

