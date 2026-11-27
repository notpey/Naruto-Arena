---
name: Naruto-Arena
description: The game client's world, the hub and the Tower, in slate boards, amber and crimson, inside a fixed 1100x800 stage.
colors:
  slate-high: "#22333d"
  slate: "#16232c"
  slate-low: "#101a22"
  well: "#0c151b"
  nav-ink: "#0f1b22"
  stage-floor: "#16252e"
  edge: "#465964"
  hairline: "#2f414b"
  control-edge: "#65777d"
  tool-edge: "#657780"
  tool-fill: "#20313a"
  portrait-edge: "#5c6e76"
  nav-rule: "#51616a"
  bone: "#f2f3f0"
  mist: "#b9c5c8"
  ash: "#93a4aa"
  tab-ink: "#c0cbce"
  amber: "#e3ad68"
  amber-light: "#f4c98f"
  amber-tab: "#f4c27d"
  wordmark-amber: "#f0b866"
  crimson: "#c9463d"
  crimson-ink: "#ff9f95"
  enemy-ink: "#ffb3aa"
  danger: "#e0675a"
  heal: "#6fbf8e"
  wound: "#d9a441"
  health-green: "#4caf50"
  bar-neutral: "#9aabb3"
  tier-common: "#a9bfa6"
  tier-rare: "#6fb0f2"
  tier-forbidden: "#ef7a6e"
  tier-prismatic: "#d9a8ff"
typography:
  display:
    fontFamily: "Libre Franklin, system-ui, sans-serif"
    fontSize: "40px"
    fontWeight: 900
    lineHeight: 0.9
  headline:
    fontFamily: "Libre Franklin, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 900
    lineHeight: 1.15
  title:
    fontFamily: "Libre Franklin, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 900
    lineHeight: 1.2
  body:
    fontFamily: "Libre Franklin, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.4
  body-small:
    fontFamily: "Libre Franklin, system-ui, sans-serif"
    fontSize: "12.5px"
    fontWeight: 500
    lineHeight: 1.45
  label:
    fontFamily: "Libre Franklin, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.08em"
  button:
    fontFamily: "Libre Franklin, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.06em"
  seal:
    fontFamily: "Noto Serif JP, Yu Mincho, serif"
    fontSize: "25px"
    fontWeight: 700
    lineHeight: 1
rounded:
  hairline: "2px"
  icon: "3px"
  portrait: "4px"
  control: "5px"
  tool: "6px"
  board: "9px"
  seal: "50%"
spacing:
  tight: "4px"
  row: "6px"
  inner: "10px"
  gutter: "14px"
  board: "16px"
  stage-x: "26px"
components:
  button:
    backgroundColor: "{colors.slate-high}"
    textColor: "{colors.bone}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0 18px"
    height: "40px"
  button-primary:
    backgroundColor: "{colors.slate-high}"
    textColor: "{colors.bone}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0 18px"
    height: "40px"
  button-large:
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0 26px"
    height: "48px"
  tool:
    backgroundColor: "{colors.tool-fill}"
    textColor: "{colors.bone}"
    rounded: "{rounded.tool}"
    padding: "0 12px"
    height: "32px"
  nav-tab:
    textColor: "{colors.tab-ink}"
    typography: "{typography.label}"
    padding: "0 22px"
  nav-tab-active:
    textColor: "{colors.amber-tab}"
  board:
    backgroundColor: "{colors.slate}"
    textColor: "{colors.bone}"
    rounded: "{rounded.board}"
    padding: "{spacing.board}"
  list-row:
    textColor: "{colors.bone}"
    rounded: "{rounded.icon}"
    padding: "6px 6px 6px 9px"
  seal:
    backgroundColor: "{colors.slate}"
    textColor: "{colors.amber-light}"
    typography: "{typography.seal}"
    rounded: "{rounded.seal}"
    size: "54px"
  tooltip:
    backgroundColor: "{colors.nav-ink}"
    textColor: "{colors.bone}"
    rounded: "{rounded.tool}"
    padding: "9px 11px"
    width: "280px"
  input:
    backgroundColor: "{colors.well}"
    textColor: "{colors.bone}"
    rounded: "{rounded.control}"
    padding: "0 10px"
    height: "38px"
---

# Design System: Naruto-Arena

Scope: the game client world. That is the hub and battle client (`selection.html`, `ingame.html`; fixed layout in `style.css`, materials in `game-surfaces.css`) and the Tower (`tower.html`, `tower.css`, `tower.js`). The public site (news, ladders, profiles) runs on `brand.css` and keeps its own colour scope on purpose. This file does not govern it.

## Overview

**Creative North Star: "The Slate Board in the Hub"**

The game is a set of dark slate boards on a fixed 1100x800 stage. Behind them, the scene art is blurred and darkened. Everything a player acts on sits on a board, with a thin cool edge and a 9px corner. Amber marks the player's own progress and the main action. Crimson marks what wants to kill them. The boards are dense, the way the classic client was dense: portraits, health and choices all fit on one screen without scrolling. On phones, the stage gives way to a stacked layout that scrolls.

The materials hold back. Boards are slate gradients, not glass. Depth comes from tone and a hairline highlight, not big floating shadows. Labels use bold uppercase Libre Franklin. The kanji seal is the only ornament, and it always carries meaning: the kind of floor, node or place. Colour does a job: amber for the climb, crimson for danger, green for health, and four tier colours for augments.

The Tower carries this world as its own `--tw-*` tokens. Most of their values are copied from the hub's `--arena-*` tokens and the hub's hard-coded component values (see Colors, Mirrors). It follows the same stage, nav, boards and buttons. It adds the posting, the seal and the fusion moment.

**Key Characteristics:**
- A fixed 1100x800 stage, scaled down to fit and never scaled up, with blurred scene art in the letterbox.
- Slate gradient boards (155deg) with #465964 edges and 9px corners.
- Buttons with the hub's 3px bottom accent bar.
- Libre Franklin from 500 to 900, with bold uppercase labels. Kanji seals in Noto Serif JP 700.
- Amber for the climb and primary actions, crimson for bosses and danger, tier colours for augments.
- Inside a board, lists are rows with hairline dividers, not nested cards.

## Colors

The palette is cool slate neutrals with two warm voices, amber and crimson. A small set of state and tier hues has a fixed meaning.

### Primary
- **Climb Amber** (amber): the player's progress and the primary action. It covers the active nav tab underline, the primary button's bottom bar, the ryō total, the distance counters, finished segment pips, focus outlines, the selection ring and default seal rings. Mirrors the hub's `--arena-accent`.
- **Lit Amber** (amber-light): seal kanji, the next segment pip, selected names and inline text links. It is amber's highlight, never a fill.
- **Tab Amber** (amber-tab) and **Wordmark Amber** (wordmark-amber): the nav's hover and active tab ink, and "NARUTO" in the wordmark. Both are copied from the hub nav.

### Secondary
- **Boss Crimson** (crimson): bosses, elites and the leader of an enemy squad. It is used for posting borders, seal rings, boss pips and the leader portrait's frame.
- **Crimson Ink** (crimson-ink): text in a boss or elite context, such as the kind line, distance-to-boss counters and boss seal kanji.
- **Enemy Ink** (enemy-ink): enemy health numbers and affix names.
- **Danger** (danger): destructive buttons (Abandon run), a full augment capacity, unaffordable prices, error toasts and dead state text.

### Tertiary
- **Tier colours** (tier-common, tier-rare, tier-forbidden, tier-prismatic): augment rarity. They show up as icon rings, augment-row text, kind lines and the posting icon ring. Prismatic also marks fusions: fused names and the "new augment" glow.
- **Heal** (heal): rest and medicine seals. **Wound** (wound): the fallen state and low health bars. **Health Green** (health-green): health fill.

### Neutral
- **Slate High / Slate / Slate Low** (slate-high to slate-low): the three stops of the board gradient. Slate and Slate Low mirror the hub's `--arena-surface` and `--arena-surface-low`. Slate High is the stop the hub hard-codes in its board gradient.
- **Well** (well): wells set into a board, such as health tracks, chakra bars and text inputs.
- **Nav Ink** (nav-ink): the nav bar and tooltips. **Stage Floor** (stage-floor): the stage's base under the backdrop.
- **Edge** (edge): every board and dialog border. Mirrors `--arena-edge`. **Hairline** (hairline): dividers between rows and columns inside a board.
- **Control Edge / Tool Edge / Tool Fill / Portrait Edge / Nav Rule**: button borders, nav tool chips, portrait frames and the line under the nav.
- **Bone** (bone): main text. **Mist** (mist): secondary text and labels. **Ash** (ash): placeholders, "None", blocked notes. Bone and Mist mirror `--arena-text` and `--arena-muted`.

### Mirrors
The Tower's tokens copy hub values; they do not link to them, because `tower.html` does not load `game-surfaces.css`. The pairs are:
- `--tw-surface` = `--arena-surface`.
- `--tw-surface-low` = `--arena-surface-low`.
- `--tw-edge` = `--arena-edge`.
- `--tw-text` = `--arena-text`.
- `--tw-muted` = `--arena-muted`.
- `--tw-accent` = `--arena-accent`.
- `--tw-shadow` = `--arena-shadow`.
- `--tw-surface-hi` = the hub's literal board-gradient start.

The Tower's button gradient, inset highlight and bottom bar are copied from the hub's mode button (`.game-button::before`). The nav (#0f1b22 with a #51616a rule, the wordmark, tab colours) and the nav tools (6px, #657780 on #20313a) are copied from the hub nav and its ryō chip. If you change one side, change the other.

### Named Rules
**The Two Voices Rule.** Amber means "you and your next step". Crimson means "this fights back". Never swap them, and never use a third warm accent for either job.

**The Tier Is Meaning Rule.** The four tier colours appear only on augments and the things tied to them, such as fusions and their notes. Never use them for decoration.

## Typography

**Display Font:** Libre Franklin (with system-ui, sans-serif)
**Body Font:** Libre Franklin
**Seal Font:** Noto Serif JP 700 (with Yu Mincho, serif), for kanji only

**Character:** a heavy grotesque at weights 800 to 900 for names, numbers and uppercase labels, the scoreboard voice of the classic client. One brushed serif is kept for the seals.

### Hierarchy
- **Display** (900, 40px, 0.9): the floor number, with a 15px/800 Mist "/ 200" after it. Tabular figures.
- **Headline** (900, 20px, 1.15): the floor or region title in the header strip. It truncates on one line and wraps on phones. End-of-run headings go to 30px.
- **Title** (900, 17px, 1.2): posting titles. Dialogs use 18px and the fusion card 24px.
- **Body** (500, 13px, 1.4): base text. Narrative lines use 13.5 to 14px at 1.5 to 1.55, capped at 62 to 72ch.
- **Body Small** (500, 12.5px, 1.45): posting text, rules and dialog sub-lines, in Mist.
- **Label** (800, 11px, 0.08em, uppercase): board section headings ("Your team", "Team augments 8 / 8"). Nav tabs and tools use 700, 11px, 0.04 to 0.06em, uppercase.
- **Button** (800, 12px, 0.06em, uppercase): every button label.
- **Seal** (Noto Serif JP 700, 25px on 54px seals, 24px on 52px header seals).

Numbers that count (health, ryō, floors, prices) use `font-variant-numeric: tabular-nums`.

### Named Rules
**The Bold Ink Rule.** Names, numbers and labels sit at 800 to 900. Reading text stays at 500. Nothing in between carries meaning.

**The One Serif Rule.** Noto Serif JP is used only for single kanji inside a seal. Never set Latin text in it.

## Layout

**The stage.** The desktop stage is fixed at 1100x800. It has a 52px nav row over a body, and it is scaled with `min(1, width/1100, height/800)`, so it never scales above 1 and the page never scrolls. The window around it shows the same scene art, blurred (10px) and darkened (rgba(5,10,13,.78)). Inside the stage, the backdrop is the scene blurred at 5px under a 55 to 72% slate wash. A `data-scene` on the body picks the art for each region.

**The Tower body.** Padding is 18/26/22px. There is a 262px team column and a fluid main column, separated by the 14px gutter. The main column stacks the floor header strip (at least 88px) over the board area. Boards and postings sit 14px apart.

**Postings.** Postings use `grid-auto-flow: column` with equal columns. Their two rows are a 196px art band and the body. Each posting takes `grid-template-rows: subgrid`, so seals, titles and actions line up across the row.

**Phones.** Below a 760px width, or below 1000px in portrait, the body gets `tw-compact`, the stage drops its scale and the page scrolls. The nav wraps with its tabs in a scrolling row. The team becomes three portraits side by side over a strip of augment icons. Postings stack, and their art band shrinks to 150px. Buttons and member rows grow to at least 44px. The fusion overlay goes fixed and full screen.

**Rhythm.** Spacing works in 4px steps: 4 for tight, 6 for rows, 10 inside a board, 14 between boards, 16 for board padding and 26 for the stage's side margin.

## Elevation & Depth

Depth comes from tone. A board is lit from its top-left corner by the 155deg slate gradient and has a 1px inner top highlight. Things that float above the stage get real shadows: the nav, buttons, dialogs, tooltips, toasts, the mobile sheet and the fusion card.

### Shadow Vocabulary
- **Board highlight** (`box-shadow: inset 0 1px 0 rgba(255,255,255,.04)`): every Tower board.
- **Nav lift** (`box-shadow: 0 5px 18px rgba(0,0,0,.36)`): the nav bar, as in the hub.
- **Button** (`box-shadow: inset 0 1px rgba(255,255,255,.13), inset 0 -3px var(--bar), 0 6px 14px rgba(0,0,0,.3)`): the highlight, the bottom accent bar and a short lift.
- **Float** (`box-shadow: 0 16px 36px rgba(0,0,0,.38)`): toasts and tooltips. This is the hub's `--arena-shadow`.
- **Dialog** (`box-shadow: 0 12px 28px rgba(0,0,0,.45)`) and **Fusion card** (`box-shadow: 0 24px 60px rgba(0,0,0,.55)`): modal layers above a dark scrim.

### Named Rules
**The Lit Edge Rule.** Boards that sit on the stage take the inset highlight, not a wide drop shadow. Hub boards in `game-surfaces.css` still carry `--arena-shadow`. That is the hub's incumbent state; the Tower keeps its boards flat.

## Shapes

The corners step up with the size of the surface:
- 2px for health tracks and pips.
- 3px for augment icons and skill icons.
- 4px for portraits.
- 5px for buttons and inputs.
- 6px for nav tools, tooltips and toasts.
- 9px for boards and dialogs.

Seals and the loading ring are full circles. Every portrait is a square with a 1px #5c6e76 frame. Every augment icon carries a 1px ring in its tier colour, drawn with box-shadow so it adds no size. Borders are always 1px. A 2px border is used only on seals, on a squad leader's portrait and on selection rings.

## Components

### Buttons
The hub's mode button, cut down to fit a board.
- **Shape:** 5px corners, a 1px #65777d border and a 40px height (48px when large, 44px on phones).
- **Default:** a 165deg slate gradient (#2d424c to #1d303a to #13232b), with a 1px inner highlight and a 3px bottom bar in neutral #9aabb3.
- **Primary:** an amber bottom bar and a #a07a4a border. **Danger:** a danger-red bar.
- **Hover:** the border takes the bar colour, the gradient flattens to #344852 to #192a34 and the button lifts by 1px. **Active:** it sinks by 1px. **Disabled:** 45% opacity. **Loading:** the label goes transparent and a ring spins in its place.
- **Nav tools:** small 32px chips, #20313a with a #657780 border and 6px corners. The border turns amber on hover, or danger-red for Abandon.
- **Text links:** Lit Amber 800 12px, underlined with a 3px offset.

### Boards
- **Corner Style:** 9px.
- **Background:** the slate gradient at 155deg (Slate High, Slate at 48%, Slate Low).
- **Shadow Strategy:** the board highlight only (see Elevation & Depth).
- **Border:** 1px Edge. It turns crimson for boss and elite postings and amber for a picked posting.
- **Internal Padding:** 16px (14px in the team column, 18 to 20px in detail columns). Columns inside a board are divided by a 1px Hairline.

### Rows
The list inside a board.
- **Style:** full-width rows with no border and no fill, separated by 1px #2f414b hairlines (or a 1 to 4px gap in dense lists).
- **Hover:** a faint white tint (3.5 to 4%).
- **Selected:** a warm tint (rgba(227,173,104,.10)), a 2px amber ring on the portrait and the name in Lit Amber. Pickable member rows carry a 7% warm tint at rest and 14% on hover or focus.
- **New:** an augment row that was just created by a fusion pulses twice with a 22% prismatic wash.

### Inputs / Fields
- **Style:** a Well fill, a 1px Edge border, 5px corners and a 38px height. Placeholders are in Ash.
- **Focus:** the global 2px amber outline with a 2px offset.

### Navigation
The hub bar, copied value for value. It is a 52px row of Nav Ink with a 1px #51616a rule and the nav lift. The wordmark reads "NARUTO ARENA" in Libre Franklin 700 15px, with "NARUTO" in Wordmark Amber. Tabs are uppercase labels in Tab Ink. On hover and when active they turn Tab Amber, and the active tab gets a 2px amber underline inset 14px from each side. The nav tools sit at the right. On phones the bar wraps and the tabs scroll sideways.

### Seal
The only ornament, and it carries a meaning.
- **Shape:** a 54px circle (52px in the header) with a 2px ring, filled with Slate, holding one kanji in Noto Serif JP 700.
- **Tones:** amber ring and Lit Amber ink by default. Boss and elite are crimson with Crimson Ink, rest is heal green, shop is tier-rare blue and event is violet #b48cf0.
- **Placement:** on a posting, the seal straddles the lower edge of the art band (left 16px, bottom -26px). In the header strip it stands in for the floor number on screens that are not floors.
- **Hub variant:** in the hub, the elite matchmaking moment uses a hanko stamp instead. It is a 46px square seal (3px corners) in vermilion #c2362b with a bone #efe6d4 ring and vertical kanji, set at -4deg, on an ink #100e0d board. This ink, bone and vermilion set belongs to that one moment.

### Posting
The signature of the Tower floor board.
- **Structure:** a board with a 196px art band and a body. The art band shows the region's scene art under a darkening gradient (30% to 90%). At its top right it shows enemy faces (up to 72px, each with an enemy-ink health number), a 112px face, or a 72px tier-ringed icon. A seal straddles the band's lower edge.
- **Body** (padding 36/16/16): the title, then a kind line in the role colour (amber, crimson ink or a tier colour), then optional affixes (enemy-ink, dotted underline), then text clamped to 3 or 4 lines with the full text in a tooltip, then a foot with price and action pinned to the bottom.
- **Row behaviour:** postings share subgrid rows, so every seal and title in a row lines up.

### Tooltip
Nav Ink with an Edge border, 6px corners, 280px max width and the float shadow. It has a bold 12.5px name over Mist text. Anything with `cursor: help` opens one.

### Fusion moment
An overlay below the nav covers the stage with an 82% scrim and a 2px blur. A board card (520px) holds a 300x120 stage. There, the two 96px tier-ringed augment icons slide together and shrink out (1.1s, `cubic-bezier(.16,1,.3,1)`), and the result scales in (0.6s, after 1s). The card names the result and its two sources in their tier colours. When it closes, the new augment's row in the team list lights up with the prismatic pulse. Under reduced motion every animation collapses to an instant.

## Do's and Don'ts

### Do:
- **Do** put new game surfaces on the fixed 1100x800 stage, scaled to fit at no more than 1, with blurred scene art in the letterbox and a stacked, scrolling layout below 760px.
- **Do** build every panel as a board: the 155deg slate gradient, a 1px #465964 edge, 9px corners and the inset highlight.
- **Do** use the hub button with its 3px bottom bar for every action. The amber bar marks the primary action.
- **Do** keep amber for the player's progress and primary actions, crimson for bosses, elites and danger, and the tier colours for augments only.
- **Do** list things inside a board as rows with hairline dividers. Show selection with a warm tint and an amber ring on the portrait.
- **Do** keep the Tower's `--tw-*` values in step with the hub's `--arena-*` and its hard-coded nav and button values.
- **Do** use tabular figures for every number that changes.

### Don't:
- **Don't** nest a bordered card inside a board. Use a row.
- **Don't** mark selection or a category with a coloured side stripe on a row or card.
- **Don't** add ornament beyond kanji seals. Functional icons are 2.2px-stroke line SVGs.
- **Don't** set Latin text in Noto Serif JP, and don't swap Libre Franklin for a system display face.
- **Don't** let the desktop stage scroll the page or scale above 1.
- **Don't** bring the legacy parchment values (`--na-*` in `style.css`, which `game-surfaces.css` overrides) or the public site's `brand.css` tokens onto slate boards.
