// Declarer play: you are South and also play North (dummy); the computer defends as East and West.

const Play = (() => {
  const AI_DELAY = 650;
  const TRICK_PAUSE = 1100;
  let st = null;
  let timer = null;
  let showAll = false;
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

  function newDeal(replayHands) {
    clearTimeout(timer);
    let hands;
    if (replayHands) {
      hands = cloneHands(replayHands);
    } else {
      hands = dealHands();
      // Give North-South the stronger cards, with South (declarer) holding the stronger hand.
      if (hcp(hands[0]) + hcp(hands[2]) < hcp(hands[1]) + hcp(hands[3])) {
        hands = [hands[1], hands[2], hands[3], hands[0]];
      }
      if (hcp(hands[0]) > hcp(hands[2])) [hands[0], hands[2]] = [hands[2], hands[0]];
    }
    const contract = chooseContract(hands[0], hands[2]);
    st = {
      original: cloneHands(hands),
      hands,
      contract,
      trump: contract.strain === 'N' ? null : contract.strain,
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

  const isHuman = seat => seat === 0 || seat === 2;
  const sameSide = (a, b) => a % 2 === b % 2;

  // ---------- Playing cards ----------

  function playCard(seat, card) {
    if (st.done || st.busy || seat !== st.turn) return;
    const hand = st.hands[seat];
    hand.splice(hand.indexOf(card), 1);
    st.trick.push({ seat, card });
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

  // ---------- Simple card-play strategy (used by defenders and for hints) ----------

  const lowest = cards => cards.reduce((a, b) => (b.value < a.value ? b : a));

  function bySuit(hand) {
    const groups = {};
    hand.forEach(c => (groups[c.suit] = groups[c.suit] || []).push(c));
    Object.values(groups).forEach(g => g.sort((a, b) => b.value - a.value));
    return groups;
  }

  function chooseLead(seat) {
    const groups = bySuit(st.hands[seat]);
    let suits = Object.keys(groups);
    const nonTrump = suits.filter(s => s !== st.trump);
    if (nonTrump.length) suits = nonTrump;

    // Top of a sequence of honors (A-K, K-Q, Q-J, J-10) is the safest lead.
    const sequences = suits.filter(s => {
      const g = groups[s];
      return g.length >= 2 && g[0].value >= 11 && g[1].value === g[0].value - 1;
    });
    if (sequences.length) {
      const s = sequences.sort((a, b) => groups[b].length - groups[a].length)[0];
      return groups[s][0];
    }

    // Otherwise lead from the longest suit: fourth-best from 4+, top of a doubleton, top of nothing.
    const s = suits.sort((a, b) => groups[b].length - groups[a].length || groups[b][0].value - groups[a][0].value)[0];
    const g = groups[s];
    if (g.length >= 4) return g[3];
    if (g.length === 2 || g[0].value < 11) return g[0];
    return g[g.length - 1];
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

  // ---------- Scoring (not vulnerable) ----------

  function score() {
    const { level, strain } = st.contract;
    const need = level + 6;
    const made = st.tricks[0];
    if (made < need) return { text: `Down ${need - made}`, points: -50 * (need - made) };
    const per = strain === 'C' || strain === 'D' ? 20 : 30;
    const contractPts = level * per + (strain === 'N' ? 10 : 0);
    let points = contractPts + (made - need) * per + (contractPts >= 100 ? 300 : 50);
    if (level === 6) points += 500;
    if (level === 7) points += 1000;
    const over = made - need;
    return { text: over ? `Made with ${over} overtrick${over > 1 ? 's' : ''}` : 'Contract made exactly', points };
  }

  // ---------- Rendering ----------

  const contractHtml = () => `${st.contract.level}${suitHtml(st.contract.strain)}`;

  function roleOf(seat) {
    return ['Dummy — you play these cards', 'Defender (computer)', 'You — declarer', 'Defender (computer)'][seat];
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
      note.textContent = 'Dummy is revealed after the opening lead.';
      el.appendChild(note);
      return;
    }

    if (isHuman(seat)) {
      const myTurn = !st.done && !st.busy && st.turn === seat;
      const legal = myTurn ? legalCards(seat) : [];
      renderFan(el, hand, (cardEl, card) => {
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
    } else if (showAll || st.done) {
      renderCompact(el, hand);
    } else {
      const pile = document.createElement('div');
      pile.className = 'pile';
      pile.appendChild(createCardEl(null, { faceDown: true }));
      const count = document.createElement('span');
      count.textContent = `${hand.length} card${hand.length === 1 ? '' : 's'}`;
      pile.appendChild(count);
      el.appendChild(pile);
    }
  }

  function renderCenter() {
    const center = $('trick-area');
    center.innerHTML = '';

    if (st.done) {
      const result = score();
      const good = result.points > 0;
      center.innerHTML = `
        <div class="result ${good ? 'good' : 'bad'}">
          <div class="result-title">${good ? 'Well played!' : 'Contract defeated'}</div>
          <div>${contractHtml()} by South: ${st.tricks[0]} tricks</div>
          <div>${result.text}</div>
          <div class="result-score">${good ? '+' : ''}${result.points}</div>
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
    if (st.done) return 'Hand complete. Deal again, or replay the same cards to try a better line.';
    if (st.busy) {
      const w = currentWinner(st.trick).seat;
      return `${SEAT_NAMES[w]} wins the trick${sameSide(w, 2) ? ' for your side' : ''}.`;
    }
    const seat = st.turn;
    const mustFollow = st.trick.length && legalCards(seat)[0].suit === st.trick[0].card.suit;
    const followNote = st.trick.length
      ? (mustFollow ? ` You must follow suit (${suitHtml(st.trick[0].card.suit)}).` : ` You have no ${SUIT_NAME[st.trick[0].card.suit]}: play any card.`)
      : ' You are on lead: play any card.';
    if (seat === 2) return 'Your turn: play a card from <strong>your hand</strong> (South).' + followNote;
    if (seat === 0) return 'Your turn: play a card from <strong>dummy</strong> (North).' + followNote;
    return `${SEAT_NAMES[seat]} is thinking…`;
  }

  function render() {
    const need = st.contract.level + 6;
    $('play-contract').innerHTML = contractHtml();
    $('play-goal').textContent = `South needs ${need} of 13 tricks${st.trump ? `, ${SUIT_NAME[st.trump]} are trumps` : ', no trumps'}.`;
    $('play-ns').textContent = st.tricks[0];
    $('play-ew').textContent = st.tricks[1];
    $('play-need').textContent = Math.max(0, need - st.tricks[0]);
    $('play-status').innerHTML = statusText();
    $('play-hint').disabled = st.done || st.busy || !isHuman(st.turn);
    $('play-showall').textContent = showAll ? 'Hide defenders' : 'Show all hands';

    const last = $('play-last');
    last.innerHTML = st.lastTrick
      ? 'Last trick: ' + st.lastTrick.map(t => `${SEAT_NAMES[t.seat][0]} ${cardHtml(t.card)}`).join(' · ')
      : '';

    [0, 1, 2, 3].forEach(renderSeat);
    renderCenter();
  }

  function init() {
    $('play-new').addEventListener('click', () => newDeal());
    $('play-replay').addEventListener('click', () => newDeal(st.original));
    $('play-showall').addEventListener('click', () => { showAll = !showAll; render(); });
    $('play-hint').addEventListener('click', () => {
      if (st.done || st.busy || !isHuman(st.turn)) return;
      st.hint = chooseCard(st.turn);
      render();
    });
    newDeal();
  }

  return { init };
})();
