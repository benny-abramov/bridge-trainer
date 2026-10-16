// Practice drills: counting high-card points, and the bidding drills (opening, responding, rebids).

const bh = bidHtml;

function makeStats() {
  return { right: 0, total: 0, streak: 0 };
}

function statsText(stats) {
  if (!stats.total) return L('No answers yet', 'עדיין אין תשובות');
  const pct = Math.round((stats.right / stats.total) * 100);
  return L(`${stats.right}/${stats.total} correct (${pct}%) · streak ${stats.streak}`,
    `${stats.right}/${stats.total} נכונות (${pct}%) · רצף ${stats.streak}`);
}

function record(stats, correct) {
  stats.total++;
  if (correct) { stats.right++; stats.streak++; } else stats.streak = 0;
}

const hcpText = n => L(`${n} HCP`, `${n} נק'`);

const HcpTrainer = (() => {
  const stats = makeStats();
  let hand, answered, item = null, practiceIndex = 0;
  const $ = id => document.getElementById(id);

  function next() {
    const list = practiceHands('points');
    const context = $('hcp-context');
    if (list.length) {
      const i = practiceIndex++ % list.length;
      item = list[i];
      hand = parseHand(item.hand);
      context.innerHTML = practiceCounter(i + 1, list.length) + (item.note ? `<div>${practiceText(item.note)}</div>` : '');
    } else {
      item = null;
      hand = dealHands()[0];
      context.innerHTML = '';
    }
    context.hidden = !item;
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
    if (!honors.length) return L('No honors at all — 0 HCP.', 'אין הונורים בכלל: 0 נק\'.');
    return honors.map(c => `${cardHtml(c)} <b>${HCP_VALUES[c.rank]}</b>`).join(' + ') + ` = <b>${hcp(hand)}</b>`;
  }

  function check() {
    if (answered) return next();
    const raw = $('hcp-input').value.trim();
    if (raw === '' || isNaN(Number(raw))) {
      $('hcp-feedback').className = 'feedback';
      $('hcp-feedback').textContent = L('Type a number first.', 'הקלידו קודם מספר.');
      return;
    }
    const expected = item && item.points != null ? item.points : hcp(hand);
    const correct = Number(raw) === expected;
    record(stats, correct);
    answered = true;
    $('hcp-input').disabled = true;
    const bal = isBalanced(hand);
    $('hcp-feedback').className = 'feedback ' + (correct ? 'good' : 'bad');
    $('hcp-feedback').innerHTML =
      `<strong>${correct ? L('Correct!', 'נכון!') : L(`Not quite — it's ${expected}.`, `לא בדיוק: התשובה היא ${expected}.`)}</strong>` +
      (item && item.why ? `<div>${practiceText(item.why)}</div>` : '') +
      `<div class="breakdown" dir="ltr">${breakdown()}</div>` +
      `<div class="small">${L(`This hand is <b>${bal ? 'balanced' : 'unbalanced'}</b>.`, `היד הזו <b>${bal ? 'מאוזנת' : 'לא מאוזנת'}</b>.`)}</div>`;
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
    return { bid: '2C', why: L(
      `${pts} HCP is 22 or more, so open ${bh('2C')}: the strong, artificial opening. It says nothing about clubs. It tells partner you have a very big hand.`,
      `${pts} נק' הן 22 ומעלה, ולכן פתחו ${bh('2C')}: הפתיחה החזקה והמלאכותית. היא לא אומרת דבר על תלתנים, אלא מספרת לשותף שיש לכם יד גדולה מאוד.`) };
  }
  if (bal && pts >= 20 && pts <= 21) {
    return { bid: '2N', why: L(`Balanced with ${pts} HCP (20–21): open 2NT.`, `יד מאוזנת עם ${pts} נק' (20-21): פתחו 2NT.`) };
  }
  if (bal && pts >= 15 && pts <= 17) {
    return { bid: '1N', why: L(
      `Balanced with ${pts} HCP (15–17): open 1NT. It describes your hand in a single bid.`,
      `יד מאוזנת עם ${pts} נק' (15-17): פתחו 1NT. ההכרזה מתארת את היד שלכם בהכרזה אחת.`) };
  }

  if (pts >= 12 || (pts >= 10 && ruleOf20 >= 20)) {
    const reason = pts >= 12
      ? L(`${pts} HCP is enough to open`, `${pts} נק' מספיקות לפתיחה`)
      : L(`${pts} HCP plus your two longest suits (${first} + ${second}) makes ${ruleOf20}, so the Rule of 20 says open`,
        `${pts} נק' ועוד אורך שתי הסדרות הארוכות (${first} + ${second}) הם ${ruleOf20}, ולכן לפי חוק ה-20 פותחים`);
    let note = '';
    if (bal && pts >= 18 && pts <= 19) {
      note = L(' (18–19 balanced is too strong for 1NT: open a suit and jump in no-trump later.)',
        ' (18-19 מאוזנת חזקה מדי ל-1NT: פתחו בסדרה וקפצו בללא שליט בהמשך.)');
    } else if (bal && pts <= 14) {
      note = L(' (12–14 balanced is too weak for 1NT: open a suit and rebid 1NT.)',
        ' (12-14 מאוזנת חלשה מדי ל-1NT: פתחו בסדרה והכריזו 1NT בסיבוב הבא.)');
    }

    if (len.S >= 5 || len.H >= 5) {
      const suit = len.S >= len.H ? 'S' : 'H';
      let which = '';
      if (len.S >= 5 && len.H >= 5) {
        which = len.S === len.H
          ? L(' With two equal majors, bid spades first.', ' עם שתי סדרות עליונות שוות, הכריזו קודם עלים.')
          : L(' With two 5+ card majors, bid the longer.', ' עם שתי סדרות עליונות של 5 ומעלה, הכריזו את הארוכה.');
      }
      return { bid: '1' + suit, why: L(
        `${reason}. With a ${len[suit]}-card major, open ${bh('1' + suit)}.${which}${note}`,
        `${reason}. עם סדרה עליונה של ${len[suit]} קלפים, פתחו ${bh('1' + suit)}.${which}${note}`) };
    }
    let minor, how;
    if (len.D > len.C) { minor = 'D'; how = L('diamonds are your longer minor', 'היהלומים הם הסדרה התחתונה הארוכה שלכם'); }
    else if (len.C > len.D) { minor = 'C'; how = L('clubs are your longer minor', 'התלתנים הם הסדרה התחתונה הארוכה שלכם'); }
    else if (len.C === 3) { minor = 'C'; how = L(`with 3-3 in the minors, open ${bh('1C')}`, `עם 3-3 בתחתונות, פתחו ${bh('1C')}`); }
    else { minor = 'D'; how = L(`with ${len.C}-${len.D} in the minors, open ${bh('1D')}`, `עם ${len.C}-${len.D} בתחתונות, פתחו ${bh('1D')}`); }
    return { bid: '1' + minor, why: L(
      `${reason}. No 5-card major, so open a minor: ${how}.${note}`,
      `${reason}. אין סדרה עליונה של 5, ולכן פתחו בסדרה תחתונה: ${how}.${note}`) };
  }

  if (pts >= 5 && pts <= 10) {
    const seven = SUITS.find(s => len[s] >= 7);
    if (seven) {
      return { bid: '3' + seven, why: L(
        `${pts} HCP with a ${len[seven]}-card ${SUIT_NAME[seven]} suit: make a 3-level preempt (${bh('3' + seven)}) to crowd the opponents' bidding.`,
        `${pts} נק' עם סדרה של ${len[seven]} קלפים ב${SUIT_NAME[seven]}: הכריזו חסימה ברמת 3 (${bh('3' + seven)}) כדי להקשות על היריבים להכריז.`) };
    }
    const six = ['S', 'H', 'D'].find(s => len[s] === 6);
    if (six) {
      return { bid: '2' + six, why: L(
        `${pts} HCP with a 6-card ${SUIT_NAME[six]} suit: open a weak two (${bh('2' + six)}). It shows a long suit in a hand too weak to open at the 1-level.`,
        `${pts} נק' עם סדרה של 6 קלפים ב${SUIT_NAME[six]}: פתחו "שתיים חלשה" (${bh('2' + six)}). היא מראה סדרה ארוכה ביד חלשה מכדי לפתוח ברמת 1.`) };
    }
    if (len.C === 6) {
      return { bid: 'P', why: L(
        `${pts} HCP is too weak to open at the 1-level. Your 6 clubs can't be shown with a weak ${bh('2C')}, which is reserved for strong hands, so pass.`,
        `${pts} נק' חלשות מכדי לפתוח ברמת 1. את 6 התלתנים אי אפשר להראות ב-${bh('2C')} חלשה, כי הכרזה זו שמורה לידיים חזקות, ולכן פאס.`) };
    }
  }
  return { bid: 'P', why: L(
    `${pts} HCP is not enough to open, and you have no long suit for a preempt. Pass.`,
    `${pts} נק' לא מספיקות לפתיחה, ואין לכם סדרה ארוכה להכרזת חסימה. פאס.`) };
}

// Simplified Standard American responses to partner's 1-of-a-suit opening, for hands of 0–12 HCP.
// `open` is the opening suit. Returns { bid, why }.
function responseBid(hand, open) {
  const pts = hcp(hand);
  const len = suitLengths(hand);
  const isMajor = open === 'H' || open === 'S';

  if (pts < 6) {
    return { bid: 'P', why: L(
      `${pts} HCP: with fewer than 6, pass. Even if partner has a good hand, game is unlikely.`,
      `${pts} נק': עם פחות מ-6, פאס. גם אם לשותף יש יד טובה, משחק מלא לא סביר.`) };
  }

  // 1. Support partner's major.
  if (isMajor && len[open] >= 3) {
    if (pts <= 10) {
      return { bid: '2' + open, why: L(
        `${pts} HCP and ${len[open]}-card support for partner's major: raise to ${bh('2' + open)}. Showing an 8-card major fit comes first.`,
        `${pts} נק' ותמיכה של ${len[open]} קלפים בסדרה העליונה של השותף: הגביהו ל-${bh('2' + open)}. הצגת התאמה של 8 קלפים בסדרה עליונה קודמת לכל.`) };
    }
    return { bid: '3' + open, why: L(
      `${pts} HCP and ${len[open]}-card support: jump to ${bh('3' + open)}, a <em>limit raise</em>. It invites partner to bid game with a little extra.`,
      `${pts} נק' ותמיכה של ${len[open]} קלפים: קפצו ל-${bh('3' + open)}, <em>הגבהה מגבילה</em>. היא מזמינה את השותף להכריז משחק מלא אם יש לו מעט יותר.`) };
  }

  // 2. Show a new 4+ card suit at the 1-level, looking for a major fit first.
  if (open === 'C' || open === 'D') {
    if (len.H >= 4 || len.S >= 4) {
      const suit = len.S > len.H ? 'S' : len.H > len.S ? 'H' : len.S >= 5 ? 'S' : 'H';
      let tie = '';
      if (len.H === len.S) {
        tie = len.S >= 5
          ? L(' With two 5-card majors, bid spades first.', ' עם שתי סדרות עליונות של 5, הכריזו קודם עלים.')
          : L(' With four cards in both majors, bid hearts first (up the line).', ' עם ארבעה קלפים בשתי העליונות, הכריזו קודם לבבות (מלמטה למעלה).');
      }
      return { bid: '1' + suit, why: L(
        `${pts} HCP and ${len[suit]} ${SUIT_NAME[suit]}: bid ${bh('1' + suit)}. A new suit at the 1-level shows 4+ cards and 6+ HCP, and looking for a major fit comes before raising a minor.${tie}`,
        `${pts} נק' ו-${len[suit]} ${SUIT_NAME[suit]}: הכריזו ${bh('1' + suit)}. סדרה חדשה ברמת 1 מראה 4 קלפים ומעלה ו-6 נק' ומעלה, וחיפוש התאמה בסדרה עליונה קודם להגבהת סדרה תחתונה.${tie}`) };
    }
    if (open === 'C' && len.D >= 4) {
      return { bid: '1D', why: L(
        `${pts} HCP and ${len.D} diamonds, no 4-card major: bid ${bh('1D')}. A new suit at the 1-level shows 4+ cards and asks partner to bid again.`,
        `${pts} נק' ו-${len.D} יהלומים, בלי סדרה עליונה של 4: הכריזו ${bh('1D')}. סדרה חדשה ברמת 1 מראה 4 קלפים ומעלה ומבקשת מהשותף להכריז שוב.`) };
    }
  }
  if (open === 'H' && len.S >= 4) {
    return { bid: '1S', why: L(
      `${pts} HCP, fewer than 3 hearts, but ${len.S} spades: bid ${bh('1S')}. A new suit at the 1-level shows 4+ cards and 6+ HCP.`,
      `${pts} נק', פחות מ-3 לבבות, אבל ${len.S} עלים: הכריזו ${bh('1S')}. סדרה חדשה ברמת 1 מראה 4 קלפים ומעלה ו-6 נק' ומעלה.`) };
  }

  // 3. Raise partner's minor (4+ diamonds or 5+ clubs, since a minor opening can be short).
  if ((open === 'D' && len.D >= 4) || (open === 'C' && len.C >= 5)) {
    if (pts <= 10) {
      return { bid: '2' + open, why: L(
        `${pts} HCP, no 4-card major and ${len[open]}-card support: raise to ${bh('2' + open)}.`,
        `${pts} נק', בלי סדרה עליונה של 4, ותמיכה של ${len[open]} קלפים: הגביהו ל-${bh('2' + open)}.`) };
    }
    return { bid: '3' + open, why: L(
      `${pts} HCP, no 4-card major and ${len[open]}-card support: jump to ${bh('3' + open)}, a limit raise inviting game.`,
      `${pts} נק', בלי סדרה עליונה של 4, ותמיכה של ${len[open]} קלפים: קפצו ל-${bh('3' + open)}, הגבהה מגבילה שמזמינה למשחק מלא.`) };
  }

  // 4. Weak hand with nothing else to say.
  if (pts <= 10) {
    return { bid: '1N', why: L(
      `${pts} HCP with no fit and no new suit to show at the 1-level: respond 1NT (6–10 HCP).`,
      `${pts} נק' בלי התאמה ובלי סדרה חדשה להראות ברמת 1: השיבו 1NT (6-10 נק').`) };
  }

  // 5. 11–12 HCP: a new suit at the 2-level, or 2NT.
  const twoLevel = SUITS
    .filter(s => SUITS.indexOf(s) > SUITS.indexOf(open) && len[s] >= (s === 'H' ? 5 : 4))
    .sort((a, b) => len[b] - len[a] || SUITS.indexOf(b) - SUITS.indexOf(a));
  if (twoLevel.length) {
    const s = twoLevel[0];
    return { bid: '2' + s, why: L(
      `${pts} HCP with no fit for partner and ${len[s]} ${SUIT_NAME[s]}: bid ${bh('2' + s)}. A new suit at the 2-level needs 11+ HCP${s === 'H' ? ' (and 5 hearts)' : ''}.`,
      `${pts} נק' בלי התאמה לשותף ו-${len[s]} ${SUIT_NAME[s]}: הכריזו ${bh('2' + s)}. סדרה חדשה ברמת 2 דורשת 11 נק' ומעלה${s === 'H' ? ' (וחמישה לבבות)' : ''}.`) };
  }
  return { bid: '2N', why: L(
    `${pts} HCP with no fit and no suit to show: bid 2NT, inviting game (11–12 HCP).`,
    `${pts} נק' בלי התאמה ובלי סדרה להראות: הכריזו 2NT, הזמנה למשחק מלא (11-12 נק').`) };
}

// Opener's rebid after partner raises, makes a 1-level new-suit response, or responds 1NT.
// `open` is the opening suit and `resp` partner's response ('2H', '1S', '1N', ...). Returns { bid, why }.
const STRENGTH_TEXT = L(
  { min: 'a minimum hand (12–14)', med: 'a medium hand (15–17)', max: 'a maximum hand (18–21)' },
  { min: 'יד מינימום (12-14)', med: 'יד בינונית (15-17)', max: 'יד מקסימום (18-21)' });

function rebidBid(hand, open, resp) {
  const pts = hcp(hand);
  const len = suitLengths(hand);
  const str = pts >= 18 ? 'max' : pts >= 15 ? 'med' : 'min';
  const you = L(`${pts} HCP is ${STRENGTH_TEXT[str]}`, `${pts} נק' הן ${STRENGTH_TEXT[str]}`);
  const [rLevel, rSuit] = [Number(resp[0]), resp[1]];
  const isMajor = open === 'H' || open === 'S';
  const rank = s => SUITS.indexOf(s); // lower index = higher-ranking suit
  const game = isMajor ? '4' + open : '3N';
  const minorGame = isMajor ? '' : L(
    ' With a minor-suit fit, 3NT (9 tricks) is usually easier than 5 of a minor (11 tricks).',
    ' עם התאמה בסדרה תחתונה, 3NT (9 לקיחות) בדרך כלל קל יותר מ-5 בתחתונה (11 לקיחות).');

  // Partner raised your suit.
  if (rSuit === open) {
    if (rLevel === 2) {
      if (str === 'min') return { bid: 'P', why: L(
        `${you}. Partner's raise shows 6–10 HCP, so you can't reach the 25 HCP needed for game. Pass.`,
        `${you}. ההגבהה של השותף מראה 6-10 נק', כך שאי אפשר להגיע ל-25 הנקודות הדרושות למשחק מלא. פאס.`) };
      if (str === 'med') return { bid: '3' + open, why: L(
        `${you}. Game is possible if partner is at the top of their 6–10 range, so invite with ${bh('3' + open)}.`,
        `${you}. משחק מלא אפשרי אם השותף בראש הטווח שלו (6-10), ולכן הזמינו ב-${bh('3' + open)}.`) };
      return { bid: game, why: L(
        `${you}. Even opposite 6 HCP you have enough for game: bid ${bh(game)}.${minorGame}`,
        `${you}. גם מול 6 נק' יש לכם מספיק למשחק מלא: הכריזו ${bh(game)}.${minorGame}`) };
    }
    if (str === 'min') return { bid: 'P', why: L(
      `${you}. Partner's limit raise invites game. With a minimum, decline by passing.`,
      `${you}. ההגבהה המגבילה של השותף מזמינה למשחק מלא. עם מינימום, דחו את ההזמנה בפאס.`) };
    return { bid: game, why: L(
      `${you}. That's more than a minimum, so accept partner's invitation and bid game: ${bh(game)}.${minorGame}`,
      `${you}. זה יותר ממינימום, ולכן קבלו את ההזמנה של השותף והכריזו משחק מלא: ${bh(game)}.${minorGame}`) };
  }

  const balanced = isBalanced(hand);
  if (rLevel === 1 && rSuit !== 'N') {
    // 1. Raise partner's major with 4-card support.
    if ((rSuit === 'H' || rSuit === 'S') && len[rSuit] >= 4) {
      const level = { min: '2', med: '3', max: '4' }[str];
      const how = L(
        { min: 'raise to 2', med: 'jump to 3 to invite game', max: 'bid game at the 4-level' },
        { min: 'הגביהו ל-2', med: 'קפצו ל-3 כהזמנה למשחק מלא', max: 'הכריזו משחק מלא ברמת 4' })[str];
      return { bid: level + rSuit, why: L(
        `${you} with ${len[rSuit]}-card support for partner's ${SUIT_NAME[rSuit]}. You've found an 8-card major fit: ${how} (${bh(level + rSuit)}).`,
        `${you}, עם תמיכה של ${len[rSuit]} קלפים ב${SUIT_NAME[rSuit]} של השותף. מצאתם התאמה של 8 קלפים בסדרה עליונה: ${how} (${bh(level + rSuit)}).`) };
    }
    // 2. Show a 4-card major that can still be bid at the 1-level.
    const major = ['H', 'S'].find(z => z !== open && rank(z) < rank(rSuit) && len[z] >= 4);
    if (major) {
      return { bid: '1' + major, why: L(
        `You have 4 ${SUIT_NAME[major]} and can show them at the 1-level: bid ${bh('1' + major)}. Partner may have four too, and an 8-card major fit is worth looking for before no-trump.`,
        `יש לכם 4 ${SUIT_NAME[major]}, ואפשר להראות אותם ברמת 1: הכריזו ${bh('1' + major)}. ייתכן שגם לשותף יש ארבעה, ושווה לחפש התאמה בסדרה עליונה לפני ללא שליט.`) };
    }
    // 3. Raise partner's 1♦ response with 4-card support.
    if (rSuit === 'D' && len.D >= 4) {
      const bid = str === 'min' ? '2D' : '3D';
      return { bid, why: L(
        `${you} with ${len.D}-card diamond support and no major to show: raise to ${bh(bid)}.`,
        `${you}, עם תמיכה של ${len.D} קלפים ביהלומים ובלי סדרה עליונה להראות: הגביהו ל-${bh(bid)}.`) };
    }
    // 4. Balanced hands bid no-trump.
    if (balanced) {
      if (str === 'min') return { bid: '1N', why: L(
        `${you} and balanced, with no fit and no major to show: rebid 1NT (12–14 balanced).`,
        `${you} ומאוזנת, בלי התאמה ובלי סדרה עליונה להראות: הכריזו 1NT (12-14 מאוזנת).`) };
      return { bid: '2N', why: L(
        `${you} and balanced: jump to 2NT to show 18–19. (With 15–17 balanced you would have opened 1NT.)`,
        `${you} ומאוזנת: קפצו ל-2NT כדי להראות 18-19. (עם 15-17 מאוזנת הייתם פותחים 1NT.)`) };
    }
  } else if (balanced) {
    // Partner responded 1NT (6–10).
    if (str === 'min') return { bid: 'P', why: L(
      `${you} and balanced. Opposite partner's 6–10, game is unlikely and 1NT is a fine spot: pass.`,
      `${you} ומאוזנת. מול 6-10 של השותף, משחק מלא לא סביר ו-1NT הוא חוזה טוב: פאס.`) };
    return { bid: '2N', why: L(
      `${you} and balanced: raise to 2NT, inviting partner to bid 3NT with the top of their 6–10 range.`,
      `${you} ומאוזנת: הגביהו ל-2NT, כדי להזמין את השותף ל-3NT אם הוא בראש הטווח שלו (6-10).`) };
  }

  // Unbalanced hands: rebid a 6-card suit, or show a second suit.
  if (len[open] >= 6) {
    if (str === 'min') return { bid: '2' + open, why: L(
      `${you} with ${len[open]} ${SUIT_NAME[open]}: rebid your suit at the cheapest level, ${bh('2' + open)}. Rebidding a suit shows 6+ cards.`,
      `${you}, עם ${len[open]} ${SUIT_NAME[open]}: חזרו על הסדרה שלכם ברמה הזולה ביותר, ${bh('2' + open)}. חזרה על סדרה מראה 6 קלפים ומעלה.`) };
    return { bid: '3' + open, why: L(
      `${you} with ${len[open]} ${SUIT_NAME[open]}: jump to ${bh('3' + open)} to show a good 6-card suit and extra strength.`,
      `${you}, עם ${len[open]} ${SUIT_NAME[open]}: קפצו ל-${bh('3' + open)} כדי להראות סדרה טובה של 6 קלפים וכוח נוסף.`) };
  }
  const seconds = SUITS.filter(z => z !== open && z !== rSuit && len[z] >= 4)
    .sort((a, b) => len[b] - len[a] || rank(b) - rank(a));
  const lower = seconds.find(z => rank(z) > rank(open));
  if (lower) {
    if (str === 'max') return { bid: '3' + lower, why: L(
      `${you} with a second suit of ${len[lower]} ${SUIT_NAME[lower]}: make a <em>jump shift</em> to ${bh('3' + lower)}. Jumping in a new suit shows 18+ HCP and forces to game.`,
      `${you}, עם סדרה שנייה של ${len[lower]} ${SUIT_NAME[lower]}: הכריזו <em>קפיצה בסדרה חדשה</em> ל-${bh('3' + lower)}. קפיצה בסדרה חדשה מראה 18 נק' ומעלה ומחייבת עד משחק מלא.`) };
    return { bid: '2' + lower, why: L(
      `${you} with a second suit of ${len[lower]} ${SUIT_NAME[lower]}: bid ${bh('2' + lower)}. A lower-ranking new suit at the 2-level can be bid with any strength up to 17.`,
      `${you}, עם סדרה שנייה של ${len[lower]} ${SUIT_NAME[lower]}: הכריזו ${bh('2' + lower)}. אפשר להכריז סדרה חדשה נמוכה יותר ברמת 2 עם כל כוח עד 17.`) };
  }
  const higher = seconds.find(z => rank(z) < rank(open));
  if (higher && pts >= 16) {
    return { bid: '2' + higher, why: L(
      `${you} with ${len[higher]} ${SUIT_NAME[higher]}: bid ${bh('2' + higher)}. Bidding a higher-ranking suit than your first at the 2-level is a <em>reverse</em>; it shows 16+ HCP because partner may have to go to the 3-level to choose between your suits.`,
      `${you}, עם ${len[higher]} ${SUIT_NAME[higher]}: הכריזו ${bh('2' + higher)}. הכרזה ברמת 2 של סדרה גבוהה מהסדרה הראשונה שלכם נקראת <em>ריברס</em>. היא מראה 16 נק' ומעלה, כי ייתכן שהשותף יצטרך לעלות לרמת 3 כדי לבחור בין הסדרות שלכם.`) };
  }
  const why = higher
    ? L(`${you}. Showing your ${SUIT_NAME[higher]} at the 2-level would be a <em>reverse</em>, which needs 16+ HCP. So rebid your ${SUIT_NAME[open]} at the cheapest level, ${bh('2' + open)}.`,
      `${you}. הצגת ה${SUIT_NAME[higher]} ברמת 2 תהיה <em>ריברס</em>, שדורש 16 נק' ומעלה. לכן חזרו על ה${SUIT_NAME[open]} שלכם ברמה הזולה ביותר, ${bh('2' + open)}.`)
    : L(`${you} with no fit, no second suit and an unbalanced hand: rebid your ${SUIT_NAME[open]} at the cheapest level, ${bh('2' + open)}.`,
      `${you}, בלי התאמה, בלי סדרה שנייה וביד לא מאוזנת: חזרו על ה${SUIT_NAME[open]} שלכם ברמה הזולה ביותר, ${bh('2' + open)}.`);
  return { bid: '2' + open, why };
}

function responseMeaning(resp, open) {
  if (resp === '1N') return L('6–10 HCP, no fit and no 4-card suit to show at the 1-level', '6-10 נק\', בלי התאמה ובלי סדרה של 4 קלפים להראות ברמת 1');
  if (resp[1] === open) {
    return resp[0] === '2'
      ? L('6–10 HCP and support for your suit', '6-10 נק\' ותמיכה בסדרה שלכם')
      : L('11–12 HCP and support: a <em>limit raise</em>, inviting game', '11-12 נק\' ותמיכה: <em>הגבהה מגבילה</em>, הזמנה למשחק מלא');
  }
  return L(`4+ ${SUIT_NAME[resp[1]]} and 6+ HCP. A new suit is forcing: you must bid again`,
    `4 ${SUIT_NAME[resp[1]]} ומעלה ו-6 נק' ומעלה. סדרה חדשה מחייבת: אתם חייבים להכריז שוב`);
}

// Responder's second bid. Partner opened `open`, you responded `resp`, partner rebid `rebid`.
// Covers auctions after a simple raise, a 1-level new suit or 1NT; returns null for anything else.
function responderRebid(hand, open, resp, rebid) {
  const pts = hcp(hand);
  const len = suitLengths(hand);
  const isMajor = s => s === 'H' || s === 'S';
  const rank = s => SUITS.indexOf(s); // lower index = higher-ranking suit
  const game = s => (isMajor(s) ? '4' + s : '3N');
  const minorNote = s => (isMajor(s) ? '' : L(
    ' With a minor-suit fit, 3NT is usually easier than 5 of a minor.',
    ' עם התאמה בסדרה תחתונה, 3NT בדרך כלל קל יותר מ-5 בתחתונה.'));
  const [rl, rz] = [Number(rebid[0]), rebid[1]];
  const name = s => SUIT_NAME[s];
  const accept = pts >= 9;
  const acceptWhy = s => (accept
    ? { bid: game(s), why: L(
      `You have ${pts} HCP, the top of your 6–10 range. Accept partner's invitation: bid ${bh(game(s))}.${minorNote(s)}`,
      `יש לכם ${pts} נק', ראש הטווח שלכם (6-10). קבלו את ההזמנה של השותף: הכריזו ${bh(game(s))}.${minorNote(s)}`) }
    : { bid: 'P', why: L(
      `You have ${pts} HCP, the bottom of your 6–10 range. Decline partner's invitation by passing.`,
      `יש לכם ${pts} נק', תחתית הטווח שלכם (6-10). דחו את ההזמנה של השותף בפאס.`) });

  if (rebid === 'P') return null;

  // You raised partner's suit and partner invited game.
  if (resp === '2' + open) {
    return rebid === '3' + open ? acceptWhy(open) : null;
  }

  // You responded 1NT (6–10).
  if (resp === '1N') {
    if (rebid === '2N') {
      return accept
        ? { bid: '3N', why: L(
          `You have ${pts} HCP, the top of your 6–10 range. Accept partner's invitation: bid 3NT.`,
          `יש לכם ${pts} נק', ראש הטווח שלכם (6-10). קבלו את ההזמנה של השותף: הכריזו 3NT.`) }
        : { bid: 'P', why: L(
          `You have ${pts} HCP, the bottom of your 6–10 range. Decline partner's invitation by passing 2NT.`,
          `יש לכם ${pts} נק', תחתית הטווח שלכם (6-10). דחו את ההזמנה של השותף: פאס על 2NT.`) };
    }
    if (rebid === '2' + open) {
      return { bid: 'P', why: L(
        `Partner's ${bh('2' + open)} shows a minimum opening with 6+ ${name(open)}. You've already described your 6–10 HCP, so there's nothing more to say: pass.`,
        `ה-${bh('2' + open)} של השותף מראה פתיחת מינימום עם 6 ${name(open)} ומעלה. כבר תיארתם את 6-10 הנקודות שלכם, ואין מה להוסיף: פאס.`) };
    }
    if (rebid === '3' + open) return acceptWhy(open);
    if (rl === 2 && rank(rz) > rank(open)) {
      return len[rz] > len[open]
        ? { bid: 'P', why: L(
          `Partner has shown ${name(open)} and ${name(rz)}. You have more ${name(rz)} (${len[rz]}) than ${name(open)} (${len[open]}), so pass and play in ${name(rz)}.`,
          `השותף הראה ${name(open)} ו${name(rz)}. יש לכם יותר ${name(rz)} (${len[rz]}) מאשר ${name(open)} (${len[open]}), ולכן פאס ושחקו ב${name(rz)}.`) }
        : { bid: '2' + open, why: L(
          `Partner has shown ${name(open)} and ${name(rz)}. With ${len[open]} ${name(open)} and ${len[rz]} ${name(rz)}, give <em>preference</em> to partner's first suit: ${bh('2' + open)}. It's usually at least five cards long. This isn't extra strength, just a choice of suit.`,
          `השותף הראה ${name(open)} ו${name(rz)}. עם ${len[open]} ${name(open)} ו-${len[rz]} ${name(rz)}, תנו <em>העדפה</em> לסדרה הראשונה של השותף: ${bh('2' + open)}. בדרך כלל יש בה לפחות חמישה קלפים. זה לא כוח נוסף, רק בחירת סדרה.`) };
    }
    return null;
  }

  // You responded a new suit at the 1-level (6–12 HCP).
  if (resp[0] !== '1') return null;
  const you = resp[1];
  const inv = pts >= 11;
  const strength = inv
    ? L(`You have ${pts} HCP, enough to invite game (11–12)`, `יש לכם ${pts} נק', מספיק כדי להזמין למשחק מלא (11-12)`)
    : L(`You have ${pts} HCP, a minimum response (6–10)`, `יש לכם ${pts} נק', תשובת מינימום (6-10)`);

  // Partner raised your suit.
  if (rz === you) {
    if (rl === 2) {
      return inv
        ? { bid: '3' + you, why: L(
          `${strength}. Partner's raise shows 12–14, so game is possible: invite with ${bh('3' + you)}.`,
          `${strength}. ההגבהה של השותף מראה 12-14, ולכן משחק מלא אפשרי: הזמינו ב-${bh('3' + you)}.`) }
        : { bid: 'P', why: L(
          `${strength}. Partner's raise shows a minimum opening (12–14), so game is out of reach: pass.`,
          `${strength}. ההגבהה של השותף מראה פתיחת מינימום (12-14), ולכן משחק מלא לא בהישג יד: פאס.`) };
    }
    if (rl === 3) {
      return pts >= 9
        ? { bid: game(you), why: L(
          `You have ${pts} HCP. Partner's jump raise shows 15–17 and invites game, and you have enough to accept: bid ${bh(game(you))}.${minorNote(you)}`,
          `יש לכם ${pts} נק'. הקפיצה של השותף מראה 15-17 ומזמינה למשחק מלא, ויש לכם מספיק כדי לקבל: הכריזו ${bh(game(you))}.${minorNote(you)}`) }
        : { bid: 'P', why: L(
          `You have ${pts} HCP. Partner's jump raise invites game, but with a bare minimum you decline by passing.`,
          `יש לכם ${pts} נק'. הקפיצה של השותף מזמינה למשחק מלא, אבל עם מינימום חשוף דחו את ההזמנה בפאס.`) };
    }
    return { bid: 'P', why: L('Partner has bid game. With no interest in slam, pass.', 'השותף הכריז משחק מלא. בלי עניין בסלאם, פאס.') };
  }

  if (rebid === '1N') {
    if (len[you] >= 6) {
      return inv
        ? { bid: '3' + you, why: L(
          `${strength} and ${len[you]} ${name(you)}: jump to ${bh('3' + you)} to invite game with a long suit.`,
          `${strength}, ו-${len[you]} ${name(you)}: קפצו ל-${bh('3' + you)} כדי להזמין למשחק מלא עם סדרה ארוכה.`) }
        : { bid: '2' + you, why: L(
          `${strength} and ${len[you]} ${name(you)}: rebid ${bh('2' + you)}. Repeating your suit shows 6+ cards and asks partner to pass.`,
          `${strength}, ו-${len[you]} ${name(you)}: הכריזו ${bh('2' + you)}. חזרה על הסדרה מראה 6 קלפים ומעלה ומבקשת מהשותף לעשות פאס.`) };
    }
    return inv
      ? { bid: '2N', why: L(
        `${strength}. Partner's 1NT shows 12–14, so invite game with 2NT.`,
        `${strength}. ה-1NT של השותף מראה 12-14, ולכן הזמינו למשחק מלא ב-2NT.`) }
      : { bid: 'P', why: L(
        `${strength}. Partner's 1NT shows 12–14, so game is out of reach and 1NT is a fine spot: pass.`,
        `${strength}. ה-1NT של השותף מראה 12-14, ולכן משחק מלא לא בהישג יד ו-1NT הוא חוזה טוב: פאס.`) };
  }

  if (rebid === '2N') {
    if (isMajor(you) && len[you] >= 6) {
      return { bid: '4' + you, why: L(
        `Partner's 2NT shows 18–19, so you have enough for game. With ${len[you]} ${name(you)}, bid ${bh('4' + you)}.`,
        `ה-2NT של השותף מראה 18-19, כך שיש לכם מספיק למשחק מלא. עם ${len[you]} ${name(you)}, הכריזו ${bh('4' + you)}.`) };
    }
    return { bid: '3N', why: L(
      `Partner's 2NT shows 18–19, so even your ${pts} HCP is enough for game: bid 3NT.`,
      `ה-2NT של השותף מראה 18-19, כך שגם ${pts} הנקודות שלכם מספיקות למשחק מלא: הכריזו 3NT.`) };
  }

  // Partner showed a new major at the 1-level.
  if (rl === 1) {
    if (len[rz] >= 4) {
      return { bid: (inv ? '3' : '2') + rz, why: L(
        `${strength} and 4 ${name(rz)}: you've found an 8-card major fit. ${inv ? `Jump to ${bh('3' + rz)} to invite game.` : `Raise to ${bh('2' + rz)}.`}`,
        `${strength}, ו-4 ${name(rz)}: מצאתם התאמה של 8 קלפים בסדרה עליונה. ${inv ? `קפצו ל-${bh('3' + rz)} כדי להזמין למשחק מלא.` : `הגביהו ל-${bh('2' + rz)}.`}`) };
    }
    if (len[you] >= 6) {
      return { bid: (inv ? '3' : '2') + you, why: L(
        `${strength}, no fit for partner's ${name(rz)}, and ${len[you]} ${name(you)}: ${inv ? `jump to ${bh('3' + you)} to invite game` : `rebid ${bh('2' + you)} to show 6+ cards`}.`,
        `${strength}, בלי התאמה ל${name(rz)} של השותף, ו-${len[you]} ${name(you)}: ${inv ? `קפצו ל-${bh('3' + you)} כדי להזמין למשחק מלא` : `הכריזו ${bh('2' + you)} כדי להראות 6 קלפים ומעלה`}.`) };
    }
    return inv
      ? { bid: '2N', why: L(`${strength} and no fit for partner's suits: bid 2NT to invite game.`, `${strength}, ובלי התאמה לסדרות של השותף: הכריזו 2NT כדי להזמין למשחק מלא.`) }
      : { bid: '1N', why: L(`${strength} and no fit for partner's suits: bid 1NT.`, `${strength}, ובלי התאמה לסדרות של השותף: הכריזו 1NT.`) };
  }

  // Partner rebid their own suit.
  if (rz === open) {
    if (rl === 2) {
      if (inv) {
        if (len[open] >= 2) return { bid: '3' + open, why: L(
          `${strength} and ${len[open]} ${name(open)}. Partner has 6, so you have a fit: invite game with ${bh('3' + open)}.`,
          `${strength}, ו-${len[open]} ${name(open)}. לשותף יש 6, כך שיש התאמה: הזמינו למשחק מלא ב-${bh('3' + open)}.`) };
        if (len[you] >= 6) return { bid: '3' + you, why: L(
          `${strength}, a singleton in partner's suit and ${len[you]} ${name(you)}: jump to ${bh('3' + you)} to invite game in your long suit.`,
          `${strength}, יחידון בסדרה של השותף ו-${len[you]} ${name(you)}: קפצו ל-${bh('3' + you)} כדי להזמין למשחק מלא בסדרה הארוכה שלכם.`) };
        return { bid: '2N', why: L(
          `${strength} but a singleton in partner's suit: bid 2NT to invite game.`,
          `${strength}, אבל יחידון בסדרה של השותף: הכריזו 2NT כדי להזמין למשחק מלא.`) };
      }
      if (len[you] >= 6 && len[open] <= 1) {
        return { bid: '2' + you, why: L(
          `${strength}, a singleton in partner's suit and ${len[you]} ${name(you)}: rebid ${bh('2' + you)}. It suggests playing there and asks partner to pass.`,
          `${strength}, יחידון בסדרה של השותף ו-${len[you]} ${name(you)}: הכריזו ${bh('2' + you)}. זה מציע לשחק שם ומבקש מהשותף לעשות פאס.`) };
      }
      return { bid: 'P', why: L(
        `${strength}. Partner's ${bh('2' + open)} shows a minimum with 6+ ${name(open)}, so game is out of reach: pass.`,
        `${strength}. ה-${bh('2' + open)} של השותף מראה מינימום עם 6 ${name(open)} ומעלה, ולכן משחק מלא לא בהישג יד: פאס.`) };
    }
    if (isMajor(you) && len[you] >= 6 && len[open] <= 1 && pts >= 8) {
      return { bid: '4' + you, why: L(
        `You have ${pts} HCP and ${len[you]} ${name(you)}, but only a singleton in partner's suit. Opposite partner's 15–17, your long major is worth more than its points, so bid game in it: ${bh('4' + you)}.`,
        `יש לכם ${pts} נק' ו-${len[you]} ${name(you)}, אבל רק יחידון בסדרה של השותף. מול 15-17 של השותף, הסדרה העליונה הארוכה שלכם שווה יותר מהנקודות שלה, ולכן הכריזו בה משחק מלא: ${bh('4' + you)}.`) };
    }
    const majorGame = isMajor(open) && len[open] >= 2;
    return accept
      ? { bid: majorGame ? '4' + open : '3N', why: L(
        `You have ${pts} HCP. Partner's jump to ${bh('3' + open)} shows 15–17 with a good suit and invites game, and you have enough to accept.${majorGame ? ` With ${len[open]} ${name(open)} opposite partner's 6, bid ${bh('4' + open)}.` : ' Bid 3NT.'}`,
        `יש לכם ${pts} נק'. הקפיצה של השותף ל-${bh('3' + open)} מראה 15-17 עם סדרה טובה ומזמינה למשחק מלא, ויש לכם מספיק כדי לקבל.${majorGame ? ` עם ${len[open]} ${name(open)} מול השישה של השותף, הכריזו ${bh('4' + open)}.` : ' הכריזו 3NT.'}`) }
      : { bid: 'P', why: L(
        `You have ${pts} HCP. Partner's jump invites game, but with a bare minimum you decline by passing.`,
        `יש לכם ${pts} נק'. הקפיצה של השותף מזמינה למשחק מלא, אבל עם מינימום חשוף דחו את ההזמנה בפאס.`) };
  }

  // Jump shift: 18+ and forcing to game.
  if (rl === 3) {
    return isMajor(open) && len[open] >= 3
      ? { bid: '4' + open, why: L(
        `Partner's jump shift shows 18+ HCP and forces to game. With ${len[open]}-card support for partner's major, bid game there: ${bh('4' + open)}.`,
        `הקפיצה בסדרה חדשה של השותף מראה 18 נק' ומעלה ומחייבת עד משחק מלא. עם תמיכה של ${len[open]} קלפים בסדרה העליונה של השותף, הכריזו שם משחק מלא: ${bh('4' + open)}.`) }
      : { bid: '3N', why: L(
        `Partner's jump shift shows 18+ HCP and forces to game. With no major fit, bid game in no-trump: 3NT.`,
        `הקפיצה בסדרה חדשה של השותף מראה 18 נק' ומעלה ומחייבת עד משחק מלא. בלי התאמה בסדרה עליונה, הכריזו משחק מלא בללא שליט: 3NT.`) };
  }

  // A new, lower-ranking suit at the 2-level: not forcing, 12–17.
  if (rank(rz) > rank(open)) {
    if (inv) {
      if (len[rz] >= 4) return { bid: '3' + rz, why: L(
        `${strength} and ${len[rz]} ${name(rz)}: raise to ${bh('3' + rz)} to invite game.`,
        `${strength}, ו-${len[rz]} ${name(rz)}: הגביהו ל-${bh('3' + rz)} כדי להזמין למשחק מלא.`) };
      if (len[open] >= 3) return { bid: '3' + open, why: L(
        `${strength} and ${len[open]} ${name(open)}: jump to ${bh('3' + open)} to invite game in partner's first suit.`,
        `${strength}, ו-${len[open]} ${name(open)}: קפצו ל-${bh('3' + open)} כדי להזמין למשחק מלא בסדרה הראשונה של השותף.`) };
      return { bid: '2N', why: L(`${strength} and no clear fit: bid 2NT to invite game.`, `${strength}, ובלי התאמה ברורה: הכריזו 2NT כדי להזמין למשחק מלא.`) };
    }
    if (len[you] >= 6 && len[open] <= 2 && len[rz] <= 3) {
      return { bid: '2' + you, why: L(
        `${strength}, no fit for partner and ${len[you]} ${name(you)}: rebid ${bh('2' + you)} to show 6+ cards and ask partner to pass.`,
        `${strength}, בלי התאמה לשותף ו-${len[you]} ${name(you)}: הכריזו ${bh('2' + you)} כדי להראות 6 קלפים ומעלה ולבקש מהשותף לעשות פאס.`) };
    }
    return len[rz] > len[open]
      ? { bid: 'P', why: L(
        `${strength}. You have more ${name(rz)} (${len[rz]}) than ${name(open)} (${len[open]}), so pass and play in partner's second suit.`,
        `${strength}. יש לכם יותר ${name(rz)} (${len[rz]}) מאשר ${name(open)} (${len[open]}), ולכן פאס ושחקו בסדרה השנייה של השותף.`) }
      : { bid: '2' + open, why: L(
        `${strength}. With ${len[open]} ${name(open)} and ${len[rz]} ${name(rz)}, give <em>preference</em> to partner's first suit: ${bh('2' + open)}. It's usually longer. This shows no extra strength.`,
        `${strength}. עם ${len[open]} ${name(open)} ו-${len[rz]} ${name(rz)}, תנו <em>העדפה</em> לסדרה הראשונה של השותף: ${bh('2' + open)}. בדרך כלל היא ארוכה יותר. זה לא מראה כוח נוסף.`) };
  }

  // Reverse: 16+ and forcing for one round.
  const certain = L(`Partner's reverse shows 16+, and your ${pts} HCP makes game certain.`, `הריברס של השותף מראה 16 ומעלה, ועם ${pts} הנקודות שלכם המשחק המלא ודאי.`);
  if (inv) {
    if (isMajor(rz) && len[rz] >= 4) return { bid: '4' + rz, why: L(`${certain} With 4 ${name(rz)}, bid ${bh('4' + rz)}.`, `${certain} עם 4 ${name(rz)}, הכריזו ${bh('4' + rz)}.`) };
    if (isMajor(open) && len[open] >= 3) return { bid: '4' + open, why: L(`${certain} With ${len[open]} ${name(open)}, bid ${bh('4' + open)}.`, `${certain} עם ${len[open]} ${name(open)}, הכריזו ${bh('4' + open)}.`) };
    return { bid: '3N', why: L(`${certain} With no major fit, bid 3NT.`, `${certain} בלי התאמה בסדרה עליונה, הכריזו 3NT.`) };
  }
  if (len[you] >= 5) {
    return { bid: '2' + you, why: L(
      `${strength}. Partner's reverse is forcing, so you must bid. With ${len[you]} ${name(you)}, rebid ${bh('2' + you)}, the cheapest way to show a 5+ card suit.`,
      `${strength}. הריברס של השותף מחייב, ולכן אתם חייבים להכריז. עם ${len[you]} ${name(you)}, הכריזו ${bh('2' + you)}, הדרך הזולה ביותר להראות סדרה של 5 קלפים ומעלה.`) };
  }
  return { bid: '3' + open, why: L(
    `${strength}. Partner's reverse is forcing, so you must bid. Give simple preference to partner's first suit: ${bh('3' + open)}.`,
    `${strength}. הריברס של השותף מחייב, ולכן אתם חייבים להכריז. תנו העדפה פשוטה לסדרה הראשונה של השותף: ${bh('3' + open)}.`) };
}

function openerRebidMeaning(open, resp, rebid) {
  const [rl, rz] = [Number(rebid[0]), rebid[1]];
  const rank = s => SUITS.indexOf(s);
  if (resp === '2' + open) return L('15–17 HCP, inviting game', '15-17 נק\', הזמנה למשחק מלא');
  if (rebid === '1N') return L('12–14 HCP and a balanced hand', '12-14 נק\' ויד מאוזנת');
  if (rebid === '2N') {
    return resp === '1N'
      ? L('18–19 HCP and a balanced hand, inviting 3NT', '18-19 נק\' ויד מאוזנת, הזמנה ל-3NT')
      : L('18–19 HCP and a balanced hand', '18-19 נק\' ויד מאוזנת');
  }
  if (rz === resp[1] && resp !== '1N') {
    return L(
      ['', '', '12–14 HCP and 4-card support', '15–17 HCP and 4-card support, inviting game', '18+ HCP: game'],
      ['', '', '12-14 נק\' ותמיכה של 4 קלפים', '15-17 נק\' ותמיכה של 4 קלפים, הזמנה למשחק מלא', '18 נק\' ומעלה: משחק מלא'])[rl];
  }
  if (rz === open) {
    return rl === 2
      ? L(`12–14 HCP and 6+ ${SUIT_NAME[open]}`, `12-14 נק' ו-6 ${SUIT_NAME[open]} ומעלה`)
      : L('15–17 HCP and a good 6-card suit, inviting game', '15-17 נק\' וסדרה טובה של 6 קלפים, הזמנה למשחק מלא');
  }
  if (rl === 1) return L(`4 ${SUIT_NAME[rz]}; partner hasn't shown extra strength`, `4 ${SUIT_NAME[rz]}; השותף לא הראה כוח נוסף`);
  if (rl === 3) return L(`18+ HCP and 4+ ${SUIT_NAME[rz]}: a jump shift, forcing to game`, `18 נק' ומעלה ו-4 ${SUIT_NAME[rz]} ומעלה: קפיצה בסדרה חדשה, מחייבת עד משחק מלא`);
  if (rank(rz) > rank(open)) return L(`4+ ${SUIT_NAME[rz]} and 12–17 HCP; not forcing`, `4 ${SUIT_NAME[rz]} ומעלה ו-12-17 נק'; לא מחייבת`);
  return L(`16+ HCP with 4+ ${SUIT_NAME[rz]} and longer ${SUIT_NAME[open]}: a reverse, forcing for one round`,
    `16 נק' ומעלה, עם 4 ${SUIT_NAME[rz]} ומעלה ו${SUIT_NAME[open]} ארוכים יותר: ריברס, מחייב לסיבוב אחד`);
}

// Auction table for the bidding drills. `headers` are seat labels; cells are bids, '?' or ''.
function auctionHtml(headers, rows, note) {
  const cell = b => (b === '?' ? '<td class="ask">?</td>' : `<td>${b ? bh(b) : ''}</td>`);
  return `
    <table class="auction">
      <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
      ${rows.map(r => `<tr>${r.map(cell).join('')}</tr>`).join('')}
    </table>
    <div>${note}</div>`;
}

const SEAT = L({ you: 'You', left: 'Left', partner: 'Partner', right: 'Right' }, { you: 'אתם', left: 'משמאל', partner: 'השותף', right: 'מימין' });

// ---------- Your own practice hands ----------

// js/practice-data.js (generated from practice/*.txt by tools/import_practice.py) can hold hands for
// each drill. A drill that has some uses them, in order, instead of random deals.
const practiceHands = key => (typeof PRACTICE !== 'undefined' && PRACTICE[key]) || [];
const practiceText = t => (t ? L(t.en || t.he, t.he || t.en) : '');
const practiceCounter = (n, total) => `<div class="practice-count">${L(`Hand ${n} of ${total}`, `יד ${n} מתוך ${total}`)}</div>`;
const bidRank = bid => (Number(bid[0]) - 1) * 5 + 'CDHSN'.indexOf(bid[1]);
const isBid = call => /^\d/.test(call);

// The bidding box for a drill's own hands: its usual levels, plus whatever the answers need.
function practiceGrid(defaultBids, list) {
  const level = call => (isBid(call) ? Number(call[0]) : 0);
  const maxLevel = Math.max(...defaultBids.map(level), ...list.map(h => level(h.answer)));
  const grid = ['P'];
  if (defaultBids.includes('X') || list.some(h => h.answer === 'X' || h.answer === 'XX')) grid.push('X');
  if (list.some(h => h.answer === 'XX')) grid.push('XX');
  for (let l = 1; l <= maxLevel; l++) for (const s of 'CDHSN') grid.push(l + s);
  return grid;
}

// Turn one of your hands into a drill deal: auction table, legal calls, your answer and explanation.
function practiceDeal(item, n, total, bids) {
  const calls = item.auction.slice(0, -1); // the auction ends with '?', your turn
  const k = calls.length;
  const rel = i => (((i - k) % 4) + 4) % 4; // seat of call i: 0 you, 1 left, 2 partner, 3 right
  const names = [SEAT.you, SEAT.left, SEAT.partner, SEAT.right];
  const note = practiceText(item.note);
  let context = practiceCounter(n, total);
  if (item.auction.length) {
    const rows = [];
    for (let i = 0; i < item.auction.length; i += 4) rows.push([...item.auction.slice(i, i + 4), '', '', ''].slice(0, 4));
    context += auctionHtml([0, 1, 2, 3].map(j => names[rel(j)]), rows, note);
  } else if (note) {
    context += `<div>${note}</div>`;
  }
  const lastBid = calls.reduce((j, c, i) => (isBid(c) ? i : j), -1);
  const lastAction = calls.reduce((j, c, i) => (c !== 'P' ? i : j), -1);
  const byOpponent = i => rel(i) % 2 === 1;
  const canDouble = lastAction >= 0 && isBid(calls[lastAction]) && byOpponent(lastAction);
  const canRedouble = lastAction >= 0 && calls[lastAction] === 'X' && byOpponent(lastAction);
  return {
    hand: parseHand(item.hand),
    answer: { bid: item.answer, why: practiceText(item.why) },
    context,
    bids,
    allowed: bid => bid === 'P' || (bid === 'X' && canDouble) || (bid === 'XX' && canRedouble)
      || (isBid(bid) && (lastBid < 0 || bidRank(bid) > bidRank(calls[lastBid]))),
  };
}

// A bidding drill: show a hand (and optional context), let the player pick a bid, explain the answer.
// Elements are looked up as `${prefix}-hand`, `${prefix}-bids`, and so on.
function makeBidDrill({ prefix, bids, generate, practice }) {
  const stats = makeStats();
  let deal, answered;
  let practiceIndex = 0, practiceBids = null;

  // Your own hands, in order, when the drill has any; otherwise a random deal.
  function nextDeal() {
    const list = practiceHands(practice);
    if (!list.length) return generate();
    practiceBids = practiceBids || practiceGrid(bids, list);
    const i = practiceIndex++ % list.length;
    return practiceDeal(list[i], i + 1, list.length, practiceBids);
  }
  const $ = id => document.getElementById(`${prefix}-${id}`);

  function next() {
    deal = nextDeal();
    answered = false;
    const area = $('hand');
    area.innerHTML = '';
    renderFan(area, deal.hand);
    const context = $('context');
    if (context) {
      context.innerHTML = deal.context || '';
      context.hidden = !deal.context;
    }
    $('hcp').textContent = hcpText(hcp(deal.hand));
    $('hcp').hidden = !$('show-hcp').checked;
    $('feedback').className = 'feedback';
    $('feedback').innerHTML = '';
    $('next').hidden = true;
    renderBids();
  }

  function renderBids(chosen) {
    const box = $('bids');
    const list = deal.bids || bids;
    box.innerHTML = '';
    box.classList.toggle('with-double', list.includes('X'));
    box.classList.toggle('with-redouble', list.includes('XX'));
    for (const bid of list) {
      const btn = document.createElement('button');
      btn.className = 'bid' + (bid === 'P' ? ' pass' : bid === 'X' ? ' dbl' : bid === 'XX' ? ' rdbl' : '');
      btn.innerHTML = bh(bid);
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
      `<strong>${correct ? L('Correct!', 'נכון!') : L(`The suggested bid is ${bh(deal.answer.bid)}.`, `ההכרזה המומלצת היא ${bh(deal.answer.bid)}.`)}</strong>` +
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

  return { init, next };
}

// Bids are listed in auction order, so comparing indexes tells whether a bid is higher.
const ALL_BIDS = ['P', '1C', '1D', '1H', '1S', '1N', '2C', '2D', '2H', '2S', '2N', '3C', '3D', '3H', '3S'];

const OpeningTrainer = makeBidDrill({
  prefix: 'open',
  practice: 'opening',
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
  practice: 'responding',
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
      context: L(
        `Partner opens <strong>${bh('1' + open)}</strong>. The opponents pass. What do you respond?`,
        `השותף פותח <strong>${bh('1' + open)}</strong>. היריבים עושים פאס. מה תשיבו?`),
      allowed: bid => bid === 'P' || ALL_BIDS.indexOf(bid) > openIndex,
    };
  },
});

const REBID_BIDS = [...ALL_BIDS, '3N', '4C', '4D', '4H', '4S'];

const RebidTrainer = makeBidDrill({
  prefix: 'rebid',
  practice: 'openerRebid',
  bids: REBID_BIDS,
  generate() {
    // Deal a full table so partner's response comes from a real hand.
    for (;;) {
      const [hand, , partner] = dealHands();
      const opening = openingBid(hand).bid;
      if (opening[0] !== '1' || opening[1] === 'N') continue;
      const open = opening[1];
      if (hcp(partner) > 12) continue;
      const resp = responseBid(partner, open).bid;
      if (resp === 'P' || resp === '2N' || (resp[0] === '2' && resp[1] !== open)) continue;
      const answer = rebidBid(hand, open, resp);
      if (answer.bid === 'P' && Math.random() < 0.5) continue;
      const respIndex = REBID_BIDS.indexOf(resp);
      return {
        hand,
        answer,
        context: auctionHtml([SEAT.you, SEAT.left, SEAT.partner, SEAT.right], [[opening, 'P', resp, 'P'], ['?', '', '', '']],
          L(`Partner's ${bh(resp)} shows ${responseMeaning(resp, open)}.`, `ה-${bh(resp)} של השותף מראה ${responseMeaning(resp, open)}.`)),
        allowed: bid => bid === 'P' || REBID_BIDS.indexOf(bid) > respIndex,
      };
    }
  },
});

const ResponderRebidTrainer = makeBidDrill({
  prefix: 'rrebid',
  practice: 'responderRebid',
  bids: REBID_BIDS,
  generate() {
    for (;;) {
      const [partner, , hand] = dealHands();
      const opening = openingBid(partner).bid;
      if (opening[0] !== '1' || opening[1] === 'N' || hcp(hand) > 12) continue;
      const open = opening[1];
      const resp = responseBid(hand, open).bid;
      const rebid = rebidBid(partner, open, resp).bid;
      const answer = responderRebid(hand, open, resp, rebid);
      if (!answer || (answer.bid === 'P' && Math.random() < 0.4)) continue;
      const rebidIndex = REBID_BIDS.indexOf(rebid);
      return {
        hand,
        answer,
        context: auctionHtml([SEAT.partner, SEAT.right, SEAT.you, SEAT.left], [[opening, 'P', resp, 'P'], [rebid, 'P', '?', '']],
          L(`Partner's ${bh(rebid)} shows ${openerRebidMeaning(open, resp, rebid)}.`, `ה-${bh(rebid)} של השותף מראה ${openerRebidMeaning(open, resp, rebid)}.`)),
        allowed: bid => bid === 'P' || REBID_BIDS.indexOf(bid) > rebidIndex,
      };
    }
  },
});
