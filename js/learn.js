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
      <p>A standard 52-card deck is dealt out completely, so everyone holds <strong>13 cards</strong>.
      Press the button to watch a deal: the dealer gives out one card at a time, clockwise.</p>
      <div class="deal-demo"></div>
      <p>Each deal has two phases:</p>
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
      ${strainLadder()}
      <p>Every bid must be <strong>higher</strong> than the one before it — either a higher level, or the same level in a higher strain.
      After 1${H}, you could bid 1${S} or 1NT, but to show diamonds you'd need at least 2${D}.</p>
      <ul>
        <li>The auction ends when a bid is followed by <strong>three passes</strong>. The last bid becomes the <strong>contract</strong>.</li>
        <li>The <strong>declarer</strong> is whichever player of the winning side first named the contract's strain.</li>
        <li><strong>Double</strong> raises the stakes of the opponents' last bid; <strong>Redouble</strong> raises them again.</li>
      </ul>
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
        <tr><td>5–10 HCP with an 8-card suit</td><td>Preempt at the 4-level</td></tr>
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
        <tr><td>11+ HCP, a 4+ card lower-ranking suit (5+ for ${H})</td><td>New suit at the 2-level</td></tr>
        <tr><td>11–12 HCP, none of the above</td><td>2NT, inviting game</td></tr>
        <tr><td>13–15 HCP, none of the above</td><td>3NT, bidding game</td></tr>
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
    title: 'Declarer play',
    body: `
      <p>As declarer you play both your own hand and dummy. Before you play to the first trick, make a plan:</p>
      <ol>
        <li><strong>Count your sure tricks</strong>: winners you can take without giving up the lead.</li>
        <li><strong>Compare with the target</strong>: how many more tricks do you need?</li>
        <li><strong>Choose how to find them</strong>, using the techniques below.</li>
      </ol>
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
      <p>A finesse wins a trick with a card that isn't the highest. The rule is: <strong>lead from the opposite hand toward the card you hope will win</strong>.</p>
      <table class="tbl">
        <tr><th>Kind</th><th>Holding (dummy / you)</th><th>How</th></tr>
        <tr><td>Simple finesse</td><td>A-Q / x-x</td><td>Lead toward A-Q and play the queen</td></tr>
        <tr><td>Leading toward an honor</td><td>x-x / K-x</td><td>Lead from dummy toward the king</td></tr>
        <tr><td>Finesse against the queen</td><td>A-K-J / x-x-x</td><td>Lead toward dummy and play the jack</td></tr>
        <tr><td>Double finesse</td><td>A-Q-10 / x-x-x</td><td>Finesse the 10 first, then the queen</td></tr>
        <tr><td>Ruffing finesse</td><td>A-Q-J / void</td><td>Lead the queen; ruff if covered, otherwise throw a loser</td></tr>
      </table>
      <p>The Declarer Play tab has practice hands for each of these.</p>`,
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
      <p>The Advanced tab explains both in more detail, with puzzles against perfect defense.</p>`,
    tryIt: 'advanced',
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
      <p>חפיסה רגילה של 52 קלפים מחולקת כולה, כך שלכל שחקן יש <strong>13 קלפים</strong>. לחצו על הכפתור כדי לראות חלוקה: המחלק נותן קלף אחד בכל פעם, לפי כיוון השעון.</p>
      <div class="deal-demo"></div>
      <p>לכל חלוקה שני שלבים:</p>
      <ol>
        <li><strong>המכרז</strong>: שני הצדדים מכריזים כדי לקבוע כמה לקיחות זוג אחד מתחייב לקחת, ואיזו סדרה (אם בכלל) תהיה השליט.</li>
        <li><strong>המשחק</strong>: משחקים את 13 הלקיחות כדי לראות אם ההתחייבות מתקיימת.</li>
      </ol>
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
        <div class="trick-row">
          <span>מערב ${cardText(5, H)}</span><span>צפון ${cardText('Q', H)}</span><span class="win">מזרח ${cardText('K', H)} ✓</span><span>דרום ${cardText(2, C)}</span>
        </div>
        <p class="small">לדרום אין הארט, והוא משליך קלאב. המלך של מזרח הוא ההארט הגבוה ביותר, ולכן מזרח זוכה.</p>
      </div>`,
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
        <div class="trick-row">
          <span>צפון ${cardText('A', D)}</span><span class="win">מזרח ${cardText(3, S)} ✓</span><span>דרום ${cardText(4, D)}</span><span>מערב ${cardText(7, D)}</span>
        </div>
        <p class="small">למזרח אין דיאמונד, והוא חותך בשליט קטן שגובר על האס.</p>
      </div>`,
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
      <ul>
        <li>חוזה ששווה <strong>100 נקודות לקיחה ומעלה</strong> הוא <strong>משחק מלא</strong>: 3NT, ${B('4H')} או ${B('4S')}, ${B('5C')} או ${B('5D')}. הוא מזכה בבונוס של 300 (500 כשפגיעים).</li>
        <li>חוזים קטנים יותר הם <strong>חוזים חלקיים</strong> ומזכים בבונוס של 50.</li>
        <li><strong>סלאם קטן</strong> (רמת 6) מוסיף 500, ו<strong>סלאם גדול</strong> (רמת 7) מוסיף 1000 (יותר כשפגיעים).</li>
        <li><strong>לקיחות עודפות</strong> מקבלות את ערך הלקיחה.</li>
        <li>אם הכרוז לא מגיע ליעד, המגינים מקבלים <strong>50 על כל לקיחה חסרה</strong> (100 כשפגיעים).</li>
      </ul>
      <p>בלשונית "שחקו יד" כל יד מנוקדת כלא פגיעה.</p>`,
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
      4-3-3-3, 4-4-3-2 או 5-3-3-2. ידיים כאלה מתאימות למשחק ללא שליט.</p>`,
    tryIt: 'hcp',
  },
  {
    title: 'פתיחת המכרז',
    body: `
      <p>ההכרזה הראשונה היא <strong>הכרזת הפתיחה</strong>. האפליקציה מלמדת גרסה פשוטה של <em>השיטה האמריקאית הסטנדרטית</em>:</p>
      <table class="tbl">
        <tr><th>היד שלכם</th><th>פתיחה</th></tr>
        <tr><td>פחות מ-12 נק' (ואין סדרה ארוכה)</td><td>פאס</td></tr>
        <tr><td>12-21 נק' עם סדרת מייגור של 5 קלפים ומעלה</td><td>${B('1H')} או ${B('1S')} (סדרת המייגור הארוכה יותר; ספייד עם 5-5)</td></tr>
        <tr><td>12-21 נק', בלי סדרת מייגור של 5</td><td>${B('1C')} או ${B('1D')} (סדרת המיינור הארוכה יותר; ${B('1C')} עם 3-3, ${B('1D')} עם 4-4)</td></tr>
        <tr><td>15-17 נק', מאוזנת</td><td>1NT</td></tr>
        <tr><td>20-21 נק', מאוזנת</td><td>2NT</td></tr>
        <tr><td>22 נק' ומעלה, כל חלוקה</td><td>${B('2C')} (חזקה ומלאכותית)</td></tr>
        <tr><td>5-10 נק' עם סדרה של 6 קלפים ב-${D}, ${H} או ${S}</td><td>הכרזת שתיים חלשה: ${B('2D')}, ${B('2H')} או ${B('2S')}</td></tr>
        <tr><td>5-10 נק' עם סדרה של 7 קלפים</td><td>הכרזת חסימה ברמת 3</td></tr>
        <tr><td>5-10 נק' עם סדרה של 8 קלפים</td><td>הכרזת חסימה ברמת 4</td></tr>
      </table>
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
        <li><strong>6 נק' ומעלה:</strong> השיבו. השותף עדיין עשוי לעשות פאס, ולכן עם יותר כוח ממשיכים להכריז.</li>
      </ul>
      <p>עם 6 נק' ומעלה, בחרו את <strong>הראשונה</strong> מבין האפשרויות הבאות שמתאימה ליד:</p>
      <table class="tbl">
        <tr><th>היד שלכם</th><th>תשובה</th></tr>
        <tr><td>3 קלפים ומעלה בסדרת המייגור של השותף</td><td>תמיכה: ל-2 עם 6-10 נק', ל-3 (<em>תמיכה בקפיצה</em>) עם 11-12</td></tr>
        <tr><td>סדרה של 4 קלפים ומעלה שאפשר להכריז ברמת 1</td><td>הכריזו אותה (סדרות מייגור לפני דיאמונד; הארט קודם עם 4-4 בסדרות המייגור)</td></tr>
        <tr><td>תמיכה בסדרת המיינור של השותף (4 ומעלה ב-${D} או 5 ומעלה ב-${C})</td><td>תמיכה: ל-2 עם 6-10, ל-3 עם 11-12</td></tr>
        <tr><td>6-10 נק', אף אחד מאלה</td><td>1NT</td></tr>
        <tr><td>11 נק' ומעלה, סדרה נמוכה יותר של 4 קלפים ומעלה (5 ומעלה ב-${H})</td><td>סדרה חדשה ברמת 2</td></tr>
        <tr><td>11-12 נק', אף אחד מאלה</td><td>2NT, הזמנה למשחק מלא</td></tr>
        <tr><td>13-15 נק', אף אחד מאלה</td><td>3NT, הכרזת משחק מלא</td></tr>
      </table>
      <p>מטרת המכרז היא למצוא <strong>התאמה של 8 קלפים</strong> (או להתייצב בללא שליט) ואת הרמה הנכונה לכוח המשותף.
      עם 13 נק' ומעלה יש לכם מספיק למשחק מלא מול הכרזת פתיחה. ידיים כאלה משתמשות בהכרזות מתקדמות יותר, ולכן הן לא כלולות בתרגול.</p>`,
    tryIt: 'responding',
  },
  {
    title: 'ההכרזה השנייה של הפותח',
    body: `
      <p>הכרזת הפתיחה מכסה טווח רחב (12-21 נק'). ההכרזה השנייה, <strong>ההכרזה החוזרת</strong>, מספרת לשותף באיזה חלק של הטווח אתם נמצאים:</p>
      <table class="tbl">
        <tr><th>מינימום</th><th>בינוני</th><th>מקסימום</th></tr>
        <tr><td>12-14 נק'</td><td>15-17 נק'</td><td>18-21 נק'</td></tr>
      </table>
      <p><strong>כשהשותף תומך בסדרה שלכם</strong>, כבר יש התאמה. נשאר להחליט רק על הרמה:</p>
      <table class="tbl">
        <tr><th>ההכרזה של השותף</th><th>מינימום</th><th>בינוני</th><th>מקסימום</th></tr>
        <tr><td>תמיכה פשוטה (6-10)</td><td>פאס</td><td>תמיכה נוספת כהזמנה</td><td>משחק מלא</td></tr>
        <tr><td>תמיכה בקפיצה (11-12)</td><td>פאס</td><td>משחק מלא</td><td>משחק מלא</td></tr>
      </table>
      <p>משחק מלא בסדרת מייגור הוא ${B('4H')} או ${B('4S')}. עם התאמה בסדרת מיינור, 3NT בדרך כלל קל יותר מ-${B('5C')} או ${B('5D')}.</p>
      <p><strong>כשהשותף מכריז סדרה חדשה ברמת 1</strong>, חובה להכריז שוב. בחרו את הראשונה שמתאימה:</p>
      <ol>
        <li>תמיכה של 4 קלפים בסדרת המייגור של השותף: תמיכה ברמת 2 (מינימום), 3 (בינוני) או 4 (מקסימום).</li>
        <li>סדרת מייגור של 4 קלפים שעדיין אפשר להכריז ברמת 1: הכריזו אותה. למשל ${B('1D')} – ${B('1H')} – <strong>${B('1S')}</strong>.</li>
        <li>מאוזנת: 1NT עם 12-14, קפיצה ל-2NT עם 18-19.</li>
        <li>אחרת, השתמשו בכללים לידיים לא מאוזנות שלמטה.</li>
      </ol>
      <p><strong>כשהשותף משיב 1NT</strong> (6-10, בלי התאמה): עם מינימום מאוזן, פאס. עם 18-19 מאוזן, הכריזו 2NT. אחרת, השתמשו בכללים לידיים לא מאוזנות.</p>
      <p><strong>ידיים לא מאוזנות:</strong></p>
      <ul>
        <li>עם <strong>סדרה של 6 קלפים</strong>, הכריזו אותה שוב: ברמת 2 עם מינימום, או בקפיצה לרמת 3 עם 15 ומעלה.</li>
        <li>עם <strong>סדרה שנייה נמוכה יותר</strong> (4 קלפים ומעלה), הכריזו אותה ברמת 2. עם 18 ומעלה, קפצו בה: <em>קפיצה בסדרה חדשה</em> (ג'אמפ שיפט), שמחייבת עד משחק מלא.</li>
        <li>הכרזה של <strong>סדרה שנייה גבוהה יותר</strong> ברמת 2, כמו ${B('1D')} – ${B('1S')} – ${B('2H')}, נקראת <em>ריברס</em>. היא דורשת 16 נק' ומעלה.</li>
        <li>אם אף אחד מאלה לא מתאים, הכריזו שוב את הסדרה שלכם ברמת 2.</li>
      </ul>
      <p>התרגול מכסה ארבע תשובות: תמיכה פשוטה, תמיכה בקפיצה, סדרה חדשה ברמת 1 ו-1NT.</p>`,
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
      <p><strong>כשהשותף מזמין למשחק מלא</strong> (למשל ${B('1H')} – ${B('2H')} – ${B('3H')}, או ${B('1S')} – 1NT – 2NT):</p>
      <ul>
        <li>קבלו את ההזמנה עם ראש הטווח שלכם (9-10 אחרי תשובה של 6-10) בהכרזת משחק מלא.</li>
        <li>דחו אותה עם תחתית הטווח (6-8) בפאס.</li>
      </ul>
      <p><strong>כשהשותף מראה מינימום</strong> (הכרזה חוזרת של 1NT, תמיכה פשוטה, או חזרה על הסדרה שלו ברמת 2):</p>
      <ul>
        <li>עם 6-10, פאס, או עצירה ברמת 2 בסדרה של 6 קלפים משלכם.</li>
        <li>עם 11-12, הזמינו: תמיכה ברמת 3 עם התאמה, או 2NT.</li>
      </ul>
      <p><strong>כשהשותף מראה סדרה שנייה:</strong></p>
      <ul>
        <li>עם 4 קלפים בסדרת מייגור שהשותף הראה זה עתה, תמכו בה: ברמת 2 עם מינימום, ברמת 3 כהזמנה.</li>
        <li>אחרת, תנו <strong>העדפה</strong>. עם יותר קלפים בסדרה השנייה, עשו פאס. עם אורך שווה או יותר בסדרה הראשונה, חזרו אליה ברמה הזולה ביותר: ${B('1D')} – ${B('1S')} – ${B('2C')} – <strong>${B('2D')}</strong>.</li>
        <li>העדפה לא מראה כוח נוסף. עם 11-12, תמכו או הכריזו 2NT כדי להזמין.</li>
      </ul>
      <p><strong>כשהשותף מראה יד גדולה</strong> (הכרזה חוזרת של 2NT עם 18-19, או קפיצה בסדרה חדשה עם 18 ומעלה), הכריזו משחק מלא: 3NT, או 4 בסדרת מייגור כשיש התאמה.
      <strong>ריברס</strong> (16 ומעלה) מחייב לסיבוב אחד: עם מינימום, חזרו על סדרה של 5 קלפים או תנו העדפה.</p>
      <p>התרגול משתמש בידיים של 6-12 נק'. ידיים של 13 ומעלה דורשות כלי הכרזה נוספים, ולכן הן לא כלולות.</p>`,
    tryIt: 'rrebid',
  },
  {
    title: 'הכרזות התערבות וכפל הוצאה',
    body: `
      <p>כשיריב פותח, הצד שלכם עדיין יכול להתחרות. הכרזה אחרי שהיריבים פתחו נקראת <strong>הכרזת התערבות</strong>.
      היא יכולה לזכות בחוזה, לדחוף את היריבים גבוה מדי, או לומר לשותף באיזו סדרה להוביל.</p>
      <p>כשהיריב מימינכם פותח באחת בסדרה, בחרו את הראשונה שמתאימה:</p>
      <table class="tbl">
        <tr><th>היד שלכם</th><th>פעולה</th></tr>
        <tr><td>15-18 נק', מאוזנת, עם עוצר בסדרה שלהם</td><td>1NT</td></tr>
        <tr><td>17 נק' ומעלה, חזקה מדי להתערבות</td><td>דאבל, ואחר כך הכריזו את הסדרה שלכם או ללא שליט</td></tr>
        <tr><td>6-10 נק' וסדרה של 6 קלפים</td><td><strong>קפיצת התערבות חלשה</strong>: רמה אחת מעל הנדרש (${B('1H')} – ${B('2S')}, ${B('1S')} – ${B('3C')})</td></tr>
        <tr><td>8-16 נק' וסדרה טובה של 5 קלפים ומעלה שאפשר להכריז ברמת 1</td><td>התערבות ברמת 1</td></tr>
        <tr><td>11-16 נק' וסדרה טובה של 5 קלפים ומעלה ברמת 2</td><td>התערבות ברמת 2</td></tr>
        <tr><td>12 נק' ומעלה, קצר בסדרה שלהם, 3 קלפים ומעלה בכל סדרה אחרת</td><td><strong>כפל הוצאה</strong></td></tr>
        <tr><td>כל דבר אחר</td><td>פאס</td></tr>
      </table>
      <ul>
        <li><strong>סדרה טובה</strong> כוללת לפחות שניים מהקלפים הגבוהים (A, K, Q, J, 10). עם פחות מ-12 נק', התערבו רק עם סדרה טובה, כי בדרך כלל השותף יוביל אותה.</li>
        <li><strong>עוצר</strong> הוא החזקה שתזכה בלקיחה בסדרה שלהם: A, K-x, Q-x-x או J-x-x-x.</li>
        <li><strong>כפל הוצאה</strong> לא אומר "אני חושב שהם ייפלו". הוא מבקש מהשותף לבחור סדרת שליט, ולכן השותף חייב להכריז גם עם יד חלשה.</li>
      </ul>
      <p><strong>כשהשותף מתערב</strong>, תמכו בסדרה שלו עם 3 קלפים ומעלה, בדיוק כמו אחרי הכרזת פתיחה.</p>`,
    tryIt: 'overcalls',
  },
  {
    title: 'מוסכמות (SAYC)',
    body: `
      <p><strong>מוסכמה</strong> היא הכרזה עם משמעות מוסכמת ששונה מהמשמעות הטבעית שלה. למשל, ${B('2C')} מעל 1NT של השותף לא אומרת דבר על קלאב.
      שני השותפים חייבים להכיר את המוסכמה. בתחרויות מודיעים ליריבים על הכרזות מוסכמות (<em>התראה</em>).
      אלה המוסכמות הנפוצות ביותר בשיטת <strong>Standard American Yellow Card (SAYC)</strong>.</p>

      <h3>מעל 1NT של השותף</h3>
      <ul>
        <li><strong>סטיימן (${B('2C')})</strong>: עם 8 נק' ומעלה וסדרת מייגור של 4 קלפים, שאלו את השותף אם יש לו סדרת מייגור של 4. השותף מכריז ${B('2H')} או ${B('2S')} עם סדרה כזו, או ${B('2D')} בלי.</li>
        <li><strong>טרנספר ג'ייקובי (${B('2D')}, ${B('2H')})</strong>: עם 5 קלפים ומעלה בסדרת מייגור, הכריזו את הסדרה שמתחתיה. השותף חייב להכריז את הסדרה שלכם. משתמשים בו עם כל כוח.</li>
      </ul>

      <h3>${B('2C')} חזקה</h3>
      <p>${B('2C')} מראה 22 נק' ומעלה (או יד עם תשע לקיחות) ומחייבת. המשיב מכריז <strong>${B('2D')}</strong> (מלאכותית, "המתנה") עם רוב הידיים.
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
        <li><strong>קיו-ביד מייקלס</strong>: הכרזת הסדרה של היריב (${B('1C')} – ${B('2C')}) מראה יד דו-סדרתית 5-5. מעל סדרת מיינור היא מראה את שתי סדרות המייגור. מעל סדרת מייגור היא מראה את סדרת המייגור האחרת וסדרת מיינור.</li>
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
      <p><strong>נגד ללא שליט</strong>, פתחו את הסדרה הארוכה שלכם:</p>
      <ul>
        <li>עם שלושה הונורים צמודים (K-Q-J, Q-J-10), הובילו את העליון.</li>
        <li>אחרת הובילו את הקלף <strong>הרביעי מלמעלה</strong> בסדרה הארוכה והחזקה ביותר שלכם: מתוך K-J-7-<strong>4</strong>-2, הובילו את ה-4.</li>
      </ul>
      <p><strong>נגד חוזה בשליט</strong>, קחו את הלקיחות שלכם מהר וחפשו חיתוכים. לפי סדר עדיפות:</p>
      <table class="tbl">
        <tr><th>החזקה</th><th>הובלה</th></tr>
        <tr><td>A-K-x</td><td>ה-<strong>A</strong></td></tr>
        <tr><td>הונורים צמודים: K-Q-x, Q-J-x, J-10-x</td><td>העליון</td></tr>
        <tr><td>סינגלטון קטן (עם שליטים לחיתוך)</td><td>הסינגלטון</td></tr>
        <tr><td>דאבלטון קטן: 7-3</td><td>העליון: <strong>7</strong></td></tr>
        <tr><td>הונור ו-3 קלפים ומעלה: K-9-6-3</td><td>הרביעי מלמעלה: <strong>3</strong> (הנמוך מתוך K-9-3)</td></tr>
        <tr><td>שלושה קלפים קטנים: 8-6-2</td><td>העליון, "עליון מכלום": <strong>8</strong></td></tr>
        <tr><td>ארבעה קלפים קטנים ומעלה: 9-7-5-2</td><td>השני מלמעלה: <strong>7</strong></td></tr>
      </table>
      <p><strong>הימנעו</strong> מהובלה נמוכה מסדרה שבראשה אס נגד חוזה בשליט: הכרוז עשוי לזכות במלך בזול ואחר כך לחתוך את האס שלכם. הימנעו גם מהובלה מדאבלטון עם הונור, כמו K-x.
      כשכל הובלה נראית מסוכנת, שליט קטן הוא לעיתים קרובות הובלה בטוחה.</p>
      <h3>במהלך המשחק</h3>
      <ul>
        <li><strong>יד שנייה נמוך:</strong> כשהכרוז מוביל לעבר הונור, שחקו נמוך ושמרו את הקלפים הגבוהים כדי לתפוס את שלו.</li>
        <li><strong>יד שלישית גבוה:</strong> כשהשותף מוביל, שחקו את הקלף הגבוה שלכם (או הזול מבין קלפים צמודים) כדי לזכות בלקיחה או להוציא את הקלף של הכרוז.</li>
        <li><strong>כסו הונור בהונור:</strong> אם הכרוז מוביל מלכה, כסו אותה במלך. ייתכן שהוא יצטרך להוציא את האס כדי לזכות, וזה עשוי לקדם קלף נמוך יותר שלכם או של השותף.</li>
        <li><strong>החזירו את הסדרה של השותף</strong> כשאתם זוכים בלקיחה, אלא אם יש לכם משהו טוב יותר בבירור.</li>
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
      <p>עקיפה זוכה בלקיחה עם קלף שאינו הגבוה ביותר. הכלל: <strong>הובילו מהיד שממול לעבר הקלף שאתם מקווים שיזכה</strong>.</p>
      <table class="tbl">
        <tr><th>סוג</th><th>החזקה (דומם / אתם)</th><th>איך</th></tr>
        <tr><td>עקיפה פשוטה</td><td>A-Q / x-x</td><td>הובילו לעבר A-Q ושחקו את המלכה</td></tr>
        <tr><td>הובלה לעבר הונור</td><td>x-x / K-x</td><td>הובילו מהדומם לעבר המלך</td></tr>
        <tr><td>עקיפה נגד המלכה</td><td>A-K-J / x-x-x</td><td>הובילו לעבר הדומם ושחקו את הנסיך</td></tr>
        <tr><td>עקיפה כפולה</td><td>A-Q-10 / x-x-x</td><td>עקפו קודם עם ה-10, אחר כך עם המלכה</td></tr>
        <tr><td>עקיפת חיתוך</td><td>A-Q-J / חוסר</td><td>הובילו את המלכה; חתכו אם מכסים אותה, אחרת השליכו מפסיד</td></tr>
      </table>
      <p>בלשונית "משחק הכרוז" יש ידיים לתרגול של כל אחד מאלה.</p>`,
    tryIt: 'declarer',
  },
  {
    title: 'טכניקות מתקדמות',
    body: `
      <p>כשהיסודות כבר נוחים, שתי טכניקות זוכות בלקיחות שנראות בלתי אפשריות.</p>
      <h3>לחצים</h3>
      <p>ממשו זוכים עד שמגן ששומר על שתי סדרות נאלץ להשליך את אחת השמירות. לחץ צריך שני איומים, מגן אחד ששומר על שניהם, ספירה נכונה (אפשר לזכות בכל הלקיחות שנשארו פרט לאחת) וכניסות.</p>
      <h3>משחקי סיום</h3>
      <p>נקו את הסדרות הצדדיות, ואז הכניסו מגן ללקיחה שהוא חייב לזכות בה. אז הוא חייב להוביל לתוך המזלג שלכם (כמו A-Q), או לתת לכם חיתוך והשלכה.</p>
      <p>בלשונית "טכניקות מתקדמות" יש הסבר מפורט על שתיהן, עם חידות מול הגנה מושלמת.</p>`,
    tryIt: 'advanced',
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
  let index = 0;

  function render() {
    const list = document.getElementById('lesson-list');
    list.innerHTML = '';
    LESSONS.forEach((lesson, i) => {
      const btn = document.createElement('button');
      btn.innerHTML = `<bdi>${i + 1}.</bdi> ${lesson.title}`;
      btn.className = i === index ? 'active' : '';
      btn.addEventListener('click', () => { index = i; render(); });
      list.appendChild(btn);
    });

    const lesson = LESSONS[index];
    const tryLabels = L(
      { hcp: 'Practice counting points', opening: 'Practice opening bids', responding: 'Practice responding', rebid: "Practice opener's rebids", rrebid: "Practice responder's rebids", overcalls: 'Practice overcalls', conventions: 'Practice conventions', defense: 'Practice opening leads', declarer: 'Practice declarer play', advanced: 'Practice advanced techniques', play: 'Play a hand' },
      { hcp: 'תרגול ספירת נקודות', opening: 'תרגול הכרזות פתיחה', responding: 'תרגול תשובות', rebid: 'תרגול הכרזה חוזרת של הפותח', rrebid: 'תרגול הכרזה חוזרת של המשיב', overcalls: 'תרגול הכרזות התערבות', conventions: 'תרגול מוסכמות', defense: 'תרגול הובלות פתיחה', declarer: 'תרגול משחק הכרוז', advanced: 'תרגול טכניקות מתקדמות', play: 'שחקו יד' });
    document.getElementById('lesson-body').innerHTML = `
      <div class="eyebrow">${L(`Lesson ${index + 1} of ${LESSONS.length}`, `שיעור ${index + 1} מתוך ${LESSONS.length}`)}</div>
      <h2>${lesson.title}</h2>
      ${lesson.body}
      ${lesson.tryIt ? `<p><button class="btn secondary" data-goto="${lesson.tryIt}">${tryLabels[lesson.tryIt]} ${L('→', '←')}</button></p>` : ''}
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

  return { init: render };
})();
