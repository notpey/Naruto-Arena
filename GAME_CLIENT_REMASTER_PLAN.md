# Naruto-Arena Game Client Remaster Plan

Audit date: 2026-06-29

This is a planning document only. It does not implement the upscale and does not require changing gameplay, battle logic, selection logic, character data, popup behavior, or the current fixed-size layout.

## Scope

Audited files directly involved in the current game client:

| File | Role |
| --- | --- |
| `selection.html` | Character/team selection screen markup. Uses `.background` stage and selection/client assets. |
| `ingame.html` | Battle screen markup. Uses `.backgroundingame` stage and battle HUD/assets. |
| `style.css` | Shared selection and in-game CSS. Owns fixed stage sizes, absolute positioning, image slots, scroll panels, and overlays. |
| `script.js` | Selection and in-game client behavior. Updates selected characters, skill images, battle state, targeting, tooltips, queues, overlays, and matchmaking. |
| `characters.js` | Supplies character portraits and skill image URLs used by selection and battle views. Do not alter for the remaster layout. |
| `nav.js` | Public-site top-nav Start Playing popup. Currently opens `selection.html` at `770x560`. |
| `index.js` | Hero/nav Play Now popup handler. Currently opens `selection.html`/`selection-login.html` around a `760x580` inner target. |

## Current Dimensions

Primary fixed stages:

| Area | Selector/file | Current size | Notes |
| --- | --- | ---: | --- |
| Selection stage | `style.css` `.background` | `770x560` | Uses `selectionbg.png` as a fixed background image. |
| In-game stage | `style.css` `.backgroundingame` | `770x560` | Uses `ingamebg.png` as a fixed background image. |
| Site nav popup | `nav.js` | `770x560` | `window.open(..., "width=770,height=560,...")`. |
| Site hero popup | `index.js` | `760x580` inner target | Computes outer popup size from browser chrome. |

Major fixed regions and slots:

| Area | Selector | Current size/position | Notes |
| --- | --- | --- | --- |
| Selection roster panel | `.selectionpage` | `697x222`, `left: 7%`, `top: 56.5%` | Background asset is actually `697x222`. |
| Selection roster slots | `.slot-list`, `.slot-item` | `7 x 50px` columns, `50x50` slots | Uses relative offsets inside selection panel. |
| Selected team slots | `.selected-character-slot` | `50x50` | Three slots in a fixed-position list. |
| Selection player card avatar | `.player-avatar` | `75x75` | Player card is positioned by percentage/bottom offsets. |
| Selection buttons | `.game-button img` | `192x57`; logout `118x57` | Raster button images with text baked in. |
| Selection skill viewer | `.skillpage` | `530x222` CSS slot | Uses `skillpage.png`, but the asset is `697x222`; current CSS crops/uses a smaller slot. |
| Selection character portrait | `.character-portrait` | `75x75` | Dynamic character image slot. |
| Selection skill icons | `.skill-image` | `75x75` | Dynamic skill image slots. |
| Searching/private overlays | `.searching-backdrop`, `.private-match-backdrop` | `770x560` | Overlay size is tied to the old stage. |
| Modal scroll panels | `.searchingscroll`, `.private-match-modal` | `391x290` | Uses `searchingscroll.png`. |
| In-game HUD timer | `.timer-track`, `.timer-bar` | `191x10` | `script.js` also uses timer width constants. |
| In-game character face | `.character-face` | `75x75` | Battle target overlay also assumes `75x75`. |
| In-game health bar | `.health-bar-container` | `75x13` | Health text/bar placed below face. |
| In-game skill scroll | `.skillscrollingame` | `381x79` | Uses `ingameskillscroll.png`; skill icons inside are `54x54`. |
| In-game skill icons | `.skillimage` | `54x54` | Queue animation calculates pixel deltas with `getBoundingClientRect()`. |
| In-game skill info panel | `.skillinformation` | `523x134`, `left: 247px`, `top: 426px` | Uses `ingamebottomscroll.png`. |
| In-game skill preview | `.skillviewimage` | `75x75` | Dynamic skill image slot. |
| Surrender/options buttons | `.surrenderbutton`, `.sound` | `182x46` | Use `optionscroll.png`. |
| Chakra/end-turn panels | `.endturnscroll`, `.exchange_chakra`, `.class-choice-popup-panel` | `391x290`-style panels | Most internal controls are absolute-positioned. |
| Battle end scroll | `.battle-end-panel` | `640x320` CSS, asset `endscroll.png` is `642x322` | Existing CSS scales/contains the asset. |
| Battle end portrait | `.battle-end-portrait` | `236x226` | Uses `lose.png`. |

CSS fixed-size risk summary from `style.css`:

| Metric | Count |
| --- | ---: |
| `position: absolute` occurrences | 63 |
| `position: fixed` occurrences | 4 |
| fixed `width`/`height` pixel declarations | 154 |
| transform/translate/scale usage | 26 |
| image `url(...)` references | 21 |

## Asset Inventory

Local and remote raster assets referenced by `selection.html`, `ingame.html`, and `style.css`:

| Asset | Current dimensions | Used by | Apparent role | Remaster recommendation |
| --- | ---: | --- | --- | --- |
| `selectionbg.png` | `770x560` | `style.css` `.background` | Selection full-stage background | Recreate at `1280x800` if full-window composition, or `1100x800` if centered playable stage. Do not browser-scale as final. |
| `ingamebg.png` | `770x560` | `style.css` `.backgroundingame` | Battle full-stage background | Recreate at `1280x800` or `1100x800`; likely needs redesigned side space. |
| `selectionpage.png` | `697x222` | `.selectionpage` | Selection roster/frame panel | Recreate as an intentional wide roster panel; candidate `996x317` proportional or cleaner `1000x320`. |
| `skillpage.png` | `697x222` asset, `530x222` CSS slot | `.skillpage` | Selection skill-detail panel/frame | Recreate for the final layout rather than scaling/cropping. Candidate `760x317` proportional to current CSS slot, or cleaner `760x320`. |
| `selectionscroll.png` | `46x239` | `.selectionscroll`, CSS | Vertical scroll decoration | Recreate if retained; proportional target about `66x341`, but a cleaner frame should be designed with the new roster panel. |
| `skillscroll.png` | `46x239` | `selection.html` `.skillscroll` | Selection skill viewer scroll decoration | Same as `selectionscroll.png`; likely combine into a reusable remaster frame asset. |
| `loginscroll.png` | `391x290` | login panel CSS | Login panel/frame | Recreate at about `559x414` if proportional; consider cleaner `560x416`. |
| `searchingscroll.png` | `391x290` | search/private/end-turn/exchange panels | Modal scroll/panel | Recreate as a shared modal panel slot, likely `560x416`. |
| `ingameskillscroll.png` | `381x79` | `.skillscrollingame` | Battle skill row/frame | Recreate around the final icon size. If skill icons become `96x96`, this panel should be redesigned rather than proportional `544x113`. |
| `ingamebottomscroll.png` | `523x134` | `.skillinformation` | Battle skill info bottom panel | Recreate as a larger readable panel. Candidate proportional `747x191`, or cleaner `760x200`. |
| `ingamescrollbehind.png` | `25x88` | battle skill holder | Behind/edge decoration | Recreate only if the remastered battle skill row still needs it; otherwise fold into the skill-row frame. |
| `optionscroll.png` | `182x46` | surrender/sound buttons | Small button/frame | Recreate as clean `260x66` proportional or intentional `280x72`. |
| `endscroll.png` | `642x322` | battle end panel | End-of-battle scroll panel | Existing asset is close to CSS slot. Recreate at `920x460` proportional or an intentional `900x460`. |
| `surrenderimage.png` | `192x125` | surrender confirmation | Rectangular preview art | Recreate/replace at `274x179` proportional or cleaner `320x180`/`384x216`. |
| `sasukesearch.png` | `192x125` | matchmaking/searching panel | Rectangular illustration | Recreate/replace at `320x180` or `384x216`; current asset will blur if scaled. |
| `ladderbutton.png` | `192x57` | selection ladder button | Text button | Recreate as vector/CSS text button or high-res raster. Candidate `280x80` or `320x88`. |
| `quickbutton.png` | `192x57` | selection quick button | Text button | Same as `ladderbutton.png`. |
| `privatebutton.png` | `192x57` | selection private button | Text button | Same as `ladderbutton.png`. |
| `logout.png` | `118x57` | selection logout button | Text button | Recreate as text/CSS button or high-res raster; do not stretch. |
| `nextpage.png` | `41x44` | selection pagination arrows | Arrow icon/button | Recreate as vector/CSS or high-res `64x64`/`72x72` icon. |
| `avatar.jpg` | missing locally | selection player avatar | Player avatar placeholder | Replace with real avatar asset or dynamic profile avatar slot. Use `120x120` or `128x128` target. |
| `avatar-left.jpg` | missing locally | in-game player avatar | Player avatar placeholder | Same as `avatar.jpg`; currently missing in repo. |
| `avatar-right.jpg` | missing locally | in-game opponent avatar | Player avatar placeholder | Same as `avatar.jpg`; currently missing in repo. |
| `render.png` | `153x382` | bottom render | Decorative character render | Needs intentional high-res replacement if kept. Current CSS uses `153x149`/auto variants in places. |
| `lose.png` | `236x226` | battle end portrait | Defeat portrait | Recreate/replace if displayed in remaster; target around `337x323` proportional or cleaner `320x320`. |
| `cursor.png` | `50x50` | global cursor | Cursor | Can remain if desired; consider native cursor or high-DPI variants. |
| `cursor_click.png` | `50x50` | active cursor | Cursor | Same as `cursor.png`. |
| `sharingan.png` | `64x64` | matchmaking spinner | Spinner/icon | Recreate only if keeping the spinner. Target `96x96` or `100x100`. |
| `skillqqueue.png` | `56x56` | battle queue marker | Queue icon | Recreate for the final skill icon slot, likely `96x96`/`100x100`/`128x128`. |
| `hats/academy.png` | `110x139` | rank hat | Rank badge/hat | Should be checked visually at new character portrait sizes; may need high-DPI remake. |
| `hats/hokage.png` | `110x139` | rank hat | Rank badge/hat | Same as academy hat. |
| `hats/sannin.png` | `110x139` | rank hat | Rank badge/hat | Same as academy hat. |
| `https://i.imgur.com/B52DL1t.png` | remote | battle character face placeholder | Character portrait placeholder | Replace with real character images from character data; final slot should use consistent portrait sizing. |
| `https://i.imgur.com/Uy1TKG3.png` | remote | battle skill/tooltip placeholder | Skill icon placeholder | Replace with dynamic skill data; final slot should use consistent icon sizing. |
| `https://i.imgur.com/thNhBRH.png` | remote | battle skill info image | Skill preview placeholder | Replace with dynamic skill data; final slot should match remaster skill preview sizing. |

Character and skill images from `characters.js` are mostly remote URLs and should be treated as content assets, not layout chrome. The remaster should define slots for them instead of hardcoding old `75x75` and `54x54` assumptions.

## Proposed Remaster Size Guide

Reference scale:

- Current stage: `770x560`
- Target full window: `1280x800`
- Height scale factor: `800 / 560 = 1.428571`
- Proportional stage from old height: `1100x800`
- Extra horizontal room in `1280x800`: `180px` total, `90px` per side

Recommended stage strategy:

| Layer | Target | Rationale |
| --- | ---: | --- |
| Full game window | `1280x800` | Matches desired popup/client size and allows side frame space. |
| Playable stage option | `1100x800` centered | Preserves original 770:560 proportions without blind stretching to 1280 width. |
| Side frame gutters | `90px` left/right | Useful for decorative frame, account info, or non-critical ambience. |
| Full-window background | `1280x800` | Should be painted/composited intentionally, not stretched from `770x560`. |

Recommended asset slots:

| Asset type | Current examples | Proportional target | Recommended intentional target |
| --- | --- | ---: | ---: |
| Full stage backgrounds | `770x560` | `1100x800` | `1280x800` full background plus optional `1100x800` playable-stage art |
| Modal/scroll panels | `391x290` | `559x414` | `560x416` |
| Large roster/frame panels | `697x222` | `996x317` | `1000x320`, or layout-specific `1040x320` |
| Battle skill info panel | `523x134` | `747x191` | `760x200` |
| Battle skill row panel | `381x79` | `544x113` | Size around icon slots, e.g. `600x128` if icons are `96x96` |
| Wide text buttons | `192x57` | `274x81` | `280x80` or `320x88` |
| Small option buttons | `182x46` | `260x66` | `280x72` |
| Character portraits | `75x75` | `107x107` | `120x120` or `128x128` |
| Selection skill icons | `75x75` | `107x107` | `100x100`, `120x120`, or `128x128` |
| In-game skill icons | `54x54` | `77x77` | `96x96` or `100x100` for readability |
| Status/chakra icons | `8x8`, `16x16` | `11x11`, `23x23` | `24x24`, `32x32`, or `40x40` depending on use |
| Rectangular illustration art | `192x125` | `274x179` | `320x180` or `384x216` |
| Pagination/arrow icons | `41x44` | `59x63` | `64x64` or vector/SVG/CSS icon |

Use exact proportional sizes for large painted backgrounds only when preserving the old composition is the goal. Use clean intentional sizes for buttons, character slots, skill icons, status icons, and text-bearing UI, because awkward mathematical sizes will make the remaster harder to maintain.

## Layout Risks

High-risk areas:

- `style.css` is heavily pixel-based: 154 fixed width/height declarations and 63 absolute-position uses.
- `.background` and `.backgroundingame` are hardcoded to `770x560`.
- Overlay backdrops are also hardcoded to `770x560`, so modals will not cover a larger client without explicit remaster rules.
- Many UI pieces use raster images as layout containers: scroll panels, button images, roster frame, skill frame, bottom skill info frame.
- Several assets contain baked-in text (`ladderbutton.png`, `quickbutton.png`, `privatebutton.png`, `logout.png`). These should be recreated or replaced with styled text buttons.
- `script.js` uses DOM geometry for interactions and animation:
  - `getBoundingClientRect()` for skill queue animation.
  - `style.transform = translate(...)` to move selected skill icons to the queue slot.
  - timer width updates using a fixed maximum width.
  - tooltip placement based on `clientX`, `clientY`, `window.innerWidth`, and element rects.
  - dynamic health bar width updates.
- Target overlays assume the current `75x75` character face box.
- Character/skill slots are mixed between `75x75` in selection, `75x75` face slots in battle, and `54x54` battle skill icons.
- Popup sizing is split between `nav.js` and `index.js`, so a remaster must update both paths together.
- `avatar.jpg`, `avatar-left.jpg`, and `avatar-right.jpg` are referenced but missing locally.
- Some current CSS uses transforms/collapsed states calibrated to old dimensions, such as `.skillviewer.collapsed`.

## Recommended Phased Implementation

1. Documentation and asset bible
   - Keep this file as the current source of truth.
   - Confirm the final art direction: `1280x800` full composition vs. `1100x800` centered stage inside a `1280x800` window.

2. Introduce dimension variables without visual changes
   - Added CSS variables for current dimensions: `--game-current-w: 770px`, `--game-current-h: 560px`, plus live aliases `--game-stage-w` and `--game-stage-h`.
   - Added inactive future target variables for `1280x800`, `1100x800`, and `90px` side gutters.
   - Added background image variables for `selectionbg.png` and `ingamebg.png`.
   - Tokenized only full-stage/full-overlay dimensions while preserving rendered output.
   - The live aliases still point to the current `770x560` client; no visual upscale has been implemented.

3. Add a remaster class/flag
   - Added a disabled-by-default `.game-remaster` CSS class.
   - The class retargets `--game-stage-w` and `--game-stage-h` to the future `1100x800` stage variables only when manually applied.
   - The class is not applied in `selection.html` or `ingame.html`, so the current client remains the default until QA is complete.
   - No selection or in-game layout repositioning has been implemented yet.

4. Replace major background and frame assets
   - Create `1280x800` full backgrounds and/or `1100x800` stage backgrounds.
   - Recreate modal scroll panels, roster frame, skill frame, bottom skill info frame, and battle skill row.
   - Replace text-bearing button images with CSS text buttons or high-res raster buttons.

5. Remaster selection screen layout
   - Reposition roster grid, player card, selected team slots, matchmaking/private overlays, and skill detail panel.
   - Decide final character/skill icon slot size and update CSS slots only behind the remaster flag.
   - Keep selection behavior and team data untouched.

6. Remaster in-game battle layout
   - Reposition HUD, player/enemy cards, skill rows, target overlays, skill info panel, surrender/sound controls, chakra modals, class-choice popups, and battle-end overlay.
   - Update CSS geometry first, then audit `script.js` geometry uses for compatibility.
   - Keep battle logic and skill behavior untouched.

7. Update popup sizing
   - After the remaster layout is ready, update `nav.js` and `index.js` popup dimensions together.
   - Target `1280x800` inner content where feasible; account for browser chrome consistently.
   - Do not change popup dimensions before the layout is ready.

8. QA pass
   - Selection: login, character search/list, drag/drop selected characters, skill preview, matchmaking, private match modal, cancel flows.
   - Battle: skill targeting, class-choice popup, chakra exchange/end turn, cooldown badges, target overlays, skill queue animation, health bars, surrender flow, battle-end overlay.
   - Visual: no blurry text-bearing assets, no stretched panels, readable skill descriptions, no cropped click targets.

## Safe Verification Performed During Audit

- Read `selection.html`, `ingame.html`, `style.css`, `script.js`, `nav.js`, and `index.js`.
- Extracted asset references from `selection.html`, `ingame.html`, and `style.css`.
- Detected local image dimensions with a read-only Node script.
- Counted fixed-size/absolute-positioning patterns in `style.css`.
- No image files were modified.
- No gameplay, layout, popup, battle, selection, auth, database, routing, ladder, mission, or website shell implementation changes were made.

## Phase 2 Implementation Note

Completed on 2026-06-29:

- `style.css` now has a labeled game-client dimension token block.
- Live stage aliases remain `--game-stage-w: var(--game-current-w)` and `--game-stage-h: var(--game-current-h)`, so the rendered selection and battle stages remain `770x560`.
- Future remaster target variables exist for `1280x800`, `1100x800`, and `90px` side gutters, but they are not active.
- Only the safest full-stage/full-overlay dimensions were tokenized: `.background`, `.backgroundingame`, `.searching-backdrop`, and `.private-match-backdrop`.
- Selection and in-game background image references now use `--selection-bg-image` and `--ingame-bg-image`, pointing to the same current files.
- No popup sizing, gameplay logic, battle logic, selection behavior, character data, or game-client layout positioning was changed.

## Phase 3 Implementation Note

Completed on 2026-06-29:

- `style.css` now defines a disabled opt-in `.game-remaster` class.
- `.game-remaster` changes only the stage dimension aliases:
  - `--game-stage-w: var(--game-remaster-stage-w)`
  - `--game-stage-h: var(--game-remaster-stage-h)`
- The class is not applied by default in `selection.html` or `ingame.html`; live rendering remains `770x560`.
- No remaster layout repositioning, panel resizing, popup sizing, game behavior, targeting, animation, or battle logic changes were made.
- Future selection and in-game remaster layout rules should be added behind `.game-remaster` in later phases.

## Phase 4A Asset Slot Note

Completed on 2026-06-29:

- `style.css` now defines future-facing remaster asset variables. These files may not exist yet and are not used by default live selectors:

| CSS variable | Proposed file | Recommended export size |
| --- | --- | ---: |
| `--selection-bg-remaster-image` | `selectionbg-remaster.png` | `1280x800` full window or `1100x800` centered stage background |
| `--ingame-bg-remaster-image` | `ingamebg-remaster.png` | `1280x800` full window or `1100x800` centered stage background |
| `--selection-panel-remaster-image` | `selectionpage-remaster.png` | `1000x320` |
| `--selection-skill-panel-remaster-image` | `skillpage-remaster.png` | `760x320` |
| `--modal-panel-remaster-image` | `searchingscroll-remaster.png` | `560x416` |
| `--battle-skill-row-remaster-image` | `ingameskillscroll-remaster.png` | `600x128` |
| `--battle-skill-info-remaster-image` | `ingamebottomscroll-remaster.png` | `760x200` |
| `--battle-end-panel-remaster-image` | `endscroll-remaster.png` | `900x460` |

- `style.css` also defines future size tokens for major remaster slots:
  - `--selection-panel-remaster-w/h`
  - `--selection-skill-panel-remaster-w/h`
  - `--modal-panel-remaster-w/h`
  - `--battle-skill-row-remaster-w/h`
  - `--battle-skill-info-remaster-w/h`
  - `--battle-end-panel-remaster-w/h`
  - `--remaster-wide-button-w/h`
  - `--remaster-small-button-w/h`
  - `--remaster-character-face`
  - `--remaster-skill-icon`
- No live/default selectors use the missing remaster asset filenames.
- No image files were replaced, no UI was repositioned, and `.game-remaster` remains opt-in only.

Photoshop/export checklist:

- Export remaster backgrounds at the chosen target size before wiring them into scoped CSS.
- Keep exported filenames matching the CSS variables above, or update the variables before use.
- Avoid baked-in button text where CSS text buttons are planned.
- Preserve transparent areas for frames, scroll panels, and buttons that need to layer over the game background.
- Export UI frames/buttons as PNG when transparency is required.
- Export painted full backgrounds as JPG or PNG depending on quality and file-size needs.
- Do not overwrite legacy assets until the remaster layout is ready and QA-approved.

## Phase 4B Remaster Asset Intake Note

Completed on 2026-06-29:

- Remaster PNG assets were detected and dimension-audited.
- `style.css` remaster variables now point to the real remaster filenames.
- `.game-remaster` scoped swaps were added only for the two full-stage backgrounds, because `selectionbg-remaster.png` and `ingamebg-remaster.png` match the disabled `1100x800` remaster stage.
- Live/default selectors still use the legacy asset variables and remain `770x560`.
- Larger panel, button, icon, and modal assets were mapped as variables but not applied yet because they require the layout phase to avoid cropping or distortion.

| Remaster asset | Dimensions | Legacy asset | Legacy dimensions | Status |
| --- | ---: | --- | ---: | --- |
| `selectionbg-remaster.png` | `1100x800` | `selectionbg.png` | `770x560` | Wired behind `.game-remaster .background`. |
| `ingamebg-remaster.png` | `1100x800` | `ingamebg.png` | `770x560` | Wired behind `.game-remaster .backgroundingame`. |
| `selectionpage-remaster.png` | `997x317` | `selectionpage.png` | `697x222` | Mapped only; requires selection layout phase. Legacy file is JPEG-encoded despite `.png` extension. |
| `skillpage-remaster.png` | `997x317` | `skillpage.png` | `697x222` | Mapped only; requires selection skill-panel layout phase. Legacy file is JPEG-encoded despite `.png` extension. |
| `searchingscroll-remaster.png` | `559x415` | `searchingscroll.png` | `391x290` | Mapped only; modal layout phase required. |
| `loginscroll-remaster.png` | `559x415` | `loginscroll.png` | `391x290` | Mapped only; login/modal layout phase required. |
| `ingameskillscroll-remaster.png` | `545x113` | `ingameskillscroll.png` | `381x79` | Mapped only; battle skill-row layout phase required. |
| `ingamebottomscroll-remaster.png` | `748x192` | `ingamebottomscroll.png` | `523x134` | Mapped only; battle skill-info layout phase required. |
| `endscroll-remaster.png` | `918x460` | `endscroll.png` | `642x322` | Mapped only; battle-end overlay layout phase required. |
| `selectionscroll-remaster.png` | `66x342` | `selectionscroll.png` | `46x239` | Mapped only; selection frame layout phase required. |
| `skillscroll-remaster.png` | `66x342` | `skillscroll.png` | `46x239` | Mapped only; selection skill-frame layout phase required. |
| `ingamescrollbehind-remaster.png` | `36x126` | `ingamescrollbehind.png` | `25x88` | Mapped only; battle skill-row layout phase required. |
| `optionscroll-remaster.png` | `260x66` | `optionscroll.png` | `182x46` | Mapped only; option/surrender layout phase required. |
| `ladderbutton-remaster.png` | `275x82` | `ladderbutton.png` | `192x57` | Mapped only; text/button layout phase required. |
| `quickbutton-remaster.png` | `275x82` | `quickbutton.png` | `192x57` | Mapped only; text/button layout phase required. |
| `privatebutton-remaster.png` | `275x82` | `privatebutton.png` | `192x57` | Mapped only; text/button layout phase required. |
| `logout-remaster.png` | `169x82` | `logout.png` | `118x57` | Mapped only; button layout phase required. |
| `nextpage-remaster.png` | `59x63` | `nextpage.png` | `41x44` | Mapped only; pagination layout phase required. |
| `sasukesearch-remaster.png` | `275x179` | `sasukesearch.png` | `192x125` | Mapped only; matchmaking modal layout phase required. |
| `surrenderimage-remaster.png` | `275x179` | `surrenderimage.png` | `192x125` | Mapped only; surrender modal layout phase required. |
| `render-remaster.png` | `219x546` | `render.png` | `153x382` | Mapped only; battle render layout phase required. |
| `win-remaster.png` | `337x323` | `win.png` | `236x226` | Mapped only; battle-end layout phase required. |
| `lose-remaster.png` | `337x323` | `lose.png` | `236x226` | Mapped only; battle-end layout phase required. |
| `deadcharacter-remaster.png` | `107x107` | `deadcharacter.png` | `75x75` | Mapped only; character/avatar slot layout phase required. |
| `found-remaster.png` | `92x92` | `found.png` | `64x64` | Mapped only; status/search layout phase required. |
| `loading-remaster.png` | `50x50` | `loading.png` | `35x35` | Mapped only; loading-state layout phase required. |
| `sharingan-remaster.png` | `92x92` | `sharingan.png` | `64x64` | Mapped only; matchmaking spinner layout phase required. |
| `skillqqueue-remaster.png` | `80x80` | `skillqqueue.png` | `56x56` | Mapped only; battle queue layout phase required. |

Additional `style.css` variables added in Phase 4B:

- `--login-panel-remaster-image`
- `--selection-scroll-remaster-image`
- `--skill-scroll-remaster-image`
- `--battle-scroll-behind-remaster-image`
- `--options-button-remaster-image`
- `--ladder-button-remaster-image`
- `--quick-button-remaster-image`
- `--private-button-remaster-image`
- `--logout-button-remaster-image`
- `--next-page-remaster-image`
- `--search-art-remaster-image`
- `--surrender-art-remaster-image`
- `--render-remaster-image`
- `--win-remaster-image`
- `--lose-remaster-image`
- `--dead-character-remaster-image`
- `--found-remaster-image`
- `--loading-remaster-image`
- `--sharingan-remaster-image`
- `--skill-queue-remaster-image`

Filename notes:

- `skillqqueue-remaster.png` intentionally preserves the legacy spelling from `skillqqueue.png`.
- `selectionpage.png` and `skillpage.png` are JPEG-encoded files with `.png` extensions. The remaster replacements are true PNG files.

## Phase 5A Selection Remaster Layout Note

Completed on 2026-06-29:

- Added `.game-remaster`-scoped selection-screen layout scaffolding in `style.css`.
- `.game-remaster` remains disabled by default and is not applied in `selection.html`.
- Live selection layout remains `770x560`; no popup sizing or JavaScript behavior changed.
- Battle screen layout was not changed in this phase.

Selection elements with remaster-scoped CSS:

| Element | Remaster asset/size | Position/notes |
| --- | --- | --- |
| `.background` | `selectionbg-remaster.png`, `1100x800` | Uses the existing remaster stage variables only under `.game-remaster`. |
| `.selectionpage` | `selectionpage-remaster.png`, `997x317` | Positioned at `left: 52px`, `top: 448px` in the `1100x800` stage. |
| `.selectionscroll` | `selectionscroll-remaster.png`, `66x342` | Positioned to align with the larger roster panel. |
| `.slot-list` / `.slot-item` | `72x72` roster slots, 7 columns | Increased spacing and slot size under `.game-remaster` only. |
| `.selected-character-slot-list` / `.selected-character-slot` | `75x75` selected-team slots | Repositioned inside the remaster roster area with larger readable slots. |
| `.player-card` / `.player-avatar` | avatar `107x107` | Repositioned above the roster panel for the remaster stage. |
| `.skillviewer`, `.skillpage`, `.skillscroll` | `skillpage-remaster.png` `997x317`, `skillscroll-remaster.png` `66x342` | Remaster skill/detail panel is positioned above the roster panel. |
| `.character-portrait`, `.skill-image` | `107x107` | Larger preview slots for remaster testing. |
| `.button-container`, `.game-button img` | `275x82` game buttons, `169x82` logout | Remaster button assets are wired under `.game-remaster`; click handlers remain unchanged. |
| `.nextpage`, `.lastpage` | `nextpage-remaster.png`, `59x63` | Remaster pagination art is wired under `.game-remaster`. |
| `.searchingscroll`, `.private-match-modal` | `searchingscroll-remaster.png`, `559x415` | Shells only; internal modal layout is deferred. |
| `.sasukesearch`, `.sharingan` | `275x179`, `92x92` | Remaster search art/spinner are wired under `.game-remaster`. |

## Phase 5B Selection Remaster Layout Tuning Note

Completed on 2026-06-29:

- Tuned only `.game-remaster` selection-screen CSS in `style.css`.
- `.game-remaster` remains disabled by default and is not applied in `selection.html`.
- Live selection layout remains `770x560`; no popup/window sizing or JavaScript behavior changed.
- Battle screen layout was not changed in this phase.

Selection remaster adjustments:

| Area | Phase 5B adjustment |
| --- | --- |
| Profile/account information | Moved the player card higher and to the upper-right of the remaster stage so avatar, username, rank/title, ladder rank, and ratio remain readable without competing with the game-mode buttons. |
| Game-mode buttons | Repositioned the logout, ladder, quick, and private buttons into a single clean row above the roster panel using the remaster button sizes. The row now starts inside the stage instead of clipping the logout button. |
| Roster panel layering | Set the roster scroll behind the main roster panel and raised roster slots/selected slots above the panel with explicit `.game-remaster` z-indexes. |
| Page arrows | Restored visible previous/next page arrow positions inside the remaster roster panel using the `59x63` remaster arrow asset. |
| Character info / skill popout | Reworked remaster-only spacing for the skill card, portrait, skill icons, title bar, energy row, and description so the `107x107` images align cleanly and text wraps inside the panel. |

## Phase 5C Selection Remaster Layout Tuning Note

Completed on 2026-06-29:

- Tuned only `.game-remaster` selection-screen CSS in `style.css`.
- `.game-remaster` remains disabled by default and is not applied in `selection.html`.
- Live selection layout remains `770x560`; no popup/window sizing or JavaScript behavior changed.
- Battle screen layout was not changed in this phase.

Selection remaster adjustments:

| Area | Phase 5C adjustment |
| --- | --- |
| Profile/account information | Moved the player card into the right side of the roster panel, below the button row and visually tied to the selected-team area. The avatar was reduced slightly to `96x96` to keep the full player text stack readable in the reserved zone. |
| Selected-team space | Kept selected slots at `75x75` and positioned them below the player card in the right-side zone so they no longer compete with the main roster grid. |
| Roster grid | Reduced roster slots from `72x72` to `68x68`, tightened gaps from `14px` to `10px`, and moved the grid left to create player/team breathing room. |
| Page arrows | Scaled arrows down to `44x47` and tucked them into the roster panel edges so pagination remains visible without taking over the composition. |
| Roster scroll | Kept the Phase 5B integrated layering: scroll decoration behind the roster panel, slots and selected slots above it. |

## Phase 5D Selection Remaster Right-Side Panel Note

Completed on 2026-06-29:

- Tuned only `.game-remaster` selection-screen CSS in `style.css`.
- `.game-remaster` remains disabled by default and is not applied in `selection.html`.
- Live selection layout remains `770x560`; no popup/window sizing or JavaScript behavior changed.
- Battle screen layout was not changed in this phase.

Right-side player/team panel adjustments:

| Area | Phase 5D adjustment |
| --- | --- |
| Player info containment | Added a warm parchment command-card treatment to the existing player card with a subtle border, crimson left accent, inset highlight, and shadow. |
| Player info hierarchy | Anchored the avatar inside the card, made the username stronger, tightened the stat stack, and added subtle row dividers for rank/clan/level/ladder/ratio readability without changing the rendered data. |
| Selected-team frame | Added a matching framed selected-team box around the existing selected slots and used a CSS-only `YOUR TEAM` pseudo-label. Slots remain `75x75`. |
| Roster/right-panel spacing | Kept the compact left-biased roster grid from Phase 5C and aligned the right-side card/slot frame as a single control area. |
| Markup limitation | The `YOUR TEAM` label is visual-only CSS. A semantic label or richer controls would require a tiny future `selection.html` markup change. |

Deferred to Phase 5E:

- Manual `.game-remaster` QA for long usernames, long clan names, and high ladder/ratio values inside the compact right-side cluster.
- Manual pagination testing with every roster page populated.
- Fine-tuning matchmaking/private modal internals after the selection composition is stable.
- Consider tiny semantic HTML only if the reference support text/labels need to be added later and `selection.html` becomes allowed.
- Converting text-bearing button rasters to CSS text buttons remains deferred; Phase 5A-5D only use the supplied remaster rasters.
- Any battle HUD, battle skill row, target overlay, timer, health bar, skill information, chakra/end-turn, or battle-end layout work remains deferred to the battle remaster phase.

## Selection Remaster Hard Correction Note

Completed on 2026-06-29:

- Tuned only `.game-remaster` selection-screen CSS in `style.css`.
- `.game-remaster` remains disabled by default and is not applied in `selection.html`.
- Live selection layout remains `770x560`; no popup/window sizing or JavaScript behavior changed.
- Battle screen layout was not changed in this correction.

Reference-matching corrections:

| Area | Correction |
| --- | --- |
| Right-side treatment | Removed the Phase 5D modern card feel: no parchment box, no crimson card stripe, no row-divider stat treatment, and no framed selected-team module. |
| Player info | Returned the player area to a compact upper-right cluster with a small `82x82` avatar and tight text stack beside it, closer to the reference screenshot. |
| Selected team | Removed the CSS-only `YOUR TEAM` label and large frame; selected portraits are now a tight `64x64` row beneath the player cluster. |
| Roster density | Tightened roster slots to `64x64` with `11px` gaps and shifted the grid left to reduce empty space while preserving click targets. |
| Arrows | Reduced arrows to `39x42` and tucked them closer to the roster panel edges. |
| Markup limitation | The reference "ready to start a game" / team-manager text is not present in the current DOM. It was not recreated with CSS or markup in this pass. |

## Selection Remaster Reference Coordinate Correction

Completed on 2026-06-29:

- Tuned only `.game-remaster` selection-screen CSS in `style.css`.
- `.game-remaster` remains disabled by default and is not applied in `selection.html`.
- Live selection layout remains `770x560`; no popup/window sizing or JavaScript behavior changed.

Reference-coordinate adjustments:

| Area | Correction |
| --- | --- |
| Roster grid | Moved the grid to `left: 60px`, `top: 19px` with `64x64` slots and `11px` gaps to match the crop's dense three-row layout. |
| Player cluster | Moved the cluster to `left: 636px`, `top: 12px`, with an `84x84` avatar and a tight text stack immediately to its right. |
| Selected team | Anchored selected portraits at `left: 704px`, `top: 166px`, directly beneath the player cluster as shown in the crop. |
| Arrows | Moved arrows to `left: 13px` and `left: 574px`, both at `top: 126px`, matching the panel-edge placement in the reference. |
| Scroll | Nudged the scroll slightly left/up so it remains integrated with the roster panel edge. |

## Selection Remaster Scaled-Live Layout Correction

Completed on 2026-06-29:

- Tuned only `.game-remaster` selection-screen CSS in `style.css`.
- `.game-remaster` remains disabled by default and is not applied in `selection.html`.
- Live selection layout remains `770x560`; no popup/window sizing or JavaScript behavior changed.

Scaled-live correction:

| Area | Correction |
| --- | --- |
| Scale source | Re-derived the remaster selection layout from the live `697x222` selection panel to the remaster `997x317` panel, using an approximate `1.43x` panel scale. |
| Roster grid | Restored scaled live values: `50px` live slots become `72px`, `10px` live gaps become `14px`, and the list sits at `left: 55px`, `top: 36px`. |
| Player cluster | Repositioned using the live player-card placement scaled to `left: 668px`, `top: 28px`, with a `107x107` avatar. |
| Selected team | Repositioned using the live selected-slot placement scaled to `left: 687px`, `top: 164px`, with `72x72` selected slots and `14px` gaps. |
| Arrows | Restored scaled live pagination placement: next at `left: 619px`, `top: 200px`; previous at `left: 0`, `top: 24px`; both `59x63`. |
| Panel and scroll | Restored scaled live stage placement for the roster panel and decorative scroll: panel at `left: 77px`, `top: 452px`; scroll at `left: 33px`, `top: 440px`. |

## Selection Remaster Right-Cluster Alignment Correction

Completed on 2026-06-29:

- Tuned only `.game-remaster` selection-screen CSS in `style.css`.
- Moved the player/profile cluster down to `top: 36px`, matching the roster grid's top line so profile text no longer sits above the intended upper boundary.
- Moved the selected-team row down to `top: 208px`, matching the roster grid's third-row band. With `72x72` slots, the selected-team row now bottom-aligns with the roster grid at `280px`.
- Left the scaled-live x positions, slot sizes, and remaster-disabled behavior unchanged.

## Selection Remaster Team Prompt Alignment Note

Completed on 2026-06-29:

- Tuned only `.game-remaster` selection-screen CSS in `style.css`.
- Aligned the selected-team row to `left: 668px`, matching the player avatar's left edge.
- Added a CSS-only helper prompt, `SELECT 3 CHARACTERS`, in the empty space between the profile cluster and selected-team row.
- The prompt is static because no JavaScript or selection logic was changed; dynamic "ready" text remains a future markup/logic follow-up if needed.

## Selection Remaster Right-Side Breathing Room Note

Completed on 2026-06-29:

- Tuned only `.game-remaster` selection-screen CSS in `style.css`.
- Expanded the right-side player/team group leftward to `left: 626px` so it uses more of the available panel space.
- Increased selected-team spacing to `22px` and widened the helper prompt to `310px`.
- Kept selected slots at `72x72`, preserving the scaled-live size while giving the cluster more breathing room.

## Selection Remaster Right-Lane Padding Correction

Completed on 2026-06-29:

- Tuned only `.game-remaster` selection-screen CSS in `style.css`.
- Corrected the prior over-shift left: the right-side player/team area now sits in the lane between the roster grid and the panel's right edge.
- Player info starts at `left: 665px`, leaving clear padding from the roster grid, which ends around `643px`.
- Selected-team portraits start at `left: 690px`, centered in the remaining right-side space with `22px` gaps.
- The `SELECT 3 CHARACTERS` prompt remains centered above the selected-team row.

## Selection Remaster Avatar/Team Left Alignment Note

Completed on 2026-06-29:

- Tuned only `.game-remaster` selection-screen CSS in `style.css`.
- Aligned the player avatar with the first selected-team portrait by moving `.player-card` to `left: 690px`.
- Reduced the player-card width to `300px` so the avatar/text cluster remains inside the right side of the roster panel.

## Selection Remaster Button Row Alignment Note

Completed on 2026-06-29:

- Tuned only `.game-remaster` selection-screen CSS in `style.css`.
- Aligned the logout/ladder/quick/private button row to the remaster roster panel width by setting the button container to `left: 0` and `width: var(--selection-panel-remaster-w)`.
- Replaced the fixed remaster gap with `justify-content: space-between` so the four button images fit inside the `997px` panel span without the private-game button clipping beyond the right edge.

## Selection Remaster Skill Panel Spacing Note

Completed on 2026-06-29:

- Tuned only `.game-remaster` selection-screen CSS in `style.css`.
- Moved the remaster skill/detail panel from `top: -360px` to `top: -430px`, placing its bottom above the game-mode button row instead of letting it clip behind the buttons.
- Kept the `997x317` remaster skill panel asset, but adjusted the inner skill card to better use the available width: `left: 56px`, `top: 28px`, `width: 890px`.
- Widened the character-name and skill-name text areas and gave the description a little more height while keeping the `107x107` portrait/skill images.

## Selection Remaster Skill Header Utilization Note

Completed on 2026-06-29:

- Tuned only `.game-remaster` selection-screen CSS in `style.css`.
- Fixed the awkward empty space in the skill panel by constraining the character-info column to `142px` instead of letting the character name reserve a `420px` flex column.
- Skill icons now begin immediately after the portrait/name column with an `18px` gap and can use up to `690px` of row width.
- The skill name line now has up to `700px` before the energy display, improving use of the lower text area without changing skill data or behavior.

## Selection Remaster Skill Scroll Gutter Note

Completed on 2026-06-29:

- Tuned only `.game-remaster` selection-screen CSS in `style.css`.
- Treated the green skill scroll as a decorative right border by reducing the skill-card readable width from `890px` to `820px`.
- Reduced skill-icon strip width, title width, description width, and footer width so energy/cooldown and long skill text stay clear of the scroll.
- The readable skill card now ends around `876px`, leaving a gutter before the scroll begins around `930px`.

## Phase 5E Selection Remaster Preview Toggle Note

Completed on 2026-06-29:

- Removed the inline Back to Site link from `selection.html`.
- Added a temporary `Remaster Mode` testing toggle to `selection.html`.
- The toggle adds/removes `.game-remaster` on `document.body` and persists the preview state in `localStorage` under `na-selection-remaster-preview`.
- First-time/default users still load the live `770x560` selection client because the preview key is absent by default.
- Added selection-page-only centering styles via `body.selection-client-page`, with a black page background around the fixed-size stage.
- Toggle changes try to resize and center the current popup/window to the active stage size: `770x560` for live mode, `1100x800` for remaster mode. Browser support for `resizeTo` / `moveTo` is best-effort and may be ignored outside popup windows.
- `nav.js` Start Playing popup sizing now reads the same preview key and opens `selection.html` for the active inner stage size, accounting for browser chrome where possible.
- `index.js` Play Now popup sizing now reads the same preview key when opening `selection.html`; the logged-out `selection-login.html` popup keeps its existing size.
- `ingame.html`, `script.js`, gameplay logic, battle UI, and character data remain untouched.

## Selection Screen Portrait Polish Note

Completed on 2026-06-29:

- Tuned only visual CSS in `style.css`; no selection behavior or character data changed.
- Darkened roster and selected-team portrait borders so faces read better against the patterned parchment panel.
- Added subtle drop shadows to roster portraits, selected-team portraits, and the player avatar so they stand off the background.
- Added lightweight hover polish for roster and selected-team slots: darker border, slightly stronger shadow, and a small `translateY(-1px)` lift.
- Added slightly stronger remaster-mode shadows for the larger `72px` slots and `107px` player avatar.

Manual testing note:

- To inspect the disabled selection remaster, temporarily add `game-remaster` to the selection page `body` or the `.background` stage wrapper in browser devtools.
- Do not commit `.game-remaster` into `selection.html` until the remaster layout is ready to become an opt-in or default client mode.

## Phase 6A In-Game Battle Remaster Scaffolding Note

Completed on 2026-06-29:

- Added `.game-remaster`-scoped in-game battle layout scaffolding in `style.css`.
- Added `body.ingame-client-page` centering rules (live and remaster modes) in `style.css`.
- Added a Remaster Mode testing toggle to `ingame.html` (body class, early localStorage script, toggle label, end-of-file script).
- The toggle shares the `na-selection-remaster-preview` localStorage key with the selection screen, so enabling remaster on either screen enables it on both.
- `.game-remaster` is not applied to `ingame.html` by default; live/default battle screen remains `770×560`.
- `script.js`, `nav.js`, `index.js`, `selection.html`, `characters.js`, and all gameplay/server files were not modified.
- Popup sizing was not changed.

### Battle elements that received `.game-remaster` CSS

| Element / area | Remaster treatment |
| --- | --- |
| `.backgroundingame` | Stage expands to `1100×800` via CSS variables (already wired in Phase 3); remaster background swaps via Phase 4B variable. |
| `.game-hud` | Padding scaled `14px 28px`; player-left repositioned at `left: 110px`. |
| `.player-avatar-left`, `.player-avatar-right` | Avatars scaled to `68×68`. |
| `.player-avatar-left` | Absolute position updated to `left: 180px`. |
| `.timer-track` / `.timer-bar` | Track scaled to `273×14px`; bar initial width matches. JS timer constant deferred to Phase 6B. |
| `.ingame-sound-controller` | Repositioned to `left: 57px, top: 686px`. |
| `.character-face` | Scaled to `107×107` (`--remaster-character-face`). |
| `.character-card` | Width `107px`, margin-left `46px`, margin-top `-40px`. |
| `.target-overlay` | Scaled to `107×107` to match remaster face slot. |
| `.health-bar-container` / `.health-bar` | Width `107px`, height `18px`. JS HP constant deferred to Phase 6B. |
| `.health-text` | Width and line-height updated to match container. |
| `.skilltooltips` / `.status-tooltip-content` | Left offset updated to `120px` to clear the larger face. |
| `.player-characters` | Gap scaled to `80px`. |
| `.enemy-characters` | Repositioned to `top: 131px, left: 944px`, gap `76px`. |
| `.skillholder` | Repositioned to `top: 27px, left: 71px`. |
| `.ingamescrollbehind` | Swapped to `ingamescrollbehind-remaster.png` (`36×126`). |
| `.skillscrollingame` | Swapped to `ingameskillscroll-remaster.png`, size `545×113`, repositioned `left: 34px, top: 6px`. |
| `.skillscrollingame.not-turn` | Proportionally scaled clip: `inset(0 0 0 114px)`, `left: -80px`. |
| `.skillqueue` | Scaled to `80×80`, `top: 16px, left: 28px`. |
| `.skillimage` | Scaled to `80×80` (`--remaster-skill-icon`), `top: 16px, left: 57px`. |
| `.skillinformation` | Swapped to `ingamebottomscroll-remaster.png`, `748×192`, `left: 352px, top: 600px`. |
| `.skillviewimage` | Scaled to `107×107`, `left: 46px, top: 43px`. |
| `.ingameskillname` | Repositioned `left: 168px, top: 13px`, `font-size: 15px`. |
| `.ingameskilldescription` | Repositioned `left: 168px, top: 44px`, `max-height: 72px`, `font-size: 13px`. |
| `.energytext` / `.ingamecooldown` / `.ingameclasspicker` | Repositioned to match scaled panel right zone. |
| `.ingameclasses` | Repositioned `left: 168px, top: 126px`. |
| `.surrenderbutton` | Swapped to `optionscroll-remaster.png`, `260×66`, `left: 43px, top: 607px`. |
| `.sound` | Swapped to `optionscroll-remaster.png`, `260×66`, `left: 43px, top: 680px`. |
| `.bottomrender` | Sized to `219×213`, repositioned `left: 178px, top: 21px`. |
| `.render` | Swapped to `render-remaster.png` (`219×546`), clipped by `.bottomrender` overflow. |
| `.battle-end-panel` | Swapped to `endscroll-remaster.png`, `918×460`, `top: 123px`. |
| `.battle-end-portrait` | Slot scaled to `337×323`, `left: 116px, top: 66px`, `object-fit: cover`. |
| `.battle-end-copy` / title / message / continue | Repositioned and font-size scaled for `918×460` panel. |
| `.ChakraChooseEndTurn` | Swapped to `searchingscroll-remaster.png`, `559×415`, centered at `left: 271px, top: 143px`. |
| `.exchange_chakra` | Same as ChakraChooseEndTurn. |
| `.surrender-confirm` | Same as ChakraChooseEndTurn. |
| `.surrender-confirm-preview-image` | Swapped to `surrenderimage-remaster.png`, `275×179`, repositioned in the larger panel. |

### Remaster assets wired in Phase 6A

`ingamebg-remaster.png` (via Phase 4B variable, stage background), `ingamescrollbehind-remaster.png`, `ingameskillscroll-remaster.png`, `ingamebottomscroll-remaster.png`, `optionscroll-remaster.png`, `endscroll-remaster.png`, `render-remaster.png`, `surrenderimage-remaster.png`, `searchingscroll-remaster.png` (modal panels).

Not yet wired: `deadcharacter-remaster.png`, `win-remaster.png`, `lose-remaster.png`, `skillqqueue-remaster.png` (deferred — see below).

### Intentionally deferred to Phase 6B / 6C

| Area | Reason |
| --- | --- |
| Timer bar fill accuracy | `script.js` uses a `191px` max-width constant to drive `.timer-bar` width. CSS track is now `273px` but JS still caps at `191px`. Needs a JS constant update. |
| Health bar fill accuracy | `script.js` drives `.health-bar` width in pixels based on `75px` full-health constant. Bar will visually max out at ~70% of the `107px` container until JS is updated. |
| Queue animation pixel offsets | `getBoundingClientRect()` + `transform: translate()` in `script.js` uses geometry from the live `54×54` skill icons. Larger icons will cause queue fly-in to land at wrong positions. |
| Skill queue icon asset | `skillqqueue-remaster.png` (`80×80`) can't be safely wired via CSS content-swap while JS-driven queue animation still targets the element; defer to Phase 6B. |
| Dead character asset | `deadcharacter-remaster.png` (`107×107`) needs to be wired after verifying which selector/element JS uses for the dead-character state. |
| Win portrait | `win-remaster.png` (`337×323`) — script.js dynamically sets `.battle-end-portrait` src to `win.png` or `lose.png`. CSS can't distinguish. Phase 6B should update JS paths or add a body class. |
| Rank hat sizing | Legacy hat assets (`110×139`) now appear over the `107×107` face. Visual scale may be fine but needs QA. |
| Chakra/exchange modal interiors | Modal containers scaled to `559×415`. OK/Cancel buttons remain at their original pixel positions inside the panel (slightly off-center in the larger panel). Phase 6B pass needed. |
| Tooltip screen-edge clamping | `script.js` clamps tooltips using `window.innerWidth`. In the `1100px` stage, tooltips should still be visible, but the clamp threshold may differ. Verify in Phase 6B. |
| `class-choice-popup-panel` position | The panel uses `position: absolute; left: 300px; top: 200px` inside the fixed-overlay popup. This should display correctly, but visual QA against the remaster stage is needed. |

### JS-sensitive areas discovered during Phase 6A CSS-only tuning

- `.timer-bar`: `script.js` sets `timerBar.style.width` as a pixel value derived from a max constant matching the CSS `191px`. Changing the track size without the JS constant creates a visual fill mismatch.
- `.health-bar`: `script.js` calculates `(hp / maxHp) * 75` in pixels. Needs to use the remaster face constant (`107px`) in the future.
- Queue animation: `script.js` calls `getBoundingClientRect()` on `.skillimage` elements and calculates translate distances to animate selected skills flying to the queue slot. All pixel offsets are live-layout-calibrated.
- `.battle-end-portrait` src: set dynamically by `script.js` (`lose.png` or `win.png`). The remaster portrait assets use different filenames (`lose-remaster.png`, `win-remaster.png`). JS will need to be updated or a data-attribute approach used.

### Confirmation

- Live/default ingame screen remains `770×560`. ✓
- `.game-remaster` is not hardcoded in `ingame.html` body. ✓
- `script.js` was not modified. ✓
- `nav.js` was not modified. ✓
- `index.js` was not modified. ✓
- `selection.html` was not modified. ✓
- No popup sizing changed. ✓
- No gameplay, battle logic, targeting, animation, or character data changed. ✓

### Recommended next step: Phase 6B

- QA the Phase 6A layout by enabling the Remaster Mode toggle in `ingame.html`.
- Fine-tune character-card positions, enemy-character position, and skill-row alignment based on what the browser renders.
- Update `script.js` timer and health-bar max-width constants to read from a CSS variable or a named JS constant that can be toggled by remaster mode.
- Fix queue animation pixel offsets for the `80×80` skill icon size.
- Wire `skillqqueue-remaster.png` and `deadcharacter-remaster.png` safely.
- Update JS battle-end portrait paths for win/lose remaster assets.
- Tune chakra/exchange/surrender modal interiors for the `559×415` panel.
