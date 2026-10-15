// Card-play puzzles: hand-built endings where all four hands are shown, you play North and South,
// and the defenders play perfectly using a small exhaustive (double-dummy) solver.
// This file holds the solver, the reusable puzzle player and the Advanced (squeeze/endplay) content;
// js/declarer.js holds the basic declarer-play content.

// ---------- Double-dummy solver for small endings ----------

function trickWinnerOf(trick, trump) {
  let best = trick[0];
  for (const t of trick.slice(1)) {
    const a = t.card, b = best.card;
    if ((a.suit === b.suit && a.value > b.value) || (a.suit === trump && b.suit !== trump)) best = t;
  }
  return best.seat;
}

function legalOf(hand, trick) {
  if (!trick.length) return hand;
  const follow = hand.filter(c => c.suit === trick[0].card.suit);
  return follow.length ? follow : hand;
}

// Returns helpers that count how many of the remaining tricks North-South take with best play by both sides.
function makeSolver(trump) {
  const memo = new Map();
  const key = (hands, turn) => hands.map(h => h.map(c => c.suit + c.rank).join('')).join('|') + turn;

  function search(hands, trick, turn) {
    if (trick.length) return explore(hands, trick, turn);
    if (!hands[turn].length) return 0;
    const k = key(hands, turn);
    if (!memo.has(k)) memo.set(k, explore(hands, trick, turn));
    return memo.get(k);
  }

  function explore(hands, trick, turn) {
    const ns = turn % 2 === 0;
    let best = ns ? -1 : Infinity;
    for (const card of legalOf(hands[turn], trick)) {
      const v = after(hands, trick, turn, card);
      if (ns ? v > best : v < best) best = v;
    }
    return best;
  }

  // North-South tricks from here on (including the current trick) after `turn` plays `card`.
  function after(hands, trick, turn, card) {
    const next = hands.map((h, i) => (i === turn ? h.filter(c => c !== card) : h));
    const played = [...trick, { seat: turn, card }];
    if (played.length === 4) {
      const w = trickWinnerOf(played, trump);
      return (w % 2 === 0 ? 1 : 0) + search(next, [], w);
    }
    return search(next, played, (turn + 1) % 4);
  }

  return { search, after };
}

// 'H:AJ D:Q' -> sorted cards
function parseHand(spec) {
  const cards = [];
  for (const part of spec.split(' ')) {
    const [suit, ranks] = part.split(':');
    for (const rank of ranks) cards.push({ suit, rank, value: RANKS.indexOf(rank) + 2 });
  }
  return sortHand(cards);
}

// ---------- Content ----------

const ADVANCED_TOPICS = {
  squeeze: {
    label: 'Squeezes',
    intro: `
      <p>A <strong>squeeze</strong> wins a trick from nothing. You cash a winner, and a defender who is guarding two suits has to discard. Whichever guard they throw away, one of your cards becomes a winner.</p>
      <p>A squeeze needs four things:</p>
      <ul>
        <li><strong>Two threats.</strong> A <em>threat</em> is a card that would win if its suit's guard disappeared: your ♥J when the defender holds ♥K-Q, or your ♦Q when the defender holds the ♦K.</li>
        <li><strong>One defender guarding both threats.</strong> That defender is the <em>victim</em>.</li>
        <li><strong>The count.</strong> You must be able to win all the remaining tricks but one before the squeeze starts. If you have two losers, give one up first (<em>rectifying the count</em>), so the victim has no spare card to throw.</li>
        <li><strong>Entries.</strong> After the victim discards, you must still be able to reach the threat that has become a winner. Usually one threat comes with its own winner, such as ♥A-J.</li>
      </ul>
      <p>The last winner you cash is the <strong>squeeze card</strong>. A <em>positional</em> squeeze only works against the defender who discards <em>before</em> the hand holding the threats. An <em>automatic</em> squeeze works against either defender, because the hand opposite the squeeze card has a spare card to throw.</p>
      <p>The rule of thumb is: <strong>cash your winners in the other suits first and keep the threats</strong>. Then watch what the victim throws.</p>`,
    puzzles: [
      {
        title: 'The simple squeeze',
        trump: null, leader: 2, target: 3,
        hands: ['H:AJ D:Q', 'C:987', 'C:A2 H:3', 'H:KQ D:K'],
        idea: 'West guards both red suits on their own. Can you make West choose?',
        solution: `<p>Lead the <strong>♣A</strong>, the squeeze card, first. West has to discard before North:</p>
          <ul><li>If West throws the ♦K, North keeps the ♦Q (now a winner) and throws the ♥J. Cross to the ♥A and cash the ♦Q.</li>
          <li>If West throws a heart, North throws the ♦Q. Lead the ♥3 to the ♥A, dropping West's last honor, and the ♥J wins.</li></ul>
          <p>Playing hearts first fails: West keeps a guard in each suit and wins the last trick. This squeeze is <em>positional</em>: it works because West discards before North.</p>`,
      },
      {
        title: 'The automatic squeeze',
        trump: null, leader: 2, target: 3,
        hands: ['H:AJ S:2', 'H:KQ D:K', 'C:A D:Q H:3', 'C:987'],
        idea: 'This time it\'s East who guards both red suits, and East plays after North.',
        solution: `<p>Lead the <strong>♣A</strong>. North has an idle card to throw (the ♠2), so it keeps both the ♥A-J and the link to South. Then East must discard:</p>
          <ul><li>If East throws the ♦K, cash South's ♦Q (North throws the ♥J), then cross to the ♥A.</li>
          <li>If East throws a heart, lead the ♥3 to the ♥A. East's honor falls and the ♥J wins.</li></ul>
          <p>This squeeze is <em>automatic</em>: North's spare card means it would work against either defender.</p>`,
      },
      {
        title: 'Cash everything first',
        trump: null, leader: 2, target: 5,
        hands: ['H:AJ D:Q S:32', 'C:98765', 'C:AKQ H:3 S:4', 'H:KQ D:K S:JT'],
        idea: 'You need every trick. West has some spare spades to throw. What happens when they run out?',
        solution: `<p>Cash the <strong>♣A, ♣K and ♣Q</strong>, keeping North's ♥A-J and ♦Q. North throws its two small spades.
          West can throw two spades, but on the third club West has run out of spare cards and must give up a red-suit guard. Finish as in the simple squeeze.</p>
          <p>Touching hearts or diamonds early lets West keep a guard in each suit. Run your long suit first and let the defender do the discarding.</p>`,
      },
      {
        title: 'Rectifying the count',
        trump: null, leader: 2, target: 3,
        hands: ['H:AJ D:Q S:3', 'S:A C:987', 'C:A2 H:3 S:2', 'H:KQ D:K S:9'],
        idea: 'You need three of the last four tricks, and you have a spade loser. Should you cash the ♣A now, or lose the spade first?',
        solution: `<p>Lose the spade <strong>first</strong>: lead the ♠2. East wins the ♠A and has only clubs left to return. Your ♣A now squeezes West, who no longer has the ♠9 as a spare card.</p>
          <p>If you cash the ♣A straight away, West simply throws the ♠9 and keeps both red guards. A squeeze only works when you can win all the remaining tricks but one. Giving up your spare loser early to reach that point is called <em>rectifying the count</em>.</p>`,
      },
    ],
  },
  endplay: {
    label: 'Endplays',
    intro: `
      <p>An <strong>endplay</strong> (or <em>throw-in</em>) puts a defender on lead when every card they can lead helps you. It's the answer when a finesse is likely to lose.</p>
      <p>The usual pattern is <strong>strip and throw in</strong>:</p>
      <ol>
        <li><strong>Strip:</strong> cash or ruff out the side suits, so the defender has no safe card to lead.</li>
        <li><strong>Throw in:</strong> give the defender a trick they're forced to win.</li>
        <li><strong>Collect:</strong> now they must lead into your tenace (such as A-Q, which is worth two tricks if the suit is led <em>to</em> it), or give you a <em>ruff-sluff</em>.</li>
      </ol>
      <p>A <strong>ruff-sluff</strong> happens when a defender leads a suit that both of your hands are void in. You ruff in one hand and throw a loser from the other (the "sluff"). That's why, in a trump contract, you keep a trump in <em>both</em> hands for the endplay.</p>
      <p>Do it in the right order. If you cash your last winner in a side suit too early, the defender may get rid of the card you planned to throw them in with (<em>unblocking</em>), or keep a safe card to lead.</p>`,
    puzzles: [
      {
        title: 'The basic throw-in',
        trump: 'S', leader: 2, target: 3,
        hands: ['S:2 H:3 D:AQ', 'H:A D:K76', 'S:3 H:2 D:43', 'H:KQJ D:J'],
        idea: 'The ♦K sits behind dummy\'s A-Q, so a finesse loses. Can you make East lead diamonds for you?',
        solution: `<p>Lead the <strong>♥2</strong>. East's only heart is the ace, so East must win. Now East has only diamonds left and must lead one <em>into</em> North's ♦A-Q.
          North wins the queen, cashes the ace, and your last trump takes the final trick.</p>
          <p>Taking the diamond finesse yourself loses to the king, and you end up with only two tricks.</p>`,
      },
      {
        title: 'Strip first',
        trump: 'S', leader: 2, target: 4,
        hands: ['S:2 H:3 D:AQ C:A', 'H:A D:K76 C:5', 'S:3 H:2 D:43 C:2', 'H:KQJ D:J C:9'],
        idea: 'Same idea, but now East has a club to exit with. Take that escape away first.',
        solution: `<p>First <strong>strip the clubs</strong>: lead the ♣2 to North's ♣A. Then throw East in with the <strong>♥3</strong>. East wins the ♥A with only diamonds left, and must lead one into the ♦A-Q.</p>
          <p>If you throw East in before cashing the ♣A, East exits safely with the ♣5 and you still have to lose a diamond to the king.</p>`,
      },
      {
        title: 'Throw-in at no-trump',
        trump: null, leader: 2, target: 3,
        hands: ['H:2 C:432', 'H:K D:JT9', 'H:3 S:AQ C:A', 'H:A S:K98'],
        idea: 'West has the ♠K, and your A-Q is in the South hand, so a finesse from North would lose. West also has the ♥A as a lone card…',
        solution: `<p>Lead the <strong>♥3 straight away</strong>. West must win the bare ♥A and then lead a spade into your ♠A-Q. You also keep the ♣A, so you take the last three tricks.</p>
          <p>If you cash the ♣A first, West can throw away the ♥A (<em>unblocking</em>). Then East wins the heart and leads a diamond, and you must give up a spade trick.
          Make the throw-in before the defender gets a chance to discard the exit card.</p>`,
      },
      {
        title: 'Throw-in with a trump',
        trump: 'S', leader: 2, target: 3,
        hands: ['S:2 H:A D:3 C:2', 'H:KQJ C:A', 'S:J H:2 D:AQ', 'S:Q D:K54'],
        idea: 'West holds the last trump, the ♠Q, and the ♦K sits over your ♦A-Q. Leading diamonds yourself loses to the king.',
        solution: `<p>Use the trump as the throw-in card: lead the <strong>♠J</strong>. West must win the ♠Q and then has only diamonds left, so West has to lead into your ♦A-Q.
          Take the queen and the ace, then cross to North's ♥A for the last trick.</p>
          <p>Cashing the ♥A or ♦A first does no harm, as long as you throw West in with the trump before touching the ♦Q.
          Leading the ♦Q yourself lets West win the king, and West's ♠Q still takes a trick, so you'd end up with only two.</p>`,
      },
    ],
  },
};

// Hebrew text for the puzzles above; the hands and targets are shared.
const ADVANCED_HE = {
  squeeze: {
    intro: `
      <p><strong>לחיצה</strong> (סקוויז) מייצרת לקיחה יש מאין. אתם מממשים זוכה, ומגן ששומר על שתי סדרות נאלץ להשליך. על איזו שמירה שלא יוותר, אחד הקלפים שלכם הופך לזוכה.</p>
      <p>לחיצה צריכה ארבעה דברים:</p>
      <ul>
        <li><strong>שני איומים.</strong> <em>איום</em> הוא קלף שהיה זוכה אילו השמירה בסדרה שלו הייתה נעלמת: ה-♥J שלכם כשלמגן יש ♥K-Q, או ה-♦Q שלכם כשלמגן יש את ה-♦K.</li>
        <li><strong>מגן אחד ששומר על שני האיומים.</strong> המגן הזה הוא <em>הקורבן</em>.</li>
        <li><strong>הספירה.</strong> לפני שהלחיצה מתחילה, אתם צריכים להיות מסוגלים לזכות בכל הלקיחות שנשארו פרט לאחת. אם יש לכם שני מפסידים, מסרו אחד קודם (<em>תיקון הספירה</em>), כדי שלקורבן לא יהיה קלף מיותר להשליך.</li>
        <li><strong>כניסות.</strong> אחרי שהקורבן משליך, אתם עדיין צריכים להגיע לאיום שהפך לזוכה. בדרך כלל לאחד האיומים יש זוכה משלו, כמו ♥A-J.</li>
      </ul>
      <p>הזוכה האחרון שאתם מממשים הוא <strong>קלף הלחיצה</strong>. לחיצה <em>פוזיציונית</em> עובדת רק נגד המגן שמשליך <em>לפני</em> היד שמחזיקה את האיומים. לחיצה <em>אוטומטית</em> עובדת נגד כל אחד מהמגינים, כי ליד שמול קלף הלחיצה יש קלף מיותר להשליך.</p>
      <p>כלל האצבע: <strong>ממשו קודם את הזוכים בסדרות האחרות, ושמרו את האיומים</strong>. אחר כך הסתכלו מה הקורבן משליך.</p>`,
    puzzles: [
      {
        title: 'הלחיצה הפשוטה',
        idea: 'מערב לבדו שומר על שתי הסדרות האדומות. תוכלו לאלץ אותו לבחור?',
        solution: `<p>הובילו ראשון את <strong>♣A</strong>, קלף הלחיצה. מערב חייב להשליך לפני צפון:</p>
          <ul><li>אם מערב משליך את ה-♦K, צפון שומר את ה-♦Q (שהפכה לזוכה) ומשליך את ה-♥J. עברו ל-♥A וממשו את ה-♦Q.</li>
          <li>אם מערב משליך לב, צפון משליך את ה-♦Q. הובילו את ה-♥3 ל-♥A, ההונור האחרון של מערב נופל, וה-♥J זוכה.</li></ul>
          <p>משחק לבבות קודם נכשל: מערב שומר שמירה בכל סדרה וזוכה בלקיחה האחרונה. הלחיצה הזו <em>פוזיציונית</em>: היא עובדת כי מערב משליך לפני צפון.</p>`,
      },
      {
        title: 'הלחיצה האוטומטית',
        idea: 'הפעם מזרח שומר על שתי הסדרות האדומות, והוא משחק אחרי צפון.',
        solution: `<p>הובילו את <strong>♣A</strong>. לצפון יש קלף מיותר להשליך (ה-♠2), כך שהוא שומר גם את ה-♥A-J וגם את הקשר לדרום. עכשיו מזרח חייב להשליך:</p>
          <ul><li>אם מזרח משליך את ה-♦K, ממשו את ה-♦Q של דרום (צפון משליך את ה-♥J), ואז עברו ל-♥A.</li>
          <li>אם מזרח משליך לב, הובילו את ה-♥3 ל-♥A. ההונור של מזרח נופל וה-♥J זוכה.</li></ul>
          <p>הלחיצה הזו <em>אוטומטית</em>: בזכות הקלף המיותר של צפון היא הייתה עובדת נגד כל אחד מהמגינים.</p>`,
      },
      {
        title: 'ממשו הכול קודם',
        idea: 'אתם צריכים את כל הלקיחות. למערב יש כמה עלים מיותרים להשליך. מה יקרה כשהם ייגמרו?',
        solution: `<p>ממשו את <strong>♣A, ♣K ו-♣Q</strong>, ושמרו בצפון את ה-♥A-J ואת ה-♦Q. צפון משליך את שני העלים הקטנים שלו.
          מערב יכול להשליך שני עלים, אבל על התלתן השלישי כבר אין לו קלפים מיותרים, והוא חייב לוותר על שמירה באחת הסדרות האדומות. סיימו כמו בלחיצה הפשוטה.</p>
          <p>נגיעה מוקדמת בלבבות או ביהלומים מאפשרת למערב לשמור שמירה בכל סדרה. הריצו קודם את הסדרה הארוכה, ותנו למגן להשליך.</p>`,
      },
      {
        title: 'תיקון הספירה',
        idea: 'אתם צריכים שלוש מתוך ארבע הלקיחות האחרונות, ויש לכם מפסיד בעלים. לממש עכשיו את ה-♣A, או למסור קודם את העלה?',
        solution: `<p>מסרו את העלה <strong>קודם</strong>: הובילו את ה-♠2. מזרח זוכה ב-♠A ונשארו לו רק תלתנים להחזיר. עכשיו ה-♣A שלכם לוחץ את מערב, שכבר אין לו את ה-♠9 כקלף מיותר.</p>
          <p>אם תממשו את ה-♣A מיד, מערב פשוט ישליך את ה-♠9 וישמור את שתי השמירות האדומות. לחיצה עובדת רק כשאתם יכולים לזכות בכל הלקיחות שנשארו פרט לאחת. מסירת המפסיד המיותר מוקדם כדי להגיע למצב הזה נקראת <em>תיקון הספירה</em>.</p>`,
      },
    ],
  },
  endplay: {
    intro: `
      <p><strong>משחק סיום</strong> (אנדפליי, או <em>הכנסה</em>) מכניס מגן להובלה כשכל קלף שהוא יכול להוביל עוזר לכם. זה הפתרון כשעקיפה צפויה להיכשל.</p>
      <p>הדפוס הנפוץ הוא <strong>ניקוי והכנסה</strong>:</p>
      <ol>
        <li><strong>ניקוי:</strong> ממשו או חתכו את הסדרות הצדדיות, כך שלמגן לא יישאר קלף בטוח להוביל.</li>
        <li><strong>הכנסה:</strong> תנו למגן לקיחה שהוא חייב לזכות בה.</li>
        <li><strong>איסוף:</strong> עכשיו הוא חייב להוביל לתוך המזלג שלכם (כמו A-Q, ששווה שתי לקיחות כשמובילים <em>אליו</em>), או לתת לכם <em>חיתוך והשלכה</em>.</li>
      </ol>
      <p><strong>חיתוך והשלכה</strong> קורה כשמגן מוביל סדרה ששתי הידיים שלכם ריקות בה. חותכים ביד אחת ומשליכים מפסיד מהיד השנייה. לכן, בחוזה בשליט, שומרים שליט <em>בשתי</em> הידיים לקראת משחק הסיום.</p>
      <p>הסדר חשוב. אם תממשו מוקדם מדי את הזוכה האחרון בסדרה צדדית, המגן עלול להיפטר מהקלף שתכננתם להכניס אותו איתו (<em>שחרור</em>), או לשמור קלף בטוח להוביל.</p>`,
    puzzles: [
      {
        title: 'הכנסה בסיסית',
        idea: 'ה-♦K יושב מאחורי ה-A-Q של הדומם, ולכן עקיפה נכשלת. תוכלו לגרום למזרח להוביל לכם יהלומים?',
        solution: `<p>הובילו את ה-<strong>♥2</strong>. הלב היחיד של מזרח הוא האס, ולכן מזרח חייב לזכות. עכשיו נשארו למזרח רק יהלומים, והוא חייב להוביל יהלום <em>לתוך</em> ה-♦A-Q של צפון.
          צפון זוכה במלכה, מממש את האס, והשליט האחרון שלכם לוקח את הלקיחה האחרונה.</p>
          <p>אם תעקפו ביהלומים בעצמכם, תפסידו למלך ותסיימו עם שתי לקיחות בלבד.</p>`,
      },
      {
        title: 'קודם ניקוי',
        idea: 'אותו רעיון, אבל עכשיו למזרח יש תלתן לצאת איתו. קחו ממנו קודם את דרך המילוט.',
        solution: `<p>קודם <strong>נקו את התלתנים</strong>: הובילו את ה-♣2 ל-♣A של צפון. אחר כך הכניסו את מזרח עם ה-<strong>♥3</strong>. מזרח זוכה ב-♥A כשנשארו לו רק יהלומים, והוא חייב להוביל יהלום לתוך ה-♦A-Q.</p>
          <p>אם תכניסו את מזרח לפני שמימשתם את ה-♣A, מזרח ייצא בבטחה עם ה-♣5, ועדיין תפסידו יהלום למלך.</p>`,
      },
      {
        title: 'הכנסה בללא שליט',
        idea: 'למערב יש את ה-♠K, וה-A-Q שלכם ביד של דרום, כך שעקיפה מצפון הייתה נכשלת. למערב יש גם את ה-♥A כקלף בודד…',
        solution: `<p>הובילו את ה-<strong>♥3 מיד</strong>. מערב חייב לזכות ב-♥A הבודד, ואז להוביל עלה לתוך ה-♠A-Q שלכם. ה-♣A נשאר אצלכם, כך שאתם לוקחים את שלוש הלקיחות האחרונות.</p>
          <p>אם תממשו קודם את ה-♣A, מערב יכול להשליך את ה-♥A (<em>שחרור</em>). אז מזרח זוכה בלב ומוביל יהלום, ואתם חייבים למסור לקיחה בעלים.
          בצעו את ההכנסה לפני שהמגן מקבל הזדמנות להשליך את קלף היציאה.</p>`,
      },
      {
        title: 'הכנסה עם שליט',
        idea: 'למערב יש את השליט האחרון, ה-♠Q, וה-♦K יושב מעל ה-♦A-Q שלכם. הובלת יהלומים בעצמכם מפסידה למלך.',
        solution: `<p>השתמשו בשליט כקלף ההכנסה: הובילו את ה-<strong>♠J</strong>. מערב חייב לזכות ב-♠Q, ואז נשארו לו רק יהלומים, כך שהוא חייב להוביל לתוך ה-♦A-Q שלכם.
          קחו את המלכה ואת האס, ואז עברו ל-♥A של צפון ללקיחה האחרונה.</p>
          <p>מימוש ה-♥A או ה-♦A קודם לא מזיק, כל עוד אתם מכניסים את מערב עם השליט לפני שאתם נוגעים ב-♦Q.
          אם תובילו את ה-♦Q בעצמכם, מערב יזכה במלך, וה-♠Q של מערב עדיין ייקח לקיחה, כך שתסיימו עם שתיים בלבד.</p>`,
      },
    ],
  },
};

// In Hebrew, swap in the Hebrew intro and puzzle text; the hands stay the same.
function localizeTopics(topics, he) {
  if (LANG !== 'he') return topics;
  for (const [key, t] of Object.entries(he)) {
    topics[key].intro = t.intro;
    t.puzzles.forEach((p, i) => Object.assign(topics[key].puzzles[i], p));
  }
  return topics;
}

// ---------- Puzzle player ----------

function makePuzzleSection(prefix, topics) {
  const TRICK_PAUSE = 1000;
  const AI_DELAY = 550;
  let topic = Object.keys(topics)[0];
  let index = 0;
  let st = null;
  let timer = null;
  const $ = id => document.getElementById(prefix + '-' + id);

  const puzzle = () => topics[topic].puzzles[index];
  const isHuman = seat => seat % 2 === 0;

  function start() {
    clearTimeout(timer);
    const p = puzzle();
    st = {
      hands: p.hands.map(parseHand),
      trick: [],
      turn: p.leader,
      tricks: [0, 0],
      busy: false,
      done: false,
      hint: null,
      lost: false,
      solver: makeSolver(p.trump),
      showSolution: false,
    };
    render();
    schedule();
  }

  // Best cards for `seat` right now: max for North-South, min for the defenders.
  function bestCards(seat) {
    const legal = legalOf(st.hands[seat], st.trick);
    const values = legal.map(c => st.solver.after(st.hands, st.trick, seat, c));
    const target = isHuman(seat) ? Math.max(...values) : Math.min(...values);
    return legal.filter((c, i) => values[i] === target);
  }

  function playCard(seat, card) {
    if (st.done || st.busy || seat !== st.turn) return;
    st.hands[seat] = st.hands[seat].filter(c => c !== card);
    st.trick.push({ seat, card });
    st.hint = null;
    if (st.trick.length < 4) {
      st.turn = (seat + 1) % 4;
      render();
      schedule();
      return;
    }
    const w = trickWinnerOf(st.trick, puzzle().trump);
    st.tricks[w % 2]++;
    st.turn = w;
    st.busy = true;
    render();
    timer = setTimeout(() => {
      st.trick = [];
      st.busy = false;
      if (!st.hands[w].length) st.done = true;
      else if (st.tricks[0] + st.solver.search(st.hands, [], w) < puzzle().target) st.lost = true;
      render();
      schedule();
    }, TRICK_PAUSE);
  }

  function schedule() {
    if (st.done || st.busy || isHuman(st.turn)) return;
    timer = setTimeout(() => {
      const options = bestCards(st.turn);
      playCard(st.turn, options.reduce((a, b) => (b.value < a.value ? b : a)));
    }, AI_DELAY);
  }

  function renderSeat(seat) {
    const el = $('seat-' + seat);
    el.innerHTML = '';
    el.classList.toggle('to-play', !st.done && !st.busy && st.turn === seat);
    const roles = L(['Dummy (you play)', 'Defender', 'You — declarer', 'Defender'], ['דומם (אתם משחקים)', 'מגן', 'אתם: הכרוז', 'מגן']);
    const label = document.createElement('div');
    label.className = 'seat-label';
    label.innerHTML = `<strong>${SEAT_NAMES[seat]}</strong> <span>${roles[seat]}</span>`;
    el.appendChild(label);
    if (!st.hands[seat].length) return;

    const myTurn = isHuman(seat) && !st.done && !st.busy && st.turn === seat;
    const legal = myTurn ? legalOf(st.hands[seat], st.trick) : [];
    renderFan(el, st.hands[seat], (cardEl, card) => {
      if (!myTurn) return;
      if (!legal.includes(card)) { cardEl.classList.add('dim'); return; }
      cardEl.classList.add('playable');
      cardEl.tabIndex = 0;
      cardEl.setAttribute('role', 'button');
      if (card === st.hint) cardEl.classList.add('hint');
      cardEl.addEventListener('click', () => playCard(seat, card));
      cardEl.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); playCard(seat, card); }
      });
    });
  }

  function renderCenter() {
    const center = $('trick');
    center.innerHTML = '';
    const winner = st.trick.length === 4 ? trickWinnerOf(st.trick, puzzle().trump) : null;
    ['north', 'east', 'south', 'west'].forEach((pos, seat) => {
      const slot = document.createElement('div');
      slot.className = 'slot ' + pos;
      const played = st.trick.find(t => t.seat === seat);
      if (played) {
        const cardEl = createCardEl(played.card);
        if (seat === winner) cardEl.classList.add('winner');
        slot.appendChild(cardEl);
      }
      center.appendChild(slot);
    });
  }

  function statusText() {
    const p = puzzle();
    const need = Math.max(0, p.target - st.tricks[0]);
    if (st.done) {
      return st.tricks[0] >= p.target
        ? L('Solved!', 'פתרתם!')
        : L(`You took ${st.tricks[0]} of the ${p.target} tricks you needed.`, `לקחתם ${st.tricks[0]} מתוך ${p.target} הלקיחות שהייתם צריכים.`);
    }
    if (st.busy) return L(`${SEAT_NAMES[trickWinnerOf(st.trick, p.trump)]} wins the trick.`, `${SEAT_NAMES[trickWinnerOf(st.trick, p.trump)]} זוכה בלקיחה.`);
    const warn = st.lost
      ? ` <span class="warn">${L('With best defense, the target can no longer be reached. Try Reset.', 'מול הגנה מיטבית כבר אי אפשר להגיע ליעד. נסו להתחיל מחדש.')}</span>`
      : '';
    if (!isHuman(st.turn)) return L(`${SEAT_NAMES[st.turn]} is thinking…`, `${SEAT_NAMES[st.turn]} חושב…`) + warn;
    const from = st.turn === 2 ? L('your hand (South)', 'מהיד שלכם (דרום)') : L('dummy (North)', 'מהדומם (צפון)');
    const still = L(`You still need ${need} trick${need === 1 ? '' : 's'}.`, need === 1 ? 'נדרשת לכם עוד לקיחה אחת.' : `נדרשות לכם עוד ${need} לקיחות.`);
    return L(`Play a card from <strong>${from}</strong>. `, `שחקו קלף <strong>${from}</strong>. `) + still + warn;
  }

  function render() {
    const t = topics[topic];
    const p = puzzle();
    document.querySelectorAll(`#${prefix}-topic button`).forEach(b => {
      b.classList.toggle('active', b.dataset.topic === topic);
      b.setAttribute('aria-pressed', b.dataset.topic === topic);
    });
    $('intro').innerHTML = colorSuits(t.intro);
    $('title').textContent = L(`Puzzle ${index + 1} of ${t.puzzles.length}: ${p.title}`, `חידה ${index + 1} מתוך ${t.puzzles.length}: ${p.title}`);
    const strain = trumpText(p.trump);
    const n = cardsLeftAtStart();
    $('setup').innerHTML = L(
      `<strong>${strain[0].toUpperCase() + strain.slice(1)}. ${SEAT_NAMES[p.leader]} to lead. You need ${p.target} of the last ${n} tricks.</strong> The defenders can see every card and will play perfectly. `,
      `<strong>${strain}. ${SEAT_NAMES[p.leader]} מוביל. אתם צריכים ${p.target} מתוך ${n} הלקיחות האחרונות.</strong> המגינים רואים את כל הקלפים ומשחקים בצורה מושלמת. `) +
      colorSuits(p.idea);
    $('prev').disabled = index === 0;
    $('next').disabled = index === t.puzzles.length - 1;
    $('hint').disabled = st.done || st.busy || !isHuman(st.turn);
    $('status').innerHTML = statusText();

    const fb = $('feedback');
    if (st.done) {
      const ok = st.tricks[0] >= p.target;
      fb.className = 'feedback ' + (ok ? 'good' : 'bad');
      fb.innerHTML = `<strong>${ok ? L('Solved!', 'פתרתם!') : L('Not this time.', 'לא הפעם.')}</strong>${colorSuits(p.solution)}`;
    } else if (st.showSolution) {
      fb.className = 'feedback';
      fb.innerHTML = `<strong>${L('Solution', 'הפתרון')}</strong>${colorSuits(p.solution)}`;
    } else {
      fb.className = 'feedback';
      fb.innerHTML = '';
    }

    [0, 1, 2, 3].forEach(renderSeat);
    renderCenter();
  }

  function cardsLeftAtStart() {
    return parseHand(puzzle().hands[0]).length;
  }

  function init() {
    document.querySelectorAll(`#${prefix}-topic button`).forEach(b =>
      b.addEventListener('click', () => { topic = b.dataset.topic; index = 0; start(); }));
    $('prev').addEventListener('click', () => { index--; start(); });
    $('next').addEventListener('click', () => { index++; start(); });
    $('reset').addEventListener('click', start);
    $('solution').addEventListener('click', () => { st.showSolution = true; render(); });
    $('hint').addEventListener('click', () => {
      if (st.done || st.busy || !isHuman(st.turn)) return;
      st.hint = bestCards(st.turn)[0];
      render();
    });
    start();
  }

  return { init };
}

const Advanced = makePuzzleSection('adv', localizeTopics(ADVANCED_TOPICS, ADVANCED_HE));
