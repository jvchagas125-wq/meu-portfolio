// admin.js — login (Firebase Auth), leitura/gravação (Firestore) e navegação do painel.
// A senha NÃO fica neste arquivo: ela existe só no Firebase Authentication.

import { FIREBASE_CONFIG, ADMIN_EMAIL_DOMAIN } from './firebase-config.js';
import { DEFAULT_HOME, DEFAULT_SERVICOS, deepMerge, clone } from './content-default.js';
import { PAGES, mountPage, ensureIds, h } from './editor.js';

const SDK = 'https://www.gstatic.com/firebasejs/10.12.2';
const $ = (s) => document.querySelector(s);
const configured = !!FIREBASE_CONFIG.apiKey && !String(FIREBASE_CONFIG.apiKey).startsWith('COLE');

const DEFAULTS = { home: DEFAULT_HOME, servicos: DEFAULT_SERVICOS };
const state = { home: null, servicos: null };
const dirtyDocs = new Set();
const fromDefault = new Set();
let current = PAGES[0];
let auth;
let db;
let fb = {};

/* ------------------------------------------------------------- avisos */
function toast(text, type = 'ok') {
  const icon = { ok: '✓', err: '!', info: 'i' }[type] || '✓';
  const el = h('div', { class: `toast ${type}`, role: type === 'err' ? 'alert' : 'status' }, h('span', { class: 'ti' }, icon), h('span', {}, text));
  $('#toasts').append(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 400);
  }, type === 'err' ? 6000 : 3200);
}

const ctx = {
  open: new Set(),
  dirty() {
    dirtyDocs.add(current.doc);
    paintDirty();
  },
  toast
};

/* ------------------------------------------------------------ login */
const toEmail = (u) => {
  const v = u.trim();
  return v.includes('@') ? v : `${v.toLowerCase()}@${ADMIN_EMAIL_DOMAIN}`;
};

function authError(e) {
  switch (e?.code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return 'Usuário ou senha incorretos.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.';
    case 'auth/network-request-failed':
      return 'Sem conexão. Verifique a internet e tente de novo.';
    case 'auth/operation-not-allowed':
      return 'O login por e-mail e senha ainda não foi ativado no Firebase (veja CONFIGURAR-PAINEL.md).';
    default:
      return `Não foi possível entrar${e?.code ? ` (${e.code})` : ''}.`;
  }
}

function bindLogin() {
  const form = $('#loginForm');
  const msg = $('#loginMsg');
  const btn = $('#loginBtn');
  $('#eye').addEventListener('click', () => {
    const p = $('#pass');
    const show = p.type === 'password';
    p.type = show ? 'text' : 'password';
    $('#eye').setAttribute('aria-pressed', String(show));
    $('#eye').textContent = show ? '🙈' : '👁';
  });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';
    const u = $('#user').value;
    const p = $('#pass').value;
    if (!u.trim() || !p) {
      msg.textContent = 'Preencha o usuário e a senha.';
      return;
    }
    btn.classList.add('loading');
    btn.disabled = true;
    try {
      await fb.signInWithEmailAndPassword(auth, toEmail(u), p);
    } catch (err) {
      msg.textContent = authError(err);
      form.classList.remove('shake');
      void form.offsetWidth;
      form.classList.add('shake');
    } finally {
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  });
}

/* ------------------------------------------------------- dados / salvar */
async function loadDoc(id) {
  const snap = await fb.getDoc(fb.doc(db, 'site', id));
  if (snap.exists()) {
    state[id] = deepMerge(DEFAULTS[id], snap.data());
  } else {
    state[id] = clone(DEFAULTS[id]);
    fromDefault.add(id);
    dirtyDocs.add(id);
  }
  ensureIds(state[id]);
}

function saveError(e) {
  if (e?.code === 'permission-denied') return 'Sem permissão para salvar. Confira as regras do Firestore e se você entrou com a conta certa.';
  if (e?.code === 'unavailable') return 'Sem conexão com o banco. Tente de novo em instantes.';
  return `Não foi possível salvar${e?.code ? ` (${e.code})` : ''}.`;
}

let saving = false;
async function saveAll() {
  if (saving) return;
  if (!dirtyDocs.size) return toast('Não há alterações para salvar.', 'info');
  saving = true;
  const btn = $('#saveBtn');
  btn.classList.add('loading');
  btn.disabled = true;
  try {
    for (const id of [...dirtyDocs]) {
      await fb.setDoc(fb.doc(db, 'site', id), clone(state[id]));
      dirtyDocs.delete(id);
      fromDefault.delete(id);
    }
    toast('Alterações publicadas no site!');
    btn.classList.add('done');
    setTimeout(() => btn.classList.remove('done'), 1600);
  } catch (e) {
    console.error(e);
    toast(saveError(e), 'err');
  } finally {
    saving = false;
    btn.classList.remove('loading');
    paintDirty();
  }
}

/* ---------------------------------------------------------------- telas */
function paintDirty() {
  const any = dirtyDocs.size > 0;
  $('#saveBtn').disabled = !any || saving;
  $('#saveBtn').classList.toggle('ready', any);
  $('#dirtyPill').classList.toggle('on', any);
  document.querySelectorAll('.nav-item').forEach((b) => {
    const p = PAGES.find((x) => x.id === b.dataset.id);
    b.classList.toggle('has-dirty', dirtyDocs.has(p.doc));
  });
  const banner = $('#banner');
  const showBanner = fromDefault.has(current.doc);
  banner.hidden = !showBanner;
  if (showBanner) banner.textContent = 'Estes são os textos que já estão no site. Clique em "Salvar e publicar" para guardá-los no painel — a partir daí tudo o que você editar aparece no site.';
}

function buildNav() {
  const nav = $('#nav');
  nav.innerHTML = '';
  PAGES.forEach((p) => {
    const b = h('button', { type: 'button', class: 'nav-item', 'data-id': p.id }, h('span', { class: 'ni-icon' }, p.icon), h('span', { class: 'ni-txt' }, p.title), h('i', { class: 'ni-dot' }));
    b.addEventListener('click', () => goto(p.id));
    nav.append(b);
  });
}

function goto(id) {
  current = PAGES.find((p) => p.id === id) || PAGES[0];
  document.querySelectorAll('.nav-item').forEach((b) => b.classList.toggle('active', b.dataset.id === current.id));
  $('#pageTitle').textContent = current.title;
  $('#pageSub').textContent = current.sub;
  mountPage($('#view'), current, state, ctx);
  paintDirty();
  window.scrollTo({ top: 0 });
  closeDrawer();
  history.replaceState(null, '', `#${current.id}`);
}

function openDrawer() {
  document.body.classList.add('drawer');
}
function closeDrawer() {
  document.body.classList.remove('drawer');
}

/* ------------------------------------------------------- entrar / sair */
let hideLoginTimer;
async function enter() {
  try {
    await Promise.all(['home', 'servicos'].map(loadDoc));
  } catch (e) {
    console.error(e);
    toast(e?.code === 'permission-denied' ? 'O Firestore recusou a leitura. Confira as regras (veja CONFIGURAR-PAINEL.md).' : 'Não foi possível carregar o conteúdo do banco.', 'err');
    return;
  }
  buildNav();
  $('#app').hidden = false;
  $('#login').classList.add('out');
  clearTimeout(hideLoginTimer);
  hideLoginTimer = setTimeout(() => {
    if (!$('#app').hidden) $('#login').hidden = true;
  }, 450);
  goto((location.hash || '').slice(1) || PAGES[0].id);
}

function leave() {
  clearTimeout(hideLoginTimer);
  state.home = state.servicos = null;
  dirtyDocs.clear();
  fromDefault.clear();
  ctx.open.clear();
  $('#app').hidden = true;
  $('#login').hidden = false;
  $('#login').classList.remove('out');
  $('#pass').value = '';
}

/* ----------------------------------------------------------------- boot */
async function boot() {
  bindLogin();
  if (!configured) {
    $('#loginForm').hidden = true;
    $('#setup').hidden = false;
    return;
  }
  try {
    const [appM, authM, fsM] = await Promise.all([import(`${SDK}/firebase-app.js`), import(`${SDK}/firebase-auth.js`), import(`${SDK}/firebase-firestore.js`)]);
    const app = appM.initializeApp(FIREBASE_CONFIG);
    auth = authM.getAuth(app);
    db = fsM.getFirestore(app);
    fb = { ...authM, ...fsM };
    authM.onAuthStateChanged(auth, (user) => (user ? enter() : leave()));
  } catch (e) {
    console.error(e);
    $('#loginMsg').textContent = 'Não foi possível carregar o Firebase. Verifique a internet.';
  }
}

$('#saveBtn').addEventListener('click', saveAll);
$('#logoutBtn').addEventListener('click', async () => {
  if (dirtyDocs.size && !confirm('Você tem alterações não salvas. Sair mesmo assim?')) return;
  dirtyDocs.clear();
  await fb.signOut(auth);
});
$('#menuBtn').addEventListener('click', openDrawer);
$('#scrim').addEventListener('click', closeDrawer);
addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
    e.preventDefault();
    if (!$('#app').hidden) saveAll();
  }
  if (e.key === 'Escape') closeDrawer();
});
addEventListener('beforeunload', (e) => {
  if (dirtyDocs.size) {
    e.preventDefault();
    e.returnValue = '';
  }
});

boot();
