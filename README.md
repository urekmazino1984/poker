# FELT Poker V9 — Multi-seat tables + hand history

Static GitHub Pages app with PeerJS WebRTC networking. Upload **all files and the cards directory** to the root of your `poker` repository.

## New

- History dropdown opposite blinds, listing the last 10 completed hands. Displays 5 community card slots (unrevealed slots are `?`), plus the winner's two cards with a highlight and winner's name. Split pots show multiple winning pairs.
- Clicking Create table opens a setup menu: host name, 2–4 player count, customizable blind interval (1–200 hands), and starting chips (100–100,000). Initial blinds remain 10/20.
- Table creation generates a six-character code. It waits until *all* configured players are seated before starting automatically.
- Joining prompts for a player name (maximum 15 characters). Players get separate seats and private hole cards.
- Host sends each player a private seat-specific snapshot. Completed-hand history is synchronized to all devices.
- The V8 16/35/20/26/3dvh mobile layout and existing SVG deck are retained.

## Notes

- PeerJS's public signaling service requires an internet connection and cannot guarantee direct connectivity across all network configurations.
- Keep the host browser in the foreground. If a player disconnects, all players must reload and create a new room (rejoin/resume is not implemented).
- Only a simulation of the 4-device connection flow and a game-engine smoke test were run; a real four-phone session has not been verified.
- Previous table histories are in memory only and are cleared on refresh/new tournament.
