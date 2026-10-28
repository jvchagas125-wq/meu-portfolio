// site.js — entrega às páginas públicas o conteúdo salvo pelo painel, em tempo real.
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
    /* o cache é opcional */
  }
}

// Fica ouvindo o documento: o banco avisa a cada alteração salva no painel.
async function listen(id, onData, onError) {
  try {
    const [{ initializeApp, getApps }, { getFirestore, doc, onSnapshot }] = await Promise.all([
      import(`${SDK}/firebase-app.js`),
      import(`${SDK}/firebase-firestore.js`)
    ]);
    const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
    return onSnapshot(
      doc(getFirestore(app), 'site', id),
      (snap) => onData(snap.exists() ? snap.data() : null),
      (err) => {
        console.warn('Não foi possível ouvir o conteúdo do painel:', err);
        onError(err);
      }
    );
  } catch (e) {
    console.warn('Não foi possível carregar o Firebase:', e);
    onError(e);
  }
}

/**
 * Mostra o conteúdo o mais rápido possível e o mantém atualizado:
 *  - com cache: desenha na hora; o banco confirma (ou corrige) em seguida;
 *  - sem cache: espera o banco (até 3,5 s) ou usa o conteúdo padrão;
 *  - depois disso, cada "Salvar e publicar" no painel redesenha a página sozinha.
 * render(dados, { live }) — live = true quando é uma atualização depois do primeiro desenho.
 */
export async function bootPage({ id, defaults, render }) {
  const cached = readCache(id);
  let shown = null;
  const show = (data) => {
    const merged = deepMerge(defaults, data);
    const sig = JSON.stringify(merged);
    if (sig === shown) return;
    const live = shown !== null;
    shown = sig;
    render(merged, { live });
  };

  if (cached) show(cached);
  if (!isConfigured()) {
    if (!cached) show(clone(defaults));
    return;
  }

  await new Promise((resolve) => {
    let released = false;
    const release = () => {
      if (!released) {
        released = true;
        resolve();
      }
    };
    const fallback = () => {
      if (shown === null) show(clone(defaults));
      release();
    };
    const timer = setTimeout(fallback, cached ? 6000 : 3500);
    listen(
      id,
      (data) => {
        clearTimeout(timer);
        if (data) {
          writeCache(id, data);
          show(data);
        } else if (shown === null) {
          show(clone(defaults));
        }
        release();
      },
      () => {
        clearTimeout(timer);
        fallback();
      }
    );
  });
}
