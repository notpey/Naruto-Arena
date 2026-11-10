# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: returning Naruto-Arena veterans, people who played the original browser game and want it back. Secondary: Naruto fans who never played it. Design for veterans first, but keep every screen approachable for a newcomer.

Players come for 3v3 turn-based shinobi battles: drafting a team, managing chakra, queueing skills, and climbing the ladder against real opponents.

## Product Purpose

Naruto-Arena is a browser strategy game in the "Naruto-Arena Classic+" spirit. It brings back the classic game and extends it with new characters, missions, clans, ladders, and modes. Success means veterans recognize the game they loved, and the additions make it deeper rather than different.

## Positioning

A faithful continuation of the classic Naruto-Arena, not a reimagining. The battle rules, the character kits, and the parchment-and-scroll client are the product. New systems such as the Tower are built on that same engine and rules.

## Operating Context

- Matches are live 3v3 battles over WebSockets. The server, through `battleLogic.js`, decides every outcome; the client only sends intent and renders canonical state.
- Surfaces: the public site (news, ladders, missions, profiles, clans, manual), the game client (`selection.html`, `ingame.html`), and the Tower (`tower.html`).
- The Tower is a solo PvE roguelike for regular players: something to play between ranked matches, or when nobody is online. Its runs are grouped into Acts, and each in-game expansion can add a new Act that moves the lore forward. Tower results never touch ladder records, missions, or winrates.
- Deployed on Render. A push to `main` goes live.

## Capabilities and Constraints

- Stack: Node/Express, MongoDB, `ws`, and vanilla HTML/CSS/JS. There is no front-end framework.
- The game client uses a fixed-layout stage (`style.css`) with `game-surfaces.css` layered on top. The public site uses tokens from `brand.css`. The two keep separate color scopes on purpose.
- Gameplay behavior defined by the server must never be reinterpreted on the client (see AGENTS.md).
- Tower terminology: Act, floor, node (battle, elite, boss, ramen stand, merchant, recruit), Forbidden Scrolls (Genin / Jōnin / Kage tiers), affixes, ryō, draft, wounded, last life.

## Brand Commitments

- Product name is **Naruto-Arena**. "Shinobi" is used only for genre and vibe.
- The in-game client must stay recognizably like the current Naruto-Arena and pay homage to the classic where it can: "Naruto-Arena Classic+".
- Existing visual theme notes live in `DESIGN_NOTES.md`.

## Evidence on Hand

- Character portraits and skill icons come from `data/characters/`.
- Tower art: `assets/tower/` (scroll icons, affix icons, boss enrage).
- There are no testimonials, player counts, or press. Do not fabricate them.

## Product Principles

1. **Classic first.** A change should feel like something the original could have shipped.
2. **The server is truth.** The UI renders canonical state and never predicts outcomes.
3. **Depth over novelty.** New modes reuse the battle rules and give regulars more reasons to play.
4. **Veterans fluent, newcomers welcome.** Use the game's own vocabulary, and explain it where a newcomer meets it.

## Accessibility & Inclusion

Mobile must work: the Tower and the site pages must be fully playable on phones. Beyond that, follow standard good practice: keyboard access, readable contrast, and respect for reduced-motion preferences.
