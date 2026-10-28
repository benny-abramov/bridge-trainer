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

// Support points: once you have a fit for partner's suit, your short side suits are worth extra,
// because as dummy you can ruff declarer's losers in them: 1 for a doubleton, 2 for a singleton,
// 3 for a void. `trump` is the suit you're supporting.
const SHORTNESS = [3, 2, 1]; // by length: void, singleton, doubleton

function supportPoints(hand, trump) {
  const len = suitLengths(hand);
  return SUITS.filter(s => s !== trump).reduce((sum, s) => sum + (SHORTNESS[len[s]] || 0), hcp(hand));
}

// "9 HCP + 2 for a singleton = 11 support points", or just "9 HCP" with no short suit.
function supportText(hand, trump) {
  const len = suitLengths(hand);
  const pts = hcp(hand);
  const parts = [0, 1, 2].map(n => {
    const count = SUITS.filter(s => s !== trump && len[s] === n).length;
    if (!count) return null;
    const worth = SHORTNESS[n] * count;
    const en = ['void', 'singleton', 'doubleton'][n], he = ['חוסר', 'סינגלטון', 'דאבלטון'][n];
    return count === 1
      ? L(`${worth} for a ${en}`, `${worth} על ${he}`)
      : L(`${worth} for ${count === 2 ? 'two' : 'three'} ${en}s`, `${worth} על ${count === 2 ? 'שני' : 'שלושה'} ${he === 'חוסר' ? 'חוסרים' : he + 'ים'}`);
  }).filter(Boolean);
  if (!parts.length) return hcpText(pts);
  const sp = supportPoints(hand, trump);
  return L(`${pts} HCP + ${parts.join(' + ')} = ${sp} support points`, `${pts} נק' + ${parts.join(' + ')} = ${sp} נקודות תמיכה`);
}

// Length points: the hand with the longer trumps (the one partner raised) doesn't count its short
// suits, since the ruffs happen in partner's hand. Instead it counts 1 for each card beyond four in
// every long suit: the trumps and any long side suit, which can set up extra tricks.
const extraLength = hand => Object.entries(suitLengths(hand)).filter(([, n]) => n > 4);

function lengthPoints(hand) {
  return extraLength(hand).reduce((sum, [, n]) => sum + n - 4, hcp(hand));
}

// "13 HCP + 2 for 6 spades + 1 for 5 diamonds = 16 points", or just "13 HCP" with no 5-card suit.
// The trump suit comes first.
function lengthText(hand, trump) {
  const pts = hcp(hand);
  const long = extraLength(hand).sort(([a], [b]) => (b === trump) - (a === trump));
  if (!long.length) return hcpText(pts);
  const total = lengthPoints(hand);
  const parts = long.map(([s, n]) => L(`${n - 4} for ${n} ${SUIT_NAME[s]}`, `${n - 4} על ${n} ${SUIT_NAME[s]}`));
  return L(`${pts} HCP + ${parts.join(' + ')} = ${total} points`, `${pts} נק' + ${parts.join(' + ')} = ${total} נקודות`);
}

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
    $('hcp-input').classList.remove('right', 'wrong');
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
    $('hcp-input').classList.add(correct ? 'right' : 'wrong');
    if (correct) {
      Sound.correct();
    } else {
      Sound.wrong();
      // Light up the cards that count, so you can see what you missed.
      $('hcp-hand').querySelectorAll('.card').forEach((el, i) => el.classList.toggle('counted', !!HCP_VALUES[hand[i].rank]));
    }
    const bal = isBalanced(hand);
    $('hcp-feedback').className = 'feedback ' + (correct ? 'good' : 'bad');
    $('hcp-feedback').innerHTML =
      `<strong>${correct ? L('✓ Correct!', '✓ נכון!') : L(`✗ Not quite — it's ${expected}.`, `✗ לא בדיוק: התשובה היא ${expected}.`)}</strong>` +
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

  if (pts >= 23) {
    return { bid: '2C', why: L(
      `${pts} HCP is 23 or more, so open ${bh('2C')}: the strong, artificial opening. It says nothing about clubs. It tells partner you have a very big hand.`,
      `${pts} נק' הן 23 ומעלה, ולכן פתחו ${bh('2C')}: הפתיחה החזקה והמלאכותית. היא לא אומרת דבר על קלאב, אלא מספרת לשותף שיש לכם יד גדולה מאוד.`) };
  }
  if (bal && pts >= 20 && pts <= 22) {
    return { bid: '2N', why: L(`Balanced with ${pts} HCP (20–22): open 2NT.`, `יד מאוזנת עם ${pts} נק' (20-22): פתחו 2NT.`) };
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

    // Open the longest suit: a longer minor comes before a 5-card major (6♦-5♥ opens 1♦).
    const major = len.S >= len.H ? 'S' : 'H';
    const longMinor = len.D >= len.C ? 'D' : 'C';
    if (len[major] >= 5 && len[longMinor] > len[major]) {
      return { bid: '1' + longMinor, why: L(
        `${reason}. Open your longest suit: ${len[longMinor]} ${SUIT_NAME[longMinor]} come before your ${len[major]} ${SUIT_NAME[major]}. Open ${bh('1' + longMinor)} and show the ${SUIT_NAME[major]} later.${note}`,
        `${reason}. פתחו בסדרה הארוכה ביותר: ${len[longMinor]} ${SUIT_NAME[longMinor]} קודמים ל-${len[major]} ה${SUIT_NAME[major]}. פתחו ${bh('1' + longMinor)} והראו את ה${SUIT_NAME[major]} בהמשך.${note}`) };
    }

    if (len.S >= 5 || len.H >= 5) {
      const suit = major;
      let which = '';
      if (len.S >= 5 && len.H >= 5) {
        which = len.S === len.H
          ? L(' With two equal majors, bid spades first.', ' עם שתי סדרות מייגור שוות, הכריזו קודם ספייד.')
          : L(' With two 5+ card majors, bid the longer.', ' עם שתי סדרות מייגור של 5 ומעלה, הכריזו את הארוכה.');
      }
      return { bid: '1' + suit, why: L(
        `${reason}. With a ${len[suit]}-card major, open ${bh('1' + suit)}.${which}${note}`,
        `${reason}. עם סדרת מייגור של ${len[suit]} קלפים, פתחו ${bh('1' + suit)}.${which}${note}`) };
    }
    let minor, how;
    if (len.D > len.C) { minor = 'D'; how = L('diamonds are your longer minor', 'הדיאמונד הוא סדרת המיינור הארוכה שלכם'); }
    else if (len.C > len.D) { minor = 'C'; how = L('clubs are your longer minor', 'הקלאב הוא סדרת המיינור הארוכה שלכם'); }
    else if (len.C === 3) { minor = 'C'; how = L(`with 3-3 in the minors, open ${bh('1C')}`, `עם 3-3 בסדרות המיינור, פתחו ${bh('1C')}`); }
    else { minor = 'D'; how = L(`with ${len.C}-${len.D} in the minors, open ${bh('1D')}`, `עם ${len.C}-${len.D} בסדרות המיינור, פתחו ${bh('1D')}`); }
    return { bid: '1' + minor, why: L(
      `${reason}. No 5-card major, so open a minor: ${how}.${note}`,
      `${reason}. אין סדרת מייגור של 5, ולכן פתחו בסדרת מיינור: ${how}.${note}`) };
  }

  if (pts >= 5 && pts <= 10) {
    // Weak twos and preempts need a good suit: two of the top four honors (A, K, Q, J).
    const good = s => goodPreemptSuit(hand.filter(c => c.suit === s));
    const seven = SUITS.find(s => len[s] >= 7);
    if (seven && good(seven)) {
      const bid = (len[seven] >= 8 ? '4' : '3') + seven;
      return { bid, why: L(
        `${pts} HCP with a good ${len[seven]}-card ${SUIT_NAME[seven]} suit: preempt with ${bh(bid)} to crowd the opponents' bidding. The 3-level shows 7 cards, the 4-level 8, and a preempt needs two of the top four honors (A, K, Q, J).`,
        `${pts} נק' עם סדרה טובה של ${len[seven]} קלפים ב${SUIT_NAME[seven]}: הכריזו חסימה ב-${bh(bid)} כדי להקשות על היריבים להכריז. רמה 3 מראה 7 קלפים, רמה 4 מראה 8, והכרזת חסימה דורשת שניים מארבעת ההונורים העליונים (A, K, Q, J).`) };
    }
    const six = ['S', 'H', 'D'].find(s => len[s] === 6);
    if (six && good(six)) {
      return { bid: '2' + six, why: L(
        `${pts} HCP with a good 6-card ${SUIT_NAME[six]} suit: open a weak two (${bh('2' + six)}). It shows a good long suit (two of the top four honors) in a hand too weak to open at the 1-level.`,
        `${pts} נק' עם סדרה טובה של 6 קלפים ב${SUIT_NAME[six]}: פתחו בהכרזת שתיים חלשה (${bh('2' + six)}). היא מראה סדרה ארוכה וטובה (שניים מארבעת ההונורים העליונים) ביד חלשה מכדי לפתוח ברמת 1.`) };
    }
    const weak = seven || six;
    if (weak) {
      return { bid: 'P', why: L(
        `${pts} HCP with ${len[weak]} ${SUIT_NAME[weak]}, but the suit is too weak: a weak two or a preempt needs two of the top four honors (A, K, Q, J). Pass.`,
        `${pts} נק' עם ${len[weak]} ${SUIT_NAME[weak]}, אבל הסדרה חלשה מדי: הכרזת שתיים חלשה או הכרזת חסימה דורשות שניים מארבעת ההונורים העליונים (A, K, Q, J). פאס.`) };
    }
    if (len.C === 6) {
      return { bid: 'P', why: L(
        `${pts} HCP is too weak to open at the 1-level. Your 6 clubs can't be shown with a weak ${bh('2C')}, which is reserved for strong hands, so pass.`,
        `${pts} נק' חלשות מכדי לפתוח ברמת 1. את 6 קלפי הקלאב אי אפשר להראות ב-${bh('2C')} חלשה, כי הכרזה זו שמורה לידיים חזקות, ולכן פאס.`) };
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
  // A hand that will raise partner counts support points. Minor raises come after showing a major
  // (or 1♦ over 1♣), so only hands that would really raise count them.
  const majorFit = isMajor && len[open] >= 3;
  const minorFit = !isMajor && len.H < 4 && len.S < 4
    && ((open === 'D' && len.D >= 4) || (open === 'C' && len.C >= 5 && len.D < 4));
  const sp = majorFit || minorFit ? supportPoints(hand, open) : pts;
  const count = majorFit || minorFit ? supportText(hand, open) : hcpText(pts);

  if (sp < 6) {
    return { bid: 'P', why: majorFit || minorFit
      ? L(`${count}: even counting your short suits you have fewer than 6, so pass.`, `${count}: גם עם הסדרות הקצרות יש לכם פחות מ-6, ולכן פאס.`)
      : L(`${pts} HCP: with fewer than 6, pass. Even if partner has a good hand, game is unlikely.`,
        `${pts} נק': עם פחות מ-6, פאס. גם אם לשותף יש יד טובה, משחק מלא לא סביר.`) };
  }

  // 1. Support partner's major.
  if (majorFit) {
    if (sp <= 10) {
      return { bid: '2' + open, why: L(
        `${count} and ${len[open]}-card support for partner's major: raise to ${bh('2' + open)}. Showing an 8-card major fit comes first.`,
        `${count} ותמיכה של ${len[open]} קלפים בסדרת המייגור של השותף: תמכו ב-${bh('2' + open)}. הצגת התאמה של 8 קלפים בסדרת מייגור קודמת לכל.`) };
    }
    // 13+ is game-forcing: the Responding drill leaves these hands out (see RespondingTrainer).
    if (sp >= 13 && len[open] >= 4) return { ...raiseMajor(hand, open), gameForce: true };
    // 13+ with three-card support: a jump to game would be preemptive, so bid a new suit now and
    // jump to game next round (a delayed game raise).
    if (sp >= 13) {
      const rk = s => SUITS.indexOf(s);
      const side = SUITS.filter(s => s !== open && len[s] >= 3)
        .sort((a, b) => len[b] - len[a] || rk(a) - rk(b))
        // a lower suit at the 2-level (2♥ needs five), or 1♠ with four over 1♥
        .find(s => (rk(s) > rk(open) && (s !== 'H' || len.H >= 5)) || (rk(s) < rk(open) && len[s] >= 4));
      if (side) {
        const bid = (rk(side) < rk(open) ? '1' : '2') + side;
        return { bid, gameForce: true, why: L(
          `${count} and ${len[open]}-card support: enough for game. A direct jump to ${bh('4' + open)} would show a weak, distributional hand, so first bid ${bh(bid)}, then jump to ${bh('4' + open)} on your next turn: a <em>delayed game raise</em>.`,
          `${count} ותמיכה של ${len[open]} קלפים: מספיק למשחק מלא. קפיצה ישירה ל-${bh('4' + open)} הייתה מראה יד חלשה עם חלוקה, ולכן הכריזו קודם ${bh(bid)}, ובתור הבא קפצו ל-${bh('4' + open)}: <em>תמיכה מאוחרת למשחק מלא</em>.`) };
      }
    }
    return { bid: '3' + open, gameForce: sp >= 13, why: L(
      `${count} and ${len[open]}-card support: jump to ${bh('3' + open)}, a <em>limit raise</em>. It invites partner to bid game with a little extra.`,
      `${count} ותמיכה של ${len[open]} קלפים: קפצו ל-${bh('3' + open)}, <em>תמיכה בקפיצה</em>. היא מזמינה את השותף להכריז משחק מלא אם יש לו מעט יותר.`) };
  }

  // 2. Show a new 4+ card suit at the 1-level, looking for a major fit first.
  if (open === 'C' || open === 'D') {
    if (len.H >= 4 || len.S >= 4) {
      const suit = len.S > len.H ? 'S' : len.H > len.S ? 'H' : len.S >= 5 ? 'S' : 'H';
      let tie = '';
      if (len.H === len.S) {
        tie = len.S >= 5
          ? L(' With two 5-card majors, bid spades first.', ' עם שתי סדרות מייגור של 5, הכריזו קודם ספייד.')
          : L(' With four cards in both majors, bid hearts first (up the line).', ' עם ארבעה קלפים בשתי סדרות המייגור, הכריזו קודם הארט (מלמטה למעלה).');
      }
      return { bid: '1' + suit, why: L(
        `${pts} HCP and ${len[suit]} ${SUIT_NAME[suit]}: bid ${bh('1' + suit)}. A new suit at the 1-level shows 4+ cards and 6+ HCP, and looking for a major fit comes before raising a minor.${tie}`,
        `${pts} נק' ו-${len[suit]} ${SUIT_NAME[suit]}: הכריזו ${bh('1' + suit)}. סדרה חדשה ברמת 1 מראה 4 קלפים ומעלה ו-6 נק' ומעלה, וחיפוש התאמה בסדרת מייגור קודם לתמיכה בסדרת מיינור.${tie}`) };
    }
    if (open === 'C' && len.D >= 4) {
      return { bid: '1D', why: L(
        `${pts} HCP and ${len.D} diamonds, no 4-card major: bid ${bh('1D')}. A new suit at the 1-level shows 4+ cards and asks partner to bid again.`,
        `${pts} נק' ו-${len.D} דיאמונד, בלי סדרת מייגור של 4: הכריזו ${bh('1D')}. סדרה חדשה ברמת 1 מראה 4 קלפים ומעלה ומבקשת מהשותף להכריז שוב.`) };
    }
  }
  if (open === 'H' && len.S >= 4) {
    return { bid: '1S', why: L(
      `${pts} HCP, fewer than 3 hearts, but ${len.S} spades: bid ${bh('1S')}. A new suit at the 1-level shows 4+ cards and 6+ HCP.`,
      `${pts} נק', פחות מ-3 הארט, אבל ${len.S} ספייד: הכריזו ${bh('1S')}. סדרה חדשה ברמת 1 מראה 4 קלפים ומעלה ו-6 נק' ומעלה.`) };
  }

  // 3. Raise partner's minor (4+ diamonds or 5+ clubs, since a minor opening can be short).
  if (minorFit) {
    if (sp <= 10) {
      return { bid: '2' + open, why: L(
        `${count}, no 4-card major and ${len[open]}-card support: raise to ${bh('2' + open)}.`,
        `${count}, בלי סדרת מייגור של 4, ותמיכה של ${len[open]} קלפים: תמכו ב-${bh('2' + open)}.`) };
    }
    return { bid: '3' + open, gameForce: sp >= 13, why: L(
      `${count}, no 4-card major and ${len[open]}-card support: jump to ${bh('3' + open)}, a limit raise inviting game.`,
      `${count}, בלי סדרת מייגור של 4, ותמיכה של ${len[open]} קלפים: קפצו ל-${bh('3' + open)}, תמיכה בקפיצה שמזמינה למשחק מלא.`) };
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
      `${pts} נק' בלי התאמה לשותף ו-${len[s]} ${SUIT_NAME[s]}: הכריזו ${bh('2' + s)}. סדרה חדשה ברמת 2 דורשת 11 נק' ומעלה${s === 'H' ? ' (וחמישה הארט)' : ''}.`) };
  }
  return { bid: '2N', why: L(
    `${pts} HCP with no fit and no suit to show: bid 2NT, inviting game (11–12 HCP).`,
    `${pts} נק' בלי התאמה ובלי סדרה להראות: הכריזו 2NT, הזמנה למשחק מלא (11-12 נק').`) };
}

// Opener's rebid after partner raises, makes a 1-level new-suit response, or responds 1NT.
// `open` is the opening suit and `resp` partner's response ('2H', '1S', '1N', ...). Returns { bid, why }.
const STRENGTH_TEXT = L(
  { min: 'a minimum hand (12–14)', med: 'a medium hand (15–17)', max: 'a maximum hand (18–22)' },
  { min: 'יד מינימום (12-14)', med: 'יד בינונית (15-17)', max: 'יד מקסימום (18-22)' });

function rebidBid(hand, open, resp) {
  const pts = hcp(hand);
  const len = suitLengths(hand);
  const str = pts >= 18 ? 'max' : pts >= 15 ? 'med' : 'min';
  const you = L(`${pts} HCP is ${STRENGTH_TEXT[str]}`, `${pts} נק' הן ${STRENGTH_TEXT[str]}`);
  const [rLevel, rSuit] = [Number(resp[0]), resp[1]];
  // Once a fit is found you count support points (raising partner) or length points (raised by partner).
  const raiseStr = sp => (sp >= 18 ? 'max' : sp >= 15 ? 'med' : 'min');
  const raiser = trump => {
    const s = raiseStr(supportPoints(hand, trump));
    return { str: s, you: `${supportText(hand, trump)}: ${STRENGTH_TEXT[s]}` };
  };
  const isMajor = open === 'H' || open === 'S';
  const rank = s => SUITS.indexOf(s); // lower index = higher-ranking suit
  const game = isMajor ? '4' + open : '3N';
  const minorGame = isMajor ? '' : L(
    ' With a minor-suit fit, 3NT (9 tricks) is usually easier than 5 of a minor (11 tricks).',
    ' עם התאמה בסדרת מיינור, 3NT (9 לקיחות) בדרך כלל קל יותר מ-5 בסדרת מיינור (11 לקיחות).');

  // Partner raised your suit: you have the long trumps, so count length points.
  if (rSuit === open) {
    const str = raiseStr(lengthPoints(hand));
    const you = `${lengthText(hand, open)}: ${STRENGTH_TEXT[str]}`;
    if (rLevel === 2) {
      if (str === 'min') return { bid: 'P', why: L(
        `${you}. Partner's raise shows 6–10 points, so you can't reach the 25 needed for game. Pass.`,
        `${you}. התמיכה של השותף מראה 6-10 נקודות, כך שאי אפשר להגיע ל-25 הנקודות הדרושות למשחק מלא. פאס.`) };
      if (str === 'med') return { bid: '3' + open, why: L(
        `${you}. Game is possible if partner is at the top of their 6–10 range, so invite with ${bh('3' + open)}.`,
        `${you}. משחק מלא אפשרי אם השותף בראש הטווח שלו (6-10), ולכן הזמינו ב-${bh('3' + open)}.`) };
      return { bid: game, why: L(
        `${you}. Even opposite 6 points you have enough for game: bid ${bh(game)}.${minorGame}`,
        `${you}. גם מול 6 נקודות יש לכם מספיק למשחק מלא: הכריזו ${bh(game)}.${minorGame}`) };
    }
    if (str === 'min') return { bid: 'P', why: L(
      `${you}. Partner's limit raise invites game. With a minimum, decline by passing.`,
      `${you}. התמיכה בקפיצה של השותף מזמינה למשחק מלא. עם מינימום, דחו את ההזמנה בפאס.`) };
    return { bid: game, why: L(
      `${you}. That's more than a minimum, so accept partner's invitation and bid game: ${bh(game)}.${minorGame}`,
      `${you}. זה יותר ממינימום, ולכן קבלו את ההזמנה של השותף והכריזו משחק מלא: ${bh(game)}.${minorGame}`) };
  }

  const balanced = isBalanced(hand);

  // Partner bid a new suit at the 2-level ("two over one"): 11+ HCP and forcing, so you must bid again.
  if (rLevel === 2 && rSuit !== 'N') {
    const forcing = L(`Partner's ${bh(resp)} shows 11+ HCP and is forcing`, `ה-${bh(resp)} של השותף מראה 11 נק' ומעלה ומחייב`);
    // 1. Support for partner's suit: 3+ hearts (a 2♥ response shows five), or 4+ in a minor when unbalanced.
    if (rSuit === 'H' ? len.H >= 3 : len[rSuit] >= 4 && !balanced) {
      const { you } = raiser(rSuit);
      return { bid: '3' + rSuit, why: L(
        `${forcing}. ${you}, with ${len[rSuit]}-card support: raise to ${bh('3' + rSuit)}.`,
        `${forcing}. ${you}, עם תמיכה של ${len[rSuit]} קלפים: תמכו ב-${bh('3' + rSuit)}.`) };
    }
    // 2. Balanced hands bid no-trump: 2NT with 12–14, 3NT with 18–19 (15–17 balanced opens 1NT).
    if (balanced) {
      if (str === 'min') return { bid: '2N', why: L(
        `${forcing}. ${you} and balanced: bid 2NT, which shows 12–14.`,
        `${forcing}. ${you} ומאוזנת: הכריזו 2NT, שמראה 12-14.`) };
      return { bid: '3N', why: L(
        `${forcing}. ${you} and balanced: jump to 3NT, which shows 18–19.`,
        `${forcing}. ${you} ומאוזנת: קפצו ל-3NT, שמראה 18-19.`) };
    }
    // 3. A 6-card suit: rebid it, jumping with extra strength.
    if (len[open] >= 6) {
      const bid = (str === 'min' ? '2' : '3') + open;
      return { bid, why: str === 'min'
        ? L(`${forcing}. ${you} with ${len[open]} ${SUIT_NAME[open]}: rebid ${bh(bid)} to show 6+ cards.`,
          `${forcing}. ${you}, עם ${len[open]} ${SUIT_NAME[open]}: הכריזו ${bh(bid)} כדי להראות 6 קלפים ומעלה.`)
        : L(`${forcing}. ${you} with ${len[open]} ${SUIT_NAME[open]}: jump to ${bh(bid)} to show a good 6-card suit and extra strength.`,
          `${forcing}. ${you}, עם ${len[open]} ${SUIT_NAME[open]}: קפצו ל-${bh(bid)} כדי להראות סדרה טובה של 6 קלפים וכוח נוסף.`) };
    }
    // 4. A second suit you can still bid at the 2-level (higher-ranking than your first is a reverse, 16+).
    const others = SUITS.filter(z => z !== open && z !== rSuit && len[z] >= 4)
      .sort((a, b) => len[b] - len[a] || rank(a) - rank(b));
    const twoLevel = others.find(z => rank(z) < rank(rSuit) && (rank(z) > rank(open) || pts >= 16));
    if (twoLevel) {
      const reverse = rank(twoLevel) < rank(open);
      return { bid: '2' + twoLevel, why: L(
        `${forcing}. ${you} with ${len[twoLevel]} ${SUIT_NAME[twoLevel]}: bid ${bh('2' + twoLevel)}.${reverse ? ' Bidding a higher-ranking suit than your first is a <em>reverse</em> and needs 16+ HCP.' : ''}`,
        `${forcing}. ${you}, עם ${len[twoLevel]} ${SUIT_NAME[twoLevel]}: הכריזו ${bh('2' + twoLevel)}.${reverse ? ' הכרזת סדרה גבוהה מהסדרה הראשונה שלכם היא <em>ריברס</em> ודורשת 16 נק\' ומעלה.' : ''}`) };
    }
    // 5. A second suit that needs the 3-level shows extra strength.
    const threeLevel = others.find(z => rank(z) > rank(rSuit));
    if (threeLevel && str !== 'min') {
      return { bid: '3' + threeLevel, why: L(
        `${forcing}. ${you} with ${len[threeLevel]} ${SUIT_NAME[threeLevel]}: bid ${bh('3' + threeLevel)}. A new suit at the 3-level shows extra strength (15+).`,
        `${forcing}. ${you}, עם ${len[threeLevel]} ${SUIT_NAME[threeLevel]}: הכריזו ${bh('3' + threeLevel)}. סדרה חדשה ברמת 3 מראה כוח נוסף (15 ומעלה).`) };
    }
    // 6. Nothing else to say: rebid your suit.
    return { bid: '2' + open, why: L(
      `${forcing}. ${you}, with no fit, no second suit you can show cheaply and an unbalanced hand: rebid your ${SUIT_NAME[open]} at the 2-level, ${bh('2' + open)}.`,
      `${forcing}. ${you}, בלי התאמה, בלי סדרה שנייה שאפשר להראות בזול וביד לא מאוזנת: הכריזו שוב את ה${SUIT_NAME[open]} שלכם ברמת 2, ${bh('2' + open)}.`) };
  }

  if (rLevel === 1 && rSuit !== 'N') {
    // 1. Raise partner's major with 4-card support.
    if ((rSuit === 'H' || rSuit === 'S') && len[rSuit] >= 4) {
      const { str, you } = raiser(rSuit);
      const level = { min: '2', med: '3', max: '4' }[str];
      const how = L(
        { min: 'raise to 2', med: 'jump to 3 to invite game', max: 'bid game at the 4-level' },
        { min: 'תמכו ברמת 2', med: 'קפצו ל-3 כהזמנה למשחק מלא', max: 'הכריזו משחק מלא ברמת 4' })[str];
      return { bid: level + rSuit, why: L(
        `${you} with ${len[rSuit]}-card support for partner's ${SUIT_NAME[rSuit]}. You've found an 8-card major fit: ${how} (${bh(level + rSuit)}).`,
        `${you}, עם תמיכה של ${len[rSuit]} קלפים ב${SUIT_NAME[rSuit]} של השותף. מצאתם התאמה של 8 קלפים בסדרת מייגור: ${how} (${bh(level + rSuit)}).`) };
    }
    // 2. Show a 4-card major that can still be bid at the 1-level.
    const major = ['H', 'S'].find(z => z !== open && rank(z) < rank(rSuit) && len[z] >= 4);
    if (major) {
      return { bid: '1' + major, why: L(
        `You have 4 ${SUIT_NAME[major]} and can show them at the 1-level: bid ${bh('1' + major)}. Partner may have four too, and an 8-card major fit is worth looking for before no-trump.`,
        `יש לכם 4 ${SUIT_NAME[major]}, ואפשר להראות אותם ברמת 1: הכריזו ${bh('1' + major)}. ייתכן שגם לשותף יש ארבעה, ושווה לחפש התאמה בסדרת מייגור לפני ללא שליט.`) };
    }
    // 3. Raise partner's 1♦ response with 4-card support.
    if (rSuit === 'D' && len.D >= 4) {
      const { str, you } = raiser('D');
      const bid = str === 'min' ? '2D' : '3D';
      return { bid, why: L(
        `${you} with ${len.D}-card diamond support and no major to show: raise to ${bh(bid)}.`,
        `${you}, עם תמיכה של ${len.D} קלפים בדיאמונד ובלי סדרת מייגור להראות: תמכו ב-${bh(bid)}.`) };
    }
    // 4. Balanced hands bid no-trump.
    if (balanced) {
      if (str === 'min') return { bid: '1N', why: L(
        `${you} and balanced, with no fit and no major to show: rebid 1NT (12–14 balanced).`,
        `${you} ומאוזנת, בלי התאמה ובלי סדרת מייגור להראות: הכריזו 1NT (12-14 מאוזנת).`) };
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
      `${you} ומאוזנת: הכריזו 2NT, כדי להזמין את השותף ל-3NT אם הוא בראש הטווח שלו (6-10).`) };
  }

  // Unbalanced hands: rebid a 6-card suit, or show a second suit.
  if (len[open] >= 6) {
    if (str === 'min') return { bid: '2' + open, why: L(
      `${you} with ${len[open]} ${SUIT_NAME[open]}: rebid your suit at the cheapest level, ${bh('2' + open)}. Rebidding a suit shows 6+ cards.`,
      `${you}, עם ${len[open]} ${SUIT_NAME[open]}: חזרו על הסדרה שלכם ברמה הזולה ביותר, ${bh('2' + open)}. חזרה על סדרה מראה 6 קלפים ומעלה.`) };
    if (str === 'med') return { bid: '3' + open, why: L(
      `${you} with ${len[open]} ${SUIT_NAME[open]}: jump to ${bh('3' + open)} to show a good 6-card suit and 15–17. It invites game.`,
      `${you}, עם ${len[open]} ${SUIT_NAME[open]}: קפצו ל-${bh('3' + open)} כדי להראות סדרה טובה של 6 קלפים ו-15-17. זו הזמנה למשחק מלא.`) };
    // 18+ is too strong for a jump rebid, which partner may pass: force to game instead.
    const solid = ['A', 'K', 'Q'].every(r => hand.some(c => c.suit === open && c.rank === r));
    if (solid) return { bid: '3N', why: L(
      `${you} with a solid ${len[open]}-card ${SUIT_NAME[open]} suit (A, K and Q). A jump to ${bh('3' + open)} shows only 15–17 and partner may pass it, so bid game: 3NT. Your ${SUIT_NAME[open]} should provide the tricks.`,
      `${you}, עם סדרת ${SUIT_NAME[open]} סגורה של ${len[open]} קלפים (A, K ו-Q). קפיצה ל-${bh('3' + open)} מראה רק 15-17 והשותף עלול לעצור בה, ולכן הכריזו משחק מלא: 3NT. ה${SUIT_NAME[open]} שלכם אמורים לספק את הלקיחות.`) };
    const other = SUITS.filter(z => z !== open && z !== rSuit && len[z] >= 4).sort((a, b) => len[b] - len[a] || rank(a) - rank(b))[0];
    if (other) {
      const level = (rank(other) < rank(rSuit) ? rLevel : rLevel + 1) + 1;
      return { bid: level + other, why: L(
        `${you} with ${len[open]} ${SUIT_NAME[open]} and ${len[other]} ${SUIT_NAME[other]}. A jump to ${bh('3' + open)} shows only 15–17, so make a <em>jump shift</em> to ${bh(level + other)}: it shows 18+ and forces to game.`,
        `${you}, עם ${len[open]} ${SUIT_NAME[open]} ו-${len[other]} ${SUIT_NAME[other]}. קפיצה ל-${bh('3' + open)} מראה רק 15-17, ולכן הכריזו <em>קפיצה בסדרה חדשה</em> ל-${bh(level + other)}: היא מראה 18 ומעלה ומחייבת עד משחק מלא.`) };
    }
    return { bid: '3N', why: L(
      `${you} with ${len[open]} ${SUIT_NAME[open]}. A jump to ${bh('3' + open)} shows only 15–17, and with no second suit to jump in, bid game directly: 3NT.`,
      `${you}, עם ${len[open]} ${SUIT_NAME[open]}. קפיצה ל-${bh('3' + open)} מראה רק 15-17, ובלי סדרה שנייה לקפוץ בה, הכריזו משחק מלא ישירות: 3NT.`) };
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
  // After a 1NT response (not forcing) a 5-card suit isn't rebid: rebidding promises six.
  if (rSuit === 'N' && len[open] < 6) {
    const reason = higher
      ? L(`showing your ${SUIT_NAME[higher]} would be a <em>reverse</em>, which needs 16+ HCP`, `הצגת ה${SUIT_NAME[higher]} תהיה <em>ריברס</em>, שדורש 16 נק' ומעלה`)
      : L('you have no second suit to show', 'אין לכם סדרה שנייה להראות');
    return { bid: 'P', why: L(
      `${you}. Partner's 1NT isn't forcing, ${reason}, and rebidding your ${SUIT_NAME[open]} would promise six. With only ${len[open]}, pass: 1NT is a reasonable contract.`,
      `${you}. ה-1NT של השותף לא מחייב, ${reason}, וחזרה על ה${SUIT_NAME[open]} שלכם הייתה מבטיחה שישה. עם ${len[open]} בלבד, פאס: 1NT הוא חוזה סביר.`) };
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
      ? L('6–10 points (counting short suits) and support for your suit', '6-10 נקודות (כולל סדרות קצרות) ותמיכה בסדרה שלכם')
      : L('11–12 points (counting short suits) and support: a <em>limit raise</em>, inviting game', '11-12 נקודות (כולל סדרות קצרות) ותמיכה: <em>תמיכה בקפיצה</em>, הזמנה למשחק מלא');
  }
  if (resp[0] === '2') {
    return L(`11+ HCP and 4+ ${SUIT_NAME[resp[1]]}${resp[1] === 'H' ? ' (5+ for hearts)' : ''}: a <em>two over one</em>. It's forcing: you must bid again`,
      `11 נק' ומעלה ו-4 ${SUIT_NAME[resp[1]]} ומעלה${resp[1] === 'H' ? ' (5 ומעלה בהארט)' : ''}: <em>שתיים על אחת</em>. זה מחייב: אתם חייבים להכריז שוב`);
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
    ' עם התאמה בסדרת מיינור, 3NT בדרך כלל קל יותר מ-5 בסדרת מיינור.'));
  const [rl, rz] = [Number(rebid[0]), rebid[1]];
  const name = s => SUIT_NAME[s];
  // Preference between partner's two suits compares the fits, not just your own lengths: a major
  // opening promises five cards and the second suit four. Equal fits go back to the first suit.
  const firstShown = isMajor(open) ? 5 : 4;
  const prefersSecond = z => len[z] + 4 > len[open] + firstShown;
  const firstFit = z => (isMajor(open)
    ? L(`Partner has five ${name(open)} and four ${name(z)}, so your ${len[open]} ${name(open)} make a ${len[open] + 5}-card fit, at least as good as the ${len[z] + 4}-card fit your ${len[z]} ${name(z)} make.`,
      `לשותף יש חמישה ${name(open)} וארבעה ${name(z)}, כך ש-${len[open]} ה${name(open)} שלכם יוצרים התאמה של ${len[open] + 5} קלפים, טובה לפחות כמו ההתאמה של ${len[z] + 4} קלפים שיוצרים ${len[z]} ה${name(z)} שלכם.`)
    : L(`With ${len[open]} ${name(open)} and ${len[z]} ${name(z)}, partner's first suit is usually at least as long.`,
      `עם ${len[open]} ${name(open)} ו-${len[z]} ${name(z)}, הסדרה הראשונה של השותף בדרך כלל ארוכה לפחות באותה מידה.`));
  const accept = pts >= 9;
  const acceptWhy = s => (accept
    ? { bid: game(s), why: L(
      `You have ${pts} HCP, the top of your 6–10 range. Accept partner's invitation: bid ${bh(game(s))}.${minorNote(s)}`,
      `יש לכם ${pts} נק', ראש הטווח שלכם (6-10). קבלו את ההזמנה של השותף: הכריזו ${bh(game(s))}.${minorNote(s)}`) }
    : { bid: 'P', why: L(
      `You have ${pts} HCP, the bottom of your 6–10 range. Decline partner's invitation by passing.`,
      `יש לכם ${pts} נק', תחתית הטווח שלכם (6-10). דחו את ההזמנה של השותף בפאס.`) });

  if (rebid === 'P') return null;

  // A delayed game raise: a new suit first, then game in partner's major with three-card support.
  if (isMajor(open) && len[open] >= 3 && pts >= 13 && resp[1] !== open && resp[1] !== 'N' && /^[123]/.test(rebid)) {
    const bid = '4' + open;
    if (rebid === bid || (rl === 4)) return null;
    return { bid, why: L(
      `You have ${pts} HCP and ${len[open]} of partner's ${name(open)}, an 8-card fit. You bid ${bh(resp)} first to show your strength; now jump to ${bh(bid)}. This <em>delayed game raise</em> shows 13+ with three-card support, more than a direct ${bh(bid)} would.`,
      `יש לכם ${pts} נק' ו-${len[open]} ב${name(open)} של השותף, התאמה של 8 קלפים. הכרזתם קודם ${bh(resp)} כדי להראות כוח, ועכשיו קפצו ל-${bh(bid)}. <em>תמיכה מאוחרת למשחק מלא</em> זו מראה 13 ומעלה עם תמיכה של 3 קלפים, יותר מ-${bh(bid)} ישיר.`) };
  }

  // You raised partner's suit and partner invited game: count your support points.
  if (resp === '2' + open) {
    if (rebid !== '3' + open) return null;
    const sp = supportPoints(hand, open), count = supportText(hand, open);
    return sp >= 9
      ? { bid: game(open), why: L(
        `${count}, the top of your 6–10 range. Accept partner's invitation: bid ${bh(game(open))}.${minorNote(open)}`,
        `${count}, ראש הטווח שלכם (6-10). קבלו את ההזמנה של השותף: הכריזו ${bh(game(open))}.${minorNote(open)}`) }
      : { bid: 'P', why: L(
        `${count}, the bottom of your 6–10 range. Decline partner's invitation by passing.`,
        `${count}, תחתית הטווח שלכם (6-10). דחו את ההזמנה של השותף בפאס.`) };
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
      // Partner's new suit can hold up to 17, so with 8–10 game is still possible: invite.
      if (pts >= 8) {
        const upTo = L(`You have ${pts} HCP. Partner's ${bh(rebid)} can be as strong as 17, so game is possible: keep the auction going.`,
          `יש לכם ${pts} נק'. ה-${bh(rebid)} של השותף יכול להיות חזק עד 17, ולכן משחק מלא אפשרי: המשיכו את המכרז.`);
        return len[rz] >= 4
          ? { bid: '3' + rz, why: L(
            `${upTo} With ${len[rz]} ${name(rz)}, raise to ${bh('3' + rz)} to invite game.`,
            `${upTo} עם ${len[rz]} ${name(rz)}, תמכו ב-${bh('3' + rz)} כדי להזמין למשחק מלא.`) }
          : { bid: '2N', why: L(
            `${upTo} With no 4-card support for either suit, bid 2NT to invite game.`,
            `${upTo} בלי תמיכה של 4 קלפים באף אחת מהסדרות, הכריזו 2NT כדי להזמין למשחק מלא.`) };
      }
      return prefersSecond(rz)
        ? { bid: 'P', why: L(
          `Partner has shown ${name(open)} and ${name(rz)}. Your ${len[rz]} ${name(rz)} make a longer fit than your ${len[open]} ${name(open)}, so pass and play in ${name(rz)}.`,
          `השותף הראה ${name(open)} ו${name(rz)}. ${len[rz]} ה${name(rz)} שלכם יוצרים התאמה ארוכה יותר מ-${len[open]} ה${name(open)}, ולכן פאס ושחקו ב${name(rz)}.`) }
        : { bid: '2' + open, why: L(
          `Partner has shown ${name(open)} and ${name(rz)}. ${firstFit(rz)} So give <em>preference</em> to partner's first suit: ${bh('2' + open)}. This isn't extra strength, just a choice of suit.`,
          `השותף הראה ${name(open)} ו${name(rz)}. ${firstFit(rz)} לכן תנו <em>העדפה</em> לסדרה הראשונה של השותף: ${bh('2' + open)}. זה לא כוח נוסף, רק בחירת סדרה.`) };
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

  // 13+ opposite an opening bid is game, whatever partner's simple rebid (the drill's hands stop
  // at 12; Play a Hand's don't). Jumps, 2NT and reverses are handled below.
  const reverse = rl === 2 && rz !== you && rz !== open && rank(rz) < rank(open);
  if (pts >= 13 && rl <= 2 && rebid !== '2N' && !reverse) {
    let bid = '3N', why;
    if (rz === you && isMajor(you)) {
      bid = '4' + you;
      why = L(`partner raised your ${name(you)}, so bid game there`, `השותף תמך ב${name(you)} שלכם, ולכן הכריזו שם משחק מלא`);
    } else if (isMajor(rz) && rz !== you && rz !== open && len[rz] >= 4) {
      bid = '4' + rz;
      why = L(`you have 4 of partner's ${name(rz)}, an 8-card major fit`, `יש לכם 4 ב${name(rz)} של השותף, התאמה של 8 קלפים בסדרת מייגור`);
    } else if (isMajor(open) && len[open] >= (rz === open ? 2 : 3)) {
      bid = '4' + open;
      why = L(`you have ${len[open]} of partner's ${name(open)}, an 8-card fit`, `יש לכם ${len[open]} ב${name(open)} של השותף, התאמה של 8 קלפים`);
    } else if (isMajor(you) && len[you] >= 6) {
      bid = '4' + you;
      why = L(`your ${len[you]} ${name(you)} are long enough to play opposite any two cards`, `${len[you]} ה${name(you)} שלכם ארוכים מספיק כדי לשחק מול כל שני קלפים`);
    } else {
      why = L('there is no 8-card major fit, so play in no-trump', 'אין התאמה של 8 קלפים בסדרת מייגור, ולכן שחקו בללא שליט');
    }
    return { bid, why: L(
      `You have ${pts} HCP: with 13+ opposite an opening bid you have enough for game (25+ together). Don't just invite: ${why}. Bid ${bh(bid)}.`,
      `יש לכם ${pts} נק': עם 13 ומעלה מול פתיחה יש מספיק למשחק מלא (25 ומעלה ביחד). אל תסתפקו בהזמנה: ${why}. הכריזו ${bh(bid)}.`) };
  }

  // Partner raised your suit: you have the long trumps, so count length points.
  if (rz === you) {
    const total = lengthPoints(hand), count = lengthText(hand, you);
    if (rl === 2) {
      return total >= 11
        ? { bid: '3' + you, why: L(
          `${count}, enough to invite game (11–12). Partner's raise shows 12–14, so game is possible: invite with ${bh('3' + you)}.`,
          `${count}, מספיק כדי להזמין למשחק מלא (11-12). התמיכה של השותף מראה 12-14, ולכן משחק מלא אפשרי: הזמינו ב-${bh('3' + you)}.`) }
        : { bid: 'P', why: L(
          `${count}, a minimum response (6–10). Partner's raise shows a minimum opening (12–14), so game is out of reach: pass.`,
          `${count}, תשובת מינימום (6-10). התמיכה של השותף מראה פתיחת מינימום (12-14), ולכן משחק מלא לא בהישג יד: פאס.`) };
    }
    if (rl === 3) {
      return total >= 9
        ? { bid: game(you), why: L(
          `You have ${count}. Partner's jump raise shows 15–17 and invites game, and you have enough to accept: bid ${bh(game(you))}.${minorNote(you)}`,
          `יש לכם ${count}. הקפיצה של השותף מראה 15-17 ומזמינה למשחק מלא, ויש לכם מספיק כדי לקבל: הכריזו ${bh(game(you))}.${minorNote(you)}`) }
        : { bid: 'P', why: L(
          `You have ${count}. Partner's jump raise invites game, but with a bare minimum you decline by passing.`,
          `יש לכם ${count}. הקפיצה של השותף מזמינה למשחק מלא, אבל עם מינימום חשוף דחו את ההזמנה בפאס.`) };
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
          `${strength}, ו-${len[you]} ${name(you)}: הכריזו ${bh('2' + you)}. חזרה על הסדרה מראה 6 קלפים ומעלה ומבקשת מהשותף להכריז פאס.`) };
    }
    // A weak two-suiter: show the lower-ranking second suit. It isn't forcing, and partner
    // chooses between your two suits.
    const second = !inv && len[you] >= 5 && !isBalanced(hand)
      && SUITS.find(z => z !== you && z !== open && rank(z) > rank(you) && len[z] >= 4);
    if (second) {
      return { bid: '2' + second, why: L(
        `${strength}, with ${len[you]} ${name(you)} and ${len[second]} ${name(second)}. With an unbalanced hand 1NT may be a poor spot, so bid ${bh('2' + second)} to show your second suit. It isn't forcing: partner passes with ${name(second)} or goes back to ${bh('2' + you)} with three ${name(you)}.`,
        `${strength}, עם ${len[you]} ${name(you)} ו-${len[second]} ${name(second)}. ביד לא מאוזנת 1NT עלול להיות חוזה גרוע, ולכן הכריזו ${bh('2' + second)} כדי להראות את הסדרה השנייה. ההכרזה לא מחייבת: השותף מכריז פאס עם ${name(second)} או חוזר ל-${bh('2' + you)} עם שלושה ${name(you)}.`) };
    }
    return inv
      ? { bid: '2N', why: L(
        `${strength}. Partner's 1NT shows 12–14, so invite game with 2NT.`,
        `${strength}. ה-1NT של השותף מראה 12-14, ולכן הזמינו למשחק מלא ב-2NT.`) }
      : { bid: 'P', why: L(
        `${strength}. Partner's 1NT shows 12–14, so game is out of reach and 1NT is a fine spot: pass.`,
        `${strength}. ה-1NT של השותף מראה 12-14, ולכן משחק מלא לא בהישג יד ו-1NT הוא חוזה טוב: פאס.`) };
  }

  // Opposite partner's 18+ (a 2NT rebid or a jump shift), 15+ makes 33+: a small slam.
  const slam = (shows, strain) => {
    const bid = (pts >= 19 ? '7' : '6') + strain;
    return { bid, why: L(
      `Partner's ${bh(rebid)} shows ${shows}, and you have ${pts} HCP: about ${pts + 18}+ together. 33 is enough for a small slam${pts >= 19 ? ' and 37 for a grand slam' : ''}, so bid ${bh(bid)}.`,
      `ה-${bh(rebid)} של השותף מראה ${shows}, ויש לכם ${pts} נק': בערך ${pts + 18} ומעלה ביחד. 33 מספיקות לסלאם קטן${pts >= 19 ? ' ו-37 לסלאם גדול' : ''}, ולכן הכריזו ${bh(bid)}.`) };
  };

  if (rebid === '3N') {
    if (pts >= 15) return slam(L('18+ HCP', "18 נק' ומעלה"), 'N');
    return { bid: 'P', why: L(`Partner's 3NT shows 18+ HCP with a long suit and is game. With ${pts} HCP there's no slam, so pass.`,
      `ה-3NT של השותף מראה 18 נק' ומעלה עם סדרה ארוכה, וזה משחק מלא. עם ${pts} נק' אין סלאם, ולכן פאס.`) };
  }
  if (rebid === '2N') {
    if (pts >= 15) return slam(L('18–19 balanced', '18-19 מאוזנת'), isMajor(you) && len[you] >= 6 ? you : 'N');
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
      const raiseInv = supportPoints(hand, rz) >= 11, count = supportText(hand, rz);
      return { bid: (raiseInv ? '3' : '2') + rz, why: L(
        `${count} and 4 ${name(rz)}: you've found an 8-card major fit. ${raiseInv ? `That's enough to invite game: jump to ${bh('3' + rz)}.` : `Raise to ${bh('2' + rz)}.`}`,
        `${count}, ו-4 ${name(rz)}: מצאתם התאמה של 8 קלפים בסדרת מייגור. ${raiseInv ? `זה מספיק כדי להזמין למשחק מלא: קפצו ל-${bh('3' + rz)}.` : `תמכו ב-${bh('2' + rz)}.`}`) };
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
          `${strength}, סינגלטון בסדרה של השותף ו-${len[you]} ${name(you)}: קפצו ל-${bh('3' + you)} כדי להזמין למשחק מלא בסדרה הארוכה שלכם.`) };
        return { bid: '2N', why: L(
          `${strength} but a singleton in partner's suit: bid 2NT to invite game.`,
          `${strength}, אבל סינגלטון בסדרה של השותף: הכריזו 2NT כדי להזמין למשחק מלא.`) };
      }
      if (len[you] >= 6 && len[open] <= 1) {
        return { bid: '2' + you, why: L(
          `${strength}, a singleton in partner's suit and ${len[you]} ${name(you)}: rebid ${bh('2' + you)}. It suggests playing there and asks partner to pass.`,
          `${strength}, סינגלטון בסדרה של השותף ו-${len[you]} ${name(you)}: הכריזו ${bh('2' + you)}. זה מציע לשחק שם ומבקש מהשותף להכריז פאס.`) };
      }
      return { bid: 'P', why: L(
        `${strength}. Partner's ${bh('2' + open)} shows a minimum with 6+ ${name(open)}, so game is out of reach: pass.`,
        `${strength}. ה-${bh('2' + open)} של השותף מראה מינימום עם 6 ${name(open)} ומעלה, ולכן משחק מלא לא בהישג יד: פאס.`) };
    }
    if (isMajor(you) && len[you] >= 6 && len[open] <= 1 && pts >= 8) {
      return { bid: '4' + you, why: L(
        `You have ${pts} HCP and ${len[you]} ${name(you)}, but only a singleton in partner's suit. Opposite partner's 15–17, your long major is worth more than its points, so bid game in it: ${bh('4' + you)}.`,
        `יש לכם ${pts} נק' ו-${len[you]} ${name(you)}, אבל רק סינגלטון בסדרה של השותף. מול 15-17 של השותף, סדרת המייגור הארוכה שלכם שווה יותר מהנקודות שלה, ולכן הכריזו בה משחק מלא: ${bh('4' + you)}.`) };
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
    if (pts >= 15) return slam(L('18+ HCP', "18 נק' ומעלה"), isMajor(open) && len[open] >= 3 ? open : 'N');
    return isMajor(open) && len[open] >= 3
      ? { bid: '4' + open, why: L(
        `Partner's jump shift shows 18+ HCP and forces to game. With ${len[open]}-card support for partner's major, bid game there: ${bh('4' + open)}.`,
        `הקפיצה בסדרה חדשה של השותף מראה 18 נק' ומעלה ומחייבת עד משחק מלא. עם תמיכה של ${len[open]} קלפים בסדרת המייגור של השותף, הכריזו שם משחק מלא: ${bh('4' + open)}.`) }
      : { bid: '3N', why: L(
        `Partner's jump shift shows 18+ HCP and forces to game. With no major fit, bid game in no-trump: 3NT.`,
        `הקפיצה בסדרה חדשה של השותף מראה 18 נק' ומעלה ומחייבת עד משחק מלא. בלי התאמה בסדרת מייגור, הכריזו משחק מלא בללא שליט: 3NT.`) };
  }

  // A new, lower-ranking suit at the 2-level: not forcing, 12–17.
  if (rank(rz) > rank(open)) {
    if (len[rz] >= 4 && supportPoints(hand, rz) >= 11) return { bid: '3' + rz, why: L(
      `${supportText(hand, rz)} and ${len[rz]} ${name(rz)}: raise to ${bh('3' + rz)} to invite game.`,
      `${supportText(hand, rz)}, ו-${len[rz]} ${name(rz)}: תמכו ב-${bh('3' + rz)} כדי להזמין למשחק מלא.`) };
    if (inv) {
      if (len[open] >= 3) return { bid: '3' + open, why: L(
        `${strength} and ${len[open]} ${name(open)}: jump to ${bh('3' + open)} to invite game in partner's first suit.`,
        `${strength}, ו-${len[open]} ${name(open)}: קפצו ל-${bh('3' + open)} כדי להזמין למשחק מלא בסדרה הראשונה של השותף.`) };
      return { bid: '2N', why: L(`${strength} and no clear fit: bid 2NT to invite game.`, `${strength}, ובלי התאמה ברורה: הכריזו 2NT כדי להזמין למשחק מלא.`) };
    }
    if (len[you] >= 6 && len[open] <= 2 && len[rz] <= 3) {
      return { bid: '2' + you, why: L(
        `${strength}, no fit for partner and ${len[you]} ${name(you)}: rebid ${bh('2' + you)} to show 6+ cards and ask partner to pass.`,
        `${strength}, בלי התאמה לשותף ו-${len[you]} ${name(you)}: הכריזו ${bh('2' + you)} כדי להראות 6 קלפים ומעלה ולבקש מהשותף להכריז פאס.`) };
    }
    return prefersSecond(rz)
      ? { bid: 'P', why: L(
        `${strength}. Your ${len[rz]} ${name(rz)} make a longer fit than your ${len[open]} ${name(open)}, so pass and play in partner's second suit.`,
        `${strength}. ${len[rz]} ה${name(rz)} שלכם יוצרים התאמה ארוכה יותר מ-${len[open]} ה${name(open)}, ולכן פאס ושחקו בסדרה השנייה של השותף.`) }
      : { bid: '2' + open, why: L(
        `${strength}. ${firstFit(rz)} So give <em>preference</em> to partner's first suit: ${bh('2' + open)}. This shows no extra strength.`,
        `${strength}. ${firstFit(rz)} לכן תנו <em>העדפה</em> לסדרה הראשונה של השותף: ${bh('2' + open)}. זה לא מראה כוח נוסף.`) };
  }

  // Reverse: 16+ and forcing for one round.
  const certain = L(`Partner's reverse shows 16+, and your ${pts} HCP makes game certain.`, `הריברס של השותף מראה 16 ומעלה, ועם ${pts} הנקודות שלכם המשחק המלא ודאי.`);
  if (inv) {
    if (isMajor(rz) && len[rz] >= 4) return { bid: '4' + rz, why: L(`${certain} With 4 ${name(rz)}, bid ${bh('4' + rz)}.`, `${certain} עם 4 ${name(rz)}, הכריזו ${bh('4' + rz)}.`) };
    if (isMajor(open) && len[open] >= 3) return { bid: '4' + open, why: L(`${certain} With ${len[open]} ${name(open)}, bid ${bh('4' + open)}.`, `${certain} עם ${len[open]} ${name(open)}, הכריזו ${bh('4' + open)}.`) };
    return { bid: '3N', why: L(`${certain} With no major fit, bid 3NT.`, `${certain} בלי התאמה בסדרת מייגור, הכריזו 3NT.`) };
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
  if (rebid === '3N') return L('18+ HCP with a long, strong suit: game', '18 נק\' ומעלה עם סדרה ארוכה וחזקה: משחק מלא');
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
    `16 נק' ומעלה, עם 4 ${SUIT_NAME[rz]} ומעלה וסדרת ${SUIT_NAME[open]} ארוכה יותר: ריברס, מחייב לסיבוב אחד`);
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
  // Every hand shown so far, with the bid you chose (null until you answer); `pos` is the one on screen.
  const history = [];
  let pos = -1;
  let practiceIndex = 0, practiceBids = null;
  const current = () => history[pos];

  // Your own hands, in order, when the drill has any; otherwise a random deal.
  function nextDeal() {
    const list = practiceHands(practice);
    if (!list.length) return generate();
    practiceBids = practiceBids || practiceGrid(bids, list);
    const i = practiceIndex++ % list.length;
    return practiceDeal(list[i], i + 1, list.length, practiceBids);
  }
  const $ = id => document.getElementById(`${prefix}-${id}`);

  // Go forward: to the next hand you've already seen, or to a new one.
  function next() {
    if (pos === history.length - 1) history.push({ deal: nextDeal(), chosen: null });
    pos++;
    show();
  }

  function prev() {
    if (pos > 0) { pos--; show(); }
  }

  // Always a new hand, even when you're looking at an earlier one (e.g. after changing the convention).
  function newHand() {
    pos = history.length - 1;
    next();
  }

  // Draw the current hand; a hand you already answered comes back with its answer shown.
  function show() {
    const { deal, chosen } = current();
    const area = $('hand');
    area.innerHTML = '';
    renderFan(area, deal.hand);
    const context = $('context');
    if (context) {
      context.innerHTML = deal.context || '';
      context.hidden = !deal.context;
    }
    $('hcp').textContent = hcpText(hcp(deal.hand));
    $('prev').disabled = pos === 0;
    if (chosen) {
      showResult();
    } else {
      $('hcp').hidden = !$('show-hcp').checked;
      $('feedback').className = 'feedback';
      $('feedback').innerHTML = '';
      $('next').hidden = true;
      renderBids();
    }
  }

  function renderBids() {
    const { deal, chosen } = current();
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
      if (chosen) {
        btn.disabled = true;
        if (bid === deal.answer.bid) btn.classList.add('correct');
        else if (bid === chosen) btn.classList.add('wrong');
      }
      btn.addEventListener('click', () => choose(bid));
      box.appendChild(btn);
    }
  }

  function choose(bid) {
    const entry = current();
    if (entry.chosen) return;
    entry.chosen = bid;
    const correct = bid === entry.deal.answer.bid;
    record(stats, correct);
    if (correct) Sound.correct();
    $('stats').textContent = statsText(stats);
    showResult();
    $('next').focus({ preventScroll: true });
  }

  function showResult() {
    const { deal, chosen } = current();
    const correct = chosen === deal.answer.bid;
    renderBids();
    $('hcp').hidden = false;
    $('feedback').className = 'feedback ' + (correct ? 'good' : 'bad');
    $('feedback').innerHTML =
      `<strong>${correct ? L('Correct!', 'נכון!') : L(`The suggested bid is ${bh(deal.answer.bid)}.`, `ההכרזה המומלצת היא ${bh(deal.answer.bid)}.`)}</strong>` +
      `<div>${deal.answer.why}</div>`;
    $('next').hidden = false;
  }

  function init() {
    $('next').addEventListener('click', next);
    $('prev').addEventListener('click', prev);
    $('show-hcp').addEventListener('change', e => { if (!current().chosen) $('hcp').hidden = !e.target.checked; });
    $('stats').textContent = statsText(stats);
    next();
  }

  return { init, next: newHand };
}

// Bids are listed in auction order, so comparing indexes tells whether a bid is higher.
const ALL_BIDS = ['P', '1C', '1D', '1H', '1S', '1N', '2C', '2D', '2H', '2S', '2N', '3C', '3D', '3H', '3S'];

const OpeningTrainer = makeBidDrill({
  prefix: 'open',
  practice: 'opening',
  bids: [...ALL_BIDS, '4C', '4D', '4H', '4S'], // 4-level preempts with an 8-card suit
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
    } while (hcp(hand) > 12 || answer.gameForce || (answer.bid === 'P' && Math.random() < 0.7));
    const openIndex = ALL_BIDS.indexOf('1' + open);
    return {
      hand,
      answer,
      context: L(
        `Partner opens <strong>${bh('1' + open)}</strong>. The opponents pass. What do you respond?`,
        `השותף פותח <strong>${bh('1' + open)}</strong>. היריבים מכריזים פאס. מה תשיבו?`),
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
      const response = responseBid(partner, open), resp = response.bid;
      if (response.gameForce || resp === 'P' || resp === '2N') continue;
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
      const response = responseBid(hand, open), resp = response.bid;
      if (response.gameForce) continue;
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
