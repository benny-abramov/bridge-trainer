// The auction for Play a Hand. South deals and North-South bid with the app's own SAYC rules (the
// same functions the bidding drills use): South's opening, North's response, South's rebid and
// North's second bid, including Stayman, Jacoby transfers, Jacoby 2NT and the 2♣ opening. Where
// those rules stop, the next North-South player places the final contract from the partnership's
// combined strength and fit. West can overcall South's 1-of-a-suit opening with the Overcalls
// drill's rules (js/overcalls.js), East answers West, and North competes with a negative double,
// a raise or a pass.

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
// With anyDeclarer, an auction won by another seat is returned too.
function bidAuction(hands, { anyDeclarer = false } = {}) {
  const DEALER = 2;
  const calls = [];
  const target = chooseContract(hands[0], hands[2]);
  const artificial = new Set(); // indexes of calls that say nothing about the suit named
  let placed = false;

  const lastBid = () => [...calls].reverse().find(c => isBidCall(c.call));
  const lastCall = () => [...calls].reverse().find(c => c.call !== 'P');
  const legal = call => call === 'P'
    || (call === 'X' && !!lastCall() && isBidCall(lastCall().call) && lastCall().seat % 2 !== (DEALER + calls.length) % 2) // double an opponent's bid
    || (isBidCall(call) && (!lastBid() || callRank(call) > callRank(lastBid().call)));
  const callsBy = seat => calls.filter(c => c.seat === seat).map(c => c.call);

  // The next North-South player sets the final contract (or passes when it's already right).
  function place(seat) {
    placed = true;
    const last = lastBid();
    const lastArtificial = last && artificial.has(calls.indexOf(last));
    const pts = hcp(hands[0]) + hcp(hands[2]);
    const fitLen = target.strain === 'N' ? 0 : suitLengths(hands[0])[target.strain] + suitLengths(hands[2])[target.strain];
    const fit = fitLen ? L(` and ${fitLen} ${SUIT_NAME[target.strain]} between them`, ` ו-${fitLen} ${SUIT_NAME[target.strain]} ביחד`) : '';
    if (last && last.seat % 2 === 0 && !lastArtificial && last.call[1] === target.strain && Number(last.call[0]) >= target.level) {
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
    if (pts >= 11) return place(0);
    return pass(L(`${count}. After West's ${overHtml} there's no good bid: no fit for partner, no suit to show cheaply and no stopper for no-trump. Pass for now.`,
      `${count}. אחרי ה-${overHtml} של מערב אין הכרזה טובה: אין התאמה לשותף, אין סדרה להראות בזול ואין עוצר לללא שליט. פאס בינתיים.`));
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
    const west = calls[1] && calls[1].seat === 3 ? calls[1].call : 'P';
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
