// Language selection: English or Hebrew. The choice is kept in the URL (?lang=he) and in
// localStorage, and changing it reloads the page, so every module picks its text once at load
// time with L(english, hebrew).

const LANG = (() => {
  const fromUrl = new URLSearchParams(location.search).get('lang');
  if (fromUrl === 'he' || fromUrl === 'en') return fromUrl;
  try { return localStorage.getItem('bridge-lang') === 'he' ? 'he' : 'en'; } catch { return 'en'; }
})();

const L = (en, he) => (LANG === 'he' ? he : en);

// Where you were, kept in this browser so the app reopens there: the tab, the lesson and the
// Declarer Play topic. Storage can be blocked (private windows), so failures are ignored.
const Saved = {
  get(key) {
    try { return localStorage.getItem('bridge-' + key); } catch { return null; }
  },
  set(key, value) {
    try { localStorage.setItem('bridge-' + key, value); } catch { /* not remembered */ }
  },
};

function setLanguage(lang) {
  try { localStorage.setItem('bridge-lang', lang); } catch { /* storage may be blocked; the URL still carries it */ }
  const url = new URL(location.href);
  url.searchParams.set('lang', lang);
  location.href = url.toString();
}

// Static text in index.html carries its Hebrew version in a data-he attribute.
function applyStaticLanguage() {
  document.documentElement.lang = LANG;
  document.documentElement.dir = LANG === 'he' ? 'rtl' : 'ltr';
  document.querySelectorAll('.lang-switch button').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === LANG);
    b.setAttribute('aria-pressed', b.dataset.lang === LANG);
    b.addEventListener('click', () => { if (b.dataset.lang !== LANG) setLanguage(b.dataset.lang); });
  });
  if (LANG !== 'he') return;
  document.title = 'מאמן ברידג\'';
  document.querySelectorAll('[data-he]').forEach(el => { el.innerHTML = el.dataset.he; });
  document.querySelectorAll('[data-he-label]').forEach(el => el.setAttribute('aria-label', el.dataset.heLabel));
}

applyStaticLanguage();
