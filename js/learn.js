// Beginner lessons, in English and Hebrew. Each lesson is a title plus an HTML body; `tryIt` links to a practice tab.

const S = suitHtml('S'), H = suitHtml('H'), D = suitHtml('D'), C = suitHtml('C');
const B = bidHtml;
const cardText = (rank, suit) => ltr(rank + suit);

// The strain ranking in the auction lesson: a rising ladder of five tiles. Pointing at (or tapping)
// a tile highlights it and explains it in the caption below.
const STRAIN_NOTES = {
  C: L('Clubs: rank 1, the lowest strain. A minor suit.', 'קלאב: דרגה 1, סוג ההכרזה הנמוך ביותר. סדרת מיינור.'),
  D: L('Diamonds: rank 2. A minor suit.', 'דיאמונד: דרגה 2. סדרת מיינור.'),
  H: L('Hearts: rank 3. A major suit.', 'הארט: דרגה 3. סדרת מייגור.'),
  S: L('Spades: rank 4, the highest suit. A major suit.', 'ספייד: דרגה 4, הסדרה הגבוהה ביותר. סדרת מייגור.'),
  N: L(`No trump: rank 5, above every suit, so ${bidHtml('1N')} outbids ${bidHtml('1S')}.`, `ללא שליט: דרגה 5, מעל כל הסדרות, ולכן ${bidHtml('1N')} גבוהה מ-${bidHtml('1S')}.`),
};
const STRAIN_HINT = L('Point at a strain, or tap it, to see where it ranks.', 'העבירו את העכבר מעל סוג הכרזה, או הקישו עליו, כדי לראות את הדרגה שלו.');

function strainLadder() {
  const steps = ['C', 'D', 'H', 'S', 'N'].map((k, i) => `
    <div class="step" style="--i:${i}" tabindex="0" role="listitem" data-strain="${k}" aria-label="${STRAIN_NOTES[k].replace(/<[^>]*>/g, '')}">
      <div class="step-name">${k === 'N' ? L('No trump', 'ללא שליט') : SUIT_NAME[k][0].toUpperCase() + SUIT_NAME[k].slice(1)}</div>
      <div class="step-tile">${k === 'N' ? '<span class="nt">NT</span>' : suitHtml(k)}<small>${L('Rank', 'דרגה')} ${i + 1}</small></div>
    </div>`).join('');
  return `
    <div class="ladder" role="list" aria-label="${L('Strains from lowest to highest', 'סוגי ההכרזה מהנמוך לגבוה')}">
      <svg class="ladder-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><line x1="10" y1="72" x2="90" y2="22" vector-effect="non-scaling-stroke"/></svg>
      ${steps}
      <span class="ladder-end low">${L('Lowest', 'הנמוך ביותר')}</span>
      <span class="ladder-end high">${L('Highest', 'הגבוה ביותר')}</span>
    </div>
    <p class="ladder-caption muted" aria-live="polite">${STRAIN_HINT}</p>`;
}

// Every contract, grouped as part-scores, games, small slams and grand slams (scoring lesson).
function contractChart() {
  const bids = [];
  for (let level = 1; level <= 7; level++) for (const strain of 'CDHSN') bids.push(level + strain);
  const isGame = b => b[1] === 'N' ? b[0] >= 3 : 'HS'.includes(b[1]) ? b[0] >= 4 : b[0] >= 5;
  const groups = [
    { kind: 'part', title: L('Part-scores', 'חוזים חלקיים'), note: L('fewer than 100 trick points', 'פחות מ-100 נקודות לקיחה'), bids: bids.filter(b => b[0] <= 5 && !isGame(b)) },
    { kind: 'game', title: L('Games', 'משחקים מלאים'), note: L('100 or more trick points', '100 נקודות לקיחה ומעלה'), bids: bids.filter(b => b[0] <= 5 && isGame(b)) },
    { kind: 'small', title: L('Small slams', 'סלאם קטן'), note: L('12 tricks', '12 לקיחות'), bids: bids.filter(b => b[0] === '6') },
    { kind: 'grand', title: L('Grand slams', 'סלאם גדול'), note: L('all 13 tricks', 'כל 13 הלקיחות'), bids: bids.filter(b => b[0] === '7') },
  ];
  return `
    <div class="contract-chart">
      ${groups.map(g => `
        <div class="contract-group ${g.kind}">
          <div class="contract-group-title"><strong>${g.title}</strong> <span>${g.note}</span></div>
          <div class="contract-tiles">${g.bids.map(b => `<span class="contract-tile">${bidHtml(b)}</span>`).join('')}</div>
        </div>`).join('')}
    </div>`;
}

const LESSONS_EN = [
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
      <p>Bridge uses a standard deck of <strong>52 cards</strong>: four suits of 13 cards each, ranked from the ace (highest) down to the 2.</p>
      <div class="deck-figure" role="img" aria-label="The 52 cards: spades, hearts, diamonds and clubs, each from the ace down to the 2"></div>
      <p>A standard 52-card deck is dealt out completely, so everyone holds <strong>13 cards</strong>.
      Press the button to watch a deal: the dealer gives out one card at a time, clockwise.</p>
      <div class="deal-demo"></div>
      <p>Each deal has two phases:</p>
      <ol>
        <li><strong>The auction</strong> — both sides bid to decide how many tricks one partnership promises to win, and which suit (if any) will be trumps.</li>
        <li><strong>The play</strong> — the 13 tricks are played out to see whether that promise is kept.</li>
      </ol>
      <p><strong>What is a trick?</strong> A trick is four cards, one from each player in clockwise order. Everyone must play the suit that was led if they can,
      and the highest card of that suit wins the trick for its partnership. Each deal has <strong>13 tricks</strong>.</p>
      <p><strong>What is a trump?</strong> The auction may choose one suit as <strong>trumps</strong>. A trump beats any card of the other suits:
      if you have no cards in the suit led, you may play a trump and win the trick (unless someone plays a higher trump).
      A contract can also be in <strong>no-trump</strong>, where the highest card of the suit led always wins.</p>
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
        <div class="trick-picture" data-trick="W:H5 N:HQ E:HK S:C2" data-lead="W"></div>
        <p class="small">South has no hearts and discards a club. East's King is the highest heart, so East wins.</p>
      </div>
      <div class="trick-demo" data-lesson="tricks"></div>`,
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
        <div class="trick-picture" data-trick="N:DA E:S3 S:D4 W:D7" data-lead="N" data-trump="S"></div>
        <p class="small">East has no diamonds and ruffs with a small trump, beating the Ace.</p>
      </div>
      <div class="trick-demo" data-lesson="trumps"></div>`,
  },
  {
    title: 'The auction',
    body: `
      <p>Starting with the dealer, players take turns making a <strong>call</strong>: a bid, Pass, Double or Redouble.</p>
      <p>A <strong>bid</strong> has a <em>level</em> (1–7) and a <em>strain</em> (a suit or NT).
      The level is the number of tricks <strong>over six</strong> you promise to take:
      bidding 1${H} promises 7 tricks with hearts as trumps; 4${S} promises 10 tricks with spades as trumps.</p>
      <p>Strains rank from low to high:</p>
      ${strainLadder()}
      <p>Every bid must be <strong>higher</strong> than the one before it — either a higher level, or the same level in a higher strain.
      After 1${H}, you could bid 1${S} or 1NT, but to show diamonds you'd need at least 2${D}.</p>
      <ul>
        <li>The auction ends when a bid is followed by <strong>three passes</strong>. The last bid becomes the <strong>contract</strong>.</li>
        <li>The <strong>declarer</strong> is whichever player of the winning side first named the contract's strain.</li>
        <li><strong>Double</strong> raises the stakes of the opponents' last bid; <strong>Redouble</strong> raises them again.</li>
      </ul>
      <p>Here is a whole auction:</p>
      <div class="auction-picture"></div>
      <div class="auction-demo"></div>`,
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
      <p>Each side is either <strong>vulnerable</strong> or <strong>not vulnerable</strong>, and the two sides can differ. Being vulnerable raises the stakes: bigger bonuses when you make a game or slam, bigger penalties when you go down. In tournament bridge every deal is scored on its own, and the vulnerability is set in advance by the <strong>board number</strong>, in a rotating cycle: nobody vulnerable, North-South, East-West, both, and so on.</p>
      <ul>
        <li>A contract worth <strong>100+</strong> trick points is a <strong>game</strong>: 3NT, 4${H}/4${S} or 5${C}/5${D}. It earns a bonus of 300 (500 when vulnerable).</li>
        <li>Smaller contracts are <strong>part-scores</strong> and earn a 50 bonus.</li>
        <li>A <strong>small slam</strong> (6-level) adds 500; a <strong>grand slam</strong> (7-level) adds 1000 (more when vulnerable).</li>
        <li><strong>Overtricks</strong> score the per-trick value.</li>
        <li>If declarer falls short, the defenders score <strong>50 per undertrick</strong> (100 vulnerable).</li>
      </ul>
      <table class="tbl">
        <tr><th>Contract made</th><th>Bonus, not vulnerable</th><th>Bonus, vulnerable</th></tr>
        <tr><td>Part-score</td><td>50</td><td>50</td></tr>
        <tr><td>Game</td><td>300</td><td>500</td></tr>
        <tr><td>Small slam (6-level, 12 tricks)</td><td>500</td><td>750</td></tr>
        <tr><td>Grand slam (7-level, 13 tricks)</td><td>1,000</td><td>1,500</td></tr>
      </table>
      <p class="small muted">A slam is also a game, so it scores the game bonus too: a small slam not vulnerable earns 300 + 500.</p>
      <p>Here is every contract, grouped by what it scores:</p>
      ${contractChart()}
      <div class="score-demo"></div>
      <p>Play a Hand rotates the vulnerability with each new deal and shows it in the bidding box: a vulnerable side's names are red.</p>`,
    tryIt: 'play',
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
      <p>For example, South is the declarer in 4${S}. West, on South's left, makes the opening lead, and then North puts dummy on the table:</p>
      <div class="roles-demo"></div>
      <p>In this app's <em>Play a Hand</em> tab you can declare as South, also playing North's (dummy's) cards against computer defenders,
      or defend as West against a computer declarer.</p>`,
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
        <tr><td>Less than 25</td><td>Part score</td></tr>
        <tr><td>25–26</td><td>Game: 3NT, 4${H} or 4${S}</td></tr>
        <tr><td>28–29</td><td>Game in a minor: 5${C} or 5${D}</td></tr>
        <tr><td>33</td><td>Small slam (12 tricks)</td></tr>
        <tr><td>37</td><td>Grand slam (all 13 tricks)</td></tr>
      </table>
      <p>A hand's <strong>shape</strong> matters too. <strong>Balanced</strong> hands have no void, no singleton and at most one doubleton:
      4-3-3-3, 4-4-3-2 or 5-3-3-2. These hands suit no-trump.</p>
      <p>A hand with a void, a singleton or two doubletons is <strong>unbalanced</strong>. Some examples:</p>
      <div class="shape-examples"></div>`,
    tryIt: 'hcp',
  },
  {
    title: 'Opening the bidding',
    body: `
      <p>The first bid is the <strong>opening bid</strong>. This app teaches a simplified <em>Standard American</em> system. Open your <strong>longest suit</strong>, but a major (${H} or ${S}) needs at least <strong>5 cards</strong>.</p>
      <p>Because a major needs 5 cards, you will often hold a hand whose longest suit is a 4-card major (which you cannot open), or a balanced hand. Then you open a <strong>minor</strong> (${C} or ${D}), even if it is only 3 cards long.</p>
      <p>Tap a hand type to see an example:</p>
      <table class="tbl">
        <tr><th>Your hand</th><th>Open</th></tr>
        <tr><td><button class="finesse-link" type="button" data-opening="pass">Fewer than 12 HCP (and no long suit)</button></td><td>Pass</td></tr>
        <tr><td><button class="finesse-link" type="button" data-opening="major">12–22 HCP with a 5+ card major</button></td><td>1${H} or 1${S} (longer major; spades with 5${S}-5${H})</td></tr>
        <tr><td><button class="finesse-link" type="button" data-opening="minor">12–22 HCP, no 5-card major</button></td><td>1${C} or 1${D} (longer minor; 1${C} with 3${C}-3${D}, 1${D} with 4${D}-4${C})</td></tr>
        <tr><td><button class="finesse-link" type="button" data-opening="nt1">15–17 HCP, balanced</button></td><td>1NT</td></tr>
        <tr><td><button class="finesse-link" type="button" data-opening="nt2">20–22 HCP, balanced</button></td><td>2NT</td></tr>
        <tr><td><button class="finesse-link" type="button" data-opening="c2">23+ HCP, any shape</button></td><td>2${C} (strong and artificial)</td></tr>
        <tr><td><button class="finesse-link" type="button" data-opening="weak2">5–10 HCP with a good 6-card ${D}, ${H} or ${S} suit</button></td><td>Weak two: 2${D}, 2${H} or 2${S}</td></tr>
        <tr><td><button class="finesse-link" type="button" data-opening="pre3">5–10 HCP with a good 7-card suit</button></td><td>Preempt at the 3-level</td></tr>
        <tr><td><button class="finesse-link" type="button" data-opening="pre4">5–10 HCP with a good 8-card suit</button></td><td>Preempt at the 4-level</td></tr>
      </table>
      <p>A <strong>good suit</strong> for a weak two or a preempt has two of the top four honors (A, K, Q, J). With a weaker suit, pass.</p>
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
        <tr><td>3+ cards in partner's major</td><td>Raise: 2 of the major with 6–10 support points, 3 (a <em>limit raise</em>) with 11–12</td></tr>
        <tr><td>A 4+ card suit you can bid at the 1-level</td><td>Bid it (majors before diamonds; hearts first with 4-4 in the majors)</td></tr>
        <tr><td>Support for partner's minor (4+ ${D} or 5+ ${C})</td><td>Raise: 2 of the minor with 6–10 support points, 3 with 11–12 and five cards (with only four, 2NT)</td></tr>
        <tr><td>6–10 HCP, none of the above</td><td>1NT</td></tr>
        <tr><td>11+ HCP, a 4+ card lower-ranking suit (5+ for ${H})</td><td>New suit at the 2-level</td></tr>
        <tr><td>11–12 HCP, none of the above</td><td>2NT, inviting game</td></tr>
        <tr><td>13–15 HCP, none of the above</td><td>3NT, bidding game</td></tr>
      </table>
      <p><strong>Support points.</strong> When you have support for partner's suit, your short suits help too: as dummy you can ruff declarer's losers in them. So add <strong>1 point for a doubleton, 2 for a singleton and 3 for a void</strong> to your HCP. For example, after partner's 1${S}, a hand with 4 spades, 8 HCP and a singleton has 10 support points: raise to 2${S}. The same goes for any hand that raises partner, including opener raising responder's suit. Only the hand with the shorter trumps counts its short suits. The hand with the longer trumps, the one partner raised, counts <strong>length points</strong> instead: 1 for each card beyond four in any suit, trumps or a long side suit (1 for five, 2 for six, and so on).</p>
      <p>The aim of the auction is to find an <strong>8-card fit</strong> (or settle in no-trump) and the right level for your combined strength.
      With 13+ HCP you have enough for game opposite an opening bid. Those hands use more advanced bids, so the drill doesn't include them.</p>`,
    tryIt: 'responding',
  },
  {
    title: "Opener's second bid",
    body: `
      <p>Your opening bid covers a wide range (12–22 HCP). Your second bid, the <strong>rebid</strong>, tells partner which part of that range you hold:</p>
      <table class="tbl">
        <tr><th>Minimum</th><th>Medium</th><th>Maximum</th></tr>
        <tr><td>12–14 HCP</td><td>15–17 HCP</td><td>18–22 HCP</td></tr>
      </table>
      <p><strong>When partner raises your suit</strong>, you already have a fit. Only the level is left to decide:</p>
      <table class="tbl">
        <tr><th>Partner's bid</th><th>Minimum</th><th>Medium</th><th>Maximum</th></tr>
        <tr><td>Simple raise (6–10)</td><td>Pass</td><td>Raise again to invite</td><td>Bid game</td></tr>
        <tr><td>Limit raise (11–12)</td><td>Pass with 12–13, bid game with 14</td><td>Bid game</td><td>Bid game</td></tr>
      </table>
      <p>Game in a major is 4${H}/4${S}. With a minor-suit fit, 3NT is usually easier than 5${C}/5${D}.</p>
      <p><strong>When partner bids a new suit at the 1-level</strong>, you must bid again. Choose the first of these that fits:</p>
      <ol>
        <li>4-card support for partner's major: raise to 2 (minimum), 3 (medium) or 4 (maximum).</li>
        <li>A 4-card major you can still bid at the 1-level: bid it. For example, 1${D} – 1${H} – <strong>1${S}</strong>.</li>
        <li>Balanced: 1NT with 12–14, jump to 2NT with 18–19.</li>
        <li>Otherwise use the unbalanced-hand rules below.</li>
      </ol>
      <p><strong>When partner responds 1NT</strong> (6–10, no fit, not forcing): with a balanced minimum, pass. With balanced 18–19, raise to 2NT. Otherwise use the unbalanced-hand rules, but don't rebid a 5-card suit: rebidding promises six. With a minimum, a 5-card suit and no lower second suit (a higher one would be a reverse), pass 1NT.</p>
      <p><strong>When partner bids a new suit at the 2-level</strong> (a <em>two over one</em>, such as 1${S} – 2${C}), partner has 11+ HCP and you must bid again. Raise partner's hearts with 3 (or a minor with 4, if unbalanced). With a balanced hand, <strong>2NT shows 12–14</strong> and <strong>3NT shows 18–19</strong>. Otherwise use the unbalanced-hand rules; a new suit that needs the 3-level shows 15+.</p>
      <p><strong>Unbalanced hands:</strong></p>
      <ul>
        <li>With a <strong>6-card suit</strong>, rebid it: at the 2-level with a minimum (12–15), or jump to the 3-level with 16–17. Count 1 extra point for each card beyond four. With 18+, bid game in a major, or 3NT, or jump in a second suit.</li>
        <li>With a <strong>lower-ranking second suit</strong> (4+ cards), bid it at the 2-level. With 18+, jump in it instead: a <em>jump shift</em>, forcing to game.</li>
        <li>Bidding a <strong>higher-ranking second suit</strong> at the 2-level, as in 1${D} – 1${S} – 2${H}, is a <em>reverse</em>. It needs 16+ HCP.</li>
        <li>With none of these, rebid your own suit at the 2-level.</li>
      </ul>
      <p>The drill covers these five responses: a simple raise, a limit raise, a new suit at the 1-level, 1NT and a new suit at the 2-level.</p>`,
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
        <li>After a 1NT rebid, with 6–10 and an unbalanced hand with a lower-ranking second suit (5-4 or longer), bid it at the 2-level, as in 1${D} – 1${S} – 1NT – <strong>2${C}</strong>. It isn't forcing: partner passes or goes back to your first suit.</li>
        <li>With 11–12, invite: raise to the 3-level with a fit, or bid 2NT.</li>
        <li>With 13+, bid game: in your 8-card fit if you have one, otherwise 3NT.</li>
      </ul>
      <p><strong>When partner shows a second suit:</strong></p>
      <ul>
        <li>With 4 cards in a newly shown major, raise it: to 2 with a minimum, to 3 to invite.</li>
        <li>Otherwise give <strong>preference</strong> by comparing the fits, not just your own lengths. A major opening has five cards and the second suit four, so with equal fits go back to the first suit at the cheapest level: with 2${S} and 3${H}, 1${S} – 1NT – 2${H} – <strong>2${S}</strong> (5-2 and 4-3 are both 7-card fits). Pass only when the second suit makes the longer fit.</li>
        <li>After your 1NT response, partner's new suit can still hold up to 17, so with 8–10 keep the auction going: raise to 3 with 4-card support, otherwise bid 2NT to invite.</li>
        <li>Preference shows no extra strength. With 11–12, raise or bid 2NT to invite instead.</li>
        <li>With 13+, bid game: 4 of a major with an 8-card fit, otherwise 3NT.</li>
      </ul>
      <p><strong>When partner shows a big hand</strong> (a 2NT rebid with 18–19, or a jump shift with 18+), bid game: 3NT, or 4 of a major when you have a fit.
      A <strong>reverse</strong> (16+) is forcing for one round: with a minimum, rebid a 5-card suit or give preference.</p>
      <p>The drill uses hands of 6–12 HCP. Hands with 13+ often need further bidding tools, so they aren't included.</p>`,
    tryIt: 'rrebid',
  },
  {
    title: 'Overcalls and takeout doubles',
    body: `
      <p>When an opponent opens the bidding, your side can still compete. Bidding after the opponents have opened is called <strong>overcalling</strong>.
      An overcall can win the contract, push the opponents too high, or tell partner which suit to lead.</p>
      <p>When the opponent on your right opens one of a suit, find the row that fits your hand. Tap a row to see examples:</p>
      <table class="tbl">
        <tr><th>Your hand</th><th>Action</th></tr>
        <tr><td><button class="finesse-link" type="button" data-overcall="o1">8–16 HCP and a good 5+ card suit you can bid at the 1-level</button></td><td>1-level overcall</td></tr>
        <tr><td><button class="finesse-link" type="button" data-overcall="o2">11–16 HCP and a good 5+ card suit at the 2-level</button></td><td>2-level overcall</td></tr>
        <tr><td><button class="finesse-link" type="button" data-overcall="tox">12+ HCP, short in their suit, 3+ cards in every other suit</button></td><td><strong>Takeout double</strong></td></tr>
        <tr><td><button class="finesse-link" type="button" data-overcall="nt">15–18 HCP, balanced, with a stopper in their suit</button></td><td>1NT</td></tr>
        <tr><td><button class="finesse-link" type="button" data-overcall="strongx">17+ HCP, too strong to overcall</button></td><td>Double, then bid your suit or no-trump</td></tr>
        <tr><td><button class="finesse-link" type="button" data-overcall="wjo">6–10 HCP and a good 6-card suit (two of A, K, Q, J)</button></td><td><strong>Weak jump overcall</strong> at the 2-level: one level higher than needed (1${H} – 2${S}). A jump to the 3-level needs seven cards.</td></tr>
        <tr><td><button class="finesse-link" type="button" data-overcall="pre">6–10 HCP and a good 7-card suit (two of A, K, Q, J)</button></td><td><strong>Preempt</strong> at the 3-level (1${C} – 3${H})</td></tr>
        <tr><td><button class="finesse-link" type="button" data-overcall="pass">Anything else</button></td><td>Pass</td></tr>
      </table>
      <ul>
        <li>When more than one row fits, a weak hand (6–10 HCP) with a 6- or 7-card suit makes the jump, not a simple overcall. A balanced 15–18 with a stopper prefers 1NT.</li>
        <li>A <strong>good suit</strong> has at least two of the top honors (A, K, Q, J, 10). With fewer than 12 HCP, only overcall with a good suit, because partner will usually lead it.</li>
        <li>A <strong>stopper</strong> is a holding that will win a trick in their suit: A, K-x, Q-x-x or J-x-x-x.</li>
        <li>A <strong>takeout double</strong> doesn't mean "I think they'll go down". It asks partner to choose a trump suit, so partner must bid even with a weak hand.</li>
      </ul>
      <p><strong>When partner overcalls</strong>, raise with 3+ card support, just as you would after an opening bid.</p>`,
    tryIt: 'overcalls',
  },
  {
    title: 'Conventions',
    body: `
      <p>A <strong>convention</strong> is a bid with an agreed meaning that's different from its natural meaning. For example, 2${C} over partner's 1NT says nothing about clubs.
      Both partners must know the convention. In tournaments, opponents are told about conventional bids (an <em>alert</em>).
      These are the most common conventions in the <strong>Standard American Yellow Card (SAYC)</strong> system.</p>

      <h3>Over partner's 1NT</h3>
      <ul>
        <li><strong>Stayman (2${C})</strong>: with 8+ HCP and a 4-card major, ask partner for a 4-card major. Partner bids 2${H} or 2${S} with one, or 2${D} with neither.</li>
        <li><strong>Puppet Stayman (3${C})</strong>: with game values and a 3- or 4-card major, ask partner for a 4- or 5-card major. Partner bids 3${H} or 3${S} with five cards, 3${D} with a 4-card major, or 3NT with neither.
          After 3${D}, bid the major you <em>don't</em> have (3${H} shows four spades, 3${S} shows four hearts), so the strong hand plays the contract.</li>
        <li><strong>Jacoby transfers (2${D}, 2${H}, 4${D}, 4${H})</strong>: with 5+ cards in a major, bid the suit just below it. Partner must bid your major. Use them with any strength.
          With a 6+ card major and enough for game, transfer at the 4-level: <strong>4${D}</strong> asks partner to bid 4${H}, and <strong>4${H}</strong> asks for 4${S}.
          <details class="why-more">
            <summary class="btn secondary">💡 Why use transfers?</summary>
            <div class="why-body">
              <p><strong>The strong hand is hidden.</strong> Partner bids your major first, so the 1NT opener becomes declarer. Their strong hand stays face-down,
              and the opening lead comes <em>into</em> their honors (like A-Q) instead of through them.</p>
              <p><strong>You get a second bid.</strong> Partner's answer is automatic, so you can bid again and show your strength:</p>
              <ul>
                <li><strong>Weak (0–7 HCP):</strong> transfer, then pass. You play in your long suit at the 2-level, safer than 1NT.</li>
                <li><strong>Invitational (8–9 HCP):</strong> transfer, then 2NT with five cards or 3 of the major with six. Partner goes to game with a maximum.</li>
                <li><strong>Game (10+ HCP):</strong> transfer, then 3NT with five cards (partner chooses 3NT or 4 of the major) or 4 of the major with six.</li>
              </ul>
              <p><strong>4-level transfers</strong> (4${D}, 4${H}) are for a 6+ card major, game values and no interest in slam. With slam interest, start with
              a 2-level transfer and bid again after it.</p>
            </div>
          </details></li>
      </ul>

      <h3>Over partner's 2NT</h3>
      <p>A 2NT opening shows 20–22 HCP, balanced, so 4–5 HCP opposite are enough for game. The conventions work one level higher:</p>
      <ul>
        <li><strong>Stayman (3${C})</strong>: with 4+ HCP and a 4-card major, ask for partner's 4-card major: 3${H}, 3${S}, or 3${D} with neither. Many pairs play 3${C} as <strong>Puppet Stayman</strong>, which also finds a 5-card major.</li>
        <li><strong>Jacoby transfers (3${D}, 3${H}, 4${D}, 4${H})</strong>: with 5+ cards in a major, bid 3${D} or 3${H} and partner bids 3${H} or 3${S}. With five, then bid 3NT and let partner choose; with six, raise to game.
          With a 6+ card major you can also transfer at the 4-level: <strong>4${D}</strong> asks partner to bid 4${H}, and <strong>4${H}</strong> asks for 4${S}.</li>
        <li><strong>3NT</strong>: to play, with 4–10 HCP and no major to show. <strong>4${C}</strong> is Gerber, asking for aces.</li>
      </ul>

      <h3>Strong 2${C}</h3>
      <p>2${C} shows 23+ HCP (or a hand with nine tricks) and is forcing. Responder bids <strong>2${D}</strong> (artificial, "waiting") with most hands.
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
      <p><strong>Against no-trump</strong>, set up your long suit. A suit with a sequence comes first:</p>
      <table class="tbl">
        <tr><th>Holding</th><th>Lead</th></tr>
        <tr><td>Three touching honors: <span class="holding"><strong>K</strong>-Q-J</span>, <span class="holding"><strong>Q</strong>-J-10</span>, <span class="holding"><strong>J</strong>-10-9</span></td><td>The top one</td></tr>
        <tr><td>Broken sequence ("2½" honors): <span class="holding"><strong>K</strong>-Q-10</span>, <span class="holding"><strong>Q</strong>-J-9</span>, <span class="holding"><strong>J</strong>-10-8</span></td><td>The top one</td></tr>
        <tr><td>Interior sequence: <span class="holding">A-<strong>J</strong>-10</span>, <span class="holding">K-<strong>J</strong>-10</span></td><td>The <strong>J</strong></td></tr>
        <tr><td>Interior sequence: <span class="holding">K-<strong>10</strong>-9</span>, <span class="holding">Q-<strong>10</strong>-9</span></td><td>The <strong>10</strong></td></tr>
        <tr><td>No sequence: your longest, strongest suit, <span class="holding">K-J-7-<strong>4</strong>-2</span></td><td>Fourth best: <strong>4</strong></td></tr>
      </table>
      <p><strong>Against a suit contract</strong>, take your tricks quickly and look for ruffs. In order of preference:</p>
      <table class="tbl">
        <tr><th>Holding</th><th>Lead</th></tr>
        <tr><td><strong>A</strong>-K-x</td><td>The <strong>A</strong></td></tr>
        <tr><td>Touching honors: <span class="holding"><strong>K</strong>-Q-x</span>, <span class="holding"><strong>Q</strong>-J-x</span>, <span class="holding"><strong>J</strong>-10-x</span></td><td>The top one</td></tr>
        <tr><td>A small singleton (with trumps to ruff)</td><td>The singleton</td></tr>
        <tr><td>A small doubleton: <span class="holding"><strong>7</strong>-3</span></td><td>The top: <strong>7</strong></td></tr>
        <tr><td>An honor and 3+ cards: <span class="holding">K-9-6-<strong>3</strong></span></td><td>Fourth best: <strong>3</strong> (low from <span class="holding">K-9-<strong>3</strong></span>)</td></tr>
        <tr><td>Three small cards: <span class="holding"><strong>8</strong>-6-2</span></td><td>The top, "top of nothing": <strong>8</strong></td></tr>
        <tr><td>Four or more small cards: <span class="holding">9-<strong>7</strong>-5-2</span></td><td>Second highest: <strong>7</strong></td></tr>
      </table>
      <p><strong>Avoid</strong> leading low from a suit headed by the ace against a suit contract, because declarer may win a cheap king and then ruff your ace. Also avoid leading from a doubleton honor such as K-x.
      When every lead looks dangerous, a small trump is often safe.</p>
      <h3>During the play</h3>
      <p>Tap a rule to see an example.</p>
      <ul>
        <li><button class="finesse-link" type="button" data-finesse="second">Second hand low</button>: when declarer leads toward an honor, play low and save your high cards for capturing theirs.</li>
        <li><button class="finesse-link" type="button" data-finesse="third">Third hand high</button>: when partner leads, play your highest card (or the cheaper of touching cards) to win the trick or push out declarer's.</li>
        <li><button class="finesse-link" type="button" data-finesse="cover">Cover an honor with an honor</button>: if declarer leads a queen, cover it with your king. They may have to spend their ace to win it, which can promote a lower card of yours or partner's.</li>
        <li><button class="finesse-link" type="button" data-finesse="return">Return partner's suit</button> when you win a trick, unless you have something clearly better.</li>
      </ul>
      <p>Many partnerships also <em>signal</em>: playing a high spot card encourages partner to continue a suit, and a low one discourages.</p>`,
    tryIt: 'defense',
  },
  {
    title: 'Declarer play',
    body: `
      <p>As declarer you play both your own hand and dummy. Before you play to the first trick, make a plan:</p>
      <ol>
        <li><strong>Count your sure tricks</strong>: winners you can take without giving up the lead.</li>
        <li><strong>Compare with the target</strong>: how many more tricks do you need?</li>
        <li><strong>Choose how to find them</strong>, using the techniques below.</li>
      </ol>
      <h3>Drawing trumps</h3>
      <ul>
        <li>In a trump contract the defenders' trumps are a danger: they can <strong>ruff your winners</strong>. <em>Drawing trumps</em> means leading trumps until the defenders have none left, so your winners in the other suits are safe.</li>
        <li><strong>Count the defenders' trumps.</strong> With eight trumps between your hand and dummy, they hold five. Watch them follow, and stop once they're all gone: don't waste trumps you may need later.</li>
        <li><strong>Draw trumps early</strong>, before cashing winners in the side suits, unless you need dummy's trumps for ruffing (see below) or must first get rid of a fast loser.</li>
      </ul>
      <h3>Developing suits</h3>
      <ul>
        <li><strong>Promotion:</strong> with K-Q-J, give up one trick to the ace and the other two cards become winners.</li>
        <li><strong>Length:</strong> once the defenders run out of a suit, your small cards in it win too.</li>
        <li>Develop your suit early, while you still have stoppers in the defenders' suits, and keep an entry to the long hand (sometimes by ducking a round).</li>
      </ul>
      <h3>Ruffing losers</h3>
      <ul>
        <li>In a trump contract, <strong>ruff losers in the hand with fewer trumps</strong> (usually dummy). Each ruff there is an extra trick; ruffing in the long trump hand gains nothing.</li>
        <li>Ruff <strong>before</strong> drawing trumps, or dummy's trumps disappear. Draw trumps once the ruffs are done.</li>
      </ul>
      <h3>Finesses</h3>
      <p>A finesse wins a trick with a card that isn't the highest. The rule is: <strong>lead from the opposite hand toward the card you hope will win</strong>. Tap a kind to see where the missing cards can be.</p>
      <table class="tbl">
        <tr><th>Kind</th><th>Holding (dummy / you)</th><th>How</th></tr>
        <tr><td><button class="finesse-link" type="button" data-finesse="simple">Simple finesse</button></td><td>A-Q / x-x</td><td>Lead toward A-Q and play the queen</td></tr>
        <tr><td><button class="finesse-link" type="button" data-finesse="toward">Leading toward an honor</button></td><td>x-x / K-x</td><td>Lead from dummy toward the king</td></tr>
        <tr><td><button class="finesse-link" type="button" data-finesse="queen">Finesse against the queen</button></td><td>A-K-J / x-x-x</td><td>Lead toward dummy and play the jack</td></tr>
        <tr><td><button class="finesse-link" type="button" data-finesse="kj">Leading toward K-J</button></td><td>K-J-x / x-x-x</td><td>Lead low toward dummy and play the jack. If it loses to the queen, lead toward the king later: it wins when West has the ace</td></tr>
        <tr><td><button class="finesse-link" type="button" data-finesse="double">Double finesse</button></td><td>A-Q-10 / x-x-x</td><td>Finesse the 10 first, then the queen</td></tr>
        <tr><td><button class="finesse-link" type="button" data-finesse="ruffing">Ruffing finesse</button></td><td>A-Q-J / void</td><td>Lead the queen; ruff if covered, otherwise throw a loser</td></tr>
      </table>
      <p>The Declarer Play tab covers these and more (drawing trumps, cross ruff, hold up, ducking, safety plays), each with practice hands.</p>`,
    tryIt: 'declarer',
  },
  {
    title: 'Advanced techniques',
    body: `
      <p>Once the basics feel comfortable, two techniques win tricks that look impossible.</p>
      <h3>Squeezes</h3>
      <p>Cash your winners until a defender who is guarding two suits has to discard one of the guards. A squeeze needs two threats, one defender guarding both, the right count (you can win all the remaining tricks but one) and entries.</p>
      <h3>Endplays</h3>
      <p>Strip the side suits, then throw a defender in with a trick they're forced to win. They then have to lead into your tenace (such as A-Q) or give you a ruff-sluff.</p>
      <p>The Declarer Play tab explains both in more detail (under <em>Expert play</em>), with practice hands against perfect defense.</p>`,
    tryIt: 'declarer',
  },
];

const LESSONS_HE = [
  {
    title: 'מהו ברידג\'?',
    body: `
      <p>ברידג' הוא משחק קלפים ל<strong>ארבעה שחקנים בשני זוגות</strong>.
      השחקנים נקראים על שם כיווני המצפן: <strong>צפון ודרום</strong> הם שותפים מול <strong>מזרח ומערב</strong>. השותפים יושבים זה מול זה.</p>
      <div class="compass" aria-hidden="true">
        <span class="n">צפון</span><span class="w">מערב</span><span class="e">מזרח</span><span class="s">דרום</span>
        <span class="mid">שולחן</span>
      </div>
      <p>בברידג' משחקים עם חפיסה רגילה של <strong>52 קלפים</strong>: ארבע סדרות של 13 קלפים כל אחת, מהאס (הגבוה ביותר) ועד ה-2.</p>
      <div class="deck-figure" role="img" aria-label="52 הקלפים: ספייד, הארט, דיאמונד וקלאב, כל סדרה מהאס ועד ה-2"></div>
      <p>חפיסה רגילה של 52 קלפים מחולקת כולה, כך שלכל שחקן יש <strong>13 קלפים</strong>. לחצו על הכפתור כדי לראות חלוקה: המחלק נותן קלף אחד בכל פעם, לפי כיוון השעון.</p>
      <div class="deal-demo"></div>
      <p>לכל חלוקה שני שלבים:</p>
      <ol>
        <li><strong>המכרז</strong>: שני הצדדים מכריזים כדי לקבוע כמה לקיחות זוג אחד מתחייב לקחת, ואיזו סדרה (אם בכלל) תהיה השליט.</li>
        <li><strong>המשחק</strong>: משחקים את 13 הלקיחות כדי לראות אם ההתחייבות מתקיימת.</li>
      </ol>
      <p><strong>מהי לקיחה?</strong> לקיחה היא ארבעה קלפים, אחד מכל שחקן, בסדר עם כיוון השעון. כל אחד חייב לשחק בסדרה שהובלה אם יש לו קלף בה,
      והקלף הגבוה ביותר בסדרה הזו זוכה בלקיחה עבור הזוג שלו. בכל חלוקה יש <strong>13 לקיחות</strong>.</p>
      <p><strong>מהו שליט?</strong> במכרז אפשר לבחור סדרה אחת כ<strong>שליט</strong>. קלף שליט גובר על כל קלף מהסדרות האחרות:
      אם אין לכם קלפים בסדרה שהובלה, אפשר לשחק שליט ולזכות בלקיחה (אלא אם מישהו משחק שליט גבוה יותר).
      חוזה יכול להיות גם <strong>ללא שליט</strong>, ואז הקלף הגבוה ביותר בסדרה שהובלה תמיד זוכה.</p>
      <p>תמיד משחקים יחד עם השותף: המטרה היא לזכות בלקיחות <em>כצוות</em>.</p>`,
  },
  {
    title: 'לקיחות',
    body: `
      <p><strong>לקיחה</strong> היא קלף אחד מכל שחקן, לפי כיוון השעון.</p>
      <ul>
        <li>השחקן הראשון <strong>מוביל</strong> כל קלף שהוא רוצה.</li>
        <li>כל השאר <strong>חייבים לשרת</strong>, כלומר לשחק קלף מהסדרה שהובלה, אם יש להם.</li>
        <li>מי שאין לו קלף בסדרה שהובלה רשאי לשחק כל קלף.</li>
        <li><strong>הקלף הגבוה ביותר בסדרה שהובלה</strong> זוכה בלקיחה (האס הכי גבוה, ה-2 הכי נמוך), אלא אם שוחק שליט.</li>
        <li>מי שזכה בלקיחה מוביל ללקיחה הבאה.</li>
      </ul>
      <div class="example">
        <div class="example-title">דוגמה: מערב מוביל ${cardText(5, H)}</div>
        <div class="trick-picture" data-trick="W:H5 N:HQ E:HK S:C2" data-lead="W"></div>
        <p class="small">לדרום אין הארט, והוא משליך קלאב. המלך של מזרח הוא ההארט הגבוה ביותר, ולכן מזרח זוכה.</p>
      </div>
      <div class="trick-demo" data-lesson="tricks"></div>`,
  },
  {
    title: 'שליט וללא שליט',
    body: `
      <p>המכרז יכול לקבוע סדרה אחת כ<strong>שליט</strong>. קלף שליט גובר על כל קלף מהסדרות האחרות.</p>
      <ul>
        <li>מי שאין לו קלף בסדרה שהובלה רשאי לשחק שליט (<strong>לחתוך</strong>) ולזכות בלקיחה.</li>
        <li>אם שוחק יותר משליט אחד בלקיחה, השליט הגבוה זוכה.</li>
        <li>עדיין חובה לשרת אם אפשר: אי אפשר לחתוך כשיש בידכם קלף מהסדרה שהובלה.</li>
      </ul>
      <p>בחוזה <strong>ללא שליט (NT)</strong> אין סדרת שליט: הקלף הגבוה בסדרה שהובלה זוכה תמיד.</p>
      <div class="example">
        <div class="example-title">דוגמה: ספייד הוא השליט, צפון מוביל ${cardText('A', D)}</div>
        <div class="trick-picture" data-trick="N:DA E:S3 S:D4 W:D7" data-lead="N" data-trump="S"></div>
        <p class="small">למזרח אין דיאמונד, והוא חותך בשליט קטן שגובר על האס.</p>
      </div>
      <div class="trick-demo" data-lesson="trumps"></div>`,
  },
  {
    title: 'המכרז',
    body: `
      <p>החל מהמחלק, השחקנים מכריזים לפי התור: <strong>הכרזה</strong>, פאס, דאבל או רידאבל.</p>
      <p>להכרזה יש <em>רמה</em> (1-7) ו<em>סוג הכרזה</em> (סדרה או NT).
      הרמה היא מספר הלקיחות <strong>מעבר לשש</strong> שאתם מתחייבים לקחת:
      ${B('1H')} מתחייבת ל-7 לקיחות עם הארט כשליט, ו-${B('4S')} מתחייבת ל-10 לקיחות עם ספייד כשליט.</p>
      <p>סדר סוגי ההכרזה, מהנמוך לגבוה:</p>
      ${strainLadder()}
      <p>כל הכרזה חייבת להיות <strong>גבוהה</strong> מקודמתה: ברמה גבוהה יותר, או באותה רמה בסוג הכרזה גבוה יותר.
      אחרי ${B('1H')} אפשר להכריז ${B('1S')} או 1NT, אבל כדי להראות דיאמונד צריך ${B('2D')}.</p>
      <ul>
        <li>המכרז מסתיים כשאחרי הכרזה באים <strong>שלושה פאסים</strong>. ההכרזה האחרונה היא <strong>החוזה</strong>.</li>
        <li><strong>הכרוז</strong> הוא השחקן מהצד הזוכה שהיה הראשון להכריז את סוג ההכרזה של החוזה.</li>
        <li><strong>דאבל</strong> מעלה את הסיכון בהכרזה האחרונה של היריבים; <strong>רידאבל</strong> מעלה אותו שוב.</li>
      </ul>
      <p>כך נראה מכרז שלם:</p>
      <div class="auction-picture"></div>
      <div class="auction-demo"></div>`,
  },
  {
    title: 'יסודות הניקוד',
    body: `
      <p>אם הכרוז לוקח לפחות את מספר הלקיחות שהתחייב אליו, החוזה <strong>בוצע</strong> והצד של הכרוז מקבל ניקוד:</p>
      <table class="tbl">
        <tr><th>סוג הכרזה</th><th>נקודות לכל לקיחה מוכרזת (מעבר לשש)</th></tr>
        <tr><td>${C} ${D} סדרות מיינור</td><td>20</td></tr>
        <tr><td>${H} ${S} סדרות מייגור</td><td>30</td></tr>
        <tr><td>NT</td><td>40 לראשונה, 30 לכל אחת אחריה</td></tr>
      </table>
      <p>כל צד הוא <strong>פגיע</strong> או <strong>לא פגיע</strong>, ושני הצדדים יכולים להיות במצב שונה. פגיעות מעלה את הסיכון: בונוסים גדולים יותר כשמבצעים משחק מלא או סלאם, וקנסות גדולים יותר כשנופלים. בברידג' תחרותי כל חלוקה מנוקדת בנפרד, והפגיעות נקבעת מראש לפי <strong>מספר הבורד</strong>, במחזוריות קבועה: אף צד לא פגיע, צפון-דרום, מזרח-מערב, שני הצדדים, וחוזר חלילה.</p>
      <ul>
        <li>חוזה ששווה <strong>100 נקודות לקיחה ומעלה</strong> הוא <strong>משחק מלא</strong>: 3NT, ${B('4H')} או ${B('4S')}, ${B('5C')} או ${B('5D')}. הוא מזכה בבונוס של 300 (500 כשפגיעים).</li>
        <li>חוזים קטנים יותר הם <strong>חוזים חלקיים</strong> ומזכים בבונוס של 50.</li>
        <li><strong>סלאם קטן</strong> (רמת 6) מוסיף 500, ו<strong>סלאם גדול</strong> (רמת 7) מוסיף 1000 (יותר כשפגיעים).</li>
        <li><strong>לקיחות עודפות</strong> מקבלות את ערך הלקיחה.</li>
        <li>אם הכרוז לא מגיע ליעד, המגינים מקבלים <strong>50 על כל לקיחה חסרה</strong> (100 כשפגיעים).</li>
      </ul>
      <table class="tbl">
        <tr><th>חוזה שבוצע</th><th>בונוס, לא פגיעים</th><th>בונוס, פגיעים</th></tr>
        <tr><td>חוזה חלקי</td><td>50</td><td>50</td></tr>
        <tr><td>משחק מלא</td><td>300</td><td>500</td></tr>
        <tr><td>סלאם קטן (רמה 6, 12 לקיחות)</td><td>500</td><td>750</td></tr>
        <tr><td>סלאם גדול (רמה 7, 13 לקיחות)</td><td>1,000</td><td>1,500</td></tr>
      </table>
      <p class="small muted">סלאם הוא גם משחק מלא, ולכן הוא מקבל גם את בונוס המשחק המלא: סלאם קטן כשלא פגיעים מזכה ב-300 + 500.</p>
      <p>הנה כל החוזים, לפי סוג הניקוד שלהם:</p>
      ${contractChart()}
      <div class="score-demo"></div>
      <p>בלשונית "שחקו יד" הפגיעות מתחלפת בכל חלוקה חדשה ומוצגת בתיבת ההכרזות: השמות של צד פגיע מסומנים באדום.</p>`,
    tryIt: 'play',
  },
  {
    title: 'כרוז, דומם ומגינים',
    body: `
      <p>כשהחוזה נקבע:</p>
      <ol>
        <li>השחקן <strong>משמאל לכרוז</strong> מבצע את <strong>הובלת הפתיחה</strong>.</li>
        <li>השותף של הכרוז פורש את כל היד שלו גלויה על השולחן. יד זו נקראת <strong>הדומם</strong>.</li>
        <li>הכרוז משחק <strong>גם</strong> את הקלפים שלו וגם את קלפי הדומם. בעל הדומם רק צופה.</li>
        <li>שני השחקנים האחרים הם <strong>המגינים</strong>. הם מנסים לזכות במספיק לקיחות כדי להפיל את החוזה.</li>
      </ol>
      <p>לדוגמה, דרום הוא הכרוז ב-${B('4S')}. מערב, משמאל לדרום, מבצע את הובלת הפתיחה, ואז צפון פורש את הדומם על השולחן:</p>
      <div class="roles-demo"></div>
      <p>בלשונית <em>שחקו יד</em> אפשר לשחק ככרוז בדרום (ולשחק גם את קלפי הדומם בצפון) מול מגינים ממוחשבים,
      או להגן במערב מול כרוז ממוחשב.</p>`,
    tryIt: 'play',
  },
  {
    title: 'ספירת נקודות',
    body: `
      <p>כדי להעריך את כוח היד, סופרים <strong>נקודות גבוהות</strong> (נק'):</p>
      <table class="tbl">
        <tr><th>אס</th><th>מלך</th><th>מלכה</th><th>נסיך</th></tr>
        <tr><td>4</td><td>3</td><td>2</td><td>1</td></tr>
      </table>
      <p>בחפיסה יש 40 נקודות, כך שביד ממוצעת יש 10.</p>
      <p>יעדים שימושיים לנקודות <strong>המשותפות</strong> שלכם ושל השותף:</p>
      <table class="tbl">
        <tr><th>נקודות משותפות</th><th>בדרך כלל אפשר לבצע</th></tr>
        <tr><td>פחות מ-25</td><td>חוזה חלקי</td></tr>
        <tr><td>25-26</td><td>משחק מלא: 3NT, ${B('4H')} או ${B('4S')}</td></tr>
        <tr><td>28-29</td><td>משחק מלא בסדרת מיינור: ${B('5C')} או ${B('5D')}</td></tr>
        <tr><td>33</td><td>סלאם קטן (12 לקיחות)</td></tr>
        <tr><td>37</td><td>סלאם גדול (כל 13 הלקיחות)</td></tr>
      </table>
      <p>גם <strong>מבנה</strong> היד חשוב. ליד <strong>מאוזנת</strong> אין חוסר, אין סינגלטון, ויש לכל היותר דאבלטון אחד:
      4-3-3-3, 4-4-3-2 או 5-3-3-2. ידיים כאלה מתאימות למשחק ללא שליט.</p>
      <p>יד עם חוסר, סינגלטון או שני דאבלטונים היא <strong>לא מאוזנת</strong>. כמה דוגמאות:</p>
      <div class="shape-examples"></div>`,
    tryIt: 'hcp',
  },
  {
    title: 'פתיחת המכרז',
    body: `
      <p>ההכרזה הראשונה היא <strong>הכרזת הפתיחה</strong>. האפליקציה מלמדת גרסה פשוטה של <em>השיטה האמריקאית הסטנדרטית</em>. פתחו ב<strong>סדרה הארוכה ביותר</strong> שלכם, אבל סדרת מייגור (${H} או ${S}) דורשת לפחות <strong>5 קלפים</strong>.</p>
      <p>מכיוון שמייגור דורש 5 קלפים, לעתים קרובות תחזיקו יד שהסדרה הארוכה ביותר בה היא מייגור של 4 קלפים (שבו אי אפשר לפתוח), או יד מאוזנת. אז פותחים ב<strong>מיינור</strong> (${C} או ${D}), גם אם יש בו רק 3 קלפים.</p>
      <p>לחצו על סוג יד כדי לראות דוגמה:</p>
      <table class="tbl">
        <tr><th>היד שלכם</th><th>פתיחה</th></tr>
        <tr><td><button class="finesse-link" type="button" data-opening="pass">פחות מ-12 נק' (ואין סדרה ארוכה)</button></td><td>פאס</td></tr>
        <tr><td><button class="finesse-link" type="button" data-opening="major">12-22 נק' עם סדרת מייגור של 5 קלפים ומעלה</button></td><td>${B('1H')} או ${B('1S')} (סדרת המייגור הארוכה יותר; ספייד עם ${ltr(`5${S}-5${H}`)})</td></tr>
        <tr><td><button class="finesse-link" type="button" data-opening="minor">12-22 נק', בלי סדרת מייגור של 5</button></td><td>${B('1C')} או ${B('1D')} (סדרת המיינור הארוכה יותר; ${B('1C')} עם ${ltr(`3${C}-3${D}`)}, ${B('1D')} עם ${ltr(`4${D}-4${C}`)})</td></tr>
        <tr><td><button class="finesse-link" type="button" data-opening="nt1">15-17 נק', מאוזנת</button></td><td>1NT</td></tr>
        <tr><td><button class="finesse-link" type="button" data-opening="nt2">20-22 נק', מאוזנת</button></td><td>2NT</td></tr>
        <tr><td><button class="finesse-link" type="button" data-opening="c2">23 נק' ומעלה, כל חלוקה</button></td><td>${B('2C')} (חזקה ומלאכותית)</td></tr>
        <tr><td><button class="finesse-link" type="button" data-opening="weak2">5-10 נק' עם סדרה טובה של 6 קלפים ב-${D}, ${H} או ${S}</button></td><td>הכרזת שתיים חלשה: ${B('2D')}, ${B('2H')} או ${B('2S')}</td></tr>
        <tr><td><button class="finesse-link" type="button" data-opening="pre3">5-10 נק' עם סדרה טובה של 7 קלפים</button></td><td>הכרזת חסימה ברמת 3</td></tr>
        <tr><td><button class="finesse-link" type="button" data-opening="pre4">5-10 נק' עם סדרה טובה של 8 קלפים</button></td><td>הכרזת חסימה ברמת 4</td></tr>
      </table>
      <p><strong>סדרה טובה</strong> להכרזת שתיים חלשה או להכרזת חסימה כוללת שניים מארבעת ההונורים העליונים (A, K, Q, J). עם סדרה חלשה יותר, פאס.</p>
      <p><strong>סדרות המייגור</strong> הן הארט וספייד; <strong>סדרות המיינור</strong> הן קלאב ודיאמונד.</p>
      <p><strong>חוק ה-20:</strong> עם 10-11 נק', חברו את הנקודות למספר הקלפים בשתי הסדרות הארוכות שלכם.
      אם הסכום 20 או יותר, פתחו בכל זאת ברמת 1.</p>`,
    tryIt: 'opening',
  },
  {
    title: 'תשובה לשותף',
    body: `
      <p>כשהשותף פותח באחת בסדרה, ההנחיות הפשוטות האלה יעזרו לכם להתחיל:</p>
      <ul>
        <li><strong>0-5 נק':</strong> פאס.</li>
        <li><strong>6 נק' ומעלה:</strong> השיבו. השותף עדיין עשוי להכריז פאס, ולכן עם יותר כוח ממשיכים להכריז.</li>
      </ul>
      <p>עם 6 נק' ומעלה, בחרו את <strong>הראשונה</strong> מבין האפשרויות הבאות שמתאימה ליד:</p>
      <table class="tbl">
        <tr><th>היד שלכם</th><th>תשובה</th></tr>
        <tr><td>3 קלפים ומעלה בסדרת המייגור של השותף</td><td>תמיכה: ל-2 עם 6-10 נקודות תמיכה, ל-3 (<em>תמיכה בקפיצה</em>) עם 11-12</td></tr>
        <tr><td>סדרה של 4 קלפים ומעלה שאפשר להכריז ברמת 1</td><td>הכריזו אותה (סדרות מייגור לפני דיאמונד; הארט קודם עם 4-4 בסדרות המייגור)</td></tr>
        <tr><td>תמיכה בסדרת המיינור של השותף (4 ומעלה ב-${D} או 5 ומעלה ב-${C})</td><td>תמיכה: ל-2 עם 6-10 נקודות תמיכה, ל-3 עם 11-12 וחמישה קלפים (עם ארבעה בלבד, 2NT)</td></tr>
        <tr><td>6-10 נק', אף אחד מאלה</td><td>1NT</td></tr>
        <tr><td>11 נק' ומעלה, סדרה נמוכה יותר של 4 קלפים ומעלה (5 ומעלה ב-${H})</td><td>סדרה חדשה ברמת 2</td></tr>
        <tr><td>11-12 נק', אף אחד מאלה</td><td>2NT, הזמנה למשחק מלא</td></tr>
        <tr><td>13-15 נק', אף אחד מאלה</td><td>3NT, הכרזת משחק מלא</td></tr>
      </table>
      <p><strong>נקודות תמיכה.</strong> כשיש לכם תמיכה בסדרה של השותף, גם הסדרות הקצרות שלכם עוזרות: כדומם אפשר לחתוך בהן את המפסידים של הכרוז. לכן הוסיפו לנקודות <strong>נקודה אחת על דאבלטון, 2 על סינגלטון ו-3 על חוסר</strong>. לדוגמה, אחרי 1${S} של השותף, יד עם 4 ספייד, 8 נק' וסינגלטון שווה 10 נקודות תמיכה: תמכו ב-2${S}. כך גם בכל יד שתומכת בשותף, כולל הפותח שתומך בסדרה של המשיב. רק היד עם השליטים הקצרים יותר סופרת את הסדרות הקצרות שלה. היד עם השליטים הארוכים יותר, זו שהשותף תמך בה, סופרת במקום זאת <strong>נקודות אורך</strong>: נקודה על כל קלף מעבר לארבעה בכל סדרה, בשליט או בסדרה צדדית ארוכה (1 על חמישה, 2 על שישה וכן הלאה).</p>
      <p>מטרת המכרז היא למצוא <strong>התאמה של 8 קלפים</strong> (או להתייצב בללא שליט) ואת הרמה הנכונה לכוח המשותף.
      עם 13 נק' ומעלה יש לכם מספיק למשחק מלא מול הכרזת פתיחה. ידיים כאלה משתמשות בהכרזות מתקדמות יותר, ולכן הן לא כלולות בתרגול.</p>`,
    tryIt: 'responding',
  },
  {
    title: 'ההכרזה השנייה של הפותח',
    body: `
      <p>הכרזת הפתיחה מכסה טווח רחב (12-22 נק'). ההכרזה השנייה, <strong>ההכרזה החוזרת</strong>, מספרת לשותף באיזה חלק של הטווח אתם נמצאים:</p>
      <table class="tbl">
        <tr><th>מינימום</th><th>בינוני</th><th>מקסימום</th></tr>
        <tr><td>12-14 נק'</td><td>15-17 נק'</td><td>18-22 נק'</td></tr>
      </table>
      <p><strong>כשהשותף תומך בסדרה שלכם</strong>, כבר יש התאמה. נשאר להחליט רק על הרמה:</p>
      <table class="tbl">
        <tr><th>ההכרזה של השותף</th><th>מינימום</th><th>בינוני</th><th>מקסימום</th></tr>
        <tr><td>תמיכה פשוטה (6-10)</td><td>פאס</td><td>תמיכה נוספת כהזמנה</td><td>משחק מלא</td></tr>
        <tr><td>תמיכה בקפיצה (11-12)</td><td>פאס עם 12-13, משחק מלא עם 14</td><td>משחק מלא</td><td>משחק מלא</td></tr>
      </table>
      <p>משחק מלא בסדרת מייגור הוא ${B('4H')} או ${B('4S')}. עם התאמה בסדרת מיינור, 3NT בדרך כלל קל יותר מ-${B('5C')} או ${B('5D')}.</p>
      <p><strong>כשהשותף מכריז סדרה חדשה ברמת 1</strong>, חובה להכריז שוב. בחרו את הראשונה שמתאימה:</p>
      <ol>
        <li>תמיכה של 4 קלפים בסדרת המייגור של השותף: תמיכה ברמת 2 (מינימום), 3 (בינוני) או 4 (מקסימום).</li>
        <li>סדרת מייגור של 4 קלפים שעדיין אפשר להכריז ברמת 1: הכריזו אותה. למשל <bdi dir="ltr">${B('1D')} – ${B('1H')} – <strong>${B('1S')}</strong></bdi>.</li>
        <li>מאוזנת: 1NT עם 12-14, קפיצה ל-2NT עם 18-19.</li>
        <li>אחרת, השתמשו בכללים לידיים לא מאוזנות שלמטה.</li>
      </ol>
      <p><strong>כשהשותף משיב 1NT</strong> (6-10, בלי התאמה, לא מחייב): עם מינימום מאוזן, פאס. עם 18-19 מאוזן, הכריזו 2NT. אחרת, השתמשו בכללים לידיים לא מאוזנות, אבל אל תחזרו על סדרה של 5 קלפים: חזרה מבטיחה שישה. עם מינימום, סדרה של 5 ובלי סדרה שנייה נמוכה יותר (סדרה גבוהה יותר תהיה ריברס), הכריזו פאס על 1NT.</p>
      <p><strong>כשהשותף מכריז סדרה חדשה ברמת 2</strong> (<em>שתיים על אחת</em>, כמו <bdi dir="ltr">${B('1S')} – ${B('2C')}</bdi>), לשותף יש 11 נק' ומעלה וחובה להכריז שוב. תמכו בהארט של השותף עם 3 (או בסדרת מיינור עם 4, ביד לא מאוזנת). ביד מאוזנת, <strong>2NT מראה 12-14</strong> ו-<strong>3NT מראה 18-19</strong>. אחרת, השתמשו בכללים לידיים לא מאוזנות; סדרה חדשה שדורשת את רמת 3 מראה 15 ומעלה.</p>
      <p><strong>ידיים לא מאוזנות:</strong></p>
      <ul>
        <li>עם <strong>סדרה של 6 קלפים</strong>, הכריזו אותה שוב: ברמת 2 עם מינימום (12-15), או בקפיצה לרמת 3 עם 16-17. ספרו נקודה נוספת על כל קלף מעבר לארבעה. עם 18 ומעלה, הכריזו משחק מלא בסדרת מייגור, או 3NT, או קפיצה בסדרה שנייה.</li>
        <li>עם <strong>סדרה שנייה נמוכה יותר</strong> (4 קלפים ומעלה), הכריזו אותה ברמת 2. עם 18 ומעלה, קפצו בה: <em>קפיצה בסדרה חדשה</em> (ג'אמפ שיפט), שמחייבת עד משחק מלא.</li>
        <li>הכרזה של <strong>סדרה שנייה גבוהה יותר</strong> ברמת 2, כמו <bdi dir="ltr">${B('1D')} – ${B('1S')} – ${B('2H')}</bdi>, נקראת <em>ריברס</em>. היא דורשת 16 נק' ומעלה.</li>
        <li>אם אף אחד מאלה לא מתאים, הכריזו שוב את הסדרה שלכם ברמת 2.</li>
      </ul>
      <p>התרגול מכסה חמש תשובות: תמיכה פשוטה, תמיכה בקפיצה, סדרה חדשה ברמת 1, 1NT וסדרה חדשה ברמת 2.</p>`,
    tryIt: 'rebid',
  },
  {
    title: 'ההכרזה השנייה של המשיב',
    body: `
      <p>אחרי ההכרזה החוזרת של השותף, בדרך כלל אתם יודעים מספיק כדי לקבוע את החוזה, או לפחות לומר כמה אתם חזקים:</p>
      <table class="tbl">
        <tr><th>מינימום</th><th>הזמנה</th><th>ערכי משחק מלא</th></tr>
        <tr><td>6-10 נק'</td><td>11-12 נק'</td><td>13 נק' ומעלה</td></tr>
      </table>
      <p>חברו את הנקודות שלכם למה שהשותף הראה. עם <strong>25 ומעלה</strong> במשותף, הכריזו משחק מלא. אם המשחק המלא תלוי בכך שהשותף בראש הטווח שלו, הזמינו. אחרת, עצרו.</p>
      <p><strong>כשהשותף מזמין למשחק מלא</strong> (למשל <bdi dir="ltr">${B('1H')} – ${B('2H')} – ${B('3H')}</bdi>, או <bdi dir="ltr">${B('1S')} – 1NT – 2NT</bdi>):</p>
      <ul>
        <li>קבלו את ההזמנה עם ראש הטווח שלכם (9-10 אחרי תשובה של 6-10) בהכרזת משחק מלא.</li>
        <li>דחו אותה עם תחתית הטווח (6-8) בפאס.</li>
      </ul>
      <p><strong>כשהשותף מראה מינימום</strong> (הכרזה חוזרת של 1NT, תמיכה פשוטה, או חזרה על הסדרה שלו ברמת 2):</p>
      <ul>
        <li>עם 6-10, פאס, או עצירה ברמת 2 בסדרה של 6 קלפים משלכם.</li>
        <li>אחרי הכרזה חוזרת של 1NT, עם 6-10 ויד לא מאוזנת עם סדרה שנייה נמוכה יותר (5-4 ומעלה), הכריזו אותה ברמת 2, כמו <bdi dir="ltr">${B('1D')} – ${B('1S')} – 1NT – <strong>${B('2C')}</strong></bdi>. ההכרזה לא מחייבת: השותף מכריז פאס או חוזר לסדרה הראשונה שלכם.</li>
        <li>עם 11-12, הזמינו: תמיכה ברמת 3 עם התאמה, או 2NT.</li>
        <li>עם 13 ומעלה, הכריזו משחק מלא: בסדרה שבה יש לכם התאמה של 8 קלפים, אם יש, ואחרת 3NT.</li>
      </ul>
      <p><strong>כשהשותף מראה סדרה שנייה:</strong></p>
      <ul>
        <li>עם 4 קלפים בסדרת מייגור שהשותף הראה זה עתה, תמכו בה: ברמת 2 עם מינימום, ברמת 3 כהזמנה.</li>
        <li>אחרת, תנו <strong>העדפה</strong> לפי ההתאמות ולא רק לפי האורכים שלכם. בפתיחה בסדרת מייגור יש חמישה קלפים ובסדרה השנייה ארבעה, ולכן עם התאמות שוות חזרו לסדרה הראשונה ברמה הזולה ביותר: עם ${ltr(`2${S}`)} ו-${ltr(`3${H}`)}, <bdi dir="ltr">${B('1S')} – 1NT – ${B('2H')} – <strong>${B('2S')}</strong></bdi> (גם 5-2 וגם 4-3 הן התאמות של 7 קלפים). הכריזו פאס רק כשהסדרה השנייה יוצרת התאמה ארוכה יותר.</li>
        <li>אחרי תשובה של 1NT, הסדרה החדשה של השותף יכולה להיות עם עד 17 נק', ולכן עם 8-10 המשיכו את המכרז: תמכו ברמת 3 עם 4 קלפים, ואחרת הכריזו 2NT כהזמנה.</li>
        <li>העדפה לא מראה כוח נוסף. עם 11-12, תמכו או הכריזו 2NT כדי להזמין.</li>
        <li>עם 13 ומעלה, הכריזו משחק מלא: 4 בסדרת מייגור עם התאמה של 8 קלפים, ואחרת 3NT.</li>
      </ul>
      <p><strong>כשהשותף מראה יד גדולה</strong> (הכרזה חוזרת של 2NT עם 18-19, או קפיצה בסדרה חדשה עם 18 ומעלה), הכריזו משחק מלא: 3NT, או 4 בסדרת מייגור כשיש התאמה.
      <strong>ריברס</strong> (16 ומעלה) מחייב לסיבוב אחד: עם מינימום, חזרו על סדרה של 5 קלפים או תנו העדפה.</p>
      <p>התרגול משתמש בידיים של 6-12 נק'. ידיים של 13 ומעלה דורשות לעיתים קרובות כלי הכרזה נוספים, ולכן הן לא כלולות.</p>`,
    tryIt: 'rrebid',
  },
  {
    title: 'הכרזות התערבות וכפל הוצאה',
    body: `
      <p>כשיריב פותח, הצד שלכם עדיין יכול להתחרות. הכרזה אחרי שהיריבים פתחו נקראת <strong>הכרזת התערבות</strong>.
      היא יכולה לזכות בחוזה, לדחוף את היריבים גבוה מדי, או לומר לשותף באיזו סדרה להוביל.</p>
      <p>כשהיריב מימינכם פותח באחת בסדרה, מצאו את השורה שמתאימה ליד שלכם. לחצו על שורה כדי לראות דוגמאות:</p>
      <table class="tbl">
        <tr><th>היד שלכם</th><th>פעולה</th></tr>
        <tr><td><button class="finesse-link" type="button" data-overcall="o1">8-16 נק' וסדרה טובה של 5 קלפים ומעלה שאפשר להכריז ברמת 1</button></td><td>התערבות ברמת 1</td></tr>
        <tr><td><button class="finesse-link" type="button" data-overcall="o2">11-16 נק' וסדרה טובה של 5 קלפים ומעלה ברמת 2</button></td><td>התערבות ברמת 2</td></tr>
        <tr><td><button class="finesse-link" type="button" data-overcall="tox">12 נק' ומעלה, קצר בסדרה שלהם, 3 קלפים ומעלה בכל סדרה אחרת</button></td><td><strong>כפל הוצאה</strong></td></tr>
        <tr><td><button class="finesse-link" type="button" data-overcall="nt">15-18 נק', מאוזנת, עם עוצר בסדרה שלהם</button></td><td>1NT</td></tr>
        <tr><td><button class="finesse-link" type="button" data-overcall="strongx">17 נק' ומעלה, חזקה מדי להתערבות</button></td><td>דאבל, ואחר כך הכריזו את הסדרה שלכם או ללא שליט</td></tr>
        <tr><td><button class="finesse-link" type="button" data-overcall="wjo">6-10 נק' וסדרה טובה של 6 קלפים (שניים מ-A, K, Q, J)</button></td><td><strong>קפיצת התערבות חלשה</strong> ברמה 2: רמה אחת מעל הנדרש (<bdi dir="ltr">${B('1H')} – ${B('2S')}</bdi>). קפיצה לרמה 3 דורשת שבעה קלפים.</td></tr>
        <tr><td><button class="finesse-link" type="button" data-overcall="pre">6-10 נק' וסדרה טובה של 7 קלפים (שניים מ-A, K, Q, J)</button></td><td><strong>הכרזת חסימה</strong> ברמה 3 (<bdi dir="ltr">${B('1C')} – ${B('3H')}</bdi>)</td></tr>
        <tr><td><button class="finesse-link" type="button" data-overcall="pass">כל דבר אחר</button></td><td>פאס</td></tr>
      </table>
      <ul>
        <li>כשיותר משורה אחת מתאימה, יד חלשה (6-10 נק') עם סדרה של 6 או 7 קלפים קופצת, ולא מתערבת התערבות פשוטה. יד מאוזנת של 15-18 עם עוצר מעדיפה 1NT.</li>
        <li><strong>סדרה טובה</strong> כוללת לפחות שניים מהקלפים הגבוהים (A, K, Q, J, 10). עם פחות מ-12 נק', התערבו רק עם סדרה טובה, כי בדרך כלל השותף יוביל אותה.</li>
        <li><strong>עוצר</strong> הוא החזקה שתזכה בלקיחה בסדרה שלהם: A, K-x, Q-x-x או J-x-x-x.</li>
        <li><strong>כפל הוצאה</strong> לא אומר "אני חושב שהם ייפלו". הוא מבקש מהשותף לבחור סדרת שליט, ולכן השותף חייב להכריז גם עם יד חלשה.</li>
      </ul>
      <p><strong>כשהשותף מתערב</strong>, תמכו בסדרה שלו עם 3 קלפים ומעלה, בדיוק כמו אחרי הכרזת פתיחה.</p>`,
    tryIt: 'overcalls',
  },
  {
    title: 'מוסכמות',
    body: `
      <p><strong>מוסכמה</strong> היא הכרזה עם משמעות מוסכמת ששונה מהמשמעות הטבעית שלה. למשל, ${B('2C')} מעל 1NT של השותף לא אומרת דבר על קלאב.
      שני השותפים חייבים להכיר את המוסכמה. בתחרויות מודיעים ליריבים על הכרזות מוסכמות (<em>התראה</em>).
      אלה המוסכמות הנפוצות ביותר בשיטת <strong>Standard American Yellow Card (SAYC)</strong>.</p>

      <h3>מעל 1NT של השותף</h3>
      <ul>
        <li><strong>סטיימן (${B('2C')})</strong>: עם 8 נק' ומעלה וסדרת מייגור של 4 קלפים, שאלו את השותף אם יש לו סדרת מייגור של 4. השותף מכריז ${B('2H')} או ${B('2S')} עם סדרה כזו, או ${B('2D')} בלי.</li>
        <li><strong>פאפט סטיימן (${B('3C')})</strong>: עם כוח למשחק מלא וסדרת מייגור של 3 או 4 קלפים, שאלו את השותף אם יש לו סדרת מייגור של 4 או 5. השותף מכריז ${B('3H')} או ${B('3S')} עם חמישה קלפים, ${B('3D')} עם מייגור של 4, או 3NT בלי.
          אחרי ${B('3D')}, הכריזו את המייגור <em>שאין</em> לכם (${B('3H')} מראה ארבעה ספייד, ${B('3S')} מראה ארבעה הארט), כדי שהיד החזקה תשחק את החוזה.</li>
        <li><strong>טרנספר ג'ייקובי (${B('2D')}, ${B('2H')}, ${B('4D')}, ${B('4H')})</strong>: עם 5 קלפים ומעלה בסדרת מייגור, הכריזו את הסדרה שמתחתיה. השותף חייב להכריז את הסדרה שלכם. משתמשים בו עם כל כוח.
          עם מייגור של 6 קלפים ומעלה וכוח למשחק מלא, הכריזו טרנספר ברמת 4: <strong>${B('4D')}</strong> מבקש מהשותף להכריז ${B('4H')}, ו-<strong>${B('4H')}</strong> מבקש ${B('4S')}.
          <details class="why-more">
            <summary class="btn secondary">💡 למה להשתמש בטרנספר?</summary>
            <div class="why-body">
              <p><strong>היד החזקה מוסתרת.</strong> השותף מכריז ראשון את סדרת המייגור שלכם, ולכן פותח ה-1NT הופך לכרוז. היד החזקה שלו נשארת סגורה,
              וההובלה הראשונה מגיעה <em>אל</em> ההונורים שלו (כמו A-Q) במקום לעבור דרכם.</p>
              <p><strong>מקבלים הכרזה שנייה.</strong> התשובה של השותף אוטומטית, ולכן אפשר להכריז שוב ולהראות את הכוח:</p>
              <ul>
                <li><strong>חלשה (0-7 נק'):</strong> טרנספר ואחר כך פאס. משחקים בסדרה הארוכה שלכם ברמת 2, בטוח יותר מ-1NT.</li>
                <li><strong>מזמינה (8-9 נק'):</strong> טרנספר ואחר כך 2NT עם חמישה קלפים, או 3 בסדרת המייגור עם שישה. השותף עולה למשחק מלא עם מקסימום.</li>
                <li><strong>משחק מלא (10 נק' ומעלה):</strong> טרנספר ואחר כך 3NT עם חמישה קלפים (השותף בוחר בין 3NT ל-4 במייגור), או 4 במייגור עם שישה.</li>
              </ul>
              <p><strong>טרנספר ברמת 4</strong> (${B('4D')}, ${B('4H')}) מתאים למייגור של 6 קלפים ומעלה, כוח למשחק מלא ובלי עניין בסלאם. עם עניין בסלאם, התחילו
              בטרנספר ברמת 2 והכריזו שוב אחריו.</p>
            </div>
          </details></li>
      </ul>

      <h3>מעל 2NT של השותף</h3>
      <p>פתיחה של 2NT מראה 20-22 נק', יד מאוזנת, ולכן 4-5 נק' מולה מספיקות למשחק מלא. המוסכמות עובדות רמה אחת גבוה יותר:</p>
      <ul>
        <li><strong>סטיימן (${B('3C')})</strong>: עם 4 נק' ומעלה וסדרת מייגור של 4 קלפים, שאלו על סדרת מייגור של 4 אצל השותף: ${B('3H')}, ${B('3S')}, או ${B('3D')} בלי. זוגות רבים משחקים את ${B('3C')} כ<strong>פאפט סטיימן</strong>, שמוצא גם סדרת מייגור של 5.</li>
        <li><strong>טרנספר ג'ייקובי (${B('3D')}, ${B('3H')}, ${B('4D')}, ${B('4H')})</strong>: עם 5 קלפים ומעלה בסדרת מייגור, הכריזו ${B('3D')} או ${B('3H')} והשותף מכריז ${B('3H')} או ${B('3S')}. עם חמישה, הכריזו אחר כך 3NT ותנו לשותף לבחור; עם שישה, העלו למשחק מלא.
          עם מייגור של 6 קלפים ומעלה אפשר גם טרנספר ברמת 4: <strong>${B('4D')}</strong> מבקש מהשותף להכריז ${B('4H')}, ו-<strong>${B('4H')}</strong> מבקש ${B('4S')}.</li>
        <li><strong>3NT</strong>: לשחק, עם 4-10 נק' ובלי מייגור להראות. <strong>${B('4C')}</strong> הוא גרבר, ששואל על אסים.</li>
      </ul>

      <h3>${B('2C')} חזקה</h3>
      <p>${B('2C')} מראה 23 נק' ומעלה (או יד עם תשע לקיחות) ומחייבת. המשיב מכריז <strong>${B('2D')}</strong> (מלאכותית, "המתנה") עם רוב הידיים.
      עם 8 נק' ומעלה וסדרה טובה של 5 קלפים (שניים משלושת הקלפים הגבוהים), תנו תשובה חיובית בסדרה (${B('2H')}, ${B('2S')}, ${B('3C')}, ${B('3D')}). עם 8 ומעלה ויד מאוזנת, הכריזו 2NT.</p>

      <h3>ג'ייקובי 2NT</h3>
      <p>מעל ${B('1H')} או ${B('1S')} של השותף, תשובה של 2NT מראה <strong>תמיכה של 4 קלפים ומעלה ו-13 נק' ומעלה</strong>, ומחייבת עד משחק מלא. הפותח מתאר אז את היד שלו:</p>
      <table class="tbl">
        <tr><th>ההכרזה החוזרת של הפותח</th><th>משמעות</th></tr>
        <tr><td>סדרה חדשה ברמת 3</td><td>סינגלטון או חוסר בסדרה זו</td></tr>
        <tr><td>3 בסדרת המייגור</td><td>18 נק' ומעלה, בלי קוצר</td></tr>
        <tr><td>3NT</td><td>15-17 נק', בלי קוצר</td></tr>
        <tr><td>סדרה חדשה ברמת 4</td><td>סדרה שנייה טובה של 5 קלפים</td></tr>
        <tr><td>4 בסדרת המייגור</td><td>מינימום, בלי קוצר</td></tr>
      </table>

      <h3>שאלה על אסים: בלאקווד וגרבר</h3>
      <p>לפני הכרזת סלאם, ודאו שהיריבים לא יכולים לקחת שני אסים. <strong>בלאקווד</strong> הוא 4NT אחרי שסוכם על שליט.
      <strong>גרבר</strong> הוא קפיצה ל-${B('4C')} מעל 1NT או 2NT של השותף.</p>
      <table class="tbl">
        <tr><th>אסים</th><th>תשובה לבלאקווד (4NT)</th><th>תשובה לגרבר (${B('4C')})</th></tr>
        <tr><td>0 או 4</td><td>${B('5C')}</td><td>${B('4D')}</td></tr>
        <tr><td>1</td><td>${B('5D')}</td><td>${B('4H')}</td></tr>
        <tr><td>2</td><td>${B('5H')}</td><td>${B('4S')}</td></tr>
        <tr><td>3</td><td>${B('5S')}</td><td>4NT</td></tr>
      </table>
      <p>אחר כך 5NT (אחרי בלאקווד) או ${B('5C')} (אחרי גרבר) שואלים על מלכים באותה דרך.</p>

      <h3>הכרזה תחרותית</h3>
      <ul>
        <li><strong>כפל שלילי</strong>: השותף פותח, היריב מימינכם מתערב, ואתם מכריזים דאבל. זה לא דאבל עונשין: הוא מראה את הסדרות שלא הוכרזו, במיוחד סדרת מייגור שלא הוכרזה (בדיוק ארבעה קלפים, או חמישה עם מעט מדי נקודות כדי להכריז אותה ברמת 2). ב-SAYC משחקים אותו עד ${B('2S')}.</li>
        <li><strong>קיו-ביד מייקלס</strong>: הכרזת הסדרה של היריב (<bdi dir="ltr">${B('1C')} – ${B('2C')}</bdi>) מראה יד דו-סדרתית 5-5. מעל סדרת מיינור היא מראה את שתי סדרות המייגור. מעל סדרת מייגור היא מראה את סדרת המייגור האחרת וסדרת מיינור.</li>
        <li><strong>2NT מלאכותי</strong>: קפיצה ל-2NT מעל הפתיחה שלהם מראה 5-5 בשתי הסדרות <em>הנמוכות ביותר</em> שלא הוכרזו (סדרות המיינור, מעל פתיחה בסדרת מייגור).</li>
      </ul>

      <h3>עוד חלקים של SAYC</h3>
      <ul>
        <li><strong>הכרזת שתיים חלשה</strong> (${B('2D')}, ${B('2H')}, ${B('2S')}): ראו את שיעור פתיחת המכרז. תשובה של 2NT שואלת את הפותח על "פיצ'ר": אס או מלך מחוץ לסדרה הארוכה.</li>
        <li><strong>סדרה רביעית מחייבת</strong>: אחרי שהוכרזו שלוש סדרות, הכרזת הסדרה הרביעית על ידי המשיב היא מלאכותית ומחייבת את הפותח להמשיך להכריז.</li>
      </ul>`,
    tryIt: 'conventions',
  },
  {
    title: 'הגנה',
    body: `
      <p>כשהצד השני זוכה במכרז, אתם והשותף הם <strong>המגינים</strong>.
      כדי להפיל חוזה של, נניח, ${B('4S')}, הכרוז צריך 10 לקיחות, ולכן אתם צריכים <strong>4</strong>.</p>
      <h3>הובלת הפתיחה</h3>
      <p>השחקן משמאל לכרוז מוביל לפני שהדומם נחשף, כך שזה הקלף היחיד שבוחרים בלי לראות את הדומם. בחרו קודם את הסדרה, ואז את הקלף.</p>
      <p><strong>נגד ללא שליט</strong>, פתחו את הסדרה הארוכה שלכם. סדרה עם רצף קודמת:</p>
      <table class="tbl">
        <tr><th>החזקה</th><th>הובלה</th></tr>
        <tr><td>שלושה הונורים צמודים: <bdi dir="ltr" class="holding"><strong>K</strong>-Q-J</bdi>, <bdi dir="ltr" class="holding"><strong>Q</strong>-J-10</bdi>, <bdi dir="ltr" class="holding"><strong>J</strong>-10-9</bdi></td><td>העליון</td></tr>
        <tr><td>רצף שבור ("<bdi dir="ltr">2½</bdi>" הונורים): <bdi dir="ltr" class="holding"><strong>K</strong>-Q-10</bdi>, <bdi dir="ltr" class="holding"><strong>Q</strong>-J-9</bdi>, <bdi dir="ltr" class="holding"><strong>J</strong>-10-8</bdi></td><td>העליון</td></tr>
        <tr><td>רצף פנימי: <bdi dir="ltr" class="holding">A-<strong>J</strong>-10</bdi>, <bdi dir="ltr" class="holding">K-<strong>J</strong>-10</bdi></td><td>ה-<strong>J</strong></td></tr>
        <tr><td>רצף פנימי: <bdi dir="ltr" class="holding">K-<strong>10</strong>-9</bdi>, <bdi dir="ltr" class="holding">Q-<strong>10</strong>-9</bdi></td><td>ה-<strong>10</strong></td></tr>
        <tr><td>בלי רצף: הסדרה הארוכה והחזקה ביותר, <bdi dir="ltr" class="holding">K-J-7-<strong>4</strong>-2</bdi></td><td>הרביעי מלמעלה: <strong>4</strong></td></tr>
      </table>
      <p><strong>נגד חוזה בשליט</strong>, קחו את הלקיחות שלכם מהר וחפשו חיתוכים. לפי סדר עדיפות:</p>
      <table class="tbl">
        <tr><th>החזקה</th><th>הובלה</th></tr>
        <tr><td><bdi dir="ltr" class="holding"><strong>A</strong>-K-x</bdi></td><td>ה-<strong>A</strong></td></tr>
        <tr><td>הונורים צמודים: <bdi dir="ltr" class="holding"><strong>K</strong>-Q-x</bdi>, <bdi dir="ltr" class="holding"><strong>Q</strong>-J-x</bdi>, <bdi dir="ltr" class="holding"><strong>J</strong>-10-x</bdi></td><td>העליון</td></tr>
        <tr><td>סינגלטון קטן (עם שליטים לחיתוך)</td><td>הסינגלטון</td></tr>
        <tr><td>דאבלטון קטן: <bdi dir="ltr" class="holding"><strong>7</strong>-3</bdi></td><td>העליון: <strong>7</strong></td></tr>
        <tr><td>הונור ו-3 קלפים ומעלה: <bdi dir="ltr" class="holding">K-9-6-<strong>3</strong></bdi></td><td>הרביעי מלמעלה: <strong>3</strong> (הנמוך מתוך <bdi dir="ltr" class="holding">K-9-<strong>3</strong></bdi>)</td></tr>
        <tr><td>שלושה קלפים קטנים: <bdi dir="ltr" class="holding"><strong>8</strong>-6-2</bdi></td><td>העליון, "עליון מכלום": <strong>8</strong></td></tr>
        <tr><td>ארבעה קלפים קטנים ומעלה: <bdi dir="ltr" class="holding">9-<strong>7</strong>-5-2</bdi></td><td>השני מלמעלה: <strong>7</strong></td></tr>
      </table>
      <p><strong>הימנעו</strong> מהובלה נמוכה מסדרה שבראשה אס נגד חוזה בשליט: הכרוז עשוי לזכות במלך בזול ואחר כך לחתוך את האס שלכם. הימנעו גם מהובלה מדאבלטון עם הונור, כמו K-x.
      כשכל הובלה נראית מסוכנת, שליט קטן הוא לעיתים קרובות הובלה בטוחה.</p>
      <h3>במהלך המשחק</h3>
      <p>לחצו על כלל כדי לראות דוגמה.</p>
      <ul>
        <li><button class="finesse-link" type="button" data-finesse="second">יד שנייה נמוך</button>: כשהכרוז מוביל לעבר הונור, שחקו נמוך ושמרו את הקלפים הגבוהים כדי לתפוס את שלו.</li>
        <li><button class="finesse-link" type="button" data-finesse="third">יד שלישית גבוה</button>: כשהשותף מוביל, שחקו את הקלף הגבוה שלכם (או הזול מבין קלפים צמודים) כדי לזכות בלקיחה או להוציא את הקלף של הכרוז.</li>
        <li><button class="finesse-link" type="button" data-finesse="cover">כסו הונור בהונור</button>: אם הכרוז מוביל מלכה, כסו אותה במלך. ייתכן שהוא יצטרך להוציא את האס כדי לזכות, וזה עשוי לקדם קלף נמוך יותר שלכם או של השותף.</li>
        <li><button class="finesse-link" type="button" data-finesse="return">החזירו את הסדרה של השותף</button> כשאתם זוכים בלקיחה, אלא אם יש לכם משהו טוב יותר בבירור.</li>
      </ul>
      <p>זוגות רבים גם <em>מאותתים</em>: קלף גבוה מעודד את השותף להמשיך בסדרה, וקלף נמוך מבקש ממנו לא להמשיך.</p>`,
    tryIt: 'defense',
  },
  {
    title: 'משחק הכרוז',
    body: `
      <p>ככרוז אתם משחקים גם את היד שלכם וגם את הדומם. לפני שאתם משחקים ללקיחה הראשונה, תכננו:</p>
      <ol>
        <li><strong>ספרו את הלקיחות הבטוחות</strong>: זוכים שאפשר לקחת בלי למסור את ההובלה.</li>
        <li><strong>השוו ליעד</strong>: כמה לקיחות עוד חסרות?</li>
        <li><strong>בחרו איך להשיג אותן</strong>, בעזרת הטכניקות שלמטה.</li>
      </ol>
      <h3>הוצאת שליטים</h3>
      <ul>
        <li>בחוזה שליט, השליטים של המגינים מסוכנים: הם יכולים <strong>לחתוך את הזוכים שלכם</strong>. <em>הוצאת שליטים</em> פירושה להוביל שליטים עד שלמגינים לא נשאר אף שליט, וכך הזוכים שלכם בסדרות האחרות בטוחים.</li>
        <li><strong>ספרו את השליטים של המגינים.</strong> עם שמונה שליטים ביד שלכם ובדומם, למגינים יש חמישה. עקבו אחריהם כשהם משרתים, ועצרו כשכולם יצאו: אל תבזבזו שליטים שאולי תצטרכו בהמשך.</li>
        <li><strong>הוציאו שליטים מוקדם</strong>, לפני שאתם לוקחים זוכים בסדרות הצד, אלא אם אתם צריכים את השליטים של הדומם לחיתוך (ראו בהמשך) או שקודם צריך להיפטר ממפסיד מהיר.</li>
      </ul>
      <h3>פיתוח סדרות</h3>
      <ul>
        <li><strong>קידום:</strong> עם K-Q-J, מוסרים לקיחה אחת לאס, ושני הקלפים האחרים הופכים לזוכים.</li>
        <li><strong>אורך:</strong> אחרי שלמגינים נגמרים הקלפים בסדרה, גם הקלפים הקטנים שלכם בה זוכים.</li>
        <li>פתחו את הסדרה מוקדם, כל עוד יש לכם עוצרים בסדרות של המגינים, ושמרו כניסה ליד הארוכה (לפעמים בוויתור על סיבוב).</li>
      </ul>
      <h3>חיתוך מפסידים</h3>
      <ul>
        <li>בחוזה בשליט, <strong>חתכו מפסידים ביד עם פחות שליטים</strong> (בדרך כלל הדומם). כל חיתוך שם הוא לקיחה נוספת; חיתוך ביד עם השליטים הארוכים לא מרוויח כלום.</li>
        <li>חתכו <strong>לפני</strong> שאתם מוציאים שליטים, אחרת השליטים של הדומם ייעלמו. הוציאו שליטים אחרי שסיימתם לחתוך.</li>
      </ul>
      <h3>עקיפות</h3>
      <p>עקיפה זוכה בלקיחה עם קלף שאינו הגבוה ביותר. הכלל: <strong>הובילו מהיד שממול לעבר הקלף שאתם מקווים שיזכה</strong>. לחצו על סוג כדי לראות היכן יכולים להיות הקלפים החסרים.</p>
      <table class="tbl">
        <tr><th>סוג</th><th>החזקה (דומם / אתם)</th><th>איך</th></tr>
        <tr><td><button class="finesse-link" type="button" data-finesse="simple">עקיפה פשוטה</button></td><td>A-Q / x-x</td><td>הובילו לעבר A-Q ושחקו את המלכה</td></tr>
        <tr><td><button class="finesse-link" type="button" data-finesse="toward">הובלה לעבר הונור</button></td><td>x-x / K-x</td><td>הובילו מהדומם לעבר המלך</td></tr>
        <tr><td><button class="finesse-link" type="button" data-finesse="queen">עקיפה נגד המלכה</button></td><td>A-K-J / x-x-x</td><td>הובילו לעבר הדומם ושחקו את הנסיך</td></tr>
        <tr><td><button class="finesse-link" type="button" data-finesse="kj">הובלה לעבר K-J</button></td><td>K-J-x / x-x-x</td><td>הובילו נמוך לעבר הדומם ושחקו את הנסיך. אם הוא מפסיד למלכה, הובילו מאוחר יותר לעבר המלך: הוא זוכה כשהאס אצל מערב</td></tr>
        <tr><td><button class="finesse-link" type="button" data-finesse="double">עקיפה כפולה</button></td><td>A-Q-10 / x-x-x</td><td>עקפו קודם עם ה-10, אחר כך עם המלכה</td></tr>
        <tr><td><button class="finesse-link" type="button" data-finesse="ruffing">עקיפת חיתוך</button></td><td>A-Q-J / חוסר</td><td>הובילו את המלכה; חתכו אם מכסים אותה, אחרת השליכו מפסיד</td></tr>
      </table>
      <p>בלשונית "משחק הכרוז" יש את אלה ועוד (הוצאת שליטים, חיתוך צולב, השהיה, ויתור, משחקי ביטחון), עם ידיים לתרגול לכל אחד.</p>`,
    tryIt: 'declarer',
  },
  {
    title: 'טכניקות מתקדמות',
    body: `
      <p>כשהיסודות כבר נוחים, שתי טכניקות זוכות בלקיחות שנראות בלתי אפשריות.</p>
      <h3>משחקי לחץ</h3>
      <p>ממשו זוכים עד שמגן ששומר על שתי סדרות נאלץ להשליך את אחת השמירות. לחץ צריך שני איומים, מגן אחד ששומר על שניהם, ספירה נכונה (אפשר לזכות בכל הלקיחות שנשארו פרט לאחת) וכניסות.</p>
      <h3>משחקי סיום</h3>
      <p>נקו את הסדרות הצדדיות, ואז הכניסו מגן ללקיחה שהוא חייב לזכות בה. אז הוא חייב להוביל לתוך המזלג שלכם (כמו A-Q), או לתת לכם חיתוך והשלכה.</p>
      <p>בלשונית "משחק הכרוז" יש הסבר מפורט על שתיהן (תחת <em>משחק מומחים</em>), עם ידיים לתרגול מול הגנה מושלמת.</p>`,
    tryIt: 'declarer',
  },
];

const LESSONS = L(LESSONS_EN, LESSONS_HE);

// The "watch a deal" example in the first lesson: deals a shuffled deck one card at a time,
// clockwise from the dealer's left, and shows all four hands.
const DealDemo = (() => {
  let timer = null, dealer = 3;

  function mount(box) {
    clearTimeout(timer);
    box.innerHTML = `<p><button class="btn" type="button">${L('Deal a hand', 'חלקו יד')}</button></p>`;
    box.querySelector('button').addEventListener('click', () => deal(box, true));
  }

  // The first deal is animated so you can watch it; "Next hand" shows the new hands at once.
  function deal(box, animate) {
    clearTimeout(timer);
    dealer = (dealer + 1) % 4;
    box.innerHTML = `
      <div class="table puzzle-table deal-table">
        ${[0, 3, 1, 2].map(s => `<div class="seat ${['north', 'east', 'south', 'west'][s]}" data-seat="${s}"></div>`).join('')}
        <div class="deal-center"></div>
      </div>
      <p><button class="btn" type="button" disabled>${L('Next hand →', 'היד הבאה ←')}</button></p>`;
    const next = box.querySelector('button');
    next.addEventListener('click', () => deal(box, false));
    box.querySelector('.deal-table').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    const center = box.querySelector('.deal-center');
    const seats = [0, 1, 2, 3].map(s => box.querySelector(`[data-seat="${s}"]`));
    const deck = shuffle(makeDeck());
    const hands = [[], [], [], []];
    const show = seat => {
      const el = seats[seat];
      el.innerHTML = `<div class="seat-label"><strong>${SEAT_NAMES[seat]}</strong>${seat === dealer ? ` <span>${L('(dealer)', '(מחלק)')}</span>` : ''}</div>`;
      if (hands[seat].length) renderSuitRows(el, sortHand(hands[seat]));
      el.insertAdjacentHTML('beforeend', `<div class="muted">${L(`${hands[seat].length} cards`, `${hands[seat].length} קלפים`)}</div>`);
    };
    center.innerHTML = L(
      `${SEAT_NAMES[dealer]} deals, starting with the player on the left.`,
      `${SEAT_NAMES[dealer]} מחלק, החל מהשחקן משמאלו.`);
    [0, 1, 2, 3].forEach(show);
    const finish = () => {
      center.innerHTML = L(
        `All 52 cards are dealt: 13 each. Every deal is different; the dealer moves one seat clockwise for the next hand.`,
        `כל 52 הקלפים חולקו: 13 לכל שחקן. כל חלוקה שונה, ובחלוקה הבאה המחלק עובר מקום אחד בכיוון השעון.`);
      next.disabled = false;
      next.focus({ preventScroll: true });
    };
    if (!animate || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) {
      deck.forEach((card, i) => hands[(dealer + 1 + i) % 4].push(card));
      [0, 1, 2, 3].forEach(show);
      finish();
      return;
    }
    let i = 0;
    const step = () => {
      if (!box.isConnected) return;
      const seat = (dealer + 1 + i) % 4;
      hands[seat].push(deck[i++]);
      show(seat);
      if (i < 52) timer = setTimeout(step, 15);
      else finish();
    };
    timer = setTimeout(step, 150);
  }

  return { mount };
})();

// Duplicate scoring of one contract, as rows of [what, how, points]; points are negative when the
// contract goes down. `ex` is a scoring example: contract like '4H', doubled 0/1/2, vulnerable, result.
function scoreRows(ex) {
  const level = Number(ex.contract[0]), strain = ex.contract[1];
  const { doubled, vulnerable: vul, result } = ex;
  const mult = [1, 2, 4][doubled];
  const dblWord = [L('', ''), L('doubled', 'דאבל'), L('redoubled', 'רידאבל')][doubled];
  const rows = [];
  if (result >= 0) {
    const per = 'CD'.includes(strain) ? 20 : 30;
    const base = strain === 'N' ? 40 + (level - 1) * 30 : level * per;
    let how = strain === 'N' ? (level > 1 ? `40 + ${level - 1} × 30` : '40') : `${level} × ${per}`;
    if (mult > 1) how = how.includes(' ') ? `(${how}) × ${mult}` : `${how} × ${mult}`;
    const trickScore = base * mult;
    rows.push([L(`Tricks bid (${bidHtml(ex.contract)})`, `לקיחות החוזה (${bidHtml(ex.contract)})`), how, trickScore]);
    if (trickScore >= 100) {
      rows.push([vul ? L('Game bonus, vulnerable', 'בונוס משחק מלא, פגיעים') : L('Game bonus, not vulnerable', 'בונוס משחק מלא, לא פגיעים'), '', vul ? 500 : 300]);
    } else {
      rows.push([L('Part-score bonus', 'בונוס חוזה חלקי'), '', 50]);
    }
    if (level === 6) rows.push([L('Small slam bonus', 'בונוס סלאם קטן'), '', vul ? 750 : 500]);
    if (level === 7) rows.push([L('Grand slam bonus', 'בונוס סלאם גדול'), '', vul ? 1500 : 1000]);
    if (doubled) rows.push([L(`For making a ${dblWord} contract`, `על ביצוע חוזה ב${dblWord}`), '', 50 * doubled]);
    if (result > 0) {
      const each = doubled ? (vul ? 200 : 100) * doubled : 'CD'.includes(strain) ? 20 : 30;
      const what = result === 1 ? L('Overtrick', 'לקיחה עודפת') : L('Overtricks', 'לקיחות עודפות');
      rows.push([doubled ? `${what} (${dblWord})` : what, `${result} × ${each}`, result * each]);
    }
  } else {
    const down = -result;
    if (!doubled) {
      const each = vul ? 100 : 50;
      rows.push([down === 1 ? L('Undertrick', 'לקיחה חסרה') : L('Undertricks', 'לקיחות חסרות'), `${down} × ${each}`, -down * each]);
    } else {
      // Doubled: 100 / 200 / 200 / 300... not vulnerable, 200 / 300 / 300... vulnerable; redoubled is twice that.
      const first = (vul ? 200 : 100) * mult / 2;
      const second = (vul ? 300 : 200) * mult / 2;
      const later = 300 * mult / 2;
      rows.push([L(`1st undertrick (${dblWord})`, `לקיחה חסרה ראשונה (${dblWord})`), '', -first]);
      const mid = vul ? down - 1 : Math.min(down - 1, 2);
      if (mid > 0) rows.push([vul ? L('Each further undertrick', 'כל לקיחה חסרה נוספת') : L('2nd and 3rd undertricks', 'לקיחות חסרות שנייה ושלישית'), `${mid} × ${second}`, -mid * second]);
      const rest = vul ? 0 : Math.max(down - 3, 0);
      if (rest > 0) rows.push([L('4th undertrick and on', 'לקיחה חסרה רביעית ואילך'), `${rest} × ${later}`, -rest * later]);
    }
  }
  return rows;
}

// The "Examples" in the scoring lesson: one contract at a time, with its score added up.
const ScoreDemo = (() => {
  const examples = () => (typeof PRACTICE !== 'undefined' && PRACTICE.scoringExamples) || [];
  const text = t => (t ? L(t.en || t.he, t.he || t.en) : '');
  const num = n => ltr(n < 0 ? `−${-n}` : `+${n}`);

  function mount(box) {
    if (!examples().length) { box.innerHTML = ''; return; }
    box.innerHTML = `<p><button class="btn" type="button">${L('Examples', 'דוגמאות')}</button></p>`;
    box.querySelector('button').addEventListener('click', () => render(box, 0));
  }

  function describe(ex) {
    const level = Number(ex.contract[0]);
    const tricks = 6 + level + ex.result;
    const dbl = [L('', ''), L(' doubled', ', דאבל'), L(' redoubled', ', רידאבל')][ex.doubled];
    const vul = ex.vulnerable ? L('vulnerable', 'פגיעים') : L('not vulnerable', 'לא פגיעים');
    let res;
    if (ex.result === 0) res = L(`made exactly (${tricks} tricks)`, `בוצע בדיוק (${tricks} לקיחות)`);
    else if (ex.result > 0) res = L(`made with ${ex.result} overtrick${ex.result > 1 ? 's' : ''} (${tricks} tricks)`,
      ex.result === 1 ? `בוצע עם לקיחה עודפת אחת (${tricks} לקיחות)` : `בוצע עם ${ex.result} לקיחות עודפות (${tricks} לקיחות)`);
    else res = L(`down ${-ex.result} (${tricks} tricks)`, `נפל ב-${-ex.result} (${tricks} לקיחות)`);
    return `<strong>${bidHtml(ex.contract)}${dbl}</strong>, ${vul}: ${res}`;
  }

  function render(box, i) {
    const list = examples();
    const ex = list[i];
    const rows = scoreRows(ex);
    const total = rows.reduce((t, r) => t + r[2], 0);
    const made = total > 0;
    box.innerHTML = `
      <div class="auction-demo-head">
        <span class="practice-count">${L(`Example ${i + 1} of ${list.length}`, `דוגמה ${i + 1} מתוך ${list.length}`)}</span>
        ${ex.note ? `<span>${text(ex.note)}</span>` : ''}
      </div>
      <div class="score-card ${made ? 'made' : 'down'}">
        <div class="score-title">${describe(ex)}</div>
        <table class="score-table">
          ${rows.map(([what, how, pts]) => `<tr><td>${what}</td><td class="how">${how ? ltr(how) : ''}</td><td class="pts">${num(pts)}</td></tr>`).join('')}
          <tr class="total"><td colspan="2">${made ? L("Total for declarer's side", 'סה"כ לצד הכרוז') : L("Total: declarer's side loses", 'סה"כ: צד הכרוז מפסיד')}</td><td class="pts">${num(total)}</td></tr>
        </table>
        ${made ? '' : `<div class="small">${L(`The defenders score ${-total}.`, `המגינים מקבלים ${-total}.`)}</div>`}
      </div>
      ${ex.why ? `<p>${text(ex.why)}</p>` : ''}
      <div class="drill-nav">
        <button class="btn secondary" type="button" data-act="prev" ${i === 0 ? 'disabled' : ''}>${L('← Previous example', '→ הדוגמה הקודמת')}</button>
        <button class="btn" type="button" data-act="next" ${i === list.length - 1 ? 'disabled' : ''}>${L('Next example →', 'הדוגמה הבאה ←')}</button>
      </div>`;
    box.querySelectorAll('[data-act]').forEach(btn => btn.addEventListener('click', () => {
      const which = btn.dataset.act;
      render(box, which === 'next' ? i + 1 : i - 1);
      const again = box.querySelector(`[data-act="${which}"]`);
      (again.disabled ? box.querySelector('[data-act]:not(:disabled)') : again).focus({ preventScroll: true });
    }));
  }

  return { mount };
})();

// The picture in "Declarer, dummy and defenders": a whole deal with South declaring 4♠, each
// seat framed and labeled by its role, and West's opening lead in the middle of the table.
const RolesDemo = (() => {
  const DEAL = {
    n: 'S:QT62 H:A85 D:K74 C:J92',
    e: 'S:853 H:642 D:T953 C:AT5',
    s: 'S:AKJ94 H:K7 D:A82 C:Q63',
    w: 'S:7 H:QJT93 D:QJ6 C:K874',
  };
  const LEAD = { suit: 'H', rank: 'Q' };

  function seat(area, name, role, cls, cards, rows) {
    const box = document.createElement('div');
    box.className = `roles-seat ${area} ${cls}`;
    box.innerHTML = `<div class="roles-label"><strong>${name}</strong> <span class="role-badge">${role}</span></div>`;
    (rows ? renderSuitRows : renderFan)(box, sortForTrump(cards, 'S'));
    return box;
  }

  function mount(box) {
    box.innerHTML = '';
    const table = document.createElement('div');
    table.className = 'roles-table';
    const west = parseHand(DEAL.w).filter(c => !(c.suit === LEAD.suit && c.rank === LEAD.rank));
    const center = document.createElement('div');
    center.className = 'roles-center';
    center.innerHTML = `<div class="roles-contract">${bidHtml('4S')} ${L('by South', 'של דרום')}</div>`;
    const lead = createCardEl({ ...LEAD, value: 12 });
    lead.classList.add('led');
    center.appendChild(lead);
    center.insertAdjacentHTML('beforeend', `<div class="roles-note">${L("West's opening lead", 'הובלת הפתיחה של מערב')}</div>`);
    table.append(
      seat('n', L('North', 'צפון'), L('Dummy: face up on the table, played by declarer', 'דומם: גלוי על השולחן, הכרוז משחק בו'), 'dummy', parseHand(DEAL.n)),
      seat('w', L('West', 'מערב'), L("Defender: on declarer's left, makes the opening lead", 'מגן: משמאל לכרוז, מבצע את הובלת הפתיחה'), 'defender leader', west, true),
      center,
      seat('e', L('East', 'מזרח'), L("Defender: West's partner", 'מגן: השותף של מערב'), 'defender', parseHand(DEAL.e), true),
      seat('s', L('South', 'דרום'), L("Declarer: plays both South's and North's cards", 'כרוז: משחק גם את הקלפים של דרום וגם של צפון'), 'declarer', parseHand(DEAL.s)));
    box.appendChild(table);
  }

  return { mount };
})();

// A small bidding box for the example windows: West, North, East, South, the dealer underlined,
// the calls so far, and a dashed "?" where you (South) are to call.
function askBox(dealer, calls) {
  const cols = [3, 0, 1, 2];
  const cells = Array(cols.indexOf(dealer)).fill('<td></td>');
  calls.forEach(c => cells.push(`<td>${bidHtml(c)}</td>`));
  cells.push('<td class="ask">?</td>');
  while (cells.length % 4) cells.push('<td></td>');
  const rows = [];
  for (let i = 0; i < cells.length; i += 4) rows.push(`<tr>${cells.slice(i, i + 4).join('')}</tr>`);
  const name = s => (s === 2 ? L('South (you)', 'דרום (אתם)') : SEAT_NAMES[s]);
  return `<table class="bid-box ap-box ask-box"><tr>${cols.map(s => `<th class="${s === dealer ? 'dealer' : ''}">${name(s)}</th>`).join('')}</tr>${rows.join('')}</table>`;
}

// The "Opening the bidding" table: tap a hand type to deal random examples of it, with the
// opening bid and the app's explanation.
const OpeningExamples = (() => {
  const isMinor = b => b === '1C' || b === '1D';
  const hasFiveMajor = hand => { const len = suitLengths(hand); return len.H >= 5 || len.S >= 5; };
  // Which opening each row of the table describes.
  const ROWS = {
    pass: b => b === 'P',
    major: b => b === '1H' || b === '1S',
    minor: (b, hand) => isMinor(b) && !hasFiveMajor(hand),
    nt1: b => b === '1N',
    nt2: b => b === '2N',
    c2: b => b === '2C',
    weak2: b => b === '2D' || b === '2H' || b === '2S',
    pre3: b => /^3[CDHS]$/.test(b),
    pre4: b => /^4[CDHS]$/.test(b),
  };
  let dialog, key, title;

  function find() {
    for (let i = 0; i < 20000; i++) {
      for (const hand of dealHands()) {
        const r = openingBid(hand);
        if (ROWS[key](r.bid, hand)) return { hand, r };
      }
    }
    return null;
  }

  function render() {
    const found = find();
    dialog.innerHTML = `<h3>${title}</h3>`;
    if (!found) {
      dialog.insertAdjacentHTML('beforeend', `<p>${L('No example found this time. Try again.', 'לא נמצאה דוגמה הפעם. נסו שוב.')}</p>`);
    } else {
      const { hand, r } = found;
      dialog.insertAdjacentHTML('beforeend', `<p class="fin-setup">${L('You are South and the dealer, so you call first. What do you open?', 'אתם בדרום והמחלקים, ולכן אתם מכריזים ראשונים. במה תפתחו?')}</p>${askBox(2, [])}`);
      const felt = document.createElement('div');
      felt.className = 'shape-felt opening-felt';
      renderFan(felt, hand);
      const lens = Object.values(suitLengths(hand)).sort((a, b) => b - a).join('-');
      const info = document.createElement('p');
      info.className = 'opening-info';
      info.innerHTML = `${L(`${hcp(hand)} HCP`, `${hcp(hand)} נק'`)} · ${ltr(lens)} · ${L('Open', 'פתחו')}: <strong>${bidHtml(r.bid)}</strong>`;
      const why = document.createElement('p');
      why.className = 'example-why';
      why.innerHTML = r.why;
      felt.prepend(why, info); // the explanation on the felt, above the hand
      dialog.append(felt);
    }
    const buttons = document.createElement('div');
    buttons.className = 'opening-buttons';
    const next = document.createElement('button');
    next.className = 'btn';
    next.type = 'button';
    next.textContent = L('Next hand', 'יד הבאה');
    next.addEventListener('click', render);
    const close = document.createElement('button');
    close.className = 'btn secondary';
    close.type = 'button';
    close.textContent = L('Close', 'סגירה');
    close.addEventListener('click', () => dialog.close());
    buttons.append(next, close);
    dialog.appendChild(buttons);
  }

  function show(k, label) {
    if (!ROWS[k]) return;
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.className = 'finesse-dialog opening-dialog';
      dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); }); // the backdrop
      document.body.appendChild(dialog);
    }
    key = k;
    title = label;
    render();
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
  }

  return { show };
})();

// A finished trick drawn on a small table, each card labeled by what it did: the lead, the
// winner (a ruff when it's a trump) and any discard. Used for the examples in Tricks and Trumps.
const TrickPicture = (() => {
  const SEATS = { N: 0, E: 1, S: 2, W: 3 };
  const AREA = ['n', 'e', 's', 'w'];

  // The seat that wins: the highest trump if any was played, otherwise the highest card of the suit led.
  function winnerOf(plays, lead, trump) {
    let win = lead;
    for (let i = 1; i < 4; i++) {
      const seat = (lead + i) % 4, c = plays[seat], b = plays[win];
      if ((c.suit === b.suit && c.value > b.value) || (c.suit === trump && b.suit !== trump)) win = seat;
    }
    return win;
  }

  // A random legal trick: a random leader leads a random card; the others follow suit when they can,
  // and otherwise discard, or sometimes ruff when there's a trump suit.
  function dealTrick(trump) {
    const hands = dealHands();
    const lead = Math.floor(Math.random() * 4);
    const pick = cards => cards[Math.floor(Math.random() * cards.length)];
    const plays = {};
    plays[lead] = pick(hands[lead]);
    const led = plays[lead].suit;
    for (let i = 1; i < 4; i++) {
      const seat = (lead + i) % 4, hand = hands[seat];
      const follow = hand.filter(c => c.suit === led);
      const trumps = trump ? hand.filter(c => c.suit === trump) : [];
      plays[seat] = follow.length ? pick(follow) : trumps.length && Math.random() < 0.6 ? pick(trumps) : pick(hand);
    }
    return { plays, lead };
  }

  // Discards are what the lesson is about, so most random tricks have one, and often a discard that
  // is higher than the winning card (an ace of another suit that still doesn't win).
  function randomTrick(trump) {
    const wantDiscard = Math.random() < 2 / 3, wantHigh = wantDiscard && Math.random() < 0.5;
    let t = dealTrick(trump);
    for (let tries = 0; tries < 3000; tries++) {
      const led = t.plays[t.lead].suit, win = t.plays[winnerOf(t.plays, t.lead, trump)];
      const discards = Object.values(t.plays).filter(c => c.suit !== led && c.suit !== trump);
      if (!wantDiscard || (discards.length && (!wantHigh || discards.some(c => c.value > win.value)))) break;
      t = dealTrick(trump);
    }
    return t;
  }

  // Who won and why, plus any discards and ruffs.
  function explain(plays, lead, trump, win) {
    const led = plays[lead].suit;
    const name = seat => SEAT_NAMES[seat];
    const card = seat => cardHtml(plays[seat]);
    const ledName = SUIT_NAME[led];
    const notes = [];
    for (let i = 1; i < 4; i++) {
      const seat = (lead + i) % 4, c = plays[seat];
      if (c.suit === led || seat === win) continue;
      notes.push(c.suit === trump
        ? L(`${name(seat)} has no ${ledName} and ruffs with ${card(seat)}, but it isn't the highest trump.`, `ל${name(seat)} אין ${ledName}, והוא חותך עם ${card(seat)}, אבל זה לא השליט הגבוה ביותר.`)
        : c.value > plays[win].value
          ? L(`${name(seat)} has no ${ledName} and discards ${card(seat)}. It's higher than ${card(win)}, but it isn't a ${ledName.replace(/s$/, '')}, the suit led, so it can't win the trick.`,
            `ל${name(seat)} אין ${ledName}, והוא משליך ${card(seat)}. הקלף הזה גבוה מ-${card(win)}, אבל הוא לא ${ledName}, הסדרה שהובלה, ולכן הוא לא יכול לזכות בלקיחה.`)
          : L(`${name(seat)} has no ${ledName} and discards ${card(seat)}.`, `ל${name(seat)} אין ${ledName}, והוא משליך ${card(seat)}.`));
    }
    const trumpsPlayed = [0, 1, 2, 3].filter(seat => plays[seat].suit === trump && trump !== led).length;
    const main = plays[win].suit !== led
      ? (trumpsPlayed > 1
        ? L(`${name(win)} wins with ${card(win)}: more than one trump was played, and the highest trump wins.`, `${name(win)} זוכה עם ${card(win)}: שוחק יותר משליט אחד, והשליט הגבוה ביותר זוכה.`)
        : L(`${name(win)} has no ${ledName} and ruffs with ${card(win)}: a trump beats every card of the other suits, so ${name(win)} wins.`, `ל${name(win)} אין ${ledName}, והוא חותך עם ${card(win)}: שליט גובר על כל קלף מהסדרות האחרות, ולכן ${name(win)} זוכה.`))
      : L(`${name(win)} wins: ${card(win)} is the highest card in the suit led, ${ledName}.`, `${name(win)} זוכה: ${card(win)} הוא הקלף הגבוה ביותר בסדרה שהובלה.`);
    return [main, ...notes].join(' ');
  }

  function mount(box) {
    const plays = Object.fromEntries(box.dataset.trick.split(' ').map(t => [SEATS[t[0]], { suit: t[2], rank: t[3], value: RANKS.indexOf(t[3]) + 2 }]));
    render(box, plays, SEATS[box.dataset.lead], box.dataset.trump || null, null);
  }

  function render(box, plays, lead, trump, why) {
    const led = plays[lead].suit;
    const win = winnerOf(plays, lead, trump);
    const table = document.createElement('div');
    table.className = 'trick-picture-table';
    for (let seat = 0; seat < 4; seat++) {
      const c = plays[seat];
      const role = seat === win
        ? (c.suit !== led ? L('Winner ✓ (ruff)', 'זוכה ✓ (חיתוך)') : L('Winner ✓', 'זוכה ✓'))
        : seat === lead ? L('Leader', 'מוביל')
        : c.suit === led ? ''
        : c.suit === trump ? L('Ruff', 'חיתוך') : L('Discard', 'השלכה');
      const spot = document.createElement('div');
      spot.className = `tp-seat ${AREA[seat]}${seat === win ? ' winner' : ''}${seat === lead ? ' leader' : ''}`;
      spot.innerHTML = `<div class="tp-label"><strong>${SEAT_NAMES[seat]}</strong>${role ? `<span class="tp-role">${role}</span>` : ''}</div>`;
      const card = createCardEl(c);
      if (seat === win) card.classList.add('winner');
      if (seat === lead && seat !== win) card.classList.add('led');
      card.insertAdjacentHTML('beforeend', `<span class="tp-num" aria-hidden="true">${(seat - lead + 4) % 4 + 1}</span>`);
      card.dataset.seat = seat;
      spot.appendChild(card);
      table.appendChild(spot);
    }
    box.innerHTML = '';
    box.appendChild(table);
    if (why) box.insertAdjacentHTML('beforeend', `<p class="tp-why">${why}</p>`);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn tp-random';
    button.textContent = '🎲 ' + L('Random trick', 'לקיחה אקראית');
    button.addEventListener('click', () => {
      // The lesson's own explanation fits only the first trick.
      const own = box.parentElement && box.parentElement.querySelector(':scope > p.small');
      if (own) own.hidden = true;
      const title = box.parentElement && box.parentElement.querySelector(':scope > .example-title');
      if (title) title.innerHTML = L('Random trick', 'לקיחה אקראית') + (trump ? ` — ${trumpText(trump)}` : '');
      const t = randomTrick(trump);
      Sound.cardPlayed();
      render(box, t.plays, t.lead, trump, explain(t.plays, t.lead, trump, winnerOf(t.plays, t.lead, trump)));
    });
    box.appendChild(button);
    // Curved arrows from card to card in the order of play, redrawn whenever the size changes.
    const draw = () => drawArrows(table, lead);
    requestAnimationFrame(draw);
    if (window.ResizeObserver) new ResizeObserver(draw).observe(table);
  }

  function drawArrows(table, lead) {
    table.querySelector('.tp-arrows')?.remove();
    const box = table.getBoundingClientRect();
    if (!box.width) return;
    const at = seat => {
      const r = table.querySelector(`.card[data-seat="${seat}"]`).getBoundingClientRect();
      return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2, w: r.width, h: r.height };
    };
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'tp-arrows');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    svg.innerHTML = `<defs><marker id="tp-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="rgba(255,255,255,.85)"/></marker></defs>`;
    for (let i = 0; i < 3; i++) {
      const fromSeat = (lead + i) % 4, toSeat = (lead + i + 1) % 4;
      const a = at(fromSeat), b = at(toSeat);
      // Bend around the table's corner: the side seat (West/East) gives x, North/South gives y.
      const side = fromSeat % 2 ? a : b, end = fromSeat % 2 ? b : a;
      const c = { x: side.x + (end.x - side.x) * 0.15, y: end.y + (side.y - end.y) * 0.15 };
      const pull = (p, q, d) => { const dx = q.x - p.x, dy = q.y - p.y, len = Math.hypot(dx, dy) || 1; d = Math.min(d, len * 0.6); return { x: p.x + dx / len * d, y: p.y + dy / len * d }; }; // never past the bend, or the head turns around
      const start = pull(a, c, Math.max(a.w, a.h) * 0.62);
      const stop = pull(b, c, Math.max(b.w, b.h) * 0.66);
      const path = document.createElementNS(svgNS, 'path');
      path.setAttribute('d', `M${start.x},${start.y} Q${c.x},${c.y} ${stop.x},${stop.y}`);
      path.setAttribute('marker-end', 'url(#tp-head)');
      svg.appendChild(path);
    }
    table.appendChild(svg);
  }

  return { mount };
})();

// The whole auction shown in "The auction" lesson: a bidding box with the dealer underlined, the
// final contract highlighted, the closing passes outlined, and numbered notes beside it.
const AuctionPicture = (() => {
  const COLUMNS = [3, 0, 1, 2]; // West, North, East, South
  const EXAMPLE = { dealer: 2, declarer: 2, calls: ['1H', '1S', '2H', 'P', '4H', 'P', 'P', 'P'] };
  const side = seat => (seat % 2 ? L('East-West', 'מזרח-מערב') : L('North-South', 'צפון-דרום'));

  // A random auction from the app's own bidding rules (the ones Play a Hand uses). They always deal
  // South, so the seats are turned round to give a random dealer.
  function randomAuction() {
    // Doubles and redoubles are rare in real deals, so some clicks look for an auction that has one.
    const roll = Math.random();
    const want = roll < 0.1 ? 'XX' : roll < 0.25 ? 'X' : null;
    for (let tries = 0; tries < 4000; tries++) {
      const a = bidAuction(dealHands(), { anyDeclarer: true });
      if (!a) continue;
      if (want && tries < 3999 && !a.calls.some(c => c.call === want)) continue;
      const turn = Math.floor(Math.random() * 4);
      const seat = x => (x + turn) % 4;
      return { dealer: seat(a.dealer), declarer: seat(a.declarer), calls: a.calls.map(c => c.call) };
    }
    return EXAMPLE;
  }

  function notesFor({ dealer, declarer, calls }) {
    const final = calls.reduce((j, c, i) => (/^\d/.test(c) ? i : j), -1);
    const contract = calls[final];
    const strain = contract[1];
    const bids = calls.filter(c => /^\d/.test(c)).map(bidHtml).join(', ');
    const single = calls.filter(c => /^\d/.test(c)).length === 1;
    const doubles = calls.includes('X') || calls.includes('XX');
    const after = calls.slice(final + 1);
    const level = after.includes('XX') ? L(' redoubled', ' ברידאבל') : after.includes('X') ? L(' doubled', ' בדאבל') : '';
    const tricks = Number(contract[0]) + 6;
    const what = strain === 'N' ? L('in no-trump', 'בללא שליט') : L(`with ${SUIT_NAME[strain]} as trumps`, `עם ${SUIT_NAME[strain]} כשליט`);
    const strainName = strain === 'N' ? L('no-trump', 'ללא שליט') : SUIT_NAME[strain];
    const D = SEAT_NAMES[dealer], C = SEAT_NAMES[declarer];
    return L([
      `${D} is the <strong>dealer</strong> (underlined), so ${D} calls first and opens ${bidHtml(calls[0])}.`,
      single ? `${bidHtml(contract)} is the only bid: everyone else passes. A pass is always allowed.`
        : `Every bid is higher than the one before: ${bids}. A pass is always allowed${doubles ? ', and a double or redouble (Dbl, Rdbl) is not a bid' : ''}.`,
      `${bidHtml(contract)} is the last bid, so it becomes the <strong>contract</strong>${level}: ${side(declarer)} must take ${tricks} tricks ${what}.`,
      `<strong>Three passes</strong> in a row end the auction. ${C} is the <strong>declarer</strong>: the first of ${side(declarer)} to bid ${strainName}.`,
    ], [
      `${D} הוא <strong>המחלק</strong> (מסומן בקו), ולכן ${D} מכריז ראשון ופותח ${bidHtml(calls[0])}.`,
      single ? `${bidHtml(contract)} היא ההכרזה היחידה: כל השאר מכריזים פאס. פאס מותר תמיד.`
        : `כל הכרזה גבוהה מקודמתה: ${bids}. פאס מותר תמיד${doubles ? ', ודאבל או רידאבל אינם הכרזות' : ''}.`,
      `${bidHtml(contract)} היא ההכרזה האחרונה, ולכן היא <strong>החוזה</strong>${level}: ${side(declarer)} צריכים לקחת ${tricks} לקיחות ${what}.`,
      `<strong>שלושה פאסים</strong> ברצף מסיימים את המכרז. ${C} הוא <strong>הכרוז</strong>: הראשון מ${side(declarer)} שהכריז ${strainName}.`,
    ]);
  }

  function render(box, auction) {
    const { dealer, calls } = auction;
    const final = calls.reduce((j, c, i) => (/^\d/.test(c) ? i : j), -1);
    const cells = Array(COLUMNS.indexOf(dealer)).fill('<td></td>');
    calls.forEach((c, i) => {
      const cls = i === final ? 'final' : i > final && c === 'P' ? 'closing' : '';
      const mark = i === 0 ? 1 : i === final ? 3 : i === calls.length - 1 ? 4 : null;
      cells.push(`<td class="${cls}">${bidHtml(c)}${mark ? `<span class="ap-num">${mark}</span>` : ''}</td>`);
    });
    while (cells.length % 4) cells.push('<td></td>');
    const rows = [];
    for (let i = 0; i < cells.length; i += 4) rows.push(`<tr>${cells.slice(i, i + 4).join('')}</tr>`);
    box.innerHTML = `
      <div class="ap-wrap">
        <table class="bid-box ap-box">
          <tr>${COLUMNS.map(s => `<th class="${s === dealer ? 'dealer' : ''}">${SEAT_NAMES[s]}</th>`).join('')}</tr>
          ${rows.join('')}
        </table>
        <ol class="ap-notes">${notesFor(auction).map(n => `<li>${n}</li>`).join('')}</ol>
      </div>
      <button class="btn ap-random" type="button">🎲 ${L('Random auction', 'מכרז אקראי')}</button>`;
    box.querySelector('.ap-random').addEventListener('click', () => render(box, randomAuction()));
  }

  const mount = box => render(box, EXAMPLE);

  return { mount };
})();

// The Overcalls lesson table: tap a row to deal random examples. East (on your right) opens one of a
// suit and you hold a hand that fits the row, with the app's answer and explanation.
const OvercallExamples = (() => {
  const rank = z => SUITS.indexOf(z); // lower index = higher-ranking
  // Which action each row describes, from the bid and the opening suit.
  const ROWS = {
    o1: (b) => /^1[CDHS]$/.test(b),
    o2: (b, open) => /^2[CDHS]$/.test(b) && rank(b[1]) > rank(open), // a lower suit: the cheapest level
    tox: (b, open, hand) => b === 'X' && hcp(hand) < 17,
    nt: b => b === '1N',
    strongx: (b, open, hand) => b === 'X' && hcp(hand) >= 17,
    wjo: (b, open) => /^2[CDHS]$/.test(b) && rank(b[1]) < rank(open), // could have bid it at the 1-level: a jump
    pre: b => /^[34][CDHS]$/.test(b),
    pass: b => b === 'P',
  };
  let dialog, key, title;

  function find() {
    for (let i = 0; i < 30000; i++) {
      const hands = dealHands();
      const open = openingBid(hands[1]).bid;
      if (!/^1[CDHS]$/.test(open)) continue;
      const r = overcallBid(hands[2], open[1]);
      if (ROWS[key](r.bid, open[1], hands[2])) return { hand: hands[2], open, r };
    }
    return null;
  }

  function render() {
    const found = find();
    dialog.innerHTML = `<h3>${title}</h3>`;
    if (!found) {
      dialog.insertAdjacentHTML('beforeend', `<p>${L('No example found this time. Try again.', 'לא נמצאה דוגמה הפעם. נסו שוב.')}</p>`);
    } else {
      const { hand, open, r } = found;
      dialog.insertAdjacentHTML('beforeend', `<p class="fin-setup">${L(`East, on your right, opens <strong>${bidHtml(open)}</strong>. You are South. What do you do?`, `מזרח, מימינכם, פותח <strong>${bidHtml(open)}</strong>. אתם בדרום. מה תעשו?`)}</p>${askBox(1, [open])}`);
      const felt = document.createElement('div');
      felt.className = 'shape-felt opening-felt';
      renderFan(felt, hand);
      const lens = Object.values(suitLengths(hand)).sort((a, b) => b - a).join('-');
      const info = document.createElement('p');
      info.className = 'opening-info';
      info.innerHTML = `${L(`${hcp(hand)} HCP`, `${hcp(hand)} נק'`)} · ${ltr(lens)} · ${L('Bid', 'הכרזה')}: <strong>${bidHtml(r.bid)}</strong>`;
      const why = document.createElement('p');
      why.className = 'example-why';
      why.innerHTML = r.why;
      felt.prepend(why, info); // the explanation on the felt, above the hand
      dialog.append(felt);
    }
    const buttons = document.createElement('div');
    buttons.className = 'opening-buttons';
    const next = document.createElement('button');
    next.className = 'btn';
    next.type = 'button';
    next.textContent = L('Next hand', 'יד הבאה');
    next.addEventListener('click', render);
    const close = document.createElement('button');
    close.className = 'btn secondary';
    close.type = 'button';
    close.textContent = L('Close', 'סגירה');
    close.addEventListener('click', () => dialog.close());
    buttons.append(next, close);
    dialog.appendChild(buttons);
  }

  function show(k, label) {
    if (!ROWS[k]) return;
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.className = 'finesse-dialog opening-dialog';
      dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); }); // the backdrop
      document.body.appendChild(dialog);
    }
    key = k;
    title = label;
    render();
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
  }

  return { show };
})();

// The balanced and unbalanced hands in the point-counting lesson. Each caption's shape, points and
// reason are worked out from the cards.
const ShapeExamples = (() => {
  const BALANCED = ['S:KQ74 H:A85 D:J62 C:K93', 'S:AJ62 H:KQ85 D:973 C:Q4', 'S:K8 H:AQJ74 D:K63 C:Q52'];
  const UNBALANCED = ['S:AKJ83 H:7 D:KQ94 C:852', 'H:KJ9643 D:AQ75 C:K82', 'S:Q7 H:A5 D:KJT63 C:AJ82'];

  function reason(lens) {
    if (lens.includes(0)) return L('a void', 'חוסר');
    if (lens.includes(1)) return L('a singleton', 'סינגלטון');
    return L('two doubletons', 'שני דאבלטונים');
  }

  function figure(spec) {
    const hand = parseHand(spec);
    const lens = Object.values(suitLengths(hand));
    const shape = lens.slice().sort((a, b) => b - a).join('-');
    const fig = document.createElement('figure');
    fig.className = 'shape-hand';
    const felt = document.createElement('div');
    felt.className = 'shape-felt';
    renderFan(felt, hand);
    const cap = document.createElement('figcaption');
    cap.innerHTML = `<strong>${ltr(shape)}</strong> · ${L(`${hcp(hand)} HCP`, `${hcp(hand)} נק'`)}` +
      (isBalanced(hand) ? '' : ` · ${reason(lens)}`);
    fig.append(felt, cap);
    return fig;
  }

  function group(title, specs) {
    const box = document.createElement('div');
    box.className = 'example';
    box.innerHTML = `<div class="example-title">${title}</div>`;
    const grid = document.createElement('div');
    grid.className = 'shape-grid';
    specs.forEach(spec => grid.appendChild(figure(spec)));
    box.appendChild(grid);
    return box;
  }

  function mount(box) {
    box.innerHTML = '';
    box.append(group(L('Balanced', 'מאוזנות'), BALANCED), group(L('Unbalanced', 'לא מאוזנות'), UNBALANCED));
  }

  return { mount };
})();

// The pop-up behind each kind in the lesson's Finesses table: every way the missing honors can lie
// between West and East, with the tricks it gives and the chance of the best result. The Defense
// lesson's "During the play" tips use the same pop-up to compare the right and wrong play.
const FinesseLayouts = (() => {
  // Holdings use 'x' for a small card; '' is a void. Each case gives the defenders' honors and the
  // tricks the suit makes when you play it the recommended way. `trump` names the trump suit when
  // the play needs one; South then also shows a small trump next to the void.
  // Defense kinds (`defense: true`) instead give all four `hands`, with you as West (or as `you`:
  // 'e'), a `setup` line, and cases counting declarer's tricks, so fewer is better.
  // `lead: [seat, index]` raises the card that is led: the index-th card of that seat's holding.
  const KINDS = {
    simple: {
      title: ['Simple finesse: A-Q', 'עקיפה פשוטה: A-Q'], north: 'AQ', south: 'xx', lead: ['s', 0],
      cases: [
        { w: 'K', e: '', tricks: 2, title: ['King with West (on your left)', 'המלך אצל מערב (משמאלכם)'],
          text: ['Lead low toward the queen. If West plays low, the queen wins; if West plays the king, the ace takes it and the queen is high.',
            'הובילו נמוך לעבר המלכה. אם מערב משחק נמוך, המלכה זוכה; אם מערב משחק את המלך, האס לוקח אותו והמלכה גבוהה.'] },
        { w: '', e: 'K', tricks: 1, title: ['King with East (on your right)', 'המלך אצל מזרח (מימינכם)'],
          text: ['East plays after dummy, so the queen loses to the king. Only the ace wins.',
            'מזרח משחק אחרי הדומם, ולכן המלכה מפסידה למלך. רק האס זוכה.'] },
      ],
      chance: ['Two tricks whenever West has the king: about 50%.', 'שתי לקיחות בכל פעם שהמלך אצל מערב: בערך 50%.'],
    },
    toward: {
      title: ['Leading toward an honor: K-x', 'הובלה לעבר הונור: K-x'], north: 'xx', south: 'Kx', lead: ['n', 0],
      cases: [
        { w: '', e: 'A', tricks: 1, title: ['Ace with East (on your right)', 'האס אצל מזרח (מימינכם)'],
          text: ['Lead low from dummy. If East plays low, the king wins; if East takes the ace, the king is high later.',
            'הובילו נמוך מהדומם. אם מזרח משחק נמוך, המלך זוכה; אם מזרח לוקח עם האס, המלך גבוה בהמשך.'] },
        { w: 'A', e: '', tricks: 0, title: ['Ace with West (on your left)', 'האס אצל מערב (משמאלכם)'],
          text: ["West's ace sits over the king, so the king loses however you play.",
            'האס של מערב יושב מעל המלך, ולכן המלך מפסיד איך שלא תשחקו.'] },
      ],
      chance: ['One trick whenever East has the ace: about 50%. Leading the king yourself never wins a trick.',
        'לקיחה אחת בכל פעם שהאס אצל מזרח: בערך 50%. הובלת המלך בעצמכם אף פעם לא זוכה.'],
    },
    queen: {
      title: ['Finesse against the queen: A-K-J', 'עקיפה נגד המלכה: A-K-J'], north: 'AKJ', south: 'xxx', lead: ['s', 0],
      cases: [
        { w: 'Q', e: '', tricks: 3, title: ['Queen with West (on your left)', 'המלכה אצל מערב (משמאלכם)'],
          text: ['Lead low toward dummy. If West plays low, the jack wins; if West plays the queen, win and the jack is high.',
            'הובילו נמוך לעבר הדומם. אם מערב משחק נמוך, הנסיך זוכה; אם מערב משחק את המלכה, זכו והנסיך גבוה.'] },
        { w: '', e: 'Q', tricks: 2, title: ['Queen with East (on your right)', 'המלכה אצל מזרח (מימינכם)'],
          text: ['The jack loses to the queen. The ace and king still win.', 'הנסיך מפסיד למלכה. האס והמלך עדיין זוכים.'] },
      ],
      chance: ['Three tricks whenever West has the queen: about 50%.', 'שלוש לקיחות בכל פעם שהמלכה אצל מערב: בערך 50%.'],
    },
    kj: {
      title: ['Leading toward K-J', 'הובלה לעבר K-J'], north: 'KJx', south: 'xxx', lead: ['s', 0],
      cases: [
        { w: 'AQ', e: '', tricks: 2, title: ['Ace and queen with West', 'האס והמלכה אצל מערב'],
          text: ['Lead low and play the jack: it wins. Lead low again and the king wins too.',
            'הובילו נמוך ושחקו את הנסיך: הוא זוכה. הובילו שוב נמוך וגם המלך זוכה.'] },
        { w: 'A', e: 'Q', tricks: 1, title: ['Ace with West, queen with East', 'האס אצל מערב, המלכה אצל מזרח'],
          text: ["The jack loses to East's queen. Later lead toward the king: West's ace can't stop it.",
            'הנסיך מפסיד למלכה של מזרח. בהמשך הובילו לעבר המלך: האס של מערב לא יכול לעצור אותו.'] },
        { w: 'Q', e: 'A', tricks: 1, title: ['Queen with West, ace with East', 'המלכה אצל מערב, האס אצל מזרח'],
          text: ["East wins the jack with the ace. Later lead toward the king: West's queen is below it.",
            'מזרח זוכה בנסיך עם האס. בהמשך הובילו לעבר המלך: המלכה של מערב נמוכה ממנו.'] },
        { w: '', e: 'AQ', tricks: 0, title: ['Ace and queen with East', 'האס והמלכה אצל מזרח'],
          text: ['East sits over both honors: the jack loses to the queen and the king to the ace.',
            'מזרח יושב מעל שני ההונורים: הנסיך מפסיד למלכה והמלך לאס.'] },
      ],
      chance: ['Two tricks about 25% of the time, at least one about 75%.', 'שתי לקיחות בערך ב-25% מהמקרים, לפחות אחת בערך ב-75%.'],
    },
    double: {
      title: ['Double finesse: A-Q-10', 'עקיפה כפולה: A-Q-10'], north: 'AQT', south: 'xxx', lead: ['s', 0],
      cases: [
        { w: 'KJ', e: '', tricks: 3, title: ['King and jack with West', 'המלך והנסיך אצל מערב'],
          text: ['Lead low and play the 10: it wins. Lead low again and play the queen: it wins too.',
            'הובילו נמוך ושחקו את ה-10: הוא זוכה. הובילו שוב נמוך ושחקו את המלכה: גם היא זוכה.'] },
        { w: 'K', e: 'J', tricks: 2, title: ['King with West, jack with East', 'המלך אצל מערב, הנסיך אצל מזרח'],
          text: ["The 10 loses to East's jack. Later the queen finesse wins.", 'ה-10 מפסיד לנסיך של מזרח. בהמשך העקיפה עם המלכה מצליחה.'] },
        { w: 'J', e: 'K', tricks: 2, title: ['Jack with West, king with East', 'הנסיך אצל מערב, המלך אצל מזרח'],
          text: ["The 10 loses to East's king, but then the ace and queen are both winners.", 'ה-10 מפסיד למלך של מזרח, אבל אז האס והמלכה שניהם זוכים.'] },
        { w: '', e: 'KJ', tricks: 1, title: ['King and jack with East', 'המלך והנסיך אצל מזרח'],
          text: ['The 10 loses to the jack and the queen to the king. Only the ace wins.', 'ה-10 מפסיד לנסיך והמלכה למלך. רק האס זוכה.'] },
      ],
      chance: ['Three tricks about 25% of the time, at least two about 75%.', 'שלוש לקיחות בערך ב-25% מהמקרים, לפחות שתיים בערך ב-75%.'],
    },
    ruffing: {
      title: ['Ruffing finesse: A-Q-J / void', 'עקיפת חיתוך: A-Q-J / חוסר'], north: 'AQJ', south: '', trump: 'H', lead: ['n', 1],
      cases: [
        { w: '', e: 'K', tricks: 3, title: ['King with East (on your right)', 'המלך אצל מזרח (מימינכם)'],
          text: ['Lead the queen from dummy. If East covers with the king, ruff it with a heart (trump) and the jack is high; if East plays low, throw a loser and the queen wins.',
            'הובילו את המלכה מהדומם. אם מזרח מכסה עם המלך, חתכו עם הארט (שליט) והנסיך גבוה; אם מזרח משחק נמוך, השליכו מפסיד והמלכה זוכה.'] },
        { w: 'K', e: '', tricks: 2, title: ['King with West (on your left)', 'המלך אצל מערב (משמאלכם)'],
          text: ['West wins the queen with the king. You threw a loser on it, so the lost trick costs nothing extra.',
            'מערב זוכה במלכה עם המלך. השלכתם עליה מפסיד, כך שהלקיחה שהפסדתם לא עולה לכם יותר.'] },
      ],
      chance: ['Works whenever East has the king: about 50%. Here the king must be on your right, the opposite of a simple finesse.',
        'מצליח בכל פעם שהמלך אצל מזרח: בערך 50%. כאן המלך צריך להיות מימינכם, הפוך מעקיפה פשוטה.'],
    },
    second: {
      title: ['Second hand low', 'יד שנייה נמוך'], defense: true,
      setup: ["Declarer (South) leads a small card toward dummy's queen. You are West, the second hand to play.",
        'הכרוז (דרום) מוביל קלף קטן לעבר המלכה של הדומם. אתם במערב, היד השנייה לשחק.'],
      hands: { n: 'Qxx', w: 'Axx', e: 'JTx', s: 'Kxx' }, lead: ['s', 2],
      cases: [
        { tricks: 1, play: ['w', 2], title: ['You play low', 'אתם משחקים נמוך'],
          text: ["Dummy's queen wins. When declarer later plays the king, you play after it and your ace captures it, and then partner's jack is the highest card left. You win two tricks; declarer makes only the queen.",
            'המלכה של הדומם זוכה. כשהכרוז ישחק אחר כך את המלך, אתם משחקים אחריו והאס שלכם תופס אותו, ואז הנסיך של השותף הוא הקלף הגבוה שנשאר. אתם זוכים בשתי לקיחות; הכרוז לוקח רק את המלכה.'] },
        { tricks: 2, play: ['w', 0], title: ['You play the ace', 'אתם משחקים את האס'],
          text: ["Your ace captures only small cards. Declarer's king and queen are both left as winners, and partner's jack and 10 fall under them: you win only one trick.",
            'האס שלכם תופס רק קלפים קטנים. המלך והמלכה של הכרוז נשארים שניהם זוכים, והנסיך וה-10 של השותף נופלים תחתיהם: אתם זוכים רק בלקיחה אחת.'] },
      ],
      chance: ["Save your ace for one of declarer's honors. Played second, it usually captures only small cards.",
        'שמרו את האס לאחד ההונורים של הכרוז. כשמשחקים אותו כיד שנייה, הוא בדרך כלל תופס רק קלפים קטנים.'],
    },
    third: {
      title: ['Third hand high', 'יד שלישית גבוה'], defense: true,
      setup: ['Partner (West) leads low from Q-10-x-x and dummy plays low. You are East, the third hand; declarer (South) plays after you.',
        'השותף (מערב) מוביל נמוך מתוך Q-10-x-x והדומם משחק נמוך. אתם במזרח, היד השלישית; הכרוז (דרום) משחק אחריכם.'],
      hands: { n: 'xxx', w: 'QTxx', e: 'Kxx', s: 'AJx' }, you: 'e', lead: ['w', 3],
      cases: [
        { tricks: 1, play: ['e', 0], title: ['You play the king', 'אתם משחקים את המלך'],
          text: ["Declarer has to spend the ace on your king. Partner's Q-10 are now higher than declarer's jack, so declarer makes only the ace.",
            'הכרוז חייב להוציא את האס על המלך שלכם. ה-Q-10 של השותף גבוהים עכשיו מהנסיך של הכרוז, ולכן הכרוז לוקח רק את האס.'] },
        { tricks: 2, play: ['e', 2], title: ['You play low', 'אתם משחקים נמוך'],
          text: ['Declarer wins cheaply with the jack and still has the ace: two tricks.',
            'הכרוז זוכה בזול עם הנסיך, והאס עדיין אצלו: שתי לקיחות.'] },
      ],
      chance: ["When partner leads, play your highest card so declarer can't win cheaply. With touching cards such as K-Q, play the cheaper one, the queen.",
        'כשהשותף מוביל, שחקו את הקלף הגבוה שלכם כדי שהכרוז לא יזכה בזול. עם קלפים צמודים כמו K-Q, שחקו את הזול מביניהם, המלכה.'],
    },
    cover: {
      title: ['Cover an honor with an honor', 'כסו הונור בהונור'], defense: true,
      setup: ['Declarer (South) leads the queen. You are West with the king, and dummy, playing after you, has the ace.',
        'הכרוז (דרום) מוביל את המלכה. אתם במערב עם המלך, ולדומם, שמשחק אחריכם, יש את האס.'],
      hands: { n: 'Axx', w: 'Kxx', e: 'JTx', s: 'Qxx' }, lead: ['s', 0],
      cases: [
        { tricks: 1, play: ['w', 0], title: ['You cover with the king', 'אתם מכסים עם המלך'],
          text: ["Dummy's ace has to take two honors, the queen and your king, in one trick. Partner's jack and 10 become the highest cards, so declarer makes only the ace.",
            'האס של הדומם צריך לתפוס שני הונורים, המלכה והמלך שלכם, בלקיחה אחת. הנסיך וה-10 של השותף הופכים לקלפים הגבוהים, ולכן הכרוז לוקח רק את האס.'] },
        { tricks: 2, play: ['w', 2], title: ['You play low', 'אתם משחקים נמוך'],
          text: ["The queen wins and declarer still has the ace: two tricks. Your king wins only the last round, and partner's jack and 10 are wasted.",
            'המלכה זוכה, והאס עדיין אצל הכרוז: שתי לקיחות. המלך שלכם זוכה רק בסיבוב האחרון, והנסיך וה-10 של השותף מתבזבזים.'] },
      ],
      chance: ["Cover when it can promote a card for your side, like partner's J-10 here. When declarer leads from a sequence such as Q-J-10, wait and cover the last honor.",
        'כסו כשזה יכול לקדם קלף לצד שלכם, כמו ה-J-10 של השותף כאן. כשהכרוז מוביל מתוך רצף כמו Q-J-10, חכו וכסו את ההונור האחרון.'],
    },
    return: {
      title: ["Return partner's suit", 'החזירו את הסדרה של השותף'], defense: true,
      setup: ['Partner (West) leads the fourth-best card, the 5, from K-Q-7-5-2. You are East: you win the trick with the ace, and now it is your lead.',
        'השותף (מערב) מוביל את הרביעי מלמעלה, ה-5, מתוך K-Q-7-5-2. אתם במזרח: אתם זוכים בלקיחה עם האס, ועכשיו ההובלה שלכם.'],
      hands: { n: { S: 'xxx', H: 'xx' }, w: 'KQ752', e: { S: 'Ax', H: 'xxx' }, s: { S: 'Jxx', H: 'AK' } }, you: 'e', lead: ['w', 3],
      cases: [
        { tricks: 0, play: ['e', [0, 1]], title: ["You return partner's suit", 'אתם מחזירים את הסדרה של השותף'],
          text: ["Your small spade comes through declarer's jack to partner's K-Q, and partner takes the rest of the suit. Switching to hearts would only help declarer, whose A-K win those tricks. Partner may have no other way to get the lead, so your return is what lets the long suit run.",
            'הספייד הקטן שלכם עובר דרך הנסיך של הכרוז אל ה-K-Q של השותף, והשותף לוקח את שאר הסדרה. מעבר להארט רק יעזור לכרוז, שה-A-K שלו זוכים בלקיחות האלה. ייתכן שלשותף אין דרך אחרת לקבל את ההובלה, ולכן ההחזרה שלכם היא מה שמאפשר לסדרה הארוכה לרוץ.'] },
      ],
      chance: ['Partner usually leads a long suit to set it up. Return it when you win a trick, unless you have a clearly better plan.',
        'השותף בדרך כלל מוביל סדרה ארוכה כדי לפתח אותה. החזירו אותה כשאתם זוכים בלקיחה, אלא אם יש לכם תוכנית טובה יותר בבירור.'],
    },
  };

  const t = pair => L(pair[0], pair[1]);
  let dialog;

  // `ranks` is a spade holding, or an object such as { S: 'Jxx', H: 'AK' } for a hand with more
  // than one suit. `led` is the index of the card led from this hand, or -1.
  function hand(cls, label, ranks, trump, led = -1, pick = null) {
    const box = document.createElement('div');
    box.className = 'fin-hand ' + cls;
    box.innerHTML = `<span class="fin-label" dir="auto">${label}</span>`;
    if (!ranks) {
      const row = document.createElement('div');
      row.className = 'fin-row';
      row.innerHTML = `<span class="fin-void">${ltr(suitHtml('S'))}&nbsp;${L('void', 'חוסר')}</span>`;
      if (trump) renderFan(row, [{ suit: trump, rank: 'x' }]);
      box.appendChild(row);
    } else {
      const suits = typeof ranks === 'string' ? { S: ranks } : ranks;
      const fan = renderFan(box, Object.entries(suits).flatMap(([suit, r]) => [...r].map(rank => ({ suit, rank }))));
      if (led >= 0) fan.children[led].classList.add('led');
      if (pick) [].concat(pick.index).forEach(i => fan.children[i].classList.add('pick', pick.tone)); // the cards you play: green right, red wrong
    }
    return box;
  }

  function caseBox(c, best, worst) {
    const tone = c.tricks === best ? 'good' : c.tricks === worst ? 'bad' : 'part';
    const mark = { good: '✅', bad: '❌', part: '🟡' }[tone];
    const box = document.createElement('div');
    box.className = 'fin-case ' + tone;
    const k = KINDS[dialog.dataset.kind];
    const count = c.tricks === 1 ? L('1 trick', 'לקיחה אחת') : c.tricks === 0 ? L('no tricks', 'אין לקיחות') : L(`${c.tricks} tricks`, `${c.tricks} לקיחות`);
    const tricks = !k.defense ? count
      : c.tricks === 0 ? L('declarer makes no tricks', 'הכרוז לא לוקח אף לקיחה') : L(`declarer makes ${count}`, `הכרוז לוקח ${count}`);
    box.innerHTML = `<div class="fin-head">${mark} ${t(c.title)}: ${tricks}</div>`;
    const table = document.createElement('div');
    table.className = 'fin-table';
    const led = seat => (k.lead && k.lead[0] === seat ? k.lead[1] : -1);
    const pick = seat => (c.play && c.play[0] === seat ? { index: c.play[1], tone: tone === 'good' ? 'right' : 'wrong' } : null);
    if (k.defense) {
      const you = k.you || 'w';
      const west = you === 'w' ? L('West (you)', 'מערב (אתם)') : L('West (partner)', 'מערב (השותף)');
      const east = you === 'e' ? L('East (you)', 'מזרח (אתם)') : L('East (partner)', 'מזרח (השותף)');
      table.append(
        hand('n', L('North (dummy)', 'צפון (דומם)'), k.hands.n, null, led('n')),
        hand('w', west, k.hands.w, null, led('w'), pick('w')),
        hand('e', east, k.hands.e, null, led('e'), pick('e')),
        hand('s', L('South (declarer)', 'דרום (הכרוז)'), k.hands.s, null, led('s')));
    } else {
      // The defenders' honors, filled out with small cards to the length of your longer hand.
      const len = Math.max(k.north.length, k.south.length);
      const defender = honors => (honors + 'x'.repeat(len)).slice(0, len);
      table.append(
        hand('n', L('North (dummy)', 'צפון (דומם)'), k.north, null, led('n')),
        hand('w', L('West', 'מערב'), defender(c.w)),
        hand('e', L('East', 'מזרח'), defender(c.e)),
        hand('s', L('South (you)', 'דרום (אתם)'), k.south, k.trump, led('s')));
    }
    const text = document.createElement('p');
    text.innerHTML = t(c.text);
    box.append(table, text);
    return box;
  }

  function show(kind) {
    const k = KINDS[kind];
    if (!k) return;
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.className = 'finesse-dialog';
      dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); }); // the backdrop
      document.body.appendChild(dialog);
    }
    dialog.dataset.kind = kind;
    const tricks = k.cases.map(c => c.tricks);
    const [best, worst] = k.defense ? [Math.min(...tricks), Math.max(...tricks)] : [Math.max(...tricks), Math.min(...tricks)];
    dialog.innerHTML = `<h3>${t(k.title)}</h3>` +
      (k.trump ? `<p class="fin-trump">${suitHtml(k.trump)} ${trumpText(k.trump)}</p>` : '') +
      (k.setup ? `<p class="fin-setup">${t(k.setup)}</p>` : '') +
      (k.lead ? `<p class="fin-legend">${k.defense
        ? L('The raised, outlined card is the one led. The card set apart with a colored frame is the one you play: green for the right play, red for the wrong one.',
          'הקלף המורם והמסומן הוא הקלף שמובילים. הקלף המופרד עם המסגרת הצבעונית הוא הקלף שאתם משחקים: בירוק המשחק הנכון, באדום המשחק השגוי.')
        : L('The raised, outlined card is the one led.', 'הקלף המורם והמסומן הוא הקלף שמובילים.')}</p>` : '');
    const grid = document.createElement('div');
    grid.className = 'fin-cases' + (k.cases.length === 1 ? ' single' : '');
    k.cases.forEach(c => grid.appendChild(caseBox(c, best, worst)));
    const chance = document.createElement('p');
    chance.className = 'fin-chance';
    chance.innerHTML = t(k.chance);
    const close = document.createElement('button');
    close.className = 'btn';
    close.type = 'button';
    close.textContent = L('Close', 'סגירה');
    close.addEventListener('click', () => dialog.close());
    dialog.append(grid, chance, close);
    dialog.showModal();
    dialog.scrollTop = 0; // start at the top on a phone, not at the focused Close button
  }

  return { show };
})();

// The "Example" in the Tricks and Trumps lessons: one trick from practice/trick-examples.txt,
// played a card at a time, then the winner and the explanation.
const TrickDemo = (() => {
  const examples = lesson => ((typeof PRACTICE !== 'undefined' && PRACTICE.trickExamples) || []).filter(e => e.lesson === lesson);
  const text = t => (t ? L(t.en || t.he, t.he || t.en) : '');
  const toCard = code => ({ suit: code[0], rank: code[1], value: RANKS.indexOf(code[1]) + 2 });

  function mount(box) {
    const list = examples(box.dataset.lesson);
    if (!list.length) { box.innerHTML = ''; return; }
    box.innerHTML = `<p><button class="btn" type="button">${list.length > 1 ? L('Examples', 'דוגמאות') : L('Example', 'דוגמה')}</button></p>`;
    box.querySelector('button').addEventListener('click', () => render(box, list, 0, 0));
  }

  // The seat that wins: the highest trump if any was played, otherwise the highest card of the suit led.
  function winnerOf(ex) {
    const cards = ex.cards.map(toCard);
    const led = cards[ex.leader].suit;
    const beats = (a, b) => (a.suit === b.suit ? a.value > b.value : a.suit === ex.trump);
    let best = ex.leader;
    for (let i = 1; i < 4; i++) {
      const seat = (ex.leader + i) % 4;
      if (beats(cards[seat], cards[best])) best = seat;
    }
    return { seat: best, card: cards[best], ruffed: cards[best].suit !== led };
  }

  function render(box, list, ex, step) {
    const deal = list[ex];
    const done = step === 4;
    const played = seat => (seat - deal.leader + 4) % 4 < step;
    const toPlay = (deal.leader + step) % 4;
    const win = done ? winnerOf(deal) : null;
    const trumpLine = deal.trump === 'N'
      ? `<strong>${L('No trump', 'ללא שליט')}</strong>`
      : `${L('Trumps:', 'שליט:')} <strong>${suitHtml(deal.trump)} ${SUIT_NAME[deal.trump]}</strong>`;
    let result = '';
    if (done) {
      const line = L(`<strong>${SEAT_NAMES[win.seat]} wins the trick with ${cardHtml(win.card)}.</strong>`,
        `<strong>${SEAT_NAMES[win.seat]} זוכה בלקיחה עם ${cardHtml(win.card)}.</strong>`);
      result = `<div class="feedback good">${line}${deal.why ? `<div>${text(deal.why)}</div>` : ''}</div>`;
    }
    box.innerHTML = `
      <div class="auction-demo-head">
        ${list.length > 1 ? `<span class="practice-count">${L(`Example ${ex + 1} of ${list.length}`, `דוגמה ${ex + 1} מתוך ${list.length}`)}</span>` : ''}
        ${deal.note ? `<span>${text(deal.note)}</span>` : ''}
      </div>
      <div class="table trick-demo-table">
        ${[0, 3, 1, 2].map(s => `<div class="seat ${['north', 'east', 'south', 'west'][s]}${!done && s === toPlay ? ' to-play' : ''}${done && s === win.seat ? ' trick-winner' : ''}" data-seat="${s}">
          <div class="seat-label"><strong>${SEAT_NAMES[s]}</strong>${s === deal.leader ? ` <span>${L('(leads)', '(מוביל)')}</span>` : ''}</div>
        </div>`).join('')}
        <div class="trick-center">${trumpLine}</div>
      </div>
      <div class="drill-nav">
        <button class="btn secondary" type="button" data-act="back" ${step === 0 ? 'disabled' : ''}>${L('← Back', '→ אחורה')}</button>
        <button class="btn" type="button" data-act="next" ${done ? 'disabled' : ''}>${L('Next card →', 'הקלף הבא ←')}</button>
        ${list.length > 1 ? `<span class="drill-nav-gap"></span>
        <button class="btn secondary" type="button" data-act="prev-ex" ${ex === 0 ? 'disabled' : ''}>${L('← Previous example', '→ הדוגמה הקודמת')}</button>
        <button class="btn secondary" type="button" data-act="next-ex" ${ex === list.length - 1 ? 'disabled' : ''}>${L('Next example →', 'הדוגמה הבאה ←')}</button>` : ''}
      </div>
      <div aria-live="polite">${result}</div>`;
    for (let seat = 0; seat < 4; seat++) {
      const el = box.querySelector(`[data-seat="${seat}"]`);
      if (played(seat)) {
        const card = createCardEl(toCard(deal.cards[seat]));
        if (done && seat === win.seat) card.classList.add('winner');
        el.appendChild(card);
      } else {
        el.insertAdjacentHTML('beforeend', '<div class="card-slot" aria-hidden="true"></div>');
      }
    }
    const moves = {
      back: () => render(box, list, ex, step - 1),
      next: () => { Sound.cardPlayed(); render(box, list, ex, step + 1); },
      'prev-ex': () => render(box, list, ex - 1, 0),
      'next-ex': () => render(box, list, ex + 1, 0),
    };
    box.querySelectorAll('[data-act]').forEach(btn => btn.addEventListener('click', () => {
      const which = btn.dataset.act;
      moves[which]();
      const again = box.querySelector(`[data-act="${which}"]`);
      (again && !again.disabled ? again : box.querySelector('[data-act="next"]:not(:disabled)') || box.querySelector('[data-act="back"]')).focus({ preventScroll: true });
    }));
  }

  return { mount };
})();

// The "Examples" in the auction lesson: a full deal from practice/auction-examples.txt, with the
// auction revealed one call at a time.
const AuctionDemo = (() => {
  const examples = () => (typeof PRACTICE !== 'undefined' && PRACTICE.auctionExamples) || [];
  const text = t => (t ? L(t.en || t.he, t.he || t.en) : '');
  const COLUMNS = [3, 0, 1, 2]; // the auction box lists West, North, East, South
  let ex = 0, step = 0;

  function mount(box) {
    if (!examples().length) { box.innerHTML = ''; return; }
    box.innerHTML = `<p><button class="btn" type="button">${L('Examples', 'דוגמאות')}</button></p>`;
    box.querySelector('button').addEventListener('click', () => { ex = 0; step = 0; render(box); });
  }

  // The final contract, e.g. "4♥ by South, doubled", or null when all four players passed.
  function contract(deal) {
    const calls = deal.auction;
    const seat = i => (deal.dealer + i) % 4;
    const last = calls.reduce((j, c, i) => (/^\d/.test(c) ? i : j), -1);
    if (last < 0) return null;
    const bid = calls[last];
    const side = seat(last) % 2;
    const declarer = seat(calls.findIndex((c, i) => /^\d/.test(c) && c[1] === bid[1] && seat(i) % 2 === side));
    const after = calls.slice(last + 1);
    const dbl = after.includes('XX') ? L(' redoubled', ', ברידאבל') : after.includes('X') ? L(' doubled', ', בדאבל') : '';
    return { bid, declarer, dbl };
  }

  function auctionBox(deal) {
    const first = COLUMNS.indexOf(deal.dealer);
    const cells = Array(first).fill('<td></td>');
    deal.auction.slice(0, step).forEach((c, i) => {
      cells.push(`<td class="${i === step - 1 ? 'latest' : ''}">${bidHtml(c)}</td>`);
    });
    if (step < deal.auction.length) cells.push('<td class="ask">?</td>');
    while (cells.length % 4) cells.push('<td></td>');
    const rows = [];
    for (let i = 0; i < cells.length; i += 4) rows.push(`<tr>${cells.slice(i, i + 4).join('')}</tr>`);
    return `
      <table class="bid-box">
        <tr>${COLUMNS.map(s => `<th class="${s === deal.dealer ? 'dealer' : ''}">${SEAT_NAMES[s]}</th>`).join('')}</tr>
        ${rows.join('')}
      </table>`;
  }

  function render(box) {
    const list = examples();
    const deal = list[ex];
    const done = step === deal.auction.length;
    const toBid = (deal.dealer + step) % 4;
    let result = '';
    if (done) {
      const c = contract(deal);
      const line = c
        ? L(`<strong>Final contract: ${bidHtml(c.bid)}${c.dbl} by ${SEAT_NAMES[c.declarer]}.</strong>`,
          `<strong>החוזה הסופי: ${bidHtml(c.bid)}${c.dbl}. הכרוז: ${SEAT_NAMES[c.declarer]}.</strong>`)
        : L('<strong>All four players passed: the cards are thrown in and dealt again.</strong>',
          '<strong>כל ארבעת השחקנים אמרו פאס: הקלפים נאספים ומחולקים מחדש.</strong>');
      result = `<div class="feedback good">${line}${deal.why ? `<div>${text(deal.why)}</div>` : ''}</div>`;
    }
    box.innerHTML = `
      <div class="auction-demo-head">
        <span class="practice-count">${L(`Example ${ex + 1} of ${list.length}`, `דוגמה ${ex + 1} מתוך ${list.length}`)}</span>
        ${deal.note ? `<span>${text(deal.note)}</span>` : ''}
      </div>
      <div class="table puzzle-table deal-table">
        ${[0, 3, 1, 2].map(s => `<div class="seat ${['north', 'east', 'south', 'west'][s]}${!done && s === toBid ? ' to-play' : ''}" data-seat="${s}"></div>`).join('')}
        <div class="deal-center">${auctionBox(deal)}</div>
      </div>
      <div class="drill-nav">
        <button class="btn secondary" type="button" data-act="back" ${step === 0 ? 'disabled' : ''}>${L('← Back', '→ אחורה')}</button>
        <button class="btn" type="button" data-act="next" ${done ? 'disabled' : ''}>${L('Next bid →', 'ההכרזה הבאה ←')}</button>
        <span class="drill-nav-gap"></span>
        <button class="btn secondary" type="button" data-act="prev-ex" ${ex === 0 ? 'disabled' : ''}>${L('← Previous example', '→ הדוגמה הקודמת')}</button>
        <button class="btn secondary" type="button" data-act="next-ex" ${ex === list.length - 1 ? 'disabled' : ''}>${L('Next example →', 'הדוגמה הבאה ←')}</button>
      </div>
      <div aria-live="polite">${result}</div>`;
    deal.hands.forEach((spec, s) => {
      const el = box.querySelector(`[data-seat="${s}"]`);
      el.innerHTML = `<div class="seat-label"><strong>${SEAT_NAMES[s]}</strong>${s === deal.dealer ? ` <span>${L('(dealer)', '(מחלק)')}</span>` : ''}</div>`;
      renderSuitRows(el, parseHand(spec));
    });
    const act = {
      back: () => { step--; },
      next: () => { step++; },
      'prev-ex': () => { ex--; step = 0; },
      'next-ex': () => { ex++; step = 0; },
    };
    box.querySelectorAll('[data-act]').forEach(btn => btn.addEventListener('click', () => {
      const which = btn.dataset.act;
      act[which]();
      render(box);
      const again = box.querySelector(`[data-act="${which}"]`);
      (again && !again.disabled ? again : box.querySelector('[data-act="next"]:not(:disabled)') || box.querySelector('[data-act="back"]')).focus({ preventScroll: true });
    }));
  }

  return { mount };
})();

const Learn = (() => {
  let index = Math.min(Math.max(Number(Saved.get('lesson')) || 0, 0), LESSONS.length - 1);

  function render() {
    Saved.set('lesson', index);
    // The lesson picker: the current lesson on a button that opens the list of all lessons.
    const menu = document.getElementById('lesson-menu');
    const name = (lesson, i) => `<bdi>${i + 1}.</bdi> ${lesson.title}`;
    menu.innerHTML = `
      <button class="menu-button" type="button" aria-haspopup="true" aria-expanded="false" aria-label="${L('Choose a lesson', 'בחירת שיעור')}">
        <span>${name(LESSONS[index], index)}</span> <span class="caret" aria-hidden="true">▾</span>
      </button>
      <div class="menu-list" hidden>
        ${LESSONS.map((lesson, i) => `<button type="button" data-lesson-index="${i}" class="${i === index ? 'active' : ''}">${name(lesson, i)}</button>`).join('')}
      </div>`;
    menu.querySelectorAll('[data-lesson-index]').forEach(btn => btn.addEventListener('click', () => go(Number(btn.dataset.lessonIndex))));

    const lesson = LESSONS[index];
    const tryLabels = L(
      { hcp: 'Practice counting points', opening: 'Practice opening bids', responding: 'Practice responding', rebid: "Practice opener's rebids", rrebid: "Practice responder's rebids", overcalls: 'Practice overcalls', conventions: 'Practice conventions', defense: 'Practice opening leads', declarer: 'Practice declarer play', advanced: 'Practice advanced techniques', play: 'Play a hand' },
      { hcp: 'תרגול ספירת נקודות', opening: 'תרגול הכרזות פתיחה', responding: 'תרגול תשובות', rebid: 'תרגול הכרזה חוזרת של הפותח', rrebid: 'תרגול הכרזה חוזרת של המשיב', overcalls: 'תרגול הכרזות התערבות', conventions: 'תרגול מוסכמות', defense: 'תרגול הובלות פתיחה', declarer: 'תרגול משחק הכרוז', advanced: 'תרגול טכניקות מתקדמות', play: 'שחקו יד' });
    document.getElementById('lesson-body').innerHTML = `
      <div class="eyebrow">${L(`Lesson ${index + 1} of ${LESSONS.length}`, `שיעור ${index + 1} מתוך ${LESSONS.length}`)}</div>
      <h2>${lesson.title}</h2>
      ${lesson.body}
      ${lesson.tryIt ? `<p><button class="btn" data-goto="${lesson.tryIt}" data-lesson="${index}">${tryLabels[lesson.tryIt]} ${L('→', '←')}</button></p>` : ''}
      <div class="lesson-nav">
        <button class="btn secondary" id="lesson-prev" ${index === 0 ? 'disabled' : ''}>${L('← Previous', '→ הקודם')}</button>
        <button class="btn" id="lesson-next" ${index === LESSONS.length - 1 ? 'disabled' : ''}>${L('Next →', 'הבא ←')}</button>
      </div>`;
    document.querySelectorAll('#lesson-body .ladder').forEach(ladder => {
      const caption = ladder.nextElementSibling;
      ladder.querySelectorAll('.step').forEach(step => {
        const show = () => {
          caption.innerHTML = STRAIN_NOTES[step.dataset.strain];
          ladder.querySelectorAll('.step').forEach(x => x.classList.toggle('active', x === step));
          ladder.classList.add('has-active');
        };
        step.addEventListener('mouseenter', show);
        step.addEventListener('focus', show);
      });
      const reset = () => {
        if (ladder.contains(document.activeElement)) return;
        caption.innerHTML = STRAIN_HINT;
        ladder.classList.remove('has-active');
        ladder.querySelectorAll('.step').forEach(x => x.classList.remove('active'));
      };
      ladder.addEventListener('mouseleave', reset);
      ladder.addEventListener('focusout', () => setTimeout(reset));
    });
    document.querySelectorAll('#lesson-body .deck-figure').forEach(fig => {
      for (const suit of SUITS) {
        const row = document.createElement('div');
        row.className = 'deck-row';
        row.innerHTML = `<span class="deck-suit">${SUIT_NAME[suit][0].toUpperCase() + SUIT_NAME[suit].slice(1)}</span>`;
        renderFan(row, RANKS.slice().reverse().map(rank => ({ suit, rank, value: RANKS.indexOf(rank) + 2 })));
        fig.appendChild(row);
      }
    });
    document.querySelectorAll('#lesson-body .trick-demo').forEach(TrickDemo.mount);
    document.querySelectorAll('#lesson-body .score-demo').forEach(ScoreDemo.mount);
    document.querySelectorAll('#lesson-body .shape-examples').forEach(ShapeExamples.mount);
    document.querySelectorAll('#lesson-body .roles-demo').forEach(RolesDemo.mount);
    document.querySelectorAll('#lesson-body .auction-picture').forEach(AuctionPicture.mount);
    document.querySelectorAll('#lesson-body .trick-picture').forEach(TrickPicture.mount);
    document.querySelectorAll('#lesson-body [data-opening]').forEach(b => b.addEventListener('click', () => OpeningExamples.show(b.dataset.opening, b.innerHTML)));
    document.querySelectorAll('#lesson-body [data-overcall]').forEach(b => b.addEventListener('click', () => OvercallExamples.show(b.dataset.overcall, b.innerHTML)));
    document.querySelectorAll('#lesson-body [data-finesse]').forEach(b => b.addEventListener('click', () => FinesseLayouts.show(b.dataset.finesse)));
    const auctionDemo = document.querySelector('#lesson-body .auction-demo');
    if (auctionDemo) AuctionDemo.mount(auctionDemo);
    const demo = document.querySelector('#lesson-body .deal-demo');
    if (demo) DealDemo.mount(demo);
    document.getElementById('lesson-prev').addEventListener('click', () => go(index - 1));
    document.getElementById('lesson-next').addEventListener('click', () => go(index + 1));
  }

  function go(i) {
    index = Math.max(0, Math.min(LESSONS.length - 1, i));
    render();
    document.getElementById('lesson-body').scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  // A practice tab that a lesson links to shows a bar for getting back to the lessons: the lesson
  // you came from (or, if you opened the tab some other way, the first lesson that links to it),
  // or the one before or after it.
  const cameFrom = {};

  function showReturnBar(tab, from) {
    hideReturnBar();
    if (from !== undefined) cameFrom[tab] = from;
    from = cameFrom[tab] ?? LESSONS.findIndex(lesson => lesson.tryIt === tab);
    const panel = document.getElementById('tab-' + tab);
    if (!panel || from < 0) return;
    const bar = document.createElement('div');
    bar.className = 'lesson-return';
    bar.innerHTML = `
      <span class="muted small">${L(`Lesson ${from + 1}: ${LESSONS[from].title}`, `שיעור ${from + 1}: ${LESSONS[from].title}`)}</span>
      <span class="lesson-return-buttons">
        <button class="btn secondary" type="button" data-to="${from - 1}" ${from === 0 ? 'disabled' : ''}>${L('← Previous lesson', '→ השיעור הקודם')}</button>
        <button class="btn" type="button" data-to="${from}">${L('Back to the lesson', 'חזרה לשיעור')}</button>
        <button class="btn secondary" type="button" data-to="${from + 1}" ${from === LESSONS.length - 1 ? 'disabled' : ''}>${L('Next lesson →', 'השיעור הבא ←')}</button>
      </span>`;
    bar.addEventListener('click', e => {
      const btn = e.target.closest('[data-to]');
      if (!btn) return;
      hideReturnBar();
      showTab('learn');
      go(Number(btn.dataset.to));
    });
    panel.prepend(bar);
  }

  function hideReturnBar() {
    document.querySelectorAll('.lesson-return').forEach(bar => bar.remove());
  }

  return { init: render, showReturnBar };
})();
