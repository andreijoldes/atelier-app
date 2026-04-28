// Definirea paletelor de culori disponibile
// Fiecare paletă conține culorile CSS care suprascriu variabilele din @theme inline

export const palete = [
  {
    id: 'albastru',
    name: 'Albastru',
    color: '#2563EB',
    vars: {
      '--color-primary': '#2563EB',
      '--color-primary-dark': '#1D4ED8',
      '--color-primary-light': '#3B82F6',
      '--color-primary-50': '#EFF6FF',
      '--color-primary-100': '#DBEAFE',
      '--color-primary-200': '#BFDBFE',
    },
  },
  {
    id: 'verde',
    name: 'Verde',
    color: '#059669',
    vars: {
      '--color-primary': '#059669',
      '--color-primary-dark': '#047857',
      '--color-primary-light': '#10B981',
      '--color-primary-50': '#ECFDF5',
      '--color-primary-100': '#D1FAE5',
      '--color-primary-200': '#A7F3D0',
    },
  },
  {
    id: 'violet',
    name: 'Violet',
    color: '#7C3AED',
    vars: {
      '--color-primary': '#7C3AED',
      '--color-primary-dark': '#6D28D9',
      '--color-primary-light': '#8B5CF6',
      '--color-primary-50': '#F5F3FF',
      '--color-primary-100': '#EDE9FE',
      '--color-primary-200': '#DDD6FE',
    },
  },
  {
    id: 'portocaliu',
    name: 'Portocaliu',
    color: '#EA580C',
    vars: {
      '--color-primary': '#EA580C',
      '--color-primary-dark': '#C2410C',
      '--color-primary-light': '#F97316',
      '--color-primary-50': '#FFF7ED',
      '--color-primary-100': '#FFEDD5',
      '--color-primary-200': '#FED7AA',
    },
  },
  {
    id: 'rosu',
    name: 'Roșu',
    color: '#E11D48',
    vars: {
      '--color-primary': '#E11D48',
      '--color-primary-dark': '#BE123C',
      '--color-primary-light': '#F43F5E',
      '--color-primary-50': '#FFF1F2',
      '--color-primary-100': '#FFE4E6',
      '--color-primary-200': '#FECDD3',
    },
  },
  {
    id: 'cyan',
    name: 'Cyan',
    color: '#0891B2',
    vars: {
      '--color-primary': '#0891B2',
      '--color-primary-dark': '#0E7490',
      '--color-primary-light': '#06B6D4',
      '--color-primary-50': '#ECFEFF',
      '--color-primary-100': '#CFFAFE',
      '--color-primary-200': '#A5F3FC',
    },
  },
];

// Aplică o paletă pe document
export function aplicaPaleta(paletaId) {
  if (typeof window === 'undefined') return;
  const paleta = palete.find((p) => p.id === paletaId);
  if (!paleta) return;

  const root = document.documentElement;
  Object.entries(paleta.vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  // Actualizăm și meta theme-color
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', paleta.color);

  // Salvăm alegerea
  localStorage.setItem('atelier-paleta', paletaId);
}

// Citește paleta salvată
export function getPaletaSalvata() {
  if (typeof window === 'undefined') return 'albastru';
  return localStorage.getItem('atelier-paleta') || 'albastru';
}

// Inițializare paletă (apelat la încărcare)
export function initPaleta() {
  const id = getPaletaSalvata();
  if (id !== 'albastru') {
    aplicaPaleta(id);
  }
}
