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
    return { card: c, why: L(`You only hold trumps, so lead your lowest: ${lbl(c)}.`, `יש לכם רק שליטים, ולכן הובילו את הנמוך ביותר: ${lbl(c)}.`) };
  }

  if (!trump) {
    const seq = sides.filter(s => touching(groups[s], 3));
    if (seq.length) {
      const c = groups[pick(seq, longest)][0];
      return { card: c, why: L(
        `Against no-trump, lead the top of a three-card sequence: ${lbl(c)}. It pushes out declarer's higher cards without giving away a trick.`,
        `נגד ללא שליט, הובילו את העליון ברצף של שלושה קלפים: ${lbl(c)}. הוא מוציא את הקלפים הגבוהים של הכרוז בלי למסור לו לקיחה.`) };
    }
    const s = pick(sides, longest);
    const c = groups[s][3];
    return { card: c, why: L(
      `Against no-trump, lead your longest and strongest suit, ${SUIT_NAME[s]}, and lead the fourth-highest card in it (<em>fourth best</em>): ${lbl(c)}. Once the high cards are gone, your remaining small cards in the suit become winners.`,
      `נגד ללא שליט, הובילו מהסדרה הארוכה והחזקה ביותר שלכם, ${SUIT_NAME[s]}, את הקלף <em>הרביעי מלמעלה</em>: ${lbl(c)}. אחרי שהקלפים הגבוהים ייצאו, הקלפים הקטנים שנשארו לכם בסדרה יהפכו לזוכים.`) };
  }

  const trumps = groups[trump].length;
  const ak = sides.filter(s => groups[s].length >= 2 && groups[s][0].rank === 'A' && groups[s][1].rank === 'K');
  if (ak.length) {
    const c = groups[pick(ak, longest)][0];
    return { card: c, why: L(
      `Against a suit contract, lead the ace from ace-king: ${lbl(c)}. You win the trick, see dummy, and still hold the king.`,
      `נגד חוזה בשליט, הובילו את האס מתוך אס-מלך: ${lbl(c)}. אתם זוכים בלקיחה, רואים את הדומם, והמלך עדיין בידכם.`) };
  }
  const seq = sides.filter(s => groups[s][0].rank !== 'A' && touching(groups[s], 2));
  if (seq.length) {
    const c = groups[pick(seq, (a, b) => groups[b][0].value - groups[a][0].value)][0];
    return { card: c, why: L(
      `Lead the top of touching honors: ${lbl(c)}. It's safe because it can't give declarer a cheap trick, and it helps set up a trick for your side.`,
      `הובילו את העליון מבין הונורים צמודים: ${lbl(c)}. זו הובלה בטוחה, כי היא לא יכולה לתת לכרוז לקיחה זולה, והיא עוזרת לפתח לקיחה לצד שלכם.`) };
  }
  const single = sides.filter(s => groups[s].length === 1 && groups[s][0].value <= 10);
  if (single.length && trumps >= 2) {
    const c = groups[single[0]][0];
    return { card: c, why: L(
      `Lead your singleton ${lbl(c)}. When the suit is played again you'll be out of it, and you can ruff with one of your ${trumps} trumps.`,
      `הובילו את הסינגלטון ${lbl(c)}. כשהסדרה תשוחק שוב, כבר לא יהיו לכם קלפים בה, ותוכלו לחתוך באחד מ-${trumps} השליטים שלכם.`) };
  }
  const dbl = sides.filter(s => groups[s].length === 2 && groups[s][0].value <= 10);
  if (dbl.length && trumps >= 1) {
    const c = groups[dbl[0]][0];
    return { card: c, why: L(
      `Lead the top of a small doubleton: ${lbl(c)}. If partner wins and plays the suit back, you may get to ruff the third round.`,
      `הובילו את העליון מדאבלטון קטן: ${lbl(c)}. אם השותף יזכה ויחזיר את הסדרה, ייתכן שתוכלו לחתוך בסיבוב השלישי.`) };
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
          ? L(`Lead fourth best from your longest suit headed by an honor: ${lbl(c)}. Leading low keeps your honor to capture one of declarer's cards later.`,
            `הובילו את הרביעי מלמעלה מהסדרה הארוכה שלכם שבראשה הונור: ${lbl(c)}. הובלה נמוכה שומרת את ההונור כדי לתפוס אחד מהקלפים של הכרוז בהמשך.`)
          : L(`Lead low from three cards headed by an honor: ${lbl(c)}. Your honor stays behind to win a trick later.`,
            `הובילו נמוך משלושה קלפים שבראשם הונור: ${lbl(c)}. ההונור נשאר אצלכם כדי לזכות בלקיחה בהמשך.`),
      };
    }
    if (g.length >= 4) {
      return { card: g[1], why: L(
        `Your longest safe suit has no honors. From four or more small cards, lead the second-highest: ${lbl(g[1])}. A high spot card tells partner you have nothing worth leading low from.`,
        `בסדרה הבטוחה הארוכה שלכם אין הונורים. מתוך ארבעה קלפים קטנים ומעלה, הובילו את השני מלמעלה: ${lbl(g[1])}. קלף גבוה יחסית אומר לשותף שאין לכם בסדרה משהו ששווה להוביל ממנו נמוך.`) };
    }
    return { card: g[0], why: L(
      `Your longest safe suit has no honors, so lead the top card to tell partner you have nothing there (<em>top of nothing</em>): ${lbl(g[0])}.`,
      `בסדרה הבטוחה הארוכה שלכם אין הונורים, ולכן הובילו את הקלף העליון כדי לומר לשותף שאין לכם שם כלום (<em>עליון מכלום</em>): ${lbl(g[0])}.`) };
  }
  if (trumps >= 2 && groups[trump][0].value <= 10) {
    const c = groups[trump][trumps - 1];
    return { card: c, why: L(
      `Every side suit is dangerous to lead from: it would give away an ace or an honor. A small trump is the safe lead: ${lbl(c)}.`,
      `כל סדרה צדדית מסוכנת להובלה: היא הייתה מוסרת אס או הונור. שליט קטן הוא ההובלה הבטוחה: ${lbl(c)}.`) };
  }
  const aces = sides.filter(s => groups[s][0].rank === 'A');
  if (aces.length) {
    const c = groups[pick(aces, longest)][0];
    return { card: c, why: L(
      `Against a suit contract, never lead low from a suit headed by the ace: declarer's king could win the trick and your ace might later be ruffed. With no better choice, lead the ace itself: ${lbl(c)}.`,
      `נגד חוזה בשליט, אל תובילו נמוך מסדרה שבראשה אס: המלך של הכרוז עלול לזכות, והאס שלכם עלול להיחתך מאוחר יותר. כשאין ברירה טובה יותר, הובילו את האס עצמו: ${lbl(c)}.`) };
  }
  const s = pick(sides, longest);
  const c = groups[s][groups[s].length - 1];
  return { card: c, why: L(
    `There's no attractive lead, so lead low from your longest side suit: ${lbl(c)}.`,
    `אין הובלה אטרקטיבית, ולכן הובילו נמוך מהסדרה הצדדית הארוכה שלכם: ${lbl(c)}.`) };
}

const LeadTrainer = (() => {
  const stats = makeStats();
  let hand, contract, answer, answered, item = null, practiceIndex = 0;
  const $ = id => document.getElementById(id);
  const AUCTION_COLUMNS = [3, 0, 1, 2]; // West, North, East, South

  function next() {
    const list = practiceHands('openingLeads');
    if (list.length) {
      const i = practiceIndex++ % list.length;
      item = list[i];
      hand = parseHand(item.hands[item.leader]);
      const strain = item.contract[1];
      const card = hand.find(c => c.suit === item.answer[0] && c.rank === item.answer[1]);
      const textbook = openingLead(hand, strain === 'N' ? null : strain);
      answer = { card, why: practiceText(item.why) || (textbook.card === card ? textbook.why : '') };
      $('lead-context').innerHTML = practiceCounter(i + 1, list.length) + practiceContext(item);
    } else {
      item = null;
      ({ hands: [, , , hand], contract } = Play.dealTable());
      answer = openingLead(hand, contract.strain === 'N' ? null : contract.strain);
      const bid = bidHtml(contract.level + contract.strain);
      $('lead-context').innerHTML = L(
        `South is declarer in <strong>${bid}</strong> (${trumpText(contract.strain)}). You are West, so you make the opening lead. Click the card you would lead.`,
        `דרום הוא הכרוז בחוזה <strong>${bid}</strong> (${trumpText(contract.strain)}). אתם במערב, ולכן אתם מבצעים את הובלת הפתיחה. לחצו על הקלף שהייתם מובילים.`);
    }
    answered = false;
    $('lead-feedback').className = 'feedback';
    $('lead-feedback').innerHTML = '';
    $('lead-deal').innerHTML = '';
    $('lead-next').hidden = true;
    renderHand();
  }

  // One of your hands from practice/opening-leads.txt: the note, the auction and the contract.
  function practiceContext(it) {
    const cells = [...Array(AUCTION_COLUMNS.indexOf(it.dealer)).fill(''), ...it.auction];
    const rows = [];
    for (let i = 0; i < cells.length; i += 4) rows.push([...cells.slice(i, i + 4), '', '', ''].slice(0, 4));
    const bid = bidHtml(it.contract) + [L('', ''), L(' doubled', ' בדאבל'), L(' redoubled', ' ברידאבל')][it.doubled];
    const declarer = SEAT_NAMES[it.declarer], you = SEAT_NAMES[it.leader];
    const note = practiceText(it.note);
    return (note ? `<div>${note}</div>` : '') + auctionHtml(AUCTION_COLUMNS.map(s => SEAT_NAMES[s]), rows, L(
      `${declarer} is declarer in <strong>${bid}</strong> (${trumpText(it.contract[1])}). You are ${you}, on declarer's left, so you make the opening lead. Click the card you would lead.`,
      `${declarer} הוא הכרוז בחוזה <strong>${bid}</strong> (${trumpText(it.contract[1])}). אתם ב${you}, משמאל לכרוז, ולכן אתם מבצעים את הובלת הפתיחה. לחצו על הקלף שהייתם מובילים.`));
  }

  // After the lead: all four hands of one of your deals.
  function renderDeal() {
    const box = $('lead-deal');
    box.innerHTML = `
      <div class="lead-deal-title">${L('The full deal', 'החלוקה המלאה')}</div>
      <div class="table puzzle-table deal-table">
        ${[0, 3, 1, 2].map(s => `<div class="seat ${['north', 'east', 'south', 'west'][s]}" data-seat="${s}"></div>`).join('')}
        <div class="deal-center">${bidHtml(item.contract)}<br>${L(`by ${SEAT_NAMES[item.declarer]}`, `הכרוז: ${SEAT_NAMES[item.declarer]}`)}</div>
      </div>`;
    item.hands.forEach((spec, s) => {
      const el = box.querySelector(`[data-seat="${s}"]`);
      const role = s === item.declarer ? L(' (declarer)', ' (כרוז)') : s === item.leader ? L(' (you)', ' (אתם)') : '';
      el.innerHTML = `<div class="seat-label"><strong>${SEAT_NAMES[s]}</strong>${role}</div>`;
      renderSuitRows(el, parseHand(spec));
    });
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
    if (correct) Sound.correct();
    renderHand(card);
    let verdict = L('Correct!', 'נכון!');
    if (!correct) {
      const best = cardHtml(answer.card);
      verdict = card.suit === answer.card.suit
        ? L(`Right suit, but the textbook card is ${best}.`, `הסדרה נכונה, אבל הקלף לפי הספר הוא ${best}.`)
        : L(`The textbook lead is ${best}.`, `ההובלה לפי הספר היא ${best}.`);
    }
    $('lead-feedback').className = 'feedback ' + (correct ? 'good' : 'bad');
    $('lead-feedback').innerHTML = `<strong>${verdict}</strong>${answer.why ? `<div>${answer.why}</div>` : ''}`;
    $('lead-stats').textContent = statsText(stats);
    if (item) renderDeal();
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
