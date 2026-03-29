# Dice 21 & Poker Dice — Player guide

This document is written for **people playing the games** in a browser.  
*(Developers: see the main [`README.md`](./README.md) in the source repository.)*

---

## What this is

**Dice 21** and **Poker Dice** are **browser games**—no install required. They run entirely in your browser using **modern web technology** (including 3D graphics and sound).

- **Dice 21** — Casino-style dice blackjack: get closer to **21** than the house without going over, on a 3D table with chips, career progression, badges, and optional tournaments.
- **Poker Dice** — A separate game mode at **`/poker-dice/`** on the same site (five dice, poker-style scoring).

Your host may serve the games under different paths (for example **`/dice-21/`** or **`/arcade/dice-21/`**). Use the links on the site’s home page to open each game.

---

## First visit: Tap to play & sound

- The first screen may ask you to **tap or click to start**. That isn’t just ceremony—browsers often **block audio** until you interact with the page. After you tap, sound and music can play normally.
- If you hear nothing, check **system volume**, **browser tab isn’t muted**, and that **“Do Not Disturb”** or strict autoplay settings aren’t blocking audio.
- **Reduced motion:** If your system prefers reduced motion, the game may simplify some animations and effects for comfort.

---

## Dice 21 — goal

Beat the **house** (dealer) by having a **higher total than the dealer without going over 21**. You are **not** competing against another human at the table in solo play—you’re playing against the house.

---

## One hand at a glance

1. **Choose a bet** using the chip controls (which chips appear depends on your **career table** and unlock rules—see below).
2. **Deal** to start. You’ll see your total and can **Hit** (take more dice) or **Stand** (lock your total).
3. **Hitting:** Below **14**, your next roll often uses **two dice**; at **14 or above**, each hit is **one die**—so high totals get riskier.
4. After you stand, the **house** plays automatically according to the **dealer mode** you selected.
5. **Higher total without busting wins the pot.** Ties are handled as a **push** (you get a small refund—not the full pot back).

Use the in-game **Help** / rules panel for the exact wording on bets, limits, and ties.

---

## Dealer modes (how the house plays)

These only change **house behavior** after you stand—not your own hit rules.

| Mode | Idea |
|------|------|
| **Classic** | House hits below **17**, stands on **17+**. |
| **Sharp** | House hits up to **18** (slightly tougher). |
| **Chill** | House stands on **16** (slightly softer). |
| **Fortune** | Like Classic for the house, but winning with **exactly 21** can pay a little extra (see on-screen rules). |

Changing mode may ask for **confirmation** and isn’t allowed in the middle of a roll or certain special states.

---

## Career tables, stakes & unlocking

The game uses a **career ladder** of tables. Each table has:

- A **starting bank** for you and the house  
- A **minimum bet** until you **unlock** higher chip values on that same table  
- Rules for **moving to the next table** (for example when the **house bank runs out**, or alternate goals explained in-game)

Until you unlock higher limits on a table, you may be restricted to the **minimum chip** until you meet the win or bank conditions described in the **stake hint** and help text.

**Lifetime stats** (hands played, money won, etc.) are shown in the HUD and feed **achievements** and some **tournament** gates. They are stored in your browser—see **Privacy & data** below.

---

## Badges & tournaments

- **Badges** reward milestones (first wins, streaks, dealer modes, high pots, and more). Open the **Badges** section in the game to see what’s available and what you’ve unlocked.
- **Tournaments** are optional **best-of** mini-events with **fantasy prizes**—they use your normal table bankroll, not a separate currency. You can usually enter **one active series** at a time. Read the tournament panel in-game for gates and rules.

---

## Win streaks (“hot” dice)

Consecutive **player** wins can visually **heat up** your dice (and, at longer streaks, extra effects). This is **cosmetic feedback** for streaks—it doesn’t change the underlying randomness of the rolls.

---

## Ambience & music

- **Room ambience** — A looped casino background bed.
- **Ambience DJ** — Extra tracks played as one-shots over time, layered on top (when enabled).

You can turn these on or off in the **Table** / mode area. Third-party music may include **attribution** on the start screen or credits—please respect those notices.

---

## Multiplayer (optional)

If your deployment includes multiplayer:

- One player is the **host** (plays the full game). The other joins as a **guest** with a **4-character room code**.
- In **Dice 21**, the **guest usually watches** with a **live sync** of the host’s HUD—the guest does **not** control the table.
- Multiplayer requires a **running relay server** and a **network path** to it. If the relay isn’t available, you’ll see a message in the multiplayer panel and can keep playing **solo**.
- **Reconnect** may be offered if your session was saved in this browser tab; if the connection drops, create a **new room** or ask the host for a **new code** if needed.

Exact behavior depends on how the site operator hosts the relay (same Wi‑Fi vs internet, etc.).

---

## Poker Dice

Open **`/poker-dice/`** (or the link your site provides). It uses the **same optional multiplayer server** as Dice 21 for shared rooms and deterministic rolls. Rules are shown in that game’s UI.

---

## Privacy & data

- These games are designed to run **without an account**. Progress (stats, session chips, settings) is stored in your browser’s **`localStorage`** (and short-lived **`sessionStorage`** for multiplayer session info).
- **Nothing is sent to “the cloud”** for core solo play—data stays on **your device** unless you use **multiplayer**, which only sends what’s needed for that session through the relay your operator runs.
- **Clearing site data** or using a **private / incognito** window starts fresh (or with defaults). **Reset all progress** inside the game clears most career and achievement data; see the in-game description for what is and isn’t reset.

---

## Troubleshooting

| Issue | Things to try |
|--------|----------------|
| **Stuck on “Loading…”** | Hard refresh (**Ctrl+Shift+R** / **Cmd+Shift+R**). Try another browser. Disable extensions that block scripts. |
| **No sound** | Tap **Tap to play** first. Unmute the tab. Check system volume. |
| **Multiplayer won’t connect** | Confirm the site’s instructions for the relay. Same Wi‑Fi / firewall can block ports—try another network or ask the operator. |
| **Progress disappeared** | Different browser, cleared cookies, or private mode = different storage. Use the same browser and URL you used before. |

---

## Reset progress

Use **Reset all progress** in the game (Lifetime / settings area) to clear **lifetime stats, badges, table session, and tournament state** as described on that button. Some **preferences** (like dealer mode or ambience toggles) may be kept until you clear **all site data** for this website in your browser settings.

---

## Credits & copyright

**Dice 21** and **Poker Dice** (original game code and assets in this project) are **© Whittfield Holmes** — all rights reserved unless otherwise noted.

**Third-party audio** and other credited assets remain under their respective licenses; see in-game credits and any **attribution** lines on the start screen (for example music credits).

---

## Source code

The **development repository** (build instructions, issue tracker, and full technical documentation) may live separately from this static site—for example:

**[github.com/wholmes/dice-21](https://github.com/wholmes/dice-21)**

Use that link if you want to **report a bug**, **suggest a feature**, or **build from source**.

---

*This player guide is a companion to the developer README. Game behavior always follows the shipped build; if this document and the game disagree, trust the in-game UI and rules text.*
