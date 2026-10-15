// Opening-lead rules and the opening-lead drill.

// Textbook opening lead. `trump` is a suit letter, or null for no-trump. Returns { card, why }.
function openingLead(hand, trump) {
  const groups = {};
  SUITS.forEach(s => (groups[s] = hand.filter(c => c.suit === s).sort((a, b) => b.value - a.value)));
  const sides = SUITS.filter(s => s !== trump && groups[s].length);
  const touching = (g, n) => g.length >= n && g[0].value >= 11 && g.slice(1, n).every((c, i) => c.value === g[i].value - 1);
  const pick = (list, cmp) => list.slice().sort(cmp)[0];
  const longest = (a, b) => groups[b].length - groups[a].length || hcp(groups[b]) - hcp(groups[a]);
  const lbl = c => cardHtml(c);

  if (!sides.length) {
    const c = groups[trump][groups[trump].length - 1];
    return { card: c, why: `You only hold trumps, so lead your lowest: ${lbl(c)}.` };
  }

  if (!trump) {
    const seq = sides.filter(s => touching(groups[s], 3));
    if (seq.length) {
      const c = groups[pick(seq, longest)][0];
      return { card: c, why: `Against no-trump, lead the top of a three-card sequence: ${lbl(c)}. It pushes out declarer's higher cards without giving away a trick.` };
    }
    const s = pick(sides, longest);
    const c = groups[s][3];
    return { card: c, why: `Against no-trump, lead your longest and strongest suit, ${SUIT_NAME[s]}, and lead the fourth-highest card in it (<em>fourth best</em>): ${lbl(c)}. Once the high cards are gone, your remaining small cards in the suit become winners.` };
  }

  const trumps = groups[trump].length;
  const ak = sides.filter(s => groups[s].length >= 2 && groups[s][0].rank === 'A' && groups[s][1].rank === 'K');
  if (ak.length) {
    const c = groups[pick(ak, longest)][0];
    return { card: c, why: `Against a suit contract, lead the ace from ace-king: ${lbl(c)}. You win the trick, see dummy, and still hold the king.` };
  }
  const seq = sides.filter(s => groups[s][0].rank !== 'A' && touching(groups[s], 2));
  if (seq.length) {
    const c = groups[pick(seq, (a, b) => groups[b][0].value - groups[a][0].value)][0];
    return { card: c, why: `Lead the top of touching honors: ${lbl(c)}. It's safe because it can't give declarer a cheap trick, and it helps set up a trick for your side.` };
  }
  const single = sides.filter(s => groups[s].length === 1 && groups[s][0].value <= 10);
  if (single.length && trumps >= 2) {
    const c = groups[single[0]][0];
    return { card: c, why: `Lead your singleton ${lbl(c)}. When the suit is played again you'll be out of it, and you can ruff with one of your ${trumps} trumps.` };
  }
  const dbl = sides.filter(s => groups[s].length === 2 && groups[s][0].value <= 10);
  if (dbl.length && trumps >= 1) {
    const c = groups[dbl[0]][0];
    return { card: c, why: `Lead the top of a small doubleton: ${lbl(c)}. If partner wins and plays the suit back, you may get to ruff the third round.` };
  }
  const safe = sides.filter(s => groups[s].length >= 3 && groups[s][0].rank !== 'A');
  if (safe.length) {
    const s = pick(safe, longest);
    const g = groups[s];
    if (g[0].value >= 11) {
      const c = g.length >= 4 ? g[3] : g[g.length - 1];
      return {
        card: c,
        why: g.length >= 4
          ? `Lead fourth best from your longest suit headed by an honor: ${lbl(c)}. Leading low keeps your honor to capture one of declarer's cards later.`
          : `Lead low from three cards headed by an honor: ${lbl(c)}. Your honor stays behind to win a trick later.`,
      };
    }
    if (g.length >= 4) {
      return { card: g[1], why: `Your longest safe suit has no honors. From four or more small cards, lead the second-highest: ${lbl(g[1])}. A high spot card tells partner you have nothing worth leading low from.` };
    }
    return { card: g[0], why: `Your longest safe suit has no honors, so lead the top card to tell partner you have nothing there (<em>top of nothing</em>): ${lbl(g[0])}.` };
  }
  if (trumps >= 2 && groups[trump][0].value <= 10) {
    const c = groups[trump][trumps - 1];
    return { card: c, why: `Every side suit is dangerous to lead from: it would give away an ace or an honor. A small trump is the safe lead: ${lbl(c)}.` };
  }
  const aces = sides.filter(s => groups[s][0].rank === 'A');
  if (aces.length) {
    const c = groups[pick(aces, longest)][0];
    return { card: c, why: `Against a suit contract, never lead low from a suit headed by the ace: declarer's king could win the trick and your ace might later be ruffed. With no better choice, lead the ace itself: ${lbl(c)}.` };
  }
  const s = pick(sides, longest);
  const c = groups[s][groups[s].length - 1];
  return { card: c, why: `There's no attractive lead, so lead low from your longest side suit: ${lbl(c)}.` };
}

const LeadTrainer = (() => {
  const stats = makeStats();
  let hand, contract, answer, answered;
  const $ = id => document.getElementById(id);

  function next() {
    ({ hands: [, , , hand], contract } = Play.dealTable());
    answer = openingLead(hand, contract.strain === 'N' ? null : contract.strain);
    answered = false;
    const strain = contract.strain === 'N' ? 'no-trump' : `${SUIT_NAME[contract.strain]} are trumps`;
    $('lead-context').innerHTML =
      `South is declarer in <strong>${contract.level}${suitHtml(contract.strain)}</strong> (${strain}). ` +
      `You are West, so you make the opening lead. Click the card you would lead.`;
    $('lead-feedback').className = 'feedback';
    $('lead-feedback').innerHTML = '';
    $('lead-next').hidden = true;
    renderHand();
  }

  function renderHand(chosen) {
    const area = $('lead-hand');
    area.innerHTML = '';
    renderFan(area, hand, (el, card) => {
      if (answered) {
        if (card === answer.card) el.classList.add('hint');
        else if (card === chosen) el.classList.add('wrong-pick');
        return;
      }
      el.classList.add('playable');
      el.tabIndex = 0;
      el.setAttribute('role', 'button');
      el.addEventListener('click', () => choose(card));
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(card); }
      });
    });
  }

  function choose(card) {
    if (answered) return;
    answered = true;
    const correct = card === answer.card;
    record(stats, correct);
    renderHand(card);
    let verdict = 'Correct!';
    if (!correct) {
      verdict = card.suit === answer.card.suit
        ? `Right suit, but the textbook card is ${cardHtml(answer.card)}.`
        : `The textbook lead is ${cardHtml(answer.card)}.`;
    }
    $('lead-feedback').className = 'feedback ' + (correct ? 'good' : 'bad');
    $('lead-feedback').innerHTML = `<strong>${verdict}</strong><div>${answer.why}</div>`;
    $('lead-stats').textContent = statsText(stats);
    $('lead-next').hidden = false;
    $('lead-next').focus({ preventScroll: true });
  }

  function init() {
    $('lead-next').addEventListener('click', next);
    $('lead-stats').textContent = statsText(stats);
    $('defend-hand').addEventListener('click', () => { Play.setMode('defend'); showTab('play'); });
    next();
  }

  return { init };
})();
