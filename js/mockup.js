// Preview of a "hand diagram" style for the card-play puzzles: text hands, trick chips, a contract chip,
// step back/forward, trick counters and trick slots. Reuses the solver from js/advanced.js and the
// practice hands from js/declarer.js (practice/declarer-play.txt).

(() => {
  const AI_DELAY = 550;
  const TRICK_PAUSE = 900;
  const $ = id => document.getElementById('mk-' + id);
  const isHuman = seat => seat % 2 === 0;
  const keyOf = c => c.suit + c.rank;

  const TOPIC_NAMES = Object.fromEntries(Object.entries(DECLARER_TOPICS).map(([k, t]) => [k, t.label]));
  const SECTION_NAMES = L({ declarer: 'Declarer play' }, { declarer: 'משחק הכרוז' });
  const COMPASS = L(['N', 'E', 'S', 'W'], ['צ', 'מז', 'ד', 'מע']);

  // Every puzzle from both sections, in order.
  const PUZZLES = [];
  for (const [section, topics] of [['declarer', DECLARER_TOPICS]]) {
    for (const [topic, t] of Object.entries(topics)) {
      t.puzzles.forEach(p => PUZZLES.push({ section, topic, p }));
    }
  }

  let index = 0;
  let puzzle, solver, bestAtStart;
  let moves = []; // every card played so far: { seat, key }
  let pos = 0;    // how many of `moves` are currently applied (less than moves.length after stepping back)
  let timer = null;
  let hideHands = false;
  let showSolution = false;
  let hint = null;

  // Rebuild the position after the first `n` moves.
  function positionAfter(n) {
    const hands = puzzle.hands.map(parseHand);
    let trick = [], turn = puzzle.leader, last = null;
    const tricks = [0, 0];
    for (let i = 0; i < n; i++) {
      const { seat, key } = moves[i];
      const card = hands[seat].find(c => keyOf(c) === key);
      hands[seat] = hands[seat].filter(c => c !== card);
      trick.push({ seat, card });
      if (trick.length === 4) {
        const w = trickWinnerOf(trick, puzzle.trump);
        tricks[w % 2]++;
        last = trick;
        trick = [];
        turn = w;
      } else {
        turn = (seat + 1) % 4;
      }
    }
    const done = hands.every(h => !h.length);
    // Most tricks North-South can still end up with, if both sides play perfectly from here.
    const possible = tricks[0] + (done ? 0 : solver.search(hands, trick, turn));
    return { hands, trick, turn, tricks, last, done, possible };
  }

  function load(i) {
    clearTimeout(timer);
    index = (i + PUZZLES.length) % PUZZLES.length;
    puzzle = PUZZLES[index].p;
    solver = makeSolver(puzzle.trump);
    moves = [];
    pos = 0;
    bestAtStart = positionAfter(0).possible;
    showSolution = false;
    hint = null;
    render();
    schedule();
  }

  function play(seat, card) {
    clearTimeout(timer);
    moves = moves.slice(0, pos);
    moves.push({ seat, key: keyOf(card) });
    pos++;
    Sound.cardPlayed();
    hint = null;
    render();
    schedule();
  }

  // Defenders play automatically, choosing perfectly (the lowest of their best cards).
  function schedule() {
    const s = positionAfter(pos);
    if (s.done || isHuman(s.turn)) return;
    const justFinishedTrick = pos > 0 && !s.trick.length;
    timer = setTimeout(() => {
      const legal = legalOf(s.hands[s.turn], s.trick);
      const values = legal.map(c => solver.after(s.hands, s.trick, s.turn, c));
      const best = Math.min(...values);
      const card = legal.filter((c, i) => values[i] === best).reduce((a, b) => (b.value < a.value ? b : a));
      play(s.turn, card);
    }, justFinishedTrick ? TRICK_PAUSE : AI_DELAY);
  }

  // Step back to just before your previous card; step forward replays your next card and the defenders' replies.
  function stepBack() {
    clearTimeout(timer);
    let i = pos - 1;
    while (i >= 0 && !isHuman(moves[i].seat)) i--;
    if (i < 0) return;
    pos = i;
    hint = null;
    render();
  }

  function stepForward() {
    clearTimeout(timer);
    if (pos >= moves.length) return;
    pos++;
    while (pos < moves.length && !isHuman(moves[pos].seat)) pos++;
    hint = null;
    render();
    schedule();
  }

  function bestCard(s) {
    const legal = legalOf(s.hands[s.turn], s.trick);
    const values = legal.map(c => solver.after(s.hands, s.trick, s.turn, c));
    return legal[values.indexOf(Math.max(...values))];
  }

  // ---------- Rendering ----------

  function renderHand(seat, s) {
    const el = $('seat-' + seat);
    const myTurn = !s.done && s.turn === seat && isHuman(seat);
    const legal = myTurn ? legalOf(s.hands[seat], s.trick) : [];
    const hidden = hideHands && !isHuman(seat) && !s.done;
    el.classList.toggle('to-play', !s.done && s.turn === seat);
    el.innerHTML = `<div class="hand-name">${SEAT_NAMES[seat]}</div>`;
    const body = document.createElement('div');
    body.className = 'hand-body';
    for (const suit of SUITS) {
      const row = document.createElement('div');
      row.className = 'suit-row';
      row.innerHTML = `<span class="sym ${isRed(suit) ? 'red' : ''}">${SUIT_SYMBOL[suit]}</span>`;
      const cards = s.hands[seat].filter(c => c.suit === suit);
      if (hidden) {
        row.insertAdjacentHTML('beforeend', '<span class="hidden-cards" aria-label="hidden">••••</span>');
      } else if (!cards.length) {
        row.insertAdjacentHTML('beforeend', '<span class="void">—</span>');
      }
      if (!hidden) {
        for (const card of cards) {
          const btn = document.createElement(myTurn ? 'button' : 'span');
          btn.className = 'pc' + ('AKQJ'.includes(card.rank) ? ' honor' : '');
          btn.textContent = rankLabel(card.rank);
          if (myTurn) {
            if (legal.includes(card)) {
              btn.classList.add('playable');
              if (hint && keyOf(hint) === keyOf(card)) btn.classList.add('hinted');
              btn.setAttribute('aria-label', L(`${rankLabel(card.rank)} of ${SUIT_NAME[suit]}`, `${rankLabel(card.rank)} ${SUIT_NAME[suit]}`));
              btn.addEventListener('click', () => play(seat, card));
            } else {
              btn.disabled = true;
              btn.classList.add('dim');
            }
          }
          row.appendChild(btn);
        }
      }
      body.appendChild(row);
    }
    el.appendChild(body);
  }

  function renderTrick(s) {
    const box = $('trick');
    box.innerHTML = '';
    const shown = s.trick.length ? s.trick : s.last || [];
    const winner = shown.length === 4 ? trickWinnerOf(shown, puzzle.trump) : null;
    for (const { seat, card } of shown) {
      const chip = document.createElement('div');
      chip.className = `chip at-${['n', 'e', 's', 'w'][seat]}` + (seat === winner ? ' won' : '') + (s.trick.length ? '' : ' finished');
      chip.innerHTML = `<span class="sym ${isRed(card.suit) ? 'red' : ''}">${SUIT_SYMBOL[card.suit]}</span>${rankLabel(card.rank)}`;
      box.appendChild(chip);
    }
  }

  function render() {
    const s = positionAfter(pos);
    const target = puzzle.target ?? bestAtStart;
    const total = parseHand(puzzle.hands[0]).length;
    const strain = puzzle.trump ? SUIT_SYMBOL[puzzle.trump] : 'NT';
    const strainClass = puzzle.trump && isRed(puzzle.trump) ? 'red' : '';

    // Compass box with the puzzle number (vulnerability bars are decorative: puzzles are not vulnerable).
    $('compass').innerHTML = `
      <span class="cp n">${COMPASS[0]}</span><span class="cp e">${COMPASS[1]}</span>
      <span class="cp s">${COMPASS[2]}</span><span class="cp w">${COMPASS[3]}</span>
      <span class="cp num">${index + 1}</span>`;

    // Contract / target table, in the style of an auction table.
    $('info').innerHTML = `
      <table>
        <tr><th>${L('Trumps', 'שליט')}</th><th>${L('Lead', 'מוביל')}</th><th>${L('Need', 'נדרש')}</th></tr>
        <tr><td class="${strainClass}">${strain}</td><td>${SEAT_NAMES[puzzle.leader]}</td><td dir="ltr">${target}/${total}</td></tr>
      </table>`;
    $('contract').innerHTML = `<span class="${strainClass}">${strain}</span>`;

    [0, 1, 2, 3].forEach(seat => renderHand(seat, s));
    renderTrick(s);

    $('ns').textContent = s.tricks[0];
    $('ew').textContent = s.tricks[1];

    // Trick slots, one per trick: won, still winnable with best play, lost through a mistake,
    // or a trick the defenders were always going to take.
    const onTrack = s.possible >= target;
    const lost = bestAtStart - s.possible;
    const kinds = [
      ...Array(s.tricks[0]).fill('won'),
      ...Array(s.possible - s.tricks[0]).fill('open'),
      ...Array(lost).fill('lost'),
      ...Array(total - bestAtStart).fill('theirs'),
    ];
    const marks = { won: '●', open: '○', lost: '✕', theirs: '–' };
    $('slots').innerHTML = kinds.map(k => `<span class="slot-mark ${k}">${marks[k]}</span>`).join('');
    $('slots').setAttribute('aria-label', L(
      `${s.tricks[0]} won, ${s.possible - s.tricks[0]} still possible, ${lost} lost through a mistake`,
      `${s.tricks[0]} נלקחו, ${s.possible - s.tricks[0]} עדיין אפשריות, ${lost} אבדו בגלל טעות`));
    $('need').textContent = L(`Need ${target} of ${total}`, `נדרשות ${target} מתוך ${total}`);
    $('legend').innerHTML = L(
      '<b class="won">●</b> won · <b class="open">○</b> still possible · <b class="lost">✕</b> lost by a mistake · <b class="theirs">–</b> the defenders\' trick',
      '<b class="won">●</b> נלקחה · <b class="open">○</b> עדיין אפשרית · <b class="lost">✕</b> אבדה בגלל טעות · <b class="theirs">–</b> לקיחה של המגינים');

    $('back').disabled = !moves.slice(0, pos).some(m => isHuman(m.seat));
    $('fwd').disabled = pos >= moves.length;
    $('hint').disabled = s.done || !isHuman(s.turn);
    $('hide').textContent = hideHands ? L('Show hands', 'הצגת ידיים') : L('Hide hands', 'הסתרת ידיים');
    $('select').value = String(index);

    const meta = PUZZLES[index];
    $('title').textContent = `${SECTION_NAMES[meta.section]} · ${TOPIC_NAMES[meta.topic]}: ${puzzle.title}`;
    $('idea').innerHTML = colorSuits(puzzle.idea);

    let status;
    if (s.done) status = s.tricks[0] >= target ? L('Solved!', 'פתרתם!') : L(`You took ${s.tricks[0]} of the ${target} tricks you needed.`, `לקחתם ${s.tricks[0]} מתוך ${target} הלקיחות שהייתם צריכים.`);
    else if (!onTrack) status = L('A mistake cost a trick (✕), so the target can no longer be reached. Step back or play again.', 'טעות עלתה בלקיחה (✕), וכבר אי אפשר להגיע ליעד. חזרו צעד אחורה או שחקו שוב.');
    else if (lost > 0) status = L('A mistake cost a trick (✕), but you can still reach the target.', 'טעות עלתה בלקיחה (✕), אבל עדיין אפשר להגיע ליעד.');
    else if (isHuman(s.turn)) status = L(`Play a card from ${s.turn === 2 ? 'your hand (South)' : 'dummy (North)'}.`, `שחקו קלף ${s.turn === 2 ? 'מהיד שלכם (דרום)' : 'מהדומם (צפון)'}.`);
    else status = L(`${SEAT_NAMES[s.turn]} is thinking…`, `${SEAT_NAMES[s.turn]} חושב…`);
    $('status').innerHTML = status;
    $('status').className = 'mk-status' + (onTrack ? '' : ' warn');

    const fb = $('feedback');
    if (s.done || showSolution) {
      const ok = s.done && s.tricks[0] >= target;
      fb.className = 'feedback' + (s.done ? (ok ? ' good' : ' bad') : '');
      fb.innerHTML = `<strong>${L('Solution', 'הפתרון')}</strong>${colorSuits(puzzle.solution)}`;
    } else {
      fb.className = 'feedback';
      fb.innerHTML = '';
    }
  }

  // ---------- Setup ----------

  const select = $('select');
  let group = null, groupKey = '';
  PUZZLES.forEach((m, i) => {
    const key = m.section + m.topic;
    if (key !== groupKey) {
      group = document.createElement('optgroup');
      group.label = `${SECTION_NAMES[m.section]}: ${TOPIC_NAMES[m.topic]}`;
      select.appendChild(group);
      groupKey = key;
    }
    group.appendChild(new Option(`${i + 1}. ${m.p.title}`, String(i)));
  });
  // Arrows point the reading direction: in Hebrew "previous" points right.
  $('prev').querySelector('.arrow').textContent = L('←', '→');
  $('next').querySelector('.arrow').textContent = L('→', '←');
  select.addEventListener('change', () => load(Number(select.value)));
  $('prev').addEventListener('click', () => load(index - 1));
  $('next').addEventListener('click', () => load(index + 1));
  $('back').addEventListener('click', stepBack);
  $('fwd').addEventListener('click', stepForward);
  $('replay').addEventListener('click', () => load(index));
  $('hide').addEventListener('click', () => { hideHands = !hideHands; render(); });
  $('solution').addEventListener('click', () => { showSolution = !showSolution; render(); });
  $('hint').addEventListener('click', () => {
    const s = positionAfter(pos);
    if (s.done || !isHuman(s.turn)) return;
    hint = bestCard(s);
    render();
  });

  Sound.init();

  // Start from ?p=N (1-based) if given, e.g. mockup.html?p=12
  const start = Number(new URLSearchParams(location.search).get('p')) || 1;
  load(start - 1);
})();
