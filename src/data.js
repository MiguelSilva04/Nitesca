// Structure only — all visible text lives in i18n/dictionary.js, keyed by these ids.

export const packages = [{ id: 'pacote-basico' }, { id: 'pacote-intermedio' }, { id: 'pacote-catalogo' }]

// `thumb` styles the inline card shown instead of the cursor preview on touch screens.
export const projects = [
  {
    id: 'barro', name: 'Estúdio Barro', pkg: '#pacote-basico',
    site: 'portfolio/estudio-barro.html',
    thumb: { background: '#E4D2B8', border: '1px solid #cdbb9f', font: '400 32px/1 Fraunces,serif', color: '#A85C32' },
  },
  {
    id: 'nucleo', name: 'Núcleo Fit', pkg: '#pacote-intermedio',
    site: 'portfolio/nucleo-fit.html',
    thumb: { background: '#1A1A18', font: '800 48px/.9 Archivo,sans-serif', color: '#D9491F' },
  },
  {
    id: 'terra', name: 'Terra Alentejana', pkg: '#pacote-catalogo',
    site: 'portfolio/terra-alentejana.html',
    thumb: { background: '#F4EDE0', border: '1px solid #d9ceb8', font: '400 32px/1 Lora,serif', color: '#3F4A34' },
  },
]
