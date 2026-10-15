# Bridge Trainer

A small, dependency-free web app for learning contract bridge.

Open `index.html` in a browser. There is no build step or server.

## Sections

- **Learn**: twelve short lessons covering tricks, trumps, the auction, declarer and dummy, point counting, opening bids, responses, opener's and responder's rebids, defense and scoring.
- **Count Points**: count the high-card points in a random hand and see the breakdown.
- **Opening Bids**: choose an opening bid (simplified Standard American) and get an explanation.
- **Responding**: partner opens one of a suit; choose your response with a 0–12 HCP hand and get an explanation.
- **Opener's Rebid**: you opened and partner responded; choose your second bid and get an explanation.
- **Responder's Rebid**: partner opened, you responded and partner rebid; choose your second bid and get an explanation.
- **Defense**: an opening-lead drill (pick the textbook lead against a suit or no-trump contract), and a link to defend a full hand.
- **Play a Hand**: either declare as South (playing dummy's cards too) against computer defenders, or defend as West with a computer partner against a computer declarer. It includes hints, replaying the same deal, and non-vulnerable scoring.

## Code layout

| File | Purpose |
| --- | --- |
| `js/cards.js` | Deck, dealing, HCP/shape evaluation, card rendering |
| `js/learn.js` | Lesson content and the lesson viewer |
| `js/trainers.js` | Point-count drill, bidding rules (`openingBid`, `responseBid`, `rebidBid`, `responderRebid`), bidding drills |
| `js/defense.js` | Opening-lead rules (`openingLead`) and the opening-lead drill |
| `js/play.js` | Contract selection, play rules, declare/defend modes, computer play, scoring |
| `js/main.js` | Tab navigation (`#learn`, `#hcp`, `#opening`, `#responding`, `#rebid`, `#rrebid`, `#defense`, `#play`) |
| `css/style.css` | Styles, with light and dark themes |
