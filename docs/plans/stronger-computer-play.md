# Plan: a stronger computer player for Play a Hand

**Status:** proposed, not started (2026-10-16). Updated 2026-10-18 with the license check and the official WebAssembly build; the user wants to do this later.

## Goal

Make the computer's card play in **Play a Hand** (both the defenders when you declare, and the declarer when you defend) play like a strong human, without adding a server. The app must stay a static site on GitHub Pages.

## Where things stand

- Computer play in [`js/play.js`](../../js/play.js) is rule-based: opening leads from `openingLead` in [`js/defense.js`](../../js/defense.js); otherwise second hand low, third hand high, win cheaply, ruff when out of a suit; declarer draws trumps, cashes winners, then develops long suits.
- Declarer makes about 75% of its contracts with these rules. That's fine for practice, but the play is predictable and misses standard techniques (finesses, holding up, signals).
- [`js/advanced.js`](../../js/advanced.js) already contains a small double-dummy solver, used for the puzzles. It tries every possible play, so it only works for endings of up to about six cards per hand, not full 13-card deals.

## Options considered

| Engine | What it is | Fit |
|---|---|---|
| **DDS** (Bo Haglund's Double Dummy Solver) | Standard open-source solver, C++, Apache 2.0. Builds to WebAssembly exist. | **Chosen.** Runs in the browser; no server. |
| **BEN** (Bridge Engine, Lorand Dali) | Open-source neural-network bot that bids and plays. | Needs a Python/TensorFlow server. Revisit if the app ever gets a backend; check the license first. |
| WBridge5, Jack, GIB, Argine, Q-Plus | Strong commercial or closed-source robots. | Not usable: closed source, desktop-only, or only reachable over a network protocol a web page can't use. |
| saycbridge | Open-source SAYC bidding engine. | Bidding only, Python, largely inactive. |

### DDS: license and WebAssembly build (checked 2026-10-18)

- **License:** Apache 2.0 (https://github.com/dds-bridge/dds). Free to use in this public site, commercial use included; nothing to buy or request. Conditions:
  1. Ship a copy of the Apache 2.0 license with the DDS files (e.g. `js/dds/LICENSE`).
  2. Keep DDS's copyright notices, and its `NOTICE` file if there is one.
  3. Mark any DDS source files we modify. Calling DDS from the app isn't a modification.
  4. Optional: credit "Double-dummy analysis by DDS (Bo Haglund, Soren Hein), Apache 2.0" in the page footer or README.
  Our own code isn't affected; Apache 2.0 doesn't require releasing it.
- **WebAssembly:** the official repository now has a hermetic WASM build and a browser demo under `web/`, deployed at https://dds-bridge.github.io/dds/. Step 1 can probably start from that build instead of compiling DDS with Emscripten ourselves.

### Size and phones

- The whole app is about 350 KB today (about 95 KB compressed). DDS in WebAssembly is estimated at 0.3–1 MB (about 150–400 KB compressed), so it would be bigger than the rest of the app. That's why it must load lazily, only when something uses it; the browser then caches it.
- WebAssembly runs in every current phone browser (iOS Safari, Android Chrome). Phones are several times slower than a desktop: one full deal should be fast, but a sampled move (20–50 deals) may take a second or two on an older phone, so use fewer layouts there.
- DDS's default memory setting is sized for desktops; lower it for phones, or the browser may kill the tab.
- Run DDS in a Web Worker so the page doesn't freeze. Workers may be blocked when `index.html` is opened from disk (file://), so keep the rule-based player as the fallback.

These sizes and speeds are estimates; step 1 measures the real ones.

## Approach

Double-dummy play alone isn't a fair opponent, because it effectively sees every hand and never misguesses a finesse. Use the **sampling** method that strong programs such as GIB use. On each computer turn:

1. Generate many random layouts (around 20 to 50) of the cards the computer can't see. Each layout must fit everything known so far: cards played, voids shown by failing to follow suit, and the cards in its own hand and dummy.
2. Solve each layout with DDS, giving the number of tricks each legal card wins.
3. Play the card with the best average across the layouts.

Keep the current rule-based player as an **Easy** level, and add a **Strong** level that uses sampling.

## Steps

1. **Choose the DDS build.** Start from the official WASM build in the DDS repository (`web/`), on a separate branch. Measure its file size, load time, and solve time for a full deal on a desktop and on a phone. Add its LICENSE file to the project.
2. **Wrap it.** Add `js/dds.js` with a small function: given four hands, trump, leader and the current trick, return the tricks each legal card wins. Load the WebAssembly lazily, the first time Strong play is used, so the rest of the app doesn't get slower to load.
3. **Sampling.** Write a function that deals the unseen cards consistently with what's known (played cards, shown voids), then averages the DDS results across the layouts.
4. **Plug into Play a Hand.** Route the computer's card choice in `js/play.js` through the strong player when Strong is selected. Keep the existing rules as the fallback, in case the WebAssembly fails to load.
5. **UI.** Add an Easy / Strong switch next to Declare / Defend, in English and Hebrew. Show "thinking…" while the computer chooses.
6. **Hints.** Optionally use the strong player for the Hint button too.
7. **Test.** Play several hundred hands in both modes and compare how often declarer makes its contract under Easy and Strong. Check how long each move takes on a phone, and that the app works offline from `index.html` as before.
8. **Optional:** use DDS for full-deal puzzles in the Declarer Play tab (practice/declarer-play.txt), replacing the small solver's six-card limit (`MAX_ENDING` in tools/import_practice.py, and the solver in js/advanced.js).

## Risks and trade-offs

- **Download size:** roughly 1 MB more, loaded only when Strong play is used.
- **Speed:** each computer move takes a fraction of a second; slower phones may need fewer layouts.
- **Licensing:** confirm the DDS license allows bundling it in a public site (Apache 2.0 should).
- **Realism limits:** sampling doesn't use what the bidding showed (the app has no auction in Play a Hand), and doesn't signal or read signals.

## Open questions

- Should Strong be the default, or Easy?
- Should the hint use the strong player, which would make hints more accurate but slower?
- Should this go on a separate branch for trying out before merging into the live site?
