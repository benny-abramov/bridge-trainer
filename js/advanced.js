// Card-play puzzles: hand-built endings where all four hands are shown, you play North and South,
// and the defenders play perfectly using a small exhaustive (double-dummy) solver.
// This file holds the solver and the reusable puzzle player; js/declarer.js holds the Declarer Play
// techniques, and the hands come from practice/declarer-play.txt.

// ---------- Double-dummy solver for small endings ----------

function trickWinnerOf(trick, trump) {
  let best = trick[0];
  for (const t of trick.slice(1)) {
    const a = t.card, b = best.card;
    if ((a.suit === b.suit && a.value > b.value) || (a.suit === trump && b.suit !== trump)) best = t;
  }
  return best.seat;
}

// A defender's choice among equally good cards: take the trick with the cheapest card that wins it
// so far, unless partner is already winning it; otherwise play the lowest card.
function defenderChoice(options, trick, seat, trump) {
  const lowest = cards => cards.reduce((a, b) => (b.value < a.value ? b : a));
  if (!trick.length || trickWinnerOf(trick, trump) === (seat + 2) % 4) return lowest(options);
  const winners = options.filter(c => trickWinnerOf([...trick, { seat, card: c }], trump) === seat);
  return lowest(winners.length ? winners : options);
}

function legalOf(hand, trick) {
  if (!trick.length) return hand;
  const follow = hand.filter(c => c.suit === trick[0].card.suit);
  return follow.length ? follow : hand;
}

// Returns helpers that count how many of the remaining tricks North-South take with best play by both sides.
function makeSolver(trump) {
  const memo = new Map();
  const key = (hands, turn) => hands.map(h => h.map(c => c.suit + c.rank).join('')).join('|') + turn;

  function search(hands, trick, turn) {
    if (trick.length) return explore(hands, trick, turn);
    if (!hands[turn].length) return 0;
    const k = key(hands, turn);
    if (!memo.has(k)) memo.set(k, explore(hands, trick, turn));
    return memo.get(k);
  }

  function explore(hands, trick, turn) {
    const ns = turn % 2 === 0;
    let best = ns ? -1 : Infinity;
    for (const card of legalOf(hands[turn], trick)) {
      const v = after(hands, trick, turn, card);
      if (ns ? v > best : v < best) best = v;
    }
    return best;
  }

  // North-South tricks from here on (including the current trick) after `turn` plays `card`.
  function after(hands, trick, turn, card) {
    const next = hands.map((h, i) => (i === turn ? h.filter(c => c !== card) : h));
    const played = [...trick, { seat: turn, card }];
    if (played.length === 4) {
      const w = trickWinnerOf(played, trump);
      return (w % 2 === 0 ? 1 : 0) + search(next, [], w);
    }
    return search(next, played, (turn + 1) % 4);
  }

  return { search, after };
}

// ---------- Trick slots ----------

// One mark per trick in the puzzle: won, still winnable with best play, lost through a mistake,
// or a trick the defenders were always going to take.
const slotMark = kind => `<span class="ts-mark ${kind}">${kind === 'lost' ? '✕' : kind === 'theirs' ? '–' : ''}</span>`;

function trickSlotsHtml(won, possible, best, total) {
  return [
    ...Array(won).fill('won'),
    ...Array(possible - won).fill('open'),
    ...Array(best - possible).fill('lost'),
    ...Array(total - best).fill('theirs'),
  ].map(slotMark).join('');
}

const TRICK_SLOTS_LEGEND = L(
  `${slotMark('won')} won · ${slotMark('open')} still possible · ${slotMark('lost')} lost by a mistake · ${slotMark('theirs')} the defenders' trick`,
  `${slotMark('won')} נלקחה · ${slotMark('open')} עדיין אפשרית · ${slotMark('lost')} אבדה בגלל טעות · ${slotMark('theirs')} לקיחה של המגינים`);

// ---------- Puzzle player ----------

// A puzzle section: `topics` maps a key to { label, intro, puzzles }, and `groups` lists the topic
// keys under group labels for the menu. Each topic shows its intro and a "Practice hands" button
// that opens the puzzle player.
function makePuzzleSection(prefix, topics, groups) {
  const TRICK_PAUSE = 1000;
  const AI_DELAY = 550;
  let topic = Object.keys(topics)[0];
  let index = 0;
  let st = null;
  let timer = null;
  const $ = id => document.getElementById(prefix + '-' + id);

  const puzzle = () => topics[topic].puzzles[index];
  const isHuman = seat => seat % 2 === 0;

  function start() {
    clearTimeout(timer);
    const p = puzzle();
    if (!p) return;
    st = {
      hands: p.hands.map(parseHand),
      trick: [],
      turn: p.leader,
      tricks: [0, 0],
      busy: false,
      done: false,
      hint: null,
      solver: makeSolver(p.trump),
      showSolution: false,
    };
    updatePossible();
    st.bestAtStart = st.possible;
    // Without a "Need:" line, the target is the most that perfect play can make.
    st.target = p.target ?? st.bestAtStart;
    render();
    schedule();
  }

  // Best cards for `seat` right now: max for North-South, min for the defenders.
  function bestCards(seat) {
    const legal = legalOf(st.hands[seat], st.trick);
    const values = legal.map(c => st.solver.after(st.hands, st.trick, seat, c));
    const target = isHuman(seat) ? Math.max(...values) : Math.min(...values);
    return legal.filter((c, i) => values[i] === target);
  }

  // Most tricks North-South can still end up with if both sides play perfectly from here.
  function updatePossible() {
    const trick = st.trick.length === 4 ? [] : st.trick;
    const finished = st.hands.every(h => !h.length);
    st.possible = st.tricks[0] + (finished ? 0 : st.solver.search(st.hands, trick, st.turn));
  }

  function playCard(seat, card) {
    if (st.done || st.busy || seat !== st.turn) return;
    st.hands[seat] = st.hands[seat].filter(c => c !== card);
    st.trick.push({ seat, card });
    Sound.cardPlayed();
    st.hint = null;
    if (st.trick.length < 4) {
      st.turn = (seat + 1) % 4;
      updatePossible();
      render();
      schedule();
      return;
    }
    const w = trickWinnerOf(st.trick, puzzle().trump);
    st.tricks[w % 2]++;
    st.turn = w;
    st.busy = true;
    updatePossible();
    render();
    timer = setTimeout(() => {
      st.trick = [];
      st.busy = false;
      if (!st.hands[w].length) {
        st.done = true;
        if (st.tricks[0] >= st.target) Sound.correct();
      }
      render();
      schedule();
    }, TRICK_PAUSE);
  }

  function schedule() {
    if (st.done || st.busy || isHuman(st.turn)) return;
    timer = setTimeout(() => {
      const options = bestCards(st.turn);
      playCard(st.turn, defenderChoice(options, st.trick, st.turn, puzzle().trump));
    }, AI_DELAY);
  }

  function renderSeat(seat) {
    const el = $('seat-' + seat);
    el.innerHTML = '';
    el.classList.toggle('to-play', !st.done && !st.busy && st.turn === seat);
    const roles = L(['Dummy (you play)', 'Defender', 'You — declarer', 'Defender'], ['דומם (אתם משחקים)', 'מגן', 'אתם: הכרוז', 'מגן']);
    const label = document.createElement('div');
    label.className = 'seat-label';
    label.innerHTML = `<strong>${SEAT_NAMES[seat]}</strong> <span>${roles[seat]}</span>`;
    el.appendChild(label);
    // Once the hand is over, show the starting cards again so you can look back at the whole position.
    const hand = st.done ? parseHand(puzzle().hands[seat]) : st.hands[seat];
    if (!hand.length) return;

    const myTurn = isHuman(seat) && !st.done && !st.busy && st.turn === seat;
    const legal = myTurn ? legalOf(hand, st.trick) : [];
    // On a phone, West and East show one row per suit so they fit beside the trick.
    const draw = seat % 2 && matchMedia('(max-width: 560px)').matches ? renderSuitRows : renderFan;
    draw(el, hand, (cardEl, card) => {
      if (!myTurn) return;
      if (!legal.includes(card)) { cardEl.classList.add('dim'); return; }
      cardEl.classList.add('playable');
      cardEl.tabIndex = 0;
      cardEl.setAttribute('role', 'button');
      if (card === st.hint) cardEl.classList.add('hint');
      cardEl.addEventListener('click', () => playCard(seat, card));
      cardEl.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); playCard(seat, card); }
      });
    });
  }

  function renderCenter() {
    const center = $('trick');
    center.innerHTML = '';
    const winner = st.trick.length === 4 ? trickWinnerOf(st.trick, puzzle().trump) : null;
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
    const p = puzzle();
    const need = Math.max(0, st.target - st.tricks[0]);
    if (st.done) {
      return st.tricks[0] >= st.target
        ? L('Solved!', 'פתרתם!')
        : L(`You took ${st.tricks[0]} of the ${st.target} tricks you needed.`, `לקחתם ${st.tricks[0]} מתוך ${st.target} הלקיחות שהייתם צריכים.`);
    }
    if (st.busy) return L(`${SEAT_NAMES[trickWinnerOf(st.trick, p.trump)]} wins the trick.`, `${SEAT_NAMES[trickWinnerOf(st.trick, p.trump)]} זוכה בלקיחה.`);
    let warn = '';
    if (st.possible < st.target) {
      warn = ` <span class="warn">${L('A mistake cost a trick (✕), so the target can no longer be reached. Try Reset.', 'טעות עלתה בלקיחה (✕), וכבר אי אפשר להגיע ליעד. נסו להתחיל מחדש.')}</span>`;
    } else if (st.possible < st.bestAtStart) {
      warn = ` <span class="warn">${L('A mistake cost a trick (✕), but you can still reach the target.', 'טעות עלתה בלקיחה (✕), אבל עדיין אפשר להגיע ליעד.')}</span>`;
    }
    if (!isHuman(st.turn)) return L(`${SEAT_NAMES[st.turn]} is thinking…`, `${SEAT_NAMES[st.turn]} חושב…`) + warn;
    const from = st.turn === 2 ? L('your hand (South)', 'מהיד שלכם (דרום)') : L('dummy (North)', 'מהדומם (צפון)');
    const still = L(`You still need ${need} trick${need === 1 ? '' : 's'}.`, need === 1 ? 'נדרשת לכם עוד לקיחה אחת.' : `נדרשות לכם עוד ${need} לקיחות.`);
    return L(`Play a card from <strong>${from}</strong>. `, `שחקו קלף <strong>${from}</strong>. `) + still + warn;
  }

  function render() {
    const t = topics[topic];
    const p = puzzle();
    $('title').textContent = L(`Puzzle ${index + 1} of ${t.puzzles.length}: ${p.title}`, `חידה ${index + 1} מתוך ${t.puzzles.length}: ${p.title}`);
    const strain = trumpText(p.trump);
    const n = cardsLeftAtStart();
    const contract = p.contract ? L(`Contract: ${bidHtml(p.contract)}. `, `החוזה: ${bidHtml(p.contract)}. `) : '';
    $('setup').innerHTML = L(
      `<strong>${contract}${strain[0].toUpperCase() + strain.slice(1)}. ${SEAT_NAMES[p.leader]} to lead. You need ${st.target} of the last ${n} tricks.</strong> The defenders can see every card and will play perfectly. `,
      `<strong>${contract}${strain}. ${SEAT_NAMES[p.leader]} מוביל. אתם צריכים ${st.target} מתוך ${n} הלקיחות האחרונות.</strong> המגינים רואים את כל הקלפים ומשחקים בצורה מושלמת. `) +
      colorSuits(p.idea);
    $('prev').disabled = index === 0;
    $('next').disabled = index === t.puzzles.length - 1;
    $('hint').disabled = st.done || st.busy || !isHuman(st.turn);
    $('status').innerHTML = statusText();

    $('slots').innerHTML = trickSlotsHtml(st.tricks[0], st.possible, st.bestAtStart, n);
    $('slots').setAttribute('aria-label', L(
      `${st.tricks[0]} won, ${st.possible - st.tricks[0]} still possible, ${st.bestAtStart - st.possible} lost through a mistake`,
      `${st.tricks[0]} נלקחו, ${st.possible - st.tricks[0]} עדיין אפשריות, ${st.bestAtStart - st.possible} אבדו בגלל טעות`));
    $('need').textContent = L(`need ${st.target} of ${n}`, `נדרשות ${st.target} מתוך ${n}`);
    $('legend').innerHTML = TRICK_SLOTS_LEGEND;

    const fb = $('feedback');
    if (st.done) {
      const ok = st.tricks[0] >= st.target;
      fb.className = 'feedback ' + (ok ? 'good' : 'bad');
      fb.innerHTML = `<strong>${ok ? L('Solved!', 'פתרתם!') : L('Not this time.', 'לא הפעם.')}</strong>${colorSuits(p.solution)}`;
    } else if (st.showSolution) {
      fb.className = 'feedback';
      fb.innerHTML = `<strong>${L('Solution', 'הפתרון')}</strong>${colorSuits(p.solution)}`;
    } else {
      fb.className = 'feedback';
      fb.innerHTML = '';
    }

    [0, 1, 2, 3].forEach(renderSeat);
    renderCenter();
  }

  function cardsLeftAtStart() {
    return parseHand(puzzle().hands[0]).length;
  }

  // Show a topic's explanation; its practice hands open with the "Practice hands" button.
  function showTopic(key) {
    clearTimeout(timer);
    topic = key;
    index = 0;
    document.querySelectorAll(`#${prefix}-topic button`).forEach(b => {
      b.classList.toggle('active', b.dataset.topic === topic);
      b.setAttribute('aria-pressed', b.dataset.topic === topic);
    });
    const t = topics[topic];
    $('topic-title').textContent = t.label;
    $('intro').innerHTML = colorSuits(t.intro);
    const n = t.puzzles.length;
    $('practice').hidden = !n;
    $('practice').textContent = L(`Practice hands (${n}) →`, `ידיים לתרגול (${n}) ←`);
    $('practice-none').hidden = !!n;
    $('practice-none').textContent = L('No practice hands for this technique yet.', 'עדיין אין ידיים לתרגול בטכניקה הזאת.');
    $('puzzle').hidden = true;
  }

  function init() {
    $('topic').innerHTML = groups.map(g => `
      <div class="topic-group">
        <span class="topic-group-label">${g.label}</span>
        <div class="segmented" role="group" aria-label="${g.label}">
          ${g.topics.map(k => `<button type="button" data-topic="${k}">${topics[k].label}</button>`).join('')}
        </div>
      </div>`).join('');
    document.querySelectorAll(`#${prefix}-topic button`).forEach(b =>
      b.addEventListener('click', () => showTopic(b.dataset.topic)));
    $('practice').addEventListener('click', () => {
      $('puzzle').hidden = false;
      start();
      $('puzzle').scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
    $('prev').addEventListener('click', () => { index--; start(); });
    $('next').addEventListener('click', () => { index++; start(); });
    $('reset').addEventListener('click', start);
    $('solution').addEventListener('click', () => { st.showSolution = true; render(); });
    $('hint').addEventListener('click', () => {
      if (st.done || st.busy || !isHuman(st.turn)) return;
      st.hint = bestCards(st.turn)[0];
      render();
    });
    showTopic(topic);
  }

  return { init };
}

