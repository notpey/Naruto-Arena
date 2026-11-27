# Naruto-Arena Agent Guidance

## Project Goal

Maintain and extend the Naruto-Arena web game while preserving its server, battle engine, character data, and gameplay behavior.

## Architecture

- The Node/Express server is authoritative.
- `battleLogic.js` is the authoritative combat engine.
- The web client sends player intent to the server and renders canonical match state.
- Do not recreate combat calculations in client code.

## Authoritative Systems

Treat these as authoritative unless the user explicitly requests otherwise:

- `battleLogic.js`
- `server.js`
- `routes/`
- `sockets/`
- `data/characters/`
- canonical character services/data
- existing Node tests

Do not change gameplay behavior in these systems as part of ordinary client or UI work.

## Client

The game client is:

- `ingame.html`
- `selection.html`
- `script.js`
- `style.css` (fixed layout) and `game-surfaces.css` (current materials layered on top)

Read the relevant existing code before changing client behavior.

## Gameplay Rules

Never invent, simplify, or independently reinterpret Naruto-Arena gameplay behavior when the server already defines it.

This includes, but is not limited to:

- targeting
- chakra
- cooldowns
- skill queueing
- counters
- invulnerability
- destructible defense
- damage reduction
- affliction damage
- status effects
- ongoing effects
- status durations
- alternate effects
- healing
- death
- turn resolution

The server decides gameplay outcomes. The client sends player intent and renders canonical server state.

## Server-Authoritative Client Behavior

When implementing battle interactions:

- use existing APIs and WebSocket messages whenever possible
- use server-returned legal targets rather than calculating targeting rules locally
- use canonical match state for HP, chakra, cooldowns, statuses, pending actions, death, and turn state
- do not apply predicted damage, healing, status effects, chakra consumption, or cooldown outcomes locally unless explicitly required for harmless UI preview behavior
- wait for canonical server state after gameplay actions

## Stop and Ask Before

Stop and explain the blocker before doing any of the following unless the user explicitly requested it:

- changing `battleLogic.js` gameplay behavior
- changing canonical character definitions
- changing existing server gameplay behavior
- adding, removing, or changing API endpoints
- changing the existing WebSocket protocol
- deleting or replacing working legacy systems
- making a major architecture change

Do not silently make one of these changes merely because it would make the implementation easier.

## Live Character Data

The live roster is stored in MongoDB and edited by admins in the ACP Character Editor. It is the source of truth on the live site; `data/characters/` only seeds a new database and carries code changes.

- Before changing an existing character in code, run `npm run pull-characters` so the files start from the live version. Admin edits made since your last pull would otherwise be overwritten by your migration.
- Roster order is roster index order, which matches, saved teams and stats depend on. New characters join the end. Characters are retired (`retired: true`), never removed.
- Each match plays on the roster version it started with (`match.rosterVersion`). Server code that reads character data during a match must use `rosterForMatch(match)`, not the current roster.
- A one-time character migration replaces live data on deploy. Prefer migrations that change only the fields they mean to change. Every change a deploy makes is recorded in the character's history in the editor.

## Validation

After changes:

- run relevant existing Node tests when server-facing behavior could be affected
- preserve currently working functionality
- fix warnings/errors introduced by the change
- report what was actually validated
- do not claim runtime behavior was verified if it could not actually be exercised
