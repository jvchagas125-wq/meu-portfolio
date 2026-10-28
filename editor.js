// editor.js — monta as telas do painel a partir de "schemas" (descrições dos campos).
// Não depende do Firebase: recebe o estado (objeto) e um contexto { open, dirty, toast }.

import { CLOUDINARY } from './firebase-config.js';

/* ------------------------------------------------------------- utilidades */
export const uid = () => Math.random().toString(36).slice(2, 10);

export function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v === false || v === null || v === undefined) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of kids.flat(Infinity)) {
    if (c === null || c === undefined || c === false) continue;
    el.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return el;
}

const get = (o, p) => p.split('.').reduce((a, k) => (a == null ? undefined : a[k]), o);
function set(o, p, v) {
  const ks = p.split('.');
  const last = ks.pop();
  const t = ks.reduce((a, k) => (a[k] && typeof a[k] === 'object' ? a[k] : (a[k] = {})), o);
  t[last] = v;
}

export function ensureIds(node) {
  if (Array.isArray(node)) {
    node.forEach((x) => {
      if (x && typeof x === 'object') {
        if (!x._id) x._id = uid();
        ensureIds(x);
      }
    });
  } else if (node && typeof node === 'object') {
    Object.values(node).forEach(ensureIds);
  }
}

const isVideoUrl = (u) => /\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i.test(u || '') || /\/video\/upload\//.test(u || '');
const raf = (fn) => (typeof requestAnimationFrame === 'function' ? requestAnimationFrame(fn) : setTimeout(fn, 0));

/* ---------------------------------------------------------------- schemas */
const COR = [
  { v: 'blue', l: 'Azul' },
  { v: 'purple', l: 'Lilás' },
  { v: 'green', l: 'Verde' },
  { v: 'amber', l: 'Âmbar' },
  { v: 'rose', l: 'Rosa' }
];
const AJUSTE = [
  { v: 'cover', l: 'Preencher (foto ou print cobre toda a área)' },
  { v: 'contain', l: 'Conter (logo centralizada com fundo colorido)' }
];
const MIDIA = {
  w: 1280,
  h: 720,
  note: 'Proporção 16:9 · imagem JPG, PNG ou WEBP, ou vídeo MP4 · para logo use PNG transparente e o ajuste "Conter"'
};
const TITULO_SEC = (k) => [
  { k: `${k}.eyebrow`, t: 'text', label: 'Frase pequena acima do título', half: true },
  { k: `${k}.titulo`, t: 'text', label: 'Título', half: true },
  { k: `${k}.destaque`, t: 'text', label: 'Palavra em destaque (aparece em azul)', half: true }
];
const DICA_NEGRITO = 'Use **dois asteriscos** em volta de uma parte para deixá-la em negrito.';
const DICA_QUEBRA = 'Use | para quebrar a linha.';

const FIELDS_MIDIA = [
  { k: 'midia', t: 'image', label: 'Imagem ou vídeo do card', size: MIDIA },
  { k: 'ajuste', t: 'select', label: 'Como encaixar a imagem', options: AJUSTE, half: true },
  { k: 'fundo', t: 'color', label: 'Cor de fundo atrás da imagem', half: true, hint: 'Útil para logos. Deixe vazio para usar a cor padrão.' },
  { k: 'icone', t: 'text', label: 'Emoji quando não houver imagem', half: true, ph: '🎓' }
];

export const PAGES = [
  {
    id: 'inicio',
    doc: 'home',
    icon: '🏠',
    title: 'Início',
    sub: 'A primeira tela do portfólio: nome, cargo, texto de apresentação e foto.',
    blocks: [
      {
        id: 'apresentacao',
        icon: '✍️',
        title: 'Apresentação',
        sub: 'Nome, cargo, texto e botões',
        fields: [
          { k: 'hero.tag', t: 'text', label: 'Frase pequena acima do nome' },
          { k: 'hero.nome', t: 'text', label: 'Nome', half: true },
          { k: 'hero.cargo', t: 'text', label: 'Cargo ou profissão', half: true },
          { k: 'hero.descricao', t: 'textarea', rows: 5, label: 'Texto de apresentação', hint: DICA_NEGRITO },
          { k: 'hero.btn1', t: 'text', label: 'Botão 1 (leva até os projetos)', half: true },
          { k: 'hero.btn2', t: 'text', label: 'Botão 2 (leva até o contato)', half: true }
        ]
      },
      {
        id: 'foto',
        icon: '📸',
        title: 'Foto e selo',
        sub: 'Foto de perfil e o selo de anos de experiência',
        fields: [
          { k: 'hero.foto', t: 'image', label: 'Foto de perfil', size: { w: 640, h: 760, note: 'Retrato na vertical com o rosto no centro · JPG, PNG ou WEBP' } },
          { k: 'hero.badgeNum', t: 'text', label: 'Número do selo', half: true, ph: '3+' },
          { k: 'hero.badgeLabel', t: 'text', label: 'Texto do selo', half: true, ph: 'ANOS DE EXP. EM TI' }
        ]
      }
    ]
  },

  {
    id: 'sobre',
    doc: 'home',
    icon: '👤',
    title: 'Quem sou eu',
    sub: 'Seu texto de apresentação, as flags de habilidades e os cartões de números.',
    blocks: [
      {
        id: 'textos',
        icon: '📝',
        title: 'Título e texto',
        sub: 'O que aparece na seção "Quem sou eu?"',
        fields: [
          ...TITULO_SEC('sobre'),
          { k: 'sobre.texto', t: 'textarea', rows: 11, label: 'Texto', hint: `Deixe uma linha em branco para começar um novo parágrafo. ${DICA_NEGRITO}` }
        ]
      },
      {
        id: 'flags',
        icon: '🏷️',
        title: 'Flags de habilidades',
        sub: 'As etiquetas ao lado do texto',
        fields: [{ k: 'sobre.flags', t: 'tags', label: 'Flags', hint: 'Clique em uma flag para editar, no × para remover. Digite no campo e aperte Enter para adicionar.' }]
      },
      {
        t: 'list',
        id: 'stats',
        k: 'sobre.stats',
        icon: '🔢',
        title: 'Cartões de números',
        itemName: 'cartão',
        itemPlural: 'cartões',
        itemTitle: (it) => [it.num, it.label].filter(Boolean).join('  ·  '),
        make: () => ({ num: '', label: '' }),
        fields: [
          { k: 'num', t: 'text', label: 'Número ou símbolo', half: true, ph: '3+' },
          { k: 'label', t: 'text', label: 'Descrição', half: true }
        ]
      }
    ]
  },

  {
    id: 'experiencia',
    doc: 'home',
    icon: '💼',
    title: 'Experiência',
    sub: 'Linha do tempo da sua carreira profissional.',
    blocks: [
      { id: 'titulos', icon: '📝', title: 'Título da seção', sub: 'Textos acima da linha do tempo', fields: TITULO_SEC('expSec') },
      {
        t: 'list',
        id: 'experiencias',
        k: 'experiencias',
        icon: '💼',
        title: 'Experiências profissionais',
        itemName: 'experiência',
        itemPlural: 'experiências',
        itemTitle: (it) => it.cargo || it.empresa,
        itemSub: (it) => [it.empresa, it.periodo].filter(Boolean).join(' · '),
        make: () => ({ empresa: 'EMPRESA', cargo: 'Novo cargo', periodo: '', badge: '', descricao: '', tags: [], cor: 'blue' }),
        fields: [
          { k: 'empresa', t: 'text', label: 'Empresa', half: true },
          { k: 'cargo', t: 'text', label: 'Cargo', half: true },
          { k: 'periodo', t: 'text', label: 'Período', half: true, ph: 'Desde Janeiro de 2023 — Presente' },
          { k: 'badge', t: 'text', label: 'Selo ao lado do período', half: true, ph: '● ATUAL', hint: 'Deixe vazio para não mostrar.' },
          { k: 'descricao', t: 'textarea', rows: 5, label: 'Descrição' },
          { k: 'tags', t: 'tags', label: 'Flags' },
          { k: 'cor', t: 'select', label: 'Cor do cartão', options: COR, half: true }
        ]
      }
    ]
  },

  {
    id: 'cursos',
    doc: 'home',
    icon: '🎓',
    title: 'Cursos e certificações',
    sub: 'Carrossel automático com a sua formação.',
    blocks: [
      { id: 'titulos', icon: '📝', title: 'Título da seção', sub: 'Textos acima do carrossel', fields: TITULO_SEC('cursosSec') },
      {
        t: 'list',
        id: 'cursos',
        k: 'cursos',
        icon: '🎓',
        title: 'Cursos e certificados',
        itemName: 'curso',
        itemPlural: 'cursos',
        itemTitle: (it) => it.titulo,
        itemSub: (it) => [it.tipo, it.instituicao].filter(Boolean).join(' · '),
        make: () => ({ tipo: 'CERTIFICAÇÃO', titulo: 'Novo curso', instituicao: '', descricao: '', status: '✓ Concluído', icone: '🎓', cor: 'blue', midia: '', ajuste: 'cover', fundo: '', flags: [], linkCertificado: '' }),
        fields: [
          { k: 'tipo', t: 'text', label: 'Tipo', half: true, ph: 'GRADUAÇÃO, CERTIFICAÇÃO…' },
          { k: 'titulo', t: 'text', label: 'Título do curso', half: true },
          { k: 'instituicao', t: 'text', label: 'Instituição', half: true },
          { k: 'status', t: 'text', label: 'Situação', half: true, ph: '✓ Concluído', hint: 'Ex.: ● Em andamento · Conclusão: Dez/2026' },
          { k: 'descricao', t: 'textarea', rows: 3, label: 'Texto (opcional)' },
          { k: 'flags', t: 'tags', label: 'Flags' },
          { k: 'linkCertificado', t: 'url', label: 'Link do certificado (opcional)', ph: 'https://…' },
          { k: 'cor', t: 'select', label: 'Cor do card', options: COR, half: true },
          ...FIELDS_MIDIA
        ]
      }
    ]
  },

  {
    id: 'projetos',
    doc: 'home',
    icon: '🚀',
    title: 'Projetos',
    sub: 'Carrossel automático com os sites que você já criou.',
    blocks: [
      { id: 'titulos', icon: '📝', title: 'Título da seção', sub: 'Textos acima do carrossel', fields: TITULO_SEC('projetosSec') },
      {
        t: 'list',
        id: 'projetos',
        k: 'projetos',
        icon: '🚀',
        title: 'Projetos',
        itemName: 'projeto',
        itemPlural: 'projetos',
        itemTitle: (it) => it.titulo,
        itemSub: (it) => it.tipo,
        make: () => ({ tipo: 'LANDING PAGE', titulo: 'Novo projeto', descricao: '', cor: 'blue', midia: '', ajuste: 'cover', fundo: '', icone: '🌐', flags: [], linkSite: '', linkGithub: '', painelAdmin: false }),
        fields: [
          { k: 'tipo', t: 'text', label: 'Tipo do site', half: true, ph: 'LANDING PAGE, PWA, E-COMMERCE…' },
          { k: 'titulo', t: 'text', label: 'Título do site', half: true },
          { k: 'descricao', t: 'textarea', rows: 6, label: 'Texto' },
          { k: 'flags', t: 'tags', label: 'Flags (tecnologias)' },
          { k: 'linkSite', t: 'url', label: 'Link do site (opcional)', ph: 'https://…' },
          { k: 'linkGithub', t: 'url', label: 'Link do código no GitHub (opcional)', ph: 'https://github.com/…' },
          { k: 'painelAdmin', t: 'toggle', label: '⚙ Painel admin incluído', hint: 'Mostra a etiqueta no card do projeto.' },
          { k: 'cor', t: 'select', label: 'Cor do card', options: COR, half: true },
          ...FIELDS_MIDIA
        ]
      }
    ]
  },

  {
    id: 'contato',
    doc: 'home',
    icon: '✉️',
    title: 'Contato e rodapé',
    sub: 'O bloco "Vamos trabalhar juntos?", as formas de contato e o rodapé.',
    blocks: [
      {
        id: 'texto',
        icon: '💬',
        title: 'Texto "Vamos trabalhar juntos?"',
        sub: 'Título, texto e botão de serviços',
        fields: [
          { k: 'contato.titulo', t: 'text', label: 'Título (parte de cima)', half: true, hint: DICA_QUEBRA },
          { k: 'contato.destaque', t: 'text', label: 'Título (parte em destaque)', half: true },
          { k: 'contato.subtitulo', t: 'textarea', rows: 3, label: 'Texto abaixo do título' },
          { k: 'contato.btnServicos', t: 'text', label: 'Texto do botão que leva à página de serviços', hint: 'Deixe vazio para esconder o botão.' }
        ]
      },
      {
        t: 'list',
        id: 'links',
        k: 'contato.links',
        icon: '📞',
        title: 'Formas de contato',
        itemName: 'contato',
        itemPlural: 'contatos',
        itemTitle: (it) => it.label,
        itemSub: (it) => it.url,
        make: () => ({ icone: '✉', label: 'Novo contato', url: '' }),
        fields: [
          { k: 'icone', t: 'text', label: 'Ícone (um símbolo ou emoji)', half: true, ph: '✉' },
          { k: 'label', t: 'text', label: 'Texto do botão', half: true },
          { k: 'url', t: 'url', label: 'Link', ph: 'https://wa.me/55… · mailto:… · https://instagram.com/…' }
        ]
      },
      {
        id: 'rodape',
        icon: '🔻',
        title: 'Rodapé',
        sub: 'Os dois textos no final da página',
        fields: [
          { k: 'rodape.esquerda', t: 'text', label: 'Texto da esquerda', half: true },
          { k: 'rodape.direita', t: 'text', label: 'Texto da direita', half: true }
        ]
      }
    ]
  },

  {
    id: 'servicos',
    doc: 'servicos',
    icon: '💰',
    title: 'Serviços e valores',
    sub: 'Tudo o que aparece na página de serviços.',
    blocks: [
      {
        id: 'topo',
        icon: '📝',
        title: 'Topo da página',
        sub: 'Título e texto de abertura',
        fields: [
          { k: 'hero.eyebrow', t: 'text', label: 'Frase pequena acima do título' },
          { k: 'hero.titulo', t: 'text', label: 'Título', half: true, hint: DICA_QUEBRA },
          { k: 'hero.destaque', t: 'text', label: 'Palavra em destaque', half: true },
          { k: 'hero.sub', t: 'textarea', rows: 3, label: 'Texto de abertura' }
        ]
      },
      {
        t: 'list',
        id: 'servicos',
        k: 'servicos',
        icon: '🧩',
        title: 'Serviços',
        itemName: 'serviço',
        itemPlural: 'serviços',
        itemTitle: (it) => it.nome,
        itemSub: (it) => [it.prefixo, it.preco].filter(Boolean).join(' '),
        itemIcon: (it) => it.emoji,
        make: () => ({ emoji: '🌐', tipo: 'NOVO SERVIÇO', nome: 'Novo serviço', prefixo: 'a partir de', preco: 'R$0', cor: 'blue', incluso: [], adicionais: [] }),
        fields: [
          { k: 'emoji', t: 'text', label: 'Emoji', half: true },
          { k: 'tipo', t: 'text', label: 'Tipo (etiqueta pequena)', half: true },
          { k: 'nome', t: 'text', label: 'Nome do serviço', half: true },
          { k: 'cor', t: 'select', label: 'Cor do card', options: COR, half: true },
          { k: 'prefixo', t: 'text', label: 'Texto antes do preço', half: true, ph: 'a partir de' },
          { k: 'preco', t: 'text', label: 'Preço', half: true, ph: 'R$400' },
          { k: 'incluso', t: 'lines', label: 'O que inclui', addLabel: 'Adicionar item' },
          {
            k: 'adicionais',
            t: 'list',
            label: 'Adicionais',
            icon: '➕',
            itemName: 'adicional',
            itemPlural: 'adicionais',
            itemTitle: (it) => [it.texto, it.preco].filter(Boolean).join(' · '),
            make: () => ({ texto: 'Novo adicional', preco: 'R$100' }),
            fields: [
              { k: 'texto', t: 'text', label: 'Adicional', half: true },
              { k: 'preco', t: 'text', label: 'Valor', half: true, ph: 'R$100' }
            ]
          }
        ]
      },
      {
        id: 'obsTitulo',
        icon: '📌',
        title: 'Observações: título',
        sub: 'Frase pequena acima dos quadros de observações',
        fields: [{ k: 'obs.eyebrow', t: 'text', label: 'Frase pequena' }]
      },
      {
        t: 'list',
        id: 'blocos',
        k: 'obs.blocos',
        icon: '✅',
        title: 'Observações: quadros',
        itemName: 'quadro',
        itemPlural: 'quadros',
        itemTitle: (it) => it.titulo,
        itemIcon: (it) => it.icone,
        make: () => ({ icone: '✅', titulo: 'Novo quadro', itens: [] }),
        fields: [
          { k: 'icone', t: 'text', label: 'Emoji', half: true },
          { k: 'titulo', t: 'text', label: 'Título do quadro', half: true },
          { k: 'itens', t: 'lines', label: 'Linhas do quadro', addLabel: 'Adicionar linha', hint: 'Comece uma linha com # para criar um subtítulo (ex.: # 15 dias de garantia:). Use **negrito** com dois asteriscos.' }
        ]
      },
      {
        id: 'obsRodape',
        icon: '💬',
        title: 'Observações: frase final',
        sub: 'A frase com o link do WhatsApp',
        fields: [
          { k: 'obs.rodape.antes', t: 'text', label: 'Texto antes do link' },
          { k: 'obs.rodape.linkLabel', t: 'text', label: 'Texto do link', half: true },
          { k: 'obs.rodape.linkUrl', t: 'url', label: 'Endereço do link', half: true, ph: 'https://wa.me/55…' },
          { k: 'obs.rodape.depois', t: 'text', label: 'Texto depois do link' }
        ]
      },
      {
        id: 'cta',
        icon: '🚀',
        title: 'Chamada final',
        sub: 'O bloco "Pronto para ter seu site no ar?"',
        fields: [
          { k: 'cta.titulo', t: 'text', label: 'Título', half: true, hint: DICA_QUEBRA },
          { k: 'cta.destaque', t: 'text', label: 'Emoji ou palavra em destaque', half: true },
          { k: 'cta.sub', t: 'textarea', rows: 3, label: 'Texto' },
          { k: 'cta.btn1Texto', t: 'text', label: 'Botão 1: texto', half: true },
          { k: 'cta.btn1Url', t: 'url', label: 'Botão 1: link', half: true },
          { k: 'cta.btn2Texto', t: 'text', label: 'Botão 2: texto', half: true },
          { k: 'cta.btn2Url', t: 'url', label: 'Botão 2: link', half: true }
        ]
      },
      {
        id: 'rodape',
        icon: '🔻',
        title: 'Rodapé',
        sub: 'Os dois textos no final da página',
        fields: [
          { k: 'rodape.esquerda', t: 'text', label: 'Texto da esquerda', half: true },
          { k: 'rodape.direita', t: 'text', label: 'Texto da direita', half: true }
        ]
      }
    ]
  }
];

/* -------------------------------------------------------------- sanfona */
function accordion({ key, title, sub, icon, body, ctx, level = 0, actions = [] }) {
  const open = ctx.open.has(key);
  const titleEl = h('b', { class: 'acc-title' }, title || 'Sem título');
  const subEl = h('small', { class: 'acc-sub' }, sub || '');
  const root = h('div', { class: `acc lvl${level}${open ? ' open' : ''}` });
  const toggle = h(
    'button',
    { type: 'button', class: 'acc-toggle', 'aria-expanded': String(open) },
    icon ? h('span', { class: 'acc-icon' }, icon) : null,
    h('span', { class: 'acc-txt' }, titleEl, subEl),
    h('span', { class: 'chev', 'aria-hidden': 'true' })
  );
  toggle.addEventListener('click', () => {
    const o = root.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(o));
    if (o) ctx.open.add(key);
    else ctx.open.delete(key);
  });
  root.append(
    h('div', { class: 'acc-head' }, toggle, actions.length ? h('div', { class: 'acc-actions' }, actions) : null),
    h('div', { class: 'acc-body' }, h('div', { class: 'acc-inner' }, body))
  );
  return { root, titleEl, subEl };
}

const iconBtn = (label, text, fn, disabled = false) =>
  h('button', { type: 'button', class: 'ibtn', title: label, 'aria-label': label, disabled, onclick: fn }, text);

function delBtn(fn) {
  const b = h('button', { type: 'button', class: 'ibtn danger', title: 'Remover', 'aria-label': 'Remover' }, '🗑');
  let timer;
  b.addEventListener('click', () => {
    if (b.classList.contains('armed')) {
      clearTimeout(timer);
      fn();
      return;
    }
    b.classList.add('armed');
    b.textContent = 'Confirmar?';
    timer = setTimeout(() => {
      b.classList.remove('armed');
      b.textContent = '🗑';
    }, 2800);
  });
  return b;
}

/* ---------------------------------------------------------------- listas */
function renderList(obj, f, ctx, path, level) {
  let a = get(obj, f.k);
  if (!Array.isArray(a)) {
    a = [];
    set(obj, f.k, a);
  }
  const key = `${path}.${f.k}`;
  const body = h('div', { class: 'list-body' });
  const wrap = accordion({ key, title: f.title || f.label, icon: f.icon, body, ctx, level });
  const itemTitle = f.itemTitle || ((it) => it.titulo || it.texto || it.nome || it.label || 'Item');
  const plural = f.itemPlural || `${f.itemName}s`;
  const count = () => (wrap.subEl.textContent = `${a.length} ${a.length === 1 ? f.itemName : plural}`);

  function move(i, d) {
    const j = i + d;
    if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]];
    draw();
    ctx.dirty();
  }
  function remove(i) {
    a.splice(i, 1);
    draw();
    ctx.dirty();
  }
  function add() {
    const it = f.make();
    it._id = uid();
    a.push(it);
    ctx.open.add(key);
    ctx.open.add(`${key}#${it._id}`);
    draw();
    ctx.dirty();
    const added = body.querySelector('.acc.open:last-of-type') || body.lastElementChild;
    added?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
  }

  function draw() {
    body.innerHTML = '';
    if (!a.length) body.append(h('p', { class: 'empty' }, 'Nada por aqui ainda. Use o botão abaixo para adicionar.'));
    a.forEach((it, i) => {
      if (!it._id) it._id = uid();
      const ikey = `${key}#${it._id}`;
      const inner = h('div', { class: 'fields' });
      inner.append(renderFields(it, f.fields, ctx, ikey, level + 1));
      const item = accordion({
        key: ikey,
        title: itemTitle(it),
        sub: f.itemSub ? f.itemSub(it) : '',
        icon: f.itemIcon ? f.itemIcon(it) : '',
        body: inner,
        ctx,
        level: level + 1,
        actions: [iconBtn('Subir', '↑', () => move(i, -1), i === 0), iconBtn('Descer', '↓', () => move(i, 1), i === a.length - 1), delBtn(() => remove(i))]
      });
      inner.addEventListener('input', () => {
        item.titleEl.textContent = itemTitle(it) || 'Sem título';
        if (f.itemSub) item.subEl.textContent = f.itemSub(it) || '';
      });
      body.append(item.root);
    });
    body.append(h('button', { type: 'button', class: 'btn-add', onclick: add }, `＋ Adicionar ${f.itemName}`));
    count();
  }
  draw();
  return wrap.root;
}

/* ---------------------------------------------------------------- campos */
const wrapFld = (f, ...kids) => h('div', { class: `fld${f.half ? ' half' : ''}` }, ...kids);
const labelEl = (f) => h('span', { class: 'lbl' }, f.label);
const hintEl = (f) => (f.hint ? h('small', { class: 'hint' }, f.hint) : null);

function textField(obj, f, ctx) {
  const input = f.t === 'textarea' ? h('textarea', { rows: f.rows || 3 }) : h('input', { type: 'text', spellcheck: f.t === 'url' ? 'false' : null, inputmode: f.t === 'url' ? 'url' : null });
  if (f.ph) input.placeholder = f.ph;
  input.value = get(obj, f.k) ?? '';
  input.addEventListener('input', () => {
    set(obj, f.k, input.value);
    ctx.dirty();
  });
  return h('label', { class: `fld${f.half ? ' half' : ''}` }, labelEl(f), input, hintEl(f));
}

function selectField(obj, f, ctx) {
  const sel = h('select', {}, f.options.map((o) => h('option', { value: o.v }, o.l)));
  sel.value = get(obj, f.k) || f.options[0].v;
  sel.addEventListener('change', () => {
    set(obj, f.k, sel.value);
    ctx.dirty();
  });
  return h('label', { class: `fld${f.half ? ' half' : ''}` }, labelEl(f), h('div', { class: 'sel' }, sel), hintEl(f));
}

function toggleField(obj, f, ctx) {
  const input = h('input', { type: 'checkbox' });
  input.checked = !!get(obj, f.k);
  input.addEventListener('change', () => {
    set(obj, f.k, input.checked);
    ctx.dirty();
  });
  return h('label', { class: `fld switch${f.half ? ' half' : ''}` }, input, h('span', { class: 'track' }, h('i')), h('span', { class: 'sw-txt' }, h('b', {}, f.label), f.hint ? h('small', {}, f.hint) : null));
}

function colorField(obj, f, ctx) {
  const val = get(obj, f.k) || '';
  const picker = h('input', { type: 'color' });
  picker.value = /^#[0-9a-f]{6}$/i.test(val) ? val : '#1a1a1a';
  const txt = h('input', { type: 'text', placeholder: 'Sem cor (padrão)', spellcheck: 'false' });
  txt.value = val;
  const apply = (v) => {
    set(obj, f.k, v);
    ctx.dirty();
  };
  picker.addEventListener('input', () => {
    txt.value = picker.value;
    apply(picker.value);
  });
  txt.addEventListener('input', () => {
    const v = txt.value.trim();
    if (/^#[0-9a-f]{6}$/i.test(v)) picker.value = v;
    apply(v);
  });
  const clear = h('button', { type: 'button', class: 'ibtn', title: 'Limpar cor', 'aria-label': 'Limpar cor' }, '✕');
  clear.addEventListener('click', () => {
    txt.value = '';
    apply('');
  });
  return wrapFld(f, labelEl(f), h('div', { class: 'color-row' }, picker, txt, clear), hintEl(f));
}

function tagsField(obj, f, ctx) {
  let a = get(obj, f.k);
  if (!Array.isArray(a)) {
    a = [];
    set(obj, f.k, a);
  }
  const box = h('div', { class: 'chips' });
  function draw() {
    box.innerHTML = '';
    a.forEach((t, i) => {
      const inp = h('input', { class: 'chip-in', type: 'text', 'aria-label': 'Editar flag' });
      inp.value = t;
      inp.size = Math.max(3, t.length + 1);
      inp.addEventListener('input', () => {
        a[i] = inp.value;
        inp.size = Math.max(3, inp.value.length + 1);
        ctx.dirty();
      });
      const x = h('button', { type: 'button', class: 'chip-x', 'aria-label': 'Remover flag' }, '×');
      x.addEventListener('click', () => {
        a.splice(i, 1);
        draw();
        ctx.dirty();
      });
      box.append(h('span', { class: 'chip' }, inp, x));
    });
    const add = h('input', { class: 'chip-add', type: 'text', placeholder: '+ nova flag (Enter)' });
    const commit = () => {
      const v = add.value.trim();
      add.value = '';
      if (!v) return;
      a.push(v);
      draw();
      ctx.dirty();
      box.querySelector('.chip-add')?.focus();
    };
    add.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commit();
      }
    });
    add.addEventListener('blur', commit);
    box.append(add);
  }
  draw();
  return wrapFld(f, labelEl(f), box, hintEl(f));
}

function linesField(obj, f, ctx) {
  let a = get(obj, f.k);
  if (!Array.isArray(a)) {
    a = [];
    set(obj, f.k, a);
  }
  const box = h('div', { class: 'lines' });
  function draw() {
    box.innerHTML = '';
    a.forEach((t, i) => {
      const ta = h('textarea', { rows: 1, class: 'line-in', 'aria-label': `Linha ${i + 1}` });
      ta.value = t;
      const grow = () => {
        ta.style.height = 'auto';
        ta.style.height = `${ta.scrollHeight}px`;
      };
      ta.addEventListener('input', () => {
        a[i] = ta.value;
        grow();
        ctx.dirty();
      });
      const swap = (d) => {
        const j = i + d;
        if (j < 0 || j >= a.length) return;
        [a[i], a[j]] = [a[j], a[i]];
        draw();
        ctx.dirty();
      };
      box.append(
        h(
          'div',
          { class: 'line-row' },
          ta,
          iconBtn('Subir', '↑', () => swap(-1), i === 0),
          iconBtn('Descer', '↓', () => swap(1), i === a.length - 1),
          iconBtn('Remover', '×', () => {
            a.splice(i, 1);
            draw();
            ctx.dirty();
          })
        )
      );
      raf(grow);
    });
    box.append(
      h(
        'button',
        {
          type: 'button',
          class: 'btn-add small',
          onclick: () => {
            a.push('');
            draw();
            ctx.dirty();
            const rows = box.querySelectorAll('.line-in');
            rows[rows.length - 1]?.focus();
          }
        },
        `＋ ${f.addLabel || 'Adicionar'}`
      )
    );
  }
  draw();
  return wrapFld(f, labelEl(f), box, hintEl(f));
}

/* ---------------------------------------------------------------- upload */
function cloudUpload(file, onProgress) {
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', CLOUDINARY.uploadPreset);
    const x = new XMLHttpRequest();
    x.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY.cloudName}/auto/upload`);
    x.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    x.onload = () => {
      let j = {};
      try {
        j = JSON.parse(x.responseText);
      } catch {
        /* resposta inválida */
      }
      if (x.status >= 200 && x.status < 300 && j.secure_url) resolve(j);
      else reject(new Error(j.error?.message || `Erro ${x.status} no Cloudinary`));
    };
    x.onerror = () => reject(new Error('Sem conexão com o Cloudinary.'));
    x.send(fd);
  });
}

function optimized(r) {
  const u = r.secure_url;
  if (!u.includes('/upload/')) return u;
  return u.replace('/upload/', r.resource_type === 'video' ? '/upload/q_auto/' : '/upload/q_auto,f_auto/');
}

function imageField(obj, f, ctx) {
  const size = f.size || { w: 1280, h: 720, note: '' };
  const urlIn = h('input', { type: 'text', placeholder: 'Cole um link ou envie um arquivo', spellcheck: 'false' });
  urlIn.value = get(obj, f.k) || '';
  const prev = h('div', { class: 'up-prev' });
  const msg = h('p', { class: 'up-msg' });
  const fill = h('i');
  const fileIn = h('input', { type: 'file', accept: 'image/*,video/*', hidden: true });
  const pick = h('button', { type: 'button', class: 'btn-soft' }, '📤 Enviar arquivo');
  const clear = h('button', { type: 'button', class: 'btn-soft ghost' }, '🗑 Remover');
  const drop = h(
    'div',
    { class: 'up-drop' },
    prev,
    h(
      'div',
      { class: 'up-side' },
      h('div', { class: 'up-size' }, h('b', {}, `📐 Tamanho ideal: ${size.w} × ${size.h} px`), size.note ? h('span', {}, size.note) : null),
      h('div', { class: 'up-actions' }, pick, clear),
      h('div', { class: 'up-bar' }, fill),
      msg
    )
  );

  function showPrev() {
    const u = urlIn.value.trim();
    prev.innerHTML = '';
    if (!u) return prev.append(h('span', { class: 'up-empty' }, 'Sem arquivo'));
    prev.append(isVideoUrl(u) ? h('video', { src: u, muted: true, loop: true, autoplay: true, playsinline: true }) : h('img', { src: u, alt: 'Prévia' }));
  }
  function setUrl(u) {
    urlIn.value = u;
    set(obj, f.k, u);
    showPrev();
    ctx.dirty();
  }
  async function send(file) {
    if (!file) return;
    const isV = file.type.startsWith('video/');
    if (!isV && !file.type.startsWith('image/')) return ctx.toast('Escolha uma imagem ou um vídeo.', 'err');
    const max = isV ? 100 : 10;
    if (file.size > max * 1048576) return ctx.toast(`Arquivo grande demais (máximo ${max} MB).`, 'err');
    drop.classList.add('busy');
    fill.style.width = '0%';
    msg.className = 'up-msg';
    msg.textContent = 'Enviando…';
    try {
      const r = await cloudUpload(file, (p) => {
        fill.style.width = `${p}%`;
        msg.textContent = `Enviando… ${p}%`;
      });
      setUrl(optimized(r));
      const alvo = size.w / size.h;
      const ok = r.width && r.height && Math.abs(r.width / r.height - alvo) < alvo * 0.12;
      msg.className = `up-msg ${ok ? 'ok' : 'warn'}`;
      msg.textContent = `Enviado: ${r.width} × ${r.height} px ${ok ? '✓ proporção ideal' : `· proporção diferente de ${size.w} × ${size.h}; a imagem pode ser cortada ou ajustada`}`;
      ctx.toast('Arquivo enviado!');
    } catch (e) {
      msg.className = 'up-msg err';
      msg.textContent = e.message;
      ctx.toast(`Falha no envio: ${e.message}`, 'err');
    } finally {
      drop.classList.remove('busy');
      fileIn.value = '';
    }
  }

  urlIn.addEventListener('input', () => {
    set(obj, f.k, urlIn.value.trim());
    showPrev();
    ctx.dirty();
  });
  pick.addEventListener('click', () => fileIn.click());
  clear.addEventListener('click', () => {
    setUrl('');
    msg.className = 'up-msg';
    msg.textContent = '';
    fill.style.width = '0%';
  });
  fileIn.addEventListener('change', () => send(fileIn.files[0]));
  ['dragenter', 'dragover'].forEach((ev) =>
    drop.addEventListener(ev, (e) => {
      e.preventDefault();
      drop.classList.add('over');
    })
  );
  ['dragleave', 'drop'].forEach((ev) =>
    drop.addEventListener(ev, (e) => {
      e.preventDefault();
      drop.classList.remove('over');
    })
  );
  drop.addEventListener('drop', (e) => send(e.dataTransfer?.files?.[0]));

  showPrev();
  return wrapFld(f, labelEl(f), drop, h('div', { class: 'url-row' }, h('span', {}, 'Link'), urlIn));
}

/* ----------------------------------------------------------------- montagem */
function renderField(obj, f, ctx, path, level) {
  switch (f.t) {
    case 'list': {
      const w = renderList(obj, f, ctx, path, level);
      w.classList.add('fld');
      return w;
    }
    case 'image':
      return imageField(obj, f, ctx);
    case 'tags':
      return tagsField(obj, f, ctx);
    case 'lines':
      return linesField(obj, f, ctx);
    case 'toggle':
      return toggleField(obj, f, ctx);
    case 'select':
      return selectField(obj, f, ctx);
    case 'color':
      return colorField(obj, f, ctx);
    default:
      return textField(obj, f, ctx);
  }
}

function renderFields(obj, fields, ctx, path, level = 0) {
  const frag = document.createDocumentFragment();
  fields.forEach((f) => frag.append(renderField(obj, f, ctx, path, level)));
  return frag;
}

export function mountPage(container, page, state, ctx) {
  container.innerHTML = '';
  const doc = state[page.doc];
  page.blocks.forEach((b, i) => {
    let node;
    if (b.t === 'list') node = renderList(doc, b, ctx, page.id, 0);
    else {
      const body = h('div', { class: 'fields' });
      body.append(renderFields(doc, b.fields, ctx, `${page.id}.${b.id}`, 1));
      node = accordion({ key: `${page.id}.${b.id}`, title: b.title, sub: b.sub, icon: b.icon, body, ctx, level: 0 }).root;
    }
    node.style.setProperty('--i', String(i));
    node.classList.add('enter');
    container.append(node);
  });
}
