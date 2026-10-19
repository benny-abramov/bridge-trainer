// Tells you when a newer version of the app has been published. The loaded page's version is in
// <meta name="app-version">; version.json on the site holds the latest one. Both are written by
// tools/stamp_version.py. The check runs when the page opens and whenever you come back to the tab
// (phones can keep a tab open for days), at most once a minute.

const UpdateCheck = (() => {
  const CHECK_EVERY = 60 * 1000;
  let lastCheck = 0;

  async function check() {
    const mine = document.querySelector('meta[name="app-version"]')?.content;
    if (!mine || document.getElementById('update-banner') || Date.now() - lastCheck < CHECK_EVERY) return;
    lastCheck = Date.now();
    try {
      const res = await fetch('version.json', { cache: 'no-store' });
      if (!res.ok) return;
      const { version } = await res.json();
      if (version && version !== mine) show();
    } catch { /* offline, or opened from a file: nothing to compare */ }
  }

  function show() {
    const bar = document.createElement('div');
    bar.id = 'update-banner';
    bar.className = 'update-banner';
    bar.setAttribute('role', 'status');
    bar.innerHTML = `
      <span>${L('A new version of the app is available.', 'גרסה חדשה של האפליקציה זמינה.')}</span>
      <button class="btn" type="button" data-act="reload">${L('Reload', 'טעינה מחדש')}</button>
      <button class="update-close" type="button" data-act="close" aria-label="${L('Close', 'סגירה')}">×</button>`;
    bar.querySelector('[data-act="reload"]').addEventListener('click', () => location.reload());
    bar.querySelector('[data-act="close"]').addEventListener('click', () => bar.remove());
    document.body.appendChild(bar);
  }

  function init() {
    check();
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check(); });
  }

  return { init };
})();
