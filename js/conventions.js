// Common SAYC conventions, each as a practice scenario: deal a hand, set up the auction, give the answer.

const CONV_ORDER = [1, 2, 3, 4, 5].flatMap(l => ['C', 'D', 'H', 'S', 'N'].map(s => l + s));
const CONV_BIDS = ['P', 'X', ...CONV_ORDER];

// Allow Pass (and optionally Double) plus any bid higher than `last`.
function bidsAbove(last, double = false) {
  const i = CONV_ORDER.indexOf(last);
  return bid => bid === 'P' || (double && bid === 'X') || CONV_ORDER.indexOf(bid) > i;
}

function auctionHtml(headers, rows, note) {
  const cell = b => (b === '?' ? '<td class="ask">?</td>' : `<td>${b ? bidHtml(b) : ''}</td>`);
  return `
    <table class="auction">
      <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
      ${rows.map(r => `<tr>${r.map(cell).join('')}</tr>`).join('')}
    </table>
    <div>${note}</div>`;
}

const countAces = hand => hand.filter(c => c.rank === 'A').length;

// ---------- Rules ----------

// Responding to partner's 1NT (15–17) with 0–15 HCP: Jacoby transfers, Stayman, or natural no-trump.
function respondTo1NT(hand) {
  const pts = hcp(hand);
  const len = suitLengths(hand);
  if (len.H >= 5 || len.S >= 5) {
    const major = len.S >= len.H ? 'S' : 'H';
    const bid = major === 'H' ? '2D' : '2H';
    const both = len.H >= 5 && len.S >= 5 ? ' With five or more in both majors, transfer to spades first.' : '';
    return { bid, why: `<strong>Jacoby transfer.</strong> With 5+ ${SUIT_NAME[major]}, bid the suit just below: ${bidHtml(bid)}. Partner must bid 2${suitHtml(major)}, so the strong 1NT hand becomes declarer and its cards stay hidden. Transfer with any strength: with a weak hand you pass 2${suitHtml(major)}, and with more you bid again.${both}` };
  }
  if ((len.H === 4 || len.S === 4) && pts >= 8) {
    return { bid: '2C', why: `<strong>Stayman.</strong> With a 4-card major and 8+ HCP, bid 2${suitHtml('C')} to ask partner for a 4-card major. Partner answers 2${suitHtml('H')} or 2${suitHtml('S')} with one, or 2${suitHtml('D')} without. Then you can choose between the major and no-trump.` };
  }
  if (pts <= 7) return { bid: 'P', why: `${pts} HCP with no 5-card major: opposite 15–17, game is out of reach (you need about 25 combined). Pass.` };
  if (pts <= 9) return { bid: '2N', why: `${pts} HCP with no major to look for: raise to 2NT, inviting partner to bid 3NT with 16–17.` };
  return { bid: '3N', why: `${pts} HCP with no major to look for: you have enough for game, so bid 3NT.` };
}

// Raising partner's 1-of-a-major opening with 4+ card support: SAYC uses 2NT as the game-forcing raise.
function raiseMajor(hand, major) {
  const pts = hcp(hand);
  const sh = suitHtml(major);
  if (pts >= 13) {
    return { bid: '2N', why: `<strong>Jacoby 2NT.</strong> With 4+ card support and 13+ HCP, respond 2NT. It's a game-forcing raise of partner's major. Partner then describes their hand: a new suit at the 3-level shows a singleton or void, and 4${sh} shows a minimum.` };
  }
  if (pts >= 11) return { bid: '3' + major, why: `${pts} HCP with 4-card support: a limit raise to 3${sh}, inviting game. Jacoby 2NT needs 13+.` };
  return { bid: '2' + major, why: `${pts} HCP with 4-card support: a simple raise to 2${sh}. Jacoby 2NT needs 13+.` };
}

const BLACKWOOD = ['5C', '5D', '5H', '5S'];
const GERBER = ['4D', '4H', '4S', '4N'];
function aceResponse(hand, steps, name, ask) {
  const aces = countAces(hand);
  const bid = steps[aces % 4];
  const table = steps.map((b, i) => `${bidHtml(b)} = ${i === 0 ? '0 or 4' : i}`).join(', ');
  return { bid, why: `<strong>${name}.</strong> Partner's ${ask} asks how many aces you hold. You have ${aces}, so bid ${bidHtml(bid)}. The answers go up one step at a time: ${table}.` };
}

// Two-suited overcalls over the opponents' 1-of-a-suit. Returns null unless the hand fits Michaels or Unusual 2NT.
function twoSuitedOvercall(hand, open) {
  const len = suitLengths(hand);
  const pair = SUITS.filter(s => s !== open && len[s] >= 5);
  if (pair.length !== 2) return null;
  const has = s => pair.includes(s);
  const names = `${SUIT_NAME[pair[0]]} and ${SUIT_NAME[pair[1]]}`;
  const lowestTwo = SUITS.filter(s => s !== open).slice(-2); // the two lowest-ranking unbid suits
  if (pair.every(s => lowestTwo.includes(s))) {
    return { bid: '2N', why: `<strong>Unusual 2NT.</strong> A jump to 2NT over their opening shows 5-5 or longer in the two <em>lowest</em> unbid suits, here ${names}. Partner picks one.` };
  }
  const majorsOverMinor = (open === 'C' || open === 'D') && has('H') && has('S');
  const otherMajorAndMinor = (open === 'H' || open === 'S') && has(open === 'H' ? 'S' : 'H');
  if (majorsOverMinor || otherMajorAndMinor) {
    const shows = majorsOverMinor ? 'both majors' : `the other major (${SUIT_NAME[open === 'H' ? 'S' : 'H']}) and a minor`;
    return { bid: '2' + open, why: `<strong>Michaels cuebid.</strong> Bidding the opponents' suit, 2${suitHtml(open)}, shows 5-5 or longer in ${shows}. Here that's ${names}.` };
  }
  return null;
}

// Partner opened a minor and the opponent on your right overcalled a major.
function negativeDouble(hand, theirs) {
  const pts = hcp(hand);
  const other = theirs === 'H' ? 'S' : 'H';
  const n = suitLengths(hand)[other];
  const sh = suitHtml(other);
  if (n === 4) return { bid: 'X', why: `<strong>Negative double.</strong> After their overcall, a double by responder isn't for penalty: it shows exactly four ${SUIT_NAME[other]} (the unbid major) and 6+ HCP.` };
  if (other === 'S') return { bid: '1S', why: `With ${n} spades you can simply bid 1${sh}. It shows 5+ spades and 6+ HCP. The negative double promises exactly four.` };
  if (pts >= 10) return { bid: '2H', why: `With ${n} hearts and ${pts} HCP, bid 2${sh}. A new suit at the 2-level after their overcall shows 5+ cards and 10+ HCP.` };
  return { bid: 'X', why: `<strong>Negative double.</strong> With ${n} hearts but only ${pts} HCP, you're not strong enough to bid 2${sh} (10+). Make a negative double to show hearts instead.` };
}

// Responding to partner's strong, artificial 2♣.
function respondTo2C(hand) {
  const pts = hcp(hand);
  const len = suitLengths(hand);
  const good = SUITS.filter(s => len[s] >= 5 && hand.filter(c => c.suit === s && 'AKQ'.includes(c.rank)).length >= 2);
  if (pts >= 8 && good.length) {
    const s = good.sort((a, b) => len[b] - len[a])[0];
    const bid = (s === 'H' || s === 'S' ? '2' : '3') + s;
    return { bid, why: `<strong>Positive response.</strong> With 8+ HCP and a good 5-card suit (two of the top three honors), bid it: ${bidHtml(bid)}. Slam is now likely.` };
  }
  if (pts >= 8 && isBalanced(hand)) {
    return { bid: '2N', why: `<strong>Positive response.</strong> With 8+ HCP and a balanced hand, bid 2NT.` };
  }
  return { bid: '2D', why: `<strong>2${suitHtml('D')} waiting.</strong> With anything else, respond 2${suitHtml('D')}. It's artificial and says nothing about diamonds: it just lets partner describe their big hand. Never pass 2${suitHtml('C')}.` };
}

// ---------- Scenarios ----------

const CONVENTION_SCENARIOS = {
  nt: {
    label: 'Stayman and Jacoby transfers',
    generate() {
      const [partner, , hand] = dealHands();
      if (openingBid(partner).bid !== '1N' || hcp(hand) > 15) return null;
      const answer = respondTo1NT(hand);
      if (answer.bid === 'P' && Math.random() < 0.6) return null;
      return {
        hand, answer, allowed: bidsAbove('1N'),
        context: auctionHtml(['Partner', 'Right', 'You', 'Left'], [['1N', 'P', '?', '']], `Partner opens 1NT: 15–17 HCP, balanced.`),
      };
    },
  },
  j2nt: {
    label: 'Jacoby 2NT',
    generate() {
      const [partner, , hand] = dealHands();
      const open = openingBid(partner).bid;
      if ((open !== '1H' && open !== '1S') || suitLengths(hand)[open[1]] < 4 || hcp(hand) < 6 || hcp(hand) > 17) return null;
      return {
        hand, answer: raiseMajor(hand, open[1]), allowed: bidsAbove(open),
        context: auctionHtml(['Partner', 'Right', 'You', 'Left'], [[open, 'P', '?', '']], `Partner opens ${bidHtml(open)}. You have 4+ card support. How do you raise?`),
      };
    },
  },
  blackwood: {
    label: 'Blackwood',
    generate() {
      const hand = dealHands()[0];
      const major = Math.random() < 0.5 ? 'H' : 'S';
      if (suitLengths(hand)[major] < 4 || hcp(hand) < 13 || hcp(hand) > 17) return null;
      return {
        hand, answer: aceResponse(hand, BLACKWOOD, 'Blackwood', '4NT'), allowed: bidsAbove('4N'),
        context: auctionHtml(['Partner', 'Right', 'You', 'Left'], [['1' + major, 'P', '2N', 'P'], ['4N', 'P', '?', '']],
          `You made a Jacoby 2NT raise. Partner now bids 4NT, <strong>Blackwood</strong>, asking how many aces you hold.`),
      };
    },
  },
  gerber: {
    label: 'Gerber',
    generate() {
      const hand = dealHands()[0];
      if (openingBid(hand).bid !== '1N') return null;
      return {
        hand, answer: aceResponse(hand, GERBER, 'Gerber', '4' + suitHtml('C')), allowed: bidsAbove('4C'),
        context: auctionHtml(['You', 'Left', 'Partner', 'Right'], [['1N', 'P', '4C', 'P'], ['?', '', '', '']],
          `You opened 1NT. Partner jumps to 4${suitHtml('C')}, <strong>Gerber</strong>, asking how many aces you hold.`),
      };
    },
  },
  twosuit: {
    label: 'Michaels and Unusual 2NT',
    generate() {
      const hands = dealHands();
      const open = openingBid(hands[1]).bid;
      if (open[0] !== '1' || open[1] === 'N') return null;
      const hand = hands[2];
      if (hcp(hand) < 6) return null;
      const answer = twoSuitedOvercall(hand, open[1]);
      if (!answer) return null;
      return {
        hand, answer, allowed: bidsAbove(open, true),
        context: auctionHtml(['Right', 'You', 'Left', 'Partner'], [[open, '?', '', '']], `The opponent on your right opens ${bidHtml(open)}. You hold two long suits.`),
      };
    },
  },
  negdbl: {
    label: 'Negative double',
    generate() {
      const [partner, , hand] = dealHands();
      const open = openingBid(partner).bid;
      if (open !== '1C' && open !== '1D') return null;
      const theirs = Math.random() < 0.5 ? 'H' : 'S';
      const len = suitLengths(hand);
      if (len[theirs === 'H' ? 'S' : 'H'] < 4 || len[theirs] > 3 || hcp(hand) < 6 || hcp(hand) > 12) return null;
      return {
        hand, answer: negativeDouble(hand, theirs), allowed: bidsAbove('1' + theirs, true),
        context: auctionHtml(['Partner', 'Right', 'You', 'Left'], [[open, '1' + theirs, '?', '']], `Partner opens ${bidHtml(open)} and the opponent on your right overcalls 1${suitHtml(theirs)}.`),
      };
    },
  },
  twoclubs: {
    label: 'Responding to 2♣',
    generate() {
      const hand = dealHands()[0];
      if (hcp(hand) > 14) return null; // opposite 22+, responder can't hold much
      const answer = respondTo2C(hand);
      if (answer.bid === '2D' && Math.random() < 0.5) return null;
      return {
        hand, answer, allowed: bidsAbove('2C'),
        context: auctionHtml(['Partner', 'Right', 'You', 'Left'], [['2C', 'P', '?', '']], `Partner opens 2${suitHtml('C')}: strong and artificial, 22+ HCP.`),
      };
    },
  },
};

const ConventionTrainer = makeBidDrill({
  prefix: 'conv',
  bids: CONV_BIDS,
  generate() {
    const choice = document.getElementById('conv-filter').value;
    const keys = Object.keys(CONVENTION_SCENARIOS);
    for (;;) {
      const key = choice === 'all' ? keys[Math.floor(Math.random() * keys.length)] : choice;
      const deal = CONVENTION_SCENARIOS[key].generate();
      if (deal) return deal;
    }
  },
});

function initConventions() {
  const select = document.getElementById('conv-filter');
  for (const [key, s] of Object.entries(CONVENTION_SCENARIOS)) select.add(new Option(s.label, key));
  select.addEventListener('change', () => ConventionTrainer.next());
  ConventionTrainer.init();
}
