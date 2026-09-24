export const packages = [
  {
    id: 'pacote-basico', name: 'Básico — institucional', from: 'a partir de', price: '300 €',
    desc: 'Para quem só precisa de existir online: quem é, o que faz, como contactar.',
    items: ['1 a 5 páginas', 'Formulário de contacto e mapa', 'Responsivo, SEO básico'],
  },
  {
    id: 'pacote-intermedio', name: 'Intermédio', from: 'a partir de', price: '600 €',
    desc: 'Tudo do Básico, mais o que precisa de marcações ou horários.',
    items: ['Calendário de marcações', 'Galeria de fotos', 'Blog ou notícias'],
  },
  {
    id: 'pacote-catalogo', name: 'Catálogo', from: 'calculado no orçamento', price: 'Personalizado',
    desc: 'Para mostrar um catálogo de produtos ou serviços sem vender diretamente online.',
    items: ['Catálogo navegável com paginação', 'Formulário de pedido de informação por item', 'Sem carrinho nem pagamento'],
  },
]

// `thumb` is the inline card shown instead of the cursor preview on touch screens.
export const projects = [
  {
    name: 'Estúdio Barro', desc: 'Institucional · Ateliê de cerâmica em Évora',
    pkg: '#pacote-basico', pkgLabel: 'Pacote Básico',
    site: 'portfolio/estudio-barro.html',
    thumb: { text: 'Ateliê de cerâmica', style: { background: '#E4D2B8', border: '1px solid #cdbb9f', font: '400 32px/1 Fraunces,serif', color: '#A85C32' } },
  },
  {
    name: 'Núcleo Fit', desc: 'Marcações · Personal training em Évora',
    pkg: '#pacote-intermedio', pkgLabel: 'Pacote Intermédio',
    site: 'portfolio/nucleo-fit.html',
    thumb: { text: 'NÚCLEO FIT', style: { background: '#1A1A18', font: '800 48px/.9 Archivo,sans-serif', color: '#D9491F' } },
  },
  {
    name: 'Terra Alentejana', desc: 'Catálogo · Agência de tours no Alentejo',
    pkg: '#pacote-catalogo', pkgLabel: 'Pacote Catálogo',
    site: 'portfolio/terra-alentejana.html',
    thumb: { text: 'Terra Alentejana', style: { background: '#F4EDE0', border: '1px solid #d9ceb8', font: '400 32px/1 Lora,serif', color: '#3F4A34' } },
  },
]

export const steps = [
  { title: 'Conversa inicial', text: 'Percebemos o negócio e o que precisa de fazer online.' },
  { title: 'Proposta e preço fechado', text: 'O ponto de partida do pacote passa a um valor exato, combinado consigo antes de qualquer trabalho começar. Sem surpresas depois.' },
  { title: 'Construção', text: 'Acompanhamos com pontos de situação, não um silêncio de três semanas.' },
  { title: 'Entrega e manutenção', text: 'O site fica no ar; manutenção mensal opcional para quem não quer preocupar-se mais com isso.' },
]
