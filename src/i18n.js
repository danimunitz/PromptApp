export const languages = {
  es: {
    label: 'Español',
    strings: {
      title: 'Título', text: 'Texto', tags: 'Etiquetas', notes: 'Notas internas',
      add: 'Añadir', update: 'Actualizar', reset: 'Restablecer',
      cloud: 'Nube', sync: 'Sincronizar', load: 'Cargar', backup: 'Respaldo',
      export: 'Exportar XML', import: 'Importar XML', help: 'Ayuda',
      searchPlaceholder: 'Buscar...',
    }
  },
  ca: {
    label: 'Català',
    strings: {
      title: 'Títol', text: 'Text', tags: 'Etiquetes', notes: 'Notes internes',
      add: 'Afegir', update: 'Actualitzar', reset: 'Restablir',
      cloud: 'Núvol', sync: 'Sincronitza', load: 'Carrega', backup: 'Còpia',
      export: 'Exporta XML', import: 'Importa XML', help: 'Ajuda',
      searchPlaceholder: 'Cercar...',
    }
  },
  en: {
    label: 'English',
    strings: {
      title: 'Title', text: 'Text', tags: 'Tags', notes: 'Internal notes',
      add: 'Add', update: 'Update', reset: 'Reset',
      cloud: 'Cloud', sync: 'Sync', load: 'Load', backup: 'Backup',
      export: 'Export XML', import: 'Import XML', help: 'Help',
      searchPlaceholder: 'Search...'
    }
  }
};

export function applyLanguage(lang) {
  const dict = languages[lang]?.strings ?? languages.es.strings;
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    const key = node.dataset.i18n;
    if (dict[key]) node.textContent = dict[key];
  });
  const search = document.querySelector('#search');
  if (search) search.placeholder = dict.searchPlaceholder;
}
