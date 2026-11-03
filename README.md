# FELT Poker — responsive multiplayer update

Upload **all files and the cards folder** to the root of your GitHub Pages `poker` repository. Existing files with matching paths will be replaced.

## Changes
- Dedicated mobile layout below 700 CSS pixels, desktop layout at 700 and above.
- Phone layout uses the visible viewport height, with no page scrolling; lobby appears as a modal.
- Compact green poker table, larger hole cards, colorful large actions, betting controls below actions.
- Host-authoritative 50-second action timer. Timeout checks when free, otherwise folds.
- Two humans, private hole cards, starting stacks 5000, blinds 10/20 doubling every 20 hands.

## Testing
Open the GitHub Pages URL on two devices, create a room on one and join on the other. On phone, test portrait and landscape; small phones may require further scaling refinement.
