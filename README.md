FELT Poker — V6 gameplay + mobile sizing update

What changed
- Table community cards are approximately 20% larger (phone and desktop), constrained to fit narrow screens.
- Table area is biased upward to free space near the bottom.
- A fixed 5dvh bottom buffer separates the betting interface from the bottom edge (with mobile safe-area padding).
- Removed the two-player Ready / Start Next Hand confirmation. A normal completed hand advances automatically after 5 seconds.
- End-of-tournament detection: when only one player has chips after payouts, the game stops and shows the champion and Start new game button. Selecting it resets everyone to 5,000 chips, blinds to 10/20, and hand counter to 1.
- At showdown, all non-folded players' cards become visible, with a flip reveal. Folded hands remain private.
- End-of-hand result panel displays a list of players, their best hand when shown down, won chips, and highlighted winners. Folded players are listed without revealing their cards.
- Winner banner remains on the table during the 5-second countdown.
- Maintains PeerJS two-device multiplayer, SVG deck, 50-second turn clock, and blind increase every 20 hands.
- JS and CSS URLs are versioned (?v=6) to reduce stale-asset caching.

Deployment
Upload the contents of this folder (not the enclosing folder itself) to the root of your GitHub poker repository and commit. GitHub Pages will deploy the new version. Use a hard refresh if an older version is cached.

Note: Browser-level mobile rendering and a live two-phone PeerJS session were not verified in this environment. JavaScript syntax and simulated game-state transitions were tested.
