// The glossary: bridge words with short explanations. In the lessons, the first use of each word
// is marked, and tapping it shows its meaning. The last lesson lists all the words.
//
// Each word has its name and explanation in English and Hebrew, and the forms to look for in the
// lessons: `en` is a list of regular expressions (matched as whole words, any case), `he` a list of
// spellings, which may have a one- or two-letter Hebrew prefix (ה, ו, ב, ל, מ, ש, כ).

const GLOSSARY = [
  { name: ['Suit', 'סדרה'], en: ['(?<!hands )suits?'], he: ['סדרה', 'סדרות', 'סדרת'],
    def: [`One of the four groups of 13 cards: spades ${S}, hearts ${H}, diamonds ${D} and clubs ${C}.`,
      `אחת מארבע הקבוצות של 13 קלפים: ספייד ${S}, הארט ${H}, דיאמונד ${D} וקלאב ${C}.`] },
  { name: ['Major suit', 'סדרת מייגור'], en: ['major suits?', 'majors?'], he: ['סדרת מייגור', 'סדרות מייגור', 'מייגור'],
    def: [`Spades ${S} or hearts ${H}. They score more (30 points a trick), so a game needs only 10 tricks: ${B('4H')} or ${B('4S')}.`,
      `ספייד ${S} או הארט ${H}. הן שוות יותר (30 נקודות ללקיחה), ולכן משחק מלא צריך רק 10 לקיחות: ${B('4H')} או ${B('4S')}.`] },
  { name: ['Minor suit', 'סדרת מיינור'], en: ['minor suits?', 'minors?'], he: ['סדרת מיינור', 'סדרות מיינור', 'מיינור'],
    def: [`Diamonds ${D} or clubs ${C}. They score less (20 points a trick), so a game needs 11 tricks: ${B('5C')} or ${B('5D')}.`,
      `דיאמונד ${D} או קלאב ${C}. הן שוות פחות (20 נקודות ללקיחה), ולכן משחק מלא צריך 11 לקיחות: ${B('5C')} או ${B('5D')}.`] },
  { name: ['Honor', 'הונור'], en: ['honou?rs?'], he: ['הונור', 'הונורים'],
    def: ['The ace, king, queen, jack and ten of a suit.',
      'האס, המלך, המלכה, הנסיך והעשר של סדרה.'] },
  { name: ['High-card points (HCP)', 'נקודות גבוהות (נק\')'], en: ['high-card points', 'HCP'], he: ['נקודות גבוהות', 'נק\''],
    def: ['A count of a hand\'s strength: ace 4, king 3, queen 2, jack 1. The deck has 40, so an average hand has 10.',
      'ספירה של כוח היד: אס 4, מלך 3, מלכה 2, נסיך 1. בחפיסה יש 40, כך שביד ממוצעת יש 10.'] },
  { name: ['Singleton', 'סינגלטון'], en: ['singletons?'], he: ['סינגלטון', 'סינגלטונים'],
    def: [`Exactly one card in a suit. Example: the ${ltr(`4${D}`)} and no other diamonds.`,
      `קלף אחד בדיוק בסדרה. לדוגמה: ${ltr(`4${D}`)} ואין עוד דיאמונד.`] },
  { name: ['Doubleton', 'דאבלטון'], en: ['doubletons?'], he: ['דאבלטון', 'דאבלטונים'],
    def: [`Exactly two cards in a suit. Example: the ${ltr(`K${H}`)} and ${ltr(`7${H}`)} and no other hearts.`,
      `שני קלפים בדיוק בסדרה. לדוגמה: ${ltr(`K${H}`)} ו-${ltr(`7${H}`)} ואין עוד הארט.`] },
  { name: ['Void', 'חוסר'], en: ['voids?'], he: ['חוסר'],
    def: ['No cards at all in a suit. In a trump contract you can ruff the first time that suit is led.',
      'אין אף קלף בסדרה. בחוזה עם שליט אפשר לחתוך כבר בפעם הראשונה שמובילים בסדרה הזו.'] },
  { name: ['Balanced hand', 'יד מאוזנת'], en: ['balanced'], he: ['מאוזנת', 'מאוזנות'],
    def: ['A hand with no void, no singleton and at most one doubleton: 4-3-3-3, 4-4-3-2 or 5-3-3-2. These hands suit no-trump.',
      'יד בלי חוסר, בלי סינגלטון ועם דאבלטון אחד לכל היותר: 4-3-3-3, 4-4-3-2 או 5-3-3-2. ידיים כאלה מתאימות ללא שליט.'] },
  { name: ['Unbalanced hand', 'יד לא מאוזנת'], en: ['unbalanced'], he: ['לא מאוזנת', 'לא מאוזנות'],
    def: ['A hand with a void, a singleton or two doubletons. It usually plays best with a trump suit.',
      'יד עם חוסר, סינגלטון או שני דאבלטונים. בדרך כלל עדיף לשחק אותה עם שליט.'] },
  { name: ['Shape', 'מבנה'], en: ['shape'], he: ['מבנה'],
    def: ['How many cards you hold in each suit, written longest first. Example: 5-3-3-2 means a 5-card suit, two 3-card suits and a doubleton.',
      'כמה קלפים יש לכם בכל סדרה, מהארוכה לקצרה. לדוגמה: 5-3-3-2 היא סדרה של 5 קלפים, שתי סדרות של 3 ודאבלטון.'] },
  { name: ['Long suit', 'סדרה ארוכה'], en: ['long suits?'], he: ['סדרה ארוכה', 'סדרות ארוכות'],
    def: ['A suit with many cards, usually five or more. Once the opponents run out of it, even its small cards win tricks.',
      'סדרה עם הרבה קלפים, בדרך כלל חמישה ומעלה. אחרי שליריבים נגמרים הקלפים בה, גם הקלפים הקטנים שלה זוכים בלקיחות.'] },
  { name: ['Trick', 'לקיחה'], en: ['tricks?'], he: ['לקיחה', 'לקיחות', 'לקיחת'],
    def: ['Four cards, one from each player in turn. The highest card of the suit led wins, unless someone plays a trump. Each deal has 13 tricks.',
      'ארבעה קלפים, אחד מכל שחקן בתורו. הקלף הגבוה בסדרה שהובלה זוכה, אלא אם מישהו שיחק שליט. בכל חלוקה יש 13 לקיחות.'] },
  { name: ['Trump', 'שליט'], en: ['(?<!no-)trumps?'], he: ['(?<!ללא )שליט', 'שליטים'],
    def: [`The suit named in the contract (${H} in ${B('4H')}). Any trump beats any card of the other suits.`,
      `הסדרה שנקבעה בחוזה (${H} ב-${B('4H')}). כל שליט גובר על כל קלף מהסדרות האחרות.`] },
  { name: ['No-trump', 'ללא שליט'], en: ['no-?trumps?'], he: ['ללא שליט'],
    def: ['A contract with no trump suit (like 3NT). The highest card of the suit led always wins.',
      'חוזה בלי סדרת שליט (כמו 3NT). הקלף הגבוה בסדרה שהובלה תמיד זוכה.'] },
  { name: ['Ruff', 'חיתוך'], en: ['ruff(?:s|ed|ing)?'], he: ['חיתוך', 'חיתוכים', 'לחתוך', 'חתכו', 'חותך', 'חותכים'],
    def: ['To play a trump when you have no cards of the suit led. It wins the trick unless a higher trump is played.',
      'לשחק שליט כשאין לכם קלפים בסדרה שהובלה. הוא זוכה בלקיחה, אלא אם משחקים שליט גבוה יותר.'] },
  { name: ['Follow suit', 'לשרת'], en: ['follow(?:s|ed|ing)? suit'], he: ['לשרת', 'שרתו', 'משרת', 'משרתים'],
    def: ['To play a card of the suit that was led. You must do it if you can.',
      'לשחק קלף מהסדרה שהובלה. חובה לעשות זאת אם אפשר.'] },
  { name: ['Discard', 'השלכה'], en: ['discard(?:s|ed|ing)?'], he: ['השלכה', 'השלכות', 'להשליך', 'השליכו', 'משליכים'],
    def: ['To play a card of another suit (not a trump) when you cannot follow suit. It cannot win the trick.',
      'לשחק קלף מסדרה אחרת (לא שליט) כשאי אפשר לשרת. הוא לא יכול לזכות בלקיחה.'] },
  { name: ['Lead', 'הובלה'], en: ['lead(?:s|ing)?', 'led'], he: ['הובלה', 'הובלות', 'להוביל', 'הובילו', 'מובילים'],
    def: ['The first card played to a trick. Whoever wins a trick leads to the next one.',
      'הקלף הראשון שמשחקים ללקיחה. מי שזוכה בלקיחה מוביל ללקיחה הבאה.'] },
  { name: ['Opening lead', 'הובלת פתיחה'], en: ['opening leads?'], he: ['הובלת פתיחה', 'הובלות פתיחה'],
    def: ['The first card of the play, led by the player on declarer\'s left before dummy\'s cards are shown.',
      'הקלף הראשון במשחק. מוביל אותו השחקן שמשמאל לכרוז, לפני שקלפי הדומם נחשפים.'] },
  { name: ['Declarer', 'כרוז'], en: ['declarers?'], he: ['כרוז'],
    def: ['The player who plays the contract. Declarer plays both their own cards and dummy\'s.',
      'השחקן שמשחק את החוזה. הכרוז משחק גם בקלפים שלו וגם בקלפי הדומם.'] },
  { name: ['Dummy', 'דומם'], en: ['dummy'], he: ['דומם'],
    def: ['Declarer\'s partner. After the opening lead, dummy\'s cards are laid face up on the table and declarer plays them.',
      'השותף של הכרוז. אחרי הובלת הפתיחה, קלפי הדומם נפרשים גלויים על השולחן והכרוז משחק בהם.'] },
  { name: ['Defenders', 'מגינים'], en: ['defenders?'], he: ['מגינים', 'מגן'],
    def: ['The two players against declarer. They try to win enough tricks to defeat the contract.',
      'שני השחקנים מול הכרוז. הם מנסים לזכות במספיק לקיחות כדי להפיל את החוזה.'] },
  { name: ['Entry', 'כניסה'], en: ['entry', 'entries'], he: ['כניסה', 'כניסות'],
    def: ['A card that wins a trick in a hand, so that you can lead from that hand next.',
      'קלף שזוכה בלקיחה ביד מסוימת, כדי שאפשר יהיה להוביל מהיד הזו אחר כך.'] },
  { name: ['Finesse', 'עקיפה'], en: ['finesse[sd]?', 'finessing'], he: ['עקיפה', 'עקיפות', 'לעקוף'],
    def: ['Trying to win a trick with a lower card while an opponent holds a higher one, hoping it sits in the right place. Example: lead toward A-Q and play the queen, hoping West has the king.',
      'ניסיון לזכות בלקיחה עם קלף נמוך כשליריב יש קלף גבוה ממנו, בתקווה שהוא יושב במקום הנכון. לדוגמה: מובילים לכיוון A-Q ומשחקים את המלכה, בתקווה שהמלך אצל מערב.'] },
  { name: ['Duck', 'ויתור'], en: ['duck(?:s|ed|ing)?'], he: ['ויתור', 'לוותר', 'ותרו', 'מוותרים'],
    def: ['To play a low card on purpose and let the opponents win a trick, to keep control or a link between your hands for later.',
      'לשחק קלף נמוך בכוונה ולתת ליריבים לזכות בלקיחה, כדי לשמור על שליטה או על קשר בין הידיים להמשך.'] },
  { name: ['Cash', 'מימוש'], en: ['cash(?:es|ed|ing)?'], he: ['מימוש', 'לממש', 'ממשו'],
    def: ['To play a winner and take the trick now.',
      'לשחק קלף זוכה ולקחת את הלקיחה עכשיו.'] },
  { name: ['Stopper', 'עוצר'], en: ['stoppers?'], he: ['עוצר', 'עוצרים'],
    def: ['A holding that will win a trick in a suit sooner or later, like A, K-x or Q-x-x. In no-trump you want one in each of the opponents\' suits.',
      'קלפים שיזכו בלקיחה בסדרה במוקדם או במאוחר, כמו A,‏ K-x או Q-x-x. בללא שליט רוצים עוצר בכל סדרה של היריבים.'] },
  { name: ['Draw trumps', 'הוצאת שליטים'], en: ['draw(?:s|ing)? (?:the )?trumps'], he: ['הוצאת שליטים', 'הוצאת השליטים', 'להוציא שליטים', 'להוציא את השליטים', 'הוציאו שליטים', 'הוציאו את השליטים'],
    def: ['To lead trumps until the opponents have none left, so they cannot ruff your winners.',
      'להוביל שליטים עד שלא נשארים ליריבים שליטים, כדי שלא יוכלו לחתוך את הזוכים שלכם.'] },
  { name: ['Opening bid', 'הכרזת פתיחה'], en: ['opening bids?'], he: ['הכרזת פתיחה', 'הכרזות פתיחה'],
    def: ['The first bid of the auction (passes before it don\'t count). The player who makes it is the opener.',
      'ההכרזה הראשונה במכרז (פאסים לפניה לא נחשבים). מי שמכריז אותה הוא הפותח.'] },
  { name: ['Response', 'תשובה'], en: ['responses?', 'responders?'], he: ['תשובה', 'תשובות', 'משיב'],
    def: ['The bid of the opener\'s partner (the responder) after the opening bid.',
      'ההכרזה של השותף של הפותח (המשיב) אחרי הכרזת הפתיחה.'] },
  { name: ['Rebid', 'הכרזה חוזרת'], en: ['rebids?'], he: ['הכרזה חוזרת', 'הכרזות חוזרות'],
    def: ['A player\'s second bid. It tells partner more about the hand\'s strength and shape.',
      'ההכרזה השנייה של שחקן. היא מספרת לשותף עוד על הכוח והמבנה של היד.'] },
  { name: ['Overcall', 'הכרזת התערבות'], en: ['overcall(?:s|ed|ing)?'], he: ['הכרזת התערבות', 'הכרזות התערבות'],
    def: ['A bid in a suit or no-trump after an opponent has opened the bidding.',
      'הכרזה בסדרה או בללא שליט אחרי שיריב פתח את המכרז.'] },
  { name: ['Takeout double', 'כפל הוצאה'], en: ['takeout doubles?'], he: ['כפל הוצאה'],
    def: ['A double of an opponent\'s opening bid. It shows opening strength and support for the other suits, and asks partner to bid one of them.',
      'דאבל על הכרזת הפתיחה של יריב. הוא מראה כוח של פתיחה ותמיכה בסדרות האחרות, ומבקש מהשותף להכריז באחת מהן.'] },
  { name: ['Pass', 'פאס'], en: ['pass(?:es|ed)?'], he: ['פאס', 'פאסים'],
    def: ['A call that makes no bid. Three passes in a row after a bid end the auction.',
      'הכרזה שלא מציעה חוזה. שלושה פאסים ברצף אחרי הכרזה מסיימים את המכרז.'] },
  { name: ['Forcing', 'מחייב'], en: ['forcing'], he: ['מחייב', 'מחייבת'],
    def: ['A bid that partner must not pass.',
      'הכרזה שאסור לשותף להכריז עליה פאס.'] },
  { name: ['Invitation', 'הזמנה'], en: ['invit(?:es?|ing|ation|ational)'], he: ['הזמנה', 'מזמין', 'מזמינה'],
    def: ['A bid that asks partner to bid game with a maximum and to pass with a minimum.',
      'הכרזה שמבקשת מהשותף להכריז משחק מלא עם מקסימום, ופאס עם מינימום.'] },
  { name: ['Limit raise', 'תמיכה בקפיצה'], en: ['limit raises?'], he: ['תמיכה בקפיצה'],
    def: [`A jump raise of partner's suit, like 1${H} – 3${H}, with 11–12 points. It invites game.`,
      `תמיכה בקפיצה בסדרה של השותף, כמו ${B('1H')} – ${B('3H')}, עם 11-12 נקודות. היא מזמינה משחק מלא.`] },
  { name: ['Preempt', 'הכרזת חסימה'], en: ['preempts?', 'preemptive'], he: ['הכרזת חסימה', 'הכרזות חסימה'],
    def: ['A high bid (2, 3 or 4 of a suit) with a weak hand and a long, good suit. It takes away the opponents\' bidding room.',
      'הכרזה גבוהה (2, 3 או 4 בסדרה) עם יד חלשה וסדרה ארוכה וטובה. היא לוקחת ליריבים את מרחב ההכרזה.'] },
  { name: ['Fit', 'התאמה'], en: ['fits?'], he: ['התאמה', 'התאמות'],
    def: ['Eight or more cards in the same suit between you and partner. It makes a good trump suit.',
      'שמונה קלפים ומעלה באותה סדרה אצלכם ואצל השותף ביחד. זו סדרת שליט טובה.'] },
  { name: ['Support points', 'נקודות תמיכה'], en: ['support points'], he: ['נקודות תמיכה'],
    def: ['When you have support for partner\'s suit: your HCP plus 1 for each doubleton, 2 for each singleton and 3 for each void, because as dummy you can ruff in your short suits.',
      'כשיש לכם תמיכה בסדרה של השותף: הנקודות הגבוהות ועוד 1 על כל דאבלטון, 2 על כל סינגלטון ו-3 על כל חוסר, כי כדומם אפשר לחתוך בסדרות הקצרות.'] },
  { name: ['Convention', 'מוסכמה'], en: ['conventions?'], he: ['מוסכמה', 'מוסכמות'],
    def: ['A bid that partners agree has a special, artificial meaning, like Stayman. The opponents are entitled to know your conventions.',
      'הכרזה שהשותפים מסכימים שיש לה משמעות מיוחדת ומלאכותית, כמו סטיימן. ליריבים מותר לדעת מה המוסכמות שלכם.'] },
  { name: ['Transfer', 'טרנספר'], en: ['transfers?'], he: ['טרנספר', 'טרנספרים'],
    def: [`A bid of the suit just below the one you hold (like ${B('2D')} for hearts over 1NT). It asks partner to bid your suit, so the strong hand becomes declarer.`,
      `הכרזה בסדרה שמתחת לסדרה שלכם (כמו ${B('2D')} עם הארט אחרי 1NT). היא מבקשת מהשותף להכריז בסדרה שלכם, כך שהיד החזקה הופכת לכרוז.`] },
  { name: ['Stayman', 'סטיימן'], en: ['Stayman'], he: ['סטיימן'],
    def: [`${B('2C')} over partner's 1NT (or ${B('3C')} over 2NT). It asks: do you have a 4-card major?`,
      `${B('2C')} אחרי 1NT של השותף (או ${B('3C')} אחרי 2NT). היא שואלת: יש לך 4 קלפים בסדרת מייגור?`] },
  { name: ['Contract', 'חוזה'], en: ['contracts?'], he: ['חוזה', 'חוזים'],
    def: ['The last bid of the auction: how many tricks declarer\'s side must win, and which suit is trumps (or no-trump).',
      'ההכרזה האחרונה במכרז: כמה לקיחות צריך הצד של הכרוז לזכות, ואיזו סדרה היא השליט (או ללא שליט).'] },
  { name: ['Part score', 'חוזה חלקי'], en: ['part[- ]?scores?'], he: ['חוזה חלקי', 'חוזים חלקיים'],
    def: ['A contract below game: worth fewer than 100 trick points.',
      'חוזה מתחת למשחק מלא: שווה פחות מ-100 נקודות לקיחה.'] },
  { name: ['Game', 'משחק מלא'], en: ['(?<!card )games?'], he: ['משחק מלא', 'משחקים מלאים'],
    def: [`A contract worth 100 or more trick points: 3NT, ${B('4H')}, ${B('4S')}, ${B('5C')} or ${B('5D')}. Making it earns a big bonus.`,
      `חוזה ששווה 100 נקודות לקיחה ומעלה: 3NT,‏ ${B('4H')},‏ ${B('4S')},‏ ${B('5C')} או ${B('5D')}. ביצוע שלו מזכה בבונוס גדול.`] },
  { name: ['Slam', 'סלאם'], en: ['(?:small |grand )?slams?'], he: ['סלאם קטן', 'סלאם גדול', 'סלאם'],
    def: ['A contract for 12 tricks (a small slam, at the 6-level) or all 13 (a grand slam, at the 7-level). Both earn very large bonuses.',
      'חוזה ל-12 לקיחות (סלאם קטן, ברמה 6) או לכל 13 (סלאם גדול, ברמה 7). שניהם מזכים בבונוס גדול מאוד.'] },
  { name: ['Vulnerable', 'פגיע'], en: ['vulnerable', 'vulnerability'], he: ['פגיע', 'פגיעים', 'פגיעות'],
    def: ['A side that is vulnerable gets bigger bonuses for games and slams, but loses more when it goes down.',
      'צד פגיע מקבל בונוסים גדולים יותר על משחק מלא וסלאם, אבל מפסיד יותר כשהוא נופל.'] },
  { name: ['Down', 'נפילה'], en: ['(?:go|goes|going|went|gone) down', 'undertricks?'], he: ['נפילה', 'נופלים', 'נופל', 'לקיחה חסרה', 'לקיחות חסרות'],
    def: ['Taking fewer tricks than the contract needs. The opponents score points for each missing trick (an undertrick).',
      'לזכות בפחות לקיחות ממה שהחוזה צריך. היריבים מקבלים נקודות על כל לקיחה חסרה.'] },
  { name: ['Overtrick', 'לקיחה עודפת'], en: ['overtricks?'], he: ['לקיחה עודפת', 'לקיחות עודפות'],
    def: ['A trick won beyond what the contract needs. It scores, but less than bidding higher would have.',
      'לקיחה מעבר למה שהחוזה צריך. היא מזכה בנקודות, אבל פחות ממה שהכרזה גבוהה יותר הייתה נותנת.'] },
];

const Glossary = (() => {
  // In Hebrew, the English name is shown too, for reading English books and sites.
  const words = GLOSSARY.map(w => ({ name: L(...w.name), other: L('', w.name[0]), def: L(...w.def), forms: L(w.en, w.he) }));
  const heb = '\\u05D0-\\u05EA';
  // Longer forms first, so "follow suit" is found before "suit".
  const all = words.flatMap((w, i) => w.forms.map(f => ({ f, i }))).sort((a, b) => b.f.length - a.f.length);
  const finder = new RegExp(L('\\b', `(?<![${heb}])([והבלמשכ]{0,2})`) + `(${all.map(x => x.f).join('|')})` + L('\\b', `(?![${heb}])`), L('gi', 'g'));
  const whole = words.map(w => new RegExp(`^(?:${w.forms.join('|')})$`, 'i'));
  const SKIP = 'h2, h3, button, a, summary, th, .eyebrow, .term';

  // Marks the first use of each word in `root` (a lesson's text, before its pictures are added).
  function mark(root) {
    const seen = new Set();
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: n => n.parentElement.closest(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const text = node.nodeValue;
      const parts = [];
      let last = 0;
      for (const m of text.matchAll(finder)) {
        const prefix = L('', m[1]), word = L(m[1], m[2]);
        const i = whole.findIndex(re => re.test(word));
        if (i < 0 || seen.has(i)) continue;
        seen.add(i);
        const start = m.index + prefix.length;
        parts.push(document.createTextNode(text.slice(last, start)));
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'term';
        btn.dataset.term = i;
        btn.textContent = word;
        parts.push(btn);
        last = start + word.length;
      }
      if (!parts.length) continue;
      parts.push(document.createTextNode(text.slice(last)));
      node.replaceWith(...parts);
    }
    root.querySelectorAll('.term').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); show(btn); }));
  }

  // The popup under a marked word.
  let pop;
  function show(btn) {
    const w = words[btn.dataset.term];
    if (pop && pop.anchor === btn) return hide();
    hide();
    pop = document.createElement('div');
    pop.className = 'term-pop';
    pop.setAttribute('role', 'dialog');
    pop.anchor = btn;
    pop.innerHTML = `
      <div class="term-pop-name"><strong>${w.name}</strong> <span class="term-other" dir="auto">${w.other}</span></div>
      <p>${w.def}</p>
      <button type="button" class="finesse-link" data-all>${L('All words →', 'כל המונחים ←')}</button>`;
    pop.querySelector('[data-all]').addEventListener('click', () => { hide(); Learn.showGlossary(); });
    document.body.appendChild(pop);
    place();
    btn.setAttribute('aria-expanded', 'true');
  }
  function place() {
    if (!pop) return;
    const r = pop.anchor.getBoundingClientRect(), width = pop.offsetWidth;
    const left = Math.min(Math.max(8, r.left + r.width / 2 - width / 2), document.documentElement.clientWidth - width - 8);
    pop.style.left = `${left + window.scrollX}px`;
    pop.style.top = `${r.bottom + window.scrollY + 6}px`;
  }
  function hide() {
    if (!pop) return;
    pop.anchor.setAttribute('aria-expanded', 'false');
    pop.remove();
    pop = null;
  }
  document.addEventListener('click', e => { if (pop && !pop.contains(e.target)) hide(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') hide(); });
  window.addEventListener('resize', place);

  // The glossary page: all the words in alphabetical order, with a search box.
  function mount(el) {
    const sorted = words.slice().sort((a, b) => a.name.localeCompare(b.name, L('en', 'he')));
    el.innerHTML = `
      <input type="search" class="glossary-search" placeholder="${L('Find a word', 'חיפוש מונח')}" aria-label="${L('Find a word', 'חיפוש מונח')}">
      <dl class="glossary-list">
        ${sorted.map(w => `<div class="glossary-item"><dt><strong>${w.name}</strong> <span class="term-other" dir="auto">${w.other}</span></dt><dd>${w.def}</dd></div>`).join('')}
      </dl>
      <p class="glossary-none" hidden>${L('No word matches.', 'אין מונח מתאים.')}</p>`;
    const items = [...el.querySelectorAll('.glossary-item')];
    el.querySelector('.glossary-search').addEventListener('input', e => {
      const q = e.target.value.trim().toLowerCase();
      let any = false;
      items.forEach(item => {
        const hit = !q || item.querySelector('dt').textContent.toLowerCase().includes(q);
        item.hidden = !hit;
        any ||= hit;
      });
      el.querySelector('.glossary-none').hidden = any;
    });
  }

  return { mark, mount, hide };
})();
