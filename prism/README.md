# PRISM — Crystal Match

Browser match-3 puzzle: swap adjacent crystals to clear objectives before you run out of moves. Thirty hand-authored levels, chains, power gems, crates, and local progress.

## Run locally

No build step. Open the game in a browser:

```bash
open prism-match.html
```

Or serve the folder (helps some browsers with `file://` quirks):

```bash
npx serve .
# then open the URL shown (e.g. http://localhost:3000/prism-match.html)
```

## How to play

- **Select** a gem, then an **adjacent** gem (up/down/left/right), or **drag** toward a neighbor to swap.
- A swap must create a match of **three or more** of the same color (or activate a power crystal).
- **Objectives** appear under the score; complete them all to clear the level.
- **HINT** on the game screen, or press **H** (when not typing in a field).
- **NEW GAME** on the title screen resets saved progress and starts from level 1.

Progress is stored in `localStorage` (`prism-unlocked`). Mute state for SFX: `prism-mute-sfx`.

## Stack

- **Vanilla JS** (classic scripts, no bundler)
- **CSS** (custom properties, grid board)
- **GSAP** (loaded from CDN) for some screen transitions and board entrance
- **Web Audio** for synthesized SFX (no audio files)

## Optional URL query flags

These are read in `js/constants.js`:

| Query | Effect |
|--------|--------|
| `?perf=1` / `?lightbg=1` | Lighter visuals (less background motion) |
| `?fullfx=1` | Force full particle effects (overrides reduced-motion perf path for testing) |
| `?mute=1` | Disable Web Audio SFX |
| `?fps=1` | Tiny FPS counter |
| `?matchfx=1` | Enables match beam + board nudge on clears (see file for related flags) |

## Project layout

```
prism-match.html    # Entry
prism-match.css
assets/bg-prism.svg   # Background art
js/
  constants.js      # Timing, tuning, query flags
  state.js
  levels.js           # Level definitions
  game-loop.js        # Match resolution, swaps, cascade
  render.js           # Board + HUD
  screens.js          # Title, intro, win/lose
  particles.js      # Canvas VFX
  audio.js            # Web Audio SFX
  toast.js            # Combo / hint messages
  assets.js
  dom-utils.js
  main.js
```

## License

Add a `LICENSE` file if you want to specify terms for others.
