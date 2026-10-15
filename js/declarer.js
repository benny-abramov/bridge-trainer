// Basic declarer technique: developing suits, ruffing losers and finesses, as solver-checked puzzles.
// Uses the puzzle player and solver from js/advanced.js.

const DECLARER_TOPICS = {
  develop: {
    label: 'Developing suits',
    intro: `
      <p>Start every hand by counting your <strong>sure tricks</strong>: winners you can take right now without losing the lead. When there aren't enough, you have to <strong>develop</strong> more.</p>
      <ul>
        <li><strong>Promotion.</strong> With K-Q-J, give up one trick to the ace and the other two cards become winners.</li>
        <li><strong>Length.</strong> In a long suit, once the defenders run out of cards, your small cards win too. With A-K-x-x-x opposite x-x-x, and the missing cards split 3-2, two small cards become winners.</li>
      </ul>
      <p>Timing matters:</p>
      <ul>
        <li><strong>Develop your suit first</strong>, while you still hold stoppers in the defenders' suits. If you cash your stopper too early, the defenders can run their suit when they win the trick you have to give up.</li>
        <li><strong>Keep an entry to the long suit.</strong> Often the best way is to <em>duck</em> (give up) an early round, so the short hand still has a card left to lead to the long hand.</li>
      </ul>`,
    puzzles: [
      {
        title: 'Knock out the ace first',
        trump: null, leader: 2, target: 3,
        hands: ['D:KQJ H:2', 'S:5432', 'D:32 H:A C:A', 'D:A H:KQJ'],
        idea: 'West has the ♦A and a strong heart suit, and you have just one heart stopper. In what order should you play?',
        solution: `<p><strong>Lead a diamond now.</strong> West can win the ♦A and lead the ♥K, but your ♥A is still there to stop the suit. Then lead your other diamond to dummy's winners.</p>
          <p>If you cash the ♥A first, West's hearts become winners. When West wins the ♦A, they take two heart tricks. Develop your suit while you still have a stopper in theirs.</p>`,
      },
      {
        title: 'Duck to keep a link',
        trump: null, leader: 2, target: 4,
        hands: ['S:AK432', 'S:T9 D:KQJ', 'S:765 H:A D:2', 'S:QJ8 H:KQ'],
        idea: 'Dummy has five spades but no other way in. How do you set them up and still reach them?',
        solution: `<p><strong>Lead a spade and play low from dummy</strong>: you <em>duck</em> the first round. The defenders win it, but you still have two spades in hand.
          When you get the lead back with the ♥A, lead a spade to dummy's A-K. The defenders' spades are gone by then, so dummy's last small spade wins too.</p>
          <p>If you cash the ace and king first and then give up a spade, dummy's remaining winner is stranded: you have no spade left to reach it.</p>`,
      },
    ],
  },
  ruff: {
    label: 'Ruffing losers',
    intro: `
      <p>In a trump contract, count your <strong>losers</strong> from the hand with more trumps (usually yours). Then look for ways to get rid of them:</p>
      <ul>
        <li><strong>Ruff in the short hand.</strong> When dummy is short in a suit where you have losers, trump them in dummy. Each ruff with dummy's (shorter) trumps is an <em>extra</em> trick. Ruffing in your own long trump hand gains nothing, because those trumps were winners anyway.</li>
        <li><strong>Ruff before you draw trumps.</strong> If you draw trumps first, dummy's trumps go too, and you can no longer ruff.</li>
        <li><strong>Ruff high</strong> when a defender might overruff, and plan your <strong>entries</strong> so you can come back to your hand for each ruff.</li>
        <li>You can also <strong>discard</strong> losers on dummy's extra winners.</li>
      </ul>
      <p>Draw trumps once the ruffs are done, so the defenders can't ruff your winners.</p>`,
    puzzles: [
      {
        title: 'Ruff in the short hand',
        trump: 'S', leader: 2, target: 4,
        hands: ['S:54 D:A C:32', 'S:T D:KQJ C:K', 'S:AKQ H:32', 'S:J9 H:AKQ'],
        idea: 'You have two heart losers, and dummy (the hand with fewer trumps) has no hearts.',
        solution: `<p><strong>Lead a heart before drawing all the trumps.</strong> When you lead the second heart, ruff it in dummy. Even if the defenders win the first heart and lead a trump, dummy still has a trump left for the ruff.</p>
          <p>If you draw trumps first, dummy's two trumps fall under your ace-king-queen and both hearts are losers.</p>`,
      },
      {
        title: 'Two ruffs in dummy',
        trump: 'S', leader: 2, target: 6,
        hands: ['S:JT D:A C:432', 'S:9 D:QJ C:KQJ', 'S:AKQ H:32 C:A', 'S:54 H:AKQ D:K'],
        idea: 'You need every trick. Two heart losers, no hearts in dummy, and East has the ♠9.',
        solution: `<p>Lead a heart and <strong>ruff it in dummy with a high trump</strong> (the ♠10 or ♠J), so East's ♠9 can't overruff. Use your entries, the ♣A in hand and the ♦A in dummy, to go back and forth and ruff the second heart too.
          Then draw trumps with the ♠A-K-Q.</p>
          <p>Drawing trumps first takes away dummy's trumps, and both hearts lose. Ruffing with a low trump lets East overruff.</p>`,
      },
    ],
  },
  finesse: {
    label: 'Finesses',
    intro: `
      <p>A <strong>finesse</strong> tries to win a trick with a card that isn't the highest, by hoping a missing honor is in the right place. The golden rule is: <strong>lead from the opposite hand <em>toward</em> the card you hope will win.</strong> That way the defender with the missing honor has to play before you decide.</p>
      <table class="tbl">
        <tr><th>Kind</th><th>Holding (dummy / you)</th><th>How</th><th>Works when</th></tr>
        <tr><td>Simple finesse</td><td>A-Q / x-x</td><td>Lead toward A-Q and play the queen</td><td>The king is with the player on your left (before dummy)</td></tr>
        <tr><td>Leading toward an honor</td><td>x-x / K-x</td><td>Lead from dummy toward the king</td><td>The ace is with the player on your right</td></tr>
        <tr><td>Finesse against the queen</td><td>A-K-J / x-x-x</td><td>Lead toward dummy and play the jack</td><td>The queen is with the player before dummy</td></tr>
        <tr><td>Double finesse</td><td>A-Q-10 / x-x-x</td><td>Finesse the 10 first, then the queen</td><td>The king and jack are both with the player before dummy (or the jack alone is)</td></tr>
        <tr><td>Ruffing finesse</td><td>A-Q-J / void (with trumps)</td><td>Lead the queen; ruff if covered, otherwise throw a loser</td><td>The king is with the player after dummy</td></tr>
      </table>
      <p>A finesse is a roughly 50% chance in real play. In these puzzles you can see every card, so the job is to take the finesse the right way, and to keep the entries you need to repeat it.</p>`,
    puzzles: [
      {
        title: 'The simple finesse',
        trump: null, leader: 0, target: 3,
        hands: ['D:AQ C:2', 'D:8 C:KQ', 'C:A D:32', 'D:K5 H:9'],
        idea: 'West has the ♦K. Dummy is on lead with the ♦A-Q.',
        solution: `<p>Cross to your hand with the <strong>♣A</strong>, then lead a diamond <em>toward</em> dummy's A-Q. When West plays low, play the queen. It wins, because the king has to be played before the queen or not at all. The ace then captures West's king.</p>
          <p>Leading the queen (or the ace and then the queen) from dummy just lets West win the king.</p>`,
      },
      {
        title: 'Lead toward the king',
        trump: null, leader: 2, target: 2,
        hands: ['C:54 H:A', 'C:A8 H:K', 'C:K3 H:2', 'C:QJT'],
        idea: 'East has the ♣A. Your ♣K can win a trick, but only if East has to play before you.',
        solution: `<p>Cross to dummy with the <strong>♥A</strong>, then lead a club <em>toward</em> your king. If East plays low, the king wins. If East takes the ace, your king is a winner later.</p>
          <p>Leading clubs from your own hand lets East win the ace over your king, or play low and let West win the trick cheaply.</p>`,
      },
      {
        title: 'Finessing against the queen',
        trump: null, leader: 2, target: 3,
        hands: ['H:AKJ', 'H:T98', 'H:432', 'H:Q65'],
        idea: 'You\'re missing the ♥Q, and West holds it with two small cards, so the ace and king won\'t drop it.',
        solution: `<p>Lead toward dummy, and when West plays low, <strong>finesse the jack</strong>. It wins. Then the ace and king take the rest, and West's queen falls.</p>
          <p>If West plays the queen, cover it with the ace or king. Cashing the ace and king first leaves West's queen to win the third round.</p>`,
      },
      {
        title: 'The double finesse',
        trump: null, leader: 2, target: 4,
        hands: ['D:AQT C:2', 'D:98 C:KQ', 'D:43 C:A S:2', 'D:KJ5 H:9'],
        idea: 'You\'re missing the ♦K and ♦J, and West has both. You\'ll need to lead toward dummy twice.',
        solution: `<p>Lead a diamond and <strong>finesse the 10</strong> first: it wins. Return to hand with the <strong>♣A</strong> and lead another diamond, finessing the queen. Finally, the ace captures West's king.</p>
          <p>Use your one entry to hand wisely. If you lead the ♣2 to your ace too early, or finesse the queen first, West's jack or king takes a trick.</p>`,
      },
      {
        title: 'The ruffing finesse',
        trump: 'S', leader: 0, target: 3,
        hands: ['C:QJ D:A', 'C:K5 H:A', 'S:A H:2 D:2', 'C:43 H:K'],
        idea: 'East has the ♣K. You have no clubs in hand, but you do have a trump, and a heart loser.',
        solution: `<p>Lead the <strong>♣Q</strong> from dummy right away:</p>
          <ul><li>If East covers with the king, ruff it. Then cross to dummy's ♦A and cash the ♣J, throwing your heart loser.</li>
          <li>If East plays low, let the queen win and throw your heart loser on it.</li></ul>
          <p>If you cash the ♦A first, you lose your way back to dummy for the ♣J.</p>`,
      },
    ],
  },
};

const DeclarerPlay = makePuzzleSection('dp', DECLARER_TOPICS);
