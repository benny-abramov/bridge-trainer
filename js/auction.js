// The auction for Play a Hand. South deals and North-South bid with the app's own SAYC rules (the
// same functions the bidding drills use): South's opening, North's response, South's rebid and
// North's second bid, including Stayman, Jacoby transfers, Jacoby 2NT and the 2♣ opening. Where
// those rules stop, the next North-South player places the final contract from the partnership's
// combined strength and fit. West can overcall South's 1-of-a-suit opening with the Overcalls
// drill's rules (js/overcalls.js), East answers West, and North competes with a negative double,
// a raise or a pass.

// A reasonable contract for North-South from their combined strength and fit. `allowed` limits
// the suits to choose from (no-trump is always possible).
function chooseContract(north, south, allowed = () => true) {
  const pts = hcp(north) + hcp(south);
  const ln = suitLengths(north), ls = suitLengths(south);
  const fit = s => ln[s] + ls[s];

  let strain = 'N';
  const majors = ['S', 'H'].filter(s => allowed(s) && fit(s) >= 8).sort((a, b) => fit(b) - fit(a));
  const minors = ['D', 'C'].filter(s => allowed(s) && fit(s) >= 9).sort((a, b) => fit(b) - fit(a));
  if (majors.length) strain = majors[0];
  else if (minors.length && !(isBalanced(north) && isBalanced(south))) strain = minors[0];

  // In a suit, the hand with fewer trumps (dummy) also counts its short suits: support points.
  let points = pts;
  if (strain !== 'N') {
    const dummy = ln[strain] <= ls[strain] ? north : south;
    points += supportPoints(dummy, strain) - hcp(dummy);
  }

  return { level: levelFor(strain, points), strain, points };
}

// The level the combined points are worth: game at 25+ in no-trump, 26+ in a major, 29+ in a
// minor, and a small slam at 33+.
function levelFor(strain, points) {
  if (points >= 33) return 6;
  if (strain === 'N') return points >= 25 ? 3 : points >= 23 ? 2 : 1;
  if (strain === 'S' || strain === 'H') return points >= 26 ? 4 : points >= 23 ? 3 : 2;
  return points >= 29 ? 5 : points >= 26 ? 4 : points >= 23 ? 3 : 2;
}

// Responder's second call after a Jacoby transfer. Opener's completion says nothing about their
// length in the major, so with five cards responder offers a choice (2NT invites, 3NT is game);
// with six or more the 8-card fit is certain. Returns null for slam-going hands.
function afterTransfer(hand, major) {
  const pts = hcp(hand), n = suitLengths(hand)[major], name = SUIT_NAME[major];
  const done = L(`Partner's ${bidHtml('2' + major)} only completed the transfer: it says nothing about how many ${name} partner has.`,
    `ה-${bidHtml('2' + major)} של השותף רק השלים את הטרנספר: הוא לא אומר כמה ${name} יש לשותף.`);
  if (pts <= 7) return { call: 'P', why: L(
    `<strong>Transfer and pass.</strong> With only ${pts} HCP, game is out of reach. North transferred just to play in ${name}, so pass ${bidHtml('2' + major)}.`,
    `<strong>טרנספר ופאס.</strong> עם ${pts} נק' בלבד, משחק מלא לא בהישג יד. צפון ביקש טרנספר רק כדי לשחק ב${name}, ולכן פאס על ${bidHtml('2' + major)}.`) };
  if (pts >= 16) return null;
  const game = pts >= 10;
  if (n >= 6) {
    const call = (game ? '4' : '3') + major;
    return { call, why: game
      ? L(`${pts} HCP and ${n} ${name}: enough for game, and with six ${name} you have an 8-card fit even if partner has only two. Bid ${bidHtml(call)}.`,
        `${pts} נק' ו-${n} ${name}: מספיק למשחק מלא, ועם שישה ${name} יש התאמה של 8 קלפים גם אם לשותף יש רק שניים. הכריזו ${bidHtml(call)}.`)
      : L(`${pts} HCP and ${n} ${name}: with six ${name} the fit is certain, so invite game with ${bidHtml(call)}.`,
        `${pts} נק' ו-${n} ${name}: עם שישה ${name} ההתאמה ודאית, ולכן הזמינו למשחק מלא ב-${bidHtml(call)}.`) };
  }
  return game
    ? { call: '3N', why: L(
      `${done} With ${pts} HCP you have enough for game, and with five ${name} you offer a choice: 3NT. Partner bids ${bidHtml('4' + major)} with three or more ${name}.`,
      `${done} עם ${pts} נק' יש מספיק למשחק מלא, ועם חמישה ${name} אתם מציעים בחירה: 3NT. השותף יכריז ${bidHtml('4' + major)} עם שלושה ${name} ומעלה.`) }
    : { call: '2N', why: L(
      `${done} With ${pts} HCP you want to invite game, and with five ${name} you bid 2NT. Partner then chooses the level and whether to play in ${name} or no-trump.`,
      `${done} עם ${pts} נק' אתם רוצים להזמין למשחק מלא, ועם חמישה ${name} אתם מכריזים 2NT. השותף בוחר אז את הרמה, וגם אם לשחק ב${name} או בללא שליט.`) };
}

// Opener's answer to responder's second call after a transfer. 1NT showed 15–17: 16–17 accepts an invitation.
function transferReply(hand, major, call) {
  const pts = hcp(hand), n = suitLengths(hand)[major], name = SUIT_NAME[major];
  const max = pts >= 16, fit = n >= 3;
  const range = max ? L(`${pts} HCP, the top of your 15–17`, `${pts} נק', ראש הטווח שלכם (15-17)`) : L(`${pts} HCP, the bottom of your 15–17`, `${pts} נק', תחתית הטווח שלכם (15-17)`);
  const support = L(fit ? `${n} ${name}, so you have an 8-card fit` : `only ${n} ${name}, so no fit`,
    `${fit ? '' : 'רק '}${n} ${name}, ${fit ? 'כך שיש התאמה של 8 קלפים' : 'כך שאין התאמה'}`);
  if (call === '2N') {
    const bid = max ? (fit ? '4' + major : '3N') : (fit ? '3' + major : 'P');
    return { call: bid, why: L(
      `Partner's 2NT shows five ${name} and invites game. You have ${range}, and ${support}: ${bid === 'P' ? 'pass' : `bid ${bidHtml(bid)}`}.`,
      `ה-2NT של השותף מראה חמישה ${name} ומזמין למשחק מלא. יש לכם ${range}, ${fit ? `ו-${n} ${name}, כך שיש התאמה של 8 קלפים` : `ורק ${n} ${name}, כך שאין התאמה`}: ${bid === 'P' ? 'פאס' : `הכריזו ${bidHtml(bid)}`}.`) };
  }
  if (call === '3N') {
    const bid = fit ? '4' + major : 'P';
    return { call: bid, why: L(
      `Partner's 3NT shows five ${name} and enough for game. You have ${support}: ${fit ? `play in ${bidHtml(bid)}` : 'pass and play 3NT'}.`,
      `ה-3NT של השותף מראה חמישה ${name} ומספיק למשחק מלא. יש לכם ${support}: ${fit ? `שחקו ב-${bidHtml(bid)}` : 'פאס ושחקו ב-3NT'}.`) };
  }
  if (call === '3' + major) {
    const bid = max ? '4' + major : 'P';
    return { call: bid, why: L(
      `Partner's ${bidHtml(call)} shows six ${name} and invites game. You have ${range}: ${max ? `accept with ${bidHtml(bid)}` : 'decline by passing'}.`,
      `ה-${bidHtml(call)} של השותף מראה שישה ${name} ומזמין למשחק מלא. יש לכם ${range}: ${max ? `קבלו ב-${bidHtml(bid)}` : 'דחו בפאס'}.`) };
  }
  if (call === '4' + major) return { call: 'P', why: L('Partner has bid game. Pass.', 'השותף הכריז משחק מלא. פאס.') };
  return null;
}

// Responder's second call after Stayman (1NT – 2♣ – answer). With a fit in the major partner
// showed, count support points: 8–9 invites with 3 of the major, 10+ bids game. Without a fit,
// 2NT invites and 3NT is game. Returns null for slam-going hands (16+).
function afterStayman(hand, answer) {
  const pts = hcp(hand), len = suitLengths(hand);
  if (pts >= 16) return null;
  const major = answer[1];
  if ((major === 'H' || major === 'S') && len[major] >= 4) {
    const sp = supportPoints(hand, major), count = supportText(hand, major);
    const call = (sp >= 10 ? '4' : '3') + major;
    return { call, why: sp >= 10
      ? L(`Partner's ${bidHtml(answer)} shows 4 ${SUIT_NAME[major]}, so you have an 8-card fit. ${count}: opposite 15–17 that's enough for game, so bid ${bidHtml(call)}.`,
        `ה-${bidHtml(answer)} של השותף מראה 4 ${SUIT_NAME[major]}, כך שיש התאמה של 8 קלפים. ${count}: מול 15-17 זה מספיק למשחק מלא, ולכן הכריזו ${bidHtml(call)}.`)
      : L(`Partner's ${bidHtml(answer)} shows 4 ${SUIT_NAME[major]}, so you have an 8-card fit. ${count}: invite game with ${bidHtml(call)}.`,
        `ה-${bidHtml(answer)} של השותף מראה 4 ${SUIT_NAME[major]}, כך שיש התאמה של 8 קלפים. ${count}: הזמינו למשחק מלא ב-${bidHtml(call)}.`) };
  }
  const call = pts >= 10 ? '3N' : '2N';
  const noFit = answer === '2D'
    ? L(`Partner's ${bidHtml('2D')} denies a 4-card major, so there's no major fit.`, `ה-${bidHtml('2D')} של השותף שולל סדרת מייגור של 4, כך שאין התאמה בסדרת מייגור.`)
    : L(`Partner's ${bidHtml(answer)} shows ${SUIT_NAME[major]}, but you have the other major.`, `ה-${bidHtml(answer)} של השותף מראה ${SUIT_NAME[major]}, אבל לכם יש את סדרת המייגור השנייה.`);
  return { call, why: L(
    `${noFit} With ${pts} HCP, ${call === '3N' ? 'bid game: 3NT' : 'invite game with 2NT'}.`,
    `${noFit} עם ${pts} נק', ${call === '3N' ? 'הכריזו משחק מלא: 3NT' : 'הזמינו למשחק מלא ב-2NT'}.`) };
}

// Opener's answer after responder's second call in a Stayman auction. Responder used Stayman, so
// after a heart answer a no-trump bid promises four spades: opener with four spades bids them.
function staymanReply(hand, answer, call) {
  const pts = hcp(hand), len = suitLengths(hand), max = pts >= 16;
  const range = max ? L(`${pts} HCP, the top of your 15–17`, `${pts} נק', ראש הטווח שלכם (15-17)`) : L(`${pts} HCP, the bottom of your 15–17`, `${pts} נק', תחתית הטווח שלכם (15-17)`);
  const spadeFit = answer === '2H' && len.S >= 4 && (call === '2N' || call === '3N');
  if (call === '4H' || call === '4S') return { call: 'P', why: L('Partner has bid game. Pass.', 'השותף הכריז משחק מלא. פאס.') };
  if (spadeFit) {
    const bid = call === '3N' || max ? '4S' : '3S';
    return { call: bid, why: L(
      `Partner used Stayman without hearts, so partner has four spades, and so do you. You have ${range}: bid ${bidHtml(bid)}.`,
      `השותף השתמש בסטיימן בלי הארט, כך שיש לו ארבעה ספייד, וגם לכם. יש לכם ${range}: הכריזו ${bidHtml(bid)}.`) };
  }
  if (call === '3H' || call === '3S') {
    const bid = max ? '4' + call[1] : 'P';
    return { call: bid, why: L(
      `Partner's ${bidHtml(call)} invites game. You have ${range}: ${max ? `accept with ${bidHtml(bid)}` : 'decline by passing'}.`,
      `ה-${bidHtml(call)} של השותף מזמין למשחק מלא. יש לכם ${range}: ${max ? `קבלו ב-${bidHtml(bid)}` : 'דחו בפאס'}.`) };
  }
  if (call === '2N') {
    const bid = max ? '3N' : 'P';
    return { call: bid, why: L(
      `Partner's 2NT invites game. You have ${range}: ${max ? 'accept with 3NT' : 'decline by passing'}.`,
      `ה-2NT של השותף מזמין למשחק מלא. יש לכם ${range}: ${max ? 'קבלו ב-3NT' : 'דחו בפאס'}.`) };
  }
  if (call === '3N') return { call: 'P', why: L('Partner has bid game in no-trump. Pass.', 'השותף הכריז משחק מלא בללא שליט. פאס.') };
  return null;
}

const isBidCall = call => /^\d/.test(call);
// Game: 3NT, 4 of a major or 5 of a minor (or higher).
const isGame = bid => Number(bid[0]) >= ({ N: 3, S: 4, H: 4, D: 5, C: 5 })[bid[1]];
const callRank = bid => (Number(bid[0]) - 1) * 5 + 'CDHSN'.indexOf(bid[1]);

// Bids the deal. Returns { calls: [{ seat, call, why }], contract: { level, strain }, declarer },
// or null when South wouldn't declare (or nobody opens), so the caller deals again.
// With anyDeclarer, an auction won by another seat is returned too.
function bidAuction(hands, { anyDeclarer = false } = {}) {
  const DEALER = 2;
  const calls = [];
  const artificial = new Set(); // indexes of calls that say nothing about the suit named
  let placed = false;

  const lastBid = () => [...calls].reverse().find(c => isBidCall(c.call));
  const lastCall = () => [...calls].reverse().find(c => c.call !== 'P');
  const legal = call => call === 'P'
    || (call === 'X' && !!lastCall() && isBidCall(lastCall().call) && lastCall().seat % 2 !== (DEALER + calls.length) % 2) // double an opponent's bid
    || (isBidCall(call) && (!lastBid() || callRank(call) > callRank(lastBid().call)));
  const callsBy = seat => calls.filter(c => c.seat === seat).map(c => c.call);

  // What a player's calls have shown so far, read from the auction alone: an HCP range and a
  // minimum length in each suit. The computer judges partner by this, never by partner's cards.
  function shownBy(p) {
    let min = 0, max = 37;
    const len = { S: 0, H: 0, D: 0, C: 0 };
    const range = (lo, hi) => { min = Math.max(min, lo); max = Math.max(min, Math.min(max, hi)); };
    const atLeast = (z, n) => { len[z] = Math.max(len[z], n); };
    const isMaj = z => z === 'H' || z === 'S';
    const opener = p === DEALER;
    const open = calls[0].call;
    const partnerOf = (p + 2) % 4;
    const response = calls.find(c => c.seat === (opener ? partnerOf : p) && c.seat !== DEALER && c.call !== 'P');
    let k = 0;
    calls.forEach((c, i) => {
      if (c.seat !== p) return;
      const nth = k++;
      const call = c.call, art = artificial.has(i);
      const before = calls.slice(0, i);
      const interfered = before.some(x => x.seat % 2 === 1 && x.call !== 'P');
      if (call === 'P') { if (nth === 0 && !opener) range(0, interfered ? 9 : open === '1N' ? 7 : 5); return; }
      if (!isBidCall(call)) {
        if (call !== 'X') return;
        range(6, 37);
        const over = before.find(x => x.seat % 2 === 1 && isBidCall(x.call));
        if (nth === 0 && !opener && over && (over.call === '1H' || over.call === '1S')) atLeast(over.call === '1H' ? 'S' : 'H', 4); // negative double
        if (nth === 0 && !opener && over && over.call === '1D') { atLeast('H', 4); atLeast('S', 4); } // both majors
        return;
      }
      const level = Number(call[0]), z = call[1];
      const prev = [...before].reverse().find(x => isBidCall(x.call));
      const cheapest = !prev ? 1 : 'CDHSN'.indexOf(z) > 'CDHSN'.indexOf(prev.call[1]) ? Number(prev.call[0]) : Number(prev.call[0]) + 1;
      const jumps = level - cheapest;

      if (nth === 0 && opener) { // the opening bid
        if (call === '1N') { range(15, 17); SUITS.forEach(x => atLeast(x, 2)); }
        else if (call === '2N') { range(20, 22); SUITS.forEach(x => atLeast(x, 2)); }
        else if (call === '2C') range(23, 37);
        else if (level === 1) { range(12, 21); atLeast(z, isMaj(z) ? 5 : z === 'D' ? 4 : 3); }
        else { range(5, 10); atLeast(z, level + 4); } // weak two: 6 cards, 3-level: 7, 4-level: 8
        return;
      }
      if (nth === 0) { // responder's first bid
        if (open === '1N') {
          if (call === '2C') range(8, 37);
          else if (call === '2D' || call === '2H') atLeast(call === '2D' ? 'H' : 'S', 5);
          else if (call === '2N') range(8, 9);
          else if (call === '3N') range(10, 15);
          return;
        }
        if (open === '2C') { if (call === '2D') range(0, 7); else { range(8, 37); if (z !== 'N') atLeast(z, 5); } return; }
        const o = open[1];
        if (call === '2N' && art) { range(13, 37); atLeast(o, 4); return; } // Jacoby 2NT
        if (z === o) { atLeast(o, isMaj(o) ? 3 : 4); if (level === 2) range(6, 10); else if (level === 3) range(11, 12); else range(13, 37); return; }
        if (call === '1N') { range(6, 10); return; }
        if (call === '2N') { range(11, 12); return; }
        if (call === '3N') { range(13, 15); return; }
        atLeast(z, z === 'H' && level === 2 ? 5 : 4);
        range(level === 1 ? 6 : interfered ? 10 : 11, 37);
        return;
      }
      if (art) return;
      // Opener's later bids after 1NT: completing a transfer shows nothing; a Stayman answer shows four.
      if (opener && open === '1N' && response) {
        if ((response.call === '2D' || response.call === '2H') && nth === 1) return;
        if (response.call === '2C' && nth === 1) { if (isMaj(z)) atLeast(z, 4); return; }
      }
      if (z === 'N') {
        if (opener && open === '2C') range(level === 2 ? 22 : 25, level === 2 ? 24 : 27);
        else if (opener && open !== '1N' && open !== '2N') {
          const twoOverOne = response && response.call[0] === '2' && response.call[1] !== open[1];
          if (!response || response.call === 'P') range(18, 19); // bidding no-trump alone after partner passed
          else if (level === 1 || twoOverOne) range(12, 14);
          else if (level === 2) range(18, 19);
          else range(18, 21);
        }
        return;
      }
      // Opener's answer to a negative double: a minimum unless it jumps.
      if (opener && nth === 1 && before.find(x => x.seat === partnerOf && x.call !== 'P')?.call === 'X') range(jumps ? 16 : 12, jumps ? 18 : 15);
      const partnerBid = new Set(before.filter((x, j) => x.seat === partnerOf && isBidCall(x.call) && !artificial.has(j)).map(x => x.call[1]));
      if (partnerBid.has(z)) { // a raise of partner's suit, or preference
        atLeast(z, opener ? 4 : 3);
        if (opener) range([12, 15, 18][Math.min(jumps, 2)], [14, 17, 21][Math.min(jumps, 2)]);
        return;
      }
      const ownBefore = before.some((x, j) => x.seat === p && isBidCall(x.call) && x.call[1] === z && !artificial.has(j));
      if (ownBefore) {
        atLeast(z, 6);
        if (!interfered) range(opener ? (jumps ? 15 : 12) : (jumps ? 11 : 6), opener ? (jumps ? 17 : 14) : (jumps ? 12 : 10));
        return;
      }
      atLeast(z, 4); // a new suit
      if (opener && open[0] === '1') {
        if (jumps) range(18, 21); // jump shift
        else if (level === 2 && SUITS.indexOf(z) < SUITS.indexOf(open[1])) range(16, 21); // reverse
      }
    });
    return { min, max, len };
  }

  // The next North-South player sets the final contract (or passes when it's already right),
  // from their own hand and what partner has shown in the auction.
  function place(seat) {
    placed = true;
    const last = lastBid();
    const lastArtificial = last && artificial.has(calls.indexOf(last));
    const partnerSeat = (seat + 2) % 4;
    const me = hands[seat], myLen = suitLengths(me), myHcp = hcp(me);
    const info = shownBy(partnerSeat);
    const partnerPts = info.max >= 30 ? info.min + 3 : Math.round((info.min + info.max) / 2);
    // A suit is a fit only as far as the bidding shows it (an own 6-card suit assumes two opposite).
    const fitOf = z => myLen[z] + Math.max(info.len[z], myLen[z] >= 6 ? 2 : 0);
    const majors = ['S', 'H'].filter(z => fitOf(z) >= 8).sort((a, b) => fitOf(b) - fitOf(a));
    const minors = ['D', 'C'].filter(z => fitOf(z) >= 9).sort((a, b) => fitOf(b) - fitOf(a));
    let strain = majors[0] || (minors[0] && !isBalanced(me) ? minors[0] : 'N');
    // No-trump needs a stopper in every suit the opponents have bid.
    const theirSuits = [...new Set(calls.filter(c => c.seat % 2 === 1 && isBidCall(c.call) && c.call[1] !== 'N').map(c => c.call[1]))];
    const unstopped = theirSuits.find(z => !hasStopper(me.filter(c => c.suit === z)));
    if (strain === 'N' && unstopped) {
      const suitFit = ['S', 'H', 'D', 'C'].filter(z => fitOf(z) >= 7 && z !== unstopped).sort((a, b) => fitOf(b) - fitOf(a))[0];
      if (!suitFit) return { call: 'P', why: L(
        `No-trump needs a stopper in their ${SUIT_NAME[unstopped]}, and ${SEAT_NAMES[seat]} has none. With no known fit either, pass and let partner decide.`,
        `ללא שליט דורש עוצר ב${SUIT_NAME[unstopped]} שלהם, ול${SEAT_NAMES[seat]} אין. גם התאמה ידועה אין, ולכן פאס ותנו לשותף להחליט.`) };
      strain = suitFit;
    }
    let points = myHcp + partnerPts;
    if (strain !== 'N') points += myLen[strain] <= info.len[strain] ? supportPoints(me, strain) - myHcp : lengthPoints(me) - myHcp;
    const target = { strain, level: levelFor(strain, points) };

    const shownText = info.max >= 30
      ? (info.min ? L(`${info.min}+ HCP`, `${info.min} נק' ומעלה`) : L('no particular strength', 'כוח לא מוגדר'))
      : L(`${info.min}–${info.max} HCP`, `${info.min}-${info.max} נק'`);
    const known = L(`${SEAT_NAMES[seat]} has ${myHcp} HCP and ${SEAT_NAMES[partnerSeat]} has shown ${shownText}, about ${points} points together`,
      `ל${SEAT_NAMES[seat]} יש ${myHcp} נק', ו${SEAT_NAMES[partnerSeat]} הראה ${shownText}, בערך ${points} נקודות ביחד`);
    const fit = strain === 'N' ? '' : L(`, with at least ${fitOf(strain)} ${SUIT_NAME[strain]} between them`, `, ולפחות ${fitOf(strain)} ${SUIT_NAME[strain]} בשתי הידיים`);

    // Partner's natural game stands unless there's a slam.
    if (last && last.seat === partnerSeat && !lastArtificial && isGame(last.call) && target.level < 6) {
      if (Number(last.call[0]) >= 6) return { call: 'P', why: L(`Partner has bid a slam in ${bidHtml(last.call)}. Pass.`, `השותף הכריז סלאם ב-${bidHtml(last.call)}. פאס.`) };
      return { call: 'P', why: L(`Partner has bid game in ${bidHtml(last.call)}. ${known}: not enough for a slam, so pass.`,
        `השותף הכריז משחק מלא ב-${bidHtml(last.call)}. ${known}: לא מספיק לסלאם, ולכן פאס.`) };
    }
    if (last && last.seat % 2 === 0 && !lastArtificial && last.call[1] === target.strain && Number(last.call[0]) >= target.level) {
      return { call: 'P', why: L(`${known}${fit}: ${bidHtml(last.call)} is the right contract, so pass.`,
        `${known}${fit}: ${bidHtml(last.call)} הוא החוזה הנכון, ולכן פאס.`) };
    }
    let level = target.level;
    while (level <= 7 && !legal(level + target.strain)) level++;
    // Once partner has bid game, never retreat to a part-score above it (3NT → 4♦).
    if (last && last.seat % 2 === 0 && !lastArtificial && isGame(last.call) && !isGame(level + target.strain)) {
      return { call: 'P', why: L(
        `Partner has already bid game in ${bidHtml(last.call)}. ${bidHtml(level + target.strain)} would be only a part-score, so pass.`,
        `השותף כבר הכריז משחק מלא ב-${bidHtml(last.call)}. ${bidHtml(level + target.strain)} יהיה רק חוזה חלקי, ולכן פאס.`) };
    }
    // Going past the level the points call for only makes sense to leave an artificial bid.
    if (level > 7 || (level > target.level && !lastArtificial)) {
      return { call: 'P', why: L(
        `${known}: bidding higher would be too ambitious, so pass and play ${bidHtml(last.call)}.`,
        `${known}: להכריז גבוה יותר יהיה שאפתני מדי, ולכן פאס ומשחקים ב-${bidHtml(last.call)}.`) };
    }
    const bid = level + target.strain;
    return { call: bid, why: L(`${known}${fit}, so ${SEAT_NAMES[seat]} places the contract: ${bidHtml(bid)}.`,
      `${known}${fit}, ולכן ${SEAT_NAMES[seat]} קובע את החוזה: ${bidHtml(bid)}.`) };
  }

  // A rule's answer if it's legal here, otherwise the contract is placed instead.
  const use = (seat, r, isArtificial) => {
    if (!r || !legal(r.bid)) return place(seat);
    // The uncontested rules don't look for stoppers: no-trump needs one in each suit the opponents bid.
    if (/^\dN$/.test(r.bid) && !isArtificial && calls.some(c => c.seat % 2 === 1 && /^\d[CDHS]$/.test(c.call)
      && !hasStopper(hands[seat].filter(k => k.suit === c.call[1])))) return place(seat);
    if (isArtificial) artificial.add(calls.length);
    return { call: r.bid, why: r.why };
  };

  // North's response when West overcalled South's 1-of-a-suit opening. Jacoby 2NT is off, a
  // negative double shows the unbid major, and 1NT promises a stopper in West's suit.
  function competitiveResponse(hand, open, over) {
    const len = suitLengths(hand);
    const theirs = over[1];
    const isMajor = s => s === 'H' || s === 'S';
    const overHtml = bidHtml(over);
    const fit = isMajor(open) && len[open] >= 3;
    const pts = fit ? supportPoints(hand, open) : hcp(hand);
    const count = fit ? supportText(hand, open) : L(`${pts} HCP`, `${pts} נק'`);
    const pass = why => ({ call: 'P', why });
    if (pts < 6) return pass(L(`${count}: too weak to compete after West's ${overHtml}. Pass.`,
      `${count}: חלש מדי כדי להתחרות אחרי ה-${overHtml} של מערב. פאס.`));
    if (fit) {
      const level = pts >= 13 ? 4 : pts >= 11 ? 3 : 2;
      let bid = level + open;
      if (!legal(bid)) bid = (Number(over[0]) + 1) + open;
      if (legal(bid) && Number(bid[0]) <= Math.max(level, 3)) return { call: bid, why: L(
        `${count} and ${len[open]}-card support for partner's ${SUIT_NAME[open]}: raise to ${bidHtml(bid)} despite West's ${overHtml}. Showing the fit comes first.`,
        `${count} ותמיכה של ${len[open]} קלפים ב${SUIT_NAME[open]} של השותף: תמכו ב-${bidHtml(bid)} למרות ה-${overHtml} של מערב. הצגת ההתאמה קודמת לכל.`) };
    }
    if (open === 'C' && over === '1D' && len.H === 4 && len.S === 4 && pts >= 6 && legal('X')) return { call: 'X', why: L(
      `<strong>Negative double.</strong> After 1♣ – (1♦), a double shows both majors, four cards in each, and 6+ HCP. With ${len.S} spades and ${len.H} hearts, double and let partner choose the major.`,
      `<strong>כפל שלילי.</strong> אחרי 1♣ – (1♦), דאבל מראה את שתי סדרות המייגור, ארבעה קלפים בכל אחת, ו-6 נק' ומעלה. עם ${len.S} ספייד ו-${len.H} הארט, הכריזו דאבל ותנו לשותף לבחור את סדרת המייגור.`) };
    const otherMajor = theirs === 'H' ? 'S' : 'H';
    if ((open === 'C' || open === 'D') && (theirs === 'H' || theirs === 'S') && over[0] === '1' && len[otherMajor] >= 4) {
      const r = negativeDouble(hand, theirs);
      if (legal(r.bid)) return { call: r.bid, why: r.why };
    }
    if (theirs !== 'N') {
      const r = responseBid(hand, open);
      const stopper = hasStopper(hand.filter(c => c.suit === theirs));
      if (r.bid !== 'P' && legal(r.bid) && r.bid[1] !== theirs && (r.bid[1] !== 'N' || stopper)) {
        return { call: r.bid, why: r.why + (r.bid[1] === 'N' ? L(` After West's ${overHtml}, no-trump also needs a stopper in their ${SUIT_NAME[theirs]}, and you have one.`,
          ` אחרי ה-${overHtml} של מערב, ללא שליט דורש גם עוצר ב${SUIT_NAME[theirs]} שלהם, ויש לכם.`) : '') };
      }
    }
    // No-trump with a stopper in their suit: 1NT with 6–10, 2NT with 11–12.
    if (theirs !== 'N' && !fit && hasStopper(hand.filter(c => c.suit === theirs)) && pts <= 12) {
      const bid = pts <= 10 ? '1N' : '2N';
      if (legal(bid)) return { call: bid, why: L(
        `${pts} HCP with a stopper in West's ${SUIT_NAME[theirs]}: bid ${bidHtml(bid)}. After their overcall, ${bid === '1N' ? '1NT shows 6–10' : '2NT shows 11–12'} and promises a card that can win a trick in their suit.`,
        `${pts} נק' עם עוצר ב${SUIT_NAME[theirs]} של מערב: הכריזו ${bidHtml(bid)}. אחרי ההתערבות שלהם, ${bid === '1N' ? '1NT מראה 6-10' : '2NT מראה 11-12'} ומבטיח קלף שיכול לזכות בלקיחה בסדרה שלהם.`) };
    }
    if (pts >= 11) return place(0);
    return pass(L(`${count}. After West's ${overHtml} there's no good bid: no fit for partner, no suit to show cheaply and no stopper for no-trump. Pass for now.`,
      `${count}. אחרי ה-${overHtml} של מערב אין הכרזה טובה: אין התאמה לשותף, אין סדרה להראות בזול ואין עוצר בשביל ללא שליט. פאס בינתיים.`));
  }

  // An opponent's long-suit action: a preempt with seven cards (3-level) or eight (4-level) and
  // 5–10 HCP, or, directly over 1NT, a natural 2-level overcall with six cards and 8–15 HCP.
  // Never in a suit North-South have bid naturally.
  function longSuitAction(hand, over1NT) {
    const pts = hcp(hand), len = suitLengths(hand);
    const theirs = new Set(calls.filter((c, i) => c.seat % 2 === 0 && isBidCall(c.call) && !artificial.has(i)).map(c => c.call[1]));
    const best = SUITS.filter(z => !theirs.has(z)).sort((a, b) => len[b] - len[a] || SUITS.indexOf(a) - SUITS.indexOf(b))[0];
    const n = len[best], name = SUIT_NAME[best];
    if (n >= 7 && pts >= 5 && pts <= 10 && goodPreemptSuit(hand.filter(c => c.suit === best))) {
      const bid = (n >= 8 ? 4 : 3) + best;
      if (legal(bid)) return { call: bid, why: L(
        `${pts} HCP with ${n} good ${name}: <em>preempt</em> with ${bidHtml(bid)}. A long, good suit (two of the top four honors) in a weak hand takes away the opponents' bidding space: the 3-level with 7 cards, the 4-level with 8.`,
        `${pts} נק' עם ${n} ${name} טובים: הכריזו <em>הכרזת חסימה</em> ב-${bidHtml(bid)}. סדרה ארוכה וטובה (שניים מארבעת ההונורים העליונים) ביד חלשה לוקחת מהיריבים מקום במכרז: רמה 3 עם 7 קלפים, רמה 4 עם 8.`) };
    }
    if (over1NT && n >= 6 && pts >= 8 && pts <= 15 && legal('2' + best)) return { call: '2' + best, why: L(
      `${pts} HCP with ${n} ${name}: overcall ${bidHtml('2' + best)}. Over a strong 1NT, a natural 2-level overcall shows a good 6-card suit.`,
      `${pts} נק' עם ${n} ${name}: התערבו ב-${bidHtml('2' + best)}. מעל 1NT חזק, התערבות טבעית ברמת 2 מראה סדרה טובה של 6 קלפים.`) };
    return null;
  }

  // Opener's second call after the opponents competed and partner passed. Partner may have
  // nothing, so opener bids only on their own hand: balanced 18–19 with a stopper in the
  // opponents' suit bids no-trump at the cheapest level (with 15–17 you'd have opened 1NT), a
  // 6-card suit or a lower second suit can be shown, and anything else passes.
  function reopen(hand, open, their) {
    const pts = hcp(hand), len = suitLengths(hand);
    const theirSuit = their[1];
    const theirHtml = bidHtml(their);
    const partnerPassed = L(`Partner passed ${theirHtml}, so partner may have very little.`, `השותף הכריז פאס על ${theirHtml}, כך שייתכן שיש לו מעט מאוד.`);
    const cheapest = strain => { let level = 1; while (level <= 3 && !legal(level + strain)) level++; return level <= 3 ? level + strain : null; };
    if (isBalanced(hand) && pts >= 18 && theirSuit !== 'N' && hasStopper(hand.filter(c => c.suit === theirSuit))) {
      const bid = cheapest('N');
      if (bid && Number(bid[0]) <= 2) return { call: bid, why: L(
        `${partnerPassed} With ${pts} HCP, balanced, and a stopper in their ${SUIT_NAME[theirSuit]}, bid ${bidHtml(bid)}. Bidding no-trump on your own after partner's pass shows 18–19 balanced: with 15–17 you would have opened 1NT.`,
        `${partnerPassed} עם ${pts} נק', יד מאוזנת ועוצר ב${SUIT_NAME[theirSuit]} שלהם, הכריזו ${bidHtml(bid)}. הכרזת ללא שליט לבד אחרי הפאס של השותף מראה 18-19 מאוזנת: עם 15-17 הייתם פותחים 1NT.`) };
    }
    if (len[open] >= 6) {
      const bid = cheapest(open);
      if (bid && Number(bid[0]) <= 2 + (pts >= 16 ? 1 : 0)) return { call: bid, why: L(
        `${partnerPassed} With ${pts} HCP and ${len[open]} ${SUIT_NAME[open]}, compete by rebidding your suit: ${bidHtml(bid)}.`,
        `${partnerPassed} עם ${pts} נק' ו-${len[open]} ${SUIT_NAME[open]}, התחרו בחזרה על הסדרה שלכם: ${bidHtml(bid)}.`) };
    }
    const second = SUITS.find(z => z !== open && z !== theirSuit && len[z] >= 5 && SUITS.indexOf(z) > SUITS.indexOf(open));
    if (second && pts >= 13) {
      const bid = cheapest(second);
      if (bid && Number(bid[0]) <= 2) return { call: bid, why: L(
        `${partnerPassed} With ${pts} HCP and a second suit of ${len[second]} ${SUIT_NAME[second]}, compete with ${bidHtml(bid)}.`,
        `${partnerPassed} עם ${pts} נק' וסדרה שנייה של ${len[second]} ${SUIT_NAME[second]}, התחרו ב-${bidHtml(bid)}.`) };
    }
    return { call: 'P', why: L(
      `${partnerPassed} With ${pts} HCP and nothing more to show, pass. Bidding again on your own needs extra values: 18–19 balanced for no-trump, a 6-card suit, or a good second suit.`,
      `${partnerPassed} עם ${pts} נק' ובלי עוד מה להראות, פאס. הכרזה נוספת לבד דורשת כוח נוסף: 18-19 מאוזנת בשביל ללא שליט, סדרה של 6 קלפים או סדרה שנייה טובה.`) };
  }

  // North after passing the overcall, when South bid again alone: no-trump shows 18–19, so 7+
  // makes game; a suit can be raised with support. Otherwise North has already said enough.
  function afterReopen(hand, call) {
    const pts = hcp(hand), len = suitLengths(hand);
    if (call[1] === 'N') {
      if (pts >= 7 && legal('3N')) return { call: '3N', why: L(
        `Partner's ${bidHtml(call)} after your pass shows 18–19 balanced. With ${pts} HCP you have 25+ together: bid 3NT.`,
        `ה-${bidHtml(call)} של השותף אחרי הפאס שלכם מראה 18-19 מאוזנת. עם ${pts} נק' יש לכם ביחד 25 ומעלה: הכריזו 3NT.`) };
      return { call: 'P', why: L(
        `Partner's ${bidHtml(call)} shows 18–19 balanced, but with ${pts} HCP game is out of reach. Pass.`,
        `ה-${bidHtml(call)} של השותף מראה 18-19 מאוזנת, אבל עם ${pts} נק' משחק מלא לא בהישג יד. פאס.`) };
    }
    const suit = call[1];
    if (isBidCall(call) && len[suit] >= 3 && supportPoints(hand, suit) >= 8) {
      const bid = (Number(call[0]) + 1) + suit;
      if (Number(bid[0]) <= 3 && legal(bid)) return { call: bid, why: L(
        `${supportText(hand, suit)} and ${len[suit]}-card support for partner's ${SUIT_NAME[suit]}: raise to ${bidHtml(bid)}.`,
        `${supportText(hand, suit)} ותמיכה של ${len[suit]} קלפים ב${SUIT_NAME[suit]} של השותף: תמכו ב-${bidHtml(bid)}.`) };
    }
    return { call: 'P', why: L(`You already passed, and partner is competing on their own hand. With ${pts} HCP and nothing new to add, pass.`,
      `כבר הכרזתם פאס, והשותף מתחרה על סמך היד שלו. עם ${pts} נק' ובלי משהו חדש להוסיף, פאס.`) };
  }

  // Opener's answer to partner's negative double, which shows four cards in the unbid major.
  // Raise the major with four, otherwise show a second suit or a 6-card suit, bid no-trump only
  // with a stopper in their suit, and pass when the opponents' bid has taken away the need to answer.
  function afterNegativeDouble(hand, open) {
    const pts = hcp(hand), len = suitLengths(hand);
    const over = calls.find(c => c.seat === 3 && isBidCall(c.call)).call;
    const shown = over[1] === 'D' ? ['H', 'S'] : [over[1] === 'H' ? 'S' : 'H'];
    const major = shown.slice().sort((a, b) => len[b] - len[a] || (a === 'S' ? -1 : 1))[0]; // your longer one, spades on a tie
    const latest = [...calls].reverse().find(c => c.seat % 2 === 1 && isBidCall(c.call)).call;
    const theirSuits = new Set(calls.filter(c => c.seat % 2 === 1 && isBidCall(c.call)).map(c => c.call[1]));
    const eastBid = latest !== over;
    const shows = shown.length === 2
      ? L('Partner\'s double shows four cards in each major.', 'הדאבל של השותף מראה ארבעה קלפים בכל אחת מסדרות המייגור.')
      : L(`Partner's double shows four ${SUIT_NAME[major]}.`, `הדאבל של השותף מראה ארבעה ${SUIT_NAME[major]}.`);
    const cheapest = z => { for (let level = 1; level <= 3; level++) if (legal(level + z)) return level + z; return null; };
    if (len[major] >= 4) {
      let bid = cheapest(major);
      if (bid && pts >= 15 && Number(bid[0]) < 4 && legal((Number(bid[0]) + 1) + major)) bid = (Number(bid[0]) + 1) + major;
      if (bid) return { call: bid, why: L(
        `${shows} With ${len[major]} of them you have an 8-card fit: bid ${bidHtml(bid)}${pts >= 15 ? ', jumping to show extra strength' : ''}.`,
        `${shows} עם ${len[major]} כאלה יש התאמה של 8 קלפים: הכריזו ${bidHtml(bid)}${pts >= 15 ? ', בקפיצה כדי להראות כוח נוסף' : ''}.`) };
    }
    const second = SUITS.filter(z => z !== open && !theirSuits.has(z) && !shown.includes(z) && len[z] >= 4).sort((a, b) => len[b] - len[a])[0];
    const secondBid = second && cheapest(second);
    if (secondBid) return { call: secondBid, why: L(
      `${shows} You have only ${len[major]}, so show your second suit instead: ${bidHtml(secondBid)}.`,
      `${shows} יש לכם רק ${len[major]}, ולכן הראו במקום זה את הסדרה השנייה שלכם: ${bidHtml(secondBid)}.`) };
    const rebid = len[open] >= 6 && cheapest(open);
    if (rebid) return { call: rebid, why: L(
      `${shows} Without four of them, rebid your ${len[open]}-card ${SUIT_NAME[open]}: ${bidHtml(rebid)}.`,
      `${shows} בלי ארבעה כאלה, חזרו על ${len[open]} ה${SUIT_NAME[open]} שלכם: ${bidHtml(rebid)}.`) };
    const nt = cheapest('N');
    if (nt && [...theirSuits].every(z => z === 'N' || hasStopper(hand.filter(c => c.suit === z)))) return { call: nt, why: L(
      `${shows} With no fit for it but a stopper in their suit, bid ${bidHtml(nt)}.`,
      `${shows} בלי התאמה, אבל עם עוצר בסדרה שלהם, הכריזו ${bidHtml(nt)}.`) };
    if (eastBid) return { call: 'P', why: L(
      `${shows} You have no fit, no second suit and no stopper in their suit. East's ${bidHtml(latest)} means you don't have to bid, so pass and let partner decide.`,
      `${shows} אין לכם התאמה, סדרה שנייה או עוצר בסדרה שלהם. ה-${bidHtml(latest)} של מזרח פוטר אתכם מלהכריז, ולכן פאס ותנו לשותף להחליט.`) };
    const bid = cheapest(open);
    return { call: bid || 'P', why: L(
      `${shows} With nothing better, rebid your ${SUIT_NAME[open]} at the cheapest level${bid ? `: ${bidHtml(bid)}` : ''}.`,
      `${shows} בלי משהו טוב יותר, חזרו על ה${SUIT_NAME[open]} שלכם ברמה הזולה ביותר${bid ? `: ${bidHtml(bid)}` : ''}.`) };
  }

  // East-West: West's direct action over South's 1-of-a-suit opening, then East's answer. Otherwise they pass.
  function eastWest(seat) {
    const hand = hands[seat];
    const len = suitLengths(hand);
    const open = callsBy(DEALER)[0];
    const openSuit = /^1[CDHS]$/.test(open ?? '') ? open[1] : null;
    const pass = { call: 'P', why: '' };
    if (seat === 3 && calls.length === 1 && openSuit) {
      const r = overcallBid(hand, openSuit);
      return legal(r.bid) ? { call: r.bid, why: r.why } : { call: 'P', why: r.why };
    }
    if (seat === 3 && calls.length === 1 && open === '1N') {
      return longSuitAction(hand, true) || { call: 'P', why: L(
        `${hcp(hand)} HCP. Over a strong 1NT you need a long suit to compete: six cards for a 2-level overcall, or seven for a preempt. Pass.`,
        `${hcp(hand)} נק'. מעל 1NT חזק צריך סדרה ארוכה כדי להתחרות: שישה קלפים להתערבות ברמת 2, או שבעה להכרזת חסימה. פאס.`) };
    }
    const west = calls[1] && calls[1].seat === 3 ? calls[1].call : 'P';
    if (seat === 1 && !callsBy(1).length && west === 'P') return longSuitAction(hand, false) || pass;
    if (seat !== 1 || callsBy(1).length || west === 'P') return pass;
    const north = calls[2].call;
    const pts = hcp(hand);
    if (west === 'X') {
      if (north !== 'P') return { call: 'P', why: L(
        `North bid, so East no longer has to answer partner's takeout double. With ${pts} HCP, pass.`,
        `צפון הכריז, ולכן מזרח כבר לא חייב לענות לכפל ההוצאה של השותף. עם ${pts} נק', פאס.`) };
      const suit = SUITS.filter(s => s !== openSuit).sort((a, b) => len[b] - len[a] || SUITS.indexOf(a) - SUITS.indexOf(b))[0];
      let level = 1;
      while (!legal(level + suit)) level++;
      return { call: level + suit, why: L(
        `Partner's takeout double asks East to bid. With ${len[suit]} ${SUIT_NAME[suit]}, East's longest unbid suit, bid ${bidHtml(level + suit)}.`,
        `כפל ההוצאה של השותף מבקש ממזרח להכריז. עם ${len[suit]} ${SUIT_NAME[suit]}, הסדרה הארוכה ביותר של מזרח שלא הוכרזה, הכריזו ${bidHtml(level + suit)}.`) };
    }
    const theirs = west[1];
    if (theirs !== 'N' && Number(west[0]) <= 2 && len[theirs] >= 3) {
      const sp = supportPoints(hand, theirs);
      let level = Number(west[0]) + 1;
      while (level <= 3 && !legal(level + theirs)) level++;
      if (sp >= 6 && level <= 3) return { call: level + theirs, why: L(
        `${supportText(hand, theirs)} and ${len[theirs]}-card support for partner's ${SUIT_NAME[theirs]}: raise to ${bidHtml(level + theirs)} to compete.`,
        `${supportText(hand, theirs)} ותמיכה של ${len[theirs]} קלפים ב${SUIT_NAME[theirs]} של השותף: תמכו ב-${bidHtml(level + theirs)} כדי להתחרות.`) };
    }
    return { call: 'P', why: L(`No fit for partner's ${bidHtml(west)} worth showing, so East passes.`, `אין למזרח התאמה ששווה להראות ל-${bidHtml(west)} של השותף, ולכן פאס.`) };
  }

  function northSouth(seat) {
    if (placed) {
      // A 7-card suit, already bid twice, corrects partner's no-trump part-score: it can be rebid again.
      const last = lastBid();
      const mine = callsBy(seat);
      const len = suitLengths(hands[seat]);
      const seven = last && last.seat === (seat + 2) % 4 && last.call[1] === 'N' && !isGame(last.call)
        && SUITS.find(z => len[z] >= 7 && mine.filter(c => isBidCall(c) && c[1] === z).length >= 2);
      const bid = seven && [2, 3].map(l => l + seven).find(legal);
      if (bid) return { call: bid, why: L(
        `Partner's ${bidHtml(last.call)} suggests no-trump, but you have ${len[seven]} ${SUIT_NAME[seven]}. A 7-card suit can be rebid a second time, so bid ${bidHtml(bid)} to play there.`,
        `ה-${bidHtml(last.call)} של השותף מציע ללא שליט, אבל יש לכם ${len[seven]} ${SUIT_NAME[seven]}. סדרה של 7 קלפים אפשר לחזור עליה פעם שנייה, ולכן הכריזו ${bidHtml(bid)} כדי לשחק בה.`) };
      return { call: 'P', why: '' };
    }
    const hand = hands[seat];
    const len = suitLengths(hand);
    const mine = callsBy(seat), partner = callsBy((seat + 2) % 4);
    const open = callsBy(DEALER)[0];
    const openSuit = /^1[CDHS]$/.test(open ?? '') ? open[1] : null;

    if (seat === DEALER && !mine.length) { // South opens
      const r = openingBid(hand);
      return use(seat, r, r.bid === '2C');
    }
    if (seat === 0 && !mine.length && open === '1N' && calls[1].call !== 'P') {
      // Stayman and transfers are off after an overcall: compete naturally, or let the points decide.
      if (hcp(hand) >= 8) return place(0);
      const suit = SUITS.find(z => len[z] >= 5 && z !== calls[1].call[1] && legal('2' + z));
      if (suit) return { call: '2' + suit, why: L(
        `West's ${bidHtml(calls[1].call)} turns off Stayman and transfers. With ${hcp(hand)} HCP and ${len[suit]} ${SUIT_NAME[suit]}, bid ${bidHtml('2' + suit)} to play there.`,
        `ה-${bidHtml(calls[1].call)} של מערב מבטל את הסטיימן והטרנספרים. עם ${hcp(hand)} נק' ו-${len[suit]} ${SUIT_NAME[suit]}, הכריזו ${bidHtml('2' + suit)} כדי לשחק שם.`) };
      return { call: 'P', why: L(`${hcp(hand)} HCP: too weak to compete after West's ${bidHtml(calls[1].call)}. Pass.`,
        `${hcp(hand)} נק': חלש מדי כדי להתחרות אחרי ה-${bidHtml(calls[1].call)} של מערב. פאס.`) };
    }
    if (seat === 0 && !mine.length && openSuit && calls[1].call !== 'P' && calls[1].call !== 'X') {
      return competitiveResponse(hand, openSuit, calls[1].call); // North responds after West's overcall
    }
    if (seat === 0 && !mine.length) { // North responds
      if (open === '1N' && hcp(hand) <= 15) {
        const r = respondTo1NT(hand);
        return use(seat, r, ['2C', '2D', '2H'].includes(r.bid));
      }
      if (open === '2C') {
        const r = respondTo2C(hand);
        return use(seat, r, r.bid === '2D');
      }
      if (openSuit && (openSuit === 'H' || openSuit === 'S') && len[openSuit] >= 4) {
        const r = raiseMajor(hand, openSuit);
        return use(seat, r, r.bid === '2N');
      }
      if (openSuit) return use(seat, responseBid(hand, openSuit), false);
      return place(seat);
    }
    if (seat === DEALER && mine.length === 1 && open === '2C' && partner[0] && partner[0] !== 'P') {
      const pts = hcp(hand);
      if (isBalanced(hand)) {
        const bid = pts <= 24 ? '2N' : '3N';
        if (legal(bid)) return { call: bid, why: L(
          `${pts} HCP and balanced: rebid ${bidHtml(bid)}. After a 2♣ opening, 2NT shows 22–24 balanced and 3NT shows 25–27.`,
          `${pts} נק' ויד מאוזנת: הכריזו ${bidHtml(bid)}. אחרי פתיחת 2♣, 2NT מראה 22-24 מאוזנת ו-3NT מראה 25-27.`) };
      }
      const suit = SUITS.slice().sort((a, b) => len[b] - len[a] || SUITS.indexOf(a) - SUITS.indexOf(b))[0];
      let level = 2;
      while (level <= 3 && !legal(level + suit)) level++;
      if (level <= 3) return { call: level + suit, why: L(
        `${pts} HCP with ${len[suit]} ${SUIT_NAME[suit]}: show your suit with ${bidHtml(level + suit)}. After a 2♣ opening the auction is forcing, so partner will bid again.`,
        `${pts} נק' עם ${len[suit]} ${SUIT_NAME[suit]}: הראו את הסדרה שלכם ב-${bidHtml(level + suit)}. אחרי פתיחת 2♣ המכרז מחייב, ולכן השותף יכריז שוב.`) };
    }
    if (seat === DEALER && mine.length === 1 && openSuit && partner[0] === 'X') {
      return afterNegativeDouble(hand, openSuit);
    }
    if (seat === DEALER && mine.length === 1 && openSuit && partner[0] === 'P') {
      const theirs = [...calls].reverse().find(c => c.seat % 2 === 1 && isBidCall(c.call));
      if (theirs) return reopen(hand, openSuit, theirs.call); // the opponents competed and partner passed
    }
    if (seat === DEALER && mine.length === 1) { // South's second call
      const resp = partner[0];
      if (open === '1N' && (resp === '2D' || resp === '2H')) {
        const major = resp === '2D' ? 'H' : 'S';
        return use(seat, { bid: '2' + major, why: L(
          `Completes the transfer: North's ${bidHtml(resp)} showed 5+ ${SUIT_NAME[major]}, so South bids ${bidHtml('2' + major)}.`,
          `משלים את הטרנספר: ה-${bidHtml(resp)} של צפון הראה 5 ${SUIT_NAME[major]} ומעלה, ולכן דרום מכריז ${bidHtml('2' + major)}.`) }, false);
      }
      if (open === '1N' && resp === '2C') {
        const bid = len.H >= 4 ? '2H' : len.S >= 4 ? '2S' : '2D';
        return use(seat, { bid, why: bid === '2D'
          ? L(`Answers Stayman: ${bidHtml('2D')} says South has no 4-card major.`, `תשובה לסטיימן: ${bidHtml('2D')} אומר שלדרום אין סדרת מייגור של 4.`)
          : L(`Answers Stayman: South has 4 ${SUIT_NAME[bid[1]]}.`, `תשובה לסטיימן: לדרום יש 4 ${SUIT_NAME[bid[1]]}.`) }, bid === '2D');
      }
      // rebidBid covers a raise, a 1-level new suit, 1NT or a 2-level new suit (two over one).
      const simple = openSuit && resp && (resp[0] === '1' || (resp[0] === '2' && resp[1] !== 'N') || (resp[1] === openSuit && resp[0] === '3'));
      if (simple) return use(seat, rebidBid(hand, openSuit, resp), false);
      return place(seat);
    }
    const transfer = open === '1N' && ['2D', '2H'].includes(callsBy(0)[0]) ? (callsBy(0)[0] === '2D' ? 'H' : 'S') : null;
    if (seat === 0 && mine.length === 1 && transfer) {
      const r = afterTransfer(hand, transfer);
      if (r) return r;
    }
    const stayman = open === '1N' && callsBy(0)[0] === '2C';
    if (seat === 0 && mine.length === 1 && stayman && /^2[DHS]$/.test(partner[1] ?? '')) {
      const r = afterStayman(hand, partner[1]);
      if (r) return r;
    }
    if (seat === DEALER && mine.length === 2 && stayman && partner.length === 2) {
      const r = staymanReply(hand, mine[1], partner[1]);
      if (r) { placed = true; return r; } // that settles the contract
    }
    if (seat === DEALER && mine.length === 2 && transfer && partner.length === 2) {
      const r = transferReply(hand, transfer, partner[1]);
      if (r) { placed = true; return r; } // that settles the contract
    }
    if (seat === 0 && mine.length === 1 && mine[0] === 'P' && openSuit && partner[1] && partner[1] !== 'P') {
      return afterReopen(hand, partner[1]); // North passed the overcall and South bid again alone
    }
    if (seat === 0 && mine.length === 1 && openSuit) { // North's second call
      return use(seat, responderRebid(hand, openSuit, mine[0], partner[1]), false);
    }
    return place(seat);
  }

  for (let i = 0; i < 40; i++) {
    const seat = (DEALER + i) % 4;
    const { call, why } = seat % 2 ? eastWest(seat) : northSouth(seat);
    if (!calls.length && call === 'P') return null; // South has no opening bid
    calls.push({ seat, call, why });
    if (lastBid() && calls.slice(-3).every(c => c.call === 'P') && calls.length >= 4) break;
  }

  const final = lastBid();
  if (!final) return null;
  const strain = final.call[1];
  const side = final.seat % 2;
  const declarer = calls.find(c => isBidCall(c.call) && c.call[1] === strain && c.seat % 2 === side && !artificial.has(calls.indexOf(c)))?.seat;
  if (declarer !== 2 && !anyDeclarer) return null;
  return { calls, contract: { level: Number(final.call[0]), strain }, declarer, dealer: DEALER };
}
