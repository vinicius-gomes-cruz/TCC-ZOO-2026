export const API_BASE = import.meta.env.VITE_API_URL ?? '';

export async function getHabitats() {
  const res = await fetch(`${API_BASE}/api/habitats`);
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
  return res.json();
}

export async function createHabitat(payload: any) {
  const res = await fetch(`${API_BASE}/api/habitats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
  return res.json();
}

export async function updateHabitat(id: number, payload: any) {
  const res = await fetch(`${API_BASE}/api/habitats/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
  return res.json();
}

export async function deleteHabitat(id: number) {
  const res = await fetch(`${API_BASE}/api/habitats/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
}

/* ── Animais ─────────────────────────────────────────────────── */

export async function getAnimalsByHabitat(habitatId: number) {
  const res = await fetch(`${API_BASE}/api/animais/habitat/${habitatId}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
  return res.json();
}

export async function createAnimal(payload: any) {
  const res = await fetch(`${API_BASE}/api/animais`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
  return res.json();
}

export async function updateAnimal(id: number, payload: any) {
  const res = await fetch(`${API_BASE}/api/animais/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
  return res.json();
}

export async function deleteAnimal(id: number) {
  const res = await fetch(`${API_BASE}/api/animais/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
}

/* ── Estoque de Alimentação ──────────────────────────────────── */

export async function criarAlimentacao(animalId: number, payload: any) {
  const res = await fetch(`${API_BASE}/api/estoque/animal/${animalId}/alimentacao`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
  return res.json();
}

export async function listarAlimentacoesPorAnimal(animalId: number) {
  const res = await fetch(`${API_BASE}/api/estoque/animal/${animalId}/alimentacoes`);
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
  return res.json();
}

export async function listarAlimentacoesAbertas(animalId: number) {
  const res = await fetch(`${API_BASE}/api/estoque/animal/${animalId}/alimentacoes/abertas`);
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
  return res.json();
}

export async function obterAlimentacao(id: number) {
  const res = await fetch(`${API_BASE}/api/estoque/alimentacao/${id}`);
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
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
  return res.json();
}

export async function deletarAlimentacao(id: number) {
  const res = await fetch(`${API_BASE}/api/estoque/alimentacao/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
}

