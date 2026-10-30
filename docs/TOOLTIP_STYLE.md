# Battle tooltip copy

Tooltips should help a player decide what to use, who to target, and what an active status will do. The character roster and battle engine define the facts; copy changes must not imply a different effect.

- **Skill descriptions:** Start with the character and the action. State target, amount, duration, and any condition or exception that changes the choice. Skip animation and story flavor already supplied by the skill name and art.
- **Status tooltips:** The title already names the source skill and the UI shows remaining turns. Lead with the effect on the character carrying the status, usually "This character …". Name another skill only when the interaction matters.
- **Shared rules:** Do not append the standard action/control cancellation rule to every tooltip. Mention an ending condition only when it is specific to the skill or changes a player's decision.
- **Passives:** State the mechanic once. The infinite duration label already identifies a permanent passive; do not append "This passive cannot be removed" to every description.
- **Character overview:** Show the passive and skill names when the player opens a portrait. Keep story biographies on the character information page.
- **Changing values:** Use `tooltipTextTemplate` placeholders for defense, stacks, or bonuses that can change. A fixed number in a status tooltip must remain true throughout the status.
- **Hidden effects:** Do not expose a concealed counter through a second visible status from the same skill. Internal bookkeeping statuses should use `hideTooltip` when they have no player-facing effect.

Keep Naruto-Arena terms such as chakra, destructible defense, affliction damage, and invulnerability. Preserve the distinction between a skill's targeting rules and damage that an existing status deals later.
