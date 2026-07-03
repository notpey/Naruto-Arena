# Shinobi Arena — Visual Theme Notes

This app's public website was re-themed from a JJK / "cursed energy" fantasy
into an **original Naruto-Arena-inspired shinobi arena**. This is a *visual /
palette* refactor only — no gameplay, data, auth, routing, or component
architecture changed.

## Where the theme lives

| Layer | File | Status |
|-------|------|--------|
| Public design system (tokens) | `brand.css` `:root` | **Re-themed** |
| Public pages (index, leaderboards, missions, game info, profile, clan, admin) | `*.html` (use `brand.css` tokens + small inline `<style>`) | **Re-themed** |
| Game / battle client | `style.css`, `ingame.html`, `selection.html` | **Already shinobi** — parchment scroll panels (`#fbe9b8`/`#d4c9a8`), brown scroll borders (`#8b7d5c`), crimson accent (`#c41e3a`). No JJK/purple was ever present here, so it was left untouched (it is the most Naruto-aligned surface already). |

The game client keeps its own color scope and is intentionally **not** driven by
`brand.css` (it is pixel-art scroll UI on a fixed battle viewport).

## Palette mapping (cursed → shinobi)

The old palette reduced to three accent base colors plus a dark ground. Each was
mapped to a shinobi/chakra equivalent. Token **names were kept** (e.g.
`--ca-purple`) to avoid churn across dozens of files; they now hold shinobi
values. Prefer the new aliases going forward.

| Old (cursed) | New (shinobi) | Token | Role |
|---|---|---|---|
| Hollow Purple `#8b33d6` | **Shinobi Ember `#e8801a`** | `--ca-purple` / `--ca-ember` | primary CTA, active state, accent |
| Lighter purple `#a855f7` | **Amber chakra `#ffae42`** | `--ca-purple-lit` / `--ca-amber` | hover / glow |
| Purple tint `#2d1145` | **Ember tint `#3a2008`** | `--ca-purple-dim` | accent tint surface |
| Reversal Red `#e11836` | **Shinobi Crimson `#e11836`** | `--ca-red` / `--ca-crimson` | danger / enemy / damage |
| Lapse Blue `#2c9cdb` | **Chakra Blue `#2c9cdb`** | `--ca-blue` / `--ca-chakra` | info / ally / energy |
| Absolute black `#000000` | **Deep ink-navy `#05070e`** | `--ca-void` / `--ca-navy` | tactical ground |
| near-black grays | navy-tinted darks `#0a0c14`…`#343c4d` | `--ca-smoke`…`--ca-mist` | panels / dividers |
| Bone / parchment | unchanged `#f0ede8`…`#8a8680` | `--ca-bone` / `--ca-parchment` / `--ca-dust` | light info zones |
| Gold | unchanged `#ffb84d` | `--ca-gold` | medals / #1 / rewards |

All `rgba()` glows and tints were remapped by RGB triplet
(`139,51,214` → `232,128,26`, etc.), so every glow/border/alpha layer was
preserved — only the hue shifted.

### Contrast guard
Shinobi ember is mid-luminance and is great on the dark navy surfaces but too
low-contrast as small text on the parchment (`--ca-bone`) cards. The few
slash-labels/kickers that sit on parchment (`.ca-section-label`,
`.news-change-title`, `.news-change-skill`, `.mainsection-kicker::before/after`)
were switched to **crimson** (`--ca-red`), which reads well on cream and stays
on-theme (fire). Ember is reserved for dark-surface accents.

## Identity copy
Product name = **Naruto-Arena**; "shinobi" is used only for genre/vibe.
- Wordmark = **`NARUTO ARENA`**; seal glyph `N·A`.
- Tagline (genre) → `YOUR #1 ONLINE SHINOBI STRATEGY GAME` (kept "shinobi").
- Kanji watermark 呪術 (jujutsu) → 忍 (*shinobi/nin*, genre decoration).
- Page titles / aria-labels / auth / footer copy → `Naruto-Arena`.

## Light-surface layer (dark frame, light content)
The dark navy shell (nav, hero, body background) is the **frame**; primary page
content now sits on **warm-white / parchment "sheet" containers** with ink-navy
text, soft shadows, subtle borders, and generous padding. Dark panels are used
intentionally (tab bars, the skill meta "readout" pill, the unlock bar), not
everywhere.

New tokens (in `brand.css :root`):

| Token | Value | Role |
|---|---|---|
| `--ca-surface-light` | `#faf8f3` | main body sheet (warm white) |
| `--ca-surface` | `#f4f0e8` | parchment panel / card |
| `--ca-surface-sunk` | `#ebe5d7` | sunken / zebra / hover on light |
| `--ca-ink` | `#1b2330` | primary text on light |
| `--ca-ink-soft` | `#4c5562` | secondary text on light |
| `--ca-ink-faint` | `#69707c` | meta text on light (AA-tuned) |
| `--ca-line-ink` | `rgba(27,35,48,.12)` | hairline border on light |
| `--ca-shadow-sheet` | `0 18px 50px rgba(0,0,0,.5)` | sheet float shadow |

Applied to: **leaderboards** (board → light sheet, ink rows, colored medals/pills
kept), **missions** (card grid + detail → light sheets), **game info** (in-game
panel, face grid, character/skill detail → light sheets). The **home** page
already used light parchment content sections (`.ca-releases`, `.news-post`) on
the dark shell, so it already follows this pattern. On-light small green labels
use `#1f7a3f` and meta uses `--ca-ink-faint #69707c` for AA contrast on cream.

## Game client tokens
`style.css` gained a small local `:root` block (`--na-crimson`, `--na-danger`,
`--na-parchment`, `--na-scroll`, `--na-scroll-2`, `--na-scroll-edge`,
`--na-chakra-blue`, `--na-ink`) and the repeated hardcoded hexes now reference
them. **Values are unchanged**, so the battle UI is visually identical — this is
pure maintainability. The battle screen intentionally stays on its warm
parchment-scroll/dark-tactical palette (not whitened) to preserve combat clarity.

No copyrighted Naruto assets, logos, screenshots, or ripped art were added; the
theme is CSS gradients/tokens + text only.

## Remaining visual TODOs (later pass)
- The hero wordmark is CSS text; a bespoke original shinobi-seal SVG could
  replace the ⚡ glyph for more identity.
- Optional: rename the `--ca-purple*` / `--glow-purple` token *names* to
  `--ca-ember*` repo-wide (pure clarity; aliases already exist).
- Optional subtle CSS texture (paper-grain/ink-noise gradient) on parchment
  cards for extra "scroll" feel.
- Game client (`style.css`) is already shinobi; a future pass could unify its
  hardcoded colors into a small token block for consistency with `brand.css`.
