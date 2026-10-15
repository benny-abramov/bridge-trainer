// Practice drills: counting high-card points and choosing an opening bid.

function makeStats() {
  return { right: 0, total: 0, streak: 0 };
}

function statsText(stats) {
  if (!stats.total) return 'No answers yet';
  const pct = Math.round((stats.right / stats.total) * 100);
  return `${stats.right}/${stats.total} correct (${pct}%) · streak ${stats.streak}`;
}

function record(stats, correct) {
  stats.total++;
  if (correct) { stats.right++; stats.streak++; } else stats.streak = 0;
}

const HcpTrainer = (() => {
  const stats = makeStats();
  let hand, answered;
  const $ = id => document.getElementById(id);

  function next() {
    hand = dealHands()[0];
    answered = false;
    const area = $('hcp-hand');
    area.innerHTML = '';
    renderFan(area, hand);
    $('hcp-input').value = '';
    $('hcp-input').disabled = false;
    $('hcp-check').disabled = false;
    $('hcp-feedback').className = 'feedback';
    $('hcp-feedback').innerHTML = '';
    $('hcp-input').focus({ preventScroll: true });
  }

  function breakdown() {
    const honors = hand.filter(c => HCP_VALUES[c.rank]);
    if (!honors.length) return 'No honors at all — 0 HCP.';
    return honors.map(c => `${cardHtml(c)} <b>${HCP_VALUES[c.rank]}</b>`).join(' + ') + ` = <b>${hcp(hand)}</b>`;
  }

  function check() {
    if (answered) return next();
    const raw = $('hcp-input').value.trim();
    if (raw === '' || isNaN(Number(raw))) {
      $('hcp-feedback').className = 'feedback';
      $('hcp-feedback').textContent = 'Type a number first.';
      return;
    }
    const correct = Number(raw) === hcp(hand);
    record(stats, correct);
    answered = true;
    $('hcp-input').disabled = true;
    $('hcp-feedback').className = 'feedback ' + (correct ? 'good' : 'bad');
    $('hcp-feedback').innerHTML =
      `<strong>${correct ? 'Correct!' : `Not quite — it's ${hcp(hand)}.`}</strong>` +
      `<div class="breakdown">${breakdown()}</div>` +
      `<div class="small">This hand is ${isBalanced(hand) ? '<b>balanced</b>' : '<b>unbalanced</b>'}.</div>`;
    $('hcp-stats').textContent = statsText(stats);
    $('hcp-next').focus({ preventScroll: true });
  }

  function init() {
    $('hcp-check').addEventListener('click', check);
    $('hcp-next').addEventListener('click', next);
    $('hcp-input').addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
    $('hcp-stats').textContent = statsText(stats);
    next();
  }

  return { init };
})();

// Simplified Standard American opening bids. Returns { bid, why }.
function openingBid(hand) {
  const pts = hcp(hand);
  const len = suitLengths(hand);
  const bal = isBalanced(hand);
  const [first, second] = Object.values(len).sort((a, b) => b - a);
  const ruleOf20 = pts + first + second;

  if (pts >= 22) {
    return { bid: '2C', why: `${pts} HCP is 22 or more, so open ${bidHtml('2C')}: the strong, artificial opening. It says nothing about clubs. It tells partner you have a very big hand.` };
  }
  if (bal && pts >= 20 && pts <= 21) {
    return { bid: '2N', why: `Balanced with ${pts} HCP (20–21): open 2NT.` };
  }
  if (bal && pts >= 15 && pts <= 17) {
    return { bid: '1N', why: `Balanced with ${pts} HCP (15–17): open 1NT. It describes your hand in a single bid.` };
  }

  if (pts >= 12 || (pts >= 10 && ruleOf20 >= 20)) {
    const reason = pts >= 12
      ? `${pts} HCP is enough to open`
      : `${pts} HCP plus your two longest suits (${first} + ${second}) makes ${ruleOf20}, so the Rule of 20 says open`;
    let note = '';
    if (bal && pts >= 18 && pts <= 19) note = ' (18–19 balanced is too strong for 1NT: open a suit and jump in no-trump later.)';
    else if (bal && pts <= 14) note = ' (12–14 balanced is too weak for 1NT: open a suit and rebid 1NT.)';

    if (len.S >= 5 || len.H >= 5) {
      const suit = len.S >= len.H ? 'S' : 'H';
      const which = len.S >= 5 && len.H >= 5
        ? (len.S === len.H ? ' With two equal majors, bid spades first.' : ' With two 5+ card majors, bid the longer.')
        : '';
      return { bid: '1' + suit, why: `${reason}. With a ${len[suit]}-card major, open 1${suitHtml(suit)}.${which}${note}` };
    }
    let minor, how;
    if (len.D > len.C) { minor = 'D'; how = 'diamonds are your longer minor'; }
    else if (len.C > len.D) { minor = 'C'; how = 'clubs are your longer minor'; }
    else if (len.C === 3) { minor = 'C'; how = 'with 3-3 in the minors, open 1' + suitHtml('C'); }
    else { minor = 'D'; how = `with ${len.C}-${len.D} in the minors, open 1${suitHtml('D')}`; }
    return { bid: '1' + minor, why: `${reason}. No 5-card major, so open a minor: ${how}.${note}` };
  }

  if (pts >= 5 && pts <= 10) {
    const seven = SUITS.find(s => len[s] >= 7);
    if (seven) {
      return { bid: '3' + seven, why: `${pts} HCP with a ${len[seven]}-card ${SUIT_NAME[seven]} suit: make a 3-level preempt (3${suitHtml(seven)}) to crowd the opponents' bidding.` };
    }
    const six = ['S', 'H', 'D'].find(s => len[s] === 6);
    if (six) {
      return { bid: '2' + six, why: `${pts} HCP with a 6-card ${SUIT_NAME[six]} suit: open a weak two (2${suitHtml(six)}). It shows a long suit in a hand too weak to open at the 1-level.` };
    }
    if (len.C === 6) {
      return { bid: 'P', why: `${pts} HCP is too weak to open at the 1-level. Your 6 clubs can't be shown with a weak 2${suitHtml('C')}, which is reserved for strong hands, so pass.` };
    }
  }
  return { bid: 'P', why: `${pts} HCP is not enough to open, and you have no long suit for a preempt. Pass.` };
}

// Simplified Standard American responses to partner's 1-of-a-suit opening, for hands of 0–12 HCP.
// `open` is the opening suit. Returns { bid, why }.
function responseBid(hand, open) {
  const pts = hcp(hand);
  const len = suitLengths(hand);
  const o = '1' + suitHtml(open);
  const isMajor = open === 'H' || open === 'S';

  if (pts < 6) {
    return { bid: 'P', why: `${pts} HCP: with fewer than 6, pass. Even if partner has a good hand, game is unlikely.` };
  }

  // 1. Support partner's major.
  if (isMajor && len[open] >= 3) {
    if (pts <= 10) {
      return { bid: '2' + open, why: `${pts} HCP and ${len[open]}-card support for partner's major: raise to 2${suitHtml(open)}. Showing an 8-card major fit comes first.` };
    }
    return { bid: '3' + open, why: `${pts} HCP and ${len[open]}-card support: jump to 3${suitHtml(open)}, a <em>limit raise</em>. It invites partner to bid game with a little extra.` };
  }

  // 2. Show a new 4+ card suit at the 1-level, looking for a major fit first.
  if (open === 'C' || open === 'D') {
    if (len.H >= 4 || len.S >= 4) {
      const suit = len.S > len.H ? 'S' : len.H > len.S ? 'H' : len.S >= 5 ? 'S' : 'H';
      let tie = '';
      if (len.H === len.S) tie = len.S >= 5 ? ' With two 5-card majors, bid spades first.' : ' With four cards in both majors, bid hearts first (up the line).';
      return { bid: '1' + suit, why: `${pts} HCP and ${len[suit]} ${SUIT_NAME[suit]}: bid 1${suitHtml(suit)}. A new suit at the 1-level shows 4+ cards and 6+ HCP, and looking for a major fit comes before raising a minor.${tie}` };
    }
    if (open === 'C' && len.D >= 4) {
      return { bid: '1D', why: `${pts} HCP and ${len.D} diamonds, no 4-card major: bid 1${suitHtml('D')}. A new suit at the 1-level shows 4+ cards and asks partner to bid again.` };
    }
  }
  if (open === 'H' && len.S >= 4) {
    return { bid: '1S', why: `${pts} HCP, fewer than 3 hearts, but ${len.S} spades: bid 1${suitHtml('S')}. A new suit at the 1-level shows 4+ cards and 6+ HCP.` };
  }

  // 3. Raise partner's minor (4+ diamonds or 5+ clubs, since a minor opening can be short).
  if ((open === 'D' && len.D >= 4) || (open === 'C' && len.C >= 5)) {
    if (pts <= 10) {
      return { bid: '2' + open, why: `${pts} HCP, no 4-card major and ${len[open]}-card support: raise to 2${suitHtml(open)}.` };
    }
    return { bid: '3' + open, why: `${pts} HCP, no 4-card major and ${len[open]}-card support: jump to 3${suitHtml(open)}, a limit raise inviting game.` };
  }

  // 4. Weak hand with nothing else to say.
  if (pts <= 10) {
    return { bid: '1N', why: `${pts} HCP with no fit and no new suit to show at the 1-level: respond 1NT (6–10 HCP).` };
  }

  // 5. 11–12 HCP: a new suit at the 2-level, or 2NT.
  const twoLevel = SUITS
    .filter(s => SUITS.indexOf(s) > SUITS.indexOf(open) && len[s] >= (s === 'H' ? 5 : 4))
    .sort((a, b) => len[b] - len[a] || SUITS.indexOf(b) - SUITS.indexOf(a));
  if (twoLevel.length) {
    const s = twoLevel[0];
    return { bid: '2' + s, why: `${pts} HCP with no fit for partner and ${len[s]} ${SUIT_NAME[s]}: bid 2${suitHtml(s)}. A new suit at the 2-level needs 11+ HCP${s === 'H' ? ' (and 5 hearts)' : ''}.` };
  }
  return { bid: '2N', why: `${pts} HCP with no fit and no suit to show: bid 2NT, inviting game (11–12 HCP).` };
}

// A bidding drill: show a hand (and optional context), let the player pick a bid, explain the answer.
// Elements are looked up as `${prefix}-hand`, `${prefix}-bids`, and so on.
function makeBidDrill({ prefix, bids, generate }) {
  const stats = makeStats();
  let deal, answered;
  const $ = id => document.getElementById(`${prefix}-${id}`);

  function next() {
    deal = generate();
    answered = false;
    const area = $('hand');
    area.innerHTML = '';
    renderFan(area, deal.hand);
    if (deal.context) $('context').innerHTML = deal.context;
    $('hcp').textContent = `${hcp(deal.hand)} HCP`;
    $('hcp').hidden = !$('show-hcp').checked;
    $('feedback').className = 'feedback';
    $('feedback').innerHTML = '';
    $('next').hidden = true;
    renderBids();
  }

  function renderBids(chosen) {
    const box = $('bids');
    box.innerHTML = '';
    for (const bid of bids) {
      const btn = document.createElement('button');
      btn.className = 'bid' + (bid === 'P' ? ' pass' : '');
      btn.innerHTML = bidHtml(bid);
      if (deal.allowed && !deal.allowed(bid)) btn.disabled = true;
      if (answered) {
        btn.disabled = true;
        if (bid === deal.answer.bid) btn.classList.add('correct');
        else if (bid === chosen) btn.classList.add('wrong');
      }
      btn.addEventListener('click', () => choose(bid));
      box.appendChild(btn);
    }
  }

  function choose(bid) {
    if (answered) return;
    answered = true;
    const correct = bid === deal.answer.bid;
    record(stats, correct);
    renderBids(bid);
    $('hcp').hidden = false;
    $('feedback').className = 'feedback ' + (correct ? 'good' : 'bad');
    $('feedback').innerHTML =
      `<strong>${correct ? 'Correct!' : `The suggested bid is ${bidHtml(deal.answer.bid)}.`}</strong>` +
      `<div>${deal.answer.why}</div>`;
    $('stats').textContent = statsText(stats);
    $('next').hidden = false;
    $('next').focus({ preventScroll: true });
  }

  function init() {
    $('next').addEventListener('click', next);
    $('show-hcp').addEventListener('change', e => { if (!answered) $('hcp').hidden = !e.target.checked; });
    $('stats').textContent = statsText(stats);
    next();
  }

  return { init };
}

// Bids are listed in auction order, so comparing indexes tells whether a bid is higher.
const ALL_BIDS = ['P', '1C', '1D', '1H', '1S', '1N', '2C', '2D', '2H', '2S', '2N', '3C', '3D', '3H', '3S'];

const OpeningTrainer = makeBidDrill({
  prefix: 'open',
  bids: ALL_BIDS,
  generate() {
    // Passing hands are the most common deal; skip most of them to keep practice interesting.
    let hand, answer;
    do {
      hand = dealHands()[0];
      answer = openingBid(hand);
    } while (answer.bid === 'P' && Math.random() < 0.6);
    return { hand, answer };
  },
});

const RespondingTrainer = makeBidDrill({
  prefix: 'resp',
  bids: ALL_BIDS,
  generate() {
    const open = ['C', 'D', 'H', 'S'][Math.floor(Math.random() * 4)];
    let hand, answer;
    do {
      hand = dealHands()[0];
      answer = responseBid(hand, open);
    } while (hcp(hand) > 12 || (answer.bid === 'P' && Math.random() < 0.7));
    const openIndex = ALL_BIDS.indexOf('1' + open);
    return {
      hand,
      answer,
      context: `Partner opens <strong>1${suitHtml(open)}</strong>. The opponents pass. What do you respond?`,
      allowed: bid => bid === 'P' || ALL_BIDS.indexOf(bid) > openIndex,
    };
  },
});
