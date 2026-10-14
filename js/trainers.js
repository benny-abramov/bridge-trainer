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

const OpeningTrainer = (() => {
  const stats = makeStats();
  const BIDS = ['P', '1C', '1D', '1H', '1S', '1N', '2C', '2D', '2H', '2S', '2N', '3C', '3D', '3H', '3S'];
  let hand, answer, answered;
  const $ = id => document.getElementById(id);

  function next() {
    // Passing hands are the most common deal; skip most of them to keep practice interesting.
    do {
      hand = dealHands()[0];
      answer = openingBid(hand);
    } while (answer.bid === 'P' && Math.random() < 0.6);
    answered = false;
    const area = $('open-hand');
    area.innerHTML = '';
    renderFan(area, hand);
    $('open-hcp').textContent = `${hcp(hand)} HCP`;
    $('open-hcp').hidden = !$('open-show-hcp').checked;
    $('open-feedback').className = 'feedback';
    $('open-feedback').innerHTML = '';
    $('open-next').hidden = true;
    renderBids();
  }

  function renderBids(chosen) {
    const box = $('open-bids');
    box.innerHTML = '';
    for (const bid of BIDS) {
      const btn = document.createElement('button');
      btn.className = 'bid' + (bid === 'P' ? ' pass' : '');
      btn.innerHTML = bidHtml(bid);
      if (answered) {
        btn.disabled = true;
        if (bid === answer.bid) btn.classList.add('correct');
        else if (bid === chosen) btn.classList.add('wrong');
      }
      btn.addEventListener('click', () => choose(bid));
      box.appendChild(btn);
    }
  }

  function choose(bid) {
    if (answered) return;
    answered = true;
    const correct = bid === answer.bid;
    record(stats, correct);
    renderBids(bid);
    $('open-hcp').hidden = false;
    $('open-feedback').className = 'feedback ' + (correct ? 'good' : 'bad');
    $('open-feedback').innerHTML =
      `<strong>${correct ? 'Correct!' : `The suggested opening is ${bidHtml(answer.bid)}.`}</strong>` +
      `<div>${answer.why}</div>`;
    $('open-stats').textContent = statsText(stats);
    $('open-next').hidden = false;
    $('open-next').focus({ preventScroll: true });
  }

  function init() {
    $('open-next').addEventListener('click', next);
    $('open-show-hcp').addEventListener('change', e => { if (!answered) $('open-hcp').hidden = !e.target.checked; });
    $('open-stats').textContent = statsText(stats);
    next();
  }

  return { init };
})();
