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
