# FELT — two-device Texas Hold’em test

Upload the **contents** of this folder to the root of your GitHub `poker` repository. Enable GitHub Pages in **Settings → Pages → Deploy from a branch → main / (root)**. Open the resulting HTTPS URL on both devices.

1. On laptop click **Create table**, note the six-character code.
2. On phone open the same URL, enter the code, click **Join table**.
3. Laptop plays seat 1, phone plays seat 2. All hole cards are visible for testing.
4. Both devices need internet to load PeerJS and reach its public signaling service.

The laptop is authoritative: it deals, validates actions, and calculates winners. The phone sends only actions. No Firebase or database. If the laptop sleeps, the game stops. Refreshing resets the session.

This is an early network test, not production-grade. The public PeerJS signaling service may be unavailable, and some hotspot configurations may need TURN relay support.
