import { appState, createTag, savePrompt, serializeToXml, importFromXml } from './state.js';
import { renderTagList, renderLibrary, fillForm, resetForm, createToast } from './ui.js';
import { applyLanguage, languages } from './i18n.js';
import { initGoogle, initMicrosoft, syncToCloud, loadFromCloud } from './storage.js';

const googleAuth = initGoogle({ clientId: 'CAMBIA_CLIENT_ID_GOOGLE' });
const microsoftAuth = initMicrosoft({ clientId: 'CAMBIA_CLIENT_ID_MICROSOFT', tenant: 'common' });

function setupForm() {
  const form = document.querySelector('#prompt-form');
  const text = document.querySelector('#text');
  const charCount = document.querySelector('#char-count');
  const submitBtn = document.querySelector('#submit-btn');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const tags = document.querySelector('#tags').value.split(',').map((t) => t.trim()).filter(Boolean).map(createTag);
    const payload = {
      title: document.querySelector('#title').value,
      text: document.querySelector('#text').value,
      notes: document.querySelector('#notes').value,
      tags,
    };
    savePrompt(payload);
    renderTagList();
    renderLibrary();
    resetForm();
    form.reset();
    submitBtn.textContent = languages[appState.language].strings.add;
  });
  text.addEventListener('input', () => { charCount.textContent = text.value.length; });
  document.querySelector('#reset-btn').addEventListener('click', () => { form.reset(); resetForm(); submitBtn.textContent = languages[appState.language].strings.add; });
}

function setupControls() {
  document.querySelector('#search').addEventListener('input', (e) => filterLibrary(e.target.value));
  document.querySelector('#order').addEventListener('change', (e) => { appState.order = e.target.value; renderLibrary(); });
  document.querySelector('#view').addEventListener('change', (e) => { appState.view = e.target.value; renderLibrary(); });
  document.querySelector('#toggle-sidebar').addEventListener('click', () => document.querySelector('#sidebar').classList.toggle('open'));
  document.querySelector('#new-prompt-btn').addEventListener('click', () => document.querySelector('#sidebar').classList.toggle('open'));
  document.querySelector('#add-tag-btn').addEventListener('click', () => { const name = prompt('Nombre de etiqueta'); if (name) { createTag(name); renderTagList(); }});
  document.querySelector('#help-btn').addEventListener('click', openHelp);
  document.querySelector('#help-close').addEventListener('click', closeHelp);
  document.querySelector('#export-btn').addEventListener('click', exportXml);
  document.querySelector('#import-btn').addEventListener('click', () => document.querySelector('#import-input').click());
  document.querySelector('#import-input').addEventListener('change', importXml);
  document.querySelector('#google-btn').addEventListener('click', googleAuth);
  document.querySelector('#microsoft-btn').addEventListener('click', microsoftAuth);
  document.querySelector('#sync-btn').addEventListener('click', syncToCloud);
  document.querySelector('#load-btn').addEventListener('click', loadFromCloud);
}

function filterLibrary(query) {
  const normalized = query.toLowerCase();
  document.querySelectorAll('.prompt-card').forEach((card) => {
    const text = card.innerText.toLowerCase();
    card.style.display = text.includes(normalized) ? '' : 'none';
  });
}

function setupLanguage() {
  const selector = document.querySelector('#language-selector');
  Object.entries(languages).forEach(([key, { label }]) => {
    const option = document.createElement('option');
    option.value = key; option.textContent = label; selector.appendChild(option);
  });
  selector.value = appState.language;
  selector.addEventListener('change', (e) => { appState.language = e.target.value; applyLanguage(appState.language); renderLibrary(); });
  applyLanguage(appState.language);
}

function setupThemes() {
  const selector = document.querySelector('#theme-selector');
  ['dawn','sand','mint','sky','paper','night','nebula','forest','lilac','carbon'].forEach((theme) => {
    const option = document.createElement('option'); option.value = theme; option.textContent = theme; selector.appendChild(option);
  });
  selector.value = appState.theme;
  document.body.dataset.theme = appState.theme;
  selector.addEventListener('change', (e) => { appState.theme = e.target.value; document.body.dataset.theme = appState.theme; });
}

function openHelp() {
  const modal = document.querySelector('#help-modal');
  document.querySelector('#help-body').innerHTML = `
    <p>Conecta con Google o Microsoft 365, gestiona prompts y sincroniza en la nube.</p>
    <p>Atajos: usa <code>tag:ventas</code> en búsqueda para filtrar por etiquetas.</p>
    <p>Arrastra tarjetas para reordenar manualmente.</p>
    <p>Exporta/Importa XML para copias de seguridad portables.</p>`;
  modal.classList.remove('hidden');
}

function closeHelp() {
  document.querySelector('#help-modal').classList.add('hidden');
}

function exportXml() {
  const xml = serializeToXml();
  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'prompt-library.xml'; a.click();
  URL.revokeObjectURL(url);
}

async function importXml(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const text = await file.text();
  importFromXml(text);
  renderTagList();
  renderLibrary();
}

function init() {
  setupForm();
  setupControls();
  setupLanguage();
  setupThemes();
  renderTagList();
  renderLibrary();
}

init();
