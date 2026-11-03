FELT Poker — Table Seats + Ready-Up (V4)
========================================

Upload the *contents* of this folder to the root of your GitHub "poker"
repository. This includes index.html, CSS/JS files, and the cards folder.

Changes:
- Existing header retained.
- Player names, chips, current bet, and dealer badge are placed directly
  on the felt at calculated positions. Layout logic includes positions
  for up to four players, although live PeerJS sessions currently support two.
- Local player's private SVG cards are about 20% larger in the main mobile
  layout. Only your own hole cards and the shared board are revealed.
- A winning-hand label and winner/payout information appears in the middle
  of the table after the hand.
- Automatic next hand removed. A full-screen ready overlay appears on both
  devices when a hand finishes. Each player must press "Start next hand".
  The host tracks ready states and starts the next hand only when both agree.
- 50-second action timer, 5,000 starting chips and 10/20 initial blinds remain.
- Below 700px viewport width, the game uses the mobile fullscreen/no-scroll
  layout, with additional scaling for short screens.

Important: Four-player seat positioning is ready, but the networking/game
engine has NOT been converted to support four remote players. It is still
host + one connected player.

Note: A browser may cache CSS and JS after GitHub Pages deploy. Reload the
page fully on both devices before testing. Do not mix versions across devices.
