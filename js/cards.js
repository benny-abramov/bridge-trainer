// Card primitives, hand evaluation and rendering helpers shared by every module.

const SUITS = ['S', 'H', 'D', 'C']; // bridge ranking, high to low
const DISPLAY_ORDER = ['S', 'H', 'C', 'D']; // alternate colors when showing a hand
const SUIT_SYMBOL = { S: '♠︎', H: '♥︎', D: '♦︎', C: '♣︎' };
const SUIT_NAME = L(
  { S: 'spades', H: 'hearts', D: 'diamonds', C: 'clubs', N: 'no-trump' },
  { S: 'ספייד', H: 'הארט', D: 'דיאמונד', C: 'קלאב', N: 'ללא שליט' });
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
const HCP_VALUES = { A: 4, K: 3, Q: 2, J: 1 };
const SEAT_NAMES = L(['North', 'East', 'South', 'West'], ['צפון', 'מזרח', 'דרום', 'מערב']);

function makeDeck() {
  const deck = [];
  for (const suit of SUITS) RANKS.forEach((rank, i) => deck.push({ suit, rank, value: i + 2 }));
  return deck;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function sortHand(hand) {
  return hand.sort((a, b) =>
    DISPLAY_ORDER.indexOf(a.suit) - DISPLAY_ORDER.indexOf(b.suit) || b.value - a.value);
}

// In a trump contract the trumps go on the left and the other suits keep alternating colors.
const TRUMP_ORDER = { S: ['S', 'H', 'C', 'D'], H: ['H', 'S', 'D', 'C'], D: ['D', 'S', 'H', 'C'], C: ['C', 'H', 'S', 'D'] };

// A sorted copy of the hand for showing it with `trump` (null or 'N' for no-trump) as trumps.
function sortForTrump(hand, trump) {
  const order = TRUMP_ORDER[trump] || DISPLAY_ORDER;
  return hand.slice().sort((a, b) => order.indexOf(a.suit) - order.indexOf(b.suit) || b.value - a.value);
}

// Returns four sorted 13-card hands indexed by seat: 0 North, 1 East, 2 South, 3 West.
function dealHands() {
  const deck = shuffle(makeDeck());
  return [0, 1, 2, 3].map(i => sortHand(deck.slice(i * 13, i * 13 + 13)));
}

// 'S:AKJ52 H:K74 D:Q3 C:J82' -> sorted cards (10 is written T).
function parseHand(spec) {
  const cards = [];
  for (const part of spec.split(' ')) {
    const [suit, ranks] = part.split(':');
    for (const rank of ranks) cards.push({ suit, rank, value: RANKS.indexOf(rank) + 2 });
  }
  return sortHand(cards);
}

function hcp(hand) {
  return hand.reduce((sum, c) => sum + (HCP_VALUES[c.rank] || 0), 0);
}

function suitLengths(hand) {
  const len = { S: 0, H: 0, D: 0, C: 0 };
  hand.forEach(c => len[c.suit]++);
  return len;
}

// Balanced = no void, no singleton, at most one doubleton (4-3-3-3, 4-4-3-2, 5-3-3-2).
function isBalanced(hand) {
  const lens = Object.values(suitLengths(hand));
  return lens.every(n => n >= 2) && lens.filter(n => n === 2).length <= 1;
}

function rankLabel(rank) {
  return rank === 'T' ? '10' : rank;
}

function isRed(suit) {
  return suit === 'H' || suit === 'D';
}

function suitHtml(suit) {
  if (suit === 'N') return 'NT';
  return `<span class="suit s-${suit}${isRed(suit) ? ' red' : ''}">${SUIT_SYMBOL[suit]}</span>`;
}

// Bids and cards keep their left-to-right form ("1♥", "K♠") inside right-to-left text.
const ltr = html => `<bdi dir="ltr">${html}</bdi>`;

// Bids are strings like 'P', '1C', '3N'.
function bidHtml(bid) {
  if (bid === 'P') return L('Pass', 'פאס');
  if (bid === 'X') return L('Dbl', 'דאבל');
  if (bid === 'XX') return L('Rdbl', 'רידאבל');
  return ltr(bid[0] + suitHtml(bid[1]));
}

function cardHtml(card) {
  return ltr(rankLabel(card.rank) + suitHtml(card.suit));
}

// "spades are trumps" / "no-trump" for a contract strain ('S', 'H', 'D', 'C', or 'N' / null).
function trumpText(strain) {
  if (!strain || strain === 'N') return L('no-trump', 'ללא שליט');
  return L(`${SUIT_NAME[strain]} are trumps`, `השליט: ${SUIT_NAME[strain]}`);
}

// Colors suit symbols typed directly into text, and keeps holdings like "♦A-Q" or "♠10" left-to-right.
function colorSuits(html) {
  const map = { '♠': 'S', '♥': 'H', '♦': 'D', '♣': 'C' };
  return html.replace(/([♠♥♦♣])((?:10|[2-9AKQJx])(?:-(?:10|[2-9AKQJx]))*)?/g,
    (m, sym, ranks) => (ranks ? ltr(suitHtml(map[sym]) + ranks) : suitHtml(map[sym])));
}

function createCardEl(card, { faceDown = false, gap = false } = {}) {
  const el = document.createElement('div');
  el.className = 'card' + (gap ? ' gap' : '');
  if (faceDown) {
    el.classList.add('back');
    el.setAttribute('aria-label', L('face-down card', 'קלף הפוך'));
    return el;
  }
  el.classList.add('s-' + card.suit); // four-color suits: see style.css
  if (isRed(card.suit)) el.classList.add('red');
  el.innerHTML =
    `<span class="corner"><span class="r">${rankLabel(card.rank)}</span>` +
    `<span class="s">${SUIT_SYMBOL[card.suit]}</span></span>` +
    `<span class="pip">${SUIT_SYMBOL[card.suit]}</span>`;
  el.setAttribute('aria-label', L(`${rankLabel(card.rank)} of ${SUIT_NAME[card.suit]}`, `${rankLabel(card.rank)} ${SUIT_NAME[card.suit]}`));
  return el;
}

// Renders a hand as an overlapping fan; `decorate(el, card)` can add classes or handlers.
function renderFan(container, hand, decorate) {
  const fan = document.createElement('div');
  fan.className = 'fan';
  hand.forEach((card, i) => {
    const el = createCardEl(card, { gap: i > 0 && hand[i - 1].suit !== card.suit });
    if (decorate) decorate(el, card);
    fan.appendChild(el);
  });
  container.appendChild(fan);
  return fan;
}

// Same as renderFan, but one row per suit so the hand fits in a narrow column.
function renderSuitRows(container, hand, decorate) {
  const rows = document.createElement('div');
  rows.className = 'suit-rows';
  for (const suit of new Set(hand.map(c => c.suit))) { // in the order the hand is sorted
    renderFan(rows, hand.filter(c => c.suit === suit), decorate);
  }
  container.appendChild(rows);
  return rows;
}
