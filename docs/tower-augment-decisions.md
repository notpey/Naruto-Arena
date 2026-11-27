# Tower 2.0: decisions, status and remaining work

Source spec: the "Tower 2.0" prompt (200-floor Standard mode; A001–A100, F01–F20, C01–C40).
Machine-readable per-ID status: `docs/tower-2.0-manifest.json` (regenerate with `node scripts/tower-manifest.js`).

## Status (session 2, 2026-11-22)

| Catalog | Implemented | Pending | Blocked |
|---|---|---|---|
| Source augments A001–A100 | 98 | 0 | 2 (A086, A096) |
| Fusion recipes F01–F20 | 20 | 0 | 0 |
| Character augments C01–C40 | 40 | 0 | 0 |

"Implemented" means the effect runs in real Tower battles and at least one real-battle test asserts it
(test/tower-standard.test.js, test/tower-augment-events.test.js, test/tower-character-augments.test.js).
"Blocked" entries keep their sheet wording, are never offered, and say why in `needs`.

Standard mode (200 floors) and Legacy mode (unchanged story run) are both complete.

## Blocked entries (need your decision)

- **A086 Blood Sacrifice**: "may instead spend 15 health" is a choice the player makes while queuing a
  skill. It needs a new prompt in the battle client and a new field in the queue WebSocket message.
  AGENTS.md requires approval before changing the WebSocket protocol.
- **A096 The Copy Ninja**: grants a temporary copied skill. It needs a dynamic extra skill slot in the
  battle client and protocol (Kakashi's copy replaces an existing slot; this one would add one).

Either could instead be redesigned to work without a choice or a new slot. That is a design decision
the sheet does not make, so neither has been changed.

## Architecture

| File | Role |
|---|---|
| `services/tower/towerStandard.js` | Standard config, regions and bands, segment generator, difficulty curve, affix rules, boss synthesis, tier weights, account payout |
| `services/tower/towerAugments.js` | A001–A100: sheet text, tier, scope, `impl` (static metadata or `engine: 'events'`) or `needs` |
| `services/tower/towerFusions.js` | F01–F20: ingredients by source code, promotion rule, `impl` |
| `services/tower/towerCharacterAugments.js` | C01–C40: exact character and skill ids, roster validation, eligibility |
| `services/tower/towerAugmentRules.js` | The exact rule each event-engine entry implements (shown in game) and the blocked reasons |
| `services/tower/towerAugmentEffects.js` | The event engine for team augments and fusions; per-battle memory in `match.towerEncounter.augments` |
| `services/tower/towerCharacterAugmentEffects.js` | Character augment handlers (skill-id scoped), called by the event engine |
| `services/tower/towerScrolls.js` | Merges operational entries into the scroll system; Legacy→Standard tier adapter; battle-start statuses; setup effects |
| `services/tower/towerRun.js` | Mode dispatch, Standard encounters/rewards/settlement, capacity, eligibility, automatic fusion (`recipeCompletedBy` / `fuseRecipe`) |
| `battleLogic.js` | Tower-only hook points (below) |
| `server.js` | Applies augments to Tower boards, starts the augment engine, calls turn boundaries, persists augment memory |
| `routes/tower.js` | `/start` optional `mode`; `/reward` and `/merchant/buy` optional `replaceKey`; `GET /catalog` (the old `POST /fusion` is removed) |

### Engine hook points (battleLogic.js)

All are inert for ordinary matches: `towerHooksFor(match)` returns hooks only when `match.mode === 'tower'`,
and the metadata keys are only ever set on Tower augment statuses (marked `towerScroll`). A test asserts no
character definition uses any of these keys.

- `setTowerHooks(hooks)`; events: `beforeSkill`/`afterSkill` (once per skill actually used, with its paid
  chakra and targets), `onDamage` (every damage and health-loss instance), `onHeal`, `onStatusApply` (may
  change a status's duration or metadata, or cancel it), `onCounter`, `adjustDamage` (per hit, may add or
  subtract damage or ignore reduction/defense).
- Metadata keys: `towerDirectDamagePercent`, `towerBonusDamageVsStunned`, `towerBonusDamageVsTargetHpBelow`,
  `towerCostDiscount`, `towerConditionValueOverride` (C02), `towerIgnoreTargetConditionSkillIds` (C08).
- server.js calls `onTurnEnd` after statuses and cooldowns tick and `onTurnStart` once the next turn begins,
  and saves `towerEncounter` with each turn.
- The battle client mirrors `towerCostDiscount` for its cost display only (the server re-checks every queue).
  `towerScroll` and `towerCostDiscount` were added to the client-safe status metadata allowlist.

## Decisions

### Modes and migration
- A run with no `mode` is Legacy; nothing stored is rewritten. New runs store `mode`, `rulesetVersion`,
  `schemaVersion`, `contentVersion`, `generationVersion` and `totalFloors`. No endpoint changes a run's mode.
- `POST /start` defaults to Standard; the page always sends the mode picked on the intro.

### 200-floor structure, bosses, economy, capacity
Unchanged from session 1: 20 segments of 10 floors; champions on 10/30/…/190; bosses on 20/40/…/200
(scripted or synthesized from the roster, never the same featured boss twice in a row, floor 200 is a
three-phase Apex); floor 9 of each segment is always rest/shop/recruit; HP curve capped near ×2;
chakra carry cap 3; milestone and pity Prismatics; 8 team / 5 per-ninja slots with salvage replacement;
account ryō 5/floor + 40/champion + 80/boss + 600 completion.

### Fusion is automatic
- There is no Fusion Chamber. Taking the second half of a recipe (reward, merchant, or any other grant)
  fuses the pair on the spot inside `grantScroll`: both ingredients are consumed and the result takes one
  slot, so a completing augment never needs a free slot or a salvage. Only team augments fuse.
- `run.lastFusion` (with the floor it happened on) lets the page play the fusion moment once.
- Offers that would complete a pair are flagged (`fusion: {name, partner, result}`) and weighted ×4 in rolls.
- Segments generate with `generationVersion: 2` (no chamber nodes). A run saved inside an old chamber can
  still leave it, and an old chamber node on an existing map now acts as a Ramen Stand.

### Augment scope
- Every source augment is worded for the whole team, so all 100 are team-scoped. Fusion ingredients are
  therefore always team-owned and a fusion can never consume another ninja's scrolls. F01's workbook scope
  ("Ninja") is normalized to team.
- Character augments are ninja-scoped and only offered when that character is a living team member; only
  that character can take one. A recruit replacing them cannot inherit them: they are salvaged for 10 ryō
  (logged). A dead ninja keeps theirs.
- Character augments whose character or skill ids disappear from the roster are disabled at load with a
  console warning and never offered.

### Event-engine conventions
- "Direct" damage = non-affliction skill damage. "Below N health" = N−1 or less.
- Augment damage and healing are marked and never trigger other augments (no echo of an echo, no lifesteal
  from self-damage). Augment hits skip invulnerable enemies unless the rule says they ignore invulnerability.
- "Piercing" ignores damage reduction; augment "affliction" ignores reduction and destructible defense.
- "1 turn" boons on your ninjas follow skill timing (they last through the enemy's next turn); effects on
  enemies applied during your turn last through their next turn.
- "Each turn" = each of your turns unless the rule says otherwise. Per-turn flags reset at every turn start.
- Random rolls are seeded by the match id and a label and saved once rolled.
- Growth that depends on "consecutive turns" counts your own turns; a gap starts it over.
- Death prevention order when several apply: Izanagi (last ninja), Reverse Summoning, Last Breath; Edo
  Tensei / Impure Resurrection then queue a revive for your next turn start. Revives happen after other
  on-death effects of that death have already resolved.
- The exact rule for every entry is its `descriptionNormalized`, shown in game and in the compendium.

### Notable normalizations
- A009/A025/F11 count any stun on your ninja (F11: full stuns only). A040/A045/F16 count stuns your ninjas apply.
- A028/F08 grant the bonus for the *next* damaging skill after a consecutive turn.
- A047 checks damage taken since your previous turn ended. A050/F12/A091 count enemies damaged on each of your turns.
- A060's counter re-arms 3 of your turns after it triggers. A065's counter is shared by the team and spent once.
- A094 moves 30% of an enemy's direct hit off the target and splits it as piercing damage on their living allies.
- C05 is implemented as one point of starting quest progress (so the tooltip reads 1/4 at battle start).
- C14 keeps at most two marks: the newest and the one before it.
- C23 cancels the mirrored area hit on everyone except the chosen enemy, who takes 20 and a second damage-only 20.

## Validation
- `node --test`: 692 tests, 0 failures (session 2).
- Real-battle tests cover every implemented A, F and C entry; a seeded stress test plays 40 battles with
  random loadouts of 13 team augments plus every eligible character augment.
- `node scripts/tower-simulate.js 40` (route/economy only, no combat): late-floor offers ~15% Prismatic,
  team slots first full around floor 16, ~5,600 unspent run ryō by floor 200 when merchants are skipped.
- Headless UI check of the Tower page (desktop and phone) with mocked API responses: no errors, no overflow.

## Known balance risks
- Team slots fill by about floor 16 because all 98 team augments compete for 8 slots. Consider 10 team slots
  or making some rows per-ninja.
- Run ryō accumulates; merchant prices are flat across 200 floors.
- Combat balance (turn counts, boss win rates) is unmeasured: the simulator does not run battles, and
  bot-versus-bot battles were only stress-tested for crashes, not for outcomes.
- Some augments are very strong together (e.g. A055 + A052 + A077 percent stacking, or A051 + A071 + A087
  + A098 death prevention). Nothing caps total bonuses beyond each augment's own rule.

## Next steps
1. Decide A086/A096: approve the protocol change, or redesign them without a prompt/slot.
2. Playtest the 8-slot cap and percent stacking; tune `TIER_WEIGHTS`, `teamScrollCap` and merchant prices.
3. Measure combat outcomes by segment (needs a bot-vs-bot battle harness using the server's bot planner).
