// Card play. In "declare" mode you are South and also play North (dummy) against computer
// defenders; in "defend" mode you are West, defending with a computer partner against a computer declarer.

const Play = (() => {
  const AI_DELAY = 650;
  const TRICK_PAUSE = 1100;
  let st = null;
  let timer = null;
  let showAll = false;
  let mode = 'declare';
  const $ = id => document.getElementById(id);

  // ---------- Setting up a deal ----------

  function cloneHands(hands) {
    return hands.map(h => h.map(c => ({ ...c })));
  }

  // Pick a reasonable contract for North-South from their combined strength and fit.
  function chooseContract(north, south) {
    const pts = hcp(north) + hcp(south);
    const ln = suitLengths(north), ls = suitLengths(south);
    const fit = s => ln[s] + ls[s];

    let strain = 'N';
    const majors = ['S', 'H'].filter(s => fit(s) >= 8).sort((a, b) => fit(b) - fit(a));
    const minors = ['D', 'C'].filter(s => fit(s) >= 9).sort((a, b) => fit(b) - fit(a));
    if (majors.length) strain = majors[0];
    else if (minors.length && !(isBalanced(north) && isBalanced(south))) strain = minors[0];

    let level;
    if (strain === 'N') level = pts >= 33 ? 6 : pts >= 25 ? 3 : pts >= 23 ? 2 : 1;
    else if (strain === 'S' || strain === 'H') level = pts >= 33 ? 6 : pts >= 26 ? 4 : pts >= 23 ? 3 : 2;
    else level = pts >= 33 ? 6 : pts >= 29 ? 5 : pts >= 26 ? 4 : pts >= 23 ? 3 : 2;
    return { level, strain };
  }

  // Deal four hands with North-South holding the stronger cards and South (declarer) the stronger hand.
  function dealTable() {
    let hands = dealHands();
    if (hcp(hands[0]) + hcp(hands[2]) < hcp(hands[1]) + hcp(hands[3])) {
      hands = [hands[1], hands[2], hands[3], hands[0]];
    }
    if (hcp(hands[0]) > hcp(hands[2])) [hands[0], hands[2]] = [hands[2], hands[0]];
    return { hands, contract: chooseContract(hands[0], hands[2]) };
  }

  function newDeal(replay) {
    clearTimeout(timer);
    const table = replay ? { hands: cloneHands(replay.hands), contract: replay.contract } : dealTable();
    st = {
      original: { hands: cloneHands(table.hands), contract: table.contract },
      hands: table.hands,
      contract: table.contract,
      trump: table.contract.strain === 'N' ? null : table.contract.strain,
      turn: 3, // West makes the opening lead (declarer's left)
      trick: [],
      lastTrick: null,
      tricks: [0, 0], // [North-South, East-West]
      busy: false,
      done: false,
      started: false,
      hint: null,
    };
    render();
    scheduleAI();
  }

  // ---------- Rules ----------

  function legalCards(seat) {
    const hand = st.hands[seat];
    if (!st.trick.length) return hand;
    const led = st.trick[0].card.suit;
    const follow = hand.filter(c => c.suit === led);
    return follow.length ? follow : hand;
  }

  // Does card `a` beat the card `b` that is currently winning the trick?
  function beats(a, b) {
    if (a.suit === b.suit) return a.value > b.value;
    return a.suit === st.trump;
  }

  function currentWinner(trick) {
    return trick.reduce((best, t) => (beats(t.card, best.card) ? t : best));
  }

  const isHuman = seat => (mode === 'declare' ? seat % 2 === 0 : seat === 3);
  const sameSide = (a, b) => a % 2 === b % 2;
  const yourSeat = () => (mode === 'declare' ? 2 : 3);

  // ---------- Playing cards ----------

  function playCard(seat, card) {
    if (st.done || st.busy || seat !== st.turn) return;
    const hand = st.hands[seat];
    hand.splice(hand.indexOf(card), 1);
    st.trick.push({ seat, card });
    Sound.cardPlayed();
    st.started = true;
    st.hint = null;

    if (st.trick.length < 4) {
      st.turn = (seat + 1) % 4;
      render();
      scheduleAI();
      return;
    }

    const winner = currentWinner(st.trick).seat;
    st.tricks[winner % 2]++;
    st.turn = winner;
    st.busy = true;
    render();
    timer = setTimeout(() => {
      st.lastTrick = st.trick;
      st.trick = [];
      st.busy = false;
      if (st.tricks[0] + st.tricks[1] === 13) st.done = true;
      render();
      scheduleAI();
    }, TRICK_PAUSE);
  }

  function scheduleAI() {
    if (st.done || st.busy || isHuman(st.turn)) return;
    timer = setTimeout(() => playCard(st.turn, chooseCard(st.turn)), AI_DELAY);
  }

  // ---------- Simple card-play strategy (used by the computer and for hints) ----------

  const lowest = cards => cards.reduce((a, b) => (b.value < a.value ? b : a));

  function bySuit(hand) {
    const groups = {};
    hand.forEach(c => (groups[c.suit] = groups[c.suit] || []).push(c));
    Object.values(groups).forEach(g => g.sort((a, b) => b.value - a.value));
    return groups;
  }

  // A card is a "master" when nobody else still holds a higher card in its suit.
  function isMaster(card, seat) {
    return st.hands.every((h, i) => i === seat || !h.some(c => c.suit === card.suit && c.value > card.value));
  }

  // Lead from the longest suit: top of a sequence, fourth best, top of a doubleton, top of nothing.
  function longSuitLead(seat) {
    const groups = bySuit(st.hands[seat]);
    let suits = Object.keys(groups);
    const nonTrump = suits.filter(s => s !== st.trump);
    if (nonTrump.length) suits = nonTrump;

    const sequences = suits.filter(s => {
      const g = groups[s];
      return g.length >= 2 && g[0].value >= 11 && g[1].value === g[0].value - 1;
    });
    if (sequences.length) {
      const s = sequences.sort((a, b) => groups[b].length - groups[a].length)[0];
      return groups[s][0];
    }

    const s = suits.sort((a, b) => groups[b].length - groups[a].length || groups[b][0].value - groups[a][0].value)[0];
    const g = groups[s];
    if (g.length >= 4) return g[3];
    if (g.length === 2 || g[0].value < 11) return g[0];
    return g[g.length - 1];
  }

  // Declarer's side: draw trumps, then cash winners, then develop the longest suit.
  function declarerLead(seat) {
    const groups = bySuit(st.hands[seat]);
    const trumps = st.trump && groups[st.trump];
    if (trumps && st.hands[1].concat(st.hands[3]).some(c => c.suit === st.trump)) {
      return isMaster(trumps[0], seat) ? trumps[0] : trumps[trumps.length - 1];
    }
    const winner = st.hands[seat].find(c => c.suit !== st.trump && isMaster(c, seat));
    return winner || longSuitLead(seat);
  }

  function chooseLead(seat) {
    if (seat % 2 === 0) return declarerLead(seat);
    if (!st.started) return openingLead(st.hands[seat], st.trump).card;
    return longSuitLead(seat);
  }

  function discard(legal) {
    const safe = legal.filter(c => c.suit !== st.trump);
    return lowest(safe.length ? safe : legal);
  }

  function chooseCard(seat) {
    const legal = legalCards(seat);
    if (!st.trick.length) return chooseLead(seat);

    const led = st.trick[0].card.suit;
    const winning = currentWinner(st.trick);
    const following = legal[0].suit === led;

    if (sameSide(winning.seat, seat)) return following ? lowest(legal) : discard(legal);

    const winners = legal.filter(c => beats(c, winning.card));
    if (following) {
      // Second hand plays low, but covers an honor with an honor.
      if (st.trick.length === 1 && winning.card.value < 11) return lowest(legal);
      return winners.length ? lowest(winners) : lowest(legal);
    }
    // Can't follow: ruff as cheaply as possible, otherwise throw a low card.
    return winners.length ? lowest(winners) : discard(legal);
  }

  // ---------- Scoring (not vulnerable, from North-South's point of view) ----------

  function score() {
    const { level, strain } = st.contract;
    const need = level + 6;
    const made = st.tricks[0];
    if (made < need) return { text: L(`Down ${need - made}`, `נפילה של ${need - made}`), points: -50 * (need - made) };
    const per = strain === 'C' || strain === 'D' ? 20 : 30;
    const contractPts = level * per + (strain === 'N' ? 10 : 0);
    let points = contractPts + (made - need) * per + (contractPts >= 100 ? 300 : 50);
    if (level === 6) points += 500;
    if (level === 7) points += 1000;
    const over = made - need;
    const text = over
      ? L(`Made with ${over} overtrick${over > 1 ? 's' : ''}`, over > 1 ? `בוצע עם ${over} לקיחות עודפות` : 'בוצע עם לקיחה עודפת אחת')
      : L('Contract made exactly', 'החוזה בוצע בדיוק');
    return { text, points };
  }

  // ---------- Rendering ----------

  const contractHtml = () => bidHtml(st.contract.level + st.contract.strain);
  const SEAT_SHORT = L(['N', 'E', 'S', 'W'], ['צ', 'מז', 'ד', 'מע']);

  function roleOf(seat) {
    return mode === 'declare'
      ? L(['Dummy — you play these cards', 'Defender (computer)', 'You — declarer', 'Defender (computer)'],
        ['דומם: אתם משחקים את הקלפים', 'מגן (מחשב)', 'אתם: הכרוז', 'מגן (מחשב)'])[seat]
      : L(['Dummy', 'Partner — defender (computer)', 'Declarer (computer)', 'You — defender'],
        ['דומם', 'השותף: מגן (מחשב)', 'כרוז (מחשב)', 'אתם: מגן'])[seat];
  }

  function renderSeat(seat) {
    const el = $('seat-' + seat);
    el.innerHTML = '';
    el.classList.toggle('to-play', !st.done && !st.busy && st.turn === seat);

    const label = document.createElement('div');
    label.className = 'seat-label';
    label.innerHTML = `<strong>${SEAT_NAMES[seat]}</strong> <span>${roleOf(seat)}</span>`;
    el.appendChild(label);

    const hand = st.hands[seat];
    if (!hand.length) return;

    if (seat === 0 && !st.started && !showAll) {
      const note = document.createElement('div');
      note.className = 'muted small';
      note.textContent = L('Dummy is revealed after the opening lead.', 'הדומם ייחשף אחרי הובלת הפתיחה.');
      el.appendChild(note);
      return;
    }

    if (isHuman(seat)) {
      const myTurn = !st.done && !st.busy && st.turn === seat;
      const legal = myTurn ? legalCards(seat) : [];
      const drawHand = seat % 2 === 0 ? renderFan : renderSuitRows; // side seats are narrow
      drawHand(el, hand, (cardEl, card) => {
        if (!myTurn) return;
        if (legal.includes(card)) {
          cardEl.classList.add('playable');
          cardEl.tabIndex = 0;
          cardEl.setAttribute('role', 'button');
          if (card === st.hint) cardEl.classList.add('hint');
          cardEl.addEventListener('click', () => playCard(seat, card));
          cardEl.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); playCard(seat, card); }
          });
        } else {
          cardEl.classList.add('dim');
        }
      });
    } else if (seat === 0) {
      renderFan(el, hand); // dummy is face up for everyone
    } else if (showAll || st.done) {
      renderCompact(el, hand);
    } else {
      const pile = document.createElement('div');
      pile.className = 'pile';
      pile.appendChild(createCardEl(null, { faceDown: true }));
      const count = document.createElement('span');
      count.textContent = hand.length === 1 ? L('1 card', 'קלף אחד') : L(`${hand.length} cards`, `${hand.length} קלפים`);
      pile.appendChild(count);
      el.appendChild(pile);
    }
  }

  function renderCenter() {
    const center = $('trick-area');
    center.innerHTML = '';

    if (st.done) {
      const result = score();
      const made = result.points > 0;
      const good = mode === 'declare' ? made : !made;
      const yours = mode === 'declare' ? result.points : -result.points;
      const title = mode === 'declare'
        ? (made ? L('Well played!', 'משחק יפה!') : L('Contract defeated', 'החוזה נפל'))
        : (made ? L('Declarer made it', 'הכרוז ביצע את החוזה') : L('Contract defeated: well defended!', 'החוזה נפל: הגנה יפה!'));
      center.innerHTML = `
        <div class="result ${good ? 'good' : 'bad'}">
          <div class="result-title">${title}</div>
          <div>${L(`${contractHtml()} by South: ${st.tricks[0]} tricks`, `${contractHtml()} של דרום: ${st.tricks[0]} לקיחות`)}</div>
          <div>${result.text}</div>
          <div class="result-score" dir="ltr">${yours > 0 ? '+' : ''}${yours}</div>
          <div class="small muted">${L('for your side', 'לצד שלכם')}</div>
        </div>`;
      return;
    }

    const winner = st.trick.length === 4 ? currentWinner(st.trick).seat : null;
    ['north', 'east', 'south', 'west'].forEach((pos, seat) => {
      const slot = document.createElement('div');
      slot.className = 'slot ' + pos;
      const played = st.trick.find(t => t.seat === seat);
      if (played) {
        const cardEl = createCardEl(played.card);
        if (seat === winner) cardEl.classList.add('winner');
        slot.appendChild(cardEl);
      }
      center.appendChild(slot);
    });
  }

  function statusText() {
    if (st.done) return L('Hand complete. Deal again, or replay the same cards to try a different line.', 'היד הסתיימה. חלקו מחדש, או שחקו שוב את אותם קלפים כדי לנסות דרך אחרת.');
    if (st.busy) {
      const w = currentWinner(st.trick).seat;
      return L(`${SEAT_NAMES[w]} wins the trick${sameSide(w, yourSeat()) ? ' for your side' : ''}.`, `${SEAT_NAMES[w]} זוכה בלקיחה${sameSide(w, yourSeat()) ? ' לצד שלכם' : ''}.`);
    }
    const seat = st.turn;
    if (!isHuman(seat)) return L(`${SEAT_NAMES[seat]} is thinking…`, `${SEAT_NAMES[seat]} חושב…`);
    const mustFollow = st.trick.length && legalCards(seat)[0].suit === st.trick[0].card.suit;
    const followNote = st.trick.length
      ? (mustFollow
        ? L(` You must follow suit (${suitHtml(st.trick[0].card.suit)}).`, ` חובה לשרת (${suitHtml(st.trick[0].card.suit)}).`)
        : L(` You have no ${SUIT_NAME[st.trick[0].card.suit]}: play any card.`, ` אין לכם ${SUIT_NAME[st.trick[0].card.suit]}: שחקו כל קלף.`))
      : L(' You are on lead: play any card.', ' אתם מובילים: שחקו כל קלף.');
    if (mode === 'defend') {
      if (!st.started) return L('You are on lead. Choose your <strong>opening lead</strong> (try the Hint button, or the Defense tab, for lead rules).', 'אתם מובילים. בחרו את <strong>הובלת הפתיחה</strong> (לכללי ההובלה, נסו את כפתור הרמז או את לשונית ההגנה).');
      return L('Your turn: play a card from <strong>your hand</strong> (West).', 'תורכם: שחקו קלף <strong>מהיד שלכם</strong> (מערב).') + followNote;
    }
    if (seat === 2) return L('Your turn: play a card from <strong>your hand</strong> (South).', 'תורכם: שחקו קלף <strong>מהיד שלכם</strong> (דרום).') + followNote;
    return L('Your turn: play a card from <strong>dummy</strong> (North).', 'תורכם: שחקו קלף <strong>מהדומם</strong> (צפון).') + followNote;
  }

  function render() {
    const need = st.contract.level + 6;
    const strain = trumpText(st.trump);
    $('play-contract').innerHTML = contractHtml();
    $('play-goal').textContent = mode === 'declare'
      ? L(`South needs ${need} of 13 tricks, ${strain}.`, `דרום צריך ${need} מתוך 13 לקיחות. ${strain}.`)
      : L(`South needs ${need} tricks, ${strain}. You and East need ${14 - need} to defeat it.`, `דרום צריך ${need} לקיחות. ${strain}. אתם ומזרח צריכים ${14 - need} כדי להפיל את החוזה.`);
    $('play-ns').textContent = st.tricks[0];
    $('play-ew').textContent = st.tricks[1];
    $('play-need').textContent = Math.max(0, mode === 'declare' ? need - st.tricks[0] : 14 - need - st.tricks[1]);
    $('play-status').innerHTML = statusText();
    $('play-hint').disabled = st.done || st.busy || !isHuman(st.turn);
    $('play-showall').textContent = showAll ? L('Hide hidden hands', 'הסתרת הידיים הנסתרות') : L('Show all hands', 'הצגת כל הידיים');
    $('play-mode-declare').classList.toggle('active', mode === 'declare');
    $('play-mode-defend').classList.toggle('active', mode === 'defend');
    $('play-mode-declare').setAttribute('aria-pressed', mode === 'declare');
    $('play-mode-defend').setAttribute('aria-pressed', mode === 'defend');

    const last = $('play-last');
    last.innerHTML = st.lastTrick
      ? L('Last trick: ', 'הלקיחה האחרונה: ') + st.lastTrick.map(t => `${SEAT_SHORT[t.seat]} ${cardHtml(t.card)}`).join(' · ')
      : '';

    [0, 1, 2, 3].forEach(renderSeat);
    renderCenter();
  }

  function setMode(m) {
    if (m === mode && st) return;
    mode = m;
    newDeal();
  }

  function init() {
    $('play-new').addEventListener('click', () => newDeal());
    $('play-replay').addEventListener('click', () => newDeal(st.original));
    $('play-showall').addEventListener('click', () => { showAll = !showAll; render(); });
    $('play-mode-declare').addEventListener('click', () => setMode('declare'));
    $('play-mode-defend').addEventListener('click', () => setMode('defend'));
    $('play-hint').addEventListener('click', () => {
      if (st.done || st.busy || !isHuman(st.turn)) return;
      st.hint = chooseCard(st.turn);
      render();
    });
    newDeal();
  }

  return { init, dealTable, setMode };
})();
