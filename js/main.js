// Tab navigation and app start-up.

const TABS = ['learn', 'hcp', 'opening', 'responding', 'rebid', 'rrebid', 'overcalls', 'conventions', 'declarer', 'defense', 'play'];

// `fromLesson` is the lesson whose "Practice" button opened the tab, if any.
function showTab(name, fromLesson) {
  if (name === 'advanced') name = 'declarer'; // the old Advanced tab is now part of Declarer Play
  if (!TABS.includes(name)) name = 'learn';
  document.querySelectorAll('.tabs [data-tab]').forEach(btn => {
    const active = btn.dataset.tab === name;
    btn.classList.toggle('active', active);
    if (active) btn.setAttribute('aria-current', 'page');
    else btn.removeAttribute('aria-current');
  });
  // The Practice menu button is highlighted, and names the drill, while a drill is open.
  const drill = document.querySelector(`.practice-menu [data-tab="${name}"]`);
  document.querySelector('.practice-menu .menu-button').classList.toggle('active', !!drill);
  document.getElementById('practice-label').innerHTML = drill
    ? `<span class="practice-prefix">${L('Practice', 'תרגול')}: </span>${drill.textContent}` : L('Practice', 'תרגול');
  TABS.forEach(t => (document.getElementById('tab-' + t).hidden = t !== name));
  if (location.hash !== '#' + name) history.replaceState(null, '', '#' + name);
  Saved.set('tab', name);
  Learn.showReturnBar(name, fromLesson);
}

document.addEventListener('click', e => {
  const target = e.target.closest('[data-tab], [data-goto]');
  if (!target) return;
  const tab = target.dataset.tab || target.dataset.goto;
  showTab(tab, target.dataset.lesson === undefined ? undefined : Number(target.dataset.lesson));
});
window.addEventListener('hashchange', () => showTab(location.hash.slice(1)));

Sound.init();
Learn.init();
HcpTrainer.init();
OpeningTrainer.init();
RespondingTrainer.init();
RebidTrainer.init();
ResponderRebidTrainer.init();
OvercallTrainer.init();
initConventions();
Play.init();
LeadTrainer.init();
DeclarerPlay.init();
UpdateCheck.init();
showTab(location.hash.slice(1) || Saved.get('tab')); // the address wins, else where you were last
