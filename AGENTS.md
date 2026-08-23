# Naruto-Arena Codex Guidance

## Project Goal

Reimplement the existing Naruto-Arena client in Godot while preserving the existing working Naruto-Arena server, battle engine, character data, and gameplay behavior.

The existing web application is the authoritative behavioral reference.

## Current Architecture

For the current migration phase:

- Godot is the new client.
- The existing Node/Express server remains authoritative.
- `battleLogic.js` remains the authoritative combat engine.
- Godot sends player intent to the existing server and receives canonical match state from the server.
- Do not recreate combat calculations locally in Godot.

## Authoritative Existing Systems

Treat these as authoritative unless the user explicitly requests otherwise:

- `battleLogic.js`
- `server.js`
- `routes/`
- `sockets/`
- `data/characters/`
- canonical character services/data
- existing Node tests

Do not change gameplay behavior in these systems as part of ordinary Godot migration work.

## Reference Client

Use the existing web client as the behavioral and visual reference when reproducing client behavior:

- `ingame.html`
- `selection.html`
- `script.js`
- `style.css`

Read relevant existing code before implementing equivalent behavior in Godot.

## Godot Scope

- Keep Godot-specific implementation under `/godot`.
- Target Godot version: **4.7.1**.
- Prefer reusable scenes, scripts, and components as the client grows.
- Do not allow a prototype script such as `match_state_probe.gd` to become the permanent monolithic client when a reasonable refactor would improve maintainability.
- Refactor incrementally and preserve working behavior.

## Gameplay Rules

Never invent, simplify, or independently reinterpret Naruto-Arena gameplay behavior when the existing server already defines it.

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

The server decides gameplay outcomes. Godot should send player intent and render canonical server state.

## Server-Authoritative Client Behavior

When implementing battle interactions:

- use existing APIs and WebSocket messages whenever possible
- use server-returned legal targets rather than calculating targeting rules locally
- use canonical match state for HP, chakra, cooldowns, statuses, pending actions, death, and turn state
- do not apply predicted damage, healing, status effects, chakra consumption, or cooldown outcomes locally unless explicitly required for harmless UI preview behavior
- wait for canonical server state after gameplay actions

## Autonomy

For requested Godot migration work, Codex may autonomously:

- inspect relevant repository files
- modify files under `/godot`
- create Godot scenes, scripts, resources, and components
- refactor Godot code when appropriate
- run Godot validation
- run relevant existing Node tests
- fix warnings, parse errors, and regressions caused by its changes
- continue through reasonable implementation steps without waiting for the user to say `continue`

## Stop and Ask Before

Stop and explain the blocker before doing any of the following unless the user explicitly requested it:

- changing `battleLogic.js` gameplay behavior
- changing canonical character definitions
- changing existing server gameplay behavior
- adding, removing, or changing API endpoints
- changing the existing WebSocket protocol
- deleting or replacing working legacy systems
- making a major architecture change outside `/godot`

Do not silently make one of these changes merely because it would make the Godot implementation easier.

## Validation

After changes:

- validate against Godot 4.7.1
- run relevant existing Node tests when server-facing behavior could be affected
- preserve currently working functionality
- fix warnings/errors introduced by the change
- report what was actually validated
- do not claim runtime behavior was verified if it could not actually be exercised

## Migration Priority

Prioritize work in this order:

1. Functional parity
2. Complete playable Godot battle client
3. UI architecture cleanup
4. Visual remaster
5. Animation, audio, and polish

Do not mix major visual redesign work into functional-parity tasks unless the user explicitly requests it.

## Working Principle

The goal is not to create a Godot game inspired by Naruto-Arena. The goal is to build a Godot client for the existing Naruto-Arena game while preserving its established mechanics and server-authoritative behavior.
