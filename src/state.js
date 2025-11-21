import { createToast } from './ui.js';

const colors = ['#8b5cf6', '#f97316', '#22d3ee', '#22c55e', '#ef4444', '#6366f1', '#14b8a6', '#f59e0b'];

export const appState = {
  prompts: [],
  tags: {},
  activeId: null,
  theme: 'night',
  language: 'es',
  view: 'grid',
  order: 'recent',
  provider: null,
  providerName: 'Local',
  accessToken: null,
};

export function createTag(name) {
  const existingKey = Object.keys(appState.tags).find((key) => key.toLowerCase() === name.toLowerCase());
  const key = existingKey ?? name;
  if (!appState.tags[key]) {
    appState.tags[key] = { color: colors[Math.floor(Math.random() * colors.length)] };
  }
  return key;
}

export function renameTag(oldName, newName) {
  const entry = appState.tags[oldName];
  if (!entry) return;
  delete appState.tags[oldName];
  appState.tags[newName] = entry;
  appState.prompts = appState.prompts.map((p) => ({ ...p, tags: p.tags.map((t) => (t === oldName ? newName : t)) }));
}

export function deleteTag(name) {
  delete appState.tags[name];
  appState.prompts = appState.prompts.map((p) => ({ ...p, tags: p.tags.filter((t) => t !== name) }));
}

export function savePrompt(data) {
  if (appState.activeId) {
    const idx = appState.prompts.findIndex((p) => p.id === appState.activeId);
    if (idx >= 0) appState.prompts[idx] = { ...appState.prompts[idx], ...data, updatedAt: Date.now() };
    appState.activeId = null;
  } else {
    appState.prompts.unshift({ ...data, id: crypto.randomUUID(), createdAt: Date.now(), updatedAt: Date.now(), uses: 0 });
  }
}

export function deletePrompt(id) {
  appState.prompts = appState.prompts.filter((p) => p.id !== id);
}

export function orderPrompts() {
  const list = [...appState.prompts];
  switch (appState.order) {
    case 'alpha':
      return list.sort((a, b) => a.title.localeCompare(b.title));
    case 'usage':
      return list.sort((a, b) => b.uses - a.uses);
    default:
      return list.sort((a, b) => b.updatedAt - a.updatedAt);
  }
}

export function serializeToXml() {
  const doc = ['<prompts>'];
  appState.prompts.forEach((p) => {
    doc.push(`<prompt id="${p.id}">`);
    doc.push(`<title>${escapeXml(p.title ?? '')}</title>`);
    doc.push(`<text>${escapeXml(p.text)}</text>`);
    doc.push(`<notes>${escapeXml(p.notes ?? '')}</notes>`);
    doc.push(`<tags>${p.tags.map((t) => escapeXml(t)).join(',')}</tags>`);
    doc.push(`<updatedAt>${p.updatedAt}</updatedAt>`);
    doc.push(`<uses>${p.uses}</uses>`);
    doc.push('</prompt>');
  });
  doc.push('</prompts>');
  return doc.join('');
}

export function importFromXml(xmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'application/xml');
  const nodes = doc.querySelectorAll('prompt');
  const imported = [];
  nodes.forEach((node) => {
    const id = node.getAttribute('id') ?? crypto.randomUUID();
    const title = node.querySelector('title')?.textContent ?? '';
    const text = node.querySelector('text')?.textContent ?? '';
    const notes = node.querySelector('notes')?.textContent ?? '';
    const tags = (node.querySelector('tags')?.textContent ?? '')
      .split(',')
      .filter(Boolean)
      .map((tag) => createTag(tag));
    const updatedAt = Number(node.querySelector('updatedAt')?.textContent ?? Date.now());
    const uses = Number(node.querySelector('uses')?.textContent ?? 0);
    imported.push({ id, title, text, notes, tags, updatedAt, createdAt: updatedAt, uses });
  });
  appState.prompts = imported.sort((a, b) => b.updatedAt - a.updatedAt);
  createToast('Importación completada');
}

export function usePrompt(id) {
  const prompt = appState.prompts.find((p) => p.id === id);
  if (prompt) prompt.uses += 1;
}

export function setProvider(provider, name, token) {
  appState.provider = provider;
  appState.providerName = name;
  appState.accessToken = token;
}

function escapeXml(text) {
  return text.replace(/[<>&'\"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]));
}
