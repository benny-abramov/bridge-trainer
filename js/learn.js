// Beginner lessons. Each lesson is a title plus an HTML body; `tryIt` links to a practice tab.

const S = suitHtml('S'), H = suitHtml('H'), D = suitHtml('D'), C = suitHtml('C');

const LESSONS = [
  {
    title: 'What is bridge?',
    body: `
      <p>Bridge is a card game for <strong>four players in two partnerships</strong>.
      Players are named after compass points: <strong>North and South</strong> are partners against
      <strong>East and West</strong>. Partners sit opposite each other.</p>
      <div class="compass" aria-hidden="true">
        <span class="n">North</span><span class="w">West</span><span class="e">East</span><span class="s">South</span>
        <span class="mid">table</span>
      </div>
      <p>A standard 52-card deck is dealt out completely, so everyone holds <strong>13 cards</strong>.
      Each deal has two phases:</p>
      <ol>
        <li><strong>The auction</strong> — both sides bid to decide how many tricks one partnership promises to win, and which suit (if any) will be trumps.</li>
        <li><strong>The play</strong> — the 13 tricks are played out to see whether that promise is kept.</li>
      </ol>
      <p>You always work with your partner: your goal is to win tricks <em>as a team</em>.</p>`,
  },
  {
    title: 'Tricks',
    body: `
      <p>A <strong>trick</strong> is one card from each player, played in clockwise order.</p>
      <ul>
        <li>The first player <strong>leads</strong> any card they like.</li>
        <li>Everyone else <strong>must follow suit</strong> — play a card of the suit that was led — if they can.</li>
        <li>If you can't follow suit, you may play any card.</li>
        <li>The <strong>highest card of the suit led</strong> wins the trick (Ace is high, 2 is low) — unless a trump is played.</li>
        <li>Whoever wins the trick leads to the next one.</li>
      </ul>
      <div class="example">
        <div class="example-title">Example — West leads the 5${H}</div>
        <div class="trick-row">
          <span>West 5${H}</span><span>North Q${H}</span><span class="win">East K${H} ✓</span><span>South 2${C}</span>
        </div>
        <p class="small">South has no hearts and discards a club. East's King is the highest heart, so East wins.</p>
      </div>`,
  },
  {
    title: 'Trumps and no-trump',
    body: `
      <p>The auction may name one suit as <strong>trumps</strong>. A trump beats every card of the other suits.</p>
      <ul>
        <li>If you can't follow suit, you may play a trump (<strong>ruff</strong>) to win the trick.</li>
        <li>If more than one trump is played to a trick, the highest trump wins.</li>
        <li>You must still follow suit if you can — you can't ruff while holding a card of the suit led.</li>
      </ul>
      <p>A contract in <strong>no-trump (NT)</strong> has no trump suit: the highest card of the suit led always wins.</p>
      <div class="example">
        <div class="example-title">Example — spades are trumps, North leads the A${D}</div>
        <div class="trick-row">
          <span>North A${D}</span><span class="win">East 3${S} ✓</span><span>South 4${D}</span><span>West 7${D}</span>
        </div>
        <p class="small">East has no diamonds and ruffs with a small trump, beating the Ace.</p>
      </div>`,
  },
  {
    title: 'The auction',
    body: `
      <p>Starting with the dealer, players take turns making a <strong>call</strong>: a bid, Pass, Double or Redouble.</p>
      <p>A <strong>bid</strong> has a <em>level</em> (1–7) and a <em>strain</em> (a suit or NT).
      The level is the number of tricks <strong>over six</strong> you promise to take:
      bidding 1${H} promises 7 tricks with hearts as trumps; 4${S} promises 10 tricks with spades as trumps.</p>
      <p>Strains rank from low to high:</p>
      <div class="ranking">${C}<span>&lt;</span>${D}<span>&lt;</span>${H}<span>&lt;</span>${S}<span>&lt;</span>NT</div>
      <p>Every bid must be <strong>higher</strong> than the one before it — either a higher level, or the same level in a higher strain.
      After 1${H}, you could bid 1${S} or 1NT, but to show diamonds you'd need 2${D}.</p>
      <ul>
        <li>The auction ends when a bid is followed by <strong>three passes</strong>. The last bid becomes the <strong>contract</strong>.</li>
        <li>The <strong>declarer</strong> is whichever player of the winning side first named the contract's strain.</li>
        <li><strong>Double</strong> raises the stakes of the opponents' last bid; <strong>Redouble</strong> raises them again.</li>
      </ul>`,
  },
  {
    title: 'Declarer, dummy and defenders',
    body: `
      <p>Once the contract is set:</p>
      <ol>
        <li>The player on the <strong>declarer's left</strong> makes the <strong>opening lead</strong>.</li>
        <li>The declarer's partner then lays their whole hand face up on the table. This hand is called <strong>dummy</strong>.</li>
        <li>The declarer plays <strong>both</strong> their own cards and dummy's. Dummy's owner just watches.</li>
        <li>The other two players are the <strong>defenders</strong>. They try to win enough tricks to defeat the contract.</li>
      </ol>
      <p>In this app's <em>Play a Hand</em> tab you are always South, the declarer, and you also play North's (dummy's) cards.
      The computer defends as East and West.</p>`,
    tryIt: 'play',
  },
  {
    title: 'Counting your points',
    body: `
      <p>To judge how strong a hand is, count <strong>high-card points (HCP)</strong>:</p>
      <table class="tbl">
        <tr><th>Ace</th><th>King</th><th>Queen</th><th>Jack</th></tr>
        <tr><td>4</td><td>3</td><td>2</td><td>1</td></tr>
      </table>
      <p>There are 40 HCP in the deck, so an average hand has 10.</p>
      <p>Useful targets for the <strong>combined</strong> points of you and partner:</p>
      <table class="tbl">
        <tr><th>Combined HCP</th><th>You can usually make</th></tr>
        <tr><td>25–26</td><td>Game: 3NT, 4${H} or 4${S}</td></tr>
        <tr><td>28–29</td><td>Game in a minor: 5${C} or 5${D}</td></tr>
        <tr><td>33</td><td>Small slam (12 tricks)</td></tr>
        <tr><td>37</td><td>Grand slam (all 13 tricks)</td></tr>
      </table>
      <p>A hand's <strong>shape</strong> matters too. <strong>Balanced</strong> hands have no void, no singleton and at most one doubleton:
      4-3-3-3, 4-4-3-2 or 5-3-3-2. These hands suit no-trump.</p>`,
    tryIt: 'hcp',
  },
  {
    title: 'Opening the bidding',
    body: `
      <p>The first bid is the <strong>opening bid</strong>. This app teaches a simplified <em>Standard American</em> system:</p>
      <table class="tbl">
        <tr><th>Your hand</th><th>Open</th></tr>
        <tr><td>Fewer than 12 HCP (and no long suit)</td><td>Pass</td></tr>
        <tr><td>12–21 HCP with a 5+ card major</td><td>1${H} or 1${S} (longer major; spades with 5-5)</td></tr>
        <tr><td>12–21 HCP, no 5-card major</td><td>1${C} or 1${D} (longer minor; 1${C} with 3-3, 1${D} with 4-4)</td></tr>
        <tr><td>15–17 HCP, balanced</td><td>1NT</td></tr>
        <tr><td>20–21 HCP, balanced</td><td>2NT</td></tr>
        <tr><td>22+ HCP, any shape</td><td>2${C} (strong and artificial)</td></tr>
        <tr><td>5–10 HCP with a 6-card ${D}, ${H} or ${S} suit</td><td>Weak two: 2${D}, 2${H} or 2${S}</td></tr>
        <tr><td>5–10 HCP with a 7-card suit</td><td>Preempt at the 3-level</td></tr>
      </table>
      <p><strong>Rule of 20:</strong> with 10–11 HCP, add your HCP to the number of cards in your two longest suits.
      If the total is 20 or more, open at the 1-level anyway.</p>`,
    tryIt: 'opening',
  },
  {
    title: 'Responding to partner',
    body: `
      <p>When partner opens one of a suit, these simple guidelines get you started:</p>
      <ul>
        <li><strong>0–5 HCP:</strong> pass.</li>
        <li><strong>6+ HCP:</strong> respond. Partner may still pass, so with more strength you keep bidding.</li>
      </ul>
      <p>With 6+ HCP, choose the <strong>first</strong> of these that fits your hand:</p>
      <table class="tbl">
        <tr><th>Your hand</th><th>Respond</th></tr>
        <tr><td>3+ cards in partner's major</td><td>Raise: 2 of the major with 6–10 HCP, 3 (a <em>limit raise</em>) with 11–12</td></tr>
        <tr><td>A 4+ card suit you can bid at the 1-level</td><td>Bid it (majors before diamonds; hearts first with 4-4 in the majors)</td></tr>
        <tr><td>Support for partner's minor (4+ ${D} or 5+ ${C})</td><td>Raise: 2 of the minor with 6–10, 3 with 11–12</td></tr>
        <tr><td>6–10 HCP, none of the above</td><td>1NT</td></tr>
        <tr><td>11–12 HCP, a 4+ card lower-ranking suit (5+ for ${H})</td><td>New suit at the 2-level</td></tr>
        <tr><td>11–12 HCP, none of the above</td><td>2NT, inviting game</td></tr>
      </table>
      <p>The aim of the auction is to find an <strong>8-card fit</strong> (or settle in no-trump) and the right level for your combined strength.
      With 13+ HCP you have enough for game opposite an opening bid. Those hands use more advanced bids, so the drill doesn't include them.</p>`,
    tryIt: 'responding',
  },
  {
    title: "Opener's second bid",
    body: `
      <p>Your opening bid covers a wide range (12–21 HCP). Your second bid, the <strong>rebid</strong>, tells partner which part of that range you hold:</p>
      <table class="tbl">
        <tr><th>Minimum</th><th>Medium</th><th>Maximum</th></tr>
        <tr><td>12–14 HCP</td><td>15–17 HCP</td><td>18–21 HCP</td></tr>
      </table>
      <p><strong>When partner raises your suit</strong>, you already have a fit. Only the level is left to decide:</p>
      <table class="tbl">
        <tr><th>Partner's bid</th><th>Minimum</th><th>Medium</th><th>Maximum</th></tr>
        <tr><td>Simple raise (6–10)</td><td>Pass</td><td>Raise again to invite</td><td>Bid game</td></tr>
        <tr><td>Limit raise (11–12)</td><td>Pass</td><td>Bid game</td><td>Bid game</td></tr>
      </table>
      <p>Game in a major is 4${H}/4${S}. With a minor-suit fit, 3NT is usually easier than 5${C}/5${D}.</p>
      <p><strong>When partner bids a new suit at the 1-level</strong>, you must bid again. Choose the first of these that fits:</p>
      <ol>
        <li>4-card support for partner's major: raise to 2 (minimum), 3 (medium) or 4 (maximum).</li>
        <li>A 4-card major you can still bid at the 1-level: bid it. For example, 1${D} – 1${H} – <strong>1${S}</strong>.</li>
        <li>Balanced: 1NT with 12–14, jump to 2NT with 18–19.</li>
        <li>Otherwise use the unbalanced-hand rules below.</li>
      </ol>
      <p><strong>When partner responds 1NT</strong> (6–10, no fit): with a balanced minimum, pass. With balanced 18–19, raise to 2NT. Otherwise use the unbalanced-hand rules.</p>
      <p><strong>Unbalanced hands:</strong></p>
      <ul>
        <li>With a <strong>6-card suit</strong>, rebid it: at the 2-level with a minimum, or jump to the 3-level with 15+.</li>
        <li>With a <strong>lower-ranking second suit</strong> (4+ cards), bid it at the 2-level. With 18+, jump in it instead: a <em>jump shift</em>, forcing to game.</li>
        <li>Bidding a <strong>higher-ranking second suit</strong> at the 2-level, as in 1${D} – 1${S} – 2${H}, is a <em>reverse</em>. It needs 16+ HCP.</li>
        <li>With none of these, rebid your own suit at the 2-level.</li>
      </ul>
      <p>The drill covers these four responses: a simple raise, a limit raise, a new suit at the 1-level and 1NT.</p>`,
    tryIt: 'rebid',
  },
  {
    title: "Responder's second bid",
    body: `
      <p>After partner's rebid, you usually know enough to place the contract, or at least to say how strong you are:</p>
      <table class="tbl">
        <tr><th>Minimum</th><th>Invitational</th><th>Game values</th></tr>
        <tr><td>6–10 HCP</td><td>11–12 HCP</td><td>13+ HCP</td></tr>
      </table>
      <p>Add your points to what partner's rebid showed. With <strong>25+</strong> combined, bid game. If game depends on whether partner is at the top of their range, invite. If not, stop.</p>
      <p><strong>When partner invites game</strong> (for example 1${H} – 2${H} – 3${H}, or 1${S} – 1NT – 2NT):</p>
      <ul>
        <li>Accept with the top of your range (9–10 after a 6–10 response) by bidding game.</li>
        <li>Decline with the bottom of your range (6–8) by passing.</li>
      </ul>
      <p><strong>When partner shows a minimum</strong> (a 1NT rebid, a simple raise, or rebidding their suit at the 2-level):</p>
      <ul>
        <li>With 6–10, pass, or sign off at the 2-level in your own 6-card suit.</li>
        <li>With 11–12, invite: raise to the 3-level with a fit, or bid 2NT.</li>
      </ul>
      <p><strong>When partner shows a second suit:</strong></p>
      <ul>
        <li>With 4 cards in a newly shown major, raise it: to 2 with a minimum, to 3 to invite.</li>
        <li>Otherwise give <strong>preference</strong>. With more cards in the second suit, pass it. With equal length or more in the first suit, go back to it at the cheapest level: 1${D} – 1${S} – 2${C} – <strong>2${D}</strong>.</li>
        <li>Preference shows no extra strength. With 11–12, raise or bid 2NT to invite instead.</li>
      </ul>
      <p><strong>When partner shows a big hand</strong> (a 2NT rebid with 18–19, or a jump shift with 18+), bid game: 3NT, or 4 of a major when you have a fit.
      A <strong>reverse</strong> (16+) is forcing for one round: with a minimum, rebid a 5-card suit or give preference.</p>
      <p>The drill uses hands of 6–12 HCP. Hands with 13+ need further bidding tools, so they aren't included.</p>`,
    tryIt: 'rrebid',
  },
  {
    title: 'Overcalls and takeout doubles',
    body: `
      <p>When an opponent opens the bidding, your side can still compete. Bidding after the opponents have opened is called <strong>overcalling</strong>.
      An overcall can win the contract, push the opponents too high, or tell partner which suit to lead.</p>
      <p>When the opponent on your right opens one of a suit, choose the first of these that fits:</p>
      <table class="tbl">
        <tr><th>Your hand</th><th>Action</th></tr>
        <tr><td>15–18 HCP, balanced, with a stopper in their suit</td><td>1NT</td></tr>
        <tr><td>17+ HCP, too strong to overcall</td><td>Double, then bid your suit or no-trump</td></tr>
        <tr><td>6–10 HCP and a 6-card suit</td><td><strong>Weak jump overcall</strong>: one level higher than needed (1${H} – 2${S}, 1${S} – 3${C})</td></tr>
        <tr><td>8–16 HCP and a good 5+ card suit you can bid at the 1-level</td><td>1-level overcall</td></tr>
        <tr><td>11–16 HCP and a good 5+ card suit at the 2-level</td><td>2-level overcall</td></tr>
        <tr><td>12+ HCP, short in their suit, 3+ cards in every other suit</td><td><strong>Takeout double</strong></td></tr>
        <tr><td>Anything else</td><td>Pass</td></tr>
      </table>
      <ul>
        <li>A <strong>good suit</strong> has at least two of the top honors (A, K, Q, J, 10). With fewer than 12 HCP, only overcall with a good suit, because partner will usually lead it.</li>
        <li>A <strong>stopper</strong> is a holding that will win a trick in their suit: A, K-x, Q-x-x or J-x-x-x.</li>
        <li>A <strong>takeout double</strong> doesn't mean "I think they'll go down". It asks partner to choose a trump suit, so partner must bid even with a weak hand.</li>
      </ul>
      <p><strong>When partner overcalls</strong>, raise with 3+ card support, just as you would after an opening bid.</p>`,
    tryIt: 'overcalls',
  },
  {
    title: 'Conventions (SAYC)',
    body: `
      <p>A <strong>convention</strong> is a bid with an agreed meaning that's different from its natural meaning. For example, 2${C} over partner's 1NT says nothing about clubs.
      Both partners must know the convention. In tournaments, opponents are told about conventional bids (an <em>alert</em>).
      These are the most common conventions in the <strong>Standard American Yellow Card (SAYC)</strong> system.</p>

      <h3>Over partner's 1NT</h3>
      <ul>
        <li><strong>Stayman (2${C})</strong>: with 8+ HCP and a 4-card major, ask partner for a 4-card major. Partner bids 2${H} or 2${S} with one, or 2${D} with neither.</li>
        <li><strong>Jacoby transfers (2${D}, 2${H})</strong>: with 5+ cards in a major, bid the suit just below it. Partner must bid your major. Use them with any strength.</li>
      </ul>

      <h3>Strong 2${C}</h3>
      <p>2${C} shows 22+ HCP (or a hand with nine tricks) and is forcing. Responder bids <strong>2${D}</strong> (artificial, "waiting") with most hands.
      With 8+ HCP and a good 5-card suit (two of the top three honors), make a positive response in it (2${H}, 2${S}, 3${C}, 3${D}). With 8+ balanced, bid 2NT.</p>

      <h3>Jacoby 2NT</h3>
      <p>Over partner's 1${H} or 1${S}, a 2NT response shows <strong>4+ card support and 13+ HCP</strong>, forcing to game. Opener then describes their hand:</p>
      <table class="tbl">
        <tr><th>Opener rebids</th><th>Meaning</th></tr>
        <tr><td>New suit at the 3-level</td><td>A singleton or void in that suit</td></tr>
        <tr><td>3 of the major</td><td>18+ HCP, no shortness</td></tr>
        <tr><td>3NT</td><td>15–17 HCP, no shortness</td></tr>
        <tr><td>New suit at the 4-level</td><td>A good second 5-card suit</td></tr>
        <tr><td>4 of the major</td><td>Minimum, no shortness</td></tr>
      </table>

      <h3>Asking for aces: Blackwood and Gerber</h3>
      <p>Before bidding a slam, check that the opponents can't take two aces. <strong>Blackwood</strong> is 4NT once a trump suit is agreed.
      <strong>Gerber</strong> is a jump to 4${C} over partner's 1NT or 2NT.</p>
      <table class="tbl">
        <tr><th>Aces</th><th>Answer to Blackwood (4NT)</th><th>Answer to Gerber (4${C})</th></tr>
        <tr><td>0 or 4</td><td>5${C}</td><td>4${D}</td></tr>
        <tr><td>1</td><td>5${D}</td><td>4${H}</td></tr>
        <tr><td>2</td><td>5${H}</td><td>4${S}</td></tr>
        <tr><td>3</td><td>5${S}</td><td>4NT</td></tr>
      </table>
      <p>Then 5NT (after Blackwood) or 5${C} (after Gerber) asks for kings in the same way.</p>

      <h3>Competitive bidding</h3>
      <ul>
        <li><strong>Negative double</strong>: partner opens, the opponent on your right overcalls, and you double. It isn't for penalty: it shows the unbid suits, especially an unbid major (exactly four, or five with too few points to bid it at the 2-level). SAYC plays it through 2${S}.</li>
        <li><strong>Michaels cuebid</strong>: bidding the opponent's suit (1${C} – 2${C}) shows a 5-5 two-suiter. Over a minor it shows both majors. Over a major it shows the other major and a minor.</li>
        <li><strong>Unusual 2NT</strong>: a jump to 2NT over their opening shows 5-5 in the two <em>lowest</em> unbid suits (the minors over a major).</li>
      </ul>

      <h3>Also part of SAYC</h3>
      <ul>
        <li><strong>Weak two-bids</strong> (2${D}, 2${H}, 2${S}): see the Opening Bids lesson. A 2NT response asks opener for a "feature": an ace or king outside the long suit.</li>
        <li><strong>Fourth suit forcing</strong>: when three suits have been bid, responder's bid of the fourth suit is artificial and forces opener to keep bidding.</li>
      </ul>`,
    tryIt: 'conventions',
  },
  {
    title: 'Defense',
    body: `
      <p>When the other side wins the auction, you and partner are the <strong>defenders</strong>.
      To defeat a contract of, say, 4${S}, declarer needs 10 tricks, so you need <strong>4</strong>.</p>
      <h3>The opening lead</h3>
      <p>The player on declarer's left leads before dummy is shown, so it's the one card you choose without seeing dummy. Pick the suit first, then the card.</p>
      <p><strong>Against no-trump</strong>, set up your long suit:</p>
      <ul>
        <li>With three touching honors (K-Q-J, Q-J-10), lead the top one.</li>
        <li>Otherwise lead the <strong>fourth-highest</strong> card of your longest, strongest suit: from K-J-7-<strong>4</strong>-2, lead the 4.</li>
      </ul>
      <p><strong>Against a suit contract</strong>, take your tricks quickly and look for ruffs. In order of preference:</p>
      <table class="tbl">
        <tr><th>Holding</th><th>Lead</th></tr>
        <tr><td>A-K-x</td><td>The <strong>A</strong></td></tr>
        <tr><td>Touching honors: K-Q-x, Q-J-x, J-10-x</td><td>The top one</td></tr>
        <tr><td>A small singleton (with trumps to ruff)</td><td>The singleton</td></tr>
        <tr><td>A small doubleton: 7-3</td><td>The top: <strong>7</strong></td></tr>
        <tr><td>An honor and 3+ cards: K-9-6-3</td><td>Fourth best: <strong>3</strong> (low from K-9-3)</td></tr>
        <tr><td>Three small cards: 8-6-2</td><td>The top, "top of nothing": <strong>8</strong></td></tr>
        <tr><td>Four or more small cards: 9-7-5-2</td><td>Second highest: <strong>7</strong></td></tr>
      </table>
      <p><strong>Avoid</strong> leading low from a suit headed by the ace against a suit contract, because declarer may win a cheap king and then ruff your ace. Also avoid leading from a doubleton honor such as K-x.
      When every lead looks dangerous, a small trump is often safe.</p>
      <h3>During the play</h3>
      <ul>
        <li><strong>Second hand low:</strong> when declarer leads toward an honor, play low and save your high cards for capturing theirs.</li>
        <li><strong>Third hand high:</strong> when partner leads, play your highest card (or the cheaper of touching cards) to win the trick or push out declarer's.</li>
        <li><strong>Cover an honor with an honor:</strong> if declarer leads a queen, cover it with your king. They may have to spend their ace to win it, which can promote a lower card of yours or partner's.</li>
        <li><strong>Return partner's suit</strong> when you win a trick, unless you have something clearly better.</li>
      </ul>
      <p>Many partnerships also <em>signal</em>: playing a high spot card encourages partner to continue a suit, and a low one discourages.</p>`,
    tryIt: 'defense',
  },
  {
    title: 'Scoring basics',
    body: `
      <p>If declarer takes at least the promised number of tricks, the contract is <strong>made</strong> and declarer's side scores:</p>
      <table class="tbl">
        <tr><th>Strain</th><th>Points per trick bid (over six)</th></tr>
        <tr><td>${C} ${D} minors</td><td>20</td></tr>
        <tr><td>${H} ${S} majors</td><td>30</td></tr>
        <tr><td>NT</td><td>40 for the first, 30 for each after</td></tr>
      </table>
      <ul>
        <li>A contract worth <strong>100+</strong> trick points is a <strong>game</strong>: 3NT, 4${H}/4${S} or 5${C}/5${D}. It earns a bonus of 300 (500 when vulnerable).</li>
        <li>Smaller contracts are <strong>part-scores</strong> and earn a 50 bonus.</li>
        <li>A <strong>small slam</strong> (6-level) adds 500; a <strong>grand slam</strong> (7-level) adds 1000 (more when vulnerable).</li>
        <li><strong>Overtricks</strong> score the per-trick value.</li>
        <li>If declarer falls short, the defenders score <strong>50 per undertrick</strong> (100 vulnerable).</li>
      </ul>
      <p>The Play tab scores every hand as not vulnerable.</p>`,
    tryIt: 'play',
  },
];

const Learn = (() => {
  let index = 0;

  function render() {
    const list = document.getElementById('lesson-list');
    list.innerHTML = '';
    LESSONS.forEach((lesson, i) => {
      const btn = document.createElement('button');
      btn.textContent = `${i + 1}. ${lesson.title}`;
      btn.className = i === index ? 'active' : '';
      btn.addEventListener('click', () => { index = i; render(); });
      list.appendChild(btn);
    });

    const lesson = LESSONS[index];
    const tryLabels = { hcp: 'Practice counting points', opening: 'Practice opening bids', responding: 'Practice responding', rebid: "Practice opener's rebids", rrebid: "Practice responder's rebids", overcalls: 'Practice overcalls', conventions: 'Practice conventions', defense: 'Practice opening leads', play: 'Play a hand' };
    document.getElementById('lesson-body').innerHTML = `
      <div class="eyebrow">Lesson ${index + 1} of ${LESSONS.length}</div>
      <h2>${lesson.title}</h2>
      ${lesson.body}
      ${lesson.tryIt ? `<p><button class="btn secondary" data-goto="${lesson.tryIt}">${tryLabels[lesson.tryIt]} →</button></p>` : ''}
      <div class="lesson-nav">
        <button class="btn secondary" id="lesson-prev" ${index === 0 ? 'disabled' : ''}>← Previous</button>
        <button class="btn" id="lesson-next" ${index === LESSONS.length - 1 ? 'disabled' : ''}>Next →</button>
      </div>`;
    document.getElementById('lesson-prev').addEventListener('click', () => go(index - 1));
    document.getElementById('lesson-next').addEventListener('click', () => go(index + 1));
  }

  function go(i) {
    index = Math.max(0, Math.min(LESSONS.length - 1, i));
    render();
    document.getElementById('lesson-body').scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  return { init: render };
})();
