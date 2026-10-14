// Tab navigation and app start-up.

const TABS = ['learn', 'hcp', 'opening', 'play'];

function showTab(name) {
  if (!TABS.includes(name)) name = 'learn';
  document.querySelectorAll('.tabs [data-tab]').forEach(btn => {
    const active = btn.dataset.tab === name;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', active);
  });
  TABS.forEach(t => (document.getElementById('tab-' + t).hidden = t !== name));
  if (location.hash !== '#' + name) history.replaceState(null, '', '#' + name);
}

document.addEventListener('click', e => {
  const target = e.target.closest('[data-tab], [data-goto]');
  if (target) showTab(target.dataset.tab || target.dataset.goto);
});
window.addEventListener('hashchange', () => showTab(location.hash.slice(1)));

Learn.init();
HcpTrainer.init();
OpeningTrainer.init();
Play.init();
showTab(location.hash.slice(1));
