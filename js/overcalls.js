// Overcalls: the opponent on your right opens one of a suit and you decide whether to compete.

// A stopper is a holding that can win a trick in the suit: A, K-x, Q-x-x or J-x-x-x.
function hasStopper(cards) {
  const has = r => cards.some(c => c.rank === r);
  const n = cards.length;
  return has('A') || (has('K') && n >= 2) || (has('Q') && n >= 3) || (has('J') && n >= 4);
}

// Number of top honors (A, K, Q, J, 10) in a suit: two or more makes a "good" suit.
function suitQuality(cards) {
  return cards.filter(c => 'AKQJT'.includes(c.rank)).length;
}

// Simplified SAYC direct-seat action over the opponent's 1-of-a-suit opening. Returns { bid, why }.
function overcallBid(hand, open) {
  const pts = hcp(hand);
  const len = suitLengths(hand);
  const rank = s => SUITS.indexOf(s); // lower index = higher-ranking suit
  const cardsIn = s => hand.filter(c => c.suit === s);
  const theirs = SUIT_NAME[open];

  if (isBalanced(hand) && pts >= 15 && pts <= 18 && hasStopper(cardsIn(open))) {
    return { bid: '1N', why: `Balanced with ${pts} HCP and a stopper in their ${theirs}: overcall 1NT. It shows 15–18 HCP, like a 1NT opening, plus a card that can win a trick in their suit.` };
  }
  if (pts >= 17) {
    return { bid: 'X', why: `${pts} HCP is too strong for a simple overcall (8–16). Double first, then bid your suit or no-trump on the next round to show the extra strength.` };
  }

  const others = SUITS.filter(s => s !== open);
  const best = others.slice().sort((a, b) => len[b] - len[a] || rank(a) - rank(b))[0];
  const L = len[best];
  const above = rank(best) < rank(open); // can be bid at the 1-level
  const name = SUIT_NAME[best];
  const sh = suitHtml(best);

  if (pts >= 6 && pts <= 10 && L >= 6) {
    const level = above ? 2 : 3;
    return { bid: level + best, why: `${pts} HCP with ${L} ${name}: make a <em>weak jump overcall</em> of ${level}${sh}. Like a weak two, it shows a 6-card suit and 6–10 HCP, and uses up the opponents' bidding space.` };
  }
  if (L >= 5) {
    const good = suitQuality(cardsIn(best)) >= 2;
    if (above && pts >= 8 && (pts >= 12 || good)) {
      return { bid: '1' + best, why: `${pts} HCP with ${L} ${name}${good ? ' and good honors' : ''}: overcall 1${sh}. A 1-level overcall shows 8–16 HCP and a good 5+ card suit. It competes for the contract and tells partner what to lead.` };
    }
    if (!above && pts >= 11 && (L >= 6 || good)) {
      return { bid: '2' + best, why: `${pts} HCP with a good ${L}-card ${name} suit: overcall 2${sh}. A 2-level overcall is riskier, so it needs about 11–16 HCP and a good suit.` };
    }
  }

  if (pts >= 12 && len[open] <= 2 && others.every(s => len[s] >= 3)) {
    return { bid: 'X', why: `${pts} HCP, short in their ${theirs} (${len[open]}) and 3+ cards in every other suit: make a <em>takeout double</em>. It asks partner to bid their best suit.` };
  }

  let why;
  if (L >= 5 && above && pts >= 8) why = `${pts} HCP, but your ${name} are too weak to overcall. With fewer than 12 HCP, a 1-level overcall needs a good suit (at least two of A, K, Q, J, 10). Pass.`;
  else if (L >= 5 && pts >= 8) why = `Your ${name} would have to be bid at the 2-level, which needs about 11+ HCP and a good suit. Pass.`;
  else if (pts >= 12) why = `${pts} HCP, but you have no 5-card suit to overcall and no balanced 15–18 with a stopper for 1NT. You also have the wrong shape for a takeout double, which needs shortness in their suit and support for the others. Pass.`;
  else why = `${pts} HCP is not enough to compete. Pass.`;
  return { bid: 'P', why };
}

const OVERCALL_BIDS = ['P', 'X', ...ALL_BIDS.slice(1)];

const OvercallTrainer = makeBidDrill({
  prefix: 'over',
  bids: OVERCALL_BIDS,
  generate() {
    for (;;) {
      // The opponent on your right is dealt a real opening hand.
      const hands = dealHands();
      const opening = openingBid(hands[1]).bid;
      if (opening[0] !== '1' || opening[1] === 'N') continue;
      const open = opening[1];
      const hand = hands[2];
      const answer = overcallBid(hand, open);
      if (answer.bid === 'P' && Math.random() < 0.6) continue;
      const openIndex = ALL_BIDS.indexOf(opening);
      return {
        hand,
        answer,
        context: `
          <table class="auction">
            <tr><th>Right</th><th>You</th><th>Left</th><th>Partner</th></tr>
            <tr><td>1${suitHtml(open)}</td><td class="ask">?</td><td></td><td></td></tr>
          </table>
          <div>The opponent on your right opens 1${suitHtml(open)}. Do you compete?</div>`,
        allowed: bid => bid === 'P' || bid === 'X' || ALL_BIDS.indexOf(bid) > openIndex,
      };
    }
  },
});
