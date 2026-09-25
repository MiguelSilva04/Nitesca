// Every user-facing string on the site, in both languages. Keys must match between `pt` and `en`.
// index.html references them by path (data-i18n="services.packages.pacote-basico.name");
// `npm run check:i18n` verifies both languages match and every path in the HTML exists.

export const dict = {
  pt: {
    meta: {
      htmlLang: 'pt-PT',
      title: 'Nitesca',
      description: 'Mais visibilidade online para o seu negócio — do zero, ou a partir do que já tem.',
    },
    lang: { group: 'Idioma', switchTo: 'Mudar para' },
    header: {
      home: 'Nitesca — início',
      navLabel: 'Principal',
      nav: { servicos: 'Serviços', portefolio: 'Portefólio', processo: 'Como funciona', contacto: 'Contacto' },
      cta: 'Pedir orçamento',
    },
    hero: {
      eyebrow: 'AGÊNCIA DE CRIAÇÃO DE WEBSITES',
      title: 'Mais visibilidade online para o seu negócio — do zero, ou a partir do que já tem.',
      lead: 'Seja para começar um site novo, dar mais qualidade ao que já existe nas redes ou no Google, ou refazer um site antigo — o objetivo é sempre o mesmo: a forma mais eficaz de o seu negócio aparecer.',
      ctaWork: 'Ver portefólio',
      ctaQuote: 'Pedir orçamento',
    },
    story: {
      eyebrow: 'A HISTÓRIA',
      title: 'Um nome que significa "começar a brilhar"',
      body: 'Nitesca vem do latim nitescere, "começar a brilhar". Ligamos isso a um propósito simples: dar mais visibilidade a um negócio online — quer esteja a começar do zero, quer já tenha presença e precise que ela trabalhe melhor a seu favor.',
      word: 'nitēscere',
      meaning: 'latim, verbo — começar a brilhar',
      dontTitle: 'O que não fazemos',
      dontBody: 'Não trabalhamos com os modelos genéricos que as ferramentas de IA generativa produzem em segundos. Ficam de fora os gradientes chamativos sem razão de ser, os ícones de banco de imagens repetidos, os testemunhos inventados e as animações em cascata que só servem para parecer moderno. Cada site é desenhado à mão para o negócio específico que representa.',
    },
    services: {
      eyebrow: 'PACOTES',
      title: 'Três formas de começar',
      packages: {
        'pacote-basico': {
          name: 'Básico — institucional', from: 'a partir de', price: '300 €',
          desc: 'Para quem só precisa de existir online: quem é, o que faz, como contactar.',
          items: ['1 a 5 páginas', 'Formulário de contacto e mapa', 'Responsivo, SEO básico'],
        },
        'pacote-intermedio': {
          name: 'Intermédio', from: 'a partir de', price: '600 €',
          desc: 'Tudo do Básico, mais o que precisa de marcações ou horários.',
          items: ['Calendário de marcações', 'Galeria de fotos', 'Blog ou notícias'],
        },
        'pacote-catalogo': {
          name: 'Catálogo', from: 'calculado no orçamento', price: 'Personalizado',
          desc: 'Para mostrar um catálogo de produtos ou serviços sem vender diretamente online.',
          items: ['Catálogo navegável com paginação', 'Formulário de pedido de informação por item', 'Sem carrinho nem pagamento'],
        },
      },
      final: 'O valor final depende do número de páginas e do trabalho de conteúdo — e fica fechado na proposta, antes de começarmos.',
      finalLink: 'Ver como funciona',
      note: 'Domínio, alojamento e manutenção calculados à parte, consoante o pacote.',
    },
    work: {
      eyebrow: 'EXEMPLOS',
      title: 'Um projeto para cada pacote',
      intro: 'Como a Nitesca está a começar, estes três são projetos de demonstração — negócios fictícios, construídos por nós de raiz, para mostrar exatamente o que cada pacote entrega.',
      view: 'Ver site',
      projects: {
        barro: { desc: 'Institucional · Ateliê de cerâmica em Évora', pkgLabel: 'Pacote Básico', thumb: 'Ateliê de cerâmica', meta: ['PEÇAS FEITAS À MÃO', 'ÉVORA'] },
        nucleo: { desc: 'Marcações · Personal training em Évora', pkgLabel: 'Pacote Intermédio', thumb: 'NÚCLEO FIT', meta: ['SESSÃO EXPERIMENTAL', 'SEG–SEX 07–21H'] },
        terra: { desc: 'Catálogo · Agência de tours no Alentejo', pkgLabel: 'Pacote Catálogo', thumb: 'Terra Alentejana', meta: ['9 EXPERIÊNCIAS', 'ALENTEJO'] },
      },
    },
    process: {
      eyebrow: 'PROCESSO',
      title: 'Do primeiro contacto ao site no ar',
      steps: [
        { title: 'Conversa inicial', text: 'Percebemos o negócio e o que precisa de fazer online.' },
        { title: 'Proposta e preço fechado', text: 'O ponto de partida do pacote passa a um valor exato, combinado consigo antes de qualquer trabalho começar. Sem surpresas depois.' },
        { title: 'Construção', text: 'Acompanhamos com pontos de situação, não um silêncio de três semanas.' },
        { title: 'Entrega e manutenção', text: 'O site fica no ar; manutenção mensal opcional para quem não quer preocupar-se mais com isso.' },
      ],
    },
    contact: {
      eyebrow: 'FALE CONNOSCO',
      title: 'Vamos falar sobre o seu negócio',
      email: '[email a definir]',
      phone: '[telefone a definir]',
      fields: {
        name: 'Nome', email: 'Email', type: 'Tipo de negócio',
        typePlaceholder: 'Florista, contabilista, personal trainer…', message: 'Mensagem',
      },
      send: 'Enviar',
      thanks: 'Obrigado — respondemos em breve.',
    },
    footer: { social: 'Redes sociais', tbd: '[a definir]' },
    browser: {
      path: 'exemplos',
      demo: 'site de demonstração',
      frame: 'demonstração',
      close: 'Fechar', minimise: 'Minimizar', fullscreen: 'Ecrã inteiro', exitFullscreen: 'Sair de ecrã inteiro',
      back: 'Retroceder', forward: 'Avançar', reload: 'Recarregar',
    },
  },

  en: {
    meta: {
      htmlLang: 'en',
      title: 'Nitesca',
      description: 'More online visibility for your business — from scratch, or from what you already have.',
    },
    lang: { group: 'Language', switchTo: 'Switch to' },
    header: {
      home: 'Nitesca — home',
      navLabel: 'Main',
      nav: { servicos: 'Services', portefolio: 'Portfolio', processo: 'How it works', contacto: 'Contact' },
      cta: 'Get a quote',
    },
    hero: {
      eyebrow: 'WEBSITE CREATION AGENCY',
      title: 'More online visibility for your business — from scratch, or from what you already have.',
      lead: 'Whether it’s launching a new website, getting more out of what you already have on social media or Google, or rebuilding an outdated site — the goal is always the same: the most effective way for your business to be found.',
      ctaWork: 'See portfolio',
      ctaQuote: 'Get a quote',
    },
    story: {
      eyebrow: 'THE STORY',
      title: 'A name that means "to begin to shine"',
      body: 'Nitesca comes from the Latin nitescere, "to begin to shine". We tie that to a simple purpose: giving a business more visibility online — whether it’s starting from zero, or already has a presence that needs to work harder for it.',
      word: 'nitēscere',
      meaning: 'Latin, verb — to begin to shine',
      dontTitle: 'What we don’t do',
      dontBody: 'We don’t work with the generic templates that generative AI tools churn out in seconds. No flashy gradients for the sake of it, no recycled stock icons, no made-up testimonials, no cascading animations that exist only to look modern. Every site is designed by hand for the specific business it represents.',
    },
    services: {
      eyebrow: 'PACKAGES',
      title: 'Three ways to start',
      packages: {
        'pacote-basico': {
          name: 'Basic — company site', from: 'from', price: '€300',
          desc: 'For businesses that simply need to exist online: who you are, what you do, how to get in touch.',
          items: ['1 to 5 pages', 'Contact form and map', 'Responsive, basic SEO'],
        },
        'pacote-intermedio': {
          name: 'Intermediate', from: 'from', price: '€600',
          desc: 'Everything in Basic, plus what you need for bookings or opening hours.',
          items: ['Booking calendar', 'Photo gallery', 'Blog or news'],
        },
        'pacote-catalogo': {
          name: 'Catalogue', from: 'calculated in your quote', price: 'Tailored',
          desc: 'To showcase a catalogue of products or services without selling directly online.',
          items: ['Browsable catalogue with pagination', 'Enquiry form for each item', 'No cart or checkout'],
        },
      },
      final: 'The final price depends on the number of pages and the content work involved — and it’s fixed in the proposal, before we start.',
      finalLink: 'See how it works',
      note: 'Domain, hosting and maintenance are priced separately, depending on the package.',
    },
    work: {
      eyebrow: 'EXAMPLES',
      title: 'One project for each package',
      intro: 'Nitesca is just getting started, so these three are demo projects — fictional businesses, built by us from scratch, to show exactly what each package delivers.',
      view: 'View site',
      projects: {
        barro: { desc: 'Company site · Ceramics studio in Évora', pkgLabel: 'Basic package', thumb: 'Ceramics studio', meta: ['HANDMADE PIECES', 'ÉVORA'] },
        nucleo: { desc: 'Bookings · Personal training in Évora', pkgLabel: 'Intermediate package', thumb: 'NÚCLEO FIT', meta: ['TRIAL SESSION', 'MON–FRI 7AM–9PM'] },
        terra: { desc: 'Catalogue · Tour agency in the Alentejo', pkgLabel: 'Catalogue package', thumb: 'Terra Alentejana', meta: ['9 EXPERIENCES', 'ALENTEJO'] },
      },
    },
    process: {
      eyebrow: 'PROCESS',
      title: 'From first contact to live site',
      steps: [
        { title: 'First conversation', text: 'We get to know your business and what it needs to do online.' },
        { title: 'Proposal and fixed price', text: 'The package’s starting price becomes an exact figure, agreed with you before any work begins. No surprises later.' },
        { title: 'Build', text: 'We keep you posted with regular updates, not three weeks of silence.' },
        { title: 'Launch and maintenance', text: 'Your site goes live; optional monthly maintenance for anyone who’d rather not think about it again.' },
      ],
    },
    contact: {
      eyebrow: 'GET IN TOUCH',
      title: 'Let’s talk about your business',
      email: '[email TBD]',
      phone: '[phone TBD]',
      fields: {
        name: 'Name', email: 'Email', type: 'Type of business',
        typePlaceholder: 'Florist, accountant, personal trainer…', message: 'Message',
      },
      send: 'Send',
      thanks: 'Thank you — we’ll be in touch soon.',
    },
    footer: { social: 'Social media', tbd: '[TBD]' },
    browser: {
      path: 'examples',
      demo: 'demo site',
      frame: 'demo',
      close: 'Close', minimise: 'Minimise', fullscreen: 'Full screen', exitFullscreen: 'Exit full screen',
      back: 'Back', forward: 'Forward', reload: 'Reload',
    },
  },
}

// Each language's own name, shown in the switcher (always written in that language).
export const languages = [
  { code: 'pt', name: 'português' },
  { code: 'en', name: 'English' },
]
