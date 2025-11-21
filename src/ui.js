import { appState, deletePrompt, savePrompt, createTag, renameTag, deleteTag, orderPrompts, usePrompt } from './state.js';

export function renderTagList() {
  const list = document.querySelector('#tag-list');
  list.innerHTML = '';
  Object.entries(appState.tags).forEach(([name, meta]) => {
    const li = document.createElement('li');
    li.className = 'tag-pill';
    const color = document.createElement('div');
    color.className = 'tag-color';
    color.style.background = meta.color;
    color.addEventListener('click', () => {
      const picker = document.createElement('input');
      picker.type = 'color';
      picker.value = meta.color;
      picker.addEventListener('input', (e) => { meta.color = e.target.value; renderLibrary(); });
      picker.click();
    });
    const nameSpan = document.createElement('span');
    nameSpan.textContent = name;
    nameSpan.contentEditable = true;
    nameSpan.addEventListener('blur', (e) => { renameTag(name, e.target.textContent.trim()); renderLibrary(); renderTagList(); });
    const del = document.createElement('button');
    del.className = 'ghost';
    del.textContent = '✕';
    del.addEventListener('click', () => { deleteTag(name); renderLibrary(); renderTagList(); });
    li.append(color, nameSpan, del);
    list.appendChild(li);
  });
}

export function renderLibrary() {
  const container = document.querySelector('#library');
  container.className = appState.view === 'grid' ? 'grid' : 'list';
  container.innerHTML = '';
  orderPrompts().forEach((prompt) => {
    const card = document.createElement('article');
    card.className = 'prompt-card';
    card.dataset.id = prompt.id;
    const accent = document.createElement('div');
    accent.className = 'accent-top';
    accent.style.background = appState.tags[prompt.tags[0]]?.color ?? 'transparent';
    const header = document.createElement('div');
    header.className = 'prompt-header';
    const title = document.createElement('h3');
    title.className = 'prompt-title';
    title.textContent = prompt.title || 'Sin título';
    const handle = document.createElement('span');
    handle.className = 'drag-handle';
    handle.textContent = '↕';
    header.append(title, handle);
    const tags = document.createElement('div');
    tags.className = 'prompt-tags';
    prompt.tags.forEach((tag) => {
      const pill = document.createElement('span');
      pill.className = 'tag-pill';
      pill.textContent = tag;
      pill.style.background = appState.tags[tag]?.color + '22';
      tags.appendChild(pill);
    });
    const body = document.createElement('div');
    body.className = 'prompt-body';
    body.textContent = prompt.text;
    const actions = document.createElement('div');
    actions.className = 'prompt-actions';
    const copy = document.createElement('button');
    copy.className = 'ghost';
    copy.textContent = 'Copiar';
    copy.addEventListener('click', async () => { await navigator.clipboard.writeText(prompt.text); usePrompt(prompt.id); createToast('Copiado'); renderLibrary(); });
    const edit = document.createElement('button');
    edit.className = 'ghost';
    edit.textContent = 'Editar';
    edit.addEventListener('click', () => fillForm(prompt));
    const del = document.createElement('button');
    del.className = 'ghost';
    del.textContent = 'Eliminar';
    del.addEventListener('click', () => { const removed = prompt; deletePrompt(prompt.id); createToast('Eliminado', () => { appState.prompts.unshift(removed); renderLibrary(); }); renderLibrary(); });
    actions.append(copy, edit, del);
    card.append(accent, header, tags, body, actions);
    container.appendChild(card);
  });
  enableDrag(container);
}

export function fillForm(prompt) {
  document.querySelector('#title').value = prompt.title;
  document.querySelector('#text').value = prompt.text;
  document.querySelector('#notes').value = prompt.notes;
  document.querySelector('#tags').value = prompt.tags.join(', ');
  appState.activeId = prompt.id;
  document.querySelector('#submit-btn').textContent = 'Actualizar';
}

export function resetForm() {
  document.querySelector('#prompt-form').reset();
  appState.activeId = null;
  document.querySelector('#submit-btn').textContent = 'Añadir';
}

export function createToast(message, undo) {
  const container = document.querySelector('#toast-container');
  container.innerHTML = '';
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  if (undo) {
    const btn = document.createElement('button');
    btn.textContent = 'Deshacer';
    btn.addEventListener('click', () => { undo(); toast.remove(); });
    toast.appendChild(btn);
  }
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

function enableDrag(container) {
  let dragged;
  container.querySelectorAll('.prompt-card').forEach((card) => {
    card.draggable = true;
    card.addEventListener('dragstart', () => { dragged = card; card.classList.add('dragging'); });
    card.addEventListener('dragend', () => { dragged = null; card.classList.remove('dragging'); });
  });
  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    const after = getAfterElement(container, e.clientY);
    if (after == null) {
      container.appendChild(dragged);
    } else {
      container.insertBefore(dragged, after);
    }
  });
  container.addEventListener('drop', () => {
    const ids = [...container.querySelectorAll('.prompt-card')].map((c) => c.dataset.id);
    appState.prompts.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
  });
}

function getAfterElement(container, y) {
  const cards = [...container.querySelectorAll('.prompt-card:not(.dragging)')];
  return cards.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) return { offset, element: child };
    return closest;
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}
