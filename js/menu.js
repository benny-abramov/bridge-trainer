// Drop-down menus: the Practice menu in the header and the lesson picker. Markup:
//   <div class="menu"><button class="menu-button" aria-expanded="false">…</button>
//     <div class="menu-list" hidden> …buttons… </div></div>
// A click on the menu button opens or closes its list; choosing an item, clicking elsewhere or
// pressing Escape closes it. The items do their own work (for example data-tab switches tabs).

const Menu = (() => {
  function close(menu, focusButton) {
    const button = menu.querySelector('.menu-button');
    menu.querySelector('.menu-list').hidden = true;
    button.setAttribute('aria-expanded', 'false');
    if (focusButton) button.focus();
  }

  function closeAll(except) {
    document.querySelectorAll('.menu').forEach(m => { if (m !== except && !m.querySelector('.menu-list').hidden) close(m); });
  }

  function open(menu) {
    closeAll(menu);
    const list = menu.querySelector('.menu-list');
    list.hidden = false;
    menu.querySelector('.menu-button').setAttribute('aria-expanded', 'true');
    (list.querySelector('.active') || list.querySelector('button')).focus({ preventScroll: true });
    list.querySelector('.active')?.scrollIntoView({ block: 'nearest' });
  }

  document.addEventListener('click', e => {
    const button = e.target.closest('.menu-button');
    if (button) {
      const menu = button.closest('.menu');
      if (menu.querySelector('.menu-list').hidden) open(menu);
      else close(menu);
      return;
    }
    const item = e.target.closest('.menu-list button');
    const menu = item?.closest('.menu'); // an item's own click may already have rebuilt its menu
    closeAll();
    menu?.querySelector('.menu-button').focus({ preventScroll: true });
  });

  document.addEventListener('keydown', e => {
    const menu = e.target.closest?.('.menu');
    if (!menu || menu.querySelector('.menu-list').hidden) return;
    if (e.key === 'Escape') { close(menu, true); return; }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const items = [...menu.querySelectorAll('.menu-list button')];
    const i = items.indexOf(document.activeElement);
    items[(i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length].focus();
  });

  return { closeAll };
})();
