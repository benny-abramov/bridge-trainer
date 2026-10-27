// The auction for Play a Hand. South deals and North-South bid with the app's own SAYC rules (the
// same functions the bidding drills use): South's opening, North's response, South's rebid and
// North's second bid, including Stayman, Jacoby transfers, Jacoby 2NT and the 2♣ opening. Where
// those rules stop, the next North-South player places the final contract from the partnership's
// combined strength and fit. East and West pass throughout.

// A reasonable contract for North-South from their combined strength and fit.
function chooseContract(north, south) {
  const pts = hcp(north) + hcp(south);
  const ln = suitLengths(north), ls = suitLengths(south);
  const fit = s => ln[s] + ls[s];

  let strain = 'N';
  const majors = ['S', 'H'].filter(s => fit(s) >= 8).sort((a, b) => fit(b) - fit(a));
  const minors = ['D', 'C'].filter(s => fit(s) >= 9).sort((a, b) => fit(b) - fit(a));
  if (majors.length) strain = majors[0];
  else if (minors.length && !(isBalanced(north) && isBalanced(south))) strain = minors[0];

  let level;
  if (strain === 'N') level = pts >= 33 ? 6 : pts >= 25 ? 3 : pts >= 23 ? 2 : 1;
  else if (strain === 'S' || strain === 'H') level = pts >= 33 ? 6 : pts >= 26 ? 4 : pts >= 23 ? 3 : 2;
  else level = pts >= 33 ? 6 : pts >= 29 ? 5 : pts >= 26 ? 4 : pts >= 23 ? 3 : 2;
  return { level, strain };
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

const isBidCall = call => /^\d/.test(call);
const callRank = bid => (Number(bid[0]) - 1) * 5 + 'CDHSN'.indexOf(bid[1]);

// Bids the deal. Returns { calls: [{ seat, call, why }], contract: { level, strain }, declarer },
// or null when South wouldn't declare (or nobody opens), so the caller deals again.
function bidAuction(hands) {
  const DEALER = 2;
  const calls = [];
  const target = chooseContract(hands[0], hands[2]);
  const artificial = new Set(); // indexes of calls that say nothing about the suit named
  let placed = false;

  const lastBid = () => [...calls].reverse().find(c => isBidCall(c.call));
  const legal = call => call === 'P' || (isBidCall(call) && (!lastBid() || callRank(call) > callRank(lastBid().call)));
  const callsBy = seat => calls.filter(c => c.seat === seat).map(c => c.call);

  // The next North-South player sets the final contract (or passes when it's already right).
  function place(seat) {
    placed = true;
    const last = lastBid();
    const lastArtificial = last && artificial.has(calls.indexOf(last));
    const pts = hcp(hands[0]) + hcp(hands[2]);
    const fitLen = target.strain === 'N' ? 0 : suitLengths(hands[0])[target.strain] + suitLengths(hands[2])[target.strain];
    const fit = fitLen ? L(` and ${fitLen} ${SUIT_NAME[target.strain]} between them`, ` ו-${fitLen} ${SUIT_NAME[target.strain]} ביחד`) : '';
    if (last && !lastArtificial && last.call[1] === target.strain && Number(last.call[0]) >= target.level) {
      return { call: 'P', why: L(`North-South have about ${pts} HCP${fit}: ${bidHtml(last.call)} is the right contract, so pass.`,
        `לצפון-דרום יש בערך ${pts} נק'${fit}: ${bidHtml(last.call)} הוא החוזה הנכון, ולכן פאס.`) };
    }
    let level = target.level;
    while (level <= 7 && !legal(level + target.strain)) level++;
    // Going past the level the points call for only makes sense to leave an artificial bid.
    if (level > 7 || (level > target.level && !lastArtificial)) {
      return { call: 'P', why: L(
        `North-South have about ${pts} HCP: bidding higher would be too ambitious, so pass and play ${bidHtml(last.call)}.`,
        `לצפון-דרום יש בערך ${pts} נק': להכריז גבוה יותר יהיה שאפתני מדי, ולכן פאס ומשחקים ב-${bidHtml(last.call)}.`) };
    }
    const bid = level + target.strain;
    return { call: bid, why: L(`North-South have about ${pts} HCP${fit}, so ${SEAT_NAMES[seat]} places the contract: ${bidHtml(bid)}.`,
      `לצפון-דרום יש בערך ${pts} נק'${fit}, ולכן ${SEAT_NAMES[seat]} קובע את החוזה: ${bidHtml(bid)}.`) };
  }

  // A rule's answer if it's legal here, otherwise the contract is placed instead.
  const use = (seat, r, isArtificial) => {
    if (!r || !legal(r.bid)) return place(seat);
    if (isArtificial) artificial.add(calls.length);
    return { call: r.bid, why: r.why };
  };

  function northSouth(seat) {
    if (placed) return { call: 'P', why: '' };
    const hand = hands[seat];
    const len = suitLengths(hand);
    const mine = callsBy(seat), partner = callsBy((seat + 2) % 4);
    const open = callsBy(DEALER)[0];
    const openSuit = /^1[CDHS]$/.test(open ?? '') ? open[1] : null;

    if (seat === DEALER && !mine.length) { // South opens
      const r = openingBid(hand);
      return use(seat, r, r.bid === '2C');
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
    if (seat === DEALER && mine.length === 2 && transfer && partner.length === 2) {
      const r = transferReply(hand, transfer, partner[1]);
      if (r) { placed = true; return r; } // that settles the contract
    }
    if (seat === 0 && mine.length === 1 && openSuit) { // North's second call
      return use(seat, responderRebid(hand, openSuit, mine[0], partner[1]), false);
    }
    return place(seat);
  }

  for (let i = 0; i < 40; i++) {
    const seat = (DEALER + i) % 4;
    const { call, why } = seat % 2 ? { call: 'P', why: '' } : northSouth(seat);
    if (!calls.length && call === 'P') return null; // South has no opening bid
    calls.push({ seat, call, why });
    if (lastBid() && calls.slice(-3).every(c => c.call === 'P') && calls.length >= 4) break;
  }

  const final = lastBid();
  if (!final) return null;
  const strain = final.call[1];
  const side = final.seat % 2;
  const declarer = calls.find(c => isBidCall(c.call) && c.call[1] === strain && c.seat % 2 === side && !artificial.has(calls.indexOf(c)))?.seat;
  if (declarer !== 2) return null;
  return { calls, contract: { level: Number(final.call[0]), strain }, declarer, dealer: DEALER };
}
