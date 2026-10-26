// Common SAYC conventions, each as a practice scenario: deal a hand, set up the auction, give the answer.

const CONV_ORDER = [1, 2, 3, 4, 5].flatMap(l => ['C', 'D', 'H', 'S', 'N'].map(s => l + s));
const CONV_BIDS = ['P', 'X', ...CONV_ORDER];

// Allow Pass (and optionally Double) plus any bid higher than `last`.
function bidsAbove(last, double = false) {
  const i = CONV_ORDER.indexOf(last);
  return bid => bid === 'P' || (double && bid === 'X') || CONV_ORDER.indexOf(bid) > i;
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
    const both = len.H >= 5 && len.S >= 5
      ? L(' With five or more in both majors, transfer to spades first.', ' עם חמישה קלפים ומעלה בשתי סדרות המייגור, עשו קודם טרנספר לספייד.')
      : '';
    return { bid, why: L(
      `<strong>Jacoby transfer.</strong> With 5+ ${SUIT_NAME[major]}, bid the suit just below: ${bidHtml(bid)}. Partner must bid ${bidHtml('2' + major)}, so the strong 1NT hand becomes declarer and its cards stay hidden. Transfer with any strength: with a weak hand you pass ${bidHtml('2' + major)}, and with more you bid again.${both}`,
      `<strong>טרנספר ג'ייקובי.</strong> עם 5 ${SUIT_NAME[major]} ומעלה, הכריזו את הסדרה שמתחתיה: ${bidHtml(bid)}. השותף חייב להכריז ${bidHtml('2' + major)}, כך שהיד החזקה של ה-1NT הופכת לכרוז והקלפים שלה נשארים מוסתרים. עושים טרנספר עם כל כוח: עם יד חלשה מכריזים פאס על ${bidHtml('2' + major)}, ועם יותר ממשיכים להכריז.${both}`) };
  }
  if ((len.H === 4 || len.S === 4) && pts >= 8) {
    return { bid: '2C', why: L(
      `<strong>Stayman.</strong> With a 4-card major and 8+ HCP, bid ${bidHtml('2C')} to ask partner for a 4-card major. Partner answers ${bidHtml('2H')} or ${bidHtml('2S')} with one, or ${bidHtml('2D')} without. Then you can choose between the major and no-trump.`,
      `<strong>סטיימן.</strong> עם סדרת מייגור של 4 קלפים ו-8 נק' ומעלה, הכריזו ${bidHtml('2C')} כדי לשאול את השותף אם יש לו סדרת מייגור של 4. השותף עונה ${bidHtml('2H')} או ${bidHtml('2S')} עם סדרה כזו, או ${bidHtml('2D')} בלי. אחר כך אפשר לבחור בין סדרת המייגור לבין ללא שליט.`) };
  }
  if (pts <= 7) return { bid: 'P', why: L(
    `${pts} HCP with no 5-card major: opposite 15–17, game is out of reach (you need about 25 combined). Pass.`,
    `${pts} נק' בלי סדרת מייגור של 5: מול 15-17, משחק מלא לא בהישג יד (צריך בערך 25 במשותף). פאס.`) };
  if (pts <= 9) return { bid: '2N', why: L(
    `${pts} HCP with no major to look for: raise to 2NT, inviting partner to bid 3NT with 16–17.`,
    `${pts} נק' בלי סדרת מייגור לחפש: הכריזו 2NT, כדי להזמין את השותף ל-3NT עם 16-17.`) };
  return { bid: '3N', why: L(
    `${pts} HCP with no major to look for: you have enough for game, so bid 3NT.`,
    `${pts} נק' בלי סדרת מייגור לחפש: יש לכם מספיק למשחק מלא, ולכן הכריזו 3NT.`) };
}

// Raising partner's 1-of-a-major opening with 4+ card support: SAYC uses 2NT as the game-forcing raise.
function raiseMajor(hand, major) {
  const pts = hcp(hand);
  if (pts >= 13) {
    return { bid: '2N', why: L(
      `<strong>Jacoby 2NT.</strong> With 4+ card support and 13+ HCP, respond 2NT. It's a game-forcing raise of partner's major. Partner then describes their hand: a new suit at the 3-level shows a singleton or void, and ${bidHtml('4' + major)} shows a minimum.`,
      `<strong>ג'ייקובי 2NT.</strong> עם תמיכה של 4 קלפים ומעלה ו-13 נק' ומעלה, השיבו 2NT. זו תמיכה בסדרת המייגור של השותף שמחייבת עד משחק מלא. השותף מתאר אז את היד שלו: סדרה חדשה ברמת 3 מראה סינגלטון או חוסר, ו-${bidHtml('4' + major)} מראה מינימום.`) };
  }
  if (pts >= 11) return { bid: '3' + major, why: L(
    `${pts} HCP with 4-card support: a limit raise to ${bidHtml('3' + major)}, inviting game. Jacoby 2NT needs 13+.`,
    `${pts} נק' עם תמיכה של 4 קלפים: תמיכה בקפיצה ל-${bidHtml('3' + major)}, הזמנה למשחק מלא. ג'ייקובי 2NT דורש 13 ומעלה.`) };
  return { bid: '2' + major, why: L(
    `${pts} HCP with 4-card support: a simple raise to ${bidHtml('2' + major)}. Jacoby 2NT needs 13+.`,
    `${pts} נק' עם תמיכה של 4 קלפים: תמיכה פשוטה ל-${bidHtml('2' + major)}. ג'ייקובי 2NT דורש 13 ומעלה.`) };
}

const BLACKWOOD = ['5C', '5D', '5H', '5S'];
const GERBER = ['4D', '4H', '4S', '4N'];
function aceResponse(hand, steps, name, ask) {
  const aces = countAces(hand);
  const bid = steps[aces % 4];
  const table = steps.map((b, i) => `${bidHtml(b)} = ${i === 0 ? L('0 or 4', '0 או 4') : i}`).join(', ');
  return { bid, why: L(
    `<strong>${name}.</strong> Partner's ${ask} asks how many aces you hold. You have ${aces}, so bid ${bidHtml(bid)}. The answers go up one step at a time: ${table}.`,
    `<strong>${name}.</strong> ה-${ask} של השותף שואל כמה אסים יש לכם. יש לכם ${aces}, ולכן הכריזו ${bidHtml(bid)}. התשובות עולות במדרגה אחת בכל פעם: ${table}.`) };
}

// Two-suited overcalls over the opponents' 1-of-a-suit. Returns null unless the hand fits Michaels or Unusual 2NT.
function twoSuitedOvercall(hand, open) {
  const len = suitLengths(hand);
  const pair = SUITS.filter(s => s !== open && len[s] >= 5);
  if (pair.length !== 2) return null;
  const has = s => pair.includes(s);
  const names = L(`${SUIT_NAME[pair[0]]} and ${SUIT_NAME[pair[1]]}`, `${SUIT_NAME[pair[0]]} ו${SUIT_NAME[pair[1]]}`);
  const lowestTwo = SUITS.filter(s => s !== open).slice(-2); // the two lowest-ranking unbid suits
  if (pair.every(s => lowestTwo.includes(s))) {
    return { bid: '2N', why: L(
      `<strong>Unusual 2NT.</strong> A jump to 2NT over their opening shows 5-5 or longer in the two <em>lowest</em> unbid suits, here ${names}. Partner picks one.`,
      `<strong>2NT מלאכותי.</strong> קפיצה ל-2NT מעל הפתיחה שלהם מראה 5-5 ומעלה בשתי הסדרות <em>הנמוכות ביותר</em> שלא הוכרזו, כאן ${names}. השותף בוחר אחת מהן.`) };
  }
  const majorsOverMinor = (open === 'C' || open === 'D') && has('H') && has('S');
  const otherMajorAndMinor = (open === 'H' || open === 'S') && has(open === 'H' ? 'S' : 'H');
  if (majorsOverMinor || otherMajorAndMinor) {
    const other = SUIT_NAME[open === 'H' ? 'S' : 'H'];
    const shows = majorsOverMinor
      ? L('both majors', 'שתי סדרות המייגור')
      : L(`the other major (${other}) and a minor`, `סדרת המייגור האחרת (${other}) וסדרת מיינור`);
    return { bid: '2' + open, why: L(
      `<strong>Michaels cuebid.</strong> Bidding the opponents' suit, ${bidHtml('2' + open)}, shows 5-5 or longer in ${shows}. Here that's ${names}.`,
      `<strong>קיו-ביד מייקלס.</strong> הכרזת הסדרה של היריבים, ${bidHtml('2' + open)}, מראה 5-5 ומעלה ב${shows}. כאן אלה ${names}.`) };
  }
  return null;
}

// Partner opened a minor and the opponent on your right overcalled a major.
function negativeDouble(hand, theirs) {
  const pts = hcp(hand);
  const other = theirs === 'H' ? 'S' : 'H';
  const n = suitLengths(hand)[other];
  if (n === 4) return { bid: 'X', why: L(
    `<strong>Negative double.</strong> After their overcall, a double by responder isn't for penalty: it shows exactly four ${SUIT_NAME[other]} (the unbid major) and 6+ HCP.`,
    `<strong>כפל שלילי.</strong> אחרי ההתערבות שלהם, דאבל של המשיב הוא לא דאבל עונשין: הוא מראה בדיוק ארבעה ${SUIT_NAME[other]} (סדרת המייגור שלא הוכרזה) ו-6 נק' ומעלה.`) };
  if (other === 'S') return { bid: '1S', why: L(
    `With ${n} spades you can simply bid ${bidHtml('1S')}. It shows 5+ spades and 6+ HCP. The negative double promises exactly four.`,
    `עם ${n} ספייד אפשר פשוט להכריז ${bidHtml('1S')}. ההכרזה מראה 5 ספייד ומעלה ו-6 נק' ומעלה. הכפל השלילי מבטיח בדיוק ארבעה.`) };
  if (pts >= 10) return { bid: '2H', why: L(
    `With ${n} hearts and ${pts} HCP, bid ${bidHtml('2H')}. A new suit at the 2-level after their overcall shows 5+ cards and 10+ HCP.`,
    `עם ${n} הארט ו-${pts} נק', הכריזו ${bidHtml('2H')}. סדרה חדשה ברמת 2 אחרי ההתערבות שלהם מראה 5 קלפים ומעלה ו-10 נק' ומעלה.`) };
  return { bid: 'X', why: L(
    `<strong>Negative double.</strong> With ${n} hearts but only ${pts} HCP, you're not strong enough to bid ${bidHtml('2H')} (10+). Make a negative double to show hearts instead.`,
    `<strong>כפל שלילי.</strong> עם ${n} הארט אבל רק ${pts} נק', אתם לא מספיק חזקים כדי להכריז ${bidHtml('2H')} (10 ומעלה). הכריזו כפל שלילי כדי להראות את ההארט.`) };
}

// Responding to partner's strong, artificial 2♣.
function respondTo2C(hand) {
  const pts = hcp(hand);
  const len = suitLengths(hand);
  const good = SUITS.filter(s => len[s] >= 5 && hand.filter(c => c.suit === s && 'AKQ'.includes(c.rank)).length >= 2);
  if (pts >= 8 && good.length) {
    const s = good.sort((a, b) => len[b] - len[a])[0];
    const bid = (s === 'H' || s === 'S' ? '2' : '3') + s;
    return { bid, why: L(
      `<strong>Positive response.</strong> With 8+ HCP and a good 5-card suit (two of the top three honors), bid it: ${bidHtml(bid)}. Slam is now likely.`,
      `<strong>תשובה חיובית.</strong> עם 8 נק' ומעלה וסדרה טובה של 5 קלפים (שניים משלושת הקלפים הגבוהים), הכריזו אותה: ${bidHtml(bid)}. עכשיו סלאם סביר.`) };
  }
  if (pts >= 8 && isBalanced(hand)) {
    return { bid: '2N', why: L(
      `<strong>Positive response.</strong> With 8+ HCP and a balanced hand, bid 2NT.`,
      `<strong>תשובה חיובית.</strong> עם 8 נק' ומעלה ויד מאוזנת, הכריזו 2NT.`) };
  }
  return { bid: '2D', why: L(
    `<strong>${bidHtml('2D')} waiting.</strong> With anything else, respond ${bidHtml('2D')}. It's artificial and says nothing about diamonds: it just lets partner describe their big hand. Never pass ${bidHtml('2C')}.`,
    `<strong>${bidHtml('2D')} המתנה.</strong> עם כל יד אחרת, השיבו ${bidHtml('2D')}. ההכרזה מלאכותית ולא אומרת דבר על דיאמונד: היא רק נותנת לשותף לתאר את היד הגדולה שלו. אף פעם אל תכריזו פאס על ${bidHtml('2C')}.`) };
}

// ---------- Scenarios ----------

const PARTNER_FIRST = [SEAT.partner, SEAT.right, SEAT.you, SEAT.left];

const CONVENTION_SCENARIOS = {
  nt: {
    label: L('Stayman and Jacoby transfers', 'סטיימן וטרנספר ג\'ייקובי'),
    generate() {
      const [partner, , hand] = dealHands();
      if (openingBid(partner).bid !== '1N' || hcp(hand) > 15) return null;
      const answer = respondTo1NT(hand);
      if (answer.bid === 'P' && Math.random() < 0.6) return null;
      return {
        hand, answer, allowed: bidsAbove('1N'),
        context: auctionHtml(PARTNER_FIRST, [['1N', 'P', '?', '']], L('Partner opens 1NT: 15–17 HCP, balanced.', 'השותף פותח 1NT: 15-17 נק\', יד מאוזנת.')),
      };
    },
  },
  j2nt: {
    label: L('Jacoby 2NT', 'ג\'ייקובי 2NT'),
    generate() {
      const [partner, , hand] = dealHands();
      const open = openingBid(partner).bid;
      if ((open !== '1H' && open !== '1S') || suitLengths(hand)[open[1]] < 4 || hcp(hand) < 6 || hcp(hand) > 17) return null;
      return {
        hand, answer: raiseMajor(hand, open[1]), allowed: bidsAbove(open),
        context: auctionHtml(PARTNER_FIRST, [[open, 'P', '?', '']],
          L(`Partner opens ${bidHtml(open)}. You have 4+ card support. How do you raise?`, `השותף פותח ${bidHtml(open)}. יש לכם תמיכה של 4 קלפים ומעלה. איך תתמכו?`)),
      };
    },
  },
  blackwood: {
    label: L('Blackwood', 'בלאקווד'),
    generate() {
      const hand = dealHands()[0];
      const major = Math.random() < 0.5 ? 'H' : 'S';
      if (suitLengths(hand)[major] < 4 || hcp(hand) < 13 || hcp(hand) > 17) return null;
      return {
        hand, answer: aceResponse(hand, BLACKWOOD, L('Blackwood', 'בלאקווד'), '4NT'), allowed: bidsAbove('4N'),
        context: auctionHtml(PARTNER_FIRST, [['1' + major, 'P', '2N', 'P'], ['4N', 'P', '?', '']],
          L('You made a Jacoby 2NT raise. Partner now bids 4NT, <strong>Blackwood</strong>, asking how many aces you hold.',
            'תמכתם בג\'ייקובי 2NT. עכשיו השותף מכריז 4NT, <strong>בלאקווד</strong>, ושואל כמה אסים יש לכם.')),
      };
    },
  },
  gerber: {
    label: L('Gerber', 'גרבר'),
    generate() {
      const hand = dealHands()[0];
      if (openingBid(hand).bid !== '1N') return null;
      return {
        hand, answer: aceResponse(hand, GERBER, L('Gerber', 'גרבר'), bidHtml('4C')), allowed: bidsAbove('4C'),
        context: auctionHtml([SEAT.you, SEAT.left, SEAT.partner, SEAT.right], [['1N', 'P', '4C', 'P'], ['?', '', '', '']],
          L(`You opened 1NT. Partner jumps to ${bidHtml('4C')}, <strong>Gerber</strong>, asking how many aces you hold.`,
            `פתחתם 1NT. השותף קופץ ל-${bidHtml('4C')}, <strong>גרבר</strong>, ושואל כמה אסים יש לכם.`)),
      };
    },
  },
  twosuit: {
    label: L('Michaels and Unusual 2NT', 'מייקלס ו-2NT מלאכותי'),
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
        context: auctionHtml([SEAT.right, SEAT.you, SEAT.left, SEAT.partner], [[open, '?', '', '']],
          L(`The opponent on your right opens ${bidHtml(open)}. You hold two long suits.`, `היריב מימינכם פותח ${bidHtml(open)}. יש לכם שתי סדרות ארוכות.`)),
      };
    },
  },
  negdbl: {
    label: L('Negative double', 'כפל שלילי'),
    generate() {
      const [partner, , hand] = dealHands();
      const open = openingBid(partner).bid;
      if (open !== '1C' && open !== '1D') return null;
      const theirs = Math.random() < 0.5 ? 'H' : 'S';
      const len = suitLengths(hand);
      if (len[theirs === 'H' ? 'S' : 'H'] < 4 || len[theirs] > 3 || hcp(hand) < 6 || hcp(hand) > 12) return null;
      return {
        hand, answer: negativeDouble(hand, theirs), allowed: bidsAbove('1' + theirs, true),
        context: auctionHtml(PARTNER_FIRST, [[open, '1' + theirs, '?', '']],
          L(`Partner opens ${bidHtml(open)} and the opponent on your right overcalls ${bidHtml('1' + theirs)}.`,
            `השותף פותח ${bidHtml(open)} והיריב מימינכם מתערב ב-${bidHtml('1' + theirs)}.`)),
      };
    },
  },
  twoclubs: {
    label: L('Responding to 2♣', 'תשובה ל-2♣'),
    generate() {
      const hand = dealHands()[0];
      if (hcp(hand) > 14) return null; // opposite 23+, responder can't hold much
      const answer = respondTo2C(hand);
      if (answer.bid === '2D' && Math.random() < 0.5) return null;
      return {
        hand, answer, allowed: bidsAbove('2C'),
        context: auctionHtml(PARTNER_FIRST, [['2C', 'P', '?', '']],
          L(`Partner opens ${bidHtml('2C')}: strong and artificial, 23+ HCP.`, `השותף פותח ${bidHtml('2C')}: חזקה ומלאכותית, 23 נק' ומעלה.`)),
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
