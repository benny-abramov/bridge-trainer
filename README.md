# Bridge Trainer

A small, dependency-free web app for learning contract bridge.

Open `index.html` in a browser. There is no build step or server.

## Sections

- **Learn**: nine short lessons covering tricks, trumps, the auction, declarer and dummy, point counting, opening bids, responses and scoring.
- **Count Points**: count the high-card points in a random hand and see the breakdown.
- **Opening Bids**: choose an opening bid (simplified Standard American) and get an explanation.
- **Play a Hand**: declare a contract as South, playing dummy's cards as well, against simple computer defenders. It includes hints, replaying the same deal, and non-vulnerable scoring.

## Code layout

| File | Purpose |
| --- | --- |
| `js/cards.js` | Deck, dealing, HCP/shape evaluation, card rendering |
| `js/learn.js` | Lesson content and the lesson viewer |
| `js/trainers.js` | Point-count drill, opening-bid rules (`openingBid`) and drill |
| `js/play.js` | Contract selection, play rules, defender AI, scoring |
| `js/main.js` | Tab navigation (`#learn`, `#hcp`, `#opening`, `#play`) |
| `css/style.css` | Styles, with light and dark themes |
