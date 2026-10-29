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

// A 2-level overcall needs a strong suit: three of A, K, Q, J, 10 with five cards, two of A, K, Q, J with more.
function strongSuit(cards) {
  return cards.length === 5
    ? cards.filter(c => 'AKQJT'.includes(c.rank)).length >= 3
    : cards.filter(c => 'AKQJ'.includes(c.rank)).length >= 2;
}

// A weak jump overcall or a preempt needs a good suit: two of the top four honors (A, K, Q, J).
function goodPreemptSuit(cards) {
  return cards.filter(c => 'AKQJ'.includes(c.rank)).length >= 2;
}

// Simplified SAYC direct-seat action over the opponent's 1-of-a-suit opening. Returns { bid, why }.
// In the balancing seat (after two passes) a suit overcall can be made with about 3 points less.
function overcallBid(hand, open, { balancing = false } = {}) {
  const pts = hcp(hand);
  const len = suitLengths(hand);
  const rank = s => SUITS.indexOf(s); // lower index = higher-ranking suit
  const cardsIn = s => hand.filter(c => c.suit === s);
  const theirs = SUIT_NAME[open];

  if (isBalanced(hand) && pts >= 15 && pts <= 18 && hasStopper(cardsIn(open))) {
    return { bid: '1N', why: L(
      `Balanced with ${pts} HCP and a stopper in their ${theirs}: overcall 1NT. It shows 15–18 HCP, like a 1NT opening, plus a card that can win a trick in their suit.`,
      `יד מאוזנת עם ${pts} נק' ועוצר ב${theirs} שלהם: התערבו ב-1NT. ההכרזה מראה 15-18 נק', כמו פתיחה של 1NT, וגם קלף שיכול לזכות בלקיחה בסדרה שלהם.`) };
  }
  if (pts >= 17) {
    return { bid: 'X', why: L(
      `${pts} HCP is too strong for a simple overcall (8–16). Double first, then bid your suit or no-trump on the next round to show the extra strength.`,
      `${pts} נק' זה חזק מדי להתערבות פשוטה (8-16). הכריזו קודם דאבל, ובסיבוב הבא הכריזו את הסדרה שלכם או ללא שליט כדי להראות את הכוח הנוסף.`) };
  }

  const others = SUITS.filter(s => s !== open);
  const best = others.slice().sort((a, b) => len[b] - len[a] || rank(a) - rank(b))[0];
  const n = len[best];
  const above = rank(best) < rank(open); // can be bid at the 1-level
  const name = SUIT_NAME[best];
  const preemptable = goodPreemptSuit(cardsIn(best));

  if (pts >= 6 && pts <= 10 && n >= 7 && preemptable) {
    // The longer the suit, the higher the preempt: the 3-level with 7 cards, the 4-level with 8+.
    const bid = (n >= 8 ? 4 : 3) + best;
    return { bid, why: L(
      `${pts} HCP with ${n} good ${name}: <em>preempt</em> with ${bidHtml(bid)}. The longer your suit, the higher you jump: the 3-level with 7 cards, the 4-level with 8. It takes away the opponents' bidding space. A preempt needs two of the top four honors (A, K, Q, J).`,
      `${pts} נק' עם ${n} ${name} טובים: הכריזו <em>הכרזת חסימה</em> ב-${bidHtml(bid)}. ככל שהסדרה ארוכה יותר, קופצים גבוה יותר: לרמה 3 עם 7 קלפים, לרמה 4 עם 8. היא לוקחת מהיריבים מקום במכרז. הכרזת חסימה דורשת שניים מארבעת ההונורים העליונים (A, K, Q, J).`) };
  }
  // A weak jump with six cards is at the 2-level only; jumping to the 3-level needs seven.
  if (pts >= 6 && pts <= 10 && n === 6 && preemptable && above) {
    const bid = 2 + best;
    return { bid, why: L(
      `${pts} HCP with ${n} good ${name}: make a <em>weak jump overcall</em> of ${bidHtml(bid)}. Like a weak two, it shows a good 6-card suit (two of the top four honors) and 6–10 HCP, and uses up the opponents' bidding space.`,
      `${pts} נק' עם ${n} ${name} טובים: הכריזו <em>קפיצת התערבות חלשה</em> ל-${bidHtml(bid)}. כמו הכרזת שתיים חלשה, היא מראה סדרה טובה של 6 קלפים (שניים מארבעת ההונורים העליונים) ו-6-10 נק', ותופסת ליריבים מקום במכרז.`) };
  }
  if (n >= 5) {
    const good = suitQuality(cardsIn(best)) >= 2;
    // A long suit counts 1 point for each card beyond four: the fifth and sixth cards can be tricks too.
    const extra = Math.max(0, n - 4);
    const worth = pts + extra + (balancing ? 3 : 0);
    const count = extra
      ? L(`${pts} HCP + ${extra} for the ${n}-card suit = ${pts + extra} points`, `${pts} נק' + ${extra} על סדרה של ${n} קלפים = ${pts + extra} נקודות`)
      : L(`${pts} HCP`, `${pts} נק'`);
    const seat = balancing ? L(' In the balancing seat you can overcall with about 3 points less.', ' במקום הסוגר אפשר להתערב עם בערך 3 נקודות פחות.') : '';
    if (above && worth >= 8 && (worth >= 12 || good)) {
      return { bid: '1' + best, why: L(
        `${count} with ${n} ${name}${good ? ' and good honors' : ''}: overcall ${bidHtml('1' + best)}.${seat} A 1-level overcall shows 8–16 HCP and a good 5+ card suit. It competes for the contract and tells partner what to lead.`,
        `${count} עם ${n} ${name}${good ? ' והונורים טובים' : ''}: התערבו ב-${bidHtml('1' + best)}.${seat} התערבות ברמת 1 מראה 8-16 נק' וסדרה טובה של 5 קלפים ומעלה. היא מתחרה על החוזה ואומרת לשותף מה להוביל.`) };
    }
    // The 2-level is riskier: 11+ HCP (length doesn't count) and a strong suit, three of A-K-Q-J-10
    // in a 5-card suit or two of A-K-Q-J in a longer one.
    if (!above && pts + (balancing ? 3 : 0) >= 11 && strongSuit(cardsIn(best))) {
      return { bid: '2' + best, why: L(
        `${pts} HCP with a strong ${n}-card ${name} suit: overcall ${bidHtml('2' + best)}.${seat} A 2-level overcall is riskier, so it needs 11+ HCP (not counting length) and a strong suit: three of A, K, Q, J, 10 in a 5-card suit, or two of A, K, Q, J in a 6-card suit.`,
        `${pts} נק' עם סדרת ${name} חזקה של ${n} קלפים: התערבו ב-${bidHtml('2' + best)}.${seat} התערבות ברמת 2 מסוכנת יותר, ולכן היא דורשת 11 נק' ומעלה (בלי נקודות אורך) וסדרה חזקה: שלושה מ-A, K, Q, J, 10 בסדרה של 5 קלפים, או שניים מ-A, K, Q, J בסדרה של 6 קלפים.`) };
    }
  }

  if (pts >= 12 && len[open] <= 2 && others.every(s => len[s] >= 3)) {
    return { bid: 'X', why: L(
      `${pts} HCP, short in their ${theirs} (${len[open]}) and 3+ cards in every other suit: make a <em>takeout double</em>. It asks partner to bid their best suit.`,
      `${pts} נק', קצר ב${theirs} שלהם (${len[open]}) ו-3 קלפים ומעלה בכל סדרה אחרת: הכריזו <em>כפל הוצאה</em>. הוא מבקש מהשותף להכריז את הסדרה הטובה ביותר שלו.`) };
  }

  let why;
  if (n === 6 && pts >= 6 && pts <= 10 && preemptable && !above) {
    why = L(`${pts} HCP with ${n} ${name}, but a jump would take you to the 3-level, which needs a 7-card suit. With six cards, a weak jump overcall is only at the 2-level. Pass.`,
      `${pts} נק' עם ${n} ${name}, אבל קפיצה תביא אתכם לרמה 3, וזה דורש סדרה של 7 קלפים. עם שישה קלפים, קפיצת התערבות חלשה היא רק ברמה 2. פאס.`);
  } else if (n >= 6 && pts >= 6 && pts <= 10 && !preemptable) {
    why = L(`${pts} HCP with ${n} ${name}, but the suit is too weak to jump with: a weak jump overcall or a preempt needs two of the top four honors (A, K, Q, J). Pass.`,
      `${pts} נק' עם ${n} ${name}, אבל הסדרה חלשה מדי לקפיצה: קפיצת התערבות חלשה או הכרזת חסימה דורשות שניים מארבעת ההונורים העליונים (A, K, Q, J). פאס.`);
  } else if (n >= 5 && above && pts >= 8) {
    why = L(`${pts} HCP, but your ${name} are too weak to overcall. With fewer than 12 HCP, a 1-level overcall needs a good suit (at least two of A, K, Q, J, 10). Pass.`,
      `${pts} נק', אבל סדרת ה${name} שלכם חלשה מדי להתערבות. עם פחות מ-12 נק', התערבות ברמת 1 דורשת סדרה טובה (לפחות שניים מ-A, K, Q, J, 10). פאס.`);
  } else if (n >= 5 && pts >= 8) {
    why = L(`Your ${name} would have to be bid at the 2-level, which needs 11+ HCP (not counting length) and a strong suit: three of A, K, Q, J, 10 in a 5-card suit, or two of A, K, Q, J in a 6-card suit. Pass.`,
      `את ה${name} שלכם הייתם צריכים להכריז ברמת 2, וזה דורש 11 נק' ומעלה (בלי נקודות אורך) וסדרה חזקה: שלושה מ-A, K, Q, J, 10 בסדרה של 5 קלפים, או שניים מ-A, K, Q, J בסדרה של 6 קלפים. פאס.`);
  } else if (pts >= 12) {
    why = L(`${pts} HCP, but you have no 5-card suit to overcall and no balanced 15–18 with a stopper for 1NT. You also have the wrong shape for a takeout double, which needs shortness in their suit and support for the others. Pass.`,
      `${pts} נק', אבל אין לכם סדרה של 5 קלפים להתערבות, ואין לכם יד מאוזנת של 15-18 עם עוצר בשביל 1NT. גם המבנה לא מתאים לכפל הוצאה, שדורש קוצר בסדרה שלהם ותמיכה באחרות. פאס.`);
  } else {
    why = L(`${pts} HCP is not enough to compete. Pass.`, `${pts} נק' לא מספיקות כדי להתחרות. פאס.`);
  }
  return { bid: 'P', why };
}

const OVERCALL_BIDS = ['P', 'X', ...ALL_BIDS.slice(1)];

const OvercallTrainer = makeBidDrill({
  prefix: 'over',
  practice: 'overcalls',
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
        context: auctionHtml([SEAT.right, SEAT.you, SEAT.left, SEAT.partner], [[opening, '?', '', '']],
          L(`The opponent on your right opens ${bidHtml(opening)}. Do you compete?`, `היריב מימינכם פותח ${bidHtml(opening)}. האם תתחרו?`)),
        allowed: bid => bid === 'P' || bid === 'X' || ALL_BIDS.indexOf(bid) > openIndex,
      };
    }
  },
});
