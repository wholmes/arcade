# Arcade

Browser-based dice games by **Whittfield Holmes** — fast sessions, tactile feedback, and progression you can feel. This repository holds the static site deployed to GitHub Pages.

**Play Dice 21:** [wholmes.github.io/arcade/dice-21/](https://wholmes.github.io/arcade/dice-21/)

The [Arcade home](https://wholmes.github.io/arcade/) redirects here as well.

---

## Games

### Dice 21

A Blackjack-inspired dice game: push toward 21 without busting, manage rising risk as your total climbs, and unlock higher stakes and modes.

- **Flow:** Bet → roll → **Hit** or **Stand** → beat the dealer without going over 21.
- **Dice rules:** Below 14 you roll two dice; at 14+ you roll one die (higher variance).
- **Extras:** Progressive stakes, achievements, lifetime stats, multiple dealer personalities (Classic, Sharp, Chill, Fortune), optional **Double or Nothing**, tournaments, and optional **multiplayer** over WebSockets when a compatible game server is available.

### Poker Dice

Roll five dice, hold what helps, and build the best poker-style hand across rounds — with table vibes, scoring modes, and optional two-player sync (same mechanics as Dice 21 multiplayer: separate server process).

---

## Preview

![Dice 21 gameplay](./assets/gameplay.gif)

---

## Repository layout

| Path | Purpose |
|------|---------|
| `dice-21/` | Dice 21 shell HTML and entry |
| `poker-dice/` | Poker Dice shell HTML and entry |
| `assets/` | Bundled JavaScript, shared chunks, favicon assets |
| `audio/` | Audio manifests / related assets |
| `privacy-policy/` | [Privacy policy](https://wholmes.github.io/arcade/privacy-policy/) (public page) |
| `.github/workflows/` | GitHub Pages deployment workflow |

Client code is shipped as static files. Script and module URLs use the **`/arcade/`** base path so the site works as a [GitHub project page](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages#types-of-github-pages-sites) at `https://<user>.github.io/<repo>/`.

---

## Deployment

Pushes to `main` run **Deploy to GitHub Pages** (`.github/workflows/pages.yml`). In the repository **Settings → Pages**, set the source to **GitHub Actions** (not “Deploy from a branch”) the first time you enable Pages.

---

## Privacy

The [privacy policy](https://wholmes.github.io/arcade/privacy-policy/) describes local storage, optional multiplayer, and GitHub’s role as host.

---

## Tech notes

- **Client:** JavaScript (ES modules), WebGL / canvas-style 3D dice, Web Audio.
- **Build:** Bundled assets in `assets/` (e.g. Vite-style chunks in filenames); there is no `package.json` in this repo — treat it as the published static output.
- **Multiplayer:** Optional; requires a WebSocket server compatible with the clients (in-game copy references `npm run mp-server` / port `8788` when that server is part of your dev setup elsewhere).

---

## Author

**Whittfield Holmes** — [github.com/wholmes](https://github.com/wholmes)

Site build & brand: [Code My Brand](https://codemybrand.com/)
