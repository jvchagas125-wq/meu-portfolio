// Conteúdo padrão (o que já está no seu site hoje).
// O site usa isto enquanto o banco estiver vazio ou indisponível,
// e o painel parte daqui na primeira vez que você entrar.

export const clone = (x) => JSON.parse(JSON.stringify(x));

// Mescla os padrões com o que veio do banco: listas do banco substituem as padrão,
// campos novos que ainda não existem no banco são preenchidos com o padrão.
export function deepMerge(def, rem) {
  const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
  if (Array.isArray(def)) return Array.isArray(rem) ? rem : clone(def);
  if (isObj(def)) {
    const out = {};
    const src = isObj(rem) ? rem : {};
    for (const k of Object.keys(def)) out[k] = deepMerge(def[k], src[k]);
    for (const k of Object.keys(src)) if (!(k in out)) out[k] = src[k];
    return out;
  }
  return rem === undefined || rem === null ? def : rem;
}

// Converte o formato antigo (uma única "midia") para a lista "midias".
export function normalizeMedia(doc) {
  for (const k of ['cursos', 'projetos']) {
    (Array.isArray(doc?.[k]) ? doc[k] : []).forEach((it) => {
      if (!Array.isArray(it.midias)) it.midias = it.midia ? [it.midia] : [];
      delete it.midia;
    });
  }
  return doc;
}

export const DEFAULT_HOME = {
  hero: {
    tag: '// disponível para projetos freelancer',
    nome: 'João Victor Chagas Medeiros',
    cargo: 'Dev Freelancer & Help Desk Jr.',
    descricao:
      'Desenvolvedor em crescimento, 22 anos, apaixonado pela área de TI e por criar experiências digitais. De landing pages, institucionais, Progressive Web App (PWA), Aplicação Web Full Stack (SAAS) e e-commerces — transformo ideias em sites que convertem.',
    btn1: 'Ver Projetos',
    btn2: 'Fale Comigo',
    foto: 'https://res.cloudinary.com/dcvhqnr1c/image/upload/q_auto/f_auto/v1778853201/WhatsApp_Image_2026-05-15_at_10.52.59_a2rida.jpg',
    badgeNum: '3+',
    badgeLabel: 'ANOS DE EXP. EM TI'
  },

  sobre: {
    eyebrow: '01 — SOBRE MIM',
    titulo: 'Quem sou',
    destaque: 'eu?',
    texto:
      'Olá! Sou **João Victor Chagas Medeiros**, tenho **22 anos** e sou de Campos dos Goytacazes - RJ. Atualmente trabalho como **Operador de Help Desk Jr.** na Minsait - grupo INDRA, onde desenvolvo habilidades técnicas e de suporte todos os dias.\n\n' +
      'Paralelamente, estou cursando **Análise e Desenvolvimento de Sistemas** na Universidade Cândido Mendes e mergulhando cada vez mais no universo do desenvolvimento web como freelancer.\n\n' +
      'Crio **landing pages, e-commerces, sites institucionais e Progressive Web App (PWA)** — sempre com foco em entregar algo moderno, funcional e que realmente gere resultado para o cliente.',
    flags: ['HTML / CSS', 'JavaScript', 'Landing Pages', 'E-commerce', 'Suporte TI', 'Help Desk', 'Redes', 'Windows / Linux'],
    stats: [
      { num: '3+', label: 'Anos de experiência profissional' },
      { num: '22', label: 'Anos de idade, cheio de energia' },
      { num: '3', label: 'Certificações e cursos concluídos' },
      { num: '∞', label: 'Vontade de aprender e evoluir' }
    ]
  },

  expSec: { eyebrow: '02 — CARREIRA', titulo: 'Experiência', destaque: 'Profissional' },
  experiencias: [
    {
      empresa: 'MINSAIT - GRUPO INDRA',
      cargo: 'Operador de Help Desk Jr.',
      periodo: 'Desde Janeiro de 2023 — Presente',
      badge: '● ATUAL',
      descricao:
        'Operador de Help Desk Jr. com experiência desde janeiro de 2023, atuando na Minsait, empresa do grupo Indra. Nesse cargo, presto suporte remoto a empregados e terceirizados da Petrobras, solucionando incidentes relacionados a softwares corporativos e sistemas operacionais, utilizando a plataforma ServiceNow para registro e acompanhamento de chamados conforme as boas práticas do ITIL.',
      tags: ['Help Desk', 'Suporte N1', 'Atendimento', 'Infraestrutura TI', 'ServiceNow'],
      cor: 'blue'
    },
    {
      empresa: 'FREELANCER',
      cargo: 'Desenvolvedor Web',
      periodo: 'Desde Março de 2026 — Presente',
      badge: '● ATIVO',
      descricao:
        'Desenvolvimento de sites e landing pages para clientes diversos. Criação de e-commerces, páginas institucionais e soluções web personalizadas, sempre entregando projetos modernos e otimizados para conversão.',
      tags: ['HTML/CSS', 'JavaScript', 'Landing Page', 'E-commerce'],
      cor: 'purple'
    }
  ],

  cursosSec: { eyebrow: '03 — FORMAÇÃO', titulo: 'Cursos &', destaque: 'Certificações' },
  cursos: [
    {
      tipo: 'GRADUAÇÃO',
      titulo: 'Análise e Desenvolvimento de Sistemas',
      instituicao: 'Universidade Cândido Mendes',
      descricao: '',
      status: '● Em andamento · Conclusão: Dez/2026',
      icone: '🎓',
      cor: 'blue',
      midias: [],
      ajuste: 'cover',
      fundo: '',
      flags: [],
      linkCertificado: ''
    },
    {
      tipo: 'DIPLOMA TÉCNICO',
      titulo: 'Técnico em Informática',
      instituicao: 'Centro Educacional Evolução - CEE',
      descricao: '',
      status: '✓ Diploma concluído',
      icone: '📜',
      cor: 'purple',
      midias: [],
      ajuste: 'cover',
      fundo: '',
      flags: [],
      linkCertificado: ''
    },
    {
      tipo: 'CERTIFICAÇÃO',
      titulo: 'HDI Support Center Analyst',
      instituicao: 'HDI Brasil',
      descricao: '',
      status: '✓ Certificado HDI',
      icone: '🏆',
      cor: 'green',
      midias: [],
      ajuste: 'cover',
      fundo: '',
      flags: [],
      linkCertificado: ''
    }
  ],

  projetosSec: { eyebrow: '04 — PORTFÓLIO', titulo: 'Meus', destaque: 'Projetos' },
  projetos: [
    {
      tipo: 'LANDING PAGE / ONE PAGE',
      titulo: 'Edna Cakes',
      descricao:
        'Landing page/ One Page completa para doceria artesanal com cardápio interativo, modais detalhados, galeria de fotos, cardápios sazonais e botão de WhatsApp com mensagem pré-preenchida por produto. Instalável como PWA. O painel admin permite à cliente gerenciar todo o conteúdo sem conhecimento técnico: produtos, fotos, contatos e campanhas com validade automática — tudo refletindo em tempo real via Firebase Firestore.',
      cor: 'rose',
      midias: ['https://res.cloudinary.com/dcvhqnr1c/image/upload/q_auto/f_auto/v1778778411/imagem_2026-05-14_140648057_ebqe10.png'],
      ajuste: 'cover',
      fundo: '',
      icone: '🎂',
      flags: ['HTML5 · CSS3', 'JavaScript', 'Firebase', 'Cloudinary', 'PWA'],
      linkSite: 'https://edna-cakes.vercel.app',
      linkGithub: '',
      painelAdmin: true
    },
    {
      tipo: 'PROGRESSIVE WEB APP (PWA)',
      titulo: 'Gabriel Barber Studio',
      descricao:
        'Plataforma digital completa para barbearia com dois PWAs integrados. App do cliente com login por telefone, agendamento, loja, moeda interna (GB$) via Mercado Pago, planos de assinatura, notificações push e suporte offline. Painel admin com dashboard de métricas, gestão completa, notificações push individuais ou em massa e integração com Telegram.',
      cor: 'amber',
      midias: ['https://res.cloudinary.com/dcvhqnr1c/image/upload/q_auto/f_auto/v1778784443/Captura_de_tela_2026-05-14_154702_viqzwd.png'],
      ajuste: 'cover',
      fundo: '',
      icone: '✂️',
      flags: ['Firebase', 'Mercado Pago', 'Node.js', 'Push Notifications', 'Telegram API'],
      linkSite: 'https://gabriel-barber-studio.vercel.app',
      linkGithub: '',
      painelAdmin: true
    },
    {
      tipo: 'LANDING PAGE',
      titulo: 'Lista de Presentes Digital',
      descricao:
        'Landing page completa para gerenciamento de lista de presentes com reserva em tempo real, painel admin com autenticação, upload de imagens via Cloudinary, suporte a múltiplos links por presente, reordenação drag-and-drop, cancelamento de reservas e rodapé editável pelo painel.',
      cor: 'purple',
      midias: ['https://res.cloudinary.com/dcvhqnr1c/image/upload/q_auto/f_auto/v1778785037/imagem_2026-05-14_155714997_dipp93.png'],
      ajuste: 'cover',
      fundo: '',
      icone: '🎁',
      flags: ['HTML5 · CSS3', 'JavaScript', 'Firebase', 'Cloudinary', 'Vercel CI/CD'],
      linkSite: 'https://lista-de-presentes-liard.vercel.app',
      linkGithub: '',
      painelAdmin: true
    },
    {
      tipo: 'LANDING PAGE / ONE PAGE',
      titulo: 'Brechó do Nóbrega',
      descricao:
        'Vitrine digital responsiva com galeria, filtros por categoria, modal com carrossel de fotos e swipe mobile, integração com WhatsApp e status de "vendido" em tempo real via Firebase. Painel admin com CRUD completo de produtos, categorias, upload via Cloudinary e sincronização instantânea na vitrine. Domínio próprio registrado pelo cliente na Hostgator.',
      cor: 'green',
      midias: ['https://res.cloudinary.com/dcvhqnr1c/image/upload/q_auto/f_auto/v1779039799/icon-512_zmkmye.svg'],
      ajuste: 'contain',
      fundo: '#1a1a1a',
      icone: '🛍️',
      flags: ['HTML · CSS · JS', 'Firebase', 'Cloudinary', 'Domínio Hostgator'],
      linkSite: 'https://www.brechodonobrega.com.br',
      linkGithub: '',
      painelAdmin: true
    },
    {
      tipo: 'PROGRESSIVE WEB APP (PWA)',
      titulo: 'Arautos do Evangelho',
      descricao:
        'Sistema de agendamento de Adoração ao Santíssimo Sacramento. O lado público permite identificação por telefone, agendamento em calendário, envio de intenções de missa e consulta de avisos da paróquia. O painel admin gerencia horários, avisos, agendamentos e exporta relatórios em Excel e PDF.',
      cor: 'blue',
      midias: ['arautos-logo.png'],
      ajuste: 'contain',
      fundo: '#4a0a0a',
      icone: '✝️',
      flags: ['HTML · CSS · JS', 'Firebase', 'PWA', 'ExcelJS · jsPDF', 'Vercel'],
      linkSite: 'https://arautos-adoracao.vercel.app',
      linkGithub: '',
      painelAdmin: true
    }
  ],

  contato: {
    titulo: 'Vamos trabalhar|',
    destaque: 'juntos?',
    subtitulo:
      'Precisa de um site, landing page ou e-commerce? Estou disponível para novos projetos freelancer. Entre em contato e vamos conversar!',
    btnServicos: 'Ver Serviços & Valores',
    links: [
      { icone: '✉', label: 'jvchagas3030@gmail.com', url: 'https://mail.google.com/mail/?view=cm&to=jvchagas3030@gmail.com' },
      { icone: '◈', label: '@jv.dev2026', url: 'https://instagram.com/jv.dev2026' },
      { icone: '⧉', label: 'LinkedIn', url: 'https://www.linkedin.com/in/joão-victor-chagas-medeiros-428961388/' },
      { icone: '✆', label: '+55 (22) 99922-6298', url: 'https://wa.me/5522999226298' }
    ]
  },

  rodape: {
    esquerda: '© 2026 João Victor Chagas Medeiros',
    direita: 'Desenvolvido com 🩵 por mim mesmo'
  }
};

export const DEFAULT_SERVICOS = {
  hero: {
    eyebrow: '// serviços & valores',
    titulo: 'O que posso|fazer por',
    destaque: 'você?',
    sub: 'Desenvolvo soluções web completas, modernas e responsivas. Cada projeto é entregue com foco em qualidade, prazo e resultado para o cliente.'
  },

  servicos: [
    {
      emoji: '🌐',
      tipo: 'LANDING PAGE / ONE PAGE',
      nome: 'Landing Page',
      prefixo: 'a partir de',
      preco: 'R$400',
      cor: 'blue',
      incluso: [
        'Vitrine/cardápio com galeria de produtos e filtros por categoria',
        'Modal de detalhes com carrossel de fotos e swipe mobile',
        'Integração com WhatsApp e Instagram',
        'Menu hambúrguer responsivo para mobile'
      ],
      adicionais: [
        { texto: 'Painel administrativo', preco: 'R$100' },
        { texto: 'Instalável como app', preco: 'R$100' }
      ]
    },
    {
      emoji: '🏢',
      tipo: 'SITE INSTITUCIONAL',
      nome: 'Site Institucional',
      prefixo: 'a partir de',
      preco: 'R$600',
      cor: 'purple',
      incluso: ['Páginas: sobre, serviços e contato', 'Formulário de contato integrado', 'Design responsivo e moderno', 'Integração com WhatsApp'],
      adicionais: [
        { texto: 'Painel administrativo', preco: 'R$100' },
        { texto: 'Instalável como app', preco: 'R$100' }
      ]
    },
    {
      emoji: '🛒',
      tipo: 'E-COMMERCE',
      nome: 'E-commerce',
      prefixo: 'a partir de',
      preco: 'R$900',
      cor: 'green',
      incluso: [
        'Catálogo de produtos com categorias',
        'Modal de login para o cliente ao acessar o site',
        'Painel admin para gerenciar produtos',
        'Integração com o pagamento',
        'Design responsivo e otimizado'
      ],
      adicionais: [
        { texto: 'Integração com WhatsApp', preco: 'R$100' },
        { texto: 'Instalável como app', preco: 'R$100' }
      ]
    },
    {
      emoji: '📱',
      tipo: 'PROGRESSIVE WEB APP',
      nome: 'PWA',
      prefixo: 'a partir de',
      preco: 'R$1.200',
      cor: 'amber',
      incluso: [
        'Instalável no celular como app incluído',
        'Menu hambúrguer responsivo para mobile',
        'Notificações Push',
        'Integração com WhatsApp e Instagram',
        'Painel administrativo incluído',
        'Carregamento otimizado com cache',
        'Multiplataforma — um único código para tudo'
      ],
      adicionais: [
        { texto: 'Integração com bot do Telegram', preco: 'R$100' },
        { texto: 'Modal de login para o cliente', preco: 'R$100' }
      ]
    }
  ],

  obs: {
    eyebrow: '// OBSERVAÇÕES IMPORTANTES',
    blocos: [
      {
        icone: '✅',
        titulo: 'Garantia',
        itens: ['# 15 dias de garantia:', 'Landing Page / One Page', 'Site Institucional', '# 30 dias de garantia:', 'E-commerce', 'Progressive Web App (PWA)']
      },
      {
        icone: '✅',
        titulo: 'Domínio grátis incluso',
        itens: [
          'O domínio grátis se baseia no seu site sendo hospedado no Vercel, com endereço no formato "seusite.vercel.app".',
          'Já está incluso nos valores informados acima.'
        ]
      },
      {
        icone: '✅',
        titulo: 'Domínio próprio (.com.br, .com, .online)',
        itens: [
          'Fica de responsabilidade do cliente pagar o próprio domínio. Eu realizo a hospedagem do site no domínio que você criou.',
          'Sites recomendados: **Hostgator** e **Hostinger**.',
          'A combinar via WhatsApp caso queira configurar seu domínio próprio.'
        ]
      },
      {
        icone: '⚙️',
        titulo: 'Suporte',
        itens: ['Suporte por 1 ano: **a combinar via WhatsApp.**']
      }
    ],
    rodape: {
      antes: 'Para mais dúvidas, favor me chamar no',
      linkLabel: 'WhatsApp',
      linkUrl: 'https://wa.me/5522999226298',
      depois: '💬'
    }
  },

  cta: {
    titulo: 'Pronto para ter|seu site no ar?',
    destaque: '🚀',
    sub: 'Entre em contato e vamos conversar sobre o seu projeto. Orçamento gratuito e sem compromisso!',
    btn1Texto: '💬 Falar no WhatsApp',
    btn1Url: 'https://wa.me/5522999226298',
    btn2Texto: 'Ver formas de contato',
    btn2Url: 'index.html#contato'
  },

  rodape: {
    esquerda: '© 2026 João Victor Chagas Medeiros',
    direita: 'Desenvolvido com 🩵 por mim mesmo'
  }
};
