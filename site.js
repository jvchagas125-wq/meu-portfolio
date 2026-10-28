// site.js — busca o conteúdo salvo pelo painel e entrega às páginas públicas.
// Se o Firebase ainda não estiver configurado (ou estiver fora do ar), o site usa o conteúdo padrão.

import { FIREBASE_CONFIG } from './firebase-config.js';
import { deepMerge, clone } from './content-default.js';

const SDK = 'https://www.gstatic.com/firebasejs/10.12.2';
const KEY = 'jv_content_v1_';

export const isConfigured = () => !!FIREBASE_CONFIG.apiKey && !String(FIREBASE_CONFIG.apiKey).startsWith('COLE');

function readCache(id) {
  try {
    return JSON.parse(localStorage.getItem(KEY + id));
  } catch {
    return null;
  }
}
function writeCache(id, data) {
  try {
    localStorage.setItem(KEY + id, JSON.stringify(data));
  } catch {
    /* cache é opcional */
  }
}

async function fetchRemote(id, timeoutMs) {
  if (!isConfigured()) return null;
  const job = (async () => {
    const [{ initializeApp, getApps }, { getFirestore, doc, getDoc }] = await Promise.all([
      import(`${SDK}/firebase-app.js`),
      import(`${SDK}/firebase-firestore.js`)
    ]);
    const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
    const snap = await getDoc(doc(getFirestore(app), 'site', id));
    return snap.exists() ? snap.data() : null;
  })().catch((e) => {
    console.warn('Não foi possível ler o conteúdo do painel:', e);
    return null;
  });
  return Promise.race([job, new Promise((r) => setTimeout(() => r(null), timeoutMs))]);
}

/**
 * Mostra o conteúdo o mais rápido possível:
 *  - com cache: desenha na hora e atualiza em seguida se algo mudou;
 *  - sem cache: espera o banco (até 3,5 s) ou usa o padrão.
 */
export async function bootPage({ id, defaults, render }) {
  const cached = readCache(id);
  let shown = null;
  const show = (data) => {
    const merged = deepMerge(defaults, data);
    const sig = JSON.stringify(merged);
    if (sig !== shown) {
      shown = sig;
      render(merged);
    }
  };

  if (cached) show(cached);
  const remote = await fetchRemote(id, cached ? 6000 : 3500);
  if (remote) {
    writeCache(id, remote);
    show(remote);
  } else if (!cached) {
    show(clone(defaults));
  }
}
