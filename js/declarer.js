// Declarer play: ten techniques in four groups, each with an explanation and practice hands.
// The hands come from practice/declarer-play.txt (via js/practice-data.js); the puzzle player and
// the perfect-defense solver are in js/advanced.js.

const DECLARER_GROUPS = [
  { label: L('Basic suit play', 'משחק בסדרה'), topics: ['develop', 'finesse'] },
  { label: L('Trump contracts', 'חוזים בשליט'), topics: ['draw', 'ruff', 'crossruff'] },
  { label: L('Advanced play', 'משחק מתקדם'), topics: ['holdup', 'duck', 'safety'] },
  { label: L('Expert play', 'משחק מומחים'), topics: ['squeeze', 'endplay'] },
];

const DECLARER_SECTIONS = {
  develop: {
    label: L('Developing suits', 'פיתוח סדרות'),
    intro: L(`
      <p>Start every hand by counting your <strong>sure tricks</strong>: winners you can take right now without losing the lead. When there aren't enough, you have to <strong>develop</strong> more.</p>
      <ul>
        <li><strong>Promotion.</strong> With K-Q-J, give up one trick to the ace and the other two cards become winners.</li>
        <li><strong>Length.</strong> In a long suit, once the defenders run out of cards, your small cards win too. With A-K-x-x-x opposite x-x-x, and the missing cards split 3-2, two small cards become winners.</li>
      </ul>
      <p>Timing matters:</p>
      <ul>
        <li><strong>Develop your suit first</strong>, while you still hold stoppers in the defenders' suits. If you cash your stopper too early, the defenders can run their suit when they win the trick you have to give up.</li>
        <li><strong>Keep an entry to the long suit.</strong> Often the best way is to <em>duck</em> (give up) an early round, so the short hand still has a card left to lead to the long hand.</li>
      </ul>`, `
      <p>התחילו כל יד בספירת <strong>הלקיחות הבטוחות</strong>: זוכים שאפשר לקחת מיד בלי למסור את ההובלה. כשאין מספיק, צריך <strong>לפתח</strong> עוד.</p>
      <ul>
        <li><strong>קידום.</strong> עם K-Q-J, מוסרים לקיחה אחת לאס, ושני הקלפים האחרים הופכים לזוכים.</li>
        <li><strong>אורך.</strong> בסדרה ארוכה, אחרי שלמגינים נגמרים הקלפים, גם הקלפים הקטנים שלכם זוכים. עם A-K-x-x-x מול x-x-x, כשהקלפים החסרים מתחלקים 3-2, שני קלפים קטנים הופכים לזוכים.</li>
      </ul>
      <p>התזמון חשוב:</p>
      <ul>
        <li><strong>פתחו קודם את הסדרה שלכם</strong>, כל עוד יש לכם עוצרים בסדרות של המגינים. אם תממשו את העוצר מוקדם מדי, המגינים יוכלו להריץ את הסדרה שלהם כשהם יזכו בלקיחה שאתם חייבים למסור.</li>
        <li><strong>שמרו כניסה לסדרה הארוכה.</strong> לעיתים קרובות הדרך הטובה היא <em>לוותר</em> (דאק) על סיבוב מוקדם, כך שליד הקצרה עדיין יישאר קלף להוביל אל היד הארוכה.</li>
      </ul>`),
  },
  finesse: {
    label: L('Finesses', 'עקיפות'),
    intro: L(`
      <p>A <strong>finesse</strong> tries to win a trick with a card that isn't the highest, by hoping a missing honor is in the right place. The golden rule is: <strong>lead from the opposite hand <em>toward</em> the card you hope will win.</strong> That way the defender with the missing honor has to play before you decide.</p>
      <table class="tbl">
        <tr><th>Kind</th><th>Holding (dummy / you)</th><th>How</th><th>Works when</th></tr>
        <tr><td>Simple finesse</td><td>A-Q / x-x</td><td>Lead toward A-Q and play the queen</td><td>The king is with the player on your left (before dummy)</td></tr>
        <tr><td>Leading toward an honor</td><td>x-x / K-x</td><td>Lead from dummy toward the king</td><td>The ace is with the player on your right</td></tr>
        <tr><td>Finesse against the queen</td><td>A-K-J / x-x-x</td><td>Lead toward dummy and play the jack</td><td>The queen is with the player before dummy</td></tr>
        <tr><td>Double finesse</td><td>A-Q-10 / x-x-x</td><td>Finesse the 10 first, then the queen</td><td>The king and jack are both with the player before dummy (or the jack alone is)</td></tr>
        <tr><td>Ruffing finesse</td><td>A-Q-J / void (with trumps)</td><td>Lead the queen; ruff if covered, otherwise throw a loser</td><td>The king is with the player after dummy</td></tr>
      </table>
      <p>A finesse is a roughly 50% chance in real play. In these puzzles you can see every card, so the job is to take the finesse the right way, and to keep the entries you need to repeat it.</p>`, `
      <p><strong>עקיפה</strong> מנסה לזכות בלקיחה עם קלף שאינו הגבוה ביותר, בתקווה שההונור החסר נמצא במקום הנכון. כלל הזהב: <strong>הובילו מהיד שממול <em>לעבר</em> הקלף שאתם מקווים שיזכה.</strong> כך המגן שמחזיק את ההונור החסר חייב לשחק לפני שאתם מחליטים.</p>
      <table class="tbl">
        <tr><th>סוג</th><th>החזקה (דומם / אתם)</th><th>איך</th><th>עובדת כאשר</th></tr>
        <tr><td>עקיפה פשוטה</td><td>A-Q / x-x</td><td>הובילו לעבר A-Q ושחקו את המלכה</td><td>המלך אצל השחקן משמאלכם (לפני הדומם)</td></tr>
        <tr><td>הובלה לעבר הונור</td><td>x-x / K-x</td><td>הובילו מהדומם לעבר המלך</td><td>האס אצל השחקן מימינכם</td></tr>
        <tr><td>עקיפה נגד המלכה</td><td>A-K-J / x-x-x</td><td>הובילו לעבר הדומם ושחקו את הנסיך</td><td>המלכה אצל השחקן שלפני הדומם</td></tr>
        <tr><td>עקיפה כפולה</td><td>A-Q-10 / x-x-x</td><td>עקפו קודם עם ה-10, אחר כך עם המלכה</td><td>המלך והנסיך שניהם אצל השחקן שלפני הדומם (או רק הנסיך)</td></tr>
        <tr><td>עקיפת חיתוך</td><td>A-Q-J / חוסר (עם שליטים)</td><td>הובילו את המלכה; חתכו אם מכסים אותה, אחרת השליכו מפסיד</td><td>המלך אצל השחקן שאחרי הדומם</td></tr>
      </table>
      <p>במשחק אמיתי לעקיפה יש סיכוי של בערך 50%. בחידות האלה רואים את כל הקלפים, כך שהמשימה היא לבצע את העקיפה בדרך הנכונה, ולשמור את הכניסות שצריך כדי לחזור עליה.</p>`),
  },
  draw: {
    label: L('Drawing trumps', 'הוצאת שליטים'),
    intro: L(`

      <p>In a trump contract, the defenders' trumps are a danger: they can ruff your winners. <strong>Drawing trumps</strong> means leading trumps until the defenders have none left.</p>
      <ul>
        <li><strong>Count the defenders' trumps.</strong> If you and dummy hold eight trumps, the defenders hold five. Keep track as they follow, and stop when they're all gone.</li>
        <li><strong>Draw trumps early</strong> when you don't need dummy's trumps for ruffing, so your side-suit winners can't be ruffed.</li>
        <li><strong>Don't draw trumps first</strong> when you need dummy's trumps to ruff your losers (see <em>Ruffing in dummy</em>).</li>
        <li>You don't have to draw a defender's top trump: leave it, and let them take it when they like.</li>
      </ul>`, `

      <p>בחוזה בשליט, השליטים של המגינים הם סכנה: הם יכולים לחתוך את הזוכים שלכם. <strong>הוצאת שליטים</strong> פירושה להוביל שליטים עד שלמגינים לא נשאר אף שליט.</p>
      <ul>
        <li><strong>ספרו את השליטים של המגינים.</strong> אם לכם ולדומם יש שמונה שליטים, למגינים יש חמישה. עקבו אחריהם כשהם משרתים, ועצרו כשהם נגמרו.</li>
        <li><strong>הוציאו שליטים מוקדם</strong> כשאתם לא צריכים את השליטים של הדומם לחיתוך, כדי שהזוכים שלכם בסדרות הצדדיות לא ייחתכו.</li>
        <li><strong>אל תוציאו שליטים קודם</strong> כשאתם צריכים את השליטים של הדומם כדי לחתוך את המפסידים שלכם (ראו <em>חיתוך בדומם</em>).</li>
        <li>לא חייבים להוציא את השליט הגבוה של מגן: השאירו אותו, ותנו לו לקחת אותו מתי שירצה.</li>
      </ul>`),
  },
  ruff: {
    label: L('Ruffing in dummy', 'חיתוך בדומם'),
    intro: L(`
      <p>In a trump contract, count your <strong>losers</strong> from the hand with more trumps (usually yours). Then look for ways to get rid of them:</p>
      <ul>
        <li><strong>Ruff in the short hand.</strong> When dummy is short in a suit where you have losers, trump them in dummy. Each ruff with dummy's (shorter) trumps is an <em>extra</em> trick. Ruffing in your own long trump hand gains nothing, because those trumps were winners anyway.</li>
        <li><strong>Ruff before you draw trumps.</strong> If you draw trumps first, dummy's trumps go too, and you can no longer ruff.</li>
        <li><strong>Ruff high</strong> when a defender might overruff, and plan your <strong>entries</strong> so you can come back to your hand for each ruff.</li>
        <li>You can also <strong>discard</strong> losers on dummy's extra winners.</li>
      </ul>
      <p>Draw trumps once the ruffs are done, so the defenders can't ruff your winners.</p>`, `
      <p>בחוזה בשליט, ספרו את <strong>המפסידים</strong> מנקודת המבט של היד עם יותר שליטים (בדרך כלל היד שלכם). אחר כך חפשו דרכים להיפטר מהם:</p>
      <ul>
        <li><strong>חתכו ביד הקצרה.</strong> כשהדומם קצר בסדרה שיש לכם בה מפסידים, חתכו אותם בדומם. כל חיתוך בשליטים (הקצרים יותר) של הדומם הוא לקיחה <em>נוספת</em>. חיתוך ביד הארוכה שלכם לא מרוויח כלום, כי השליטים האלה היו זוכים בכל מקרה.</li>
        <li><strong>חתכו לפני שאתם מוציאים שליטים.</strong> אם תוציאו קודם את השליטים, גם השליטים של הדומם ייעלמו, ולא תוכלו לחתוך יותר.</li>
        <li><strong>חתכו גבוה</strong> כשמגן עלול לחתוך מעליכם, ותכננו את <strong>הכניסות</strong> כדי שתוכלו לחזור ליד שלכם לכל חיתוך.</li>
        <li>אפשר גם <strong>להשליך</strong> מפסידים על זוכים עודפים בדומם.</li>
      </ul>
      <p>הוציאו שליטים אחרי שסיימתם לחתוך, כדי שהמגינים לא יוכלו לחתוך את הזוכים שלכם.</p>`),
  },
  crossruff: {
    label: L('Cross ruff', 'חיתוך צולב'),
    intro: L(`

      <p>In a <strong>cross ruff</strong> you ruff back and forth: one suit in dummy, another in your hand. Each trump scores a trick on its own, so you can make many more trump tricks than by drawing trumps.</p>
      <ul>
        <li>It works when each hand is short in a different suit, and both hands have trumps.</li>
        <li><strong>Don't draw trumps</strong>: you need every trump for ruffing.</li>
        <li><strong>Cash your side-suit winners first</strong>, before the defenders can discard that suit and ruff it later.</li>
        <li><strong>Ruff high</strong> when a defender might overruff.</li>
      </ul>`, `

      <p>ב<strong>חיתוך צולב</strong> חותכים הלוך ושוב: סדרה אחת בדומם וסדרה אחרת ביד שלכם. כל שליט זוכה בלקיחה בנפרד, כך שאפשר לעשות הרבה יותר לקיחות בשליט מאשר בהוצאת שליטים.</p>
      <ul>
        <li>זה עובד כשכל יד קצרה בסדרה אחרת, ולשתי הידיים יש שליטים.</li>
        <li><strong>אל תוציאו שליטים</strong>: אתם צריכים כל שליט לחיתוך.</li>
        <li><strong>ממשו קודם את הזוכים בסדרות הצדדיות</strong>, לפני שהמגינים יוכלו להשליך את הסדרה הזאת ולחתוך אותה אחר כך.</li>
        <li><strong>חתכו גבוה</strong> כשמגן עלול לחתוך מעליכם.</li>
      </ul>`),
  },
  holdup: {
    label: L('Hold up', 'השהיה (הולד-אפ)'),
    intro: L(`

      <p>When the defenders lead their long suit against no-trump, <strong>hold up</strong> your stopper: refuse to win the trick until the second or third round.</p>
      <ul>
        <li>The aim is to <strong>exhaust one defender</strong> of the suit. If that defender gets the lead later, they have no card of the suit left to lead to partner's winners.</li>
        <li>Count: if the defenders have eight cards in the suit and the leader has five, holding up twice leaves partner with none.</li>
        <li>Hold up when the defender who can get the lead is the one you're exhausting, and when you can afford to give up those tricks.</li>
      </ul>`, `

      <p>כשהמגינים מובילים את הסדרה הארוכה שלהם נגד ללא שליט, <strong>השהו</strong> את העוצר שלכם (הולד-אפ): סרבו לזכות בלקיחה עד הסיבוב השני או השלישי.</p>
      <ul>
        <li>המטרה היא <strong>לרוקן מגן אחד</strong> מהסדרה. אם המגן הזה יקבל אחר כך את ההובלה, לא יישאר לו קלף בסדרה כדי להוביל לזוכים של השותף.</li>
        <li>ספרו: אם למגינים יש שמונה קלפים בסדרה ולמוביל יש חמישה, השהיה פעמיים משאירה את השותף בלי קלפים בסדרה.</li>
        <li>השהו כשהמגן שיכול לקבל את ההובלה הוא זה שאתם מרוקנים, וכשאתם יכולים להרשות לעצמכם למסור את הלקיחות האלה.</li>
      </ul>`),
  },
  duck: {
    label: L('Ducking', 'ויתור (דאק)'),
    intro: L(`

      <p><strong>Ducking</strong> means playing low on purpose and giving up a trick, to gain something later.</p>
      <ul>
        <li><strong>Keep your communications.</strong> With a long suit in a hand with no other entry (A-K-x-x-x opposite x-x-x), duck the first round while the short hand still has a card to lead to the long one.</li>
        <li><strong>Cut the defenders' link.</strong> Ducking can leave one defender with no cards in a suit, so they can't reach their partner's winners (as in the hold-up).</li>
        <li><strong>Lose the trick you have to lose early</strong>, while you still control the other suits.</li>
      </ul>`, `

      <p><strong>ויתור</strong> (דאק) פירושו לשחק נמוך בכוונה ולמסור לקיחה, כדי להרוויח משהו בהמשך.</p>
      <ul>
        <li><strong>שמירה על הקשר.</strong> עם סדרה ארוכה ביד שאין לה כניסה אחרת (A-K-x-x-x מול x-x-x), ותרו על הסיבוב הראשון כל עוד ליד הקצרה יש קלף להוביל אל היד הארוכה.</li>
        <li><strong>ניתוק הקשר של המגינים.</strong> ויתור יכול להשאיר מגן אחד בלי קלפים בסדרה, כך שהוא לא יוכל להגיע לזוכים של השותף (כמו בהשהיה).</li>
        <li><strong>מסרו מוקדם את הלקיחה שאתם חייבים למסור</strong>, כל עוד אתם שולטים בסדרות האחרות.</li>
      </ul>`),
  },
  safety: {
    label: L('Safety plays', 'משחקי ביטחון'),
    intro: L(`

      <p>A <strong>safety play</strong> gives up the chance of an extra trick to protect the contract against a bad split.</p>
      <ul>
        <li>First count how many tricks you <strong>need</strong> from the suit, not how many you could take.</li>
        <li>Then ask what could go wrong: a singleton honor, or a 4-1 or 5-0 split. Choose the order of play that still gives you the tricks you need.</li>
        <li>A typical example: with A-K-J-10-x opposite x-x-x, cash the ace before finessing. It costs nothing, and it wins when the queen is singleton.</li>
      </ul>
      <p>In these puzzles you can see every card, so the safe line is also the one that works.</p>`, `

      <p><strong>משחק ביטחון</strong> מוותר על סיכוי ללקיחה נוספת כדי להגן על החוזה מפני חלוקה רעה.</p>
      <ul>
        <li>ספרו קודם כמה לקיחות אתם <strong>צריכים</strong> מהסדרה, ולא כמה אפשר לקחת.</li>
        <li>אחר כך שאלו מה עלול להשתבש: הונור בודד, או חלוקה של 4-1 או 5-0. בחרו סדר משחק שעדיין נותן לכם את הלקיחות שאתם צריכים.</li>
        <li>דוגמה טיפוסית: עם A-K-J-10-x מול x-x-x, ממשו את האס לפני העקיפה. זה לא עולה כלום, וזה זוכה כשהמלכה בודדת.</li>
      </ul>
      <p>בחידות האלה רואים את כל הקלפים, כך שהדרך הבטוחה היא גם הדרך שעובדת.</p>`),
  },
  squeeze: {
    label: L('Squeeze', 'לחץ'),
    intro: L(`
      <p>A <strong>squeeze</strong> wins a trick from nothing. You cash a winner, and a defender who is guarding two suits has to discard. Whichever guard they throw away, one of your cards becomes a winner.</p>
      <p>A squeeze needs four things:</p>
      <ul>
        <li><strong>Two threats.</strong> A <em>threat</em> is a card that would win if its suit's guard disappeared: your ♥J when the defender holds ♥K-Q, or your ♦Q when the defender holds the ♦K.</li>
        <li><strong>One defender guarding both threats.</strong> That defender is the <em>victim</em>.</li>
        <li><strong>The count.</strong> You must be able to win all the remaining tricks but one before the squeeze starts. If you have two losers, give one up first (<em>rectifying the count</em>), so the victim has no spare card to throw.</li>
        <li><strong>Entries.</strong> After the victim discards, you must still be able to reach the threat that has become a winner. Usually one threat comes with its own winner, such as ♥A-J.</li>
      </ul>
      <p>The last winner you cash is the <strong>squeeze card</strong>. A <em>positional</em> squeeze only works against the defender who discards <em>before</em> the hand holding the threats. An <em>automatic</em> squeeze works against either defender, because the hand opposite the squeeze card has a spare card to throw.</p>
      <p>The rule of thumb is: <strong>cash your winners in the other suits first and keep the threats</strong>. Then watch what the victim throws.</p>`, `
      <p><strong>לחץ</strong> (סקוויז) מייצר לקיחה יש מאין. אתם מממשים זוכה, ומגן ששומר על שתי סדרות נאלץ להשליך. על איזו שמירה שלא יוותר, אחד הקלפים שלכם הופך לזוכה.</p>
      <p>לחץ צריך ארבעה דברים:</p>
      <ul>
        <li><strong>שני איומים.</strong> <em>איום</em> הוא קלף שהיה זוכה אילו השמירה בסדרה שלו הייתה נעלמת: ה-♥J שלכם כשלמגן יש ♥K-Q, או ה-♦Q שלכם כשלמגן יש את ה-♦K.</li>
        <li><strong>מגן אחד ששומר על שני האיומים.</strong> המגן הזה הוא <em>הקורבן</em>.</li>
        <li><strong>הספירה.</strong> לפני שהלחץ מתחיל, אתם צריכים להיות מסוגלים לזכות בכל הלקיחות שנשארו פרט לאחת. אם יש לכם שני מפסידים, מסרו אחד קודם (<em>תיקון הספירה</em>), כדי שלקורבן לא יהיה קלף מיותר להשליך.</li>
        <li><strong>כניסות.</strong> אחרי שהקורבן משליך, אתם עדיין צריכים להגיע לאיום שהפך לזוכה. בדרך כלל לאחד האיומים יש זוכה משלו, כמו ♥A-J.</li>
      </ul>
      <p>הזוכה האחרון שאתם מממשים הוא <strong>קלף הלחץ</strong>. לחץ <em>מבוסס מיקום</em> עובד רק נגד המגן שמשליך <em>לפני</em> היד שמחזיקה את האיומים. לחץ <em>אוטומטי</em> עובד נגד כל אחד מהמגינים, כי ליד שמול קלף הלחץ יש קלף מיותר להשליך.</p>
      <p>כלל האצבע: <strong>ממשו קודם את הזוכים בסדרות האחרות, ושמרו את האיומים</strong>. אחר כך הסתכלו מה הקורבן משליך.</p>`),
  },
  endplay: {
    label: L('Elimination and endplays', 'ניקוי ומשחקי סיום'),
    intro: L(`
      <p>An <strong>endplay</strong> (or <em>throw-in</em>) puts a defender on lead when every card they can lead helps you. It's the answer when a finesse is likely to lose.</p>
      <p>The usual pattern is <strong>strip and throw in</strong>:</p>
      <ol>
        <li><strong>Strip:</strong> cash or ruff out the side suits, so the defender has no safe card to lead.</li>
        <li><strong>Throw in:</strong> give the defender a trick they're forced to win.</li>
        <li><strong>Collect:</strong> now they must lead into your tenace (such as A-Q, which is worth two tricks if the suit is led <em>to</em> it), or give you a <em>ruff-sluff</em>.</li>
      </ol>
      <p>A <strong>ruff-sluff</strong> happens when a defender leads a suit that both of your hands are void in. You ruff in one hand and throw a loser from the other (the "sluff"). That's why, in a trump contract, you keep a trump in <em>both</em> hands for the endplay.</p>
      <p>Do it in the right order. If you cash your last winner in a side suit too early, the defender may get rid of the card you planned to throw them in with (<em>unblocking</em>), or keep a safe card to lead.</p>`, `
      <p><strong>משחק סיום</strong> (אנדפליי, או <em>הכנסה</em>) מכניס מגן להובלה כשכל קלף שהוא יכול להוביל עוזר לכם. זה הפתרון כשעקיפה צפויה להיכשל.</p>
      <p>הדפוס הנפוץ הוא <strong>ניקוי והכנסה</strong>:</p>
      <ol>
        <li><strong>ניקוי:</strong> ממשו או חתכו את הסדרות הצדדיות, כך שלמגן לא יישאר קלף בטוח להוביל.</li>
        <li><strong>הכנסה:</strong> תנו למגן לקיחה שהוא חייב לזכות בה.</li>
        <li><strong>איסוף:</strong> עכשיו הוא חייב להוביל לתוך המזלג שלכם (כמו A-Q, ששווה שתי לקיחות כשמובילים <em>אליו</em>), או לתת לכם <em>חיתוך והשלכה</em>.</li>
      </ol>
      <p><strong>חיתוך והשלכה</strong> קורה כשמגן מוביל סדרה ששתי הידיים שלכם ריקות בה. חותכים ביד אחת ומשליכים מפסיד מהיד השנייה. לכן, בחוזה בשליט, שומרים שליט <em>בשתי</em> הידיים לקראת משחק הסיום.</p>
      <p>הסדר חשוב. אם תממשו מוקדם מדי את הזוכה האחרון בסדרה צדדית, המגן עלול להיפטר מהקלף שתכננתם להכניס אותו איתו (<em>השלכת קלף גובה</em>), או לשמור קלף בטוח להוביל.</p>`),
  },
};

// The practice hands for each section, in the form the puzzle player uses.
const DECLARER_TOPICS = (() => {
  const text = t => (t ? L(t.en || t.he, t.he || t.en) : '');
  const hands = (typeof PRACTICE !== 'undefined' && PRACTICE.declarerPlay) || [];
  const topics = {};
  for (const [key, s] of Object.entries(DECLARER_SECTIONS)) {
    topics[key] = {
      label: s.label,
      intro: s.intro,
      puzzles: hands.filter(h => h.section === key).map((h, i) => ({
        title: text(h.title) || L(`Hand ${i + 1}`, `יד ${i + 1}`),
        contract: h.contract,
        trump: h.contract[1] === 'N' ? null : h.contract[1],
        leader: h.leader,
        target: h.need ?? null,
        hands: h.hands,
        idea: text(h.note),
        solution: text(h.why),
      })),
    };
  }
  return topics;
})();

const DeclarerPlay = makePuzzleSection('dp', DECLARER_TOPICS, DECLARER_GROUPS);
