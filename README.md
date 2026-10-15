# Bridge Trainer

A small, dependency-free web app for learning contract bridge.

Open `index.html` in a browser. There is no build step or server.

## Sections

- **Learn**: ten short lessons covering tricks, trumps, the auction, declarer and dummy, point counting, opening bids, responses, opener's rebids and scoring.
- **Count Points**: count the high-card points in a random hand and see the breakdown.
- **Opening Bids**: choose an opening bid (simplified Standard American) and get an explanation.
- **Responding**: partner opens one of a suit; choose your response with a 0–12 HCP hand and get an explanation.
- **Opener's Rebid**: you opened and partner responded; choose your second bid and get an explanation.
- **Play a Hand**: declare a contract as South, playing dummy's cards as well, against simple computer defenders. It includes hints, replaying the same deal, and non-vulnerable scoring.

## Code layout

| File | Purpose |
| --- | --- |
| `js/cards.js` | Deck, dealing, HCP/shape evaluation, card rendering |
| `js/learn.js` | Lesson content and the lesson viewer |
| `js/trainers.js` | Point-count drill, bidding rules (`openingBid`, `responseBid`, `rebidBid`), bidding drills |
| `js/play.js` | Contract selection, play rules, defender AI, scoring |
| `js/main.js` | Tab navigation (`#learn`, `#hcp`, `#opening`, `#responding`, `#rebid`, `#play`) |
| `css/style.css` | Styles, with light and dark themes |
