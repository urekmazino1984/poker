FELT Poker — V7 (mobile layout and betting fixes)

Based on V6. Contains the complete GitHub Pages project.

Changes:
- Move opponent and local seat information away from the pot/community cards and the player's private cards.
- Remove the extra TEXAS HOLD'EM labels while retaining the FELT header.
- Rebalance the mobile table/cards/actions vertically; maintain a 5dvh bottom safe buffer.
- Keep the betting slider visible in the action controls on mobile.
- Reset the suggested raise/bet at every new turn and betting round to approximately half the current pot, rounded to a big-blind increment and clamped to a legal minimum/maximum. User-changed amounts remain untouched during the same decision.
- Preserve PeerJS multiplayer, private cards, showdown, 5-second restart, tournament finish/new-game action and SVG card artwork.

Upload the FILES INSIDE this folder to the root of your existing GitHub 'poker' repository. Keep the cards folder. index.html uses ?v=7 for CSS and JavaScript cache-busting.

NOTE: Code syntax was checked; this environment did not permit launching the browser UI for visual regression testing on an actual phone. Please test on a connected phone at your usual viewport and report clipping if any.
