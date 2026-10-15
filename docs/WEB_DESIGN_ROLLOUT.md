# Non-game web design rollout

## Goal and visual direction

Make the non-game website feel like one Naruto-Arena product while preserving its existing content, routes, artwork, and working behavior. The public reference at `naruto-arena.site` supplies content and page-flow context. The local dark shell, warm orange accent, and existing character art are the starting visual identity. Gameplay and the battle client are outside this rollout.

The first internal review comes before a player preview. Visual consistency alone is not success: players must be able to find a mission, understand its progress and reward, inspect a character's skills, and navigate account pages without guessing.

## Page inventory and ownership

| Family | Local entry points | Primary task |
| --- | --- | --- |
| Home and entry | `index.html`, `selection-login.html`, `recover.html` | Find news, sign in, and reach Start Playing |
| Manual and roster | `manual.html`, `charactersandskills.html` | Learn rules and inspect characters and skills |
| Competition | `leaderboards.html`, `winrates.html`, `clanprofile.html` | Find standings and player or clan records |
| Missions and story | `missions.html`, `story.html` | Find a mission and read requirements, progress, and rewards |
| Profiles and account | `profile.html`, `changeavatar.html`, `changebackgrounds.html`, `resetaccount.html`, `clan panel.html` | Review identity and manage account choices |
| Admin tools | `admin.html`, `charactereditor.html`, `editmission.html`, `playeraccounts.html`, `newspost.html` | Find, edit, and verify operational data |

The live reference has mission groups beyond the local D/C, B, A, and S grouping. Those categories are a content-parity decision, not a CSS task; verify the local canonical catalog before adding navigation or promises for them. The reference account exposed player account tools, not site-admin screens, so local admin screens need a separate internal review.

## Shared rules for the rollout

1. Keep one navigation, account menu, hero treatment, and footer pattern. The full illustrated hero belongs on Home; subpages should spend more of the first viewport on their task.
2. Use the existing `brand.css` colors and type. Orange identifies actions and active navigation; green, red, and blue convey actual states. Reserve imagery for real character, mission, and game art.
3. Use a small set of surface roles: dark shell, one readable content sheet, a subdued inset surface, and hairline dividers. Remove stacked glows, decorative gradients, duplicate kickers, and labels that restate a heading.
4. Put the main decision or information first. Search and filters sit near results; detail pages show identity, requirements, progress, and rewards in a predictable order.
5. Every route needs real loading, empty, error, signed-out, keyboard-focus, and narrow-screen states. Never display placeholder counts as confirmed data.

## Delivery sequence

1. **Pilot:** Missions overview, rank list, detail, character roster, and character detail. Validate navigation, search, progress, reward, and skill reading at desktop and phone sizes.
2. **Public reading and competition:** Home, Manual, Ladders, Story, clan and player profiles. Reuse the pilot's heading, search, list, table, and detail patterns.
3. **Account and admin:** Account controls first, then admin hub and editors. Review permission, save, error, destructive-action, and dense-table states internally.
4. **Review and release:** Compare before and after screenshots, run browser smoke checks and relevant existing tests, then ask a small group of players to perform the same tasks on the current and candidate interfaces before wider release.

## Pilot progress (2026-10-15)

- Missions overview now offers search across the local catalog, with a result count and a useful no-results message. Rank counts appear only after data loads.
- Rank cards place status and featured character text below the art, where both remain readable. Mission details use a clear title, requirements, goals, and reward layout.
- Character details use the character name as their page heading. The roster tools disappear in detail view, and skill metadata reads as labeled text instead of tiny dark pills.
- The remaining page families have not been restyled yet. Shared hero and footer consolidation, signed-in account flows, and site-admin screens belong to the next stages.
- Browser checks covered the local API-backed mission and character routes at 1440 px and 390 px. These checks found no page script errors or horizontal overflow. Internal product review and player testing remain pending.
- Character detail follow-up: the shared dark-theme override exposed light-sheet dividers and flattened the skill card spacing. The detail view now has scoped dark colors, padded cards, readable metadata columns, and a compact phone layout. Characters with no unlock requirement no longer show an empty requirement banner.
- The skill cards now share one desktop row height so their metadata dividers align across the grid. The portrait, name, and bio sit in a compact inset panel aligned to the skill grid; the explanatory alternate-skill line is removed. A long-description character was checked for clipping.
- Site-wide canvas update: non-game pages use one solid dark background. Page-level shells on character details, missions, character roster, and legacy account tools no longer draw a second framed surface around their content. The navigation, illustrated hero, footer, and content cards remain. The game client pages are excluded.
- Browser checks covered Home, character detail, Missions, Manual, Ladders, Profile, and Admin at desktop and phone widths. Their canvases resolved to the same solid color, with no horizontal overflow or page script errors in this pass. The game client pages retained their own background rules.
- Review captures: [Missions overview](web-design-review/mission-home-pilot.png), [mission detail on phone](web-design-review/mission-detail-mobile-pilot.png), [character detail on desktop](web-design-review/character-detail-desktop-pilot.png), and [character detail on phone](web-design-review/character-detail-mobile-pilot.png).
- Canvas review captures: [character detail](web-design-review/character-detail-canvas-desktop.png) and [phone](web-design-review/character-detail-canvas-phone.png), [Missions](web-design-review/missions-canvas-desktop.png) and [phone](web-design-review/missions-canvas-phone.png), [Manual](web-design-review/manual-canvas-desktop.png), and [Profile](web-design-review/profile-canvas-desktop.png).
- Rankings Option A: Ladders now has full-width category lists for player levels, current streak, wins, highest streak, and clan levels. Search filters the selected list; empty clan rankings have a clear state. Home shows a three-player preview linked to Ladders. The repeated rankings rail was removed from 11 legacy profile, account, clan, and editor pages, allowing their content to use the available width. The Home account panel remains available.
- Option A review captures: [Ladders desktop](web-design-review/leaderboards-option-a-1440.png), [Ladders phone](web-design-review/leaderboards-option-a-390.png), [Home desktop](web-design-review/home-option-a-1440.png), [Home phone](web-design-review/home-option-a-390.png), and [Profile desktop](web-design-review/profile-option-a-1440.png).

## Internal acceptance checks

- At 390 px, 768 px, and desktop width: no clipped text, horizontal page scroll, obscured controls, or unusable tables.
- Keyboard users can reach and identify every link, search field, filter, and action; focus remains visible.
- Mission and character content comes from existing local data or APIs. No new gameplay calculations, rewards, or unlock rules are inferred by the UI.
- A player can find a named mission or character, identify a mission's requirements and reward, and read a skill's cost and cooldown without needing to scan unrelated panels.
- Existing routes, auth states, navigation, and server-backed actions still work. Server, protocol, and canonical data changes require separate scope.

## Player satisfaction check after internal review

Give a small group of current and newer players the same tasks on the baseline and candidate: find a named mission; find what it unlocks and current progress; find a character's skill cost and cooldown; find a player's ladder position; find the avatar control. Record task completion, time, wrong turns, and a one-question clarity rating. Fix repeated failures before release. Keep the before-and-after observations with the release notes so the decision is based on player behavior, not visual preference alone.
