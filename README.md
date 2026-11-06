FELT Poker — V8 Responsive Layout

Latest visual layout for phones narrower than 700 CSS px, AFTER the multiplayer room is connected:
- Header / blinds 16dvh
- Oval poker table and seat labels 35dvh
- Private cards 20dvh
- Actions including slider 26dvh
- Bottom buffer, matching the background 3dvh

All five bands fit exactly 100dvh; the final band is held outside the main grid.
Existing online PeerJS / poker logic / new hand delay and tournament end are unchanged.
The lobby continues using the normal connection layout until both devices connect.

Upload the CONTENTS of this folder (not the enclosing folder) into the repository root.
