const defaultCharacters = require("./data/characters/index.js");

const DEFAULT_HP = 100;
const chakraTypes = ['taijutsu', 'ninjutsu', 'bloodline', 'genjutsu'];

const createEmptyChakraCost = () => ({
    taijutsu: 0,
    ninjutsu: 0,
    bloodline: 0,
    genjutsu: 0,
});

const ensureUnitStateShape = (unit) => {
    if (!unit || typeof unit !== 'object') return { statuses: [], cooldowns: {}, skillUses: {} };
    if (!unit.state || typeof unit.state !== 'object') {
        unit.state = { statuses: [], cooldowns: {}, skillUses: {} };
    }
    if (!Array.isArray(unit.state.statuses)) {
        unit.state.statuses = [];
    }
    if (!unit.state.cooldowns || typeof unit.state.cooldowns !== 'object') {
        unit.state.cooldowns = {};
    }
    if (!unit.state.skillUses || typeof unit.state.skillUses !== 'object') {
        unit.state.skillUses = {};
    }
    if (!unit.state._cooldownsStartedThisTurn || typeof unit.state._cooldownsStartedThisTurn !== 'object') {
        unit.state._cooldownsStartedThisTurn = {};
    }
    if (typeof unit.state._lastEvadeTurnMarker !== 'string') {
        unit.state._lastEvadeTurnMarker = '';
    }
    if (!unit.state.snapshots || typeof unit.state.snapshots !== 'object') {
        unit.state.snapshots = {};
    }
    return unit.state;
};

const syncLinkedStatuses = (match) => {
    Object.entries(match?.board || {}).forEach(([username, units]) => {
        (Array.isArray(units) ? units : []).forEach((unit, slot) => {
            if (!unit) return;
            const state = ensureUnitStateShape(unit);
            state.statuses = state.statuses.filter((status) => {
                const linkedStatusId = status?.metadata?.linkedTargetStatusId;
                const linkedKey = status?.metadata?.linkedTargetKey;
                if (!linkedStatusId || !linkedKey) return true;
                const separator = linkedKey.lastIndexOf(':');
                const targetUsername = linkedKey.slice(0, separator);
                const targetSlot = Number(linkedKey.slice(separator + 1));
                const targetUnit = match.board?.[targetUsername]?.[targetSlot];
                const ownerStunned = Boolean(getStatusMetadataTotals(state).cannotUseSkills) ||
                    (Boolean(status.metadata?.endsOnAnySourceStun) && isUnitStunned(state, unit));
                if (ownerStunned && targetUnit) {
                    const targetState = ensureUnitStateShape(targetUnit);
                    targetState.statuses = targetState.statuses.filter((entry) =>
                        !(entry?.id === linkedStatusId && entry.sourceUsername === username && entry.sourceSlot === slot)
                    );
                }
                return !ownerStunned && targetUnit?.alive !== false &&
                    (targetUnit?.state?.statuses || []).some((entry) =>
                        entry?.id === linkedStatusId && (Number(entry.remainingTurns) || 0) > 0 &&
                        entry.sourceUsername === username && entry.sourceSlot === slot
                    );
            });
        });
    });
};

const buildInitialBoard = (players = [], characters = defaultCharacters) => {
    const board = {};
    players.forEach((player) => {
        const team = Array.isArray(player.team) ? player.team : [];
        board[player.username] = team.map((rosterIndex, slot) => {
            const character = Array.isArray(characters) ? characters[rosterIndex] : null;
            const passive = character?.passive;
            const passiveStatus = passive?.name
                ? {
                      statusId: `${character?.characterId || character?.id || ''}_${passive.name}`
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '_')
                          .replace(/^_+|_+$/g, ''),
                      duration: 99,
                      metadata: {
                          passive: true,
                          permanent: true,
                          cannotBeCleansed: true,
                          sourceSkillName: passive.name,
                          statusIcon: passive.icon || '',
                          tooltipText: passive.stackTooltipTextTemplate
                              ? renderTooltipTemplate(passive.stackTooltipTextTemplate, passive)
                              : `${passive.description || ''}\nThis passive cannot be removed.`.trim(),
                          physicalDamageBonusWhileHelpful:
                              Math.max(0, Number(passive.physicalDamageBonusWhileHelpful) || 0),
                          destructibleDefenseBonusGranted:
                              Math.max(0, Number(passive.destructibleDefenseBonusGranted) || 0),
                          physicalDamageBonusAgainstTargetStatus:
                              passive.physicalDamageBonusAgainstTargetStatus || null,
                          allyFollowupDamageMark:
                              passive.allyFollowupDamageMark || null,
                          healingBlockOnStun: passive.healingBlockOnStun || null,
                          piercingDamageOnStun: Math.max(0, Number(passive.piercingDamageOnStun) || 0),
                          piercingDamageOnStunSkillIds: Array.isArray(passive.piercingDamageOnStunSkillIds)
                              ? passive.piercingDamageOnStunSkillIds : [],
                          damageTakenInTurn: passive.damageTakenInTurn || null,
                          bonusAgainstNonDamagingSkillUser:
                              Math.max(0, Number(passive.bonusAgainstNonDamagingSkillUser) || 0),
                          onEnemySkillTargetedDamageToSourceAmount:
                              Math.max(0, Number(passive.onEnemySkillTargetedDamageToSourceAmount) || 0),
                          onEnemySkillTargetedDamageToSourceSkillClasses:
                              Array.isArray(passive.onEnemySkillTargetedDamageToSourceSkillClasses)
                                  ? passive.onEnemySkillTargetedDamageToSourceSkillClasses : [],
                          onEnemySkillTargetedDamagingOnly:
                              Boolean(passive.onEnemySkillTargetedDamagingOnly),
                          immuneToChakraRemovalAndStealing:
                              Boolean(passive.immuneToChakraRemovalAndStealing),
                          revealInvisibleSkills: Boolean(passive.revealInvisibleSkills),
                          unpierceableDamageReductionFlat:
                              Math.max(0, Number(passive.unpierceableDamageReductionFlat) || 0),
                          onDamageStackMetadataKey: passive.onDamageStackMetadataKey || null,
                          onDamageStackAmount: Math.max(0, Number(passive.onDamageStackAmount) || 0),
                          onUndamagedTurnStackMetadataKey: passive.onUndamagedTurnStackMetadataKey || null,
                          onUndamagedTurnStackAmount: Math.max(0, Number(passive.onUndamagedTurnStackAmount) || 0),
                          ...(passive.onDamageStackMetadataKey ? {
                              [passive.onDamageStackMetadataKey]:
                                  Math.max(0, Number(passive[passive.onDamageStackMetadataKey]) || 0),
                          } : {}),
                          tooltipTextTemplate: passive.stackTooltipTextTemplate || null,
                          awakening: passive.awakening || null,
                      },
                  }
                : null;
            const startStatuses = [
                ...(passiveStatus ? [passiveStatus] : []),
                ...(Array.isArray(character?.startStatuses) ? character.startStatuses : []),
            ];
            return {
                slot,
                rosterIndex,
                alive: true,
                hp: DEFAULT_HP,
                state: {
                    statuses: startStatuses
                        .map((status) => {
                            if (!status || typeof status !== 'object') return null;
                            const statusId =
                                typeof status.statusId === 'string' && status.statusId
                                    ? status.statusId
                                    : typeof status.id === 'string' && status.id
                                    ? status.id
                                    : '';
                            if (!statusId) return null;
                            const duration = Number.isFinite(status.duration)
                                ? status.duration
                                : Number(status.remainingTurns) || 0;
                            return {
                                id: statusId,
                                remainingTurns: Math.max(0, Number(duration) || 0),
                                sourceSkillId:
                                    typeof status.sourceSkillId === 'string' && status.sourceSkillId
                                        ? status.sourceSkillId
                                        : null,
                                sourceUsername:
                                    typeof status.sourceUsername === 'string' && status.sourceUsername
                                        ? status.sourceUsername
                                        : null,
                                sourceSlot: Number.isInteger(status.sourceSlot) ? status.sourceSlot : null,
                                metadata:
                                    status.metadata && typeof status.metadata === 'object'
                                        ? (() => {
                                              const created = { ...status.metadata };
                                              const randomizeConfig =
                                                  created?.randomizeMetadataKeyFromOptions &&
                                                  typeof created.randomizeMetadataKeyFromOptions === 'object'
                                                      ? created.randomizeMetadataKeyFromOptions
                                                      : null;
                                              if (randomizeConfig) {
                                                  const metadataKey =
                                                      typeof randomizeConfig.metadataKey === 'string' &&
                                                      randomizeConfig.metadataKey
                                                          ? randomizeConfig.metadataKey
                                                          : '';
                                                  const options = Array.isArray(randomizeConfig.options)
                                                      ? randomizeConfig.options
                                                      : Array.isArray(randomizeConfig.values)
                                                      ? randomizeConfig.values
                                                      : [];
                                                  if (metadataKey && options.length > 0) {
                                                      const currentValue = created?.[metadataKey];
                                                      const pool = options.filter(
                                                          (entry) =>
                                                              !Boolean(randomizeConfig.excludeCurrentValue) ||
                                                              entry !== currentValue
                                                      );
                                                      const chosenValue =
                                                          pool[Math.floor(Math.random() * pool.length)] ??
                                                          currentValue ??
                                                          options[0];
                                                      created[metadataKey] = chosenValue;
                                                  }
                                              }
                                              return created;
                                          })()
                                        : {},
                                fresh: Boolean(status.fresh),
                            };
                        })
                        .filter(Boolean),
                    cooldowns: Object.fromEntries(
                        (Array.isArray(character?.skills) ? character.skills : [])
                            .filter((skill) => typeof skill?.id === 'string' && skill.id &&
                                Number.isInteger(skill.startingCooldown) && skill.startingCooldown > 0)
                            .map((skill) => [skill.id, skill.startingCooldown])
                    ),
                    skillUses: {},
                },
            };
        });
    });
    return board;
};

const getSkillTargetType = (characters, rosterIndex, skillIndex) => {
    const character = Array.isArray(characters) ? characters[rosterIndex] : null;
    const skill = character?.skills?.[skillIndex];
    return skill?.target || null;
};

const buildSkillReplacementMap = (actorState) => {
    const map = {};
    const statuses = Array.isArray(actorState?.statuses) ? actorState.statuses : [];
    statuses.forEach((status) => {
        const remaining = Number(status?.remainingTurns) || 0;
        if (remaining <= 0) return;
        const byRemaining = status?.metadata?.skillReplacementsByRemainingTurns;
        const replacementsFromRemaining =
            byRemaining && typeof byRemaining === 'object'
                ? byRemaining[String(remaining)] || byRemaining[remaining]
                : null;
        const replacements =
            replacementsFromRemaining && typeof replacementsFromRemaining === 'object'
                ? replacementsFromRemaining
                : status?.metadata?.skillReplacements;
        if (replacements && typeof replacements === 'object') {
            Object.entries(replacements).forEach(([fromId, toId]) => {
                if (!fromId || !toId) return;
                map[fromId] = toId;
            });
        }
        if (status?.metadata?.tentenWeaponUpgradeCycle) {
            const stacks = Math.max(1, Number(status.stacks) || 1);
            const cycle = stacks % 3;
            if (cycle === 1) {
                map['tenten-s-kunai-grenade'] = 'tenten-s-heavenly-chain-disaster';
                map['tenten-s-chain-spin'] = 'tenten-s-iron-protection-wall';
            } else if (cycle === 2) {
                map['tenten-s-kunai-grenade'] = 'tenten-s-bashousen-coil-of-wind';
                map['tenten-s-chain-spin'] = 'tenten-s-bashousen-coil-of-fire';
            }
        }
        if (status?.metadata?.gaiGateProgression) {
            const stacks = Math.max(1, Number(status.stacks) || 1);
            if (stacks >= 7) {
                map['maito-gai-s-fiery-kick'] = 'maito-gai-s-daytime-tiger';
            } else if (stacks >= 6) {
                map['maito-gai-s-fiery-kick'] = 'maito-gai-s-morning-peacock';
            }
        }
        if (status?.metadata?.deidaraClayMoldToggle) {
            const stacks = Math.max(1, Number(status.stacks) || 1);
            if (stacks % 2 === 1) {
                map['deidara-c1-birds'] = 'deidara-c2-dragon';
                map['deidara-c1-centipede'] = 'deidara-c3-statue';
            }
        }
    });
    return map;
};

const formatDebugIdentifier = (value) => {
    if (typeof value !== 'string' || !value.trim()) return '';
    return value
        .trim()
        .split('-')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
};

const setLastDamageDebug = (targetState, amount, context = {}) => {
    if (!targetState) return;
    const numericAmount = Math.max(0, Number(amount) || 0);
    if (numericAmount <= 0) return;
    const sourceLabel =
        (typeof context?.damageDebugLabel === 'string' && context.damageDebugLabel.trim()) ||
        formatDebugIdentifier(context?.sourceSkillId) ||
        (typeof context?.sourceUsername === 'string' && context.sourceUsername.trim()) ||
        'Unknown';
    const reasonLabel =
        typeof context?.damageDebugReason === 'string' && context.damageDebugReason.trim()
            ? ` (${context.damageDebugReason.trim()})`
            : '';
    targetState.lastDamageDebugText = `${numericAmount} from ${sourceLabel}${reasonLabel}`;
};

const resolveEffectiveSkill = ({ characters, rosterIndex, skillIndex, actorState }) => {
    const character = Array.isArray(characters) ? characters[rosterIndex] : null;
    const baseSkill = character?.skills?.[skillIndex] || null;
    if (!baseSkill) return null;
    const replacementMap = buildSkillReplacementMap(actorState);
    let resolvedSkill = baseSkill;
    const visited = new Set();
    while (resolvedSkill?.id && replacementMap[resolvedSkill.id] && !visited.has(resolvedSkill.id)) {
        visited.add(resolvedSkill.id);
        const replacementId = replacementMap[resolvedSkill.id];
        let replacementSkill =
            (Array.isArray(character?.skills) ? character.skills : []).find((skill) => skill?.id === replacementId) ||
            null;
        if (!replacementSkill && Array.isArray(characters)) {
            // Not one of this character's own skills — fall back to a global lookup so a
            // dynamically "copied" enemy skill (e.g. Sharingan Counter) can be resolved too.
            for (const otherCharacter of characters) {
                const found = (Array.isArray(otherCharacter?.skills) ? otherCharacter.skills : []).find(
                    (skill) => skill?.id === replacementId
                );
                if (found) {
                    replacementSkill = found;
                    break;
                }
            }
        }
        if (!replacementSkill) {
            break;
        }
        resolvedSkill = replacementSkill;
    }
    const statuses = Array.isArray(actorState?.statuses) ? actorState.statuses : [];
    let effectiveSkill = resolvedSkill;
    for (const status of statuses) {
        const remaining = Number(status?.remainingTurns) || 0;
        if (remaining <= 0) continue;
        const targetOverrides = status?.metadata?.skillTargetOverrides;
        const targetOverride = targetOverrides && typeof targetOverrides === 'object' &&
            typeof targetOverrides[resolvedSkill?.id] === 'string'
            ? targetOverrides[resolvedSkill.id].trim() : '';
        if (targetOverride) {
            effectiveSkill = { ...effectiveSkill, target: targetOverride };
        }
        const cooldownOverrides = status?.metadata?.skillCooldownOverridesBySkillId;
        const cooldownOverride = cooldownOverrides?.[resolvedSkill?.id];
        if (Number.isFinite(cooldownOverride) && cooldownOverride >= 0) {
            effectiveSkill = { ...effectiveSkill, cooldown: cooldownOverride };
        }
    }
    return effectiveSkill || baseSkill;
};

const isStatusActiveForMetadata = (status, ownerUnit = null) => {
    const remaining = Number(status?.remainingTurns) || 0;
    if (remaining <= 0) return false;
    const metadata = status?.metadata || {};
    if (ownerUnit) {
        const currentHp = Math.max(0, Number(ownerUnit?.hp) || 0);
        const hpAtLeast = Number(metadata?.activeWhileOwnerCurrentHpAtLeast);
        if (Number.isFinite(hpAtLeast) && currentHp < hpAtLeast) {
            return false;
        }
        const hpAtMost = Number(metadata?.activeWhileOwnerCurrentHpAtMost);
        if (Number.isFinite(hpAtMost) && currentHp > hpAtMost) {
            return false;
        }
    }
    return true;
};

const isUnitBanished = (unit) => {
    if (!unit || typeof unit !== 'object') return false;
    const state = ensureUnitStateShape(unit);
    return (Array.isArray(state?.statuses) ? state.statuses : []).some((status) => {
        if (!isStatusActiveForMetadata(status, unit)) return false;
        return Boolean(status?.metadata?.banished);
    });
};

const getStatusMetadataTotals = (actorState, ownerUnit = null) => {
    const totals = {
        damageReductionFlat: 0,
        damageReductionPercent: 0,
        unpierceableDamageReductionFlat: 0,
        unpierceableDamageReductionPercent: 0,
        physicalDamageReductionFlat: 0,
        damageTakenBonusFlat: 0,
        nonAfflictionDamageTakenBonusFlat: 0,
        damageTakenMultiplier: 1,
        healReceivedMultiplier: 1,
        healReceivedBonusFlat: 0,
        minimumHp: 0,
        randomCostReduction: 0,
        randomCostIncrease: 0,
        taijutsuCostReduction: 0,
        ninjutsuCostReduction: 0,
        bloodlineCostReduction: 0,
        genjutsuCostReduction: 0,
        taijutsuCostIncrease: 0,
        ninjutsuCostIncrease: 0,
        bloodlineCostIncrease: 0,
        genjutsuCostIncrease: 0,
        cannotUseSkills: false,
        stunImmune: false,
        damageBonusFlat: 0,
        nonAfflictionDamageBonusFlat: 0,
        damageDebuffFlat: 0,
        nonAfflictionDamageDebuffFlat: 0,
        invulnerable: false,
    };
    const statuses = Array.isArray(actorState?.statuses) ? actorState.statuses : [];
    statuses.forEach((status) => {
        if (!isStatusActiveForMetadata(status, ownerUnit)) return;
        const metadata = status?.metadata || {};
        let statusHealReceivedMultiplier = 1;
        totals.damageReductionFlat += Number(metadata.damageReductionFlat) || 0;
        totals.unpierceableDamageReductionFlat += Number(metadata.unpierceableDamageReductionFlat) || 0;
        totals.damageReductionPercent += Math.max(0, Number(metadata.damageReductionPercent) || 0);
        totals.unpierceableDamageReductionPercent += Math.max(
            0,
            Number(metadata.unpierceableDamageReductionPercent) || 0
        );
        totals.physicalDamageReductionFlat += Number(metadata.physicalDamageReductionFlat) || 0;
        totals.damageTakenBonusFlat += Number(metadata.damageTakenBonusFlat) || 0;
        totals.nonAfflictionDamageTakenBonusFlat += Number(metadata.nonAfflictionDamageTakenBonusFlat) || 0;
        if (Number.isFinite(metadata.damageTakenMultiplier)) {
            totals.damageTakenMultiplier *= Math.max(0, Number(metadata.damageTakenMultiplier));
        }
        if (Number.isFinite(metadata.healReceivedMultiplier)) {
            statusHealReceivedMultiplier = Math.max(0, Number(metadata.healReceivedMultiplier));
        }
        totals.healReceivedBonusFlat += Math.max(0, Number(metadata.healReceivedBonusFlat) || 0);
        const healMultiplierAtMostThreshold = Number(
            metadata.healReceivedMultiplierWhenOwnerCurrentHpAtMostThreshold
        );
        const healMultiplierAtMostValue = Number(metadata.healReceivedMultiplierWhenOwnerCurrentHpAtMost);
        const healMultiplierAtLeastThreshold = Number(
            metadata.healReceivedMultiplierWhenOwnerCurrentHpAtLeastThreshold
        );
        const healMultiplierAtLeastValue = Number(metadata.healReceivedMultiplierWhenOwnerCurrentHpAtLeast);
        if (ownerUnit) {
            const currentHp = Math.max(0, Number(ownerUnit?.hp) || 0);
            if (Number.isFinite(healMultiplierAtMostThreshold) && Number.isFinite(healMultiplierAtMostValue)) {
                if (currentHp <= healMultiplierAtMostThreshold) {
                    statusHealReceivedMultiplier = Math.max(0, healMultiplierAtMostValue);
                }
            }
            if (Number.isFinite(healMultiplierAtLeastThreshold) && Number.isFinite(healMultiplierAtLeastValue)) {
                if (currentHp >= healMultiplierAtLeastThreshold) {
                    statusHealReceivedMultiplier = Math.max(0, healMultiplierAtLeastValue);
                }
            }
        }
        totals.healReceivedMultiplier *= statusHealReceivedMultiplier;
        totals.minimumHp = Math.max(totals.minimumHp, Math.max(0, Number(metadata.minimumHp) || 0));
        totals.randomCostReduction += Number(metadata.randomCostReduction) || 0;
        totals.randomCostIncrease += Number(metadata.randomCostIncrease) || 0;
        totals.taijutsuCostReduction += Number(metadata.taijutsuCostReduction) || 0;
        totals.ninjutsuCostReduction += Number(metadata.ninjutsuCostReduction) || 0;
        totals.bloodlineCostReduction += Number(metadata.bloodlineCostReduction) || 0;
        totals.genjutsuCostReduction += Number(metadata.genjutsuCostReduction) || 0;
        totals.taijutsuCostIncrease += Number(metadata.taijutsuCostIncrease) || 0;
        totals.ninjutsuCostIncrease += Number(metadata.ninjutsuCostIncrease) || 0;
        totals.bloodlineCostIncrease += Number(metadata.bloodlineCostIncrease) || 0;
        totals.genjutsuCostIncrease += Number(metadata.genjutsuCostIncrease) || 0;
        totals.damageBonusFlat += Number(metadata.damageBonusFlat) || 0;
        totals.nonAfflictionDamageBonusFlat += Number(metadata.nonAfflictionDamageBonusFlat) || 0;
        totals.damageDebuffFlat += Math.max(
            0,
            (Number(metadata.damageDebuffFlat) || 0) + (Number(metadata.DamageDebuff) || 0)
        );
        totals.nonAfflictionDamageDebuffFlat += Math.max(
            0,
            (Number(metadata.nonAfflictionDamageDebuffFlat) || 0) +
                (Number(metadata.NonAfflictionDamageDebuff) || 0)
        );
        if (metadata.cannotUseSkills) {
            totals.cannotUseSkills = true;
        }
        if (metadata.cannotUseNonStrategicSkills) {
            totals.cannotUseNonStrategicSkills = true;
        }
        if (metadata.addCrowStackOnHarmfulSkillUse) {
            totals.addCrowStackOnHarmfulSkillUse = true;
        }
        if (Number.isFinite(metadata.damageDebuffFlatPerCrowStack)) {
            const crowStacks = Math.max(0, Number(status?.stacks) || 1);
            totals.nonAfflictionDamageDebuffFlat += Math.max(
                0,
                Number(metadata.damageDebuffFlatPerCrowStack) * crowStacks
            );
        }
        if (metadata.stunImmune || metadata.cannotBeStunned) {
            totals.stunImmune = true;
        }
        if (metadata.invulnerable) {
            totals.invulnerable = true;
        }
        if (metadata.rainOrphansPassive) {
            totals.rainOrphansPassive = true;
        }
        if (Number.isFinite(metadata.invulnerabilityDurationReduction)) {
            totals.invulnerabilityDurationReduction = (totals.invulnerabilityDurationReduction || 0) + Number(metadata.invulnerabilityDurationReduction);
        }
        if (metadata.counterOnEnemySkillTargetingSelf) {
            totals.counterOnEnemySkillTargetingSelf = true;
        }
        if (Number.isFinite(metadata.counterDamagePiercing)) {
            totals.counterDamagePiercing = Number(metadata.counterDamagePiercing);
        }
        if (Number.isFinite(metadata.incrementShurikenDamagePerHit)) {
            totals.incrementShurikenDamagePerHit = Number(metadata.incrementShurikenDamagePerHit);
        }
    });
    return totals;
};

const getContextualMinimumHp = (targetState, ownerUnit, context = {}) => {
    const totals = getStatusMetadataTotals(targetState, ownerUnit);
    let minimumHp = Math.max(0, Number(totals.minimumHp) || 0);
    const isSelfSkillDamage =
        typeof context?.sourceSkillId === 'string' &&
        context.sourceSkillId &&
        context?.sourceUsername &&
        context?.targetUsername &&
        context.sourceUsername === context.targetUsername &&
        Number.isInteger(context?.sourceSlot) &&
        Number.isInteger(context?.targetSlot) &&
        context.sourceSlot === context.targetSlot;
    if (!isSelfSkillDamage) {
        return minimumHp;
    }
    const statuses = Array.isArray(targetState?.statuses) ? targetState.statuses : [];
    statuses.forEach((status) => {
        if (!isStatusActiveForMetadata(status, ownerUnit)) return;
        const scopedMinimumHp = Math.max(
            0,
            Number(status?.metadata?.minimumHpFromSelfSkillDamage) || 0
        );
        minimumHp = Math.max(minimumHp, scopedMinimumHp);
    });
    return minimumHp;
};

const isUnitStunned = (state, unit = null) => (Array.isArray(state?.statuses) ? state.statuses : []).some((status) => {
    if (!isStatusActiveForMetadata(status, unit)) return false;
    const metadata = status?.metadata || {};
    return status.id === 'stunned' || Boolean(metadata.cannotUseSkills) ||
        Boolean(metadata.cannotUseHarmfulSkills) || Boolean(metadata.cannotUseHelpfulSkills) ||
        Boolean(metadata.cannotUseNonMentalSkills) || Boolean(metadata.cannotUseNonStrategicSkills) ||
        (Array.isArray(metadata.cannotUseSkillClasses) && metadata.cannotUseSkillClasses.length > 0) ||
        (Array.isArray(metadata.cannotUseSkillIndices) && metadata.cannotUseSkillIndices.length > 0);
});

const getSkillCooldownRemaining = (actorState, skillId) => {
    if (!actorState || !skillId) return 0;
    const cooldowns =
        actorState.cooldowns && typeof actorState.cooldowns === 'object' ? actorState.cooldowns : {};
    return Math.max(0, Number(cooldowns[skillId]) || 0);
};

const getSkillUseCount = (actorState, skillId, skill = null) => {
    if (!actorState || (!skillId && !skill)) return 0;
    const skillUses =
        actorState.skillUses && typeof actorState.skillUses === 'object' ? actorState.skillUses : {};
    let total = Math.max(0, Number(skillUses[skillId]) || 0);
    const altId = skill?.baseSkillId || skill?.trackUsesForSkillId;
    if (altId && altId !== skillId) {
        const altCount = Math.max(0, Number(skillUses[altId]) || 0);
        if (altCount > total) total = altCount;
    }
    return total;
};

const getCharacterCooldownSkillIds = ({ characters, unit }) => {
    const rosterIndex = Number.isInteger(unit?.rosterIndex) ? Number(unit.rosterIndex) : null;
    const character = Number.isInteger(rosterIndex) && Array.isArray(characters) ? characters[rosterIndex] : null;
    if (!character) return [];
    const activeIndices = getCharacterActiveSkillIndices(character);
    return activeIndices
        .map((index) => character?.skills?.[index]?.id)
        .filter((skillId) => typeof skillId === 'string' && skillId);
};

const isActorUnableToUseSkills = (actorState) => getStatusMetadataTotals(actorState).cannotUseSkills;

const isUnitInvulnerable = (unit) => {
    if (!unit) return false;
    const state = ensureUnitStateShape(unit);
    if (hasStatusMetadataFlag(state, 'cannotBecomeInvulnerable')) return false;
    return getStatusMetadataTotals(state).invulnerable;
};

const skillHasAfflictionClass = (skillClasses = []) =>
    Array.isArray(skillClasses) &&
    skillClasses.some(
        (entry) => typeof entry === 'string' && entry.trim().toLowerCase() === 'affliction'
    );

const isUnitInvulnerableForSkill = (unit, skillClasses = [], { afflictionDamage = false } = {}) => {
    if (!unit) return false;
    const state = ensureUnitStateShape(unit);
    const statuses = Array.isArray(state?.statuses) ? state.statuses : [];
    // Affliction bypasses standard invulnerability only when damage resolves, not when choosing a skill target.
    const afflictionSkill = afflictionDamage && skillHasAfflictionClass(skillClasses);
    const cannotBecomeInvulnerableActive = statuses.some((status) => {
        const remaining = Number(status?.remainingTurns) || 0;
        if (remaining <= 0) return false;
        return Boolean(status?.metadata?.cannotBecomeInvulnerable);
    });
    if (cannotBecomeInvulnerableActive) {
        return false;
    }
    for (const status of statuses) {
        const remaining = Number(status?.remainingTurns) || 0;
        if (remaining <= 0) continue;
        const metadata = status?.metadata || {};
        if (metadata.invulnerableToAllSkills || metadata.invulnerableToAffliction) return true;
        if (metadata.invulnerable && !afflictionSkill) return true;
        if (metadata.invulnerableToNonAffliction && !skillHasAfflictionClass(skillClasses)) return true;
        if (
            Array.isArray(metadata.invulnerableToSkillClasses) &&
            metadata.invulnerableToSkillClasses.some((entry) => hasSkillClass(skillClasses, entry))
        ) {
            return true;
        }
    }
    return false;
};

const doesSkillIgnoreInvulnerability = (skill) => {
    if (!skill) return false;
    if (Boolean(skill.ignoreInvulnerability)) return true;
    if (Array.isArray(skill.effects)) {
        return skill.effects.some(
            (effect) =>
                Boolean(effect?.ignoreInvulnerability) ||
                Boolean(effect?.metadata?.ignoreInvulnerability)
        );
    }
    return false;
};

const canActorIgnoreEnemyInvulnerability = (actorUnit, actorSkillId = null) => {
    if (!actorUnit) return false;
    const actorState = ensureUnitStateShape(actorUnit);
    if (hasStatusMetadataFlag(actorState, 'ignoreEnemyInvulnerability')) return true;
    const skillId = typeof actorSkillId === 'string' ? actorSkillId.trim() : '';
    if (!skillId) return false;
    const statuses = Array.isArray(actorState?.statuses) ? actorState.statuses : [];
    return statuses.some((status) => {
        const remaining = Number(status?.remainingTurns) || 0;
        if (remaining <= 0) return false;
        const allowedSkillIds = Array.isArray(status?.metadata?.ignoreInvulnerabilityForSkillIds)
            ? status.metadata.ignoreInvulnerabilityForSkillIds
                  .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
                  .filter(Boolean)
            : [];
        return allowedSkillIds.includes(skillId);
    });
};

const canActorIgnoreTargetInvulnerabilityBySourceMark = ({ actorCharacterId, actorSkillId = null, targetUnit }) => {
    if ((!actorCharacterId && !actorSkillId) || !targetUnit) return false;
    const state = ensureUnitStateShape(targetUnit);
    const statuses = Array.isArray(state?.statuses) ? state.statuses : [];
    return statuses.some((status) => {
        const remaining = Number(status?.remainingTurns) || 0;
        if (remaining <= 0) return false;
        const allowedSkillIds = Array.isArray(status?.metadata?.ignoreInvulnerabilityFromSourceSkillIdsAny)
            ? status.metadata.ignoreInvulnerabilityFromSourceSkillIdsAny
                  .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
                  .filter(Boolean)
            : [];
        if (allowedSkillIds.length > 0) {
            return Boolean(actorSkillId) && allowedSkillIds.includes(actorSkillId);
        }
        return status?.metadata?.ignoreInvulnerabilityFromSourceCharacterId === actorCharacterId;
    });
};

const canActorTargetUnit = ({ actorState, targetUsername, targetSlot }) => {
    const statuses = Array.isArray(actorState?.statuses) ? actorState.statuses : [];
    for (const status of statuses) {
        const remaining = Number(status?.remainingTurns) || 0;
        if (remaining <= 0) continue;
        const blockedUsername = status?.metadata?.cannotTargetAlliesOfUsername;
        if (!blockedUsername || blockedUsername !== targetUsername) continue;
        const allowedSlot = Number.isInteger(status?.metadata?.allowedTargetSlot)
            ? Number(status.metadata.allowedTargetSlot)
            : null;
        if (allowedSlot !== null && allowedSlot === targetSlot) {
            continue;
        }
        return false;
    }
    return true;
};

const isUnitInvulnerableToHelpfulSkills = (unit) => {
    if (!unit) return false;
    const state = ensureUnitStateShape(unit);
    const statuses = Array.isArray(state?.statuses) ? state.statuses : [];
    return statuses.some((status) => {
        const remaining = Number(status?.remainingTurns) || 0;
        if (remaining <= 0) return false;
        return Boolean(status?.metadata?.invulnerableToHelpfulSkills);
    });
};

const doesEffectTargetHelpfulRecipient = ({ effect, recipient, actingUsername }) => {
    if (!effect || !recipient || !actingUsername) return false;
    if (recipient.username !== actingUsername) return false;
    const scope = typeof effect?.scope === 'string' ? effect.scope.trim().toLowerCase() : '';
    return scope === 'self' || scope === 'target' || scope === 'all-allies';
};

const doesEffectIgnoreHelpfulInvulnerability = (effect) =>
    Boolean(effect?.ignoreHelpfulInvulnerability) || Boolean(effect?.metadata?.ignoreHelpfulInvulnerability);

const filterHelpfulImmuneRecipients = ({ effect, recipients, actingUsername }) =>
    (Array.isArray(recipients) ? recipients : []).filter((recipient) => {
        if (!recipient?.unit || recipient.unit.alive === false) return false;
        if (!doesEffectTargetHelpfulRecipient({ effect, recipient, actingUsername })) return true;
        if (doesEffectIgnoreHelpfulInvulnerability(effect)) return true;
        return !isUnitInvulnerableToHelpfulSkills(recipient.unit);
    });

const doesUnitSatisfySkillTargetCondition = (unit, skill, actorUsername = null, actorSlot = null) => {
    const condition = skill?.targetCondition;
    const state = ensureUnitStateShape(unit);
    if (condition?.statusId && !hasStatus(state, condition.statusId)) return false;
    if (condition?.statusId && condition?.statusFromActor &&
        !(state.statuses || []).some((status) =>
            status?.id === condition.statusId && (Number(status.remainingTurns) || 0) > 0 &&
            status.sourceUsername === actorUsername && status.sourceSlot === actorSlot)) return false;
    if (
        Array.isArray(condition?.statusIdsAny) &&
        condition.statusIdsAny.length > 0 &&
        !condition.statusIdsAny.some((statusId) => hasStatus(state, statusId))
    ) {
        return false;
    }
    if (condition?.missingStatusId && hasStatus(state, condition.missingStatusId)) return false;
    return true;
};

const doesActorSatisfySkillCondition = (actorUnit, actorState, skill) => {
    const condition = skill?.actorCondition;
    const maxUses = Number(skill?.maxUses);
    if (Number.isFinite(maxUses) && maxUses >= 0 && getSkillUseCount(actorState, skill?.id, skill) >= maxUses) {
        return false;
    }
    if (!condition || typeof condition !== 'object') return true;
    if (condition?.statusId && !hasStatus(actorState, condition.statusId)) return false;
    if (
        Array.isArray(condition?.statusIdsAny) &&
        condition.statusIdsAny.length > 0 &&
        !condition.statusIdsAny.some((statusId) => hasStatus(actorState, statusId))
    ) {
        return false;
    }
    if (condition?.missingStatusId && hasStatus(actorState, condition.missingStatusId)) return false;
    const currentHp = Math.max(0, Number(actorUnit?.hp) || 0);
    const hpAtMost = Number(condition?.sourceCurrentHpAtMost);
    if (Number.isFinite(hpAtMost) && currentHp > hpAtMost) return false;
    const hpAtLeast = Number(condition?.sourceCurrentHpAtLeast);
    if (Number.isFinite(hpAtLeast) && currentHp < hpAtLeast) return false;
    if (condition?.sourceSkillUsesAtLeast && typeof condition.sourceSkillUsesAtLeast === 'object') {
        const skillId = condition.sourceSkillUsesAtLeast.skillId;
        const minValue = Math.max(0, Number(condition.sourceSkillUsesAtLeast.value) || 0);
        if (!skillId || getSkillUseCount(actorState, skillId) < minValue) return false;
    }
    if (condition?.sourceSkillUsesAtMost && typeof condition.sourceSkillUsesAtMost === 'object') {
        const skillId = condition.sourceSkillUsesAtMost.skillId;
        const maxValue = Math.max(0, Number(condition.sourceSkillUsesAtMost.value) || 0);
        if (!skillId || getSkillUseCount(actorState, skillId) > maxValue) return false;
    }
    return true;
};

const computeTargetOptions = ({ match, actingUsername, actorSlot, skillIndex, characters }) => {
    const result = {
        targetType: null,
        mode: 'single',
        targets: [],
    };
    if (!match || !actingUsername) return result;

    const actorBoard = match.board?.[actingUsername] || [];
    const actorUnit = actorBoard[actorSlot];
    if (!actorUnit || actorUnit.alive === false || isUnitBanished(actorUnit)) return result;
    const actorState = ensureUnitStateShape(actorUnit);
    const actorCharacter =
        Number.isInteger(actorUnit?.rosterIndex) && Array.isArray(characters)
            ? characters[actorUnit.rosterIndex]
            : null;
    const actorCharacterId =
        (typeof actorCharacter?.id === 'string' && actorCharacter.id) ||
        (typeof actorCharacter?.characterId === 'string' && actorCharacter.characterId) ||
        null;
    const effectiveSkill = resolveEffectiveSkill({
        characters,
        rosterIndex: actorUnit.rosterIndex,
        skillIndex,
        actorState,
    });
    if (!doesActorSatisfySkillCondition(actorUnit, actorState, effectiveSkill)) {
        return result;
    }
    const bypassEnemyInvulnerability =
        canActorIgnoreEnemyInvulnerability(actorUnit, effectiveSkill?.id || null) ||
        doesSkillIgnoreInvulnerability(effectiveSkill);
    const targetType = effectiveSkill?.target || null;
    result.targetType = targetType;

    const opponentEntry = (match.players || []).find((p) => p.username !== actingUsername);
    const opponentUsername = opponentEntry?.username;
    const opponentBoard = opponentUsername ? match.board?.[opponentUsername] || [] : [];

    const aliveFilter = (unit) => unit && unit.alive !== false && !isUnitBanished(unit);
    const mapTargets = (
        username,
        units,
        { enemyTargeting = false, helpfulTargeting = false, skillClasses = [] } = {}
    ) =>
        units
            .map((unit, slot) => ({ unit, slot }))
            .filter(({ unit, slot }) => {
                if (!aliveFilter(unit)) return false;
                if (
                    enemyTargeting &&
                    isUnitInvulnerableForSkill(unit, skillClasses) &&
                    !bypassEnemyInvulnerability &&
                    !canActorIgnoreTargetInvulnerabilityBySourceMark({
                        actorCharacterId,
                        actorSkillId: effectiveSkill?.id || null,
                        targetUnit: unit,
                    })
                ) {
                    return false;
                }
                if (helpfulTargeting && isUnitInvulnerableToHelpfulSkills(unit)) {
                    return false;
                }
                if (!canActorTargetUnit({ actorState, targetUsername: username, targetSlot: slot })) return false;
                if (!doesUnitSatisfySkillTargetCondition(
                    unit, effectiveSkill, actingUsername, actorSlot
                )) return false;
                return true;
            })
            .map(({ unit, slot }) => ({
                username,
                slot,
                rosterIndex: unit.rosterIndex,
                alive: true,
            }));

    switch (targetType) {
        case 'single-enemy': {
            result.mode = 'single';
            result.targets = mapTargets(opponentUsername, opponentBoard, {
                enemyTargeting: true,
                skillClasses: effectiveSkill?.classes || [],
            });
            break;
        }
        case 'all-enemy': {
            result.mode = 'all';
            result.targets = mapTargets(opponentUsername, opponentBoard, {
                enemyTargeting: true,
                skillClasses: effectiveSkill?.classes || [],
            });
            break;
        }
        case 'self': {
            result.mode = 'self';
            result.targets = mapTargets(actingUsername, actorBoard, { helpfulTargeting: true }).filter(
                (t) => t.slot === actorSlot
            );
            break;
        }
        case 'single-ally': {
            result.mode = 'single';
            result.targets = mapTargets(actingUsername, actorBoard, { helpfulTargeting: true }).filter(
                (t) => t.slot !== actorSlot
            );
            break;
        }
        case 'self-or-single-ally': {
            result.mode = 'single';
            result.targets = mapTargets(actingUsername, actorBoard, { helpfulTargeting: true });
            break;
        }
        case 'all-ally':
        case 'all-allies': {
            result.mode = 'all';
            result.targets = mapTargets(actingUsername, actorBoard, { helpfulTargeting: true });
            break;
        }
        case 'single-character': {
            // "One ally or one enemy" -- excludes the caster themself, same as
            // single-ally does, so this differs from self-or-single-ally.
            result.mode = 'single';
            result.targets = [
                ...mapTargets(actingUsername, actorBoard, { helpfulTargeting: true }).filter(
                    (t) => t.slot !== actorSlot
                ),
                ...mapTargets(opponentUsername, opponentBoard, {
                    enemyTargeting: true,
                    skillClasses: effectiveSkill?.classes || [],
                }),
            ];
            break;
        }
        case 'single-target': {
            result.mode = 'single';
            result.targets = [
                ...mapTargets(actingUsername, actorBoard, { helpfulTargeting: true }),
                ...mapTargets(opponentUsername, opponentBoard, {
                    enemyTargeting: true,
                    skillClasses: effectiveSkill?.classes || [],
                }),
            ];
            break;
        }
        case 'all-target':
        case 'all-characters': {
            result.mode = 'all';
            result.targets = [
                ...mapTargets(actingUsername, actorBoard, { helpfulTargeting: true }),
                ...mapTargets(opponentUsername, opponentBoard, {
                    enemyTargeting: true,
                    skillClasses: effectiveSkill?.classes || [],
                }),
            ];
            break;
        }
        default: {
            result.mode = 'unknown';
            result.targets = [];
            break;
        }
    }

    return result;
};

const validateTargetSelection = ({ mode, targets }, selection) => {
    if (!selection) return false;
    const selectionArr = Array.isArray(selection) ? selection : [selection];
    const availableKeys = new Set((targets || []).map((t) => `${t.username}:${t.slot}`));

    if (mode === 'single' || mode === 'self') {
        if (selectionArr.length !== 1) return false;
        const key = `${selectionArr[0].username}:${selectionArr[0].slot}`;
        return availableKeys.has(key);
    }

    return selectionArr.every((sel) => availableKeys.has(`${sel.username}:${sel.slot}`));
};

const getUnitState = (match, username, slot) => {
    const unit = match?.board?.[username]?.[slot];
    if (!unit) return null;
    return ensureUnitStateShape(unit);
};

const normalizeEnergyCost = (energy = []) => {
    const reservedSpecific = createEmptyChakraCost();
    let requiredRandom = 0;
    (Array.isArray(energy) ? energy : []).forEach((entry) => {
        const normalized = typeof entry === 'string' ? entry.trim().toLowerCase() : '';
        if (normalized === 'random') {
            requiredRandom += 1;
            return;
        }
        if (Object.prototype.hasOwnProperty.call(reservedSpecific, normalized)) {
            reservedSpecific[normalized] += 1;
        }
    });
    return { reservedSpecific, requiredRandom };
};

const normalizeSkillCostOverride = (override = {}) => {
    const normalized = normalizeEnergyCost(Array.isArray(override?.energy) ? override.energy : []);
    if (Number.isFinite(override?.requiredRandom)) {
        normalized.requiredRandom = Math.max(0, Number(override.requiredRandom) || 0);
    }
    if (Number.isFinite(override?.random)) {
        normalized.requiredRandom = Math.max(0, Number(override.random) || 0);
    }
    if (override?.reservedSpecific && typeof override.reservedSpecific === 'object') {
        chakraTypes.forEach((type) => {
            if (Number.isFinite(override.reservedSpecific[type])) {
                normalized.reservedSpecific[type] = Math.max(0, Number(override.reservedSpecific[type]) || 0);
            }
        });
    }
    chakraTypes.forEach((type) => {
        if (Number.isFinite(override?.[type])) {
            normalized.reservedSpecific[type] = Math.max(0, Number(override[type]) || 0);
        }
    });
    return normalized;
};

const getSkillCostOverrideForSkill = (actorState, skillId) => {
    if (!skillId) return null;
    const statuses = Array.isArray(actorState?.statuses) ? actorState.statuses : [];
    let resolvedOverride = null;
    statuses.forEach((status) => {
        const remaining = Number(status?.remainingTurns) || 0;
        if (remaining <= 0) return;
        const overrides = status?.metadata?.skillCostOverridesBySkillId;
        if (!overrides || typeof overrides !== 'object') return;
        const overrideByRemaining = status?.metadata?.skillCostOverridesByRemainingTurns;
        const override =
            (overrideByRemaining && typeof overrideByRemaining === 'object'
                ? overrideByRemaining[String(remaining)] || overrideByRemaining[remaining]
                : null) || overrides[skillId];
        if (!override || typeof override !== 'object') return;
        resolvedOverride = normalizeSkillCostOverride(override);
    });
    return resolvedOverride;
};

const getOverrideAllSkillsToAllRandomConfig = (actorState, skillId) => {
    const statuses = Array.isArray(actorState?.statuses) ? actorState.statuses : [];
    let resolvedConfig = null;
    statuses.forEach((status) => {
        const remaining = Number(status?.remainingTurns) || 0;
        if (remaining <= 0) return;
        const metadata = status?.metadata || {};
        if (!Boolean(metadata.overrideAllSkillsToAllRandom)) return;
        const restrictedSkillIds = Array.isArray(metadata.overrideAllSkillsToAllRandomSkillIdsAny)
            ? metadata.overrideAllSkillsToAllRandomSkillIdsAny
                  .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
                  .filter(Boolean)
            : [];
        if (restrictedSkillIds.length > 0 && !restrictedSkillIds.includes(skillId || '')) {
            return;
        }
        resolvedConfig = metadata;
    });
    return resolvedConfig;
};

const computeEffectiveEnergyCost = ({ skill, actorState }) => {
    const base = normalizeEnergyCost(skill?.energy || []);
    const skillOverride = getSkillCostOverrideForSkill(actorState, skill?.id || null);
    if (skillOverride) {
        return skillOverride;
    }
    const allRandomOverride = getOverrideAllSkillsToAllRandomConfig(actorState, skill?.id || null);
    if (allRandomOverride) {
        const totalCost =
            chakraTypes.reduce((sum, type) => sum + Math.max(0, Number(base.reservedSpecific?.[type]) || 0), 0) +
            Math.max(0, Number(base.requiredRandom) || 0);
        return {
            reservedSpecific: createEmptyChakraCost(),
            requiredRandom: totalCost,
        };
    }
    const totals = getStatusMetadataTotals(actorState || { statuses: [] });
    const reservedSpecific = { ...base.reservedSpecific };
    chakraTypes.forEach((type) => {
        const reductionKey = `${type}CostReduction`;
        const increaseKey = `${type}CostIncrease`;
        const reduction = Math.max(0, Number(totals[reductionKey]) || 0);
        const increase = Math.max(0, Number(totals[increaseKey]) || 0);
        reservedSpecific[type] = Math.max(0, (reservedSpecific[type] || 0) - reduction + increase);
    });
    const randomReduction = Math.max(0, totals.randomCostReduction);
    let randomIncrease = Math.max(0, totals.randomCostIncrease);
    const skillIsMental =
        Array.isArray(skill?.classes) &&
        skill.classes.some(
            (entry) => typeof entry === 'string' && entry.trim().toLowerCase() === 'mental'
        );
    if (!skillIsMental) {
        const statuses = Array.isArray(actorState?.statuses) ? actorState.statuses : [];
        const nonMentalIncrease = statuses.reduce((sum, status) => {
            const remaining = Number(status?.remainingTurns) || 0;
            if (remaining <= 0) return sum;
            return sum + Math.max(0, Number(status?.metadata?.nonMentalRandomCostIncrease) || 0);
        }, 0);
        randomIncrease += nonMentalIncrease;
    }
    const skillClassesForCostIncrease = Array.isArray(skill?.classes) ? skill.classes : [];
    const classScopedIncrease = (Array.isArray(actorState?.statuses) ? actorState.statuses : []).reduce(
        (sum, status) => {
            const remaining = Number(status?.remainingTurns) || 0;
            if (remaining <= 0) return sum;
            const map =
                status?.metadata?.randomCostIncreaseForSkillClasses &&
                typeof status.metadata.randomCostIncreaseForSkillClasses === 'object'
                    ? status.metadata.randomCostIncreaseForSkillClasses
                    : null;
            if (!map) return sum;
            let statusIncrease = 0;
            Object.entries(map).forEach(([className, amount]) => {
                if (!hasSkillClass(skillClassesForCostIncrease, className)) return;
                statusIncrease = Math.max(statusIncrease, Math.max(0, Number(amount) || 0));
            });
            return sum + statusIncrease;
        },
        0
    );
    randomIncrease += classScopedIncrease;
    if (skillHasHarmfulEffects(skill)) {
        randomIncrease += (Array.isArray(actorState?.statuses) ? actorState.statuses : []).reduce(
            (sum, status) => (Number(status?.remainingTurns) || 0) > 0
                ? sum + Math.max(0, Number(status?.metadata?.randomCostIncreaseForHarmfulSkills) || 0)
                : sum,
            0
        );
    }
    return {
        reservedSpecific,
        requiredRandom: Math.max(0, base.requiredRandom + randomIncrease - randomReduction),
    };
};

const getEffectiveEnergyCostCountForTypes = (skill, actorState, energyTypes = []) => {
    const normalizedTypes = Array.isArray(energyTypes)
        ? energyTypes
              .map((entry) => (typeof entry === 'string' ? entry.trim().toLowerCase() : ''))
              .filter(Boolean)
        : [];
    if (!normalizedTypes.length) return 0;
    const effectiveCost = computeEffectiveEnergyCost({ skill, actorState });
    return normalizedTypes.reduce(
        (sum, type) => sum + Math.max(0, Number(effectiveCost?.reservedSpecific?.[type]) || 0),
        0
    );
};

const hasStatus = (actorState, statusId) =>
    Array.isArray(actorState?.statuses) &&
    actorState.statuses.some((status) => status?.id === statusId && (status.remainingTurns || 0) > 0);

const hasStatusMetadataFlag = (actorState, flagName) =>
    Array.isArray(actorState?.statuses) &&
    actorState.statuses.some((status) => {
        return isStatusActiveForMetadata(status) && Boolean(status?.metadata?.[flagName]);
    });

const isUnitImmuneToChakraLoss = (unit) =>
    Boolean(unit && unit.alive !== false &&
        hasStatusMetadataFlag(ensureUnitStateShape(unit), 'immuneToChakraRemovalAndStealing'));

const pickRandomEntry = (entries = []) => {
    if (!Array.isArray(entries) || !entries.length) return null;
    return entries[Math.floor(Math.random() * entries.length)] || null;
};

const parseTrackedUnitKey = (rawValue) => {
    if (typeof rawValue !== 'string' || !rawValue) return null;
    const [username, slotRaw] = rawValue.split(':');
    const slot = Number.parseInt(slotRaw, 10);
    if (!username || !Number.isInteger(slot) || slot < 0) return null;
    return { username, slot };
};

const pickTrackedEnemyEntry = ({
    aliveEnemyEntries = [],
    opponentUsername = '',
    strategy = '',
    previousKey = '',
    mustChangeTarget = false,
}) => {
    if (!Array.isArray(aliveEnemyEntries) || !aliveEnemyEntries.length) return null;
    const normalizedStrategy =
        typeof strategy === 'string' ? strategy.trim().toLowerCase() : '';
    const previous = parseTrackedUnitKey(previousKey);
    let pool = aliveEnemyEntries.slice();
    const shouldAvoidPrevious =
        mustChangeTarget ||
        normalizedStrategy === 'nearest-other-enemy' ||
        normalizedStrategy === 'different-random-enemy';
    if (shouldAvoidPrevious && previous && pool.length > 1) {
        const filtered = pool.filter((entry) => {
            const slot = Number.isInteger(entry?.enemySlot) ? entry.enemySlot : Number.parseInt(entry?.enemySlot, 10);
            return !(opponentUsername === previous.username && slot === previous.slot);
        });
        if (filtered.length > 0) {
            pool = filtered;
        }
    }
    if (
        (normalizedStrategy === 'nearest-enemy' || normalizedStrategy === 'nearest-other-enemy') &&
        previous
    ) {
        const sameTeamPool = pool.filter(
            (entry) => entry && opponentUsername === previous.username && Number.isInteger(entry.enemySlot)
        );
        const distancePool = sameTeamPool.length > 0 ? sameTeamPool : pool;
        return (
            distancePool
                .slice()
                .sort((a, b) => {
                    const distanceA = Math.abs(Number(a.enemySlot) - previous.slot);
                    const distanceB = Math.abs(Number(b.enemySlot) - previous.slot);
                    if (distanceA !== distanceB) return distanceA - distanceB;
                    return Number(a.enemySlot) - Number(b.enemySlot);
                })[0] || null
        );
    }
    return pickRandomEntry(pool);
};

const getTemplateMetadataValue = (metadata = {}, key = '') => {
    if (!metadata || typeof metadata !== 'object' || !key) return undefined;
    if (metadata[key] !== undefined && metadata[key] !== null) {
        return metadata[key];
    }
    const normalizedKey = String(key).toLowerCase();
    const matchedEntry = Object.entries(metadata).find(([entryKey, entryValue]) => {
        if (entryValue === undefined || entryValue === null) return false;
        return String(entryKey).toLowerCase() === normalizedKey;
    });
    return matchedEntry ? matchedEntry[1] : undefined;
};

const renderTooltipTemplate = (template, metadata = {}) => {
    if (typeof template !== 'string' || !template) return template;
    return template.replace(/\{([a-zA-Z0-9_]+)\}|\[([a-zA-Z0-9_]+)\]/g, (_, braceKey, bracketKey) => {
        const key = braceKey || bracketKey || '';
        const value = getTemplateMetadataValue(metadata, key);
        if (value === undefined || value === null) return '';
        return String(value);
    });
};

const changeStatusMetadataStack = (status, key, amount) => {
    if (!status || typeof key !== 'string' || !key || !Number.isFinite(Number(amount))) return;
    const metadata = status.metadata || {};
    const current = Math.max(0, Number(metadata[key]) || 0);
    status.metadata = { ...metadata, [key]: Math.max(0, current + Number(amount)) };
    if (typeof status.metadata.tooltipTextTemplate === 'string' && status.metadata.tooltipTextTemplate) {
        status.metadata.tooltipText = renderTooltipTemplate(status.metadata.tooltipTextTemplate, status.metadata);
    }
};

const refreshDerivedStatusTooltips = (targetState) => {
    const statuses = Array.isArray(targetState?.statuses) ? targetState.statuses : [];
    if (!statuses.length) return;
    const activeStatuses = statuses.filter((status) => (Number(status?.remainingTurns) || 0) > 0);
    statuses.forEach((status) => {
        const metadata = status?.metadata || {};
        const aggregateStatusIds = Array.isArray(metadata.tooltipAggregateStatusIds)
            ? metadata.tooltipAggregateStatusIds.filter((entry) => typeof entry === 'string' && entry)
            : [];
        const aggregateMetadataKey =
            typeof metadata.tooltipAggregateMetadataKey === 'string' && metadata.tooltipAggregateMetadataKey
                ? metadata.tooltipAggregateMetadataKey
                : '';
        if (!aggregateStatusIds.length || !aggregateMetadataKey) {
            if (typeof metadata.tooltipTextTemplate === 'string' && metadata.tooltipTextTemplate) {
                status.metadata = {
                    ...metadata,
                    tooltipText: renderTooltipTemplate(metadata.tooltipTextTemplate, metadata),
                };
            }
            return;
        }
        const aggregateSet = new Set(aggregateStatusIds);
        const total = activeStatuses.reduce((sum, entry) => {
            if (!aggregateSet.has(entry?.id)) return sum;
            return sum + Math.max(0, Number(entry?.metadata?.[aggregateMetadataKey]) || 0);
        }, 0);
        const nextMetadata = {
            ...metadata,
            [aggregateMetadataKey]: total,
        };
        if (typeof metadata.tooltipTextTemplate === 'string' && metadata.tooltipTextTemplate) {
            nextMetadata.tooltipText = renderTooltipTemplate(metadata.tooltipTextTemplate, nextMetadata);
        }
        status.metadata = nextMetadata;
    });
};

const consumeStatus = (actorState, statusId) => {
    if (!Array.isArray(actorState?.statuses)) return;
    const nextStatuses = actorState.statuses.filter(
        (status) => status?.id !== statusId || status?.metadata?.passive === true
    );
    if (nextStatuses.length !== actorState.statuses.length) {
        actorState.statuses = nextStatuses;
        refreshDerivedStatusTooltips(actorState);
    }
};

const getCastStartNextUsedSkillCooldownAdjustment = (castStartStatuses = []) => {
    if (!Array.isArray(castStartStatuses) || !castStartStatuses.length) {
        return { amount: 0, statusIdsToConsume: [] };
    }
    return castStartStatuses.reduce(
        (result, status) => {
            const remaining = Number(status?.remainingTurns) || 0;
            if (remaining <= 0) return result;
            const metadata = status?.metadata || {};
            const adjustment = Number(metadata?.nextUsedSkillCooldownAdjustment) || 0;
            if (!adjustment) return result;
            result.amount += adjustment;
            if (metadata?.consumeOnNextSkillUse !== false && typeof status?.id === 'string' && status.id) {
                result.statusIdsToConsume.push(status.id);
            }
            return result;
        },
        { amount: 0, statusIdsToConsume: [] }
    );
};

const doesEffectConditionMatch = ({
    condition,
    actorState,
    targetState,
    actorUnit,
    targetUnit,
    actorUsername = null,
    targetUsername = null,
}) => {
    if (!condition || typeof condition !== 'object') return true;
    if (Array.isArray(condition.all) && condition.all.length > 0) {
        return condition.all.every((entry) =>
            doesEffectConditionMatch({
                condition: entry,
                actorState,
                targetState,
                actorUnit,
                targetUnit,
                actorUsername,
                targetUsername,
            })
        );
    }
    const scope = condition.scope === 'target' ? 'target' : 'self';
    const scopedState = scope === 'target' ? targetState : actorState;
    if (!scopedState) return false;
    const targetRelation = typeof condition?.targetRelation === 'string' ? condition.targetRelation.trim().toLowerCase() : '';
    if (targetRelation) {
        const sameUnit = Boolean(actorUnit && targetUnit && actorUnit === targetUnit);
        const sameTeam = Boolean(
            typeof actorUsername === 'string' &&
                typeof targetUsername === 'string' &&
                actorUsername &&
                targetUsername &&
                actorUsername === targetUsername
        );
        if (targetRelation === 'self' && !sameUnit) return false;
        if (targetRelation === 'ally' && (!sameTeam || sameUnit)) return false;
        if (targetRelation === 'enemy' && sameTeam) return false;
    }
    if (condition.statusId && !hasStatus(scopedState, condition.statusId)) return false;
    if (condition.statusId && condition.statusFromActor) {
        const actorSlot = Number.isInteger(actorUnit?.slot) ? actorUnit.slot : null;
        const appliedByActor = (scopedState.statuses || []).some((status) =>
            status?.id === condition.statusId &&
            (Number(status?.remainingTurns) || 0) > 0 &&
            status?.sourceUsername === actorUsername &&
            (actorSlot === null || status?.sourceSlot === actorSlot)
        );
        if (!appliedByActor) return false;
    }
    if (
        Array.isArray(condition?.statusIdsAny) &&
        condition.statusIdsAny.length > 0 &&
        !condition.statusIdsAny.some((statusId) => hasStatus(scopedState, statusId))
    ) {
        return false;
    }
    if (condition.missingStatusId && hasStatus(scopedState, condition.missingStatusId)) return false;
    if (condition.statusMetadataAtLeast && typeof condition.statusMetadataAtLeast === 'object') {
        const statusId = condition.statusMetadataAtLeast.statusId;
        const metadataKey = condition.statusMetadataAtLeast.metadataKey;
        const minValue = Number(condition.statusMetadataAtLeast.value) || 0;
        if (!statusId || !metadataKey) return false;
        const status = Array.isArray(scopedState.statuses)
            ? scopedState.statuses.find(
                  (entry) => entry?.id === statusId && (Number(entry?.remainingTurns) || 0) > 0
              )
            : null;
        const metadataValue = Math.max(0, Number(status?.metadata?.[metadataKey]) || 0);
        if (metadataValue < minValue) return false;
    }
    if (condition.statusMetadataEquals && typeof condition.statusMetadataEquals === 'object') {
        const statusId = condition.statusMetadataEquals.statusId;
        const metadataKey = condition.statusMetadataEquals.metadataKey;
        const expectedValue = condition.statusMetadataEquals.value;
        if (!statusId || !metadataKey) return false;
        const status = Array.isArray(scopedState.statuses)
            ? scopedState.statuses.find(
                  (entry) => entry?.id === statusId && (Number(entry?.remainingTurns) || 0) > 0
              )
            : null;
        if (!status || status?.metadata?.[metadataKey] !== expectedValue) return false;
    }
    const scopedUnit = scope === 'target' ? targetUnit : actorUnit;
    const sourceCurrentHpAtMost = Number(condition?.sourceCurrentHpAtMost);
    if (Number.isFinite(sourceCurrentHpAtMost)) {
        const currentHp = Math.max(0, Number(scopedUnit?.hp) || 0);
        if (currentHp > sourceCurrentHpAtMost) return false;
    }
    const sourceCurrentHpAtLeast = Number(condition?.sourceCurrentHpAtLeast);
    if (Number.isFinite(sourceCurrentHpAtLeast)) {
        const currentHp = Math.max(0, Number(scopedUnit?.hp) || 0);
        if (currentHp < sourceCurrentHpAtLeast) return false;
    }
    if (scope === 'self' && condition?.sourceSkillUsesAtLeast && typeof condition.sourceSkillUsesAtLeast === 'object') {
        const skillId = condition.sourceSkillUsesAtLeast.skillId;
        const minValue = Math.max(0, Number(condition.sourceSkillUsesAtLeast.value) || 0);
        if (!skillId || getSkillUseCount(actorState, skillId) < minValue) return false;
    }
    if (scope === 'self' && condition?.sourceSkillUsesAtMost && typeof condition.sourceSkillUsesAtMost === 'object') {
        const skillId = condition.sourceSkillUsesAtMost.skillId;
        const maxValue = Math.max(0, Number(condition.sourceSkillUsesAtMost.value) || 0);
        if (!skillId || getSkillUseCount(actorState, skillId) > maxValue) return false;
    }
    return true;
};

const isConditionalDamageOverrideOnly = (condition) => {
    if (!condition || typeof condition !== 'object') return false;
    if (condition.requireMatch === true) return false;
    if (!Number.isFinite(condition?.conditionalAmount)) return false;
    if (Array.isArray(condition.all)) {
        return condition.all.every((entry) => isConditionalDamageOverrideOnly({
            ...(entry || {}),
            conditionalAmount: condition.conditionalAmount,
        }));
    }
    const recognizedKeys = new Set([
        'statusId',
        'statusIdsAny',
        'missingStatusId',
        'scope',
        'conditionalAmount',
        'consumeOnMatch',
    ]);
    return Object.keys(condition).every((key) => recognizedKeys.has(key));
};

const chooseRandomOption = (options = [], excludeValue = undefined) => {
    const pool = Array.isArray(options)
        ? options.filter((entry) => entry !== undefined && entry !== null && entry !== excludeValue)
        : [];
    if (!pool.length) return excludeValue;
    return pool[Math.floor(Math.random() * pool.length)];
};

const applyStatus = ({
    targetState,
    statusId,
    duration,
    sourceSkillId,
    sourceUsername = null,
    sourceSlot = null,
    metadata,
    fresh = false,
}) => {
    if (!targetState || !statusId) return;
    if (metadata?.cannotUseSkills && getStatusMetadataTotals(targetState).stunImmune) {
        return;
    }
    const applyStackDerivedNumericKeys = (nextMetadata) => {
        if (!nextMetadata || typeof nextMetadata !== 'object') return nextMetadata;
        const stackKey =
            typeof nextMetadata?.stackMetadataKey === 'string' && nextMetadata.stackMetadataKey
                ? nextMetadata.stackMetadataKey
                : '';
        const derivedConfig =
            nextMetadata?.stackDerivedNumericKeys && typeof nextMetadata.stackDerivedNumericKeys === 'object'
                ? nextMetadata.stackDerivedNumericKeys
                : null;
        if (!stackKey || !derivedConfig) return nextMetadata;
        const stackValue = Math.max(0, Number(nextMetadata?.[stackKey]) || 0);
        const updated = { ...(nextMetadata || {}) };
        Object.entries(derivedConfig).forEach(([key, multiplier]) => {
            if (!key) return;
            updated[key] = stackValue * (Number(multiplier) || 0);
        });
        return updated;
    };
    const normalizedDuration = Math.max(0, Number(duration) || 0);
    const existing = targetState.statuses.find((status) => status?.id === statusId);
    if (existing) {
        existing.remainingTurns = Math.max(existing.remainingTurns || 0, normalizedDuration);
        existing.sourceSkillId = sourceSkillId || existing.sourceSkillId;
        existing.sourceUsername = sourceUsername || existing.sourceUsername || null;
        existing.sourceSlot = Number.isInteger(sourceSlot) ? sourceSlot : existing.sourceSlot ?? null;
        if (Boolean(metadata?.stackable) || Boolean(existing?.metadata?.stackable)) {
            const maxStacks = Math.max(1, Number(metadata?.maxStacks || existing?.metadata?.maxStacks) || 99);
            existing.stacks = Math.min(maxStacks, (Number(existing.stacks) || 1) + 1);
        }
        let nextMetadata = { ...(existing.metadata || {}), ...(metadata || {}) };
        if (existing.stacks) {
            nextMetadata.stacks = existing.stacks;
        }
        const mergeNumericAddKeys = Array.isArray(metadata?.mergeNumericAddKeys)
            ? metadata.mergeNumericAddKeys.filter((key) => typeof key === 'string' && key)
            : [];
        mergeNumericAddKeys.forEach((key) => {
            const previousValue = Number(existing?.metadata?.[key]) || 0;
            const incomingValue = Number(metadata?.[key]) || 0;
            nextMetadata[key] = previousValue + incomingValue;
        });
        if (typeof metadata?.stackMetadataKey === 'string' && metadata.stackMetadataKey) {
            const stackKey = metadata.stackMetadataKey;
            const delta = Number(metadata?.stackDelta) || 0;
            const cap = Math.max(1, Number(metadata?.stackMax) || 1);
            const previous = Math.max(0, Number(existing?.metadata?.[stackKey]) || 0);
            nextMetadata[stackKey] = Math.min(cap, Math.max(0, previous + delta));
        }
        nextMetadata = applyStackDerivedNumericKeys(nextMetadata);
        if (typeof metadata?.tooltipTextTemplate === 'string' && metadata.tooltipTextTemplate) {
            nextMetadata.tooltipText = renderTooltipTemplate(metadata.tooltipTextTemplate, nextMetadata);
        }
        const prevBonuses =
            existing?.metadata?.skillDamageBonuses &&
            typeof existing.metadata.skillDamageBonuses === 'object'
                ? existing.metadata.skillDamageBonuses
                : null;
        const incomingBonuses =
            metadata?.skillDamageBonuses && typeof metadata.skillDamageBonuses === 'object'
                ? metadata.skillDamageBonuses
                : null;
        if (prevBonuses || incomingBonuses) {
            if (metadata?.mergeSkillDamageBonuses && !metadata?.replaceSkillDamageBonuses) {
                const mergedBonuses = { ...(prevBonuses || {}) };
                Object.entries(incomingBonuses || {}).forEach(([skillId, value]) => {
                    mergedBonuses[skillId] = (Number(mergedBonuses[skillId]) || 0) + (Number(value) || 0);
                });
                nextMetadata.skillDamageBonuses = mergedBonuses;
            } else {
                nextMetadata.skillDamageBonuses = { ...(incomingBonuses || {}) };
            }
        }
        const mergeObjectNumericAddKeys = Array.isArray(metadata?.mergeObjectNumericAddKeys)
            ? metadata.mergeObjectNumericAddKeys.filter((key) => typeof key === 'string' && key)
            : [];
        mergeObjectNumericAddKeys.forEach((key) => {
            const previousObject =
                existing?.metadata?.[key] && typeof existing.metadata[key] === 'object' ? existing.metadata[key] : {};
            const incomingObject = metadata?.[key] && typeof metadata[key] === 'object' ? metadata[key] : {};
            const mergedObject = { ...previousObject };
            Object.entries(incomingObject).forEach(([entryKey, value]) => {
                mergedObject[entryKey] = (Number(mergedObject[entryKey]) || 0) + (Number(value) || 0);
            });
            nextMetadata[key] = mergedObject;
        });
        existing.metadata = nextMetadata;
        existing.fresh = Boolean(fresh);
        const applyStatusAtStack = nextMetadata?.applyStatusAtStack;
        if (applyStatusAtStack && typeof applyStatusAtStack === 'object') {
            const stackKey =
                typeof applyStatusAtStack.metadataKey === 'string' && applyStatusAtStack.metadataKey
                    ? applyStatusAtStack.metadataKey
                    : '';
            const stackValue = Math.max(0, Number(nextMetadata?.[stackKey]) || 0);
            const threshold = Math.max(1, Number(applyStatusAtStack.value) || 1);
            if (stackKey && stackValue >= threshold && applyStatusAtStack.statusId) {
                applyStatus({
                    targetState,
                    statusId: applyStatusAtStack.statusId,
                    duration: applyStatusAtStack.duration,
                    sourceSkillId: sourceSkillId || null,
                    sourceUsername: sourceUsername || null,
                    sourceSlot: Number.isInteger(sourceSlot) ? sourceSlot : null,
                    metadata: applyStatusAtStack.metadata || {},
                    fresh: false,
                });
            }
        }
        refreshDerivedStatusTooltips(targetState);
        return;
    }
    let createdMetadata =
        typeof metadata?.stackMetadataKey === 'string' &&
        metadata.stackMetadataKey &&
        typeof metadata?.tooltipTextTemplate === 'string' &&
        metadata.tooltipTextTemplate
            ? {
                  ...(metadata || {}),
              }
            : metadata || {};
    if (typeof metadata?.stackMetadataKey === 'string' && metadata.stackMetadataKey) {
        const stackKey = metadata.stackMetadataKey;
        const cap = Math.max(1, Number(metadata?.stackMax) || 1);
        const initialFromMetadata = Number(metadata?.[stackKey]);
        const initialFromDelta = Number(metadata?.stackDelta);
        const fallbackInitial = Number.isFinite(initialFromDelta) ? initialFromDelta : 1;
        const normalizedInitial = Number.isFinite(initialFromMetadata) ? initialFromMetadata : fallbackInitial;
        createdMetadata = {
            ...(createdMetadata || {}),
            [stackKey]: Math.min(cap, Math.max(0, normalizedInitial)),
        };
    }
    createdMetadata = applyStackDerivedNumericKeys(createdMetadata);
    const randomizeOnApplyConfig =
        createdMetadata?.randomizeMetadataKeyFromOptions &&
        typeof createdMetadata.randomizeMetadataKeyFromOptions === 'object'
            ? createdMetadata.randomizeMetadataKeyFromOptions
            : null;
    if (randomizeOnApplyConfig) {
        const metadataKey =
            typeof randomizeOnApplyConfig.metadataKey === 'string' && randomizeOnApplyConfig.metadataKey
                ? randomizeOnApplyConfig.metadataKey
                : '';
        const options = Array.isArray(randomizeOnApplyConfig.options)
            ? randomizeOnApplyConfig.options
            : Array.isArray(randomizeOnApplyConfig.values)
            ? randomizeOnApplyConfig.values
            : [];
        if (metadataKey && options.length > 0) {
            const currentValue = createdMetadata?.[metadataKey];
            const chosenValue = chooseRandomOption(
                options.filter((entry) => !Boolean(randomizeOnApplyConfig.excludeCurrentValue) || entry !== currentValue),
                currentValue
            );
            createdMetadata[metadataKey] = chosenValue;
        }
    }
    if (typeof metadata?.tooltipTextTemplate === 'string' && metadata.tooltipTextTemplate) {
        createdMetadata.tooltipText = renderTooltipTemplate(metadata.tooltipTextTemplate, createdMetadata);
    }
    const createdStatus = {
        id: statusId,
        remainingTurns: normalizedDuration,
        sourceSkillId: sourceSkillId || null,
        sourceUsername: sourceUsername || null,
        sourceSlot: Number.isInteger(sourceSlot) ? sourceSlot : null,
        metadata: createdMetadata,
        fresh: Boolean(fresh),
    };
    targetState.statuses.push(createdStatus);
    const removeStatusIdsOnApply = Array.isArray(createdStatus?.metadata?.removeStatusIdsOnApply)
        ? createdStatus.metadata.removeStatusIdsOnApply.filter((id) => typeof id === 'string' && id)
        : [];
    if (removeStatusIdsOnApply.length > 0) {
        targetState.statuses = targetState.statuses.filter(
            (status) => !removeStatusIdsOnApply.includes(status?.id)
        );
    }
    const applyStatusAtStack = createdStatus?.metadata?.applyStatusAtStack;
    if (applyStatusAtStack && typeof applyStatusAtStack === 'object') {
        const stackKey =
            typeof applyStatusAtStack.metadataKey === 'string' && applyStatusAtStack.metadataKey
                ? applyStatusAtStack.metadataKey
                : '';
        const stackValue = Math.max(0, Number(createdStatus?.metadata?.[stackKey]) || 0);
        const threshold = Math.max(1, Number(applyStatusAtStack.value) || 1);
        if (stackKey && stackValue >= threshold && applyStatusAtStack.statusId) {
            applyStatus({
                targetState,
                statusId: applyStatusAtStack.statusId,
                duration: applyStatusAtStack.duration,
                sourceSkillId: sourceSkillId || null,
                sourceUsername: sourceUsername || null,
                sourceSlot: Number.isInteger(sourceSlot) ? sourceSlot : null,
                metadata: applyStatusAtStack.metadata || {},
                fresh: false,
            });
        }
    }
    refreshDerivedStatusTooltips(targetState);
};

const updateTeamPassiveAwakenings = ({ match, username, ownerTurnEnded = false }) => {
    const units = Array.isArray(match?.board?.[username]) ? match.board[username] : [];
    units.forEach((unit, slot) => {
        if (!unit || unit.alive === false) return;
        const state = ensureUnitStateShape(unit);
        const passive = state.statuses.find((status) =>
            status?.metadata?.passive === true && status?.metadata?.awakening?.statusId &&
            (Number(status.remainingTurns) || 0) > 0);
        const awakening = passive?.metadata?.awakening;
        if (!awakening || hasStatus(state, awakening.statusId)) return;
        if (ownerTurnEnded) {
            passive.metadata._awakeningOwnerTurns =
                Math.max(0, Number(passive.metadata._awakeningOwnerTurns) || 0) + 1;
        }
        const turnsReady = Math.max(0, Number(awakening.afterOwnerTurns) || 0) > 0 &&
            passive.metadata._awakeningOwnerTurns >= awakening.afterOwnerTurns;
        const allyHpBelow = Math.max(0, Number(awakening.allyHpBelow) || 0);
        const allyReady = allyHpBelow > 0 && units.some((ally, allySlot) =>
            allySlot !== slot && ally && Number(ally.hp) < allyHpBelow);
        if (!turnsReady && !allyReady) return;
        applyStatus({
            targetState: state, statusId: awakening.statusId, duration: 99,
            sourceUsername: username, sourceSlot: slot,
            metadata: { helpful: true, permanent: true, statusIcon: passive.metadata.statusIcon || '',
                ...(awakening.metadata || {}) }, fresh: false,
        });
        (Array.isArray(awakening.clearCooldownSkillIds) ? awakening.clearCooldownSkillIds : [])
            .forEach((skillId) => {
                if (typeof skillId === 'string' && skillId) delete state.cooldowns[skillId];
            });
    });
};

const applyExpireReplacementStatus = ({
    pendingExpireStatuses,
    sourceStatus,
    replacement,
}) => {
    if (!replacement || typeof replacement !== 'object' || !replacement.statusId) return;
    const inheritSourceMetadata = Boolean(
        replacement?.inheritSourceMetadata || replacement?.metadata?.inheritSourceMetadata
    );
    const sourceMetadata =
        sourceStatus?.metadata && typeof sourceStatus.metadata === 'object' ? sourceStatus.metadata : {};
    const replacementMetadata = {
        ...(inheritSourceMetadata ? sourceMetadata : {}),
        ...(replacement.metadata || {}),
    };
    delete replacementMetadata.inheritSourceMetadata;
    applyStatus({
        targetState: { statuses: pendingExpireStatuses },
        statusId: replacement.statusId,
        duration: replacement.duration,
        sourceSkillId:
            typeof replacement.sourceSkillId === 'string' && replacement.sourceSkillId
                ? replacement.sourceSkillId
                : sourceStatus?.sourceSkillId || null,
        sourceUsername:
            typeof replacement.sourceUsername === 'string' && replacement.sourceUsername
                ? replacement.sourceUsername
                : sourceStatus?.sourceUsername || null,
        sourceSlot: Number.isInteger(replacement.sourceSlot)
            ? replacement.sourceSlot
            : Number.isInteger(sourceStatus?.sourceSlot)
            ? sourceStatus.sourceSlot
            : null,
        metadata: replacementMetadata,
        fresh: false,
    });
};

const refreshStatusOnTeam = ({ match, username, statusId, duration }) => {
    if (!match || !username || !statusId) return;
    const units = Array.isArray(match.board?.[username]) ? match.board[username] : [];
    const normalizedDuration = Math.max(0, Number(duration) || 0);
    units.forEach((unit) => {
        if (!unit || unit.alive === false) return;
        const state = ensureUnitStateShape(unit);
        const statuses = Array.isArray(state.statuses) ? state.statuses : [];
        statuses.forEach((status) => {
            if (status?.id !== statusId) return;
            if ((Number(status?.remainingTurns) || 0) <= 0) return;
            status.remainingTurns = normalizedDuration;
        });
    });
};

const normalizeTargetSelection = (selection) => {
    const arr = Array.isArray(selection) ? selection : selection ? [selection] : [];
    return arr
        .map((target) => ({
            username: target?.username,
            slot: Number.parseInt(target?.slot, 10),
        }))
        .filter((target) => target.username && Number.isInteger(target.slot) && target.slot >= 0);
};

const setUnitHpFromSnapshot = (unit, snapshotKey) => {
    if (!unit || !snapshotKey) return false;
    const state = ensureUnitStateShape(unit);
    const snapshots = state?.snapshots && typeof state.snapshots === 'object' ? state.snapshots : {};
    const snapshotValue = Number(snapshots[snapshotKey]);
    if (!Number.isFinite(snapshotValue)) return false;
    unit.hp = Math.max(0, snapshotValue);
    unit.alive = unit.hp > 0;
    return true;
};

const resolveScalarEffectAmount = ({ effect, actorUnit, targetUnit = null }) => {
    let amount = Number(effect?.amount) || 0;
    if (Boolean(effect?.metadata?.amountFromSourceCurrentHp)) {
        amount += Math.max(0, Number(actorUnit?.hp) || 0);
    }
    if (Boolean(effect?.metadata?.amountFromSourceMissingHp)) {
        amount += Math.max(0, DEFAULT_HP - Math.max(0, Number(actorUnit?.hp) || 0));
    }
    if (Number.isFinite(effect?.metadata?.amountPerSourceMissingHpStep)) {
        const step = Math.max(1, Number(effect?.metadata?.sourceMissingHpStep) || 1);
        const missingHp = Math.max(0, DEFAULT_HP - Math.max(0, Number(actorUnit?.hp) || 0));
        amount +=
            Math.floor(missingHp / step) *
            Math.max(0, Number(effect.metadata.amountPerSourceMissingHpStep) || 0);
    }
    if (Boolean(effect?.metadata?.amountFromTargetCurrentHp)) {
        amount += Math.max(0, Number(targetUnit?.hp) || 0);
    }
    return Math.max(0, amount);
};

const getOutgoingDamageCap = (actorState, actorUnit = null) => {
    const statuses = Array.isArray(actorState?.statuses) ? actorState.statuses : [];
    let cap = null;
    statuses.forEach((status) => {
        if (!isStatusActiveForMetadata(status, actorUnit)) return;
        const nextCap = Number(status?.metadata?.maxDamageOutput);
        if (!Number.isFinite(nextCap) || nextCap < 0) return;
        cap = cap === null ? nextCap : Math.min(cap, nextCap);
    });
    return cap;
};

const resolveEffectDamageAmount = ({ effect, actorState, actorUnit, targetState, targetUnit = null, skillClasses = [] }) => {
    let amount = Number(effect?.amount) || 0;
    if (isUnitStunned(targetState, targetUnit)) {
        amount += Math.max(0, Number(effect?.metadata?.bonusDamageIfTargetStunned) || 0);
    }
    const effectiveSkillClasses = Array.isArray(skillClasses) ? [...skillClasses] : [];
    if (Boolean(effect?.metadata?.afflictionDamage) && !hasSkillClass(effectiveSkillClasses, 'affliction')) {
        effectiveSkillClasses.push('affliction');
    }
    const afflictionDamage =
        hasSkillClass(effectiveSkillClasses, 'affliction') || Boolean(effect?.metadata?.afflictionDamage);
    const sourceTotals = getStatusMetadataTotals(actorState);
    const classScopedSourceTotals = getSourceClassScopedDamageModifiers(actorState, effectiveSkillClasses);
    amount += (Number(sourceTotals.damageBonusFlat) || 0) - (Number(sourceTotals.damageDebuffFlat) || 0);
    amount +=
        (Number(classScopedSourceTotals.damageBonusFlat) || 0) -
        (Number(classScopedSourceTotals.damageDebuffFlat) || 0);
    if (!afflictionDamage && !Boolean(effect?.metadata?.ignoreSourceNonAfflictionDamageBonus)) {
        amount +=
            (Number(sourceTotals.nonAfflictionDamageBonusFlat) || 0) -
            (Number(sourceTotals.nonAfflictionDamageDebuffFlat) || 0);
        amount +=
            (Number(classScopedSourceTotals.nonAfflictionDamageBonusFlat) || 0) -
            (Number(classScopedSourceTotals.nonAfflictionDamageDebuffFlat) || 0);
    }
    const applyStackBonus = (currentAmount) => {
        let nextAmount = currentAmount;
        const stackBonus = effect?.metadata?.bonusPerStatusMetadata;
        if (!stackBonus || typeof stackBonus !== 'object') return nextAmount;
        const statusId = stackBonus.statusId;
        const metadataKey = stackBonus.metadataKey;
        const multiplier = Number(stackBonus.multiplier) || 0;
        if (!statusId || !metadataKey || multiplier === 0) return nextAmount;
        const scope = stackBonus.scope === 'self' ? 'self' : 'target';
        const scopedState = scope === 'self' ? actorState : targetState;
        const scopedStatus = Array.isArray(scopedState?.statuses)
            ? scopedState.statuses.find(
                  (status) => status?.id === statusId && (Number(status?.remainingTurns) || 0) > 0
              )
            : null;
        const value = Math.max(0, Number(scopedStatus?.metadata?.[metadataKey]) || 0);
        nextAmount += value * multiplier;
        if (Boolean(stackBonus.consumeStacks) && scopedStatus) {
            changeStatusMetadataStack(scopedStatus, metadataKey, -value);
        }
        if (Boolean(stackBonus.consumeStatus) && scopedStatus) {
            consumeStatus(scopedState, statusId);
        }
        return nextAmount;
    };
    const condition = effect?.condition;
    if (!condition || !condition.statusId) {
        let resolvedAmount = applyStackBonus(amount);
        if (condition?.missingStatusId && hasStatus(targetState, condition.missingStatusId)) {
            resolvedAmount = applyStackBonus(amount);
        }
        if (Boolean(effect?.metadata?.amountFromSourceMissingHp)) {
            const currentHp = Math.max(0, Number(actorUnit?.hp) || 0);
            resolvedAmount += Math.max(0, DEFAULT_HP - currentHp);
        }
        if (Boolean(effect?.metadata?.amountFromSourceCurrentHp)) {
            resolvedAmount += Math.max(0, Number(actorUnit?.hp) || 0);
        }
        const unconditionalMissingHpStep = Math.max(0, Number(effect?.metadata?.amountFromSourceMissingHpStep) || 0);
        const unconditionalMissingHpDivisor = Math.max(1, Number(effect?.metadata?.amountFromSourceMissingHpDivisor) || 0);
        if (unconditionalMissingHpStep > 0 && unconditionalMissingHpDivisor > 0) {
            const currentHp = Math.max(0, Number(actorUnit?.hp) || 0);
            const missingHp = Math.max(0, DEFAULT_HP - currentHp);
            resolvedAmount += Math.floor(missingHp / unconditionalMissingHpDivisor) * unconditionalMissingHpStep;
        }
        const unconditionalTargetMissingHpStep = Math.max(0, Number(effect?.metadata?.amountFromTargetMissingHpStep) || 0);
        const unconditionalTargetMissingHpDivisor = Math.max(1, Number(effect?.metadata?.amountFromTargetMissingHpDivisor) || 0);
        if (unconditionalTargetMissingHpStep > 0 && unconditionalTargetMissingHpDivisor > 0) {
            const targetCurrentHp = Math.max(0, Number(targetUnit?.hp) || 0);
            const targetMissingHp = Math.max(0, DEFAULT_HP - targetCurrentHp);
            resolvedAmount +=
                Math.floor(targetMissingHp / unconditionalTargetMissingHpDivisor) * unconditionalTargetMissingHpStep;
        }
        if (Number.isFinite(effect?.metadata?.amountPerCrowStackOnTarget)) {
            const crowStatus = (targetState?.statuses || []).find(s => s.id === 'young_itachi_crow_stack' || s.metadata?.addCrowStackOnHarmfulSkillUse);
            const crowStacks = Math.max(0, Number(crowStatus?.stacks) || (crowStatus ? 1 : 0));
            resolvedAmount += Math.max(0, Number(effect.metadata.amountPerCrowStackOnTarget) * crowStacks);
        }
        const outgoingCap = getOutgoingDamageCap(actorState, actorUnit);
        return outgoingCap === null ? resolvedAmount : Math.min(resolvedAmount, outgoingCap);
    }
    const scope = condition.scope === 'target' ? 'target' : 'self';
    const scopedState = scope === 'target' ? targetState : actorState;
    if (!hasStatus(scopedState, condition.statusId)) {
        let resolvedAmount = applyStackBonus(amount);
        if (Boolean(effect?.metadata?.amountFromSourceMissingHp)) {
            const currentHp = Math.max(0, Number(actorUnit?.hp) || 0);
            resolvedAmount += Math.max(0, DEFAULT_HP - currentHp);
        }
        if (Boolean(effect?.metadata?.amountFromSourceCurrentHp)) {
            resolvedAmount += Math.max(0, Number(actorUnit?.hp) || 0);
        }
        return resolvedAmount;
    }
    if (Number.isFinite(condition.conditionalAmount)) {
        amount = Number(condition.conditionalAmount) || amount;
    }
    if (condition.consumeOnMatch) {
        consumeStatus(scopedState, condition.statusId);
    }
    let resolvedAmount = applyStackBonus(amount);
    if (Boolean(effect?.metadata?.amountFromSourceMissingHp)) {
        const currentHp = Math.max(0, Number(actorUnit?.hp) || 0);
        resolvedAmount += Math.max(0, DEFAULT_HP - currentHp);
    }
    if (Boolean(effect?.metadata?.amountFromSourceCurrentHp)) {
        resolvedAmount += Math.max(0, Number(actorUnit?.hp) || 0);
    }
    const missingHpStep = Math.max(0, Number(effect?.metadata?.amountFromSourceMissingHpStep) || 0);
    const missingHpDivisor = Math.max(1, Number(effect?.metadata?.amountFromSourceMissingHpDivisor) || 0);
    if (missingHpStep > 0 && missingHpDivisor > 0) {
        const currentHp = Math.max(0, Number(actorUnit?.hp) || 0);
        const missingHp = Math.max(0, DEFAULT_HP - currentHp);
        resolvedAmount += Math.floor(missingHp / missingHpDivisor) * missingHpStep;
    }
    const outgoingCap = getOutgoingDamageCap(actorState, actorUnit);
    return outgoingCap === null ? resolvedAmount : Math.min(resolvedAmount, outgoingCap);
};

const getTargetBonusDamageFromSource = ({ targetState, sourceCharacterId, sourceSkillId = null, sourceUsername = null, sourceSlot = null, skillClasses = [], afflictionDamage = false }) => {
    if (!targetState || !sourceCharacterId) return 0;
    const statuses = Array.isArray(targetState?.statuses) ? targetState.statuses : [];
    return statuses.reduce((sum, status) => {
        const remaining = Number(status?.remainingTurns) || 0;
        if (remaining <= 0) return sum;
        const metadata = status?.metadata || {};
        const flatBonus = Number(metadata?.bonusDamageFromSourceSkillsFlat) || 0;
        const nonAfflictionBonus = !afflictionDamage ? (Number(metadata?.bonusDamageFromSourceNonAfflictionFlat) || 0) : 0;
        let classBonus = 0;
        const skillClassBonusMap = metadata?.bonusDamageFromSourceSkillClassesAny;
        if (skillClassBonusMap && typeof skillClassBonusMap === 'object' && skillClasses.length > 0) {
            Object.entries(skillClassBonusMap).forEach(([className, amount]) => {
                if (hasSkillClass(skillClasses, className)) {
                    classBonus += Number(amount) || 0;
                }
            });
        }
        const allyNonAfflictionBonus =
            !afflictionDamage &&
            sourceUsername &&
            sourceUsername === status?.sourceUsername &&
            Number.isInteger(sourceSlot) &&
            Number.isInteger(status?.sourceSlot) &&
            sourceSlot !== status.sourceSlot
                ? Number(metadata?.bonusDamageFromSourceAlliesNonAfflictionFlat) || 0
                : 0;
        let bonus = flatBonus + nonAfflictionBonus + classBonus + allyNonAfflictionBonus;
        const perStack = Number(metadata?.bonusDamageFromSourceSkillsPerStack) || 0;
        const stackKey =
            typeof metadata?.bonusDamageFromSourceSkillsPerStackMetadataKey === 'string'
                ? metadata.bonusDamageFromSourceSkillsPerStackMetadataKey
                : '';
        if (perStack > 0 && stackKey) {
            bonus += perStack * Math.max(0, Number(metadata?.[stackKey]) || 0);
        }
        if (bonus <= 0) return sum;
        const requiredCharacterId =
            typeof metadata?.bonusDamageFromSourceCharacterId === 'string'
                ? metadata.bonusDamageFromSourceCharacterId
                : '';
        if (requiredCharacterId && requiredCharacterId !== sourceCharacterId) return sum;
        const requiredSkillIds = Array.isArray(metadata?.bonusDamageAppliesToSkillIds)
            ? metadata.bonusDamageAppliesToSkillIds
            : null;
        if (requiredSkillIds && requiredSkillIds.length > 0) {
            if (
                !sourceSkillId ||
                !requiredSkillIds.some((entry) => typeof entry === 'string' && entry === sourceSkillId)
            ) {
                return sum;
            }
        }
        return sum + bonus;
    }, 0);
};

const normalizeSkillClassName = (value) => {
    const norm = typeof value === 'string' ? value.trim().toLowerCase() : '';
    if (norm === 'energy') return 'chakra';
    return norm;
};

const hasSkillClass = (skillClasses = [], className = '') => {
    const target = normalizeSkillClassName(className);
    return (
        Array.isArray(skillClasses) &&
        skillClasses.some(
            (entry) => normalizeSkillClassName(entry) === target
        )
    );
};

const formatSkillClassLabel = (value = '') => {
    const normalized = normalizeSkillClassName(value);
    if (!normalized) return '';
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const getTargetClassScopedDamageModifiers = (targetState, skillClasses = []) => {
    const totals = { damageTakenBonusFlat: 0 };
    const statuses = Array.isArray(targetState?.statuses) ? targetState.statuses : [];
    statuses.forEach((status) => {
        const remaining = Number(status?.remainingTurns) || 0;
        if (remaining <= 0) return;
        const metadata = status?.metadata || {};
        const classBonusMap =
            metadata?.damageTakenBonusBySkillClass && typeof metadata.damageTakenBonusBySkillClass === 'object'
                ? metadata.damageTakenBonusBySkillClass
                : {};
        let statusBonus = 0;
        Object.entries(classBonusMap).forEach(([className, amount]) => {
            if (!hasSkillClass(skillClasses, className)) return;
            statusBonus = Math.max(statusBonus, Number(amount) || 0);
        });
        totals.damageTakenBonusFlat += statusBonus;
    });
    return totals;
};

const getSourceClassScopedDamageModifiers = (actorState, skillClasses = []) => {
    const totals = {
        damageBonusFlat: 0,
        damageDebuffFlat: 0,
        nonAfflictionDamageBonusFlat: 0,
        nonAfflictionDamageDebuffFlat: 0,
    };
    const statuses = Array.isArray(actorState?.statuses) ? actorState.statuses : [];
    statuses.forEach((status) => {
        const remaining = Number(status?.remainingTurns) || 0;
        if (remaining <= 0) return;
        const metadata = status?.metadata || {};
        const classBonusMap =
            metadata?.damageBonusBySkillClass && typeof metadata.damageBonusBySkillClass === 'object'
                ? metadata.damageBonusBySkillClass
                : {};
        Object.entries(classBonusMap).forEach(([className, amount]) => {
            if (!hasSkillClass(skillClasses, className)) return;
            totals.damageBonusFlat += Number(amount) || 0;
        });
        const classDebuffMap =
            metadata?.damageDebuffBySkillClass && typeof metadata.damageDebuffBySkillClass === 'object'
                ? metadata.damageDebuffBySkillClass
                : {};
        Object.entries(classDebuffMap).forEach(([className, amount]) => {
            if (!hasSkillClass(skillClasses, className)) return;
            totals.damageDebuffFlat += Math.max(0, Number(amount) || 0);
        });
        const classNonAfflictionBonusMap =
            metadata?.nonAfflictionDamageBonusBySkillClass &&
            typeof metadata.nonAfflictionDamageBonusBySkillClass === 'object'
                ? metadata.nonAfflictionDamageBonusBySkillClass
                : {};
        Object.entries(classNonAfflictionBonusMap).forEach(([className, amount]) => {
            if (!hasSkillClass(skillClasses, className)) return;
            totals.nonAfflictionDamageBonusFlat += Number(amount) || 0;
        });
        const classNonAfflictionDebuffMap =
            metadata?.nonAfflictionDamageDebuffBySkillClass &&
            typeof metadata.nonAfflictionDamageDebuffBySkillClass === 'object'
                ? metadata.nonAfflictionDamageDebuffBySkillClass
                : {};
        Object.entries(classNonAfflictionDebuffMap).forEach(([className, amount]) => {
            if (!hasSkillClass(skillClasses, className)) return;
            totals.nonAfflictionDamageDebuffFlat += Math.max(0, Number(amount) || 0);
        });
    });
    return totals;
};

const resolveSkillClassChoiceForCast = ({ skill, queued }) => {
    const options = Array.isArray(skill?.classChoiceOptions)
        ? skill.classChoiceOptions.map(normalizeSkillClassName).filter(Boolean)
        : [];
    if (!options.length) return null;
    const queuedChoice = normalizeSkillClassName(queued?.classChoice);
    if (queuedChoice && options.includes(queuedChoice)) return queuedChoice;
    return options[Math.floor(Math.random() * options.length)];
};

const materializeEffectWithSkillClassChoice = (effect, chosenSkillClass) => {
    if (!effect || !chosenSkillClass) return effect;
    const metadata = effect?.metadata && typeof effect.metadata === 'object' ? { ...effect.metadata } : null;
    let next = effect;
    const placeholders = {
        '{selectedSkillClass}': chosenSkillClass,
        '{selectedSkillClassLabel}': formatSkillClassLabel(chosenSkillClass),
    };
    const replacePlaceholders = (text) => {
        if (typeof text !== 'string') return text;
        return Object.entries(placeholders).reduce((result, [token, value]) => {
            if (!token) return result;
            return result.split(token).join(value);
        }, text);
    };
    if (effect?.useChosenSkillClassForSourceSkillClassesAny) {
        const { useChosenSkillClassForSourceSkillClassesAny, ...rest } = next;
        next = { ...rest, sourceSkillClassesAny: [chosenSkillClass] };
    }
    if (metadata) {
        if (metadata?.useChosenSkillClassForCannotUseSkillClasses) {
            metadata.cannotUseSkillClasses = [chosenSkillClass];
            delete metadata.useChosenSkillClassForCannotUseSkillClasses;
        }
        if (metadata?.useChosenSkillClassForOnOwnerUseSkillClassesAny) {
            metadata.onOwnerUseSkillClassesAny = [chosenSkillClass];
            delete metadata.useChosenSkillClassForOnOwnerUseSkillClassesAny;
        }
        if (metadata?.useChosenSkillClassForDamageDebuffBySkillClass) {
            const amount = Math.max(0, Number(metadata?.chosenSkillClassDamageDebuffAmount) || 0);
            metadata.damageDebuffBySkillClass = { [chosenSkillClass]: amount };
            delete metadata.useChosenSkillClassForDamageDebuffBySkillClass;
            delete metadata.chosenSkillClassDamageDebuffAmount;
        }
        if (typeof metadata.tooltipText === 'string') {
            metadata.tooltipText = replacePlaceholders(metadata.tooltipText);
        }
        next = { ...next, metadata };
    }
    if (typeof next?.statusId === 'string') {
        next = { ...next, statusId: replacePlaceholders(next.statusId) };
    }
    return next;
};

const getSkillClassSet = (skillClasses = []) =>
    new Set(
        (Array.isArray(skillClasses) ? skillClasses : [])
            .map((entry) => (typeof entry === 'string' ? entry.trim().toLowerCase() : ''))
            .filter(Boolean)
    );

const getBlockedSkillIndices = (actorState) => {
    const blocked = new Set();
    const statuses = Array.isArray(actorState?.statuses) ? actorState.statuses : [];
    statuses.forEach((status) => {
        const remaining = Number(status?.remainingTurns) || 0;
        if (remaining <= 0) return;
        const indices = status?.metadata?.cannotUseSkillIndices;
        if (!Array.isArray(indices)) return;
        indices.forEach((index) => {
            const parsed = Number.parseInt(index, 10);
            if (Number.isInteger(parsed) && parsed >= 0) {
                blocked.add(parsed);
            }
        });
    });
    return blocked;
};

const isSkillIndexBlockedForActor = (actorState, skillIndex) => {
    const parsed = Number.parseInt(skillIndex, 10);
    if (!Number.isInteger(parsed) || parsed < 0) return false;
    return getBlockedSkillIndices(actorState).has(parsed);
};

const doesTargetIgnoreSkillByClass = ({ targetState, skillClasses = [], isEnemySkill = false }) => {
    if (!isEnemySkill) return false;
    const statuses = Array.isArray(targetState?.statuses) ? targetState.statuses : [];
    if (!statuses.length) return false;
    const classSet = getSkillClassSet(skillClasses);
    if (!classSet.size) return false;
    return statuses.some((status) => {
        const remaining = Number(status?.remainingTurns) || 0;
        if (remaining <= 0) return false;
        const ignored = status?.metadata?.ignoreSkillClasses;
        if (Array.isArray(ignored) && ignored.length > 0) {
            if (
                ignored.some((entry) =>
                    classSet.has(typeof entry === 'string' ? entry.trim().toLowerCase() : '')
                )
            ) {
                return true;
            }
        }
        if (Boolean(status?.metadata?.ignoreEnemyPhysicalSkills) && classSet.has('physical')) {
            return true;
        }
        return false;
    });
};

const getCharacterActiveSkillIndices = (character) => {
    const skills = Array.isArray(character?.skills) ? character.skills : [];
    const visible = [];
    for (let i = 0; i < skills.length; i += 1) {
        const skill = skills[i];
        if (!skill || skill.isHidden) continue;
        visible.push(i);
        if (visible.length >= 4) break;
    }
    if (visible.length >= 4) return visible;
    const fallback = [];
    for (let i = 0; i < skills.length && fallback.length < 4; i += 1) {
        fallback.push(i);
    }
    return fallback;
};

const skillMatchesReflectRule = ({ statusMetadata = {}, skillClasses = [], skillIsHarmful = false }) => {
    if (!statusMetadata || typeof statusMetadata !== 'object') return false;
    if (Boolean(statusMetadata.reflectOnlyHarmfulSkills) && !skillIsHarmful) return false;
    if (
        Array.isArray(statusMetadata.reflectOnlySkillClasses) &&
        statusMetadata.reflectOnlySkillClasses.length > 0 &&
        !statusMetadata.reflectOnlySkillClasses.some((entry) => hasSkillClass(skillClasses, entry))
    ) {
        return false;
    }
    if (
        Array.isArray(statusMetadata.reflectExcludeSkillClasses) &&
        statusMetadata.reflectExcludeSkillClasses.some((entry) => hasSkillClass(skillClasses, entry))
    ) {
        return false;
    }
    return true;
};

const getAdditionalIncomingStatusDuration = ({ targetState, incomingStatusId, incomingMetadata }) => {
    const statuses = Array.isArray(targetState?.statuses) ? targetState.statuses : [];
    if (!statuses.length) return 0;
    return statuses.reduce((sum, status) => {
        const remaining = Number(status?.remainingTurns) || 0;
        if (remaining <= 0) return sum;
        const rules = Array.isArray(status?.metadata?.extendIncomingStatusDuration)
            ? status.metadata.extendIncomingStatusDuration
            : [];
        if (!rules.length) return sum;
        const bonus = rules.reduce((acc, rule) => {
            const by = Number(rule?.by) || 0;
            if (by <= 0) return acc;
            if (rule?.whenStatusId && rule.whenStatusId !== incomingStatusId) return acc;
            if (
                rule?.whenStatusHasMetadataFlag &&
                !Boolean(incomingMetadata?.[rule.whenStatusHasMetadataFlag])
            ) {
                return acc;
            }
            return acc + by;
        }, 0);
        return sum + bonus;
    }, 0);
};

const getSkillSpecificDamageBonus = (actorState, skillId) => {
    if (!skillId) return 0;
    const statuses = Array.isArray(actorState?.statuses) ? actorState.statuses : [];
    return statuses.reduce((sum, status) => {
        const remaining = Number(status?.remainingTurns) || 0;
        if (remaining <= 0) return sum;
        const bonuses = status?.metadata?.skillDamageBonuses;
        if (!bonuses || typeof bonuses !== 'object') return sum;
        return sum + (Number(bonuses[skillId]) || 0);
    }, 0);
};

const getSkillSpecificHealingBonus = (actorState, skillId) => {
    if (!skillId) return 0;
    return (Array.isArray(actorState?.statuses) ? actorState.statuses : []).reduce((sum, status) => {
        if ((Number(status?.remainingTurns) || 0) <= 0) return sum;
        return sum + Math.max(0, Number(status?.metadata?.skillHealingBonuses?.[skillId]) || 0);
    }, 0);
};

const getCharacterPassiveDamageBonus = ({ actorState, actorUsername, actorSlot, targetState, skillClasses }) => {
    const statuses = Array.isArray(actorState?.statuses) ? actorState.statuses : [];
    if (!hasSkillClass(skillClasses || [], 'physical')) return 0;
    const hasHelpfulEffect = statuses.some(
        (status) => (Number(status?.remainingTurns) || 0) > 0 &&
            status?.metadata?.passive !== true &&
            status?.metadata?.harmful !== true &&
            (status?.metadata?.helpful === true ||
                (actorUsername && status?.sourceUsername === actorUsername))
    );
    return statuses.reduce((sum, status) => {
        if ((Number(status?.remainingTurns) || 0) <= 0 || status?.metadata?.passive !== true) return sum;
        const metadata = status.metadata;
        if (hasHelpfulEffect) {
            sum += Math.max(0, Number(metadata.physicalDamageBonusWhileHelpful) || 0);
        }
        const against = metadata.physicalDamageBonusAgainstTargetStatus;
        if (against?.statusId && (targetState?.statuses || []).some((targetStatus) =>
            targetStatus?.id === against.statusId &&
            (Number(targetStatus?.remainingTurns) || 0) > 0 &&
            targetStatus?.sourceUsername === actorUsername &&
            (actorSlot === null || targetStatus?.sourceSlot === actorSlot)
        )) {
            sum += Math.max(0, Number(against.amount) || 0);
        }
        return sum;
    }, 0);
};

const getSamePreviousTargetDamageBonus = ({ actorState, recipient, skillId }) => {
    if (!actorState || !recipient || !skillId) return 0;
    const previousTargetKey =
        typeof actorState?.snapshots?.previousSkillTargetKey === 'string'
            ? actorState.snapshots.previousSkillTargetKey
            : '';
    if (!previousTargetKey || previousTargetKey !== `${recipient.username}:${recipient.slot}`) return 0;
    const statuses = Array.isArray(actorState?.statuses) ? actorState.statuses : [];
    return statuses.reduce((sum, status) => {
        const remaining = Number(status?.remainingTurns) || 0;
        if (remaining <= 0) return sum;
        const metadata = status?.metadata || {};
        const allowedSkillIds = Array.isArray(metadata.samePreviousTargetDamageBonusSkillIds)
            ? metadata.samePreviousTargetDamageBonusSkillIds.filter((entry) => typeof entry === 'string' && entry)
            : [];
        if (allowedSkillIds.length > 0 && !allowedSkillIds.includes(skillId)) return sum;
        return sum + Math.max(0, Number(metadata.samePreviousTargetDamageBonusFlat) || 0);
    }, 0);
};

const getSkillSpecificCooldownIncrease = (actorState, skillId) => {
    if (!skillId) return 0;
    const statuses = Array.isArray(actorState?.statuses) ? actorState.statuses : [];
    return statuses.reduce((sum, status) => {
        const remaining = Number(status?.remainingTurns) || 0;
        if (remaining <= 0) return sum;
        const increases = status?.metadata?.skillCooldownIncreaseBySkillId;
        if (!increases || typeof increases !== 'object') return sum;
        return sum + (Number(increases[skillId]) || 0);
    }, 0);
};

const getSkillSpecificDurationBonus = (actorState, skillId) => {
    if (!skillId) return 0;
    const statuses = Array.isArray(actorState?.statuses) ? actorState.statuses : [];
    return statuses.reduce((sum, status) => {
        const remaining = Number(status?.remainingTurns) || 0;
        if (remaining <= 0) return sum;
        const bonuses = status?.metadata?.skillDurationBonuses;
        if (!bonuses || typeof bonuses !== 'object') return sum;
        return sum + Math.max(0, Number(bonuses[skillId]) || 0);
    }, 0);
};

const hasSkillSpecificStatusFlag = (actorState, skillId, metadataKey) => {
    if (!skillId || !metadataKey) return false;
    const statuses = Array.isArray(actorState?.statuses) ? actorState.statuses : [];
    const matchesSkillId = (value) => {
        if (Array.isArray(value)) {
            return value.some((entry) => entry === skillId);
        }
        if (value && typeof value === 'object') {
            return Boolean(value[skillId]);
        }
        return value === skillId;
    };
    return statuses.some((status) => {
        const remaining = Number(status?.remainingTurns) || 0;
        if (remaining <= 0) return false;
        return matchesSkillId(status?.metadata?.[metadataKey]);
    });
};

const rollPercentSuccess = (chancePercent) => {
    const chance = Math.max(0, Math.min(100, Number(chancePercent) || 0));
    if (chance <= 0) return false;
    return Math.random() * 100 < chance;
};

const getEvadeChanceAgainstSkill = ({ targetState, skillClasses, isEnemySkill }) => {
    if (!isEnemySkill) return 0;
    const statuses = Array.isArray(targetState?.statuses) ? targetState.statuses : [];
    const skillIsMental = hasSkillClass(skillClasses, 'mental');
    return statuses.reduce((sum, status) => {
        const remaining = Number(status?.remainingTurns) || 0;
        if (remaining <= 0) return sum;
        const metadata = status?.metadata || {};
        const evade = Math.max(0, Number(metadata.evadeChancePercent) || 0);
        if (evade <= 0) return sum;
        if (metadata.evadeAgainstNonMental && skillIsMental) return sum;
        sum += evade;
        return sum;
    }, 0);
};

const applyOnEvadeBonuses = ({
    targetState,
    sourceUsername,
    sourceSlot,
    sourceSkillId,
    skillClasses,
}) => {
    const statuses = Array.isArray(targetState?.statuses) ? targetState.statuses : [];
    statuses.forEach((status) => {
        const remaining = Number(status?.remainingTurns) || 0;
        if (remaining <= 0) return;
        const metadata = status?.metadata || {};
        const bonusSourceSkillId = status?.sourceSkillId || sourceSkillId || null;
        const classBonuses = metadata.onEvadeSkillClassBonuses;
        if (classBonuses && typeof classBonuses === 'object') {
            Object.entries(classBonuses).forEach(([skillClass, bonus]) => {
                if (!hasSkillClass(skillClasses, skillClass)) return;
                const statusId = bonus?.statusId;
                if (!statusId) return;
                applyStatus({
                    targetState,
                    statusId,
                    duration: Number(bonus?.duration) || 99,
                    sourceSkillId: bonusSourceSkillId,
                    sourceUsername: sourceUsername || null,
                    sourceSlot: Number.isInteger(sourceSlot) ? sourceSlot : null,
                    metadata: bonus?.metadata || {},
                    fresh: false,
                });
            });
        }
        const onEvadeApplyStatus = metadata.onEvadeApplyStatus;
        if (onEvadeApplyStatus?.statusId) {
            applyStatus({
                targetState,
                statusId: onEvadeApplyStatus.statusId,
                duration: Number(onEvadeApplyStatus?.duration) || 1,
                sourceSkillId: bonusSourceSkillId,
                sourceUsername: sourceUsername || null,
                sourceSlot: Number.isInteger(sourceSlot) ? sourceSlot : null,
                metadata: onEvadeApplyStatus?.metadata || {},
                fresh: false,
            });
        }
    });
};

const applyOnSkillEvadedBonuses = ({
    actorState,
    ownerUsername,
    ownerSlot,
    sourceUsername,
    sourceSlot,
    sourceSkillId,
}) => {
    const statuses = Array.isArray(actorState?.statuses) ? actorState.statuses : [];
    const triggeredStatusIds = new Set();
    statuses.forEach((status) => {
        const remaining = Number(status?.remainingTurns) || 0;
        if (remaining <= 0) return;
        const applyStatusToOwner = status?.metadata?.onOwnerSkillEvadedApplyStatusToOwner;
        if (!applyStatusToOwner?.statusId) return;
        applyStatus({
            targetState: actorState,
            statusId: applyStatusToOwner.statusId,
            duration: applyStatusToOwner.duration,
            sourceSkillId: status?.sourceSkillId || sourceSkillId || null,
            sourceUsername: ownerUsername || sourceUsername || null,
            sourceSlot: Number.isInteger(ownerSlot)
                ? ownerSlot
                : Number.isInteger(sourceSlot)
                ? sourceSlot
                : null,
            metadata: applyStatusToOwner.metadata || {},
            fresh: false,
        });
        if (status?.id && !Boolean(status?.metadata?.persistOnOwnerSkillEvadedTrigger)) {
            triggeredStatusIds.add(status.id);
        }
    });
    if (triggeredStatusIds.size > 0) {
        actorState.statuses = (Array.isArray(actorState.statuses) ? actorState.statuses : []).filter(
            (status) => !triggeredStatusIds.has(status?.id)
        );
    }
};

const isHarmfulEffect = (effect) => {
    const type = effect?.type;
    if (type === 'damage' || type === 'health_steal_damage') return true;
    if (type === 'execute_below_hp') return true;
    if (type === 'destroy_destructible_defense') return true;
    if (type === 'modify_cooldowns') {
        const amount = Number(effect?.amount) || 0;
        return amount > 0 || Boolean(effect?.metadata?.harmful);
    }
    if (type === 'apply_status') {
        const metadata = effect?.metadata || {};
        return Boolean(
            metadata.harmful ||
                metadata.cannotUseSkills ||
                metadata.cannotUseHelpfulSkills ||
                metadata.cannotUseHarmfulSkills ||
                metadata.cannotUseNonMentalSkills ||
                metadata.useChosenSkillClassForCannotUseSkillClasses ||
                (Array.isArray(metadata.cannotUseSkillClasses) && metadata.cannotUseSkillClasses.length > 0) ||
                metadata.cannotReduceDamage ||
                metadata.cannotBecomeInvulnerable ||
                metadata.taunt
        );
    }
    return false;
};

const skillHasHarmfulEffects = (skill) => {
    const effects = Array.isArray(skill?.effects) ? skill.effects : [];
    return effects.some((effect) => isHarmfulEffect(effect));
};

const getLivingTeamPassiveChakraCount = (match, characters, username, passiveKey, turnCount = 0) => {
    const units = Array.isArray(match?.board?.[username]) ? match.board[username] : [];
    return units.reduce((sum, unit) => {
        if (!unit || unit.alive === false) return sum;
        const passive = characters?.[unit.rosterIndex]?.passive;
        if (passiveKey === 'teamRandomChakraEveryOwnTurns') {
            const interval = Math.max(0, Number(passive?.[passiveKey]) || 0);
            return sum + (interval > 0 && turnCount > 0 && turnCount % interval === 0 ? 1 : 0);
        }
        return sum + Math.max(0, Number(passive?.[passiveKey]) || 0);
    }, 0);
};

const getTeamStatusMetadataMax = ({ match, username, metadataKey }) => {
    if (!match || !username || !metadataKey) return 0;
    const units = Array.isArray(match.board?.[username]) ? match.board[username] : [];
    let maxValue = 0;
    units.forEach((unit) => {
        if (!unit || unit.alive === false) return;
        const state = ensureUnitStateShape(unit);
        const statuses = Array.isArray(state.statuses) ? state.statuses : [];
        statuses.forEach((status) => {
            const remaining = Number(status?.remainingTurns) || 0;
            if (remaining <= 0) return;
            const value = Math.max(0, Number(status?.metadata?.[metadataKey]) || 0);
            maxValue = Math.max(maxValue, value);
        });
    });
    return maxValue;
};

const maybeTriggerReflectDamage = ({ match, turnMarker, actingUsername, recipient, actorUnit }) => {
    if (!recipient?.unit || recipient.unit.alive === false) return;
    if (!actorUnit || actorUnit.alive === false) return;
    if (recipient.username === actingUsername) return;

    const targetState = ensureUnitStateShape(recipient.unit);
    const statuses = Array.isArray(targetState.statuses) ? targetState.statuses : [];
    const sharinganStatus = statuses.find((status) => {
        const remaining = Number(status?.remainingTurns) || 0;
        const reflectAmount = Number(status?.metadata?.reflectFirstHarmfulDamage) || 0;
        return remaining > 0 && reflectAmount > 0;
    });
    if (!sharinganStatus) return;

    const metadata = sharinganStatus.metadata || {};
    if (metadata._lastReflectTurnMarker === turnMarker) return;
    metadata._lastReflectTurnMarker = turnMarker;
    sharinganStatus.metadata = metadata;

    const reflectAmount = Number(metadata.reflectFirstHarmfulDamage) || 0;
    if (reflectAmount <= 0) return;
    applyDamageToUnit(actorUnit, reflectAmount, {
        match,
        sourceUsername: recipient.username,
        sourceSlot: Number.isInteger(recipient.slot) ? recipient.slot : null,
        targetUsername: actingUsername,
        sourceSkillId: sharinganStatus?.sourceSkillId || null,
        damageDebugReason: 'reflect',
    });
};

const applyCounteredAlternativeEffects = ({
    match,
    actingUsername,
    actorSlot,
    actorUnit,
    recipient,
    skill,
}) => {
    let count = 0;
    if (!skill || typeof skill !== 'object') return count;

    const explicitAlt = Array.isArray(skill?.whenCounteredEffects)
        ? skill.whenCounteredEffects
        : Array.isArray(skill?.counteredEffects)
        ? skill.counteredEffects
        : Array.isArray(skill?.onCounteredEffects)
        ? skill.onCounteredEffects
        : [];

    const conditionalAlt = (Array.isArray(skill?.effects) ? skill.effects : []).filter((effect) =>
        Boolean(
            effect?.whenCountered ||
            effect?.ifCountered ||
            effect?.condition?.countered ||
            effect?.condition?.counter ||
            effect?.type === 'countered_alternative'
        )
    );

    const allAlt = [...explicitAlt, ...conditionalAlt];
    if (allAlt.length === 0) return 0;

    allAlt.forEach((rawEffect) => {
        const effect = materializeEffectWithSkillClassChoice(rawEffect, null);
        if (!effect || typeof effect !== 'object') return;

        const targetType = String(effect.scope || effect.target || 'target').trim().toLowerCase();
        let targetList = [recipient];
        if (targetType === 'self' || targetType === 'actor') {
            targetList = [{ username: actingUsername, slot: actorSlot, unit: actorUnit }];
        }

        targetList.forEach((targetEntry) => {
            if (!targetEntry?.unit || targetEntry.unit.alive === false) return;
            const targetState = ensureUnitStateShape(targetEntry.unit);

            if (effect.type === 'damage' && Math.max(0, Number(effect.amount) || 0) > 0) {
                applyDamageToUnit(targetEntry.unit, Number(effect.amount), {
                    match,
                    sourceUsername: actingUsername,
                    sourceSlot: actorSlot,
                    targetUsername: targetEntry.username,
                    sourceSkillId: skill.id || null,
                    damageDebugReason: 'when_countered_alternative',
                });
                count += 1;
            } else if (effect.type === 'apply_status' && effect.statusId) {
                applyStatus({
                    targetState,
                    statusId: effect.statusId,
                    duration: Math.max(0, Number(effect.duration) || 1),
                    sourceSkillId: skill.id || null,
                    sourceUsername: actingUsername,
                    sourceSlot: actorSlot,
                    metadata: effect.metadata || {},
                    fresh: true,
                });
                count += 1;
            } else if (effect.type === 'heal' && Math.max(0, Number(effect.amount) || 0) > 0) {
                applyHealToUnit(targetEntry.unit, Number(effect.amount));
                count += 1;
            }
        });
    });

    return count;
};

const maybeTriggerReactiveDefenses = ({
    match,
    turnMarker,
    actingUsername,
    recipient,
    actorUnit,
    skillClasses = [],
    skillIsHarmful = false,
    sourceSkillId = null,
    allowSelfTrapTrigger = false,
    skill = null,
    characters = [],
}) => {
    if (!recipient?.unit || recipient.unit.alive === false) return false;
    if (!actorUnit || actorUnit.alive === false) return false;
    const isSelfTrapTrigger = recipient.username === actingUsername;
    if (isSelfTrapTrigger && !allowSelfTrapTrigger) return false;

    if (!isSelfTrapTrigger) {
        maybeTriggerReflectDamage({
            match,
            turnMarker,
            actingUsername,
            recipient,
            actorUnit,
        });
    }

    const targetState = ensureUnitStateShape(recipient.unit);
    const statuses = Array.isArray(targetState.statuses) ? targetState.statuses : [];
    if (skillIsHarmful) {
        const removeStatusIdsOnEnemyHarmfulSkill = new Set();
        statuses.forEach((status) => {
            const remaining = Number(status?.remainingTurns) || 0;
            if (remaining <= 0) return;
            const removeIds = Array.isArray(status?.metadata?.removeStatusIdsOnEnemyHarmfulSkill)
                ? status.metadata.removeStatusIdsOnEnemyHarmfulSkill.filter((id) => typeof id === 'string' && id)
                : [];
            removeIds.forEach((id) => removeStatusIdsOnEnemyHarmfulSkill.add(id));
        });
        if (removeStatusIdsOnEnemyHarmfulSkill.size > 0) {
            targetState.statuses = statuses.filter(
                (status) => !removeStatusIdsOnEnemyHarmfulSkill.has(status?.id)
            );
        }
    }
    if (hasStatusMetadataFlag(targetState, 'ignoreCounters')) return false;
    const trapIndex = statuses.findIndex((status) => {
        const remaining = Number(status?.remainingTurns) || 0;
        // A counter placed by the acting team cannot counter that team's own skill.
        if (status?.sourceUsername === actingUsername) return false;
        const metadata = status?.metadata || {};
        if (!skillIsHarmful && !Boolean(metadata.triggerOnOwnerHelpfulSkill)) return false;
        if (metadata.triggerOnEnemyPhysicalOrStrategicSkill &&
            !hasSkillClass(skillClasses, 'physical') && !hasSkillClass(skillClasses, 'strategic')) return false;
        if (metadata.triggerOnEnemyHarmfulNonMental && hasSkillClass(skillClasses, 'mental')) return false;
        if (metadata.triggerOnEnemyHarmfulNonStrategic && hasSkillClass(skillClasses, 'strategic')) return false;
        if (Array.isArray(metadata.triggerOnEnemyHarmfulSkillClassesAny) &&
            metadata.triggerOnEnemyHarmfulSkillClassesAny.length > 0 &&
            !metadata.triggerOnEnemyHarmfulSkillClassesAny.some((entry) => hasSkillClass(skillClasses, entry))) return false;
        return (
            remaining > 0 &&
            (!Boolean(metadata.triggerOnlyOnOwnerSkillUse) || isSelfTrapTrigger) &&
            (Boolean(metadata.triggerOnEnemyHarmfulNonMental) ||
                (Boolean(metadata.triggerOnOwnerHelpfulSkill) && isSelfTrapTrigger && !skillIsHarmful) ||
                Boolean(metadata.triggerOnEnemyHarmfulSkill) ||
                Boolean(metadata.triggerOnEnemyHarmfulNonStrategic) ||
                Boolean(metadata.triggerOnEnemyPhysicalOrStrategicSkill) ||
                Boolean(metadata.counterOnEnemySkillTargetingSelf) ||
                (Array.isArray(metadata.triggerOnEnemyHarmfulSkillClassesAny) &&
                    metadata.triggerOnEnemyHarmfulSkillClassesAny.length > 0))
        );
    });
    if (trapIndex < 0) return false;

    const trapStatus = statuses[trapIndex];
    const trapMetadata = trapStatus?.metadata || {};
    const counterDamage = Math.max(0, Number(trapMetadata?.counterDamage) || 0);
    const counterDamageSkillClasses = Array.isArray(trapMetadata?.counterDamageSkillClasses)
        ? trapMetadata.counterDamageSkillClasses
        : [];
    if (counterDamage > 0 && (
        !trapMetadata?.counterDamageRespectsInvulnerability ||
        !isUnitInvulnerableForSkill(actorUnit, counterDamageSkillClasses, { afflictionDamage: true })
    )) {
        const counterSourceUsername = trapMetadata?.counterDamageAttributedToStatusSource
            ? trapStatus?.sourceUsername || recipient.username
            : recipient.username;
        const counterSourceSlot = trapMetadata?.counterDamageAttributedToStatusSource &&
            Number.isInteger(trapStatus?.sourceSlot)
            ? trapStatus.sourceSlot
            : Number.isInteger(recipient.slot) ? recipient.slot : null;
        applyDamageToUnit(actorUnit, counterDamage, {
            match,
            sourceUsername: counterSourceUsername,
            sourceSlot: counterSourceSlot,
            targetUsername: actingUsername,
            sourceSkillId: trapStatus?.sourceSkillId || null,
            skillClasses: counterDamageSkillClasses,
            damageDebugReason: 'counter',
            ignoreDamageReduction: Boolean(trapMetadata?.counterDamageIgnoresReduction),
            ignoreDestructibleDefense: Boolean(trapMetadata?.counterDamageIgnoresDestructibleDefense),
        });
    }

    if (trapMetadata?.counterStatusId) {
        const actorState = ensureUnitStateShape(actorUnit);
        const counterStatusMetadata =
            trapMetadata?.counterStatusMetadata && typeof trapMetadata.counterStatusMetadata === 'object'
                ? { ...trapMetadata.counterStatusMetadata }
                : {};
        if (Boolean(counterStatusMetadata?.taunt) && trapStatus?.sourceUsername) {
            counterStatusMetadata.cannotTargetAlliesOfUsername = trapStatus.sourceUsername;
            if (Number.isInteger(trapStatus?.sourceSlot)) {
                counterStatusMetadata.allowedTargetSlot = trapStatus.sourceSlot;
            }
        }
        applyStatus({
            targetState: actorState,
            statusId: trapMetadata.counterStatusId,
            duration: Math.max(0, Number(trapMetadata?.counterStatusDuration) || 0),
            sourceSkillId: trapStatus?.sourceSkillId || null,
            sourceUsername: recipient.username || null,
            sourceSlot: Number.isInteger(recipient.slot) ? recipient.slot : null,
            metadata: counterStatusMetadata,
            // Counter-applied statuses land during the triggering unit's turn, so they
            // need to start fresh or a 1-turn effect expires at that same turn end.
            fresh: trapMetadata?.counterStatusFresh === undefined
                ? true
                : Boolean(trapMetadata.counterStatusFresh),
        });
    }
    const counterApplyStatusToRecipient = trapMetadata?.counterApplyStatusToRecipient;
    if (counterApplyStatusToRecipient?.statusId && recipient?.unit && recipient.unit.alive !== false) {
        const recipientState = ensureUnitStateShape(recipient.unit);
        applyStatus({
            targetState: recipientState,
            statusId: counterApplyStatusToRecipient.statusId,
            duration: counterApplyStatusToRecipient.duration,
            sourceSkillId: trapStatus?.sourceSkillId || null,
            sourceUsername: trapStatus?.sourceUsername || null,
            sourceSlot: Number.isInteger(trapStatus?.sourceSlot) ? trapStatus.sourceSlot : null,
            metadata: counterApplyStatusToRecipient.metadata || {},
            fresh: true,
        });
    }
    const cancelEnemyStatusesByIdFromSelfSource = Array.isArray(
        trapMetadata?.cancelEnemyStatusesByIdFromSelfSource
    )
        ? trapMetadata.cancelEnemyStatusesByIdFromSelfSource.filter((id) => typeof id === 'string' && id)
        : [];
    if (
        cancelEnemyStatusesByIdFromSelfSource.length > 0 &&
        recipient.username &&
        Number.isInteger(recipient.slot) &&
        match
    ) {
        (match.players || [])
            .filter((player) => player?.username && player.username !== recipient.username)
            .forEach((player) => {
                const units = Array.isArray(match.board?.[player.username]) ? match.board[player.username] : [];
                units.forEach((unit) => {
                    if (!unit || unit.alive === false) return;
                    const state = ensureUnitStateShape(unit);
                    state.statuses = (Array.isArray(state.statuses) ? state.statuses : []).filter((status) => {
                        if (!status?.id || !cancelEnemyStatusesByIdFromSelfSource.includes(status.id)) {
                            return true;
                        }
                        return !(
                            status?.sourceUsername === recipient.username &&
                            Number(status?.sourceSlot) === Number(recipient.slot)
                        );
                    });
                });
            });
    }
    const counterApplyStatusToSourceOwner = trapMetadata?.counterApplyStatusToSourceOwner;
    if (
        counterApplyStatusToSourceOwner?.statusId &&
        trapStatus?.sourceUsername &&
        Number.isInteger(trapStatus?.sourceSlot)
    ) {
        const sourceUnit = match.board?.[trapStatus.sourceUsername]?.[Number(trapStatus.sourceSlot)] || null;
        if (sourceUnit && sourceUnit.alive !== false) {
            const sourceState = ensureUnitStateShape(sourceUnit);
            applyStatus({
                targetState: sourceState,
                statusId: counterApplyStatusToSourceOwner.statusId,
                duration: counterApplyStatusToSourceOwner.duration,
                sourceSkillId: trapStatus?.sourceSkillId || null,
                sourceUsername: trapStatus?.sourceUsername || null,
                sourceSlot: Number.isInteger(trapStatus?.sourceSlot) ? trapStatus.sourceSlot : null,
                metadata: counterApplyStatusToSourceOwner.metadata || {},
                fresh: false,
            });
        }
    }
    const counterCopySkillReplacementFor = trapMetadata?.counterCopySkillReplacementFor;
    const copyRequiresPassiveName = trapMetadata?.counterCopyRequiresPassiveName;
    const copyOwnerUnit = trapStatus?.sourceUsername && Number.isInteger(trapStatus?.sourceSlot)
        ? match.board?.[trapStatus.sourceUsername]?.[Number(trapStatus.sourceSlot)] || null
        : null;
    const hasCopyPassive = !copyRequiresPassiveName || (
        Array.isArray(copyOwnerUnit?.state?.statuses) &&
        copyOwnerUnit.state.statuses.some((status) =>
            (Number(status?.remainingTurns) || 0) > 0 &&
            status?.metadata?.passive === true &&
            status?.metadata?.sourceSkillName === copyRequiresPassiveName
        )
    );
    const copyBlockedBySkill = Boolean(trapMetadata?.counterCopyExcludeUniqueAndPreparation) && (
        hasSkillClass(skill?.classes || [], 'unique') ||
        Boolean(skill?.requiresPreparation) ||
        Boolean(skill?.hiddenFromSelectionViewer) ||
        Boolean(skill?.isHidden)
    );
    if (
        typeof counterCopySkillReplacementFor === 'string' &&
        counterCopySkillReplacementFor &&
        hasCopyPassive &&
        !copyBlockedBySkill &&
        typeof sourceSkillId === 'string' &&
        sourceSkillId &&
        trapStatus?.sourceUsername &&
        Number.isInteger(trapStatus?.sourceSlot)
    ) {
        const trapSetterUnit = match.board?.[trapStatus.sourceUsername]?.[Number(trapStatus.sourceSlot)] || null;
        if (trapSetterUnit && trapSetterUnit.alive !== false) {
            const trapSetterState = ensureUnitStateShape(trapSetterUnit);
            const copyDuration = Math.max(1, Number(trapMetadata?.counterCopySkillReplacementDuration) || 1);
            applyStatus({
                targetState: trapSetterState,
                statusId: `${counterCopySkillReplacementFor}_copied_skill`,
                duration: copyDuration,
                sourceSkillId: trapStatus?.sourceSkillId || null,
                sourceUsername: trapStatus?.sourceUsername || null,
                sourceSlot: Number.isInteger(trapStatus?.sourceSlot) ? trapStatus.sourceSlot : null,
                metadata: {
                    helpful: true,
                    skillReplacements: { [counterCopySkillReplacementFor]: sourceSkillId },
                    ...(Array.isArray(trapMetadata?.counterCopiedSkillEnergy)
                        ? {
                              skillCostOverridesBySkillId: {
                                  [sourceSkillId]: {
                                      energy: trapMetadata.counterCopiedSkillEnergy,
                                  },
                              },
                          }
                        : {}),
                    tooltipText: 'This character has copied an enemy skill.',
                },
                fresh: false,
            });
        }
    }
    const counterEffectsToSourceOwner = Array.isArray(trapMetadata?.counterEffectsToSourceOwner)
        ? trapMetadata.counterEffectsToSourceOwner.filter((entry) => entry && typeof entry === 'object')
        : [];
    if (counterEffectsToSourceOwner.length > 0 && trapStatus?.sourceUsername && Number.isInteger(trapStatus?.sourceSlot)) {
        const sourceUnit = match.board?.[trapStatus.sourceUsername]?.[Number(trapStatus.sourceSlot)] || null;
        if (sourceUnit && sourceUnit.alive !== false) {
            const sourceState = ensureUnitStateShape(sourceUnit);
            const materializedEffects = counterEffectsToSourceOwner.map((effect) => {
                if (
                    effect?.type === 'modify_cooldowns' &&
                    Boolean(effect?.metadata?.targetTriggeredSkillOnly) &&
                    typeof sourceSkillId === 'string' &&
                    sourceSkillId
                ) {
                    return {
                        ...effect,
                        skillIds: [sourceSkillId],
                    };
                }
                return effect;
            });
            applyTriggeredEffectsFromStatus({
                effects: materializedEffects,
                match,
                status: trapStatus,
                targetUnit: sourceUnit,
                targetState: sourceState,
                targetUsername: trapStatus.sourceUsername,
                targetSlot: Number.isInteger(trapStatus.sourceSlot) ? trapStatus.sourceSlot : null,
            });
        }
    }
    if (Array.isArray(trapMetadata?.counterEffectsToEnemiesOfSource) && trapMetadata.counterEffectsToEnemiesOfSource.length > 0) {
        applyTriggeredEffectsToRecipients({
            effects: trapMetadata.counterEffectsToEnemiesOfSource,
            match,
            status: trapStatus,
            recipients: getAliveEnemyRecipients({
                match,
                username: trapStatus?.sourceUsername || '',
            }),
        });
    }

    const alternativeEffectsAppliedCount = applyCounteredAlternativeEffects({
        match,
        actingUsername,
        actorSlot: Number.isInteger(recipient?.slot) ? recipient.slot : 0,
        actorUnit,
        recipient,
        skill,
    });

    if (match) {
        if (!Array.isArray(match.combatEvents)) {
            match.combatEvents = [];
        }
        const actorChar = Number.isInteger(actorUnit?.rosterIndex) ? characters?.[actorUnit.rosterIndex] : null;
        const recipientChar = Number.isInteger(recipient?.unit?.rosterIndex) ? characters?.[recipient.unit.rosterIndex] : null;
        const trapSourceUnit = trapStatus?.sourceUsername && Number.isInteger(trapStatus?.sourceSlot)
            ? match.board?.[trapStatus.sourceUsername]?.[Number(trapStatus.sourceSlot)]
            : recipient.unit;
        const trapSourceChar = Number.isInteger(trapSourceUnit?.rosterIndex) ? characters?.[trapSourceUnit.rosterIndex] : null;

        const counterSkillName = trapMetadata?.sourceSkillName || trapStatus?.sourceSkillId || 'Counter Skill';
        const incomingSkillName = skill?.name || sourceSkillId || 'Skill';

        const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const counterEvent = {
            id: eventId,
            timestamp: Date.now(),
            outcome: 'countered',
            sourceCharacterId: actorChar?.id || actorChar?.characterId || null,
            targetCharacterId: recipientChar?.id || recipientChar?.characterId || null,
            skillId: skill?.id || sourceSkillId || null,
            skillName: incomingSkillName,
            counterEffectId: trapStatus?.id || null,
            counterSourceCharacterId: trapSourceChar?.id || trapSourceChar?.characterId || null,
            counterSourceSkillId: trapStatus?.sourceSkillId || null,
            counterSourceSkillName: counterSkillName,
            counterEffectsApplied: true,
            alternativeEffectsApplied: alternativeEffectsAppliedCount > 0,
            message: `${counterSkillName} countered ${incomingSkillName}.`,
        };
        match.combatEvents.push(counterEvent);
        if (match.combatEvents.length > 50) {
            match.combatEvents.shift();
        }
    }

    const removeStatusGroupIdsOnTrigger = [
        ...(typeof trapMetadata?.removeStatusGroupIdOnTrigger === 'string' && trapMetadata.removeStatusGroupIdOnTrigger
            ? [trapMetadata.removeStatusGroupIdOnTrigger]
            : []),
        ...(Array.isArray(trapMetadata?.removeStatusGroupIdsOnTrigger)
            ? trapMetadata.removeStatusGroupIdsOnTrigger.filter((entry) => typeof entry === 'string' && entry)
            : []),
    ];
    if (removeStatusGroupIdsOnTrigger.length > 0 && recipient.username && match) {
        const removeGroups = new Set(removeStatusGroupIdsOnTrigger);
        const teamUnits = Array.isArray(match.board?.[recipient.username]) ? match.board[recipient.username] : [];
        teamUnits.forEach((teamUnit) => {
            if (!teamUnit || teamUnit.alive === false) return;
            const teamState = ensureUnitStateShape(teamUnit);
            teamState.statuses = (Array.isArray(teamState.statuses) ? teamState.statuses : []).filter((status) => {
                const groupId = status?.metadata?.statusGroupId;
                return !groupId || !removeGroups.has(groupId);
            });
        });
    }
    if (trapMetadata?.usedStatusId) {
        applyStatus({
            targetState,
            statusId: trapMetadata.usedStatusId,
            duration: Math.max(0, Number(trapMetadata?.usedStatusDuration) || 1),
            sourceSkillId: trapStatus?.sourceSkillId || null,
            sourceUsername: trapStatus?.sourceUsername || null,
            sourceSlot: Number.isInteger(trapStatus?.sourceSlot) ? trapStatus.sourceSlot : null,
            metadata: trapMetadata?.usedStatusMetadata || {},
            fresh: false,
        });
    }

    if (!trapMetadata?.trapReappliesSelf) {
        statuses.splice(trapIndex, 1);
        targetState.statuses = statuses;
    }
    return Boolean(trapMetadata?.counterCancelsSkill ?? true);
};

const applyDamageToUnit = (unit, rawAmount, context = {}) => {
    if (!unit || unit.alive === false || isUnitBanished(unit)) return 0;
    const targetState = ensureUnitStateShape(unit);
    if (hasStatusMetadataFlag(targetState, 'ignoreAllDamage')) return 0;
    applyOnOwnerDamagedByBaseDamageBonuses({
        match: context?.match || null,
        targetState,
        targetUnit: unit,
        sourceUsername: context?.sourceUsername || null,
        targetUsername: context?.targetUsername || null,
        sourceSkillId: context?.sourceSkillId || null,
        sourceSlot: Number.isInteger(context?.sourceSlot) ? context.sourceSlot : null,
        sourceBaseDamage:
            Number.isFinite(context?.sourceBaseDamage) || Number(context?.sourceBaseDamage) === 0
                ? Number(context.sourceBaseDamage) || 0
                : Math.max(0, Number(rawAmount) || 0),
    });
    const wasAlive = unit.alive !== false;
    const ignoreEnemyDamage =
        hasStatusMetadataFlag(targetState, 'ignoreEnemyDamage') &&
        context?.sourceUsername &&
        context?.targetUsername &&
        context.sourceUsername !== context.targetUsername;
    if (ignoreEnemyDamage) {
        return 0;
    }
    const skillIsMental = hasSkillClass(context?.skillClasses || [], 'mental');
    const isPhysical = hasSkillClass(context?.skillClasses || [], 'physical');
    const ignoreEnemyPhysicalDamage =
        hasStatusMetadataFlag(targetState, 'ignoreEnemyPhysicalDamage') &&
        context?.sourceUsername &&
        context?.targetUsername &&
        context.sourceUsername !== context.targetUsername &&
        isPhysical;
    const ignoreEnemyNonMentalDamage =
        hasStatusMetadataFlag(targetState, 'ignoreEnemyNonMentalDamage') &&
        context?.sourceUsername &&
        context?.targetUsername &&
        context.sourceUsername !== context.targetUsername &&
        !skillIsMental;
    const damageForReflection = ignoreEnemyNonMentalDamage ? Math.max(0, Number(rawAmount) || 0) : 0;
    const cannotReduceDamage = hasStatusMetadataFlag(targetState, 'cannotReduceDamage');
    let incoming = Math.max(0, Number(rawAmount) || 0);
    const followupMark = (Array.isArray(targetState.statuses) ? targetState.statuses : []).find((status) =>
        (Number(status?.remainingTurns) || 0) > 0 &&
        (Number(status?.metadata?.allyFollowupDamageBonus) || 0) > 0 &&
        status?.sourceUsername === context?.sourceUsername &&
        Number.isInteger(status?.sourceSlot) &&
        Number.isInteger(context?.sourceSlot) &&
        status.sourceSlot !== context.sourceSlot
    );
    if (followupMark && incoming > 0) {
        incoming += Math.max(0, Number(followupMark.metadata.allyFollowupDamageBonus) || 0);
    }
    if (ignoreEnemyPhysicalDamage) {
        incoming = 0;
    }
    if (ignoreEnemyNonMentalDamage) {
        incoming = 0;
    }
    const incomingMultiplier = Math.max(0, Number(getStatusMetadataTotals(targetState, unit).damageTakenMultiplier) || 1);
    incoming *= incomingMultiplier;
    if (incoming <= 0 && !ignoreEnemyNonMentalDamage) return 0;
    const skillClasses = Array.isArray(context?.skillClasses) ? context.skillClasses : [];
    const afflictionDamage =
        Boolean(context?.afflictionDamage) ||
        skillClasses.some((entry) => typeof entry === 'string' && entry.trim().toLowerCase() === 'affliction');
    if (incoming > 0 && !afflictionDamage) {
        const sourceBarrierResult = consumeOutgoingBarrierOnSource({
            match: context?.match || null,
            sourceUsername: context?.sourceUsername || null,
            sourceSlot: Number.isInteger(context?.sourceSlot) ? context.sourceSlot : null,
            amount: incoming,
            afflictionDamage,
        });
        incoming = sourceBarrierResult.amount;
    }
    if (incoming <= 0 && !ignoreEnemyNonMentalDamage) return 0;

    // Destructible defense absorbs incoming damage first; overflow continues to HP.
    const clearDestructibleDefenseFirst = Boolean(context?.clearDestructibleDefenseFirst);
    if (clearDestructibleDefenseFirst) {
        (targetState?.statuses || []).forEach((status) => {
            if (status?.metadata && typeof status.metadata.destructibleDefensePoints === 'number') {
                status.metadata.destructibleDefensePoints = 0;
            }
        });
        refreshDerivedStatusTooltips(targetState);
    }
    const ignoreDestructibleDefense = Boolean(context?.ignoreDestructibleDefense) || afflictionDamage;
    if (!ignoreDestructibleDefense) {
        for (let i = 0; i < targetState.statuses.length && incoming > 0; i += 1) {
            const status = targetState.statuses[i];
            const points = Math.max(0, Number(status?.metadata?.destructibleDefensePoints) || 0);
            if (points <= 0) continue;
            const absorbed = Math.min(incoming, points);
            incoming -= absorbed;
            const remainingPoints = points - absorbed;
            const nextMetadata = { ...(status.metadata || {}), destructibleDefensePoints: remainingPoints };
            const restoreConfig =
                nextMetadata?.destructibleDefenseRestore &&
                typeof nextMetadata.destructibleDefenseRestore === 'object'
                    ? nextMetadata.destructibleDefenseRestore
                    : null;
            if (restoreConfig && absorbed > 0) {
                const thresholdDamageTaken = Math.max(1, Number(restoreConfig.thresholdDamageTaken) || 0);
                const triggerAtOrBelowPoints = Math.max(
                    0,
                    Number(restoreConfig.triggerAtOrBelowPoints)
                );
                const totalTaken = Math.max(0, Number(nextMetadata._destructibleDefenseDamageTaken) || 0) + absorbed;
                nextMetadata._destructibleDefenseDamageTaken = totalTaken;
                const alreadyTriggered = Boolean(nextMetadata._destructibleDefenseRestoreTriggered);
                const triggeredByDamageTaken = thresholdDamageTaken > 0 && totalTaken >= thresholdDamageTaken;
                const triggeredByRemainingPoints =
                    Number.isFinite(triggerAtOrBelowPoints) && remainingPoints <= triggerAtOrBelowPoints;
                if (!alreadyTriggered && (triggeredByDamageTaken || triggeredByRemainingPoints)) {
                    const delayTurns = Math.max(
                        0,
                        Number(restoreConfig.delayOwnerTurns ?? restoreConfig.ownerTurnRestoreCount) || 0
                    );
                    nextMetadata._destructibleDefenseRestoreTriggered = true;
                    nextMetadata._destructibleDefenseRestoreTurnsLeft = delayTurns;
                }
            }
            status.metadata = nextMetadata;
            if (typeof nextMetadata.tooltipTextTemplate === 'string' && nextMetadata.tooltipTextTemplate) {
                status.metadata.tooltipText = renderTooltipTemplate(nextMetadata.tooltipTextTemplate, nextMetadata);
            }
            if (remainingPoints <= 0) {
                const removeStatusIdsOnBreak = Array.isArray(status?.metadata?.removeStatusIdsOnBreak)
                    ? status.metadata.removeStatusIdsOnBreak.filter((id) => typeof id === 'string' && id)
                    : [];
                if (removeStatusIdsOnBreak.length > 0) {
                    targetState.statuses = targetState.statuses.filter(
                        (entry) => !removeStatusIdsOnBreak.includes(entry?.id)
                    );
                    i = -1;
                    continue;
                }
                if (
                    Boolean(status?.metadata?.loseRandomChakraOnBreakByEnemy) &&
                    context?.match &&
                    context?.sourceUsername &&
                    context?.targetUsername &&
                    context.sourceUsername !== context.targetUsername
                ) {
                    removeRandomChakraFromMatch({
                        match: context.match,
                        username: context.sourceUsername,
                        amount: 1,
                    });
                }
                const onBreakApplyStatusToSource = status?.metadata?.onBreakApplyStatusToSource;
                if (
                    onBreakApplyStatusToSource?.statusId &&
                    context?.match &&
                    context?.sourceUsername &&
                    Number.isInteger(context?.sourceSlot)
                ) {
                    const sourceUnit =
                        context.match.board?.[context.sourceUsername]?.[Number(context.sourceSlot)] || null;
                    if (sourceUnit && sourceUnit.alive !== false) {
                        applyStatus({
                            targetState: ensureUnitStateShape(sourceUnit),
                            statusId: onBreakApplyStatusToSource.statusId,
                            duration: onBreakApplyStatusToSource.duration,
                            sourceSkillId: status?.sourceSkillId || null,
                            sourceUsername: status?.sourceUsername || null,
                            sourceSlot: Number.isInteger(status?.sourceSlot) ? status.sourceSlot : null,
                            metadata: onBreakApplyStatusToSource.metadata || {},
                            fresh: false,
                        });
                    }
                }
                const removeStatusIdsFromEnemyOnBreak = Array.isArray(
                    status?.metadata?.removeStatusIdsFromEnemyOnBreak
                )
                    ? status.metadata.removeStatusIdsFromEnemyOnBreak.filter(
                          (id) => typeof id === 'string' && id
                      )
                    : [];
                if (removeStatusIdsFromEnemyOnBreak.length > 0 && context?.match && context?.targetUsername) {
                    const opponentEntry = (context.match.players || []).find(
                        (player) => player?.username && player.username !== context.targetUsername
                    );
                    const opponentUsername = opponentEntry?.username;
                    const opponentUnits = opponentUsername
                        ? context.match.board?.[opponentUsername] || []
                        : [];
                    opponentUnits.forEach((opponentUnit) => {
                        if (!opponentUnit || opponentUnit.alive === false) return;
                        const opponentState = ensureUnitStateShape(opponentUnit);
                        opponentState.statuses = (
                            Array.isArray(opponentState.statuses) ? opponentState.statuses : []
                        ).filter((entry) => !removeStatusIdsFromEnemyOnBreak.includes(entry?.id));
                    });
                }
                targetState.statuses.splice(i, 1);
                i -= 1;
            }
        }
    }

    const totals = getStatusMetadataTotals(targetState, unit);
    const contextualMinimumHp = Math.max(
        Math.max(0, Number(context?.minimumHp) || 0),
        getContextualMinimumHp(targetState, unit, context)
    );
    const isPhysicalDamage = isPhysical || skillClasses.some(
        (entry) => typeof entry === 'string' && entry.trim().toLowerCase() === 'physical'
    );
    const ignoreDamageReduction = Boolean(context?.ignoreDamageReduction) || afflictionDamage;
    const damageTakenBonusFlat = Math.max(0, Number(totals.damageTakenBonusFlat) || 0);
    if (damageTakenBonusFlat > 0) {
        incoming += damageTakenBonusFlat;
    }
    if (!afflictionDamage) {
        const nonAfflictionDamageTakenBonusFlat = Math.max(
            0,
            Number(totals.nonAfflictionDamageTakenBonusFlat) || 0
        );
        if (nonAfflictionDamageTakenBonusFlat > 0) {
            incoming += nonAfflictionDamageTakenBonusFlat;
        }
    }
    if (incoming > 0) {
        const classScopedTargetTotals = getTargetClassScopedDamageModifiers(targetState, skillClasses);
        incoming += Math.max(0, Number(classScopedTargetTotals.damageTakenBonusFlat) || 0);
    }
    const standardPercentReduction = ignoreDamageReduction || afflictionDamage
        ? 0
        : cannotReduceDamage
        ? 0
        : Math.min(100, Math.max(0, Number(totals.damageReductionPercent) || 0));
    let afterStandardPercent = incoming * (1 - standardPercentReduction / 100);
    const percentMitigationStateMap = context?.percentMitigationStateMap;
    const percentMitigationStateKey = context?.percentMitigationStateKey;
    if (
        standardPercentReduction > 0 &&
        percentMitigationStateMap instanceof Map &&
        percentMitigationStateKey
    ) {
        const existing = percentMitigationStateMap.get(`standard:${percentMitigationStateKey}`);
        const state =
            existing && typeof existing === 'object'
                ? existing
                : { gross: 0, prevented: 0, percent: standardPercentReduction };
        const stablePercent = Math.max(
            0,
            Math.min(100, Number(state.percent) || standardPercentReduction)
        );
        const nextGross = Math.max(0, Number(state.gross) || 0) + incoming;
        const targetPreventedTotal = nextGross * (stablePercent / 100);
        const preventedThisHit = Math.max(
            0,
            targetPreventedTotal - Math.max(0, Number(state.prevented) || 0)
        );
        afterStandardPercent = Math.max(0, incoming - preventedThisHit);
        state.gross = nextGross;
        state.prevented = Math.max(0, Number(state.prevented) || 0) + preventedThisHit;
        state.percent = stablePercent;
        percentMitigationStateMap.set(`standard:${percentMitigationStateKey}`, state);
    }
    const unpierceablePercentReduction = cannotReduceDamage || afflictionDamage
        ? 0
        : Math.min(100, Math.max(0, Number(totals.unpierceableDamageReductionPercent) || 0));
    let afterPercent = afterStandardPercent * (1 - unpierceablePercentReduction / 100);
    if (
        unpierceablePercentReduction > 0 &&
        percentMitigationStateMap instanceof Map &&
        percentMitigationStateKey
    ) {
        const existing = percentMitigationStateMap.get(`unpierceable:${percentMitigationStateKey}`);
        const state =
            existing && typeof existing === 'object'
                ? existing
                : { gross: 0, prevented: 0, percent: unpierceablePercentReduction };
        const stablePercent = Math.max(
            0,
            Math.min(100, Number(state.percent) || unpierceablePercentReduction)
        );
        const nextGross = Math.max(0, Number(state.gross) || 0) + afterStandardPercent;
        const targetPreventedTotal = nextGross * (stablePercent / 100);
        const preventedThisHit = Math.max(
            0,
            targetPreventedTotal - Math.max(0, Number(state.prevented) || 0)
        );
        afterPercent = Math.max(0, afterStandardPercent - preventedThisHit);
        state.gross = nextGross;
        state.prevented = Math.max(0, Number(state.prevented) || 0) + preventedThisHit;
        state.percent = stablePercent;
        percentMitigationStateMap.set(`unpierceable:${percentMitigationStateKey}`, state);
    }
    const baseGeneralMitigation =
        ignoreDamageReduction || cannotReduceDamage || afflictionDamage
            ? 0
            : Math.max(0, Number(totals.damageReductionFlat) || 0);
    const basePhysicalMitigation =
        ignoreDamageReduction || cannotReduceDamage || afflictionDamage || !isPhysical
            ? 0
            : Math.max(0, Number(totals.physicalDamageReductionFlat) || 0);
    let appliedGeneralMitigation = baseGeneralMitigation;
    let appliedPhysicalMitigation = basePhysicalMitigation;
    const standardBudgetMap = context?.standardMitigationBudgetMap;
    const standardBudgetKey = context?.standardMitigationBudgetKey;
    if (standardBudgetMap instanceof Map && standardBudgetKey && !ignoreDamageReduction && !cannotReduceDamage) {
        const generalKey = `g:${standardBudgetKey}`;
        const physicalKey = `p:${standardBudgetKey}`;
        const generalBudget = standardBudgetMap.has(generalKey)
            ? Math.max(0, Number(standardBudgetMap.get(generalKey)) || 0)
            : baseGeneralMitigation;
        appliedGeneralMitigation = Math.min(generalBudget, afterPercent);
        standardBudgetMap.set(generalKey, Math.max(0, generalBudget - appliedGeneralMitigation));

        const remainingAfterGeneral = Math.max(0, afterPercent - appliedGeneralMitigation);
        const physicalBudget = standardBudgetMap.has(physicalKey)
            ? Math.max(0, Number(standardBudgetMap.get(physicalKey)) || 0)
            : basePhysicalMitigation;
        appliedPhysicalMitigation = Math.min(physicalBudget, remainingAfterGeneral);
        standardBudgetMap.set(physicalKey, Math.max(0, physicalBudget - appliedPhysicalMitigation));
    } else {
        appliedGeneralMitigation = Math.min(baseGeneralMitigation, afterPercent);
        appliedPhysicalMitigation = Math.min(
            basePhysicalMitigation,
            Math.max(0, afterPercent - appliedGeneralMitigation)
        );
    }
    const postStandardMitigation = Math.max(0, afterPercent - appliedGeneralMitigation - appliedPhysicalMitigation);
    const baseUnpierceableMitigation = cannotReduceDamage || afflictionDamage
        ? 0
        : Math.max(0, Number(totals.unpierceableDamageReductionFlat) || 0);
    let appliedUnpierceableMitigation = baseUnpierceableMitigation;
    const budgetMap = context?.unpierceableBudgetMap;
    const budgetKey = context?.unpierceableBudgetKey;
    if (budgetMap instanceof Map && budgetKey) {
        const currentBudget = budgetMap.has(budgetKey)
            ? Math.max(0, Number(budgetMap.get(budgetKey)) || 0)
            : baseUnpierceableMitigation;
        appliedUnpierceableMitigation = Math.min(currentBudget, postStandardMitigation);
        budgetMap.set(budgetKey, Math.max(0, currentBudget - appliedUnpierceableMitigation));
    } else {
        appliedUnpierceableMitigation = Math.min(baseUnpierceableMitigation, postStandardMitigation);
    }
    const dealt = Math.max(0, postStandardMitigation - appliedUnpierceableMitigation);
    unit.hp = Math.max(contextualMinimumHp, (Number(unit.hp) || 0) - dealt);
    if (dealt > 0) {
        targetState.snapshots.tookDamageThisTurn = true;
        (Array.isArray(targetState.statuses) ? targetState.statuses : []).forEach((status) => {
            if (!isStatusActiveForMetadata(status, unit)) return;
            const key = status?.metadata?.onDamageStackMetadataKey;
            const amount = Math.max(0, Number(status?.metadata?.onDamageStackAmount) || 0);
            if (key && amount > 0) changeStatusMetadataStack(status, key, amount);
        });
    }
    if (dealt > 0 && context?.match && context?.targetUsername) {
        updateTeamPassiveAwakenings({ match: context.match, username: context.targetUsername });
    }
    if (dealt > 0 && unit.hp > 0 && context?.match && context?.targetUsername) {
        const rivalry = targetState.statuses.find((status) =>
            isStatusActiveForMetadata(status, unit) &&
            status.metadata?.passive === true &&
            status.metadata?.damageTakenInTurn?.threshold > 0
        )?.metadata?.damageTakenInTurn;
        if (rivalry && !targetState.snapshots.damageTakenInTurnTriggered) {
            targetState.snapshots.damageTakenInTurn =
                Math.max(0, Number(targetState.snapshots.damageTakenInTurn) || 0) + dealt;
            if (targetState.snapshots.damageTakenInTurn >= rivalry.threshold) {
                targetState.snapshots.damageTakenInTurnTriggered = true;
                applyStatus({
                    targetState, statusId: rivalry.defenseStatusId,
                    duration: rivalry.defenseDuration, sourceSkillId: null,
                    sourceUsername: context.targetUsername,
                    sourceSlot: Number.isInteger(context.targetSlot) ? context.targetSlot : null,
                    metadata: { helpful: true, destructibleDefensePoints: rivalry.defensePoints,
                        tooltipText: `Stubborn Rivalry: ${rivalry.defensePoints} destructible defense.` },
                    fresh: true,
                });
                applyStatus({
                    targetState, statusId: rivalry.attackStatusId,
                    duration: 99, sourceSkillId: null,
                    sourceUsername: context.targetUsername,
                    sourceSlot: Number.isInteger(context.targetSlot) ? context.targetSlot : null,
                    metadata: { helpful: true, nextAttackDamageBonusFlat: rivalry.nextAttackDamage,
                        tooltipText: `Stubborn Rivalry: next attack deals ${rivalry.nextAttackDamage} additional damage.` },
                    fresh: true,
                });
            }
        }
    }
    if (dealt > 0 && followupMark) {
        targetState.statuses = targetState.statuses.filter((status) => status !== followupMark);
    }
    if (dealt > 0) {
        setLastDamageDebug(targetState, dealt, context);
    }
    if (dealt > 0 && unit.alive !== false && context?.match && context?.sourceUsername &&
        context.sourceUsername !== context.targetUsername && Number.isInteger(context?.sourceSlot)) {
        const sourceUnit = context.match.board?.[context.sourceUsername]?.[context.sourceSlot] || null;
        const sourcePassive = sourceUnit?.alive !== false
            ? (Array.isArray(sourceUnit?.state?.statuses) ? sourceUnit.state.statuses : []).find((status) =>
                (Number(status?.remainingTurns) || 0) > 0 &&
                status?.metadata?.passive === true &&
                status?.metadata?.allyFollowupDamageMark?.statusId
            )
            : null;
        const mark = sourcePassive?.metadata?.allyFollowupDamageMark;
        if (mark && Array.isArray(mark.skillIds) && mark.skillIds.includes(context.sourceSkillId)) {
            applyStatus({
                targetState,
                statusId: mark.statusId,
                duration: Math.max(1, Number(mark.duration) || 1),
                sourceSkillId: context.sourceSkillId,
                sourceUsername: context.sourceUsername,
                sourceSlot: context.sourceSlot,
                metadata: {
                    harmful: true,
                    allyFollowupDamageBonus: Math.max(0, Number(mark.amount) || 0),
                    turnDurationAnchor: 'source_turn',
                    tooltipText: `The next damaging hit from another ally of ${sourcePassive.metadata.sourceSkillName || 'this character'} deals ${Math.max(0, Number(mark.amount) || 0)} additional damage.`,
                },
                fresh: true,
            });
        }
    }
    if (dealt > 0) {
        const removeIds = new Set();
        (Array.isArray(targetState.statuses) ? targetState.statuses : []).forEach((status) => {
            if (!isStatusActiveForMetadata(status, unit)) return;
            const ids = Array.isArray(status?.metadata?.removeStatusIdsOnNewDamage)
                ? status.metadata.removeStatusIdsOnNewDamage.filter((id) => typeof id === 'string' && id)
                : [];
            ids.forEach((id) => removeIds.add(id));
            if (!afflictionDamage) {
                const nonAfflictionIds = Array.isArray(status?.metadata?.removeStatusIdsOnNewNonAfflictionDamage)
                    ? status.metadata.removeStatusIdsOnNewNonAfflictionDamage.filter(
                          (id) => typeof id === 'string' && id
                      )
                    : [];
                nonAfflictionIds.forEach((id) => removeIds.add(id));
            }
        });
        if (removeIds.size > 0) {
            targetState.statuses = (Array.isArray(targetState.statuses) ? targetState.statuses : []).filter(
                (status) => !removeIds.has(status?.id)
            );
            refreshDerivedStatusTooltips(targetState);
        }
        const executeThresholdFromStatus = (Array.isArray(targetState.statuses) ? targetState.statuses : []).reduce(
            (lowest, status) => {
                if (!isStatusActiveForMetadata(status, unit)) return lowest;
                const threshold = Number(status?.metadata?.executeBelowHpThreshold);
                if (!Number.isFinite(threshold) || threshold < 0) return lowest;
                return lowest === null ? threshold : Math.min(lowest, threshold);
            },
            null
        );
        const executeThresholdFromHit = Number.isFinite(context?.executeBelowHpThreshold)
            ? Math.max(0, Number(context.executeBelowHpThreshold)) : null;
        const executeThreshold = executeThresholdFromHit === null ? executeThresholdFromStatus
            : executeThresholdFromStatus === null ? executeThresholdFromHit
            : Math.max(executeThresholdFromHit, executeThresholdFromStatus);
        if (executeThreshold !== null && unit.hp <= executeThreshold) {
            unit.hp = 0;
            unit.alive = false;
        }
    }
    if (unit.hp <= 0) {
        unit.alive = false;
    }
    if (wasAlive && unit.alive === false && context?.match && context?.targetUsername) {
        triggerTeamMemberDeathHooks({
            match: context.match,
            deadUsername: context.targetUsername,
            deadSlot: Number.isInteger(context?.targetSlot) ? context.targetSlot : null,
        });
        triggerOwnerDeathHooks({
            unit,
            match: context.match,
            username: context.targetUsername,
            slot: Number.isInteger(context?.targetSlot) ? context.targetSlot : null,
        });
        triggerSourceKillHooks({
            match: context.match,
            sourceUsername: context?.sourceUsername || null,
            sourceSlot: Number.isInteger(context?.sourceSlot) ? context.sourceSlot : null,
            targetUsername: context.targetUsername,
            sourceSkillId: context?.sourceSkillId || null,
            sourceSkillClasses: skillClasses,
        });
    }
    if (
        (dealt > 0 || damageForReflection > 0) &&
        !Boolean(context?.skipDamageReflection) &&
        context?.match &&
        context?.sourceUsername &&
        context?.targetUsername &&
        context.sourceUsername !== context.targetUsername &&
        Array.isArray(skillClasses) &&
        skillClasses.length > 0
    ) {
        const skillIsMental = hasSkillClass(skillClasses, 'mental');
        const sourceUnit = context?.match?.board?.[context.sourceUsername]?.[Number(context?.sourceSlot)] || null;
        if (sourceUnit && sourceUnit.alive !== false) {
            const reflectStatuses = (Array.isArray(targetState.statuses) ? targetState.statuses : []).filter((status) => {
                const remaining = Number(status?.remainingTurns) || 0;
                if (remaining <= 0) return false;
                const percent = Math.max(0, Number(status?.metadata?.reflectDamagePercent) || 0);
                if (percent <= 0) return false;
                if (skillIsMental && !Boolean(status?.metadata?.reflectDamageIncludeMental)) {
                    return false;
                }
                const excludeClasses = Array.isArray(status?.metadata?.reflectDamageExcludeSkillClasses)
                    ? status.metadata.reflectDamageExcludeSkillClasses
                          .map((entry) => normalizeSkillClassName(entry))
                          .filter(Boolean)
                    : [];
                if (
                    excludeClasses.length > 0 &&
                    excludeClasses.some((entry) => hasSkillClass(skillClasses, entry))
                ) {
                    return false;
                }
                const includeClasses = Array.isArray(status?.metadata?.reflectDamageSkillClassesAny)
                    ? status.metadata.reflectDamageSkillClassesAny
                          .map((entry) => normalizeSkillClassName(entry))
                          .filter(Boolean)
                    : [];
                if (
                    includeClasses.length > 0 &&
                    !includeClasses.some((entry) => hasSkillClass(skillClasses, entry))
                ) {
                    return false;
                }
                return true;
            });
            const reflectionBase = dealt > 0 ? dealt : damageForReflection;
            const reflectAmount = reflectStatuses.reduce((sum, status) => {
                const percent = Math.max(0, Number(status?.metadata?.reflectDamagePercent) || 0);
                return sum + Math.max(0, Math.floor((reflectionBase * percent) / 100));
            }, 0);
            if (reflectAmount > 0) {
                applyDamageToUnit(sourceUnit, reflectAmount, {
                    match: context.match,
                    sourceUsername: context.targetUsername,
                    sourceSlot: Number.isInteger(context?.targetSlot) ? context.targetSlot : null,
                    targetUsername: context.sourceUsername,
                    sourceSkillId: context?.sourceSkillId || null,
                    skillClasses: ['affliction'],
                    damageDebugLabel: 'Damage Reflect',
                    damageDebugReason: 'reflect',
                    skipDamageReflection: true,
                });
            }
        }
    }
    if (dealt > 0 && context?.match && context?.sourceUsername && context?.targetUsername) {
        const sourceUnit = context?.match?.board?.[context.sourceUsername]?.[Number(context?.sourceSlot)] || null;
        const sourceState = sourceUnit ? ensureUnitStateShape(sourceUnit) : null;
        const sourceSkillClasses = Array.isArray(context?.skillClasses) ? context.skillClasses : [];
        applyOnTeamMemberDamageTakenBonuses({
            match: context.match,
            actingUsername: context.sourceUsername,
            targetUnit: unit,
            targetUsername: context.targetUsername,
            targetSlot: Number.isInteger(context?.targetSlot) ? context.targetSlot : null,
            sourceSkillId: context?.sourceSkillId || null,
            sourceSkillClasses,
            sourceSlot: context?.sourceSlot ?? null,
            afflictionDamage: Boolean(context?.afflictionDamage),
        });
    }
    return dealt;
};

const applyPassiveStunDamage = ({
    match, sourceUsername, sourceSlot, sourceSkillId, targetUnit, targetUsername, targetSlot, statusId,
}) => {
    if (!match || !sourceUsername || !Number.isInteger(sourceSlot) ||
        !targetUnit || !targetUsername || targetUsername === sourceUsername || !statusId) return;
    const sourceUnit = match.board?.[sourceUsername]?.[sourceSlot];
    if (!sourceUnit || sourceUnit.alive === false) return;
    const sourceState = ensureUnitStateShape(sourceUnit);
    const passive = sourceState.statuses.find((status) =>
        isStatusActiveForMetadata(status, sourceUnit) &&
        status.metadata?.passive === true &&
        Number(status.metadata?.piercingDamageOnStun) > 0
    );
    if (!passive || !sourceSkillId) return;
    if (!passive.metadata.piercingDamageOnStunSkillIds?.includes(sourceSkillId)) return;
    const targetState = ensureUnitStateShape(targetUnit);
    const applied = targetState.statuses.some((status) =>
        status.id === statusId && status.sourceUsername === sourceUsername &&
        status.sourceSlot === sourceSlot && (Number(status.remainingTurns) || 0) > 0 &&
        (status.metadata?.cannotUseSkills || status.metadata?.cannotUseHarmfulSkills ||
            (Array.isArray(status.metadata?.cannotUseSkillClasses) &&
                status.metadata.cannotUseSkillClasses.length > 0))
    );
    if (!applied) return;
    applyDamageToUnit(targetUnit, Number(passive.metadata.piercingDamageOnStun), {
        match, sourceUsername, sourceSlot, sourceSkillId, targetUsername, targetSlot,
        ignoreDamageReduction: true, ignoreDestructibleDefense: true,
        skillClasses: [], damageDebugReason: 'stun passive',
    });
};

const applyHealToUnit = (unit, rawAmount, { excludeStatusId = '' } = {}) => {
    if (!unit || unit.alive === false || isUnitBanished(unit)) return 0;
    const targetState = ensureUnitStateShape(unit);
    const totals = getStatusMetadataTotals(targetState);
    const baseHeal = Math.max(0, Number(rawAmount) || 0);
    const excludedBonus = excludeStatusId
        ? (targetState.statuses || []).reduce((sum, status) =>
            sum + (status?.id === excludeStatusId && (Number(status?.remainingTurns) || 0) > 0
                ? Math.max(0, Number(status?.metadata?.healReceivedBonusFlat) || 0) : 0), 0)
        : 0;
    const bonus = baseHeal > 0
        ? Math.max(0, totals.healReceivedBonusFlat - excludedBonus) : 0;
    const heal = (baseHeal + bonus) * Math.max(0, Number(totals.healReceivedMultiplier) || 0);
    const before = Number(unit.hp) || 0;
    const cap = Math.max(0, Number(unit?.hpCap) || DEFAULT_HP);
    unit.hp = Math.min(DEFAULT_HP, cap, before + heal);
    return Math.max(0, unit.hp - before);
};

const applyDirectHpGainToUnit = (unit, rawAmount) => {
    if (!unit || unit.alive === false || isUnitBanished(unit)) return 0;
    const gain = Math.max(0, Number(rawAmount) || 0);
    if (gain <= 0) return 0;
    const before = Number(unit.hp) || 0;
    const cap = Math.max(0, Number(unit?.hpCap) || DEFAULT_HP);
    unit.hp = Math.min(DEFAULT_HP, cap, before + gain);
    return Math.max(0, unit.hp - before);
};

const applyHealthStealToUnit = ({ targetUnit, sourceUnit, rawAmount, context = {} }) => {
    if (!targetUnit || !sourceUnit) {
        return applyDamageToUnit(targetUnit, rawAmount, {
            ...context,
            ignoreDamageReduction: true,
        });
    }
    const dealt = applyDamageToUnit(targetUnit, rawAmount, {
        ...context,
        ignoreDamageReduction: true,
    });
    if (dealt > 0) {
        applyDirectHpGainToUnit(sourceUnit, dealt);
    }
    return dealt;
};

const applyHealthLossToUnit = (unit, rawAmount, context = {}) => {
    if (!unit || unit.alive === false || isUnitBanished(unit)) return 0;
    const wasAlive = unit.alive !== false;
    const loss = Math.max(0, Number(rawAmount) || 0);
    if (loss <= 0) return 0;
    const before = Math.max(0, Number(unit.hp) || 0);
    const targetState = ensureUnitStateShape(unit);
    const contextualMinimumHp = getContextualMinimumHp(targetState, unit, context);
    unit.hp = Math.max(contextualMinimumHp, before - loss);
    if (unit.hp < before && context?.match && context?.targetUsername) {
        updateTeamPassiveAwakenings({ match: context.match, username: context.targetUsername });
    }
    setLastDamageDebug(targetState, loss, context);
    if (unit.hp <= 0) {
        unit.alive = false;
    }
    if (wasAlive && unit.alive === false && context?.match && context?.targetUsername) {
        triggerTeamMemberDeathHooks({
            match: context.match,
            deadUsername: context.targetUsername,
            deadSlot: Number.isInteger(context?.targetSlot) ? context.targetSlot : null,
        });
        triggerOwnerDeathHooks({
            unit,
            match: context.match,
            username: context.targetUsername,
            slot: Number.isInteger(context?.targetSlot) ? context.targetSlot : null,
        });
        triggerSourceKillHooks({
            match: context.match,
            sourceUsername: context?.sourceUsername || null,
            sourceSlot: Number.isInteger(context?.sourceSlot) ? context.sourceSlot : null,
            targetUsername: context.targetUsername,
            sourceSkillId: context?.sourceSkillId || null,
            sourceSkillClasses: Array.isArray(context?.skillClasses) ? context.skillClasses : [],
        });
    }
    return Math.max(0, before - unit.hp);
};

const applyHealthCapLossToUnit = (unit, rawAmount, context = {}) => {
    if (!unit || unit.alive === false || isUnitBanished(unit)) return 0;
    const wasAlive = unit.alive !== false;
    const loss = Math.max(0, Number(rawAmount) || 0);
    if (loss <= 0) return 0;
    const beforeCap = Math.max(0, Number(unit.hpCap) || DEFAULT_HP);
    const nextCap = Math.max(0, beforeCap - loss);
    unit.hpCap = nextCap;
    const hpBeforeClamp = Math.max(0, Number(unit.hp) || 0);
    if (hpBeforeClamp > nextCap) {
        unit.hp = nextCap;
        if (context?.match && context?.targetUsername) {
            updateTeamPassiveAwakenings({ match: context.match, username: context.targetUsername });
        }
        if (unit.hp <= 0) {
            unit.alive = false;
        }
    }
    if (wasAlive && unit.alive === false && context?.match && context?.targetUsername) {
        triggerTeamMemberDeathHooks({
            match: context.match,
            deadUsername: context.targetUsername,
            deadSlot: Number.isInteger(context?.targetSlot) ? context.targetSlot : null,
        });
        triggerOwnerDeathHooks({
            unit,
            match: context.match,
            username: context.targetUsername,
            slot: Number.isInteger(context?.targetSlot) ? context.targetSlot : null,
        });
        triggerSourceKillHooks({
            match: context.match,
            sourceUsername: context?.sourceUsername || null,
            sourceSlot: Number.isInteger(context?.sourceSlot) ? context.sourceSlot : null,
            targetUsername: context.targetUsername,
            sourceSkillId: context?.sourceSkillId || null,
            sourceSkillClasses: Array.isArray(context?.skillClasses) ? context.skillClasses : [],
        });
    }
    return Math.max(0, beforeCap - nextCap);
};

const destroyAllDestructibleDefenseOnUnit = (unit, maxPoints = Infinity, context = {}) => {
    if (!unit || unit.alive === false) return 0;
    const targetState = ensureUnitStateShape(unit);
    const statuses = Array.isArray(targetState.statuses) ? targetState.statuses : [];
    let removedPoints = 0;
    let remainingBudget = Math.max(0, Number(maxPoints) || 0);
    if (maxPoints === Infinity) remainingBudget = Infinity;
    const removeIds = new Set();
    const applyOnBreakStatuses = [];
    const survivors = [];
    statuses.forEach((status) => {
        const points = Math.max(0, Number(status?.metadata?.destructibleDefensePoints) || 0);
        if (points <= 0 || remainingBudget <= 0) {
            survivors.push(status);
            return;
        }
        const removed = Math.min(points, remainingBudget);
        removedPoints += removed;
        remainingBudget -= removed;
        if (removed < points) {
            survivors.push({ ...status, metadata: {
                ...status.metadata, destructibleDefensePoints: points - removed,
            } });
            return;
        }
        const removeStatusIdsOnBreak = Array.isArray(status?.metadata?.removeStatusIdsOnBreak)
            ? status.metadata.removeStatusIdsOnBreak.filter((id) => typeof id === 'string' && id)
            : [];
        removeStatusIdsOnBreak.forEach((id) => removeIds.add(id));
        if (context.match && context.sourceUsername && context.targetUsername &&
            context.sourceUsername !== context.targetUsername) {
            if (status?.metadata?.loseRandomChakraOnBreakByEnemy) {
                removeRandomChakraFromMatch({ match: context.match,
                    username: context.sourceUsername, amount: 1 });
            }
            const onBreakApplyStatusToSource = status?.metadata?.onBreakApplyStatusToSource;
            const sourceUnit = Number.isInteger(context.sourceSlot)
                ? context.match.board?.[context.sourceUsername]?.[context.sourceSlot] || null
                : null;
            if (onBreakApplyStatusToSource?.statusId && sourceUnit && sourceUnit.alive !== false) {
                applyStatus({ targetState: ensureUnitStateShape(sourceUnit),
                    statusId: onBreakApplyStatusToSource.statusId,
                    duration: onBreakApplyStatusToSource.duration,
                    sourceSkillId: status?.sourceSkillId || null,
                    sourceUsername: status?.sourceUsername || null,
                    sourceSlot: Number.isInteger(status?.sourceSlot) ? status.sourceSlot : null,
                    metadata: onBreakApplyStatusToSource.metadata || {}, fresh: false });
            }
            const removeStatusIdsFromEnemyOnBreak = Array.isArray(status?.metadata?.removeStatusIdsFromEnemyOnBreak)
                ? status.metadata.removeStatusIdsFromEnemyOnBreak : [];
            if (removeStatusIdsFromEnemyOnBreak.length > 0) {
                (context.match.board?.[context.sourceUsername] || []).forEach((enemyUnit) => {
                    if (!enemyUnit || enemyUnit.alive === false) return;
                    const enemyState = ensureUnitStateShape(enemyUnit);
                    enemyState.statuses = (enemyState.statuses || []).filter(
                        (entry) => !removeStatusIdsFromEnemyOnBreak.includes(entry?.id)
                    );
                });
            }
        }
        const onBreakApplyStatusToSelf = status?.metadata?.onBreakApplyStatusToSelf;
        if (onBreakApplyStatusToSelf?.statusId) {
            applyOnBreakStatuses.push({
                statusId: onBreakApplyStatusToSelf.statusId,
                duration: onBreakApplyStatusToSelf.duration,
                sourceSkillId: status?.sourceSkillId || null,
                sourceUsername: status?.sourceUsername || null,
                sourceSlot: Number.isInteger(status?.sourceSlot) ? status.sourceSlot : null,
                metadata: onBreakApplyStatusToSelf.metadata || {},
            });
        }
    });
    targetState.statuses = survivors.filter((entry) => !removeIds.has(entry?.id));
    applyOnBreakStatuses.forEach((statusConfig) => {
        applyStatus({
            targetState,
            statusId: statusConfig.statusId,
            duration: statusConfig.duration,
            sourceSkillId: statusConfig.sourceSkillId,
            sourceUsername: statusConfig.sourceUsername,
            sourceSlot: statusConfig.sourceSlot,
            metadata: statusConfig.metadata,
            fresh: false,
        });
    });
    if (removedPoints > 0) refreshDerivedStatusTooltips(targetState);
    return removedPoints;
};

const consumeOutgoingBarrierOnSource = ({
    match,
    sourceUsername,
    sourceSlot,
    amount,
    afflictionDamage = false,
}) => {
    const outgoingAmount = Math.max(0, Number(amount) || 0);
    if (
        outgoingAmount <= 0 ||
        afflictionDamage ||
        !match ||
        !sourceUsername ||
        !Number.isInteger(sourceSlot)
    ) {
        return { amount: outgoingAmount, consumed: 0 };
    }
    const sourceUnit = match.board?.[sourceUsername]?.[Number(sourceSlot)] || null;
    if (!sourceUnit) {
        return { amount: outgoingAmount, consumed: 0 };
    }
    const sourceState = ensureUnitStateShape(sourceUnit);
    const statuses = Array.isArray(sourceState.statuses) ? sourceState.statuses : [];
    let remainingAmount = outgoingAmount;
    const removeIds = new Set();
    const applyOnBreakStatuses = [];
    const survivors = [];
    let changed = false;

    statuses.forEach((status) => {
        const points = Math.max(0, Number(status?.metadata?.barrierPoints) || 0);
        if (points <= 0 || remainingAmount <= 0) {
            survivors.push(status);
            return;
        }
        const absorbed = Math.min(remainingAmount, points);
        if (absorbed <= 0) {
            survivors.push(status);
            return;
        }
        remainingAmount -= absorbed;
        changed = true;
        const remainingPoints = points - absorbed;
        const nextMetadata = { ...(status.metadata || {}), barrierPoints: remainingPoints };
        if (remainingPoints <= 0) {
            const removeStatusIdsOnBreak = Array.isArray(status?.metadata?.removeStatusIdsOnBreak)
                ? status.metadata.removeStatusIdsOnBreak.filter((id) => typeof id === 'string' && id)
                : [];
            removeStatusIdsOnBreak.forEach((id) => removeIds.add(id));
            const onBreakApplyStatusToSelf = status?.metadata?.onBreakApplyStatusToSelf;
            if (onBreakApplyStatusToSelf?.statusId) {
                applyOnBreakStatuses.push({
                    statusId: onBreakApplyStatusToSelf.statusId,
                    duration: onBreakApplyStatusToSelf.duration,
                    sourceSkillId: status?.sourceSkillId || null,
                    sourceUsername: status?.sourceUsername || null,
                    sourceSlot: Number.isInteger(status?.sourceSlot) ? status.sourceSlot : null,
                    metadata: onBreakApplyStatusToSelf.metadata || {},
                });
            }
            return;
        }
        status.metadata = nextMetadata;
        survivors.push(status);
    });

    if (!changed) {
        return { amount: outgoingAmount, consumed: 0 };
    }

    sourceState.statuses = survivors.filter((entry) => !removeIds.has(entry?.id));
    applyOnBreakStatuses.forEach((statusConfig) => {
        applyStatus({
            targetState: sourceState,
            statusId: statusConfig.statusId,
            duration: statusConfig.duration,
            sourceSkillId: statusConfig.sourceSkillId,
            sourceUsername: statusConfig.sourceUsername,
            sourceSlot: statusConfig.sourceSlot,
            metadata: statusConfig.metadata,
            fresh: false,
        });
    });
    refreshDerivedStatusTooltips(sourceState);
    return {
        amount: remainingAmount,
        consumed: outgoingAmount - remainingAmount,
    };
};

const triggerTeamMemberDeathHooks = ({ match, deadUsername, deadSlot = null }) => {
    if (!match || !deadUsername) return;
    const teamUnits = Array.isArray(match.board?.[deadUsername]) ? match.board[deadUsername] : [];
    if (!teamUnits.length) return;

    teamUnits.forEach((teamUnit, teamSlot) => {
        if (!teamUnit || teamUnit.alive === false) return;
        if (Number.isInteger(deadSlot) && teamSlot === deadSlot) return;
        const teamState = ensureUnitStateShape(teamUnit);
        let changed = false;
        (Array.isArray(teamState.statuses) ? teamState.statuses : []).forEach((status) => {
            if (!isStatusActiveForMetadata(status, teamUnit)) return;
            const metadata = status?.metadata || {};
            if (!Boolean(metadata.onTeamMemberDeathQueueTurnStartChoice)) return;
            const maxUses = Math.max(0, Number(metadata.turnStartChoiceMaxUses) || 0);
            const usesUsed = Math.max(0, Number(metadata.turnStartChoiceUsesUsed) || 0);
            if (maxUses > 0 && usesUsed >= maxUses) return;
            if (Boolean(metadata.turnStartChoiceQueued)) return;
            status.metadata = {
                ...metadata,
                turnStartChoiceQueued: true,
                turnStartChoiceQueuedTurnCount: Number(match?.economy?.turnCounts?.[deadUsername]) || 0,
            };
            changed = true;
        });
        if (changed) {
            refreshDerivedStatusTooltips(teamState);
        }
    });
};

const purgeTetheredStatusesOnSourceDeath = ({ match, sourceUsername, sourceSlot }) => {
    if (!match || !sourceUsername || !Number.isInteger(sourceSlot)) return;
    const players = Array.isArray(match.players) ? match.players : [];
    players.forEach((player) => {
        const username = player?.username;
        if (!username) return;
        const units = Array.isArray(match.board?.[username]) ? match.board[username] : [];
        units.forEach((unit) => {
            if (!unit) return;
            const unitState = ensureUnitStateShape(unit);
            const initialCount = unitState.statuses.length;
            unitState.statuses = unitState.statuses.filter((status) => {
                if (!status) return false;
                const isFromSource =
                    status.sourceUsername === sourceUsername &&
                    Number.isInteger(status.sourceSlot) &&
                    status.sourceSlot === sourceSlot;
                if (!isFromSource) return true;
                const metadata = status.metadata || {};
                const ongoingClass =
                    typeof metadata.ongoingClass === 'string'
                        ? metadata.ongoingClass.trim().toLowerCase()
                        : '';
                const isTethered =
                    ongoingClass === 'action' ||
                    ongoingClass === 'control' ||
                    Boolean(metadata.removeOnSourceDeath) ||
                    Boolean(metadata.endsOnSourceDeath) ||
                    Boolean(metadata.sourceDeathPurge) ||
                    Boolean(metadata.removeWhenSourceDies);
                if (isTethered) {
                    return false;
                }
                return true;
            });
            if (unitState.statuses.length !== initialCount) {
                refreshDerivedStatusTooltips(unitState);
            }
        });
    });
};

const triggerOwnerDeathHooks = ({ unit, match, username, slot }) => {
    if (!unit || !match || !username || !Number.isInteger(slot)) return;
    const targetState = ensureUnitStateShape(unit);
    let changed = false;
    (Array.isArray(targetState.statuses) ? targetState.statuses : []).forEach((status) => {
        if (!isStatusActiveForMetadata(status, unit)) return;
        const metadata = status?.metadata || {};
        const onOwnerDeathApplyStatusToSelf = metadata?.onOwnerDeathApplyStatusToSelf;
        if (!onOwnerDeathApplyStatusToSelf?.statusId) return;
        if (Boolean(metadata?._onOwnerDeathTriggered)) return;
        metadata._onOwnerDeathTriggered = true;
        status.metadata = metadata;
        const reviveToHp = Number(metadata?.onOwnerDeathReviveToHp);
        if (Number.isFinite(reviveToHp) && reviveToHp > 0) {
            reviveUnitToHp(unit, reviveToHp);
        }
        applyStatus({
            targetState,
            statusId: onOwnerDeathApplyStatusToSelf.statusId,
            duration: onOwnerDeathApplyStatusToSelf.duration,
            sourceSkillId: status?.sourceSkillId || null,
            sourceUsername: status?.sourceUsername || null,
            sourceSlot: Number.isInteger(status?.sourceSlot) ? status.sourceSlot : null,
            metadata: onOwnerDeathApplyStatusToSelf.metadata || {},
            fresh: false,
        });
        changed = true;
    });
    if (unit.alive === false) {
        (Array.isArray(targetState.statuses) ? targetState.statuses : []).forEach((status) => {
            if (!isStatusActiveForMetadata(status, unit)) return;
            const reward = status?.metadata?.onMarkedTargetDeathGainChakra;
            if (!reward || status.metadata._markedTargetDeathRewardClaimed) return;
            if (!status.sourceUsername || status.sourceUsername === username || !Number.isInteger(status.sourceSlot)) return;
            const sourceUnit = match.board?.[status.sourceUsername]?.[status.sourceSlot] || null;
            if (!sourceUnit || sourceUnit.alive === false) return;
            status.metadata._markedTargetDeathRewardClaimed = true;
            const amount = Math.max(0, Number(reward.amount) || 0);
            for (let i = 0; i < amount; i += 1) {
                const pick = chakraTypes[Math.floor(Math.random() * chakraTypes.length)];
                applyChakraGainToMatch({ match, username: status.sourceUsername, chakraType: pick, amount: 1 });
            }
        });
        purgeTetheredStatusesOnSourceDeath({ match, sourceUsername: username, sourceSlot: slot });
    }
    if (changed) {
        refreshDerivedStatusTooltips(targetState);
    }
};

const triggerSourceKillHooks = ({
    match,
    sourceUsername,
    sourceSlot = null,
    targetUsername = null,
    sourceSkillId = null,
    sourceSkillClasses = [],
}) => {
    if (!match || !sourceUsername || !Number.isInteger(sourceSlot)) return;
    const sourceUnit = match.board?.[sourceUsername]?.[Number(sourceSlot)] || null;
    if (!sourceUnit || sourceUnit.alive === false) return;
    const sourceState = ensureUnitStateShape(sourceUnit);
    (Array.isArray(sourceState.statuses) ? sourceState.statuses : []).forEach((status) => {
        if (!isStatusActiveForMetadata(status, sourceUnit)) return;
        const metadata = status?.metadata || {};
        const targetRelation =
            typeof metadata.onOwnerKillTargetRelation === 'string'
                ? metadata.onOwnerKillTargetRelation.trim().toLowerCase()
                : 'any';
        if (targetRelation === 'enemy' && sourceUsername === targetUsername) return;
        if (targetRelation === 'ally' && sourceUsername !== targetUsername) return;
        const skillIdFilter = Array.isArray(metadata.onOwnerKillSourceSkillIdsAny)
            ? metadata.onOwnerKillSourceSkillIdsAny.filter((entry) => typeof entry === 'string' && entry)
            : [];
        if (skillIdFilter.length > 0 && !skillIdFilter.includes(sourceSkillId || '')) {
            return;
        }
        const classFilter = Array.isArray(metadata.onOwnerKillSourceSkillClassesAny)
            ? metadata.onOwnerKillSourceSkillClassesAny
                  .map((entry) => normalizeSkillClassName(entry))
                  .filter(Boolean)
            : [];
        if (
            classFilter.length > 0 &&
            !classFilter.some((entry) => hasSkillClass(sourceSkillClasses, entry))
        ) {
            return;
        }
        const healAmount = Math.max(0, Number(metadata.onOwnerKillHealSelfAmount) || 0);
        if (healAmount > 0) {
            applyHealToUnit(sourceUnit, healAmount);
        }
        const gainChakraConfig =
            metadata?.onOwnerKillGainChakra && typeof metadata.onOwnerKillGainChakra === 'object'
                ? metadata.onOwnerKillGainChakra
                : null;
        if (gainChakraConfig?.chakraType) {
            const chakraAmount = Math.max(0, Number(gainChakraConfig.amount) || 0);
            if (chakraAmount > 0) {
                const chakraType = String(gainChakraConfig.chakraType).trim().toLowerCase();
                if (chakraType === 'random') {
                    for (let i = 0; i < chakraAmount; i += 1) {
                        const pick = chakraTypes[Math.floor(Math.random() * chakraTypes.length)];
                        applyChakraGainToMatch({
                            match,
                            username: sourceUsername,
                            chakraType: pick,
                            amount: 1,
                        });
                    }
                } else {
                    applyChakraGainToMatch({
                        match,
                        username: sourceUsername,
                        chakraType,
                        amount: chakraAmount,
                    });
                }
            }
        }
        const applyStatusToSelf = metadata.onOwnerKillApplyStatusToSelf;
        if (applyStatusToSelf?.statusId) {
            applyStatus({
                targetState: sourceState,
                statusId: applyStatusToSelf.statusId,
                duration: applyStatusToSelf.duration,
                sourceSkillId: sourceSkillId || status?.sourceSkillId || null,
                sourceUsername,
                sourceSlot,
                metadata: applyStatusToSelf.metadata || {},
                fresh: false,
            });
        }
    });
};

const triggerOnEnemySkillTargetedBonuses = ({
    match,
    actingUsername,
    actorUnit,
    actorSlot = null,
    recipient,
    skill,
}) => {
    if (!match || !actingUsername || !actorUnit || !recipient?.unit) return;
    if (!recipient.username || recipient.username === actingUsername) return;
    const targetUnit = recipient.unit;
    const targetState = ensureUnitStateShape(targetUnit);
    (Array.isArray(targetState.statuses) ? targetState.statuses : []).forEach((status) => {
        if (!isStatusActiveForMetadata(status, targetUnit)) return;
        const metadata = status?.metadata || {};
        if (metadata.onEnemySkillTargetedUseStatusSource) {
            const sourceUnit = match.board?.[status.sourceUsername]?.[status.sourceSlot];
            if (!sourceUnit || sourceUnit.alive === false) return;
        }
        if (Boolean(metadata.onEnemySkillTargetedHarmfulOnly) && !skillHasHarmfulEffects(skill)) {
            return;
        }
        const classFilter = Array.isArray(metadata.onEnemySkillTargetedSkillClassesAny)
            ? metadata.onEnemySkillTargetedSkillClassesAny
                  .map((entry) => normalizeSkillClassName(entry))
                  .filter(Boolean)
            : [];
        if (classFilter.length > 0 && !classFilter.some((entry) => hasSkillClass(skill?.classes || [], entry))) {
            return;
        }
        if (metadata.onEnemySkillTargetedDamagingOnly &&
            !(Array.isArray(skill?.effects) && skill.effects.some((effect) =>
                effect?.type === 'damage' || effect?.type === 'health_steal_damage' ||
                Math.max(0, Number(effect?.metadata?.turnEndDamage) || 0) > 0
            ))) {
            return;
        }
        const retaliateDamage = Math.max(0, Number(metadata.onEnemySkillTargetedDamageToSourceAmount) || 0);
        const retaliationUsername = metadata.onEnemySkillTargetedUseStatusSource
            ? status?.sourceUsername : recipient.username;
        const retaliationSlot = metadata.onEnemySkillTargetedUseStatusSource
            ? status?.sourceSlot : recipient.slot;
        if (retaliateDamage > 0) {
            applyDamageToUnit(actorUnit, retaliateDamage, {
                match,
                sourceUsername: retaliationUsername,
                sourceSlot: Number.isInteger(retaliationSlot) ? retaliationSlot : null,
                sourceSkillId: status?.sourceSkillId || null,
                targetUsername: actingUsername,
                targetSlot: Number.isInteger(actorSlot) ? actorSlot : null,
                damageDebugReason: 'targeted trigger',
                ignoreDamageReduction: Boolean(metadata.onEnemySkillTargetedDamageToSourceIgnoreDamageReduction),
                ignoreDestructibleDefense: Boolean(
                    metadata.onEnemySkillTargetedDamageToSourceIgnoreDestructibleDefense
                ),
                skillClasses: Array.isArray(metadata.onEnemySkillTargetedDamageToSourceSkillClasses)
                    ? metadata.onEnemySkillTargetedDamageToSourceSkillClasses
                    : [],
            });
        }
        const applyStatusToSource = metadata.onEnemySkillTargetedApplyStatusToSource;
        if (applyStatusToSource?.statusId) {
            applyStatus({
                targetState: ensureUnitStateShape(actorUnit),
                statusId: applyStatusToSource.statusId,
                duration: applyStatusToSource.duration,
                sourceSkillId: status?.sourceSkillId || null,
                sourceUsername: retaliationUsername,
                sourceSlot: Number.isInteger(retaliationSlot) ? retaliationSlot : null,
                metadata: applyStatusToSource.metadata || {},
                fresh: Boolean(applyStatusToSource.fresh),
            });
        }
    });
};

const reviveUnitToHp = (unit, rawAmount) => {
    if (!unit) return 0;
    const before = Math.max(0, Number(unit.hp) || 0);
    const cap = Math.max(1, Number(unit?.hpCap) || DEFAULT_HP);
    const amount = Math.max(1, Math.min(DEFAULT_HP, Number(rawAmount) || 0));
    unit.alive = true;
    unit.hp = Math.min(DEFAULT_HP, cap, amount);
    return Math.max(0, unit.hp - before);
};

const selectTurnStartChoiceTarget = ({ match, actingUsername, choice = {} }) => {
    if (!match || !actingUsername || !choice || typeof choice !== 'object') return null;
    const teamUnits = Array.isArray(match.board?.[actingUsername]) ? match.board[actingUsername] : [];
    if (!teamUnits.length) return null;
    const targetStrategy =
        typeof choice?.targetStrategy === 'string' ? choice.targetStrategy.trim().toLowerCase() : '';
    const allies = teamUnits
        .map((unit, slot) => ({ unit, slot, username: actingUsername }))
        .filter((entry) => entry?.unit);

    const aliveAllies = allies.filter((entry) => entry.unit && entry.unit.alive !== false);
    const deadAllies = allies.filter((entry) => entry.unit && entry.unit.alive === false);
    const harmfulCountForUnit = (unit) => {
        const state = ensureUnitStateShape(unit);
        return (Array.isArray(state.statuses) ? state.statuses : []).reduce((sum, status) => {
            const remaining = Number(status?.remainingTurns) || 0;
            if (remaining <= 0) return sum;
            return sum + (Boolean(status?.metadata?.harmful) ? 1 : 0);
        }, 0);
    };

    if (targetStrategy === 'dead-ally-first' || targetStrategy === 'dead-ally-lowest-slot') {
        return deadAllies[0] || null;
    }
    if (targetStrategy === 'alive-ally-most-harmful') {
        const sorted = aliveAllies
            .slice()
            .sort((a, b) => {
                const harmA = harmfulCountForUnit(a.unit);
                const harmB = harmfulCountForUnit(b.unit);
                if (harmA !== harmB) return harmB - harmA;
                const hpA = Math.max(0, Number(a.unit?.hp) || 0);
                const hpB = Math.max(0, Number(b.unit?.hp) || 0);
                if (hpA !== hpB) return hpA - hpB;
                return a.slot - b.slot;
            });
        return sorted[0] || null;
    }
    if (targetStrategy === 'alive-ally-lowest-hp') {
        const sorted = aliveAllies
            .slice()
            .sort((a, b) => {
                const hpA = Math.max(0, Number(a.unit?.hp) || 0);
                const hpB = Math.max(0, Number(b.unit?.hp) || 0);
                if (hpA !== hpB) return hpA - hpB;
                return a.slot - b.slot;
            });
        return sorted[0] || null;
    }
    if (targetStrategy === 'alive-ally-first' || targetStrategy === 'single-ally') {
        return aliveAllies[0] || null;
    }
    return aliveAllies[0] || deadAllies[0] || null;
};

const queueTurnStartChoicePrompts = ({ match, startingUsername }) => {
    if (!match || !startingUsername) return null;
    if (!match.pendingTurns || typeof match.pendingTurns !== 'object') {
        match.pendingTurns = {};
    }
    const pending = match.pendingTurns[startingUsername];
    if (pending?.turnStartChoice?.options?.length > 0) {
        return pending.turnStartChoice;
    }

    const teamUnits = Array.isArray(match.board?.[startingUsername]) ? match.board[startingUsername] : [];
    for (let slot = 0; slot < teamUnits.length; slot += 1) {
        const unit = teamUnits[slot];
        if (!unit || unit.alive === false) continue;
        const state = ensureUnitStateShape(unit);
        const statuses = Array.isArray(state.statuses) ? state.statuses : [];
        for (const status of statuses) {
            if (!isStatusActiveForMetadata(status, unit)) continue;
            const metadata = status?.metadata || {};
            if (!Boolean(metadata.onTeamMemberDeathQueueTurnStartChoice)) continue;
            const maxUses = Math.max(0, Number(metadata.turnStartChoiceMaxUses) || 0);
            const usesUsed = Math.max(0, Number(metadata.turnStartChoiceUsesUsed) || 0);
            if (maxUses > 0 && usesUsed >= maxUses) continue;
            if (!Boolean(metadata.turnStartChoiceQueued)) continue;
            const options = Array.isArray(metadata.turnStartChoiceOptions)
                ? metadata.turnStartChoiceOptions
                      .map((choice) => {
                          if (!choice || typeof choice !== 'object') return null;
                          const key =
                              typeof choice.key === 'string' && choice.key.trim()
                                  ? choice.key.trim().toLowerCase()
                                  : '';
                          const label =
                              typeof choice.label === 'string' && choice.label.trim()
                                  ? choice.label.trim()
                                  : '';
                          if (!key || !label) return null;
                          return {
                              key,
                              label,
                              targetStrategy:
                                  typeof choice.targetStrategy === 'string'
                                      ? choice.targetStrategy.trim().toLowerCase()
                                      : '',
                              effect:
                                  choice.effect && typeof choice.effect === 'object'
                                      ? { ...choice.effect }
                                      : null,
                          };
                      })
                      .filter(Boolean)
                : [];
            if (!options.length) continue;
            const nextPending = pending && typeof pending === 'object' ? { ...pending } : {};
            nextPending.turnStartChoice = {
                actorSlot: slot,
                sourceSkillId: status?.sourceSkillId || null,
                sourceUsername: status?.sourceUsername || startingUsername,
                sourceSlot: Number.isInteger(status?.sourceSlot) ? status.sourceSlot : slot,
                sourceStatusId: status?.id || null,
                promptText:
                    typeof metadata.turnStartChoicePromptText === 'string' &&
                    metadata.turnStartChoicePromptText.trim()
                        ? metadata.turnStartChoicePromptText.trim()
                        : 'Choose an effect.',
                options,
                maxUses: Math.max(0, Number(metadata.turnStartChoiceMaxUses) || 0),
                usesUsed: Math.max(0, Number(metadata.turnStartChoiceUsesUsed) || 0),
            };
            match.pendingTurns[startingUsername] = nextPending;
            return nextPending.turnStartChoice;
        }
    }
    return null;
};

const applyChakraGainToMatch = ({ match, username, chakraType, amount = 1 }) => {
    if (!match || !username) return 0;
    const units = Array.isArray(match.board?.[username]) ? match.board[username] : [];
    const chakraGainBlocked = units.some((unit) => {
        if (!unit || unit.alive === false) return false;
        const state = ensureUnitStateShape(unit);
        return (Array.isArray(state.statuses) ? state.statuses : []).some(
            (status) => (Number(status?.remainingTurns) || 0) > 0 && Boolean(status?.metadata?.noChakraGain)
        );
    });
    if (chakraGainBlocked) return 0;

    const normalizedType =
        typeof chakraType === 'string' ? chakraType.trim().toLowerCase() : '';
    if (!chakraTypes.includes(normalizedType)) return 0;
    const gain = Math.max(0, Number(amount) || 0);
    if (gain <= 0) return 0;
    match.chakraPools = match.chakraPools || {};
    const pool = match.chakraPools[username] || createEmptyChakraCost();
    pool[normalizedType] = (Number(pool[normalizedType]) || 0) + gain;
    match.chakraPools[username] = pool;
    match.economy = match.economy || {};
    match.economy.lastChakraGain = match.economy.lastChakraGain || {};
    const prev = Array.isArray(match.economy.lastChakraGain[username])
        ? match.economy.lastChakraGain[username]
        : [];
    match.economy.lastChakraGain[username] = [...prev, normalizedType];
    return gain;
};

const removeRandomChakraFromMatch = ({ match, username, amount = 1 }) => {
    if (!match || !username) return 0;
    const lossAmount = Math.max(0, Number(amount) || 0);
    if (lossAmount <= 0) return 0;
    match.chakraPools = match.chakraPools || {};
    const pool = match.chakraPools[username] || createEmptyChakraCost();
    const pending = match.pendingTurns?.[username];
    const randomAssignments =
        pending && pending.randomAssignments && typeof pending.randomAssignments === 'object'
            ? pending.randomAssignments
            : null;
    let removed = 0;
    for (let i = 0; i < lossAmount; i += 1) {
        const available = chakraTypes.filter((type) => (Number(pool[type]) || 0) > 0);
        if (available.length) {
            const pick = available[Math.floor(Math.random() * available.length)];
            pool[pick] = Math.max(0, (Number(pool[pick]) || 0) - 1);
            removed += 1;
            continue;
        }
        const assigned = randomAssignments
            ? chakraTypes.filter((type) => (Number(randomAssignments[type]) || 0) > 0)
            : [];
        if (!assigned.length) break;
        const pick = assigned[Math.floor(Math.random() * assigned.length)];
        randomAssignments[pick] = Math.max(0, (Number(randomAssignments[pick]) || 0) - 1);
        if (pending) {
            pending.unresolvedRandom = Math.max(0, (Number(pending.unresolvedRandom) || 0) + 1);
            match.pendingTurns[username] = pending;
        }
        removed += 1;
    }
    match.chakraPools[username] = pool;
    return removed;
};

const cleanseHarmfulStatuses = (unit, count = 1) => {
    if (!unit || unit.alive === false) return 0;
    const targetState = ensureUnitStateShape(unit);
    const numericCount = Number(count);
    const maxCount = Number.isFinite(numericCount) && numericCount > 0 ? Math.floor(numericCount) : Infinity;
    let removed = 0;
    targetState.statuses = targetState.statuses.filter((status) => {
        if (removed >= maxCount) return true;
        const harmful = Boolean(status?.metadata?.harmful);
        if (!harmful) return true;
        if (Boolean(status?.metadata?.cannotBeCleansed)) return true;
        removed += 1;
        return false;
    });
    refreshDerivedStatusTooltips(targetState);
    return removed;
};

const cleanseEnemyAfflictionStatuses = (unit, ownerUsername, count = 0) => {
    if (!unit || unit.alive === false || !ownerUsername) return 0;
    const targetState = ensureUnitStateShape(unit);
    const numericCount = Number(count);
    const maxCount = Number.isFinite(numericCount) && numericCount > 0 ? Math.floor(numericCount) : Infinity;
    let removed = 0;
    targetState.statuses = targetState.statuses.filter((status) => {
        if (removed >= maxCount) return true;
        const sourceUsername = typeof status?.sourceUsername === 'string' ? status.sourceUsername : '';
        if (!sourceUsername || sourceUsername === ownerUsername) return true;
        if (!Boolean(status?.metadata?.afflictionDamage)) return true;
        if (Boolean(status?.metadata?.cannotBeCleansed)) return true;
        removed += 1;
        return false;
    });
    refreshDerivedStatusTooltips(targetState);
    return removed;
};

const getSkillByIndices = (characters, rosterIndex, skillIndex, actorState = null) =>
    resolveEffectiveSkill({ characters, rosterIndex, skillIndex, actorState });

const resolvePendingTurnSkills = ({ match, actingUsername, characters }) => {
    if (!match || !actingUsername) return;
    syncLinkedStatuses(match);
    const pending = match.pendingTurns?.[actingUsername];
    if (!pending || !pending.queuedByActorSlot) return;

    const actorBoard = match.board?.[actingUsername] || [];
    const queueOrder = Array.isArray(pending.queueOrder) ? pending.queueOrder : [];
    const queuedActions = queueOrder
        .map((actorSlotRaw) => {
            const actorSlot = Number.parseInt(actorSlotRaw, 10);
            if (!Number.isInteger(actorSlot) || actorSlot < 0) return null;
            const queued = pending.queuedByActorSlot[String(actorSlot)];
            if (!queued) return null;
            return {
                actorSlot,
                skillIndex: queued.skillIndex,
                targetSelection: queued.targetSelection,
                classChoice: queued.classChoice,
                isAutoCast: false,
            };
        })
        .filter(Boolean);
    actorBoard.forEach((actorUnit, actorSlot) => {
        if (!actorUnit || actorUnit.alive === false || isUnitBanished(actorUnit)) return;
        const actorState = ensureUnitStateShape(actorUnit);
        const statuses = Array.isArray(actorState.statuses) ? actorState.statuses : [];
        statuses.forEach((status) => {
            if (!status || (Number(status?.remainingTurns) || 0) <= 0) return;
            const autoCastSkillId =
                typeof status?.metadata?.autoCastSkillId === 'string'
                    ? status.metadata.autoCastSkillId.trim()
                    : '';
            if (!autoCastSkillId) return;
            const actorCharacter = Number.isInteger(actorUnit?.rosterIndex)
                ? characters?.[actorUnit.rosterIndex]
                : null;
            const skillIndex = Array.isArray(actorCharacter?.skills)
                ? actorCharacter.skills.findIndex((entry) => entry?.id === autoCastSkillId)
                : -1;
            if (skillIndex < 0) return;
            const autoCastTarget =
                typeof status?.metadata?.autoCastTarget === 'string'
                    ? status.metadata.autoCastTarget.trim().toLowerCase()
                    : 'all-enemy';
            let targetSelection = [];
            if (autoCastTarget === 'self') {
                targetSelection = [{ username: actingUsername, slot: actorSlot }];
            }
            queuedActions.push({
                actorSlot,
                skillIndex,
                targetSelection,
                isAutoCast: true,
            });
        });
    });
    const turnMarker = `${actingUsername}:${Number(match?.economy?.turnCounts?.[actingUsername]) || 0}`;

    const turnUnpierceableBudgetByRecipient = new Map();
    const turnStandardMitigationBudgetByRecipient = new Map();
    const turnPercentMitigationStateByRecipient = new Map();

    for (let queueIndex = 0; queueIndex < queuedActions.length; queueIndex += 1) {
        syncLinkedStatuses(match);
        const queued = queuedActions[queueIndex];
        const actorSlot = Number.parseInt(queued?.actorSlot, 10);
        if (!Number.isInteger(actorSlot) || actorSlot < 0) continue;

        const actorUnit = actorBoard[actorSlot];
        if (!actorUnit || actorUnit.alive === false || isUnitBanished(actorUnit)) continue;

        const actorState = ensureUnitStateShape(actorUnit);
        if (getStatusMetadataTotals(actorState).cannotUseSkills) continue;

        const baseSkill = Array.isArray(characters?.[actorUnit.rosterIndex]?.skills)
            ? characters[actorUnit.rosterIndex].skills[queued.skillIndex]
            : null;
        if (baseSkill?.hiddenFromSelectionViewer || baseSkill?.isHidden) continue;
        if (baseSkill?.requiresPreparation) continue;
        const skill = getSkillByIndices(characters, actorUnit.rosterIndex, queued.skillIndex, actorState);
        if (!skill) continue;
        const cooldownSkillId =
            skill?.useBaseSkillCooldown && baseSkill?.id ? baseSkill.id : skill.id || baseSkill?.id || null;
        if (!queued?.isAutoCast && cooldownSkillId && getSkillCooldownRemaining(actorState, cooldownSkillId) > 0) {
            continue;
        }
        if (isSkillIndexBlockedForActor(actorState, queued.skillIndex)) continue;

        const blockedByCannotUseHarmfulSkills =
            hasStatusMetadataFlag(actorState, 'cannotUseHarmfulSkills') && skillHasHarmfulEffects(skill);
        if (blockedByCannotUseHarmfulSkills) continue;
        if (hasStatusMetadataFlag(actorState, 'cannotUseHelpfulSkills') && !skillHasHarmfulEffects(skill)) {
            continue;
        }
        const blockedSkillClasses = new Set(
            (Array.isArray(actorState?.statuses) ? actorState.statuses : []).flatMap((status) => {
                const remaining = Number(status?.remainingTurns) || 0;
                if (remaining <= 0) return [];
                const blocked = status?.metadata?.cannotUseSkillClasses;
                if (!Array.isArray(blocked)) return [];
                return blocked
                    .map((entry) => (typeof entry === 'string' ? entry.trim().toLowerCase() : ''))
                    .filter(Boolean);
            })
        );
        if (
            blockedSkillClasses.size > 0 &&
            (Array.isArray(skill?.classes) ? skill.classes : []).some((entry) =>
                blockedSkillClasses.has(typeof entry === 'string' ? entry.trim().toLowerCase() : '')
            )
        ) {
            continue;
        }
        if (
            hasStatusMetadataFlag(actorState, 'cannotUseNonMentalSkills') &&
            !hasSkillClass(skill?.classes || [], 'mental')
        ) {
            continue;
        }
        if (!doesActorSatisfySkillCondition(actorUnit, actorState, skill)) continue;
        const queuedCost = queued?.reservedSpecific && Number.isFinite(Number(queued?.requiredRandom))
            ? { reservedSpecific: queued.reservedSpecific, requiredRandom: queued.requiredRandom }
            : computeEffectiveEnergyCost({ skill, actorState });
        const paidChakraCount = queued?.isAutoCast ? 0 : chakraTypes.reduce(
            (sum, type) => sum + Math.max(0, Number(queuedCost.reservedSpecific?.[type]) || 0),
            Math.max(0, Number(queuedCost.requiredRandom) || 0)
        );
        const ownerUseSkillTriggeredStatusIds = new Set();
        const skillIsMental = hasSkillClass(skill?.classes || [], 'mental');
        (Array.isArray(actorState?.statuses) ? actorState.statuses : []).forEach((status) => {
            const remaining = Number(status?.remainingTurns) || 0;
            if (remaining <= 0) return;
            const ownerUseSkillClassesAny = Array.isArray(status?.metadata?.onOwnerUseSkillClassesAny)
                ? status.metadata.onOwnerUseSkillClassesAny
                      .map((entry) => normalizeSkillClassName(entry))
                      .filter(Boolean)
                : [];
            const ownerSkillMatchesClassFilter =
                ownerUseSkillClassesAny.length === 0 ||
                ownerUseSkillClassesAny.some((entry) => hasSkillClass(skill?.classes || [], entry));
            if (!ownerSkillMatchesClassFilter) return;
            const ownerUseSkillSelfDamage = Math.max(
                0,
                Number(status?.metadata?.onOwnerUseSkillSelfDamage) || 0
            ) + paidChakraCount * Math.max(
                0, Number(status?.metadata?.onOwnerUseChakraSpentAfflictionDamagePerChakra) || 0
            );
            if (ownerUseSkillSelfDamage > 0) {
                applyDamageToUnit(actorUnit, ownerUseSkillSelfDamage, {
                    match,
                    sourceUsername: status?.sourceUsername || null,
                    sourceSlot: Number.isInteger(status?.sourceSlot) ? status.sourceSlot : null,
                    sourceSkillId: status?.sourceSkillId || null,
                    targetUsername: actingUsername,
                    damageDebugReason: 'owner-use self damage',
                    afflictionDamage: Boolean(status?.metadata?.onOwnerUseChakraSpentAfflictionDamagePerChakra),
                    ignoreDamageReduction:
                        status?.metadata?.onOwnerUseSkillSelfDamageIgnoreDamageReduction === undefined
                            ? true
                            : Boolean(status?.metadata?.onOwnerUseSkillSelfDamageIgnoreDamageReduction),
                    ignoreDestructibleDefense:
                        status?.metadata?.onOwnerUseSkillSelfDamageIgnoreDestructibleDefense === undefined
                            ? true
                            : Boolean(status?.metadata?.onOwnerUseSkillSelfDamageIgnoreDestructibleDefense),
                });
                if (status?.id && Boolean(status?.metadata?.consumeOnOwnerUseSkillSelfDamage)) {
                    ownerUseSkillTriggeredStatusIds.add(status.id);
                }
            }
            const nonMentalTriggerDamage = Math.max(
                0,
                Number(status?.metadata?.onOwnerUseNonMentalSkillSelfDamage) || 0
            );
            if (nonMentalTriggerDamage > 0 && !skillIsMental) {
                applyDamageToUnit(actorUnit, nonMentalTriggerDamage, {
                    match,
                    sourceUsername: status?.sourceUsername || null,
                    targetUsername: actingUsername,
                    ignoreDamageReduction:
                        status?.metadata?.onOwnerUseNonMentalSkillSelfDamageIgnoreDamageReduction === undefined
                            ? true
                            : Boolean(
                                  status?.metadata?.onOwnerUseNonMentalSkillSelfDamageIgnoreDamageReduction
                              ),
                    ignoreDestructibleDefense:
                        status?.metadata?.onOwnerUseNonMentalSkillSelfDamageIgnoreDestructibleDefense === undefined
                            ? true
                            : Boolean(
                                  status?.metadata?.onOwnerUseNonMentalSkillSelfDamageIgnoreDestructibleDefense
                              ),
                });
                if (status?.id) ownerUseSkillTriggeredStatusIds.add(status.id);
            }
            if (!Boolean(status?.metadata?.onOwnerUseSkillTrigger)) return;
            const ownerUseSkillTriggerClassesAny = Array.isArray(status?.metadata?.onOwnerUseSkillClassesAny)
                ? status.metadata.onOwnerUseSkillClassesAny
                      .map((entry) => normalizeSkillClassName(entry))
                      .filter(Boolean)
                : [];
            const ownerUseSkillTriggerIdsAny = Array.isArray(status?.metadata?.onOwnerUseSkillIdsAny)
                ? status.metadata.onOwnerUseSkillIdsAny
                      .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
                      .filter(Boolean)
                : [];
            if (
                ownerUseSkillTriggerClassesAny.length > 0 &&
                !ownerUseSkillTriggerClassesAny.some((entry) => hasSkillClass(skill?.classes || [], entry))
            ) {
                return;
            }
            if (
                ownerUseSkillTriggerIdsAny.length > 0 &&
                !ownerUseSkillTriggerIdsAny.includes(skill?.id || '')
            ) {
                return;
            }
            if (Boolean(status?.metadata?.onOwnerUseSkillHarmfulOnly) && !skillHasHarmfulEffects(skill)) {
                return;
            }
            const removeStatusIdsOnOwnerUseSkill = Array.isArray(status?.metadata?.removeStatusIdsOnOwnerUseSkill)
                ? status.metadata.removeStatusIdsOnOwnerUseSkill.filter((id) => typeof id === 'string' && id)
                : [];
            removeStatusIdsOnOwnerUseSkill.forEach((id) => ownerUseSkillTriggeredStatusIds.add(id));
            if (status?.id && !Boolean(status?.metadata?.persistOnOwnerUseSkillTrigger)) {
                ownerUseSkillTriggeredStatusIds.add(status.id);
            }
            const sourceUnit =
                status?.sourceUsername && Number.isInteger(status?.sourceSlot)
                    ? match.board?.[status.sourceUsername]?.[Number(status.sourceSlot)] || null
                    : null;
            const healAmount = Math.max(0, Number(status?.metadata?.onOwnerUseSkillHealSourceAmount) || 0);
            if (healAmount > 0 && sourceUnit && sourceUnit.alive !== false) {
                applyHealToUnit(sourceUnit, healAmount);
            }
            const applyStatusToOwner = status?.metadata?.onOwnerUseSkillApplyStatusToOwner;
            if (applyStatusToOwner?.statusId) {
                const applyCondition = status?.metadata?.onOwnerUseSkillApplyStatusToOwnerCondition;
                if (
                    applyCondition &&
                    !doesEffectConditionMatch({
                        condition: applyCondition,
                        actorState,
                        targetState: actorState,
                        actorUnit,
                        targetUnit: actorUnit,
                        actorUsername: actingUsername,
                        targetUsername: actingUsername,
                    })
                ) {
                    return;
                }
                applyStatus({
                    targetState: actorState,
                    statusId: applyStatusToOwner.statusId,
                    duration: applyStatusToOwner.duration,
                    sourceSkillId: status?.sourceSkillId || null,
                    sourceUsername: status?.sourceUsername || null,
                    sourceSlot: Number.isInteger(status?.sourceSlot) ? status.sourceSlot : null,
                    metadata: applyStatusToOwner.metadata || {},
                    fresh: false,
                });
            }
            const ownerUseSkillEffects = Array.isArray(status?.metadata?.onOwnerUseSkillEffects)
                ? status.metadata.onOwnerUseSkillEffects.filter((effect) => effect && typeof effect === 'object')
                : [];
            if (ownerUseSkillEffects.length > 0) {
                applyTriggeredEffectsFromStatus({
                    effects: ownerUseSkillEffects,
                    match,
                    status,
                    targetUnit: actorUnit,
                    targetState: actorState,
                    targetUsername: actingUsername,
                    targetSlot: actorSlot,
                });
            }
        });
        if (ownerUseSkillTriggeredStatusIds.size > 0) {
            actorState.statuses = (Array.isArray(actorState.statuses) ? actorState.statuses : []).filter(
                (status) =>
                    !ownerUseSkillTriggeredStatusIds.has(status?.id) ||
                    Boolean(status?.metadata?.preserveOnOwnerUseSkillTrigger)
            );
        }

        applyOnTeamMemberUseSkillBonuses({
            match,
            actorState,
            actingUsername,
            skill,
            skillIsMental,
        });
        applyOnEnemyTeamMemberUseSkillBonuses({
            match,
            actorState,
            actingUsername,
            actorUnit,
            skill,
            skillIsMental,
        });

        const effects = Array.isArray(skill.effects) ? skill.effects : [];
        if (!effects.length) continue;
        if (!doesActorSatisfySkillCondition(actorUnit, actorState, skill)) continue;
        const teamDefenseDamageBonus = actorBoard.reduce((sum, unit) => {
            if (!unit || unit.alive === false) return sum;
            return sum + Math.max(0, Number(
                characters?.[unit.rosterIndex]?.passive?.teamNonAfflictionDamageBonusWhileDestructibleDefense
            ) || 0);
        }, 0);
        const teamDefenseBonusAppliedTo = new Set();
        const hasDestructibleDefense = () => (actorState.statuses || []).some((status) =>
            (Number(status?.remainingTurns) || 0) > 0 &&
            (Number(status?.metadata?.destructibleDefensePoints) || 0) > 0
        );
        const ebisuMentor = actorBoard.find((unit) =>
            unit && unit.alive !== false &&
            characters?.[unit.rosterIndex]?.passive?.teamSkillCostDefense);
        const mentorConfig = ebisuMentor && characters[ebisuMentor.rosterIndex].passive.teamSkillCostDefense;
        if (mentorConfig && paidChakraCount >= Math.max(1, Number(mentorConfig.minimumCost) || 2)) {
            applyStatus({
                targetState: actorState,
                statusId: mentorConfig.statusId,
                duration: mentorConfig.duration,
                sourceUsername: actingUsername,
                sourceSlot: actorBoard.indexOf(ebisuMentor),
                metadata: { helpful: true, destructibleDefensePoints: mentorConfig.points,
                    tooltipTextTemplate: 'This character has {destructibleDefensePoints} destructible defense from Mentor Fundamentals.' },
                fresh: true,
            });
        }
        if (skill?.id) {
            const skillUses =
                actorState.skillUses && typeof actorState.skillUses === 'object' ? actorState.skillUses : {};
            skillUses[skill.id] = (Number(skillUses[skill.id]) || 0) + 1;
            const altId = skill.baseSkillId || skill.trackUsesForSkillId;
            if (altId && altId !== skill.id) {
                skillUses[altId] = (Number(skillUses[altId]) || 0) + 1;
            }
            actorState.skillUses = skillUses;
            actorState.totalSkillUseCount = (Number(actorState.totalSkillUseCount) || 0) + 1;
            const newUseCount = skillUses[skill.id];
            actorState.statuses = (Array.isArray(actorState.statuses) ? actorState.statuses : []).filter(
                (existingStatus) => {
                    const rawRules = existingStatus?.metadata?.removeSelfOnSkillUseCount;
                    const rules = Array.isArray(rawRules) ? rawRules : rawRules ? [rawRules] : [];
                    const matchedRule = rules.find(
                        (rule) => rule && typeof rule === 'object' && rule.skillId === skill.id
                    );
                    if (!matchedRule) return true;
                    const atLeast = Math.max(1, Number(matchedRule.atLeast) || 1);
                    return newUseCount < atLeast;
                }
            );
        }
        const skillCannotBeCountered = Boolean(skill?.cannotBeCountered);
        const actingCharacter = characters?.[actorUnit?.rosterIndex] || null;
        const actingCharacterId =
            (typeof actingCharacter?.id === 'string' && actingCharacter.id) ||
            (typeof actingCharacter?.characterId === 'string' && actingCharacter.characterId) ||
            null;
        const castStartStatuses = (Array.isArray(actorState.statuses) ? actorState.statuses : [])
            .filter((status) => (status?.remainingTurns || 0) > 0)
            .map((status) => ({
                id: status?.id,
                remainingTurns: status?.remainingTurns,
                metadata: status?.metadata && typeof status.metadata === 'object' ? { ...status.metadata } : {},
            }));
        const nextAttackStatuses = (skill.effects || []).some((effect) =>
            effect?.type === 'damage' || effect?.type === 'health_steal_damage')
            ? castStartStatuses.filter((status) => Number(status.metadata?.nextAttackDamageBonusFlat) > 0)
            : [];
        const nextAttackBonus = nextAttackStatuses.reduce((sum, status) =>
            sum + Math.max(0, Number(status.metadata.nextAttackDamageBonusFlat) || 0), 0);
        const castStartStatusIds = new Set(
            castStartStatuses.filter((status) => status?.id).map((status) => status.id)
        );
        const selection = normalizeTargetSelection(queued.targetSelection);
        const bypassEnemyInvulnerability =
            canActorIgnoreEnemyInvulnerability(actorUnit, skill?.id || null) ||
            doesSkillIgnoreInvulnerability(skill);
        const opponentEntry = (match.players || []).find((p) => p.username !== actingUsername);
        const opponentUsername = opponentEntry?.username;
        const actorAllies = (match.board?.[actingUsername] || [])
            .map((unit, slot) => ({ username: actingUsername, slot, unit }))
            .filter((entry) => entry.unit && entry.unit.alive !== false && !isUnitBanished(entry.unit));
        const opponentUnits = (match.board?.[opponentUsername] || [])
            .map((unit, slot) => ({ username: opponentUsername, slot, unit }))
            .filter((entry) => {
                if (!entry.unit || entry.unit.alive === false || isUnitBanished(entry.unit)) return false;
                if (
                    !canActorTargetUnit({
                        actorState,
                        targetUsername: entry.username,
                        targetSlot: entry.slot,
                    })
                ) {
                    return false;
                }
                if (!doesUnitSatisfySkillTargetCondition(
                    entry.unit, skill, actingUsername, actorSlot
                )) return false;
                return (
                    bypassEnemyInvulnerability ||
                    canActorIgnoreTargetInvulnerabilityBySourceMark({
                        actorCharacterId: actingCharacterId,
                        actorSkillId: skill?.id || null,
                        targetUnit: entry.unit,
                    }) ||
                    !isUnitInvulnerableForSkill(entry.unit, skill.classes || [])
                );
            });
        const allAliveUnits = [...actorAllies, ...opponentUnits];
        const actorHasHarmfulBlind = hasStatusMetadataFlag(actorState, 'harmfulBlind');
        const actorHasHelpfulBlind = hasStatusMetadataFlag(actorState, 'helpfulBlind');
        const allSkillsBlind = hasStatusMetadataFlag(actorState, 'allSkillsBlindToRandomEnemy');
        const confusedTarget = allSkillsBlind ? pickRandomEntry(opponentUnits) : null;
        const shouldRetargetToRandomEnemy = actorHasHarmfulBlind && skillHasHarmfulEffects(skill);
        const shouldRetargetToRandomAlly = actorHasHelpfulBlind && !skillHasHarmfulEffects(skill);
        const selectedTargets = allSkillsBlind && confusedTarget ? [confusedTarget] : selection
            .map((target) => {
                let entry = {
                    username: target.username,
                    slot: target.slot,
                    unit: match.board?.[target.username]?.[target.slot] || null,
                };
                if (!entry.unit || entry.unit.alive === false || isUnitBanished(entry.unit)) return null;

                const targetState = ensureUnitStateShape(entry.unit);
                if (hasStatusMetadataFlag(targetState, 'fullBlind')) {
                    const blindPick = pickRandomEntry(allAliveUnits);
                    if (blindPick?.unit && blindPick.unit.alive !== false) {
                        entry = blindPick;
                    }
                }

                if (shouldRetargetToRandomEnemy) {
                    const harmfulPick = pickRandomEntry(opponentUnits);
                    if (harmfulPick?.unit && harmfulPick.unit.alive !== false) {
                        entry = harmfulPick;
                    }
                } else if (shouldRetargetToRandomAlly) {
                    const helpfulPool = actorAllies.filter((ally) => ally?.unit && ally.unit.alive !== false);
                    const helpfulPick = pickRandomEntry(helpfulPool);
                    if (helpfulPick?.unit && helpfulPick.unit.alive !== false) {
                        entry = helpfulPick;
                    }
                }

                return entry;
            })
            .filter((entry) => {
                if (!entry?.unit || entry.unit.alive === false) return false;
                const isEnemyTarget = entry.username !== actingUsername;
                if (!isEnemyTarget) return true;
                if (
                    !canActorTargetUnit({
                        actorState,
                        targetUsername: entry.username,
                        targetSlot: entry.slot,
                    })
                ) {
                    return false;
                }
                if (!doesUnitSatisfySkillTargetCondition(
                    entry.unit, skill, actingUsername, actorSlot
                )) return false;
                return (
                    bypassEnemyInvulnerability ||
                    canActorIgnoreTargetInvulnerabilityBySourceMark({
                        actorCharacterId: actingCharacterId,
                        actorSkillId: skill?.id || null,
                        targetUnit: entry.unit,
                    }) ||
                    !isUnitInvulnerableForSkill(entry.unit, skill.classes || [])
                );
            });
        const skillIsHarmful = skillHasHarmfulEffects(skill);
        const selectedDamageTarget = selectedTargets[0] || null;
        const activeDamageEffects = effects.filter((effect) => {
            if (effect?.type !== 'damage' && effect?.type !== 'health_steal_damage') return false;
            if (!effect.condition) return true;
            return doesEffectConditionMatch({
                condition: effect.condition, actorState,
                targetState: selectedDamageTarget?.unit
                    ? ensureUnitStateShape(selectedDamageTarget.unit) : actorState,
                actorUnit, targetUnit: selectedDamageTarget?.unit || actorUnit,
                actorUsername: actingUsername,
                targetUsername: selectedDamageTarget?.username || actingUsername,
            }) || isConditionalDamageOverrideOnly(effect.condition);
        });
        const isSingleTargetDamageSkill =
            ['single-enemy', 'single-character', 'single-target'].includes(
                String(skill.target || '').trim().toLowerCase()
            ) && activeDamageEffects.length > 0 &&
            activeDamageEffects.every((effect) => ![
                'all-enemy', 'other-enemies', 'all-allies', 'all-units', 'random-enemy',
            ].includes(effect.scope)) &&
            activeDamageEffects.some((effect) => (effect.scope || 'target') === 'target');
        const missionAssignmentStatuses = isSingleTargetDamageSkill
            ? castStartStatuses.filter((status) =>
                (Number(status?.metadata?.nextSingleTargetNonAfflictionDamageBonusFlat) || 0) > 0)
            : [];
        const missionAssignmentBonus = missionAssignmentStatuses.reduce((sum, status) =>
            sum + Math.max(0, Number(status.metadata.nextSingleTargetNonAfflictionDamageBonusFlat) || 0), 0);
        let missionAssignmentBonusApplied = false;
        const previousSkillTargetKey = actorState?.snapshots?.currentSkillTargetKey || '';
        const primaryEnemyTarget = selectedTargets.find(
            (entry) =>
                entry?.username &&
                Number.isInteger(entry?.slot) &&
                entry.username !== actingUsername
        );
        actorState.snapshots = actorState.snapshots || {};
        actorState.snapshots.previousSkillTargetKey = previousSkillTargetKey;
        actorState.snapshots.currentSkillTargetKey = primaryEnemyTarget
            ? `${primaryEnemyTarget.username}:${primaryEnemyTarget.slot}`
            : '';
        const previousTargetMarkerStatuses = (Array.isArray(actorState.statuses) ? actorState.statuses : []).filter(
            (status) =>
                status &&
                (Number(status.remainingTurns) || 0) > 0 &&
                typeof status?.metadata?.samePreviousTargetMarkerStatusId === 'string' &&
                status.metadata.samePreviousTargetMarkerStatusId
        );
        previousTargetMarkerStatuses.forEach((status) => {
            const markerStatusId = status.metadata.samePreviousTargetMarkerStatusId;
            Object.values(match.board || {}).forEach((units) => {
                if (!Array.isArray(units)) return;
                units.forEach((unit) => {
                    if (!unit) return;
                    const state = ensureUnitStateShape(unit);
                    state.statuses = (Array.isArray(state.statuses) ? state.statuses : []).filter(
                        (entry) =>
                            !(
                                entry?.id === markerStatusId &&
                                entry?.sourceUsername === actingUsername &&
                                Number(entry?.sourceSlot) === actorSlot
                            )
                    );
                });
            });
            if (!primaryEnemyTarget?.unit) return;
            const markerTooltip =
                typeof status.metadata.samePreviousTargetMarkerTooltipText === 'string' &&
                status.metadata.samePreviousTargetMarkerTooltipText
                    ? status.metadata.samePreviousTargetMarkerTooltipText
                    : 'Sasuke will deal additional damage to this character if he targets them again.';
            applyStatus({
                targetState: ensureUnitStateShape(primaryEnemyTarget.unit),
                statusId: markerStatusId,
                duration: 99,
                sourceSkillId: status.sourceSkillId || skill?.id || null,
                sourceUsername: actingUsername,
                sourceSlot: actorSlot,
                metadata: {
                    harmful: true,
                    tooltipText: markerTooltip,
                },
            });
        });
        const personalReflectStatus = (Array.isArray(actorState.statuses) ? actorState.statuses : []).find(
            (status) => {
                const remaining = Number(status?.remainingTurns) || 0;
                if (remaining <= 0) return false;
                if (!Boolean(status?.metadata?.reflectNextIncomingSkill)) return false;
                return skillMatchesReflectRule({
                    statusMetadata: status?.metadata || {},
                    skillClasses: skill.classes || [],
                    skillIsHarmful,
                });
            }
        );
        const canReflectByPersonalStatus = Boolean(personalReflectStatus);
        const enemyTargetUsernames = new Set(
            selectedTargets
                .filter((entry) => entry?.username && entry.username !== actingUsername)
                .map((entry) => entry.username)
        );
        let mentalGuardReflectHolder = null;
        if (skillIsHarmful && enemyTargetUsernames.size > 0) {
            for (const username of enemyTargetUsernames) {
                const team = Array.isArray(match.board?.[username]) ? match.board[username] : [];
                for (let slot = 0; slot < team.length; slot += 1) {
                    const unit = team[slot];
                    if (!unit || unit.alive === false) continue;
                    const state = ensureUnitStateShape(unit);
                    const reflectStatus = (Array.isArray(state.statuses) ? state.statuses : []).find((status) => {
                        const remaining = Number(status?.remainingTurns) || 0;
                        if (remaining <= 0) return false;
                        if (!Boolean(status?.metadata?.teamReflectNextIncomingSkill)) return false;
                        return skillMatchesReflectRule({
                            statusMetadata: status?.metadata || {},
                            skillClasses: skill.classes || [],
                            skillIsHarmful,
                        });
                    });
                    if (!reflectStatus) continue;
                    mentalGuardReflectHolder = {
                        username,
                        slot,
                        unit,
                        state,
                        reflectStatusId: reflectStatus.id,
                        reflectStatusMetadata: reflectStatus.metadata || {},
                    };
                    break;
                }
                if (mentalGuardReflectHolder) break;
            }
        }
        const skillCannotBeReflected = Boolean(skill?.cannotBeReflected);
        const shouldReflectTargetsByPersonalStatus = !skillCannotBeReflected && canReflectByPersonalStatus;
        const shouldReflectTargetsByMentalGuard = !skillCannotBeReflected && Boolean(mentalGuardReflectHolder);
        const targetReflectStatusByKey = new Map();
        const getTargetReflectStatus = (recipient) => {
            if (!recipient?.unit || recipient.unit.alive === false) return null;
            if (recipient.username === actingUsername) return null;
            const key = `${recipient.username}:${recipient.slot}`;
            if (targetReflectStatusByKey.has(key)) {
                return targetReflectStatusByKey.get(key);
            }
            const state = ensureUnitStateShape(recipient.unit);
            const reflectStatus = (Array.isArray(state.statuses) ? state.statuses : []).find((status) => {
                const remaining = Number(status?.remainingTurns) || 0;
                if (remaining <= 0) return false;
                if (!Boolean(status?.metadata?.reflectNextIncomingSkill)) return false;
                return skillMatchesReflectRule({
                    statusMetadata: status?.metadata || {},
                    skillClasses: skill.classes || [],
                    skillIsHarmful,
                });
            });
            targetReflectStatusByKey.set(key, reflectStatus || null);
            return reflectStatus || null;
        };
        if (
            shouldReflectTargetsByPersonalStatus &&
            personalReflectStatus?.id &&
            !Boolean(personalReflectStatus?.metadata?.persistReflectAcrossTriggers)
        ) {
            consumeStatus(actorState, personalReflectStatus.id);
        }
        if (
            shouldReflectTargetsByMentalGuard &&
            mentalGuardReflectHolder?.state &&
            mentalGuardReflectHolder?.reflectStatusId &&
            !Boolean(mentalGuardReflectHolder?.reflectStatusMetadata?.persistReflectAcrossTriggers)
        ) {
            consumeStatus(mentalGuardReflectHolder.state, mentalGuardReflectHolder.reflectStatusId);
        }
        const randomScopeGroupPicks = new Map();
        const reflectedRecipientByOriginalKey = new Map();
        const resolveFixedReflectTarget = (metadata, sourceStatus = null) => {
            let fixedUsername = null;
            let fixedSlot = null;
            if (Boolean(metadata?.reflectToFixedTarget)) {
                fixedUsername = metadata?.reflectTargetUsername;
                fixedSlot = Number(metadata?.reflectTargetSlot);
            } else if (Boolean(metadata?.reflectToSourceCaster)) {
                fixedUsername = sourceStatus?.sourceUsername;
                fixedSlot = Number(sourceStatus?.sourceSlot);
            } else {
                return null;
            }
            if (typeof fixedUsername !== 'string' || !fixedUsername || !Number.isInteger(fixedSlot)) return null;
            const fixedUnit = match?.board?.[fixedUsername]?.[fixedSlot] || null;
            if (!fixedUnit || fixedUnit.alive === false) return null;
            return { username: fixedUsername, slot: fixedSlot, unit: fixedUnit };
        };
        const reflectRecipients = (recipients = []) =>
            (Array.isArray(recipients) ? recipients : []).map((recipient) => {
                if (!recipient?.unit || recipient.unit.alive === false) return recipient;
                if (recipient.username === actingUsername) return recipient;
                const targetReflectStatus = getTargetReflectStatus(recipient);
                if (targetReflectStatus?.id) {
                    const targetState = ensureUnitStateShape(recipient.unit);
                    const metadata = targetReflectStatus?.metadata || {};
                    if (!Boolean(metadata?.persistReflectAcrossTriggers)) {
                        consumeStatus(targetState, targetReflectStatus.id);
                    }
                    const fixedTarget = resolveFixedReflectTarget(metadata, targetReflectStatus);
                    if (fixedTarget) {
                        return fixedTarget;
                    }
                    if (Boolean(metadata?.reflectBackToCaster)) {
                        return { username: actingUsername, slot: actorSlot, unit: actorUnit };
                    }
                    const reflectToRandomCasterAlly =
                        Boolean(metadata?.reflectToRandomCasterAlly) ||
                        Boolean(metadata?.reflectToRandomEnemyTarget);
                    if (!reflectToRandomCasterAlly) {
                        return { username: actingUsername, slot: actorSlot, unit: actorUnit };
                    }
                    const alternatives = actorAllies.filter(
                        (entry) =>
                            entry?.unit &&
                            entry.unit.alive !== false &&
                            Number(entry.slot) !== Number(actorSlot)
                    );
                    if (alternatives.length > 0) {
                        return alternatives[Math.floor(Math.random() * alternatives.length)];
                    }
                    return { username: actingUsername, slot: actorSlot, unit: actorUnit };
                }
                if (shouldReflectTargetsByMentalGuard) {
                    return { username: actingUsername, slot: actorSlot, unit: actorUnit };
                }
                if (!shouldReflectTargetsByPersonalStatus) return recipient;
                const personalReflectMetadata = personalReflectStatus?.metadata || {};
                const fixedPersonalTarget = resolveFixedReflectTarget(personalReflectMetadata, personalReflectStatus);
                if (fixedPersonalTarget) {
                    return fixedPersonalTarget;
                }
                if (Boolean(personalReflectMetadata?.reflectBackToCaster)) {
                    return { username: actingUsername, slot: actorSlot, unit: actorUnit };
                }
                const reflectToRandomCasterAlly =
                    Boolean(personalReflectMetadata?.reflectToRandomCasterAlly) ||
                    Boolean(personalReflectMetadata?.reflectToRandomEnemyTarget);
                if (!reflectToRandomCasterAlly) {
                    return recipient;
                }
                const originalKey = `${recipient.username}:${recipient.slot}`;
                const existingRedirect = reflectedRecipientByOriginalKey.get(originalKey);
                if (existingRedirect?.unit && existingRedirect.unit.alive !== false) {
                    return existingRedirect;
                }
                const alternatives = actorAllies.filter(
                    (entry) =>
                        entry?.unit &&
                        entry.unit.alive !== false &&
                        Number(entry.slot) !== Number(actorSlot)
                );
                if (alternatives.length > 0) {
                    const redirect = alternatives[Math.floor(Math.random() * alternatives.length)];
                    reflectedRecipientByOriginalKey.set(originalKey, redirect);
                    return redirect;
                }
                const fallback = { username: actingUsername, slot: actorSlot, unit: actorUnit };
                reflectedRecipientByOriginalKey.set(originalKey, fallback);
                return fallback;
            });
        const resolveRecipients = (effect) => {
            const scope = effect?.scope;
            if (allSkillsBlind && confusedTarget && scope !== 'controlled-source') {
                return filterHelpfulImmuneRecipients({
                    effect, recipients: reflectRecipients([confusedTarget]), actingUsername,
                });
            }
            if (scope === 'controlled-source') {
                const controlledStatusId = effect?.metadata?.controlledStatusId;
                const units = Array.isArray(match.board?.[opponentUsername])
                    ? match.board[opponentUsername] : [];
                return units.flatMap((unit, slot) =>
                    unit?.alive !== false && ensureUnitStateShape(unit).statuses.some((status) =>
                        status?.id === controlledStatusId && (Number(status.remainingTurns) || 0) > 0 &&
                        status.sourceUsername === actingUsername && status.sourceSlot === actorSlot)
                        ? [{ username: opponentUsername, slot, unit }] : []);
            }
            if (scope === 'linked-enemy-other-than-target') {
                const linkedStatusId = effect?.metadata?.linkedTargetStatusId;
                const selectedKeys = new Set(selectedTargets.map((entry) => `${entry.username}:${entry.slot}`));
                return reflectRecipients(opponentUnits.filter((entry) =>
                    !selectedKeys.has(`${entry.username}:${entry.slot}`) &&
                    (entry.unit.state?.statuses || []).some((status) =>
                        status?.id === linkedStatusId && (Number(status.remainingTurns) || 0) > 0 &&
                        status.sourceUsername === actingUsername && status.sourceSlot === actorSlot
                    )
                ));
            }
            if (scope === 'all-enemy-without-source-status') {
                const excludedStatusId = effect?.metadata?.excludedStatusId;
                return reflectRecipients(opponentUnits.filter((entry) =>
                    !(entry.unit.state?.statuses || []).some((status) =>
                        status?.id === excludedStatusId && (Number(status.remainingTurns) || 0) > 0 &&
                        status.sourceUsername === actingUsername && status.sourceSlot === actorSlot
                    )
                ));
            }
            if (scope === 'self') {
                return filterHelpfulImmuneRecipients({
                    effect,
                    recipients: [{ username: actingUsername, slot: actorSlot, unit: actorUnit }],
                    actingUsername,
                });
            }
            if (scope === 'all-units') {
                return filterHelpfulImmuneRecipients({
                    effect,
                    recipients: [...actorAllies, ...opponentUnits],
                    actingUsername,
                });
            }
            if (scope === 'all-allies') {
                return filterHelpfulImmuneRecipients({ effect, recipients: actorAllies, actingUsername });
            }
            if (scope === 'target') {
                return filterHelpfulImmuneRecipients({
                    effect,
                    recipients: reflectRecipients(selectedTargets),
                    actingUsername,
                });
            }
            if (scope === 'all-enemy') {
                return filterHelpfulImmuneRecipients({
                    effect,
                    recipients: reflectRecipients(opponentUnits),
                    actingUsername,
                });
            }
            if (scope === 'all-other-enemy') {
                const selectedKeys = new Set(
                    selectedTargets
                        .filter((entry) => entry?.username && Number.isInteger(entry?.slot))
                        .map((entry) => `${entry.username}:${entry.slot}`)
                );
                return filterHelpfulImmuneRecipients({
                    effect,
                    recipients: reflectRecipients(
                        opponentUnits.filter((entry) => !selectedKeys.has(`${entry.username}:${entry.slot}`))
                    ),
                    actingUsername,
                });
            }
            if (scope === 'random-enemy') {
                if (!opponentUnits.length) return [];
                const randomGroupKey = effect?.metadata?.randomScopeGroupKey;
                if (randomGroupKey) {
                    const savedPick = randomScopeGroupPicks.get(randomGroupKey);
                    if (savedPick?.unit && savedPick.unit.alive !== false) {
                        return filterHelpfulImmuneRecipients({
                            effect,
                            recipients: reflectRecipients([savedPick]),
                            actingUsername,
                        });
                    }
                    const groupedPick = opponentUnits[Math.floor(Math.random() * opponentUnits.length)];
                    if (groupedPick) {
                        randomScopeGroupPicks.set(randomGroupKey, groupedPick);
                        return filterHelpfulImmuneRecipients({
                            effect,
                            recipients: reflectRecipients([groupedPick]),
                            actingUsername,
                        });
                    }
                    return [];
                }
                const pick = opponentUnits[Math.floor(Math.random() * opponentUnits.length)];
                return pick
                    ? filterHelpfulImmuneRecipients({
                          effect,
                          recipients: reflectRecipients([pick]),
                          actingUsername,
                      })
                    : [];
            }
            if (scope === 'random-other-enemy') {
                const selectedKeys = new Set(
                    selectedTargets
                        .filter((entry) => entry?.username && Number.isInteger(entry?.slot))
                        .map((entry) => `${entry.username}:${entry.slot}`)
                );
                const pool = opponentUnits.filter(
                    (entry) => !selectedKeys.has(`${entry.username}:${entry.slot}`)
                );
                if (!pool.length) return [];
                const randomGroupKey = effect?.metadata?.randomScopeGroupKey;
                if (randomGroupKey) {
                    const savedPick = randomScopeGroupPicks.get(randomGroupKey);
                    if (
                        savedPick?.unit &&
                        savedPick.unit.alive !== false &&
                        !selectedKeys.has(`${savedPick.username}:${savedPick.slot}`)
                    ) {
                        return filterHelpfulImmuneRecipients({
                            effect,
                            recipients: reflectRecipients([savedPick]),
                            actingUsername,
                        });
                    }
                    const groupedPick = pool[Math.floor(Math.random() * pool.length)];
                    if (groupedPick) {
                        randomScopeGroupPicks.set(randomGroupKey, groupedPick);
                        return filterHelpfulImmuneRecipients({
                            effect,
                            recipients: reflectRecipients([groupedPick]),
                            actingUsername,
                        });
                    }
                    return [];
                }
                const pick = pool[Math.floor(Math.random() * pool.length)];
                return pick
                    ? filterHelpfulImmuneRecipients({
                          effect,
                          recipients: reflectRecipients([pick]),
                          actingUsername,
                      })
                    : [];
            }
            if (scope === 'other-enemies') {
                const selectedKeys = new Set(
                    selectedTargets
                        .filter((entry) => entry?.username && Number.isInteger(entry?.slot))
                        .map((entry) => `${entry.username}:${entry.slot}`)
                );
                return filterHelpfulImmuneRecipients({
                    effect,
                    recipients: reflectRecipients(
                        opponentUnits.filter((entry) => !selectedKeys.has(`${entry.username}:${entry.slot}`))
                    ),
                    actingUsername,
                });
            }
            return filterHelpfulImmuneRecipients({
                effect,
                recipients: reflectRecipients(selectedTargets),
                actingUsername,
            });
        };

        const crystalBallSuppressionStatuses = (actorState.statuses || []).filter((status) =>
            (Number(status?.remainingTurns) || 0) > 0 &&
            status?.sourceUsername === opponentUsername &&
            (Number(status?.metadata?.firstHarmfulSkillAgainstSourceTeamNonAfflictionReductionFlat) || 0) > 0
        );
        const harmfulEffectTargetsTeam = (effect, teamUsername) => {
            if (!isHarmfulEffect(effect)) return false;
            const scope = effect?.scope || 'target';
            if (scope === 'self' || scope === 'all-allies') return actingUsername === teamUsername;
            if (scope === 'all-units') return true;
            if (['all-enemy', 'all-other-enemy', 'other-enemies', 'random-enemy',
                'random-other-enemy', 'all-enemy-without-source-status',
                'linked-enemy-other-than-target'].includes(scope)) {
                return opponentUsername === teamUsername && opponentUnits.length > 0;
            }
            return selectedTargets.some((target) => target?.username === teamUsername);
        };
        const crystalBallSuppressionToConsume = new Set(
            skillIsHarmful
                ? crystalBallSuppressionStatuses.filter((status) =>
                    effects.some((effect) => harmfulEffectTargetsTeam(effect, status.sourceUsername))
                ).map((status) => status.id)
                : []
        );

        const pendingDamage = new Map();
        const afflictionDamageRecipients = new Map();
        const crystalBallReductionRemainingByRecipient = new Map();
        const deferredStatusRemovals = [];
        const evadedRecipients = new Set();
        const evadeDecisionByRecipient = new Map();
        let skillCancelledByEvade = false;
        const skillCannotBeEvaded =
            skillIsHarmful &&
            effects.length > 0 &&
            effects.every((effect) => !isHarmfulEffect(effect) || Boolean(effect?.metadata?.cannotBeEvaded));
        const didEvadeRecipient = (recipient) =>
            evadedRecipients.has(`${recipient?.username || ''}:${recipient?.slot ?? ''}`);
        const queueDamage = (recipient, amount, effect, damageSource = null) => {
            if (!recipient?.unit || recipient.unit.alive === false) return;
            const numericAmount = Math.max(0, Number(amount) || 0);
            if (numericAmount <= 0) return;
            const baseDamage = Math.max(0, Number(effect?.amount) || 0) +
                (isUnitStunned(ensureUnitStateShape(recipient.unit), recipient.unit)
                    ? Math.max(0, Number(effect?.metadata?.bonusDamageIfTargetStunned) || 0) : 0);
            const ignoreDamageReduction =
                Boolean(effect?.metadata?.ignoreDamageReduction) ||
                hasSkillSpecificStatusFlag(actorState, skill.id || null, 'ignoreDamageReductionForSkillIds');
            const ignoreDestructibleDefense = Boolean(effect?.metadata?.ignoreDestructibleDefense);
            const effectSkillClasses = Array.isArray(effect?.metadata?.skillClasses)
                ? effect.metadata.skillClasses
                      .map((entry) => (typeof entry === 'string' ? entry.trim().toLowerCase() : ''))
                      .filter(Boolean)
                : Array.isArray(skill?.classes)
                ? skill.classes
                      .map((entry) => (typeof entry === 'string' ? entry.trim().toLowerCase() : ''))
                      .filter(Boolean)
                : [];
            if (
                Boolean(effect?.metadata?.afflictionDamage) &&
                !effectSkillClasses.includes('affliction')
            ) {
                effectSkillClasses.push('affliction');
            }
            const key = [
                recipient.username || '',
                Number.isInteger(recipient.slot) ? recipient.slot : '',
                ignoreDamageReduction ? 1 : 0,
                ignoreDestructibleDefense ? 1 : 0,
                effect?.type === 'health_steal_damage' || Boolean(effect?.metadata?.healthStealDamage) ? 1 : 0,
                effectSkillClasses.slice().sort().join(','),
                effect?.metadata?.onSuccessfulDamageApplyStatusToTarget?.statusId || '',
                Number.isFinite(effect?.metadata?.executeBelowHpThreshold)
                    ? Number(effect.metadata.executeBelowHpThreshold) : '',
                damageSource?.username || '',
                Number.isInteger(damageSource?.slot) ? damageSource.slot : '',
            ].join('|');
            const existing = pendingDamage.get(key);
            if (existing) {
                existing.amount += numericAmount;
                existing.sourceBaseDamage += baseDamage;
                return;
            }
            pendingDamage.set(key, {
                recipient,
                amount: numericAmount,
                sourceBaseDamage: baseDamage,
                ignoreDamageReduction,
                ignoreDestructibleDefense,
                afflictionDamage: Boolean(effect?.metadata?.afflictionDamage),
                skillClasses: effectSkillClasses,
                sourceSkillId: skill?.id || null,
                sourceUsername: damageSource?.username || actingUsername,
                sourceSlot: Number.isInteger(damageSource?.slot) ? damageSource.slot : actorSlot,
                damageDebugLabel: damageSource?.unit
                    ? characters?.[damageSource.unit.rosterIndex]?.name || null : null,
                minimumHp: Math.max(0, Number(effect?.metadata?.minimumHp) || 0),
                executeBelowHpThreshold: Number.isFinite(effect?.metadata?.executeBelowHpThreshold)
                    ? Math.max(0, Number(effect.metadata.executeBelowHpThreshold)) : null,
                onSuccessfulDamageApplyStatusToTarget:
                    effect?.metadata?.onSuccessfulDamageApplyStatusToTarget || null,
                healthStealDamage:
                    effect?.type === 'health_steal_damage' ||
                    Boolean(effect?.metadata?.healthStealDamage),
            });
        };
        const shouldEvadeForRecipient = (recipient) => {
            if (!recipient?.unit || recipient.unit.alive === false) return false;
            const isEnemySkill = recipient.username !== actingUsername;
            if (!isEnemySkill) return false;
            if (hasStatusMetadataFlag(actorState, 'cannotBeEvadedSkills')) {
                return false;
            }
            const recipientKey = `${recipient.username}:${recipient.slot}`;
            if (evadeDecisionByRecipient.has(recipientKey)) {
                return Boolean(evadeDecisionByRecipient.get(recipientKey));
            }
            const targetState = ensureUnitStateShape(recipient.unit);
            if (targetState._lastEvadeTurnMarker === turnMarker) {
                evadeDecisionByRecipient.set(recipientKey, false);
                return false;
            }
            const evadeDisabledBySource = Array.isArray(targetState?.statuses)
                ? targetState.statuses.some((status) => {
                      const remaining = Number(status?.remainingTurns) || 0;
                      if (remaining <= 0) return false;
                      return (
                          status?.metadata?.cannotEvadeFromSourceCharacterId &&
                          status.metadata.cannotEvadeFromSourceCharacterId === actingCharacterId
                      );
                  })
                : false;
            if (evadeDisabledBySource) {
                evadeDecisionByRecipient.set(recipientKey, false);
                return false;
            }
            const evadeChance = getEvadeChanceAgainstSkill({
                targetState,
                skillClasses: skill.classes || [],
                isEnemySkill,
            });
            if (!rollPercentSuccess(evadeChance)) {
                evadeDecisionByRecipient.set(recipientKey, false);
                return false;
            }
            evadeDecisionByRecipient.set(recipientKey, true);
            evadedRecipients.add(`${recipient.username}:${recipient.slot}`);
            targetState._lastEvadeTurnMarker = turnMarker;
            applyOnEvadeBonuses({
                targetState,
                sourceUsername: actingUsername,
                sourceSlot: actorSlot,
                sourceSkillId: skill.id || null,
                skillClasses: skill.classes || [],
            });
            applyStatus({
                targetState: actorState,
                statusId: 'skill_evaded_notification',
                duration: 1,
                sourceSkillId: skill.id || null,
                sourceUsername: actingUsername,
                sourceSlot: actorSlot,
                metadata: {
                    tooltipText: 'This character had a skill evaded.',
                },
                fresh: true,
            });
            applyOnSkillEvadedBonuses({
                actorState: targetState,
                ownerUsername: recipient.username,
                ownerSlot: recipient.slot,
                sourceUsername: actingUsername,
                sourceSlot: actorSlot,
                sourceSkillId: skill.id || null,
            });
            return true;
        };
        const shouldCancelByEvade = (recipient) => {
            if (!recipient?.unit || recipient.unit.alive === false) return false;
            if (recipient.username === actingUsername) return false;
            if (!skillIsHarmful) return false;
            if (skillCannotBeEvaded) return false;
            return didEvadeRecipient(recipient) || shouldEvadeForRecipient(recipient);
        };
        const preflightRecipientsByTargetType = (() => {
            const targetType = String(skill?.target || '').trim().toLowerCase();
            if (targetType === 'single-enemy' || targetType === 'single-character') {
                return reflectRecipients(selectedTargets.filter((entry) => entry?.username !== actingUsername));
            }
            if (targetType === 'all-enemy' || targetType === 'other-enemies') {
                return reflectRecipients(opponentUnits);
            }
            return [];
        })();
        if (
            !skillCannotBeCountered &&
            maybeTriggerReactiveDefenses({
                match,
                turnMarker,
                actingUsername,
                recipient: { username: actingUsername, slot: actorSlot, unit: actorUnit },
                actorUnit,
                skillClasses: skill.classes || [],
                skillIsHarmful,
                sourceSkillId: skill.id || null,
                allowSelfTrapTrigger: true,
                skill,
                characters,
            })
        ) {
            skillCancelledByEvade = true;
            pendingDamage.clear();
        }
        const damagingEffects = effects.some((effect) =>
                effect?.type === 'damage' || effect?.type === 'health_steal_damage' ||
                Math.max(0, Number(effect?.metadata?.turnEndDamage) || 0) > 0
            );
        if (!damagingEffects) {
                (match.board?.[opponentUsername] || []).forEach((opponentUnit, opponentSlot) => {
                    if (!opponentUnit || opponentUnit.alive === false) return;
                    const passive = (opponentUnit.state?.statuses || []).find((status) =>
                        status?.metadata?.passive === true &&
                        (Number(status?.metadata?.bonusAgainstNonDamagingSkillUser) || 0) > 0 &&
                        (Number(status.remainingTurns) || 0) > 0
                    );
                    if (!passive || characters?.[opponentUnit.rosterIndex]?.characterId !== 'mizuki') return;
                    applyStatus({
                        targetState: actorState, statusId: 'mizuki_meld_in_the_shadows_mark', duration: 1,
                        sourceSkillId: null, sourceUsername: opponentUsername, sourceSlot: opponentSlot,
                        metadata: { harmful: true, turnDurationAnchor: 'source_turn',
                            bonusDamageFromSourceSkillsFlat: Number(passive.metadata.bonusAgainstNonDamagingSkillUser),
                            bonusDamageFromSourceCharacterId: 'mizuki',
                            bonusDamageAppliesToSkillIds: [
                                'mizuki-kunai-ambush', 'mizuki-execution-shuriken',
                                'mizuki-execution-shuriken-windmill',
                            ],
                            tooltipText: 'Mizuki deals 5 additional damage to this character until his turn ends.' },
                        fresh: false,
                    });
                });
        }
        for (const recipient of preflightRecipientsByTargetType) {
            if (!recipient?.unit || recipient.unit.alive === false) continue;
            const targetState = ensureUnitStateShape(recipient.unit);
            if (
                doesTargetIgnoreSkillByClass({
                    targetState,
                    skillClasses: skill.classes || [],
                    isEnemySkill: recipient.username !== actingUsername,
                })
            ) {
                continue;
            }
            triggerOnEnemySkillTargetedBonuses({
                match,
                actingUsername,
                actorUnit,
                actorSlot,
                recipient,
                skill,
            });
            if (
                skillIsHarmful &&
                !skillCannotBeCountered &&
                maybeTriggerReactiveDefenses({
                    match,
                    turnMarker,
                    actingUsername,
                    recipient,
                    actorUnit,
                    skillClasses: skill.classes || [],
                    skillIsHarmful: skillHasHarmfulEffects(skill),
                    sourceSkillId: skill.id || null,
                    skill,
                    characters,
                })
            ) {
                skillCancelledByEvade = true;
                pendingDamage.clear();
                break;
            }
            if (!shouldCancelByEvade(recipient)) continue;
            continue;
        }

        const actorSilencedToNonDamage = hasStatusMetadataFlag(actorState, 'silenceNonDamageEffects');
        const chosenSkillClass = resolveSkillClassChoiceForCast({ skill, queued });
        effects.forEach((rawEffect) => {
            const effect = materializeEffectWithSkillClassChoice(rawEffect, chosenSkillClass);
            if (skillCancelledByEvade) return;
            const effectType = effect?.type;
            if (actorSilencedToNonDamage && effectType !== 'damage') return;
            const rollPerRecipient = Boolean(effect?.rollPerRecipient);
            const chance = Number(effect?.chance);
            if (!rollPerRecipient && Number.isFinite(chance) && chance >= 0 && chance < 100) {
                if (!rollPercentSuccess(chance)) return;
            }
            const activationChance = Number(effect?.activationChancePercent);
            if (!rollPerRecipient && Number.isFinite(activationChance) && !rollPercentSuccess(activationChance)) {
                return;
            }
            if (effectType === 'damage' || effectType === 'health_steal_damage') {
                const isHealthStealDamage = effectType === 'health_steal_damage';
                const delegatedStatusId = effect?.metadata?.damageSourceControlledStatusId;
                const controlledSource = delegatedStatusId
                    ? resolveRecipients({ scope: 'controlled-source',
                        metadata: { controlledStatusId: delegatedStatusId } })[0]
                    : null;
                if (delegatedStatusId && !controlledSource) return;
                const recipients = resolveRecipients(effect);
                recipients.forEach((recipient) => {
                    if (skillCancelledByEvade) return;
                    if (!recipient?.unit || recipient.unit.alive === false) return;
                    if (controlledSource &&
                        (recipient.username !== controlledSource.username ||
                            recipient.slot !== controlledSource.slot)) return;
                    if (rollPerRecipient && Number.isFinite(chance) && chance >= 0 && chance < 100) {
                        if (!rollPercentSuccess(chance)) return;
                    }
                    if (rollPerRecipient && Number.isFinite(activationChance)) {
                        if (!rollPercentSuccess(activationChance)) return;
                    }
                    const targetState = ensureUnitStateShape(recipient.unit);
                    if (hasStatusMetadataFlag(targetState, 'invulnerableToHarmfulEffects')) {
                        return;
                    }
                    if (
                        doesEffectTargetHelpfulRecipient({ effect, recipient, actingUsername }) &&
                        !doesEffectIgnoreHelpfulInvulnerability(effect) &&
                        isUnitInvulnerableToHelpfulSkills(recipient.unit)
                    ) {
                        return;
                    }
                    if (
                        doesTargetIgnoreSkillByClass({
                            targetState,
                            skillClasses: skill.classes || [],
                            isEnemySkill: recipient.username !== actingUsername,
                        })
                    ) {
                        return;
                    }
                    if (!Boolean(effect?.metadata?.cannotBeEvaded) && shouldCancelByEvade(recipient)) {
                        return;
                    }
                    if (isHarmfulEffect(effect)) {
                        if (skillCannotBeCountered) {
                            // This skill bypasses reactive counter mechanics.
                        } else {
                        const counterCancelled = maybeTriggerReactiveDefenses({
                            match,
                            turnMarker,
                            actingUsername,
                            recipient,
                            actorUnit,
                            skillClasses: skill.classes || [],
                            skillIsHarmful: skillHasHarmfulEffects(skill),
                            sourceSkillId: skill.id || null,
                            skill,
                            characters,
                        });
                        if (counterCancelled) {
                            skillCancelledByEvade = true;
                            pendingDamage.clear();
                            return;
                        }
                        }
                    }
                    const condition = effect?.condition;
                    if (condition) {
                        const conditionMatches = doesEffectConditionMatch({
                            condition,
                            actorState,
                            targetState,
                            actorUnit,
                            actorUsername: actingUsername,
                            targetUnit: recipient.unit,
                            targetUsername: recipient.username,
                        });
                        if (!conditionMatches && !isConditionalDamageOverrideOnly(condition)) return;
                        if (conditionMatches && condition.consumeOnMatch && condition.statusId) {
                            const scope = condition.scope === 'target' ? 'target' : 'self';
                            const scopedState = scope === 'target' ? targetState : actorState;
                            consumeStatus(scopedState, condition.statusId);
                        }
                    }
                    const damageActorUnit = controlledSource?.unit || actorUnit;
                    const damageActorState = controlledSource
                        ? ensureUnitStateShape(controlledSource.unit) : actorState;
                    const damageSkillClasses = Array.isArray(effect?.metadata?.skillClasses)
                        ? effect.metadata.skillClasses : skill.classes || [];
                    const amount = resolveEffectDamageAmount({
                        effect,
                        actorState: damageActorState,
                        actorUnit: damageActorUnit,
                        targetState,
                        targetUnit: recipient.unit,
                        skillClasses: damageSkillClasses,
                    });
                    const skillSpecificBonus = controlledSource ? 0 :
                        getSkillSpecificDamageBonus(actorState, skill.id || null);
                    const passiveBonus = controlledSource ? 0 : getCharacterPassiveDamageBonus({
                        actorState,
                        actorUsername: actingUsername,
                        actorSlot,
                        targetState,
                        skillClasses: damageSkillClasses,
                    });
                    const samePreviousTargetBonus = controlledSource ? 0 : getSamePreviousTargetDamageBonus({
                        actorState,
                        recipient,
                        skillId: skill.id || null,
                    });
                    const targetSourceBonus = getTargetBonusDamageFromSource({
                        targetState,
                        sourceCharacterId: controlledSource
                            ? (characters?.[controlledSource.unit.rosterIndex]?.id || null) : actingCharacterId,
                        sourceSkillId: skill.id || null,
                        sourceUsername: controlledSource?.username || actingUsername,
                        sourceSlot: controlledSource?.slot ?? actorSlot,
                        skillClasses: damageSkillClasses,
                        afflictionDamage: Boolean(effect?.metadata?.afflictionDamage) ||
                            hasSkillClass(damageSkillClasses, 'affliction'),
                    });
                    const afflictionDamage = Boolean(effect?.metadata?.afflictionDamage) ||
                        hasSkillClass(damageSkillClasses, 'affliction');
                    const recipientKey = `${recipient.username}:${recipient.slot}`;
                    if (afflictionDamage && amount > 0 && !controlledSource) {
                        afflictionDamageRecipients.set(recipientKey, recipient);
                    }
                    let additionalDamage = 0;
                    if (!controlledSource && !afflictionDamage) {
                        if (teamDefenseDamageBonus > 0 && hasDestructibleDefense() &&
                            !teamDefenseBonusAppliedTo.has(recipientKey)) {
                            additionalDamage += teamDefenseDamageBonus;
                            teamDefenseBonusAppliedTo.add(recipientKey);
                        }
                        if (missionAssignmentBonus > 0 && !missionAssignmentBonusApplied &&
                            (effect.scope || 'target') === 'target') {
                            additionalDamage += missionAssignmentBonus;
                            missionAssignmentBonusApplied = true;
                        }
                    }
                    const rawAmount = Math.max(0,
                        amount + skillSpecificBonus + passiveBonus + samePreviousTargetBonus +
                            targetSourceBonus + (controlledSource ? 0 : nextAttackBonus) + additionalDamage
                    );
                    let crystalBallReduction = 0;
                    if (!afflictionDamage && crystalBallSuppressionToConsume.size > 0) {
                        const remaining = crystalBallReductionRemainingByRecipient.has(recipientKey)
                            ? crystalBallReductionRemainingByRecipient.get(recipientKey)
                            : crystalBallSuppressionStatuses.reduce((sum, status) =>
                                sum + (crystalBallSuppressionToConsume.has(status.id) &&
                                    status.sourceUsername === recipient.username
                                    ? Math.max(0, Number(
                                        status.metadata.firstHarmfulSkillAgainstSourceTeamNonAfflictionReductionFlat
                                    ) || 0) : 0), 0);
                        crystalBallReduction = Math.min(rawAmount, remaining);
                        crystalBallReductionRemainingByRecipient.set(recipientKey, remaining - crystalBallReduction);
                    }
                    const totalAmount = rawAmount - crystalBallReduction;
                    queueDamage(recipient, totalAmount, effect, controlledSource);
                });
                return;
            }

            if (effectType === 'apply_status') {
                const statusTargets =
                    effect?.scope === 'self' && effect?.condition?.scope === 'target'
                        ? filterHelpfulImmuneRecipients({
                              effect,
                              recipients: reflectRecipients(selectedTargets),
                              actingUsername,
                          })
                        : resolveRecipients(effect);
                const recipients = statusTargets;
                recipients.forEach((recipient) => {
                    if (skillCancelledByEvade) return;
                    if (!recipient?.unit || recipient.unit.alive === false) return;
                    if (rollPerRecipient && Number.isFinite(chance) && chance >= 0 && chance < 100) {
                        if (!rollPercentSuccess(chance)) return;
                    }
                    if (rollPerRecipient && Number.isFinite(activationChance)) {
                        if (!rollPercentSuccess(activationChance)) return;
                    }
                    const targetState = ensureUnitStateShape(recipient.unit);
                    const appliesToSelf = (effect?.scope === 'self' || effect?.applyToSource === true) &&
                        !(allSkillsBlind && confusedTarget);
                    const destinationState = appliesToSelf ? actorState : targetState;
                    if (
                        doesEffectTargetHelpfulRecipient({ effect, recipient, actingUsername }) &&
                        !doesEffectIgnoreHelpfulInvulnerability(effect) &&
                        isUnitInvulnerableToHelpfulSkills(recipient.unit)
                    ) {
                        return;
                    }
                    if (
                        doesTargetIgnoreSkillByClass({
                            targetState: destinationState,
                            skillClasses: skill.classes || [],
                            isEnemySkill: appliesToSelf ? false : recipient.username !== actingUsername,
                        })
                    ) {
                        return;
                    }
                    if (
                        !appliesToSelf &&
                        !Boolean(effect?.metadata?.cannotBeEvaded) &&
                        shouldCancelByEvade(recipient)
                    ) {
                        return;
                    }
                    const targetHasHarmfulEffectImmunity = hasStatusMetadataFlag(
                        destinationState,
                        'invulnerableToHarmfulEffects'
                    );
                    if (!appliesToSelf && isHarmfulEffect(effect)) {
                        if (targetHasHarmfulEffectImmunity) {
                            return;
                        }
                        if (skillCannotBeCountered) {
                            // This skill bypasses reactive counter mechanics.
                        } else {
                        const counterCancelled = maybeTriggerReactiveDefenses({
                            match,
                            turnMarker,
                            actingUsername,
                            recipient,
                            actorUnit,
                            skillClasses: skill.classes || [],
                            skillIsHarmful: skillHasHarmfulEffects(skill),
                            sourceSkillId: skill.id || null,
                        });
                        if (counterCancelled) {
                            skillCancelledByEvade = true;
                            pendingDamage.clear();
                            return;
                        }
                        }
                    }
                    if (
                        effect.applyPolicy === 'if_missing_at_cast_start' &&
                        effect.scope === 'self' &&
                        castStartStatusIds.has(effect.statusId)
                    ) {
                        return;
                    }
                    const condition = effect?.condition;
                    if (condition) {
                        const conditionMatched = doesEffectConditionMatch({
                                condition,
                                actorState,
                                targetState,
                                actorUnit,
                                actorUsername: actingUsername,
                                targetUnit: recipient.unit,
                                targetUsername: recipient.username,
                            });
                        if (!conditionMatched)
                            return;
                        if (condition.consumeOnMatch && condition.statusId) {
                            const scope = condition.scope === 'target' ? 'target' : 'self';
                            const scopedState = scope === 'target' ? targetState : actorState;
                            consumeStatus(scopedState, condition.statusId);
                        }
                    }
                    if (targetHasHarmfulEffectImmunity && isHarmfulEffect(effect)) {
                        return;
                    }
                    let runtimeStatusId = effect.statusId;
                    let runtimeDuration = effect.duration;
                    let runtimeMetadata = effect.metadata || {};
                    if (runtimeMetadata?.repeatTargetControl && typeof runtimeMetadata.repeatTargetControl === 'object') {
                        const control = runtimeMetadata.repeatTargetControl;
                        const trackerStatusId =
                            typeof control?.trackerStatusId === 'string' && control.trackerStatusId
                                ? control.trackerStatusId
                                : 'repeat_target_tracker';
                        const trackerDuration = Math.max(1, Number(control?.trackerDuration) || 99);
                        const lockStatusId =
                            typeof control?.lockStatusId === 'string' && control.lockStatusId
                                ? control.lockStatusId
                                : 'random_skill_lock';
                        const silenceStatusId =
                            typeof control?.silenceStatusId === 'string' && control.silenceStatusId
                                ? control.silenceStatusId
                                : 'silence_non_damage';
                        const lastTargetStatus = (Array.isArray(actorState.statuses) ? actorState.statuses : []).find(
                            (status) =>
                                status?.id === trackerStatusId &&
                                (Number(status?.remainingTurns) || 0) > 0
                        );
                        const sameTargetAsLastCast =
                            lastTargetStatus?.metadata?.lastTargetUsername === recipient.username &&
                            Number(lastTargetStatus?.metadata?.lastTargetSlot) === Number(recipient.slot);
                        if (sameTargetAsLastCast) {
                            runtimeStatusId = silenceStatusId;
                            runtimeMetadata = {
                                silenceNonDamageEffects: true,
                                harmful: true,
                                tooltipText:
                                    (typeof control?.silenceTooltipText === 'string' && control.silenceTooltipText) ||
                                    'Silenced: only damage effects from this character\'s skills will work.',
                            };
                            consumeStatus(actorState, trackerStatusId);
                        } else {
                            const targetCharacter =
                                Number.isInteger(recipient?.unit?.rosterIndex) &&
                                Array.isArray(characters)
                                    ? characters[recipient.unit.rosterIndex]
                                    : null;
                            const activeIndices = getCharacterActiveSkillIndices(targetCharacter);
                            const chosenIndex = activeIndices.length
                                ? activeIndices[Math.floor(Math.random() * activeIndices.length)]
                                : null;
                            runtimeStatusId = lockStatusId;
                            const lockTooltipTemplate =
                                typeof control?.lockTooltipTextTemplate === 'string' &&
                                control.lockTooltipTextTemplate
                                    ? control.lockTooltipTextTemplate
                                    : 'Skill slot {slot} is unusable this turn.';
                            runtimeMetadata = {
                                harmful: true,
                                cannotUseSkillIndices: Number.isInteger(chosenIndex) ? [chosenIndex] : [],
                                tooltipText: Number.isInteger(chosenIndex)
                                    ? lockTooltipTemplate.replace(/\{slot\}/g, String(chosenIndex + 1))
                                    : 'A random skill is unusable this turn.',
                            };
                        }
                        if (!sameTargetAsLastCast) {
                            const trackerTooltipText =
                                typeof control?.trackerTooltipText === 'string' && control.trackerTooltipText
                                    ? control.trackerTooltipText
                                    : null;
                            applyStatus({
                                targetState: actorState,
                                statusId: trackerStatusId,
                                duration: trackerDuration,
                                sourceSkillId: skill.id || null,
                                sourceUsername: actingUsername,
                                sourceSlot: actorSlot,
                                metadata: {
                                    lastTargetUsername: recipient.username,
                                    lastTargetSlot: recipient.slot,
                                    ...(trackerTooltipText ? { tooltipText: trackerTooltipText } : {}),
                                },
                                fresh: false,
                            });
                        }
                    }
                    const extraDuration = getAdditionalIncomingStatusDuration({
                        targetState: destinationState,
                        incomingStatusId: runtimeStatusId,
                        incomingMetadata: runtimeMetadata,
                    });
                    if (extraDuration > 0) {
                        runtimeDuration = Math.max(0, Number(runtimeDuration) || 0) + extraDuration;
                    }
                    const outgoingExtraDuration = getSkillSpecificDurationBonus(actorState, skill.id || null);
                    if (outgoingExtraDuration > 0) {
                        runtimeDuration = Math.max(0, Number(runtimeDuration) || 0) + outgoingExtraDuration;
                    }
                    if (
                        runtimeMetadata?.cannotBecomeInvulnerable &&
                        runtimeMetadata?.turnDurationAnchor !== 'source_turn'
                    ) {
                        runtimeMetadata = {
                            ...(runtimeMetadata || {}),
                            turnDurationAnchor: 'source_turn',
                            triggerOnApply:
                                runtimeMetadata?.triggerOnApply === undefined
                                    ? false
                                    : runtimeMetadata.triggerOnApply,
                        };
                    }
                    const applyingStun =
                        runtimeStatusId === 'stunned' ||
                        Boolean(runtimeMetadata?.cannotUseSkills) ||
                        Boolean(runtimeMetadata?.cannotUseHarmfulSkills) ||
                        Boolean(runtimeMetadata?.cannotUseNonMentalSkills) ||
                        Boolean(runtimeMetadata?.useChosenSkillClassForCannotUseSkillClasses) ||
                        (Array.isArray(runtimeMetadata?.cannotUseSkillIndices) &&
                            runtimeMetadata.cannotUseSkillIndices.length > 0) ||
                        (Array.isArray(runtimeMetadata?.cannotUseSkillClasses) &&
                            runtimeMetadata.cannotUseSkillClasses.length > 0);
                    const stunImmunityDisabled =
                        Boolean(runtimeMetadata?.cannotIgnoreStuns) ||
                        hasStatusMetadataFlag(destinationState, 'cannotIgnoreStuns');
                    if (
                        applyingStun &&
                        hasStatusMetadataFlag(destinationState, 'cannotBeStunned') &&
                        !stunImmunityDisabled
                    ) {
                        // Keep stun feedback visible, but strip all functional stun locks.
                        applyStatus({
                            targetState: destinationState,
                            statusId: 'stun_ignored_notification',
                            duration: Math.max(0, Number(runtimeDuration) || 0),
                            sourceSkillId: effect?.sourceSkillId || skill.id || null,
                            sourceUsername: actingUsername,
                            sourceSlot: actorSlot,
                            metadata: {
                                harmful: Boolean(runtimeMetadata?.harmful),
                                tooltipText:
                                    (typeof runtimeMetadata?.tooltipText === 'string' &&
                                        runtimeMetadata.tooltipText) ||
                                    'This character is stunned.',
                            },
                            fresh: false,
                        });
                        return;
                    }
                    if (runtimeStatusId === 'mind_body_switch_lock' || Boolean(runtimeMetadata?.taunt)) {
                        runtimeMetadata = {
                            ...(runtimeMetadata || {}),
                            cannotTargetAlliesOfUsername: actingUsername,
                            allowedTargetSlot: actorSlot,
                        };
                    }
                    const sourceSkillClassesSnapshot = (Array.isArray(skill?.classes) ? skill.classes : [])
                        .map((entry) => (typeof entry === 'string' ? entry.trim().toLowerCase() : ''))
                        .filter(Boolean);
                    if (sourceSkillClassesSnapshot.length > 0) {
                        runtimeMetadata = {
                            ...(runtimeMetadata || {}),
                            _sourceSkillClasses: sourceSkillClassesSnapshot,
                        };
                    }
                    const copySourceCurrentHpToKeys = Array.isArray(runtimeMetadata?.copySourceCurrentHpToKeys)
                        ? runtimeMetadata.copySourceCurrentHpToKeys.filter(
                              (key) => typeof key === 'string' && key
                          )
                        : [];
                    if (copySourceCurrentHpToKeys.length > 0) {
                        const sourceCurrentHp = Math.max(0, Number(actorUnit?.hp) || 0);
                        const nextMetadata = {
                            ...(runtimeMetadata || {}),
                        };
                        copySourceCurrentHpToKeys.forEach((key) => {
                            nextMetadata[key] = sourceCurrentHp;
                        });
                        runtimeMetadata = nextMetadata;
                    }
                    const copyTargetSlotToKeys = Array.isArray(runtimeMetadata?.copyTargetSlotToKeys)
                        ? runtimeMetadata.copyTargetSlotToKeys.filter((key) => typeof key === 'string' && key)
                        : [];
                    if (copyTargetSlotToKeys.length > 0) {
                        const nextMetadata = {
                            ...(runtimeMetadata || {}),
                        };
                        copyTargetSlotToKeys.forEach((key) => {
                            nextMetadata[key] = recipient.slot;
                        });
                        runtimeMetadata = nextMetadata;
                    }
                    const copyTargetUsernameToKeys = Array.isArray(runtimeMetadata?.copyTargetUsernameToKeys)
                        ? runtimeMetadata.copyTargetUsernameToKeys.filter((key) => typeof key === 'string' && key)
                        : [];
                    if (copyTargetUsernameToKeys.length > 0) {
                        const nextMetadata = {
                            ...(runtimeMetadata || {}),
                        };
                        copyTargetUsernameToKeys.forEach((key) => {
                            nextMetadata[key] = recipient.username;
                        });
                        runtimeMetadata = nextMetadata;
                    }
                    const copyTargetTotalSkillUseCountToKeys = Array.isArray(
                        runtimeMetadata?.copyTargetTotalSkillUseCountToKeys
                    )
                        ? runtimeMetadata.copyTargetTotalSkillUseCountToKeys.filter(
                              (key) => typeof key === 'string' && key
                          )
                        : [];
                    if (copyTargetTotalSkillUseCountToKeys.length > 0) {
                        const recipientState = ensureUnitStateShape(recipient.unit);
                        const currentCount = Number(recipientState?.totalSkillUseCount) || 0;
                        const nextMetadata = {
                            ...(runtimeMetadata || {}),
                        };
                        copyTargetTotalSkillUseCountToKeys.forEach((key) => {
                            nextMetadata[key] = currentCount;
                        });
                        runtimeMetadata = nextMetadata;
                    }
                    const copyTargetKeyToKeys = Array.isArray(runtimeMetadata?.copyTargetKeyToKeys)
                        ? runtimeMetadata.copyTargetKeyToKeys.filter((key) => typeof key === 'string' && key)
                        : [];
                    if (copyTargetKeyToKeys.length > 0) {
                        const targetKey = `${recipient.username}:${recipient.slot}`;
                        const nextMetadata = {
                            ...(runtimeMetadata || {}),
                        };
                        copyTargetKeyToKeys.forEach((key) => {
                            nextMetadata[key] = targetKey;
                        });
                        runtimeMetadata = nextMetadata;
                    }
                    const scaleFromSourceStatusMetadata =
                        runtimeMetadata?.scaleFromSourceStatusMetadata &&
                        typeof runtimeMetadata.scaleFromSourceStatusMetadata === 'object'
                            ? runtimeMetadata.scaleFromSourceStatusMetadata
                            : null;
                    if (scaleFromSourceStatusMetadata?.statusId && scaleFromSourceStatusMetadata?.metadataKey) {
                        const sourceStatus = (Array.isArray(actorState?.statuses) ? actorState.statuses : []).find(
                            (entry) =>
                                entry?.id === scaleFromSourceStatusMetadata.statusId &&
                                (Number(entry?.remainingTurns) || 0) > 0
                        );
                        const sourceValue = Math.max(
                            0,
                            Number(sourceStatus?.metadata?.[scaleFromSourceStatusMetadata.metadataKey]) || 0
                        );
                        const multiplier = Number(scaleFromSourceStatusMetadata.multiplier) || 0;
                        const targetKeys = Array.isArray(scaleFromSourceStatusMetadata.targetKeys)
                            ? scaleFromSourceStatusMetadata.targetKeys.filter((key) => typeof key === 'string' && key)
                            : [];
                        if (targetKeys.length > 0) {
                            const nextMetadata = {
                                ...(runtimeMetadata || {}),
                            };
                            targetKeys.forEach((key) => {
                                nextMetadata[key] = (scaleFromSourceStatusMetadata.addToTargetKeys
                                    ? Math.max(0, Number(nextMetadata[key]) || 0) : 0) + sourceValue * multiplier;
                            });
                            runtimeMetadata = nextMetadata;
                        }
                    }
                    if (runtimeMetadata?.uniqueEnemyMarkFromSource && recipient.username !== actingUsername) {
                        const enemyUnits = Array.isArray(match.board?.[recipient.username])
                            ? match.board[recipient.username]
                            : [];
                        enemyUnits.forEach((enemyUnit, enemySlot) => {
                            if (!enemyUnit || enemyUnit.alive === false) return;
                            if (enemySlot === recipient.slot) return;
                            const enemyState = ensureUnitStateShape(enemyUnit);
                            enemyState.statuses = (Array.isArray(enemyState.statuses) ? enemyState.statuses : []).filter(
                                (entry) =>
                                    !(
                                        entry?.id === runtimeStatusId &&
                                        entry?.sourceUsername === actingUsername &&
                                        Number(entry?.sourceSlot) === actorSlot
                                    )
                            );
                        });
                    }
                    const passiveDefenseBonus = (actorState.statuses || []).reduce((sum, status) =>
                        (Number(status?.remainingTurns) || 0) > 0 && status?.metadata?.passive === true
                            ? sum + Math.max(0, Number(status.metadata.destructibleDefenseBonusGranted) || 0)
                            : sum,
                    0);
                    if (passiveDefenseBonus > 0 && recipient.username === actingUsername &&
                        (Number(runtimeMetadata?.destructibleDefensePoints) || 0) > 0) {
                        runtimeMetadata = {
                            ...runtimeMetadata,
                            destructibleDefensePoints:
                                Math.max(0, Number(runtimeMetadata.destructibleDefensePoints) || 0) + passiveDefenseBonus,
                        };
                    }
                    applyStatus({
                        targetState: destinationState,
                        statusId: runtimeStatusId,
                        duration: runtimeDuration,
                        sourceSkillId: effect?.sourceSkillId || skill.id || null,
                        sourceUsername: actingUsername,
                        sourceSlot: actorSlot,
                        metadata: runtimeMetadata,
                        fresh:
                            appliesToSelf || recipient.username === actingUsername ||
                            Boolean(runtimeMetadata?.freezeCooldowns) ||
                            (runtimeMetadata?.turnDurationAnchor === 'source_turn' &&
                                !runtimeMetadata?.triggerOnApply),
                    });
                    const healingBlock = actingCharacter?.passive?.healingBlockOnStun;
                    const hasPassive = (actorState.statuses || []).some((status) =>
                        status?.metadata?.passive === true &&
                        status?.metadata?.sourceSkillName === actingCharacter?.passive?.name &&
                        (Number(status.remainingTurns) || 0) > 0
                    );
                    if (applyingStun && healingBlock?.statusId && hasPassive &&
                        destinationState.statuses.some((status) =>
                            status?.id === runtimeStatusId && status.sourceUsername === actingUsername &&
                            status.sourceSlot === actorSlot && (Number(status.remainingTurns) || 0) > 0
                        )) {
                        applyStatus({
                            targetState: destinationState, statusId: healingBlock.statusId,
                            duration: healingBlock.duration || 1, sourceSkillId: skill.id || null,
                            sourceUsername: actingUsername, sourceSlot: actorSlot,
                            metadata: { harmful: true, healReceivedMultiplier: 0,
                                turnDurationAnchor: 'source_turn',
                                tooltipText: 'Demon of the Ice: this character cannot be healed.' },
                            fresh: true,
                        });
                    }
                    if (applyingStun) {
                        applyPassiveStunDamage({
                            match, sourceUsername: actingUsername, sourceSlot: actorSlot,
                            sourceSkillId: skill.id || null, targetUnit: recipient.unit,
                            targetUsername: recipient.username, targetSlot: recipient.slot,
                            statusId: runtimeStatusId,
                        });
                    }
                    if (Boolean(runtimeMetadata?.removeEnemyAfflictionStatusesOnApply)) {
                        cleanseEnemyAfflictionStatuses(
                            recipient.unit,
                            recipient.username,
                            runtimeMetadata?.removeEnemyAfflictionStatusesOnApplyCount
                        );
                    }
                    if (
                        runtimeMetadata?.refreshSameStatusOnEnemyTeam &&
                        recipient.username &&
                        recipient.username !== actingUsername &&
                        runtimeStatusId
                    ) {
                        refreshStatusOnTeam({
                            match,
                            username: recipient.username,
                            statusId: runtimeStatusId,
                            duration: runtimeDuration,
                        });
                    }
                });
                return;
            }

            if (effectType === 'execute_below_hp') {
                const recipients = resolveRecipients(effect);
                const threshold = Math.max(0, Number(effect?.threshold) || 0);
                recipients.forEach((recipient) => {
                    if (skillCancelledByEvade) return;
                    if (!recipient?.unit || recipient.unit.alive === false) return;
                    const targetState = ensureUnitStateShape(recipient.unit);
                    if (
                        doesTargetIgnoreSkillByClass({
                            targetState,
                            skillClasses: skill.classes || [],
                            isEnemySkill: recipient.username !== actingUsername,
                        })
                    ) {
                        return;
                    }
                    if (!Boolean(effect?.metadata?.cannotBeEvaded) && shouldCancelByEvade(recipient)) {
                        return;
                    }
                    const hp = Math.max(0, Number(recipient.unit.hp) || 0);
                    if (hp > threshold) return;
                    recipient.unit.hp = 0;
                    recipient.unit.alive = false;
                    triggerTeamMemberDeathHooks({
                        match,
                        deadUsername: recipient.username,
                        deadSlot: recipient.slot,
                    });
                    triggerOwnerDeathHooks({
                        unit: recipient.unit,
                        match,
                        username: recipient.username,
                        slot: recipient.slot,
                    });
                });
                return;
            }

            if (effectType === 'extend_status') {
                const recipients = resolveRecipients(effect);
                const targetStatusId = effect?.targetStatusId;
                const amount = Math.max(0, Number(effect?.amount) || 0);
                if (!targetStatusId || amount <= 0) return;
                const condition = effect?.condition;
                recipients.forEach((recipient) => {
                    if (!recipient?.unit || recipient.unit.alive === false) return;
                    const targetState = ensureUnitStateShape(recipient.unit);
                    if (
                        doesTargetIgnoreSkillByClass({
                            targetState,
                            skillClasses: skill.classes || [],
                            isEnemySkill: recipient.username !== actingUsername,
                        })
                    ) {
                        return;
                    }
                    if (condition?.statusId) {
                        if (
                            !doesEffectConditionMatch({
                                condition,
                                actorState,
                                targetState,
                                actorUnit,
                                actorUsername: actingUsername,
                                targetUnit: recipient.unit,
                                targetUsername: recipient.username,
                            })
                        )
                            return;
                        if (condition.consumeOnMatch && condition.statusId) {
                            const scope = condition.scope === 'target' ? 'target' : 'self';
                            const scopedState = scope === 'target' ? targetState : actorState;
                            consumeStatus(scopedState, condition.statusId);
                        }
                    }
                    const status = Array.isArray(targetState.statuses)
                        ? targetState.statuses.find(
                              (entry) =>
                                  entry?.id === targetStatusId && (Number(entry?.remainingTurns) || 0) > 0
                          )
                        : null;
                    if (!status) return;
                    status.remainingTurns = (Number(status.remainingTurns) || 0) + amount;
                });
                return;
            }

            if (effectType === 'heal') {
                const recipients = resolveRecipients(effect);
                recipients.forEach((recipient) => {
                    if (!recipient?.unit || recipient.unit.alive === false) return;
                    const targetState = ensureUnitStateShape(recipient.unit);
                    if (
                        doesTargetIgnoreSkillByClass({
                            targetState,
                            skillClasses: skill.classes || [],
                            isEnemySkill: recipient.username !== actingUsername,
                        })
                    ) {
                        return;
                    }
                    applyHealToUnit(
                        recipient.unit,
                        resolveScalarEffectAmount({
                            effect,
                            actorUnit,
                            targetUnit: recipient.unit,
                        }) + getSkillSpecificHealingBonus(actorState, skill.id)
                    );
                });
                return;
            }

            if (effectType === 'set_hp_from_snapshot') {
                const recipients = resolveRecipients(effect);
                const snapshotKey =
                    typeof effect?.snapshotKey === 'string' ? effect.snapshotKey.trim() : '';
                if (!snapshotKey) return;
                recipients.forEach((recipient) => {
                    if (!recipient?.unit) return;
                    const targetState = ensureUnitStateShape(recipient.unit);
                    if (
                        doesTargetIgnoreSkillByClass({
                            targetState,
                            skillClasses: skill.classes || [],
                            isEnemySkill: recipient.username !== actingUsername,
                        })
                    ) {
                        return;
                    }
                    setUnitHpFromSnapshot(recipient.unit, snapshotKey);
                });
                return;
            }

            if (effectType === 'HealthLoss') {
                const recipients = resolveRecipients(effect);
                recipients.forEach((recipient) => {
                    if (!recipient?.unit || recipient.unit.alive === false) return;
                    const targetState = ensureUnitStateShape(recipient.unit);
                    if (
                        doesTargetIgnoreSkillByClass({
                            targetState,
                            skillClasses: skill.classes || [],
                            isEnemySkill: recipient.username !== actingUsername,
                        })
                    ) {
                        return;
                    }
                    const condition = effect?.condition;
                    if (
                        condition &&
                        !doesEffectConditionMatch({
                            condition,
                            actorState,
                            targetState,
                            actorUnit,
                            actorUsername: actingUsername,
                            targetUnit: recipient.unit,
                            targetUsername: recipient.username,
                        })
                    ) {
                        return;
                    }
                    applyHealthLossToUnit(
                        recipient.unit,
                        resolveScalarEffectAmount({
                            effect,
                            actorUnit,
                            targetUnit: recipient.unit,
                        }),
                        {
                            match,
                            targetUsername: recipient.username,
                            targetSlot: recipient.slot,
                        }
                    );
                });
                return;
            }

            if (effectType === 'destroy_destructible_defense') {
                const recipients = resolveRecipients(effect);
                recipients.forEach((recipient) => {
                    if (!recipient?.unit || recipient.unit.alive === false) return;
                    const targetState = ensureUnitStateShape(recipient.unit);
                    if (
                        doesTargetIgnoreSkillByClass({
                            targetState,
                            skillClasses: skill.classes || [],
                            isEnemySkill: recipient.username !== actingUsername,
                        })
                    ) {
                        return;
                    }
                    const points = Number(effect?.amount);
                    destroyAllDestructibleDefenseOnUnit(
                        recipient.unit,
                        Number.isFinite(points) ? Math.max(0, points) : Infinity,
                        { match, sourceUsername: actingUsername, sourceSlot: actorSlot,
                            targetUsername: recipient.username }
                    );
                });
                return;
            }

            if (effectType === 'cleanse_harmful') {
                const recipients = resolveRecipients(effect);
                const condition = effect?.condition;
                recipients.forEach((recipient) => {
                    if (!recipient?.unit || recipient.unit.alive === false) return;
                    const targetState = ensureUnitStateShape(recipient.unit);
                    if (
                        doesTargetIgnoreSkillByClass({
                            targetState,
                            skillClasses: skill.classes || [],
                            isEnemySkill: recipient.username !== actingUsername,
                        })
                    ) {
                        return;
                    }
                    if (
                        condition &&
                        !doesEffectConditionMatch({
                            condition,
                            actorState,
                            targetState,
                            actorUnit,
                            actorUsername: actingUsername,
                            targetUnit: recipient.unit,
                            targetUsername: recipient.username,
                        })
                    ) {
                        return;
                    }
                    cleanseHarmfulStatuses(recipient.unit, effect.count);
                });
                return;
            }

            if (effectType === 'cleanse_statuses') {
                const cleanseTargets =
                    effect?.scope === 'self' && effect?.condition?.scope === 'target'
                        ? reflectRecipients(selectedTargets)
                        : resolveRecipients(effect);
                const recipients = cleanseTargets;
                const maxCountRaw = Number(effect?.count);
                const maxCount = Number.isFinite(maxCountRaw) && maxCountRaw >= 0 ? Math.floor(maxCountRaw) : 0;
                const removeAll = maxCount <= 0;
                const sourceRelation =
                    typeof effect?.sourceRelation === 'string' ? effect.sourceRelation.trim().toLowerCase() : 'any';
                const exactStatusIds = [
                    ...(typeof effect?.statusId === 'string' && effect.statusId ? [effect.statusId] : []),
                    ...(Array.isArray(effect?.statusIdsAny)
                        ? effect.statusIdsAny.filter((entry) => typeof entry === 'string' && entry)
                        : []),
                ];
                const metadataAny = Array.isArray(effect?.metadataAny)
                    ? effect.metadataAny.filter((entry) => typeof entry === 'string' && entry)
                    : [];
                const sourceSkillClassesAny = Array.isArray(effect?.sourceSkillClassesAny)
                    ? effect.sourceSkillClassesAny
                          .map((entry) => (typeof entry === 'string' ? entry.trim().toLowerCase() : ''))
                          .filter(Boolean)
                    : [];

                recipients.forEach((recipient) => {
                    if (!recipient?.unit || recipient.unit.alive === false) return;
                    const appliesToSelf = effect?.scope === 'self';
                    const destinationUnit = appliesToSelf ? actorUnit : recipient.unit;
                    if (!destinationUnit || destinationUnit.alive === false) return;
                    const targetState = ensureUnitStateShape(destinationUnit);
                    const conditionTargetState = ensureUnitStateShape(recipient.unit);
                    const condition = effect?.condition;
                    if (condition) {
                        if (
                            !doesEffectConditionMatch({
                                condition,
                                actorState,
                                targetState: conditionTargetState,
                                actorUnit,
                                targetUnit: recipient.unit,
                                actorUsername: actingUsername,
                                targetUsername: recipient.username,
                            })
                        ) {
                            return;
                        }
                        if (condition.consumeOnMatch && condition.statusId) {
                            const scope = condition.scope === 'target' ? 'target' : 'self';
                            const scopedState = scope === 'target' ? conditionTargetState : actorState;
                            consumeStatus(scopedState, condition.statusId);
                        }
                    }
                    let removed = 0;
                    const targetUsername = appliesToSelf ? actingUsername : recipient.username || '';
                    targetState.statuses = (Array.isArray(targetState.statuses) ? targetState.statuses : []).filter(
                        (status) => {
                            if (!status || (Number(status?.remainingTurns) || 0) <= 0) return true;
                            if (status?.metadata?.passive === true || status?.metadata?.cannotBeCleansed === true) return true;
                            if (!removeAll && removed >= maxCount) return true;

                            const sourceUsername = status?.sourceUsername || '';
                            const fromEnemy =
                                Boolean(sourceUsername) && Boolean(targetUsername) && sourceUsername !== targetUsername;
                            const fromAlly =
                                Boolean(sourceUsername) && Boolean(targetUsername) && sourceUsername === targetUsername;
                            if (sourceRelation === 'enemy' && !fromEnemy) return true;
                            if (sourceRelation === 'ally' && !fromAlly) return true;
                            if (exactStatusIds.length > 0 && !exactStatusIds.includes(status?.id)) return true;
                            if (Boolean(effect?.harmfulOnly || effect?.metadata?.cleanseHarmfulOnly) && !Boolean(status?.metadata?.harmful)) return true;
                            if (metadataAny.length > 0) {
                                const metadata = status?.metadata || {};
                                const hasAny = metadataAny.some((key) => Boolean(metadata?.[key]));
                                if (!hasAny) return true;
                            }
                            if (sourceSkillClassesAny.length > 0) {
                                const stamped = Array.isArray(status?.metadata?._sourceSkillClasses)
                                    ? status.metadata._sourceSkillClasses
                                          .map((entry) =>
                                              typeof entry === 'string' ? entry.trim().toLowerCase() : ''
                                          )
                                          .filter(Boolean)
                                    : [];
                                if (stamped.length > 0) {
                                    const stampedMatch = sourceSkillClassesAny.some((entry) => stamped.includes(entry));
                                    if (!stampedMatch) return true;
                                } else {
                                const sourceSkillId =
                                    typeof status?.sourceSkillId === 'string' ? status.sourceSkillId : '';
                                const sourceUser = typeof status?.sourceUsername === 'string' ? status.sourceUsername : '';
                                const sourceSlot = Number.isInteger(status?.sourceSlot)
                                    ? Number(status.sourceSlot)
                                    : null;
                                if (!sourceSkillId || !sourceUser || !Number.isInteger(sourceSlot)) return true;
                                const sourceUnit = match?.board?.[sourceUser]?.[sourceSlot] || null;
                                if (!sourceUnit || sourceUnit.alive === false) return true;
                                const rosterIndex = Number.isInteger(sourceUnit?.rosterIndex)
                                    ? Number(sourceUnit.rosterIndex)
                                    : null;
                                const sourceCharacter =
                                    Number.isInteger(rosterIndex) && Array.isArray(characters)
                                        ? characters[rosterIndex]
                                        : null;
                                const sourceSkill = Array.isArray(sourceCharacter?.skills)
                                    ? sourceCharacter.skills.find((entry) => entry?.id === sourceSkillId)
                                    : null;
                                const classSet = getSkillClassSet(sourceSkill?.classes || []);
                                const matchesClass = sourceSkillClassesAny.some((entry) => classSet.has(entry));
                                if (!matchesClass) return true;
                                }
                            }

                            removed += 1;
                            return false;
                        }
                    );
                });
                return;
            }

            if (effectType === 'remove_random_chakra') {
                const recipients = resolveRecipients(effect);
                const amount = Math.max(0, Number(effect?.amount) || 0);
                if (amount <= 0) return;
                recipients.forEach((recipient) => {
                    if (!recipient?.username) return;
                    if (isUnitImmuneToChakraLoss(recipient.unit)) return;
                    const targetState = ensureUnitStateShape(recipient.unit);
                    const condition = effect?.condition;
                    if (condition) {
                        const conditionMatched = doesEffectConditionMatch({
                                condition,
                                actorState,
                                targetState,
                                actorUnit,
                                actorUsername: actingUsername,
                                targetUnit: recipient.unit,
                                targetUsername: recipient.username,
                            });
                        if (!conditionMatched)
                            return;
                        if (condition.consumeOnMatch && condition.statusId) {
                            const scope = condition.scope === 'target' ? 'target' : 'self';
                            const scopedState = scope === 'target' ? targetState : actorState;
                            consumeStatus(scopedState, condition.statusId);
                        }
                    }
                    removeRandomChakraFromMatch({
                        match,
                        username: recipient.username,
                        amount,
                    });
                });
                return;
            }

            if (effectType === 'modify_cooldowns') {
                const recipients = resolveRecipients(effect);
                const amount = Number(effect?.amount) || 0;
                const operation =
                    typeof effect?.operation === 'string' ? effect.operation.trim().toLowerCase() : 'add';
                if (!Number.isFinite(amount)) return;
                if (operation !== 'set' && amount === 0) return;
                const includeAllCharacterSkills =
                    Boolean(effect?.includeAllCharacterSkills) ||
                    Boolean(effect?.metadata?.includeAllCharacterSkills);
                const explicitSkillIds = Array.isArray(effect?.skillIds)
                    ? effect.skillIds.filter((entry) => typeof entry === 'string' && entry)
                    : [];
                recipients.forEach((recipient) => {
                    if (skillCancelledByEvade) return;
                    if (!recipient?.unit || recipient.unit.alive === false) return;
                    if (rollPerRecipient && Number.isFinite(chance) && chance >= 0 && chance < 100) {
                        if (!rollPercentSuccess(chance)) return;
                    }
                    if (rollPerRecipient && Number.isFinite(activationChance)) {
                        if (!rollPercentSuccess(activationChance)) return;
                    }
                    const targetState = ensureUnitStateShape(recipient.unit);
                    const appliesToSelf = effect?.scope === 'self';
                    const destinationState = appliesToSelf ? actorState : targetState;
                    if (
                        doesTargetIgnoreSkillByClass({
                            targetState: destinationState,
                            skillClasses: skill.classes || [],
                            isEnemySkill: appliesToSelf ? false : recipient.username !== actingUsername,
                        })
                    ) {
                        return;
                    }
                    if (
                        !appliesToSelf &&
                        !Boolean(effect?.metadata?.cannotBeEvaded) &&
                        shouldCancelByEvade(recipient)
                    ) {
                        return;
                    }
                    if (!appliesToSelf && isHarmfulEffect(effect)) {
                        if (skillCannotBeCountered) {
                            // This skill bypasses reactive counter mechanics.
                        } else {
                        const counterCancelled = maybeTriggerReactiveDefenses({
                            match,
                            turnMarker,
                            actingUsername,
                            recipient,
                            actorUnit,
                            skillClasses: skill.classes || [],
                            skillIsHarmful: skillHasHarmfulEffects(skill),
                            sourceSkillId: skill.id || null,
                            skill,
                            characters,
                        });
                        if (counterCancelled) {
                            skillCancelledByEvade = true;
                            pendingDamage.clear();
                            return;
                        }
                        }
                    }
                    const condition = effect?.condition;
                    if (condition) {
                        const conditionMatched = doesEffectConditionMatch({
                                condition,
                                actorState,
                                targetState,
                                actorUnit,
                                actorUsername: actingUsername,
                                targetUnit: recipient.unit,
                                targetUsername: recipient.username,
                            });
                        if (!conditionMatched)
                            return;
                        if (condition.consumeOnMatch && condition.statusId) {
                            const scope = condition.scope === 'target' ? 'target' : 'self';
                            const scopedState = scope === 'target' ? targetState : actorState;
                            consumeStatus(scopedState, condition.statusId);
                        }
                    }
                    const destinationUnit = appliesToSelf ? actorUnit : recipient.unit;
                    const cooldowns =
                        destinationState.cooldowns && typeof destinationState.cooldowns === 'object'
                            ? destinationState.cooldowns
                            : {};
                    const skillIds = new Set(explicitSkillIds);
                    if (!explicitSkillIds.length) {
                        Object.keys(cooldowns).forEach((skillId) => {
                            if (skillId) {
                                skillIds.add(skillId);
                            }
                        });
                        if (includeAllCharacterSkills) {
                            getCharacterCooldownSkillIds({ characters, unit: destinationUnit }).forEach((skillId) => {
                                skillIds.add(skillId);
                            });
                        }
                    }
                    skillIds.forEach((skillId) => {
                        const current = Math.max(0, Number(cooldowns[skillId]) || 0);
                        let next = current;
                        if (operation === 'set') {
                            next = Math.max(0, amount);
                        } else if (operation === 'max') {
                            next = Math.max(current, Math.max(0, amount));
                        } else if (operation === 'min') {
                            next = Math.max(0, Math.min(current, amount));
                        } else {
                            next = Math.max(0, current + amount);
                        }
                        if (next <= 0) {
                            delete cooldowns[skillId];
                        } else {
                            cooldowns[skillId] = next;
                        }
                    });
                    destinationState.cooldowns = cooldowns;
                });
                return;
            }

            if (effectType === 'trigger_status_effects') {
                const recipients = resolveRecipients(effect);
                const requestedStatusIds = [
                    ...(typeof effect?.statusId === 'string' && effect.statusId ? [effect.statusId] : []),
                    ...(Array.isArray(effect?.statusIdsAny)
                        ? effect.statusIdsAny.filter((entry) => typeof entry === 'string' && entry)
                        : []),
                ];
                if (!requestedStatusIds.length) return;
                recipients.forEach((recipient) => {
                    if (!recipient?.unit || recipient.unit.alive === false) return;
                    const targetState = ensureUnitStateShape(recipient.unit);
                    const matchedStatuses = (Array.isArray(targetState.statuses) ? targetState.statuses : []).filter(
                        (status) =>
                            requestedStatusIds.includes(status?.id) && (Number(status?.remainingTurns) || 0) > 0
                    );
                    if (!matchedStatuses.length) return;
                    matchedStatuses.forEach((matchedStatus) => {
                        triggerStoredStatusEffects({
                            match,
                            status: matchedStatus,
                            targetUnit: recipient.unit,
                            targetState,
                            targetUsername: recipient.username,
                            targetSlot: recipient.slot,
                        });
                        if (Boolean(effect?.consumeMatchedStatus ?? true) && matchedStatus?.id) {
                            consumeStatus(targetState, matchedStatus.id);
                        }
                    });
                });
                return;
            }

            if (effectType === 'swap_positions') {
                const recipients = resolveRecipients(effect);
                recipients.forEach((recipient) => {
                    if (!recipient?.unit || recipient.unit.alive === false) return;
                    swapBoardPositions({
                        match,
                        unitA: actorUnit,
                        unitB: recipient.unit,
                    });
                });
                return;
            }

            if (effectType === 'gain_chakra_by_last_skill') {
                const targetState = ensureUnitStateShape(actorUnit);
                const lastSkillStatus = Array.isArray(targetState.statuses)
                    ? targetState.statuses.find(
                          (status) =>
                              status?.id === effect?.statusId &&
                              (Number(status?.remainingTurns) || 0) > 0
                      )
                    : null;
                const lastSkillId =
                    typeof lastSkillStatus?.metadata?.lastSkillId === 'string'
                        ? lastSkillStatus.metadata.lastSkillId
                        : '';
                const map = effect?.map && typeof effect.map === 'object' ? effect.map : {};
                const chakraType = typeof map[lastSkillId] === 'string' ? map[lastSkillId] : '';
                if (!chakraType) return;
                applyChakraGainToMatch({
                    match,
                    username: actingUsername,
                    chakraType,
                    amount: effect?.amount || 1,
                });
                return;
            }

            if (effectType === 'gain_chakra') {
                const amount = Math.max(0, Number(effect?.amount) || 0);
                if (amount <= 0) return;
                const rawType = typeof effect?.chakraType === 'string' ? effect.chakraType.trim().toLowerCase() : '';
                if (rawType === 'random') {
                    for (let i = 0; i < amount; i += 1) {
                        const pick = chakraTypes[Math.floor(Math.random() * chakraTypes.length)];
                        applyChakraGainToMatch({
                            match,
                            username: actingUsername,
                            chakraType: pick,
                            amount: 1,
                        });
                    }
                    return;
                }
                applyChakraGainToMatch({
                    match,
                    username: actingUsername,
                    chakraType: rawType,
                    amount,
                });
                return;
            }

            if (effectType === 'spend_all_chakra') {
                if (!match || !actingUsername) return;
                match.chakraPools = match.chakraPools || {};
                match.chakraPools[actingUsername] = createEmptyChakraCost();
                return;
            }

            if (effectType === 'drain_chakra_non_bloodline_from_target_to_self') {
                const recipients = resolveRecipients(effect);
                const maxAmount = Math.max(0, Number(effect?.amount) || 0);
                if (maxAmount <= 0) return;
                recipients.forEach((recipient) => {
                    if (!recipient?.username || recipient.username === actingUsername) return;
                    if (isUnitImmuneToChakraLoss(recipient.unit)) return;
                    const targetState = ensureUnitStateShape(recipient.unit);
                    if (
                        doesTargetIgnoreSkillByClass({
                            targetState,
                            skillClasses: skill.classes || [],
                            isEnemySkill: recipient.username !== actingUsername,
                        })
                    ) {
                        return;
                    }
                    const condition = effect?.condition;
                    if (condition) {
                        const conditionMatched = doesEffectConditionMatch({
                                condition,
                                actorState,
                                targetState,
                                actorUnit,
                                actorUsername: actingUsername,
                                targetUnit: recipient.unit,
                                targetUsername: recipient.username,
                            });
                        if (!conditionMatched)
                            return;
                        if (condition.consumeOnMatch && condition.statusId) {
                            const scope = condition.scope === 'target' ? 'target' : 'self';
                            const scopedState = scope === 'target' ? targetState : actorState;
                            consumeStatus(scopedState, condition.statusId);
                        }
                    }
                    match.chakraPools = match.chakraPools || {};
                    const targetPool = match.chakraPools[recipient.username] || createEmptyChakraCost();
                    const sourcePool = match.chakraPools[actingUsername] || createEmptyChakraCost();
                    const nonBloodlineTypes = ['taijutsu', 'ninjutsu', 'genjutsu'].filter(
                        (type) => (Number(targetPool[type]) || 0) > 0
                    );
                    if (!nonBloodlineTypes.length) return;
                    for (let i = 0; i < maxAmount; i += 1) {
                        const available = ['taijutsu', 'ninjutsu', 'genjutsu'].filter(
                            (type) => (Number(targetPool[type]) || 0) > 0
                        );
                        if (!available.length) break;
                        const picked = available[Math.floor(Math.random() * available.length)];
                        targetPool[picked] = Math.max(0, (Number(targetPool[picked]) || 0) - 1);
                        sourcePool[picked] = (Number(sourcePool[picked]) || 0) + 1;
                    }
                    match.chakraPools[recipient.username] = targetPool;
                    match.chakraPools[actingUsername] = sourcePool;
                });
            }

            if (effectType === 'drain_chakra_random_from_target_to_self') {
                const recipients = resolveRecipients(effect);
                const maxAmount = Math.max(0, Number(effect?.amount) || 0);
                if (maxAmount <= 0) return;
                recipients.forEach((recipient) => {
                    if (!recipient?.username || recipient.username === actingUsername) return;
                    if (isUnitImmuneToChakraLoss(recipient.unit)) return;
                    const targetState = ensureUnitStateShape(recipient.unit);
                    if (
                        doesTargetIgnoreSkillByClass({
                            targetState,
                            skillClasses: skill.classes || [],
                            isEnemySkill: recipient.username !== actingUsername,
                        })
                    ) {
                        return;
                    }
                    const condition = effect?.condition;
                    if (condition) {
                        const conditionMatched = doesEffectConditionMatch({
                                condition,
                                actorState,
                                targetState,
                                actorUnit,
                                actorUsername: actingUsername,
                                targetUnit: recipient.unit,
                                targetUsername: recipient.username,
                            });
                        if (!conditionMatched)
                            return;
                        if (condition.consumeOnMatch && condition.statusId) {
                            const scope = condition.scope === 'target' ? 'target' : 'self';
                            const scopedState = scope === 'target' ? targetState : actorState;
                            consumeStatus(scopedState, condition.statusId);
                        }
                    }
                    match.chakraPools = match.chakraPools || {};
                    const targetPool = match.chakraPools[recipient.username] || createEmptyChakraCost();
                    const sourcePool = match.chakraPools[actingUsername] || createEmptyChakraCost();
                    let transferred = 0;
                    for (let i = 0; i < maxAmount; i += 1) {
                        const available = chakraTypes.filter((type) => (Number(targetPool[type]) || 0) > 0);
                        if (!available.length) break;
                        const picked = available[Math.floor(Math.random() * available.length)];
                        targetPool[picked] = Math.max(0, (Number(targetPool[picked]) || 0) - 1);
                        sourcePool[picked] = (Number(sourcePool[picked]) || 0) + 1;
                        transferred += 1;
                    }
                    if (transferred > 0 && condition?.consumeOnSuccessfulTransfer && condition.statusId) {
                        const scopedState = condition.scope === 'target' ? targetState : actorState;
                        consumeStatus(scopedState, condition.statusId);
                    }
                    match.chakraPools[recipient.username] = targetPool;
                    match.chakraPools[actingUsername] = sourcePool;
                });
            }

            if (effectType === 'drain_chakra_specific_from_target_to_self') {
                const recipients = resolveRecipients(effect);
                const maxAmount = Math.max(0, Number(effect?.amount) || 0);
                const drainType =
                    typeof effect?.chakraType === 'string' ? effect.chakraType.trim().toLowerCase() : '';
                if (maxAmount <= 0 || !chakraTypes.includes(drainType)) return;
                recipients.forEach((recipient) => {
                    if (!recipient?.username || recipient.username === actingUsername) return;
                    if (isUnitImmuneToChakraLoss(recipient.unit)) return;
                    const targetState = ensureUnitStateShape(recipient.unit);
                    if (
                        doesTargetIgnoreSkillByClass({
                            targetState,
                            skillClasses: skill.classes || [],
                            isEnemySkill: recipient.username !== actingUsername,
                        })
                    ) {
                        return;
                    }
                    const condition = effect?.condition;
                    if (condition) {
                        const conditionMatched = doesEffectConditionMatch({
                                condition,
                                actorState,
                                targetState,
                                actorUnit,
                                actorUsername: actingUsername,
                                targetUnit: recipient.unit,
                                targetUsername: recipient.username,
                            });
                        if (!conditionMatched)
                            return;
                        if (condition.consumeOnMatch && condition.statusId) {
                            const scope = condition.scope === 'target' ? 'target' : 'self';
                            const scopedState = scope === 'target' ? targetState : actorState;
                            consumeStatus(scopedState, condition.statusId);
                        }
                    }
                    match.chakraPools = match.chakraPools || {};
                    const targetPool = match.chakraPools[recipient.username] || createEmptyChakraCost();
                    const sourcePool = match.chakraPools[actingUsername] || createEmptyChakraCost();
                    const available = Math.max(0, Number(targetPool[drainType]) || 0);
                    if (available <= 0) return;
                    const drainAmount = Math.min(maxAmount, available);
                    targetPool[drainType] = available - drainAmount;
                    sourcePool[drainType] = (Number(sourcePool[drainType]) || 0) + drainAmount;
                    match.chakraPools[recipient.username] = targetPool;
                    match.chakraPools[actingUsername] = sourcePool;
                });
            }

            if (effectType === 'heal_missing_health_percent') {
                const recipients = resolveRecipients(effect);
                const percent = Math.max(0, Number(effect?.percent) || 0);
                recipients.forEach((recipient) => {
                    if (!recipient?.unit || recipient.unit.alive === false) return;
                    const targetState = ensureUnitStateShape(recipient.unit);
                    if (
                        doesTargetIgnoreSkillByClass({
                            targetState,
                            skillClasses: skill.classes || [],
                            isEnemySkill: recipient.username !== actingUsername,
                        })
                    ) return;
                    const currentHp = Math.max(0, Number(recipient.unit.hp) || 0);
                    const missingHp = Math.max(0, DEFAULT_HP - currentHp);
                    const healAmount = Math.round(missingHp * (percent / 100));
                    if (healAmount > 0) {
                        applyHealToUnit(recipient.unit, healAmount);
                    }
                });
                return;
            }

            if (effectType === 'set_health') {
                const recipients = resolveRecipients(effect);
                const targetHp = Math.max(0, Number(effect?.amount) || 0);
                recipients.forEach((recipient) => {
                    if (!recipient?.unit || recipient.unit.alive === false) return;
                    const targetState = ensureUnitStateShape(recipient.unit);
                    if (effect?.isHealingEffect && hasStatusMetadataFlag(targetState, 'ignoreHealing')) {
                        return;
                    }
                    recipient.unit.hp = Math.min(DEFAULT_HP, targetHp);
                });
                return;
            }

            if (effectType === 'instant_kill') {
                const recipients = resolveRecipients(effect);
                recipients.forEach((recipient) => {
                    if (!recipient?.unit) return;
                    recipient.unit.hp = 0;
                    recipient.unit.alive = false;
                    triggerTeamMemberDeathHooks({
                        match,
                        deadUsername: recipient.username,
                        deadSlot: recipient.slot,
                    });
                    triggerOwnerDeathHooks({
                        unit: recipient.unit,
                        match,
                        username: recipient.username,
                        slot: recipient.slot,
                    });
                });
                return;
            }

            if (effectType === 'execute_threshold') {
                const recipients = resolveRecipients(effect);
                const thresholdHp = Math.max(0, Number(effect?.thresholdHp ?? effect?.threshold) || 0);
                recipients.forEach((recipient) => {
                    if (!recipient?.unit || recipient.unit.alive === false) return;
                    const hp = Math.max(0, Number(recipient.unit.hp) || 0);
                    if (hp <= thresholdHp) {
                        recipient.unit.hp = 0;
                        recipient.unit.alive = false;
                        triggerTeamMemberDeathHooks({
                            match,
                            deadUsername: recipient.username,
                            deadSlot: recipient.slot,
                        });
                        triggerOwnerDeathHooks({
                            unit: recipient.unit,
                            match,
                            username: recipient.username,
                            slot: recipient.slot,
                        });
                    }
                });
                return;
            }

            if (effectType === 'steal_chakra') {
                const recipients = resolveRecipients(effect);
                const amount = Math.max(0, Number(effect?.amount) || 1);
                recipients.forEach((recipient) => {
                    if (!recipient?.username || recipient.username === actingUsername) return;
                    if (isUnitImmuneToChakraLoss(recipient.unit)) return;
                    const targetState = ensureUnitStateShape(recipient.unit);
                    const condition = effect?.condition;
                    if (condition && !doesEffectConditionMatch({
                        condition,
                        actorState,
                        targetState,
                        actorUnit,
                        actorUsername: actingUsername,
                        targetUnit: recipient.unit,
                        targetUsername: recipient.username,
                    })) return;
                    match.chakraPools = match.chakraPools || {};
                    const targetPool = match.chakraPools[recipient.username] || createEmptyChakraCost();
                    const sourcePool = match.chakraPools[actingUsername] || createEmptyChakraCost();
                    for (let i = 0; i < amount; i += 1) {
                        const available = chakraTypes.filter((type) => (Number(targetPool[type]) || 0) > 0);
                        if (!available.length) break;
                        const picked = available[Math.floor(Math.random() * available.length)];
                        targetPool[picked] = Math.max(0, (Number(targetPool[picked]) || 0) - 1);
                        sourcePool[picked] = (Number(sourcePool[picked]) || 0) + 1;
                    }
                    match.chakraPools[recipient.username] = targetPool;
                    match.chakraPools[actingUsername] = sourcePool;
                });
                return;
            }

            if (effectType === 'remove_chakra') {
                const recipients = resolveRecipients(effect);
                const amount = Math.max(0, Number(effect?.amount) || 1);
                const chakraType = typeof effect?.chakraType === 'string' ? effect.chakraType.trim().toLowerCase() : 'random';
                recipients.forEach((recipient) => {
                    if (!recipient?.username) return;
                    if (isUnitImmuneToChakraLoss(recipient.unit)) return;
                    const targetState = ensureUnitStateShape(recipient.unit);
                    const condition = effect?.condition;
                    if (condition && !doesEffectConditionMatch({
                        condition,
                        actorState,
                        targetState,
                        actorUnit,
                        actorUsername: actingUsername,
                        targetUnit: recipient.unit,
                        targetUsername: recipient.username,
                    })) return;
                    if (chakraType === 'random') {
                        removeRandomChakraFromMatch({ match, username: recipient.username, amount });
                    } else {
                        removeChakraFromMatch({ match, username: recipient.username, chakraType, amount });
                    }
                });
                return;
            }

            if (effectType === 'remove_status') {
                const recipients = resolveRecipients(effect);
                const targetStatusId = effect?.statusId;
                const afflictionOnly = Boolean(effect?.metadata?.afflictionOnly);
                const harmfulOnly = Boolean(effect?.metadata?.harmfulOnly);
                recipients.forEach((recipient) => {
                    if (!recipient?.unit) return;
                    const targetState = ensureUnitStateShape(recipient.unit);
                    const condition = effect?.condition;
                    if (condition && !doesEffectConditionMatch({
                        condition,
                        actorState,
                        targetState,
                        actorUnit,
                        actorUsername: actingUsername,
                        targetUnit: recipient.unit,
                        targetUsername: recipient.username,
                    })) return;
                    if (Boolean(effect?.metadata?.deferUntilAfterDamage) && targetStatusId) {
                        deferredStatusRemovals.push({ recipient, targetStatusId,
                            sourceUsername: condition?.statusFromActor ? actingUsername : null,
                            sourceSlot: condition?.statusFromActor ? actorSlot : null });
                        return;
                    }
                    targetState.statuses = (Array.isArray(targetState.statuses) ? targetState.statuses : []).filter((status) => {
                        if (!status) return false;
                        if (status?.metadata?.passive === true) return true;
                        if (targetStatusId && status.id === targetStatusId &&
                            (!condition?.statusFromActor ||
                                (status.sourceUsername === actingUsername && status.sourceSlot === actorSlot))) return false;
                        if (afflictionOnly && (Boolean(status?.metadata?.afflictionDamage) || status?.metadata?.action)) {
                            if (!harmfulOnly || Boolean(status?.metadata?.harmful)) return false;
                        }
                        if (harmfulOnly && !afflictionOnly && !targetStatusId && Boolean(status?.metadata?.harmful)) return false;
                        return true;
                    });
                });
                return;
            }

            if (effectType === 'damage_per_dead_ally') {
                const amountPer = Math.max(0, Number(effect?.amountPerDeadAlly) || 0);
                const allies = match.board?.[actingUsername] || [];
                const deadCount = allies.reduce((sum, u) => sum + (u && u.alive === false ? 1 : 0), 0);
                const totalAmount = amountPer * deadCount;
                if (totalAmount > 0) {
                    const recipients = resolveRecipients(effect);
                    recipients.forEach((recipient) => {
                        if (!recipient?.unit || recipient.unit.alive === false) return;
                        queueDamage(recipient, totalAmount, effect);
                    });
                }
                return;
            }

            if (effectType === 'damage_per_lost_health_threshold') {
                const threshold = Math.max(1, Number(effect?.threshold) || 30);
                const amountPer = Math.max(0, Number(effect?.amountPerThreshold) || 0);
                const currentHp = Math.max(0, Number(actorUnit?.hp) || 0);
                const lostHp = Math.max(0, DEFAULT_HP - currentHp);
                const steps = Math.floor(lostHp / threshold);
                const totalAmount = steps * amountPer;
                if (totalAmount > 0) {
                    const recipients = resolveRecipients(effect);
                    recipients.forEach((recipient) => {
                        if (!recipient?.unit || recipient.unit.alive === false) return;
                        queueDamage(recipient, totalAmount, effect);
                    });
                }
                return;
            }

            if (effectType === 'damage_stacking_consecutive') {
                const stackAmount = Math.max(0, Number(effect?.stackAmount) || 5);
                const consecutiveUses = Math.max(0, (Number(actorState?.skillUses?.[skill.id]) || 1) - 1);
                const totalAmount = stackAmount * consecutiveUses;
                if (totalAmount > 0) {
                    const recipients = resolveRecipients(effect);
                    recipients.forEach((recipient) => {
                        if (!recipient?.unit || recipient.unit.alive === false) return;
                        queueDamage(recipient, totalAmount, effect);
                    });
                }
                return;
            }
        });

        // An affliction-only skill still qualifies for bonuses described as extra
        // non-affliction damage. Queue that extra damage separately so it uses normal
        // defense and reduction rules instead of inheriting Affliction.
        afflictionDamageRecipients.forEach((recipient, recipientKey) => {
            if (skillCancelledByEvade) return;
            let extraDamage = 0;
            if (teamDefenseDamageBonus > 0 && hasDestructibleDefense() &&
                !teamDefenseBonusAppliedTo.has(recipientKey)) {
                extraDamage += teamDefenseDamageBonus;
                teamDefenseBonusAppliedTo.add(recipientKey);
            }
            if (missionAssignmentBonus > 0 && !missionAssignmentBonusApplied) {
                extraDamage += missionAssignmentBonus;
                missionAssignmentBonusApplied = true;
            }
            if (extraDamage <= 0) return;
            const remaining = crystalBallReductionRemainingByRecipient.has(recipientKey)
                ? crystalBallReductionRemainingByRecipient.get(recipientKey)
                : crystalBallSuppressionStatuses.reduce((sum, status) =>
                    sum + (crystalBallSuppressionToConsume.has(status.id) &&
                        status.sourceUsername === recipient.username
                        ? Math.max(0, Number(
                            status.metadata.firstHarmfulSkillAgainstSourceTeamNonAfflictionReductionFlat
                        ) || 0) : 0), 0);
            const reduction = Math.min(extraDamage, remaining);
            crystalBallReductionRemainingByRecipient.set(recipientKey, remaining - reduction);
            queueDamage(recipient, extraDamage - reduction,
                { type: 'damage', amount: extraDamage, metadata: { skillClasses: [] } });
        });

        pendingDamage.forEach((entry) => {
            if (!entry?.recipient?.unit || entry.recipient.unit.alive === false) return;
            const mitigationBudgetKey = `${entry.recipient.username || ''}:${
                Number.isInteger(entry.recipient.slot) ? entry.recipient.slot : ''
            }`;
                    const dealt = applyDamageToUnit(entry.recipient.unit, entry.amount, {
                        match,
                        sourceUsername: entry.sourceUsername || actingUsername,
                        sourceSlot: Number.isInteger(entry.sourceSlot) ? entry.sourceSlot : actorSlot,
                        sourceSkillId: entry.sourceSkillId || skill.id || null,
                        damageDebugLabel: entry.damageDebugLabel || null,
                        targetUsername: entry.recipient.username,
                        targetSlot: entry.recipient.slot,
                        sourceBaseDamage: entry.sourceBaseDamage,
                        minimumHp: Math.max(0, Number(entry.minimumHp) || 0),
                        executeBelowHpThreshold: entry.executeBelowHpThreshold,
                        skillClasses: entry.skillClasses || skill.classes || [],
                        ignoreDamageReduction:
                            Boolean(entry.ignoreDamageReduction) || Boolean(entry.healthStealDamage),
                        ignoreDestructibleDefense: entry.ignoreDestructibleDefense,
                        unpierceableBudgetMap: turnUnpierceableBudgetByRecipient,
                        unpierceableBudgetKey: mitigationBudgetKey,
                        standardMitigationBudgetMap: turnStandardMitigationBudgetByRecipient,
                        standardMitigationBudgetKey: mitigationBudgetKey,
                        percentMitigationStateMap: turnPercentMitigationStateByRecipient,
                        percentMitigationStateKey: mitigationBudgetKey,
                    });
                    if (dealt > 0 && entry.healthStealDamage) {
                        applyDirectHpGainToUnit(actorUnit, dealt);
                    }
                    const onSuccess = entry?.onSuccessfulDamageApplyStatusToTarget;
                    if (dealt > 0 && onSuccess?.statusId) {
                        applyStatus({
                            targetState: ensureUnitStateShape(entry.recipient.unit),
                    statusId: onSuccess.statusId,
                    duration: onSuccess.duration,
                    sourceSkillId: skill.id || null,
                    sourceUsername: actingUsername,
                    sourceSlot: actorSlot,
                    metadata: onSuccess.metadata || {},
                    fresh: false,
                });
            }
            if (dealt > 0) {
                applyOnTeamMemberSuccessfulDamageBonuses({
                    match,
                    actingUsername,
                    targetUnit: entry.recipient.unit,
                    targetUsername: entry.recipient.username,
                    sourceSkillId: skill.id || null,
                    sourceSkillClasses: entry.skillClasses || skill.classes || [],
                    sourceSlot: actorSlot,
                });
            }
        });

        deferredStatusRemovals.forEach(({ recipient, targetStatusId, sourceUsername, sourceSlot }) => {
            const targetState = ensureUnitStateShape(recipient.unit);
            targetState.statuses = (Array.isArray(targetState.statuses) ? targetState.statuses : []).filter(
                (status) => status?.id !== targetStatusId ||
                    (sourceUsername && (status.sourceUsername !== sourceUsername || status.sourceSlot !== sourceSlot))
            );
            refreshDerivedStatusTooltips(targetState);
        });
        if (nextAttackStatuses.length > 0) {
            const consumed = new Set(nextAttackStatuses.map((status) => status.id));
            actorState.statuses = actorState.statuses.filter((status) => !consumed.has(status.id));
        }
        if (missionAssignmentStatuses.length > 0 || crystalBallSuppressionToConsume.size > 0) {
            const consumed = new Set([
                ...missionAssignmentStatuses.map((status) => status.id),
                ...crystalBallSuppressionToConsume,
            ]);
            actorState.statuses = actorState.statuses.filter((status) => !consumed.has(status.id));
        }

        const executeThresholdEffects = effects.filter((e) => e.type === 'execute_threshold');
        executeThresholdEffects.forEach((execEffect) => {
            const thresholdHp = Math.max(0, Number(execEffect?.thresholdHp ?? execEffect?.threshold) || 0);
            const recipients = resolveRecipients(execEffect);
            recipients.forEach((recipient) => {
                if (!recipient?.unit || recipient.unit.alive === false) return;
                const hp = Math.max(0, Number(recipient.unit.hp) || 0);
                if (hp <= thresholdHp) {
                    recipient.unit.hp = 0;
                    recipient.unit.alive = false;
                    triggerTeamMemberDeathHooks({
                        match,
                        deadUsername: recipient.username,
                        deadSlot: recipient.slot,
                    });
                    triggerOwnerDeathHooks({
                        unit: recipient.unit,
                        match,
                        username: recipient.username,
                        slot: recipient.slot,
                    });
                }
            });
        });
        if (skill?.id) {
            actorState.statuses = (Array.isArray(actorState.statuses) ? actorState.statuses : []).filter(
                (existingStatus) => {
                    const removeSkillIds = existingStatus?.metadata?.removeSelfOnSkillUseSkillIds;
                    if (Array.isArray(removeSkillIds) && removeSkillIds.includes(skill.id)) {
                        return false;
                    }
                    return true;
                }
            );
        }

        const cooldownTurns = Math.max(0, Number(skill.cooldown) || 0);
        if (cooldownSkillId && cooldownTurns > 0) {
            actorState.cooldowns[cooldownSkillId] = Math.max(
                getSkillCooldownRemaining(actorState, cooldownSkillId),
                cooldownTurns + 1
            );
            actorState._cooldownsStartedThisTurn = actorState._cooldownsStartedThisTurn || {};
            actorState._cooldownsStartedThisTurn[cooldownSkillId] = true;
        }
        const selfSkillCooldownIncrease = getSkillSpecificCooldownIncrease(actorState, cooldownSkillId);
        if (selfSkillCooldownIncrease > 0 && cooldownSkillId) {
            actorState.cooldowns = actorState.cooldowns || {};
            actorState.cooldowns[cooldownSkillId] =
                Math.max(0, Number(actorState.cooldowns[cooldownSkillId]) || 0) + selfSkillCooldownIncrease;
            actorState._cooldownsStartedThisTurn = actorState._cooldownsStartedThisTurn || {};
            actorState._cooldownsStartedThisTurn[cooldownSkillId] = true;
        }
        const usedSkillPenalty = getTeamStatusMetadataMax({
            match,
            username: opponentUsername,
            metadataKey: 'usedSkillCooldownPenalty',
        });
        if (usedSkillPenalty > 0 && cooldownSkillId) {
            actorState.cooldowns = actorState.cooldowns || {};
            actorState.cooldowns[cooldownSkillId] =
                Math.max(0, Number(actorState.cooldowns[cooldownSkillId]) || 0) + usedSkillPenalty;
            actorState._cooldownsStartedThisTurn = actorState._cooldownsStartedThisTurn || {};
            actorState._cooldownsStartedThisTurn[cooldownSkillId] = true;
        }
        const harmfulSkillPenalty = getTeamStatusMetadataMax({
            match,
            username: opponentUsername,
            metadataKey: 'harmfulSkillCooldownPenalty',
        });
        if (harmfulSkillPenalty > 0 && skillHasHarmfulEffects(skill)) {
            const cooldowns = actorState.cooldowns || {};
            Object.keys(cooldowns).forEach((skillId) => {
                cooldowns[skillId] = Math.max(0, Number(cooldowns[skillId]) || 0) + harmfulSkillPenalty;
            });
            actorState.cooldowns = cooldowns;
        }
        if (cooldownSkillId) {
            const nextSkillCooldownAdjustment = getCastStartNextUsedSkillCooldownAdjustment(castStartStatuses);
            if (nextSkillCooldownAdjustment.amount !== 0) {
                actorState.cooldowns = actorState.cooldowns || {};
                const adjustedCooldown = Math.max(
                    0,
                    (Number(actorState.cooldowns[cooldownSkillId]) || 0) + nextSkillCooldownAdjustment.amount
                );
                if (adjustedCooldown <= 0) {
                    delete actorState.cooldowns[cooldownSkillId];
                } else {
                    actorState.cooldowns[cooldownSkillId] = adjustedCooldown;
                }
                nextSkillCooldownAdjustment.statusIdsToConsume.forEach((statusId) => {
                    consumeStatus(actorState, statusId);
                });
            }
        }
        const actorCharacter = Number.isInteger(actorUnit?.rosterIndex)
            ? characters?.[actorUnit.rosterIndex]
            : null;
        const activeStatuses = Array.isArray(actorState.statuses) ? actorState.statuses : [];
        activeStatuses.forEach((status) => {
            if (!status || (Number(status?.remainingTurns) || 0) <= 0) return;
            const metadata = status?.metadata || {};
            const autoCastSkillId =
                typeof metadata?.autoCastSkillId === 'string' ? metadata.autoCastSkillId.trim() : '';
            if (!autoCastSkillId) return;
            if (!Boolean(metadata?.autoCastOnApply)) return;
            if (metadata?._autoCastOnApplyTriggeredTurnMarker === turnMarker) return;
            const autoSkillIndex = Array.isArray(actorCharacter?.skills)
                ? actorCharacter.skills.findIndex((entry) => entry?.id === autoCastSkillId)
                : -1;
            if (autoSkillIndex < 0) return;
            metadata._autoCastOnApplyTriggeredTurnMarker = turnMarker;
            status.metadata = metadata;
            const autoCastTarget =
                typeof metadata?.autoCastTarget === 'string'
                    ? metadata.autoCastTarget.trim().toLowerCase()
                    : 'all-enemy';
            let targetSelection = [];
            if (autoCastTarget === 'self') {
                targetSelection = [{ username: actingUsername, slot: actorSlot }];
            }
            queuedActions.push({
                actorSlot,
                skillIndex: autoSkillIndex,
                targetSelection,
                isAutoCast: true,
            });
        });
    }

    (match.players || []).forEach((player) => {
        const units = match.board?.[player.username] || [];
        player.aliveCount = units.reduce((sum, unit) => sum + (unit?.alive === false ? 0 : 1), 0);
    });
};

const tickStatusesForTurnEnd = ({ match, endingUsername }) => {
    if (!match || !endingUsername) return;
    syncLinkedStatuses(match);
    const players = Array.isArray(match.players) ? match.players : [];
    const turnEndUnpierceableBudgetByRecipient = new Map();
    const turnEndStandardMitigationBudgetByRecipient = new Map();
    const turnEndPercentMitigationStateByRecipient = new Map();
    const triggerSuperMultiSizeBurst = ({ status, actorState, sourceUsername, sourceSlot }) => {
        const burstStatusId =
            typeof status?.metadata?.superMultiSizeBurstStatusId === 'string'
                ? status.metadata.superMultiSizeBurstStatusId
                : '';
        if (!burstStatusId) return;
        const stunDuration = Math.max(0, Number(status?.metadata?.superMultiSizeBurstStunDuration) || 1);
        const defenseStatus = (Array.isArray(actorState?.statuses) ? actorState.statuses : []).find(
            (entry) => entry?.id === burstStatusId && (Number(entry?.remainingTurns) || 0) > 0
        );
        const burstDamage = Math.max(0, Number(defenseStatus?.metadata?.destructibleDefensePoints) || 0);
        if (burstDamage <= 0) return;

        const opponent = players.find((p) => p?.username && p.username !== sourceUsername);
        const opponentUsername = opponent?.username;
        const enemyUnits = Array.isArray(match.board?.[opponentUsername]) ? match.board[opponentUsername] : [];
        enemyUnits.forEach((enemyUnit, enemySlot) => {
            if (!enemyUnit || enemyUnit.alive === false) return;
            const mitigationBudgetKey = `${opponentUsername || ''}:${
                Number.isInteger(enemySlot) ? enemySlot : ''
            }`;
            applyDamageToUnit(enemyUnit, burstDamage, {
                match,
                sourceUsername,
                sourceSlot: Number.isInteger(status?.sourceSlot) ? status.sourceSlot : null,
                targetUsername: opponentUsername,
                unpierceableBudgetMap: turnEndUnpierceableBudgetByRecipient,
                unpierceableBudgetKey: mitigationBudgetKey,
                standardMitigationBudgetMap: turnEndStandardMitigationBudgetByRecipient,
                standardMitigationBudgetKey: mitigationBudgetKey,
                percentMitigationStateMap: turnEndPercentMitigationStateByRecipient,
                percentMitigationStateKey: mitigationBudgetKey,
            });
            applyStatus({
                targetState: ensureUnitStateShape(enemyUnit),
                statusId: 'stunned',
                duration: stunDuration,
                sourceSkillId: status?.sourceSkillId || null,
                sourceUsername: sourceUsername || null,
                sourceSlot: Number.isInteger(sourceSlot) ? sourceSlot : null,
                metadata: {
                    harmful: true,
                    cannotUseSkills: true,
                    tooltipText: 'This character is stunned.',
                },
                fresh: false,
            });
        });
    };
    players.forEach((player) => {
        const username = player?.username;
        if (!username) return;
        const units = match.board?.[username] || [];
    units.forEach((unit, unitSlot) => {
        const actorState = ensureUnitStateShape(unit);
        const endedOngoingStatuses = new Set();
        const pendingExpireStatuses = [];
        actorState.statuses.forEach((status) => {
                if (!status || (status.remainingTurns || 0) <= 0) return;
                if (status.fresh && !Boolean(status?.metadata?.triggerOnApply)) return;
                const ongoingClass =
                    typeof status?.metadata?.ongoingClass === 'string'
                        ? status.metadata.ongoingClass.trim().toLowerCase()
                        : '';
                const sourceUnit =
                    status?.sourceUsername && Number.isInteger(status?.sourceSlot)
                        ? match.board?.[status.sourceUsername]?.[Number(status.sourceSlot)] || null
                        : null;
                const sourceState = sourceUnit ? ensureUnitStateShape(sourceUnit) : null;
                const sourceDead =
                    Boolean(status?.sourceUsername) &&
                    Number.isInteger(status?.sourceSlot) &&
                    (!sourceUnit || sourceUnit.alive === false);
                const sourceStunned = sourceState
                    ? Boolean(getStatusMetadataTotals(sourceState).cannotUseSkills) ||
                        (Boolean(status?.metadata?.endsOnAnySourceStun) && isUnitStunned(sourceState, sourceUnit))
                    : false;
                const sourceDamageBonusFlat = sourceState
                    ? Number(getStatusMetadataTotals(sourceState).damageBonusFlat) || 0
                    : 0;
                const sourceDamageDebuffFlat = sourceState
                    ? Number(getStatusMetadataTotals(sourceState).damageDebuffFlat) || 0
                    : 0;
                const sourceNonAfflictionDamageBonusFlat = sourceState
                    ? Number(getStatusMetadataTotals(sourceState).nonAfflictionDamageBonusFlat) || 0
                    : 0;
                const sourceNonAfflictionDamageDebuffFlat = sourceState
                    ? Number(getStatusMetadataTotals(sourceState).nonAfflictionDamageDebuffFlat) || 0
                    : 0;
                const targetInvulnerable = isUnitInvulnerable(unit);
                if (
                    (ongoingClass === 'control' || ongoingClass === 'action' || Boolean(status?.metadata?.removeOnSourceDeath) || Boolean(status?.metadata?.endsOnSourceDeath)) &&
                    sourceDead &&
                    status?.id
                ) {
                    endedOngoingStatuses.add(status.id);
                    return;
                }
                const ignoreOngoingSourceStun = Boolean(status?.metadata?.ignoreOngoingSourceStun);
                if (ongoingClass === 'control' && ((sourceStunned && !ignoreOngoingSourceStun) || targetInvulnerable)) {
                    if (status?.id) {
                        endedOngoingStatuses.add(status.id);
                    }
                    return;
                }
                const triggerAnchor =
                    status?.metadata?.turnEndTrigger === 'source_turn' ? 'source_turn' : 'owner_turn';
                if (
                    sourceDead &&
                    triggerAnchor === 'source_turn'
                ) {
                    if (status?.id) {
                        endedOngoingStatuses.add(status.id);
                    }
                    return;
                }
                const shouldTrigger =
                    triggerAnchor === 'source_turn'
                        ? status?.sourceUsername === endingUsername
                        : username === endingUsername;
                if (!shouldTrigger) return;
                const growPerTurn = Array.isArray(status?.metadata?.growPerTurn)
                    ? status.metadata.growPerTurn
                    : [];
                if (growPerTurn.length > 0 && status?.metadata && typeof status.metadata === 'object') {
                    growPerTurn.forEach((entry) => {
                        const key = typeof entry?.key === 'string' ? entry.key : '';
                        const amount = Number(entry?.amount) || 0;
                        if (!key || !amount) return;
                        const current = Number(status.metadata[key]) || 0;
                        let next = current + amount;
                        if (Number.isFinite(Number(entry?.max))) {
                            next = amount > 0 ? Math.min(next, Number(entry.max)) : Math.max(next, Number(entry.max));
                        }
                        status.metadata[key] = next;
                    });
                }
                const turnEndApplyStatusToSelf = status?.metadata?.turnEndApplyStatusToSelf;
                if (
                    turnEndApplyStatusToSelf &&
                    typeof turnEndApplyStatusToSelf === 'object' &&
                    (!turnEndApplyStatusToSelf.once || !status.metadata._turnEndApplyStatusToSelfUsed)
                ) {
                    applyStatus({
                        targetState: actorState,
                        statusId: turnEndApplyStatusToSelf.statusId,
                        duration: turnEndApplyStatusToSelf.duration,
                        sourceSkillId: status?.sourceSkillId || null,
                        sourceUsername: status?.sourceUsername || null,
                        sourceSlot: Number.isInteger(status?.sourceSlot) ? status.sourceSlot : null,
                        metadata: turnEndApplyStatusToSelf.metadata || {},
                        fresh: Boolean(turnEndApplyStatusToSelf.fresh),
                    });
                    if (turnEndApplyStatusToSelf.once) {
                        status.metadata._turnEndApplyStatusToSelfUsed = true;
                    }
                }
                const turnEndApplyStatusToEnemies = Array.isArray(status?.metadata?.turnEndApplyStatusToEnemies)
                    ? status.metadata.turnEndApplyStatusToEnemies
                    : [];
                if (turnEndApplyStatusToEnemies.length > 0) {
                    const opponent = players.find((p) => p?.username && p.username !== username);
                    const opponentUsername = opponent?.username;
                    const enemyUnits = Array.isArray(match.board?.[opponentUsername])
                        ? match.board[opponentUsername]
                        : [];
                    enemyUnits.forEach((enemyUnit, enemySlot) => {
                        if (!enemyUnit || enemyUnit.alive === false) return;
                        const enemyState = ensureUnitStateShape(enemyUnit);
                        turnEndApplyStatusToEnemies.forEach((entry) => {
                            if (!entry || !entry.statusId) return;
                            applyStatus({
                                targetState: enemyState,
                                statusId: entry.statusId,
                                duration: entry.duration,
                                sourceSkillId: status?.sourceSkillId || null,
                                sourceUsername: status?.sourceUsername || null,
                                sourceSlot: Number.isInteger(status?.sourceSlot) ? status.sourceSlot : null,
                                metadata: entry.metadata || {},
                                fresh: Boolean(entry.fresh),
                            });
                        });
                    });
                }
                const turnEndApplyStatusesToRandomEnemy = Array.isArray(
                    status?.metadata?.turnEndApplyStatusesToRandomEnemy
                )
                    ? status.metadata.turnEndApplyStatusesToRandomEnemy.filter(
                          (entry) => entry && typeof entry === 'object' && entry.statusId
                      )
                    : [];
                const turnEndApplyStatusToRandomEnemy =
                    turnEndApplyStatusesToRandomEnemy.length > 0
                        ? null
                        : status?.metadata?.turnEndApplyStatusToRandomEnemy;
                if (turnEndApplyStatusesToRandomEnemy.length > 0 || turnEndApplyStatusToRandomEnemy?.statusId) {
                    const opponent = players.find((p) => p?.username && p.username !== username);
                    const opponentUsername = opponent?.username;
                    const enemyUnits = Array.isArray(match.board?.[opponentUsername])
                        ? match.board[opponentUsername]
                        : [];
                    const aliveEnemyEntries = enemyUnits
                        .map((enemyUnit, enemySlot) => ({ enemyUnit, enemySlot }))
                        .filter((entry) => entry?.enemyUnit && entry.enemyUnit.alive !== false);
                    if (aliveEnemyEntries.length > 0) {
                        const trackingMetadataKey =
                            typeof turnEndApplyStatusToRandomEnemy?.trackingMetadataKey === 'string' &&
                            turnEndApplyStatusToRandomEnemy.trackingMetadataKey
                                ? turnEndApplyStatusToRandomEnemy.trackingMetadataKey
                                : turnEndApplyStatusesToRandomEnemy.find(
                                      (entry) =>
                                          typeof entry?.trackingMetadataKey === 'string' &&
                                          entry.trackingMetadataKey
                                  )?.trackingMetadataKey || '_lastRandomStatusEnemyKey';
                        const lastKey =
                            typeof status?.metadata?.[trackingMetadataKey] === 'string'
                                ? status.metadata[trackingMetadataKey]
                                : '';
                        const targetStrategy =
                            typeof turnEndApplyStatusToRandomEnemy?.targetStrategy === 'string' &&
                            turnEndApplyStatusToRandomEnemy.targetStrategy
                                ? turnEndApplyStatusToRandomEnemy.targetStrategy
                                : turnEndApplyStatusesToRandomEnemy.find(
                                      (entry) => typeof entry?.targetStrategy === 'string' && entry.targetStrategy
                                  )?.targetStrategy || '';
                        const mustChangeTarget =
                            Boolean(turnEndApplyStatusToRandomEnemy?.mustChangeTarget) ||
                            turnEndApplyStatusesToRandomEnemy.some((entry) => Boolean(entry?.mustChangeTarget));
                        const picked = pickTrackedEnemyEntry({
                            aliveEnemyEntries,
                            opponentUsername,
                            strategy: targetStrategy,
                            previousKey: lastKey,
                            mustChangeTarget,
                        });
                        if (picked?.enemyUnit) {
                            if (status?.metadata && typeof status.metadata === 'object') {
                                status.metadata[trackingMetadataKey] =
                                    `${opponentUsername}:${picked.enemySlot}`;
                            }
                            const pickedState = ensureUnitStateShape(picked.enemyUnit);
                            const entries =
                                turnEndApplyStatusesToRandomEnemy.length > 0
                                    ? turnEndApplyStatusesToRandomEnemy
                                    : [turnEndApplyStatusToRandomEnemy];
                            entries.forEach((entry) => {
                                if (
                                    !doesEffectConditionMatch({
                                        condition: entry?.condition,
                                        actorState,
                                        targetState: pickedState,
                                        actorUnit: unit,
                                        targetUnit: picked.enemyUnit,
                                        actorUsername: username,
                                        targetUsername: opponentUsername,
                                    })
                                ) {
                                    return;
                                }
                                applyStatus({
                                    targetState: pickedState,
                                    statusId: entry.statusId,
                                    duration: entry.duration,
                                    sourceSkillId: status?.sourceSkillId || null,
                                    sourceUsername: status?.sourceUsername || null,
                                    sourceSlot: Number.isInteger(status?.sourceSlot) ? status.sourceSlot : null,
                                    metadata: entry.metadata || {},
                                    fresh: Boolean(entry.fresh),
                                });
                            });
                        }
                    }
                }
                const turnEndEffectsToRandomEnemy = Array.isArray(status?.metadata?.turnEndEffectsToRandomEnemy)
                    ? status.metadata.turnEndEffectsToRandomEnemy.filter(
                          (entry) =>
                              entry &&
                              typeof entry === 'object' &&
                              Array.isArray(entry.effects) &&
                              entry.effects.length > 0
                      )
                    : [];
                const turnEndEffectToRandomEnemy =
                    turnEndEffectsToRandomEnemy.length > 0
                        ? null
                        : status?.metadata?.turnEndEffectToRandomEnemy;
                if (turnEndEffectsToRandomEnemy.length > 0 || Array.isArray(turnEndEffectToRandomEnemy?.effects)) {
                    const opponent = players.find((p) => p?.username && p.username !== username);
                    const opponentUsername = opponent?.username;
                    const enemyUnits = Array.isArray(match.board?.[opponentUsername])
                        ? match.board[opponentUsername]
                        : [];
                    const aliveEnemyEntries = enemyUnits
                        .map((enemyUnit, enemySlot) => ({ enemyUnit, enemySlot }))
                        .filter((entry) => entry?.enemyUnit && entry.enemyUnit.alive !== false);
                    if (aliveEnemyEntries.length > 0) {
                        const trackingMetadataKey =
                            typeof turnEndEffectToRandomEnemy?.trackingMetadataKey === 'string' &&
                            turnEndEffectToRandomEnemy.trackingMetadataKey
                                ? turnEndEffectToRandomEnemy.trackingMetadataKey
                                : turnEndEffectsToRandomEnemy.find(
                                      (entry) =>
                                          typeof entry?.trackingMetadataKey === 'string' &&
                                          entry.trackingMetadataKey
                                  )?.trackingMetadataKey || '_lastRandomStatusEnemyKey';
                        const lastKey =
                            typeof status?.metadata?.[trackingMetadataKey] === 'string'
                                ? status.metadata[trackingMetadataKey]
                                : '';
                        const targetStrategy =
                            typeof turnEndEffectToRandomEnemy?.targetStrategy === 'string' &&
                            turnEndEffectToRandomEnemy.targetStrategy
                                ? turnEndEffectToRandomEnemy.targetStrategy
                                : turnEndEffectsToRandomEnemy.find(
                                      (entry) => typeof entry?.targetStrategy === 'string' && entry.targetStrategy
                                  )?.targetStrategy || '';
                        const mustChangeTarget =
                            Boolean(turnEndEffectToRandomEnemy?.mustChangeTarget) ||
                            turnEndEffectsToRandomEnemy.some((entry) => Boolean(entry?.mustChangeTarget));
                        const picked = pickTrackedEnemyEntry({
                            aliveEnemyEntries,
                            opponentUsername,
                            strategy: targetStrategy,
                            previousKey: lastKey,
                            mustChangeTarget,
                        });
                        if (picked?.enemyUnit) {
                            if (status?.metadata && typeof status.metadata === 'object') {
                                status.metadata[trackingMetadataKey] =
                                    `${opponentUsername}:${picked.enemySlot}`;
                            }
                            const entries =
                                turnEndEffectsToRandomEnemy.length > 0
                                    ? turnEndEffectsToRandomEnemy
                                    : [turnEndEffectToRandomEnemy];
                            entries.forEach((entry) => {
                                const pickedState = ensureUnitStateShape(picked.enemyUnit);
                                if (
                                    !doesEffectConditionMatch({
                                        condition: entry?.condition,
                                        actorState,
                                        targetState: pickedState,
                                        actorUnit: unit,
                                        targetUnit: picked.enemyUnit,
                                        actorUsername: username,
                                        targetUsername: opponentUsername,
                                    })
                                ) {
                                    return;
                                }
                                applyTriggeredEffectsToRecipients({
                                    effects: entry.effects,
                                    match,
                                    status,
                                    recipients: [
                                        {
                                            unit: picked.enemyUnit,
                                            slot: picked.enemySlot,
                                            username: opponentUsername,
                                        },
                                    ],
                                });
                            });
                        }
                    }
                }
                if (Boolean(status?.metadata?.removeEnemyAfflictionStatusesOnTurnEnd)) {
                    cleanseEnemyAfflictionStatuses(
                        unit,
                        username,
                        status?.metadata?.removeEnemyAfflictionStatusesOnTurnEndCount
                    );
                }
                if (ongoingClass === 'action' && ((sourceStunned && !ignoreOngoingSourceStun) || targetInvulnerable)) return;
                const baseTurnEndDamage = Math.max(0, Number(status?.metadata?.turnEndDamage) || 0);
                let turnEndDamage = baseTurnEndDamage;
                const turnEndSkillClasses = Array.isArray(status?.metadata?.turnEndSkillClasses)
                    ? status.metadata.turnEndSkillClasses : [];
                const turnEndIsAffliction = Boolean(status?.metadata?.afflictionDamage);
                const ignoreSourceNonAfflictionDamageBonus = Boolean(
                    status?.metadata?.ignoreSourceNonAfflictionDamageBonus
                );
                if (baseTurnEndDamage > 0) {
                    const sourceSkillSpecificBonus = sourceState
                        ? getSkillSpecificDamageBonus(sourceState, status?.sourceSkillId || null)
                        : 0;
                    turnEndDamage = Math.max(
                        0,
                        baseTurnEndDamage +
                            sourceDamageBonusFlat -
                            sourceDamageDebuffFlat +
                            sourceSkillSpecificBonus +
                            (turnEndIsAffliction || ignoreSourceNonAfflictionDamageBonus
                                ? 0
                                : sourceNonAfflictionDamageBonusFlat - sourceNonAfflictionDamageDebuffFlat)
                    );
                }
                const sourceOutgoingCap = sourceState ? getOutgoingDamageCap(sourceState, sourceUnit) : null;
                if (sourceOutgoingCap !== null) {
                    turnEndDamage = Math.min(turnEndDamage, sourceOutgoingCap);
                }
                if (turnEndSkillClasses.length > 0 && isUnitInvulnerableForSkill(unit, turnEndSkillClasses, { afflictionDamage: turnEndIsAffliction })) {
                    turnEndDamage = 0;
                }
                if (turnEndDamage > 0) {
                    const affliction = turnEndIsAffliction;
                    const mitigationBudgetKey = `${username || ''}:${Number.isInteger(unitSlot) ? unitSlot : ''}`;
                    const dealt = applyDamageToUnit(unit, turnEndDamage, {
                        match,
                        sourceSkillId: status?.sourceSkillId || null,
                        sourceUsername: status?.sourceUsername || null,
                        sourceSlot: Number.isInteger(status?.sourceSlot) ? status.sourceSlot : null,
                        targetUsername: username,
                        afflictionDamage: affliction,
                        skillClasses: turnEndSkillClasses,
                        damageDebugReason: 'turn end',
                        ignoreDamageReduction:
                            affliction || Boolean(status?.metadata?.ignoreTargetDamageReduction),
                        ignoreDestructibleDefense:
                            affliction || Boolean(status?.metadata?.ignoreTargetDestructibleDefense),
                        unpierceableBudgetMap: turnEndUnpierceableBudgetByRecipient,
                        unpierceableBudgetKey: mitigationBudgetKey,
                        standardMitigationBudgetMap: turnEndStandardMitigationBudgetByRecipient,
                        standardMitigationBudgetKey: mitigationBudgetKey,
                        percentMitigationStateMap: turnEndPercentMitigationStateByRecipient,
                        percentMitigationStateKey: mitigationBudgetKey,
                    });
                    const onSuccessTurnEndApplyStatusToSelf =
                        status?.metadata?.onSuccessfulTurnEndDamageApplyStatusToSelf;
                    if (dealt > 0 && onSuccessTurnEndApplyStatusToSelf?.statusId) {
                        applyStatus({
                            targetState: actorState,
                            statusId: onSuccessTurnEndApplyStatusToSelf.statusId,
                            duration: onSuccessTurnEndApplyStatusToSelf.duration,
                            sourceSkillId: status?.sourceSkillId || null,
                            sourceUsername: status?.sourceUsername || null,
                            sourceSlot: Number.isInteger(status?.sourceSlot) ? status.sourceSlot : null,
                            metadata: onSuccessTurnEndApplyStatusToSelf.metadata || {},
                            fresh: false,
                        });
                    }
                }
                if (Boolean(status?.metadata?.turnEndDestroyDestructibleDefense)) {
                    destroyAllDestructibleDefenseOnUnit(unit);
                }

                const baseTurnEndRandomEnemyDamage = Math.max(
                    0,
                    Number(status?.metadata?.turnEndRandomEnemyDamage) || 0
                );
                const randomEnemyIsAffliction = hasSkillClass(
                    status?.metadata?.turnEndRandomEnemySkillClasses || [],
                    'affliction'
                );
                const adjustedRandomEnemyDamage =
                    baseTurnEndRandomEnemyDamage > 0
                        ? Math.max(
                              0,
                              baseTurnEndRandomEnemyDamage +
                                  sourceDamageBonusFlat -
                                  sourceDamageDebuffFlat +
                                  (randomEnemyIsAffliction ||
                                  Boolean(status?.metadata?.ignoreSourceNonAfflictionDamageBonus)
                                      ? 0
                                      : sourceNonAfflictionDamageBonusFlat - sourceNonAfflictionDamageDebuffFlat)
                          )
                        : 0;
                const cappedRandomEnemyDamage =
                    sourceState && getOutgoingDamageCap(sourceState, sourceUnit) !== null
                        ? Math.min(adjustedRandomEnemyDamage, getOutgoingDamageCap(sourceState, sourceUnit))
                        : adjustedRandomEnemyDamage;
                if (cappedRandomEnemyDamage > 0) {
                    const opponent = players.find((p) => p?.username && p.username !== username);
                    const opponentUsername = opponent?.username;
                    const enemyUnits = Array.isArray(match.board?.[opponentUsername])
                        ? match.board[opponentUsername]
                        : [];
                    const aliveEnemyEntries = enemyUnits
                        .map((enemyUnit, enemySlot) => ({ enemyUnit, enemySlot }))
                        .filter((entry) => entry?.enemyUnit && entry.enemyUnit.alive !== false);
                    if (aliveEnemyEntries.length > 0) {
                        const preferredStatusId =
                            typeof status?.metadata?.preferEnemyWithStatusId === 'string'
                                ? status.metadata.preferEnemyWithStatusId
                                : '';
                        const preferredEntries = preferredStatusId
                            ? aliveEnemyEntries.filter((entry) =>
                                  hasStatus(ensureUnitStateShape(entry.enemyUnit), preferredStatusId)
                              )
                            : [];
                        let pool = preferredEntries.length > 0 ? preferredEntries : aliveEnemyEntries;
                        if (Boolean(status?.metadata?.turnEndRandomEnemyMustChangeTarget)) {
                            const lastKey =
                                typeof status?.metadata?._lastRandomEnemyKey === 'string'
                                    ? status.metadata._lastRandomEnemyKey
                                    : '';
                            if (lastKey && pool.length > 1) {
                                const filtered = pool.filter(
                                    (entry) => `${opponentUsername}:${entry.enemySlot}` !== lastKey
                                );
                                if (filtered.length > 0) {
                                    pool = filtered;
                                }
                            }
                        }
                        const picked = pool[Math.floor(Math.random() * pool.length)];
                        if (picked?.enemyUnit) {
                            if (status?.metadata && typeof status.metadata === 'object') {
                                status.metadata._lastRandomEnemyKey = `${opponentUsername}:${picked.enemySlot}`;
                            }
                            const mitigationBudgetKey = `${opponentUsername || ''}:${
                                Number.isInteger(picked?.enemySlot) ? picked.enemySlot : ''
                            }`;
                            applyDamageToUnit(picked.enemyUnit, cappedRandomEnemyDamage, {
                                match,
                                sourceSkillId: status?.sourceSkillId || null,
                                sourceUsername: username,
                                sourceSlot: unitSlot,
                                targetUsername: opponentUsername,
                                afflictionDamage: randomEnemyIsAffliction,
                                skillClasses: status?.metadata?.turnEndRandomEnemySkillClasses || [],
                                damageDebugReason: 'turn end random',
                                ignoreDamageReduction: Boolean(status?.metadata?.turnEndRandomEnemyIgnoreDamageReduction),
                                ignoreDestructibleDefense: Boolean(
                                    status?.metadata?.turnEndRandomEnemyIgnoreDestructibleDefense
                                ),
                                unpierceableBudgetMap: turnEndUnpierceableBudgetByRecipient,
                                unpierceableBudgetKey: mitigationBudgetKey,
                                standardMitigationBudgetMap: turnEndStandardMitigationBudgetByRecipient,
                                standardMitigationBudgetKey: mitigationBudgetKey,
                                percentMitigationStateMap: turnEndPercentMitigationStateByRecipient,
                                percentMitigationStateKey: mitigationBudgetKey,
                            });
                        }
                    }
                }

                const turnEndDrainNonBloodlineToSource = Math.max(
                    0,
                    Number(status?.metadata?.turnEndDrainNonBloodlineToSource) || 0
                );
                if (
                    turnEndDrainNonBloodlineToSource > 0 &&
                    status?.sourceUsername &&
                    status.sourceUsername !== username &&
                    !isUnitImmuneToChakraLoss(unit)
                ) {
                    match.chakraPools = match.chakraPools || {};
                    const ownerPool = match.chakraPools[username] || createEmptyChakraCost();
                    const sourcePool = match.chakraPools[status.sourceUsername] || createEmptyChakraCost();
                    for (let i = 0; i < turnEndDrainNonBloodlineToSource; i += 1) {
                        const available = ['taijutsu', 'ninjutsu', 'genjutsu'].filter(
                            (type) => (Number(ownerPool[type]) || 0) > 0
                        );
                        if (!available.length) break;
                        const picked = available[Math.floor(Math.random() * available.length)];
                        ownerPool[picked] = Math.max(0, (Number(ownerPool[picked]) || 0) - 1);
                        sourcePool[picked] = (Number(sourcePool[picked]) || 0) + 1;
                    }
                    match.chakraPools[username] = ownerPool;
                    match.chakraPools[status.sourceUsername] = sourcePool;
                }

                const turnEndRemoveRandomChakra = Math.max(
                    0,
                    Number(status?.metadata?.turnEndRemoveRandomChakra) || 0
                );
                if (turnEndRemoveRandomChakra > 0 && !isUnitImmuneToChakraLoss(unit)) {
                    removeRandomChakraFromMatch({
                        match,
                        username,
                        amount: turnEndRemoveRandomChakra,
                    });
                }

                const turnEndHealPercentCurrent = Number(status?.metadata?.turnEndHealPercentCurrent) || 0;
                if (turnEndHealPercentCurrent > 0) {
                    const currentHp = Math.max(0, Number(unit?.hp) || 0);
                    const healAmount = (currentHp * turnEndHealPercentCurrent) / 100;
                    applyHealToUnit(unit, healAmount);
                }
                const turnEndHealFlat = Math.max(0, Number(status?.metadata?.turnEndHealFlat) || 0);
                if (turnEndHealFlat > 0) {
                    applyHealToUnit(unit, turnEndHealFlat, { excludeStatusId: status.id });
                }
                const turnEndHealthLoss = Math.max(0, Number(status?.metadata?.turnEndHealthLoss) || 0);
                if (turnEndHealthLoss > 0) {
                    applyHealthLossToUnit(unit, turnEndHealthLoss, {
                        match,
                        sourceSkillId: status?.sourceSkillId || null,
                        targetUsername: username,
                        targetSlot: unitSlot,
                        damageDebugReason: 'turn end health loss',
                    });
                }
                const turnEndHealthCapLoss = Math.max(
                    0,
                    Number(status?.metadata?.turnEndHealthCapLoss) || 0
                );
                if (turnEndHealthCapLoss > 0) {
                    applyHealthCapLossToUnit(unit, turnEndHealthCapLoss, {
                        match,
                        targetUsername: username,
                        targetSlot: unitSlot,
                    });
                }
                const turnEndDamageFromSourceCurrentHp = Boolean(
                    status?.metadata?.turnEndDamageFromSourceCurrentHp
                );
                if (
                    turnEndDamageFromSourceCurrentHp &&
                    status?.sourceUsername &&
                    Number.isInteger(status?.sourceSlot)
                ) {
                    const sourceUnit =
                        match.board?.[status.sourceUsername]?.[Number(status.sourceSlot)] || null;
                    const sourceCurrentHp = Math.max(0, Number(sourceUnit?.hp) || 0);
                    if (sourceCurrentHp > 0) {
                        const mitigationBudgetKey = `${username || ''}:${Number.isInteger(unitSlot) ? unitSlot : ''}`;
                        applyDamageToUnit(unit, sourceCurrentHp, {
                            match,
                            sourceUsername: status.sourceUsername,
                            sourceSlot: Number.isInteger(status?.sourceSlot) ? status.sourceSlot : null,
                            targetUsername: username,
                            afflictionDamage: Boolean(status?.metadata?.afflictionDamage),
                            ignoreDamageReduction: Boolean(status?.metadata?.ignoreTargetDamageReduction),
                            ignoreDestructibleDefense: Boolean(
                                status?.metadata?.ignoreTargetDestructibleDefense
                            ),
                            unpierceableBudgetMap: turnEndUnpierceableBudgetByRecipient,
                            unpierceableBudgetKey: mitigationBudgetKey,
                            standardMitigationBudgetMap: turnEndStandardMitigationBudgetByRecipient,
                            standardMitigationBudgetKey: mitigationBudgetKey,
                            percentMitigationStateMap: turnEndPercentMitigationStateByRecipient,
                            percentMitigationStateKey: mitigationBudgetKey,
                        });
                    }
                }
                const turnEndGainChakra = status?.metadata?.turnEndGainChakra;
                if (turnEndGainChakra?.chakraType) {
                    const turnEndGainAmount = Math.max(0, Number(turnEndGainChakra.amount) || 1);
                    const turnEndGainType =
                        typeof turnEndGainChakra.chakraType === 'string'
                            ? turnEndGainChakra.chakraType.trim().toLowerCase()
                            : '';
                    if (turnEndGainType === 'random') {
                        for (let i = 0; i < turnEndGainAmount; i += 1) {
                            const pick = chakraTypes[Math.floor(Math.random() * chakraTypes.length)];
                            applyChakraGainToMatch({ match, username, chakraType: pick, amount: 1 });
                        }
                    } else {
                        applyChakraGainToMatch({
                            match,
                            username,
                            chakraType: turnEndGainType,
                            amount: turnEndGainAmount,
                        });
                    }
                }
                const turnEndSetHpToRaw = Number(status?.metadata?.turnEndSetHpTo);
                if (Number.isFinite(turnEndSetHpToRaw)) {
                    const nextHp = Math.max(0, turnEndSetHpToRaw);
                    const wasAlive = unit.alive !== false;
                    unit.hp = nextHp;
                    if (unit.hp <= 0) {
                        unit.alive = false;
                    }
                    if (wasAlive && unit.alive === false) {
                        triggerTeamMemberDeathHooks({
                            match,
                            deadUsername: username,
                            deadSlot: unitSlot,
                        });
                        triggerOwnerDeathHooks({
                            unit,
                            match,
                            username,
                            slot: unitSlot,
                        });
                    }
                }
                const turnEndModifyCooldownsSelf =
                    status?.metadata?.turnEndModifyCooldownsSelf &&
                    typeof status.metadata.turnEndModifyCooldownsSelf === 'object'
                        ? status.metadata.turnEndModifyCooldownsSelf
                        : null;
                if (turnEndModifyCooldownsSelf && username === endingUsername && !isUnitBanished(unit)) {
                    const cooldowns =
                        actorState.cooldowns && typeof actorState.cooldowns === 'object'
                            ? actorState.cooldowns
                            : {};
                    const operation =
                        typeof turnEndModifyCooldownsSelf.operation === 'string'
                            ? turnEndModifyCooldownsSelf.operation.trim().toLowerCase()
                            : 'add';
                    const amount = Number(turnEndModifyCooldownsSelf.amount) || 0;
                    const skillIds = Array.isArray(turnEndModifyCooldownsSelf.skillIds)
                        ? turnEndModifyCooldownsSelf.skillIds.filter((entry) => typeof entry === 'string' && entry)
                        : [];
                    skillIds.forEach((skillId) => {
                        const current = Math.max(0, Number(cooldowns[skillId]) || 0);
                        let next = current;
                        if (operation === 'set') {
                            next = Math.max(0, amount);
                        } else if (operation === 'max') {
                            next = Math.max(current, Math.max(0, amount));
                        } else if (operation === 'min') {
                            next = Math.max(0, Math.min(current, amount));
                        } else {
                            next = Math.max(0, current + amount);
                        }
                        if (next <= 0) {
                            delete cooldowns[skillId];
                        } else {
                            cooldowns[skillId] = next;
                        }
                    });
                    actorState.cooldowns = cooldowns;
                }
                const defenseRestoreConfig =
                    status?.metadata?.destructibleDefenseRestore &&
                    typeof status.metadata.destructibleDefenseRestore === 'object'
                        ? status.metadata.destructibleDefenseRestore
                        : null;
                if (defenseRestoreConfig && username === endingUsername) {
                    const turnsLeft = Math.max(0, Number(status?.metadata?._destructibleDefenseRestoreTurnsLeft) || 0);
                    if (turnsLeft > 0) {
                        const currentPoints = Math.max(
                            0,
                            Number(status?.metadata?.destructibleDefensePoints) || 0
                        );
                        const nextTurnsLeft = Math.max(0, turnsLeft - 1);
                        if (currentPoints > 0) {
                            if (nextTurnsLeft <= 0) {
                                const restoreTo = Math.max(
                                    0,
                                    Number(defenseRestoreConfig?.restoreTo) || currentPoints
                                );
                                status.metadata = {
                                    ...(status.metadata || {}),
                                    destructibleDefensePoints: restoreTo,
                                    _destructibleDefenseRestoreTurnsLeft: 0,
                                };
                            } else {
                                status.metadata = {
                                    ...(status.metadata || {}),
                                    _destructibleDefenseRestoreTurnsLeft: nextTurnsLeft,
                                };
                            }
                        } else {
                            status.metadata = {
                                ...(status.metadata || {}),
                                _destructibleDefenseRestoreTurnsLeft: 0,
                            };
                        }
                    }
                }
            });
            actorState.statuses = actorState.statuses
                .map((status) => {
                    if (!status || (status.remainingTurns || 0) <= 0) return null;
                    if (status?.id && endedOngoingStatuses.has(status.id)) return null;
                    const remaining = Number(status?.remainingTurns) || 0;
                    if (remaining >= 99 || Boolean(status?.metadata?.infiniteDuration)) {
                        if (status.fresh) {
                            return { ...status, fresh: false };
                        }
                        return status;
                    }
                    const durationAnchor =
                        status?.metadata?.turnDurationAnchor === 'source_turn'
                            ? 'source_turn'
                            : status?.metadata?.turnDurationAnchor === 'any_turn'
                            ? 'any_turn'
                            : 'owner_turn';
                    const shouldTickDuration =
                        durationAnchor === 'any_turn'
                            ? true
                            : durationAnchor === 'source_turn'
                            ? status?.sourceUsername === endingUsername
                            : username === endingUsername;
                    if (!shouldTickDuration) {
                        return status;
                    }
                    if (
                        Boolean(status?.metadata?.skipFirstTurnEndTick) &&
                        !Boolean(status?.metadata?._skipFirstTurnEndTickConsumed)
                    ) {
                        return {
                            ...status,
                            fresh: false,
                            metadata: {
                                ...(status.metadata || {}),
                                _skipFirstTurnEndTickConsumed: true,
                            },
                        };
                    }
                    if (status.fresh && !Boolean(status?.metadata?.triggerOnApply)) {
                        return { ...status, fresh: false };
                    }
                if (status.fresh && Boolean(status?.metadata?.triggerOnApply)) {
                    const nextRemaining = (status.remainingTurns || 0) - 1;
                    if (nextRemaining <= 0) {
                        triggerSuperMultiSizeBurst({
                            status,
                            actorState,
                            sourceUsername: username,
                            sourceSlot: unitSlot,
                        });
                        triggerStoredStatusEffects({
                            match,
                            status,
                            targetUnit: unit,
                            targetState: actorState,
                            targetUsername: username,
                            targetSlot: unitSlot,
                            pendingStatuses: pendingExpireStatuses,
                        });
                    }
                    if (
                        nextRemaining <= 0 &&
                        status?.metadata?.onExpireApplyStatusToSelf?.statusId
                        ) {
                            applyExpireReplacementStatus({
                                pendingExpireStatuses,
                                sourceStatus: status,
                                replacement: status.metadata.onExpireApplyStatusToSelf,
                            });
                        }
                        return {
                            ...status,
                            fresh: false,
                            remainingTurns: nextRemaining,
                        };
                    }
                    const nextRemaining = (status.remainingTurns || 0) - 1;
                    const turnEndRandomizeConfig =
                        status?.metadata?.turnEndRandomizeMetadataKeyFromOptions &&
                        typeof status.metadata.turnEndRandomizeMetadataKeyFromOptions === 'object'
                            ? status.metadata.turnEndRandomizeMetadataKeyFromOptions
                            : null;
                    if (nextRemaining <= 0 && turnEndRandomizeConfig) {
                        const metadataKey =
                            typeof turnEndRandomizeConfig.metadataKey === 'string' && turnEndRandomizeConfig.metadataKey
                                ? turnEndRandomizeConfig.metadataKey
                                : '';
                        const options = Array.isArray(turnEndRandomizeConfig.options)
                            ? turnEndRandomizeConfig.options
                            : Array.isArray(turnEndRandomizeConfig.values)
                            ? turnEndRandomizeConfig.values
                            : [];
                        if (metadataKey && options.length > 0) {
                            const currentValue = status?.metadata?.[metadataKey];
                            const chosenValue = chooseRandomOption(
                                options.filter(
                                    (entry) => !Boolean(turnEndRandomizeConfig.excludeCurrentValue) || entry !== currentValue
                                ),
                                currentValue
                            );
                            status.metadata = {
                                ...(status.metadata || {}),
                                [metadataKey]: chosenValue,
                            };
                            if (
                                typeof status?.metadata?.tooltipTextTemplate === 'string' &&
                                status.metadata.tooltipTextTemplate
                            ) {
                                status.metadata.tooltipText = renderTooltipTemplate(
                                    status.metadata.tooltipTextTemplate,
                                    status.metadata
                                );
                            }
                            const resetDuration = Math.max(
                                1,
                                Number(turnEndRandomizeConfig.resetDuration) || 1
                            );
                            return {
                                ...status,
                                fresh: false,
                                remainingTurns: resetDuration,
                            };
                        }
                    }
                    if (nextRemaining <= 0) {
                        triggerSuperMultiSizeBurst({
                            status,
                            actorState,
                            sourceUsername: username,
                            sourceSlot: unitSlot,
                        });
                        triggerStoredStatusEffects({
                            match,
                            status,
                            targetUnit: unit,
                            targetState: actorState,
                            targetUsername: username,
                            targetSlot: unitSlot,
                            pendingStatuses: pendingExpireStatuses,
                        });
                    }
                    if (nextRemaining <= 0 && status?.metadata?.onExpireApplyStatusToSelf?.statusId) {
                        applyExpireReplacementStatus({
                            pendingExpireStatuses,
                            sourceStatus: status,
                            replacement: status.metadata.onExpireApplyStatusToSelf,
                        });
                    }
                    return { ...status, remainingTurns: nextRemaining };
                })
                .filter((status) => status && (status.remainingTurns || 0) > 0);
            if (pendingExpireStatuses.length > 0) {
                actorState.statuses.push(...pendingExpireStatuses);
            }
            refreshDerivedStatusTooltips(actorState);
        });
        if (username === endingUsername) {
            updateTeamPassiveAwakenings({ match, username, ownerTurnEnded: true });
            units.forEach((unit) => {
                if (!unit) return;
                const actorState = ensureUnitStateShape(unit);
                actorState.snapshots.ownerTurnEndHp = Math.max(0, Number(unit?.hp) || 0);
            });
        }
    });
    Object.entries(match.board || {}).forEach(([username, units]) => (Array.isArray(units) ? units : []).forEach((unit) => {
        if (!unit) return;
        const unitState = ensureUnitStateShape(unit);
        const snapshots = unitState.snapshots;
        if (username === endingUsername) {
            if (unit.alive !== false && !snapshots.tookDamageThisTurn) {
                (Array.isArray(unitState.statuses) ? unitState.statuses : []).forEach((status) => {
                    if (!isStatusActiveForMetadata(status, unit)) return;
                    const key = status?.metadata?.onUndamagedTurnStackMetadataKey;
                    const amount = Math.max(0, Number(status?.metadata?.onUndamagedTurnStackAmount) || 0);
                    if (key && amount > 0) changeStatusMetadataStack(status, key, amount);
                });
            }
            delete snapshots.tookDamageThisTurn;
        }
        delete snapshots.damageTakenInTurn;
        delete snapshots.damageTakenInTurnTriggered;
    }));
    syncLinkedStatuses(match);
};

const applyOnTeamMemberUseSkillBonuses = ({ match, actorState, actingUsername, skill, skillIsMental }) => {
    if (!match || !actorState || !actingUsername || !skill) return;
    const teamUnits = Array.isArray(match.board?.[actingUsername]) ? match.board[actingUsername] : [];
    if (!teamUnits.length) return;
    const costCountCache = new Map();

    const getCountForTypes = (energyTypes = []) => {
        const key = Array.isArray(energyTypes)
            ? energyTypes
                  .map((entry) => (typeof entry === 'string' ? entry.trim().toLowerCase() : ''))
                  .filter(Boolean)
                  .join('|')
            : '';
        if (!key) return 0;
        if (costCountCache.has(key)) return costCountCache.get(key);
        const count = getEffectiveEnergyCostCountForTypes(skill, actorState, energyTypes);
        costCountCache.set(key, count);
        return count;
    };

    teamUnits.forEach((teamUnit, teamSlot) => {
        if (!teamUnit || teamUnit.alive === false) return;
        const teamState = ensureUnitStateShape(teamUnit);
        (Array.isArray(teamState.statuses) ? teamState.statuses : []).forEach((status) => {
            const remaining = Number(status?.remainingTurns) || 0;
            if (remaining <= 0) return;
            const metadata = status?.metadata || {};
            const teamUseSkillClassesAny = Array.isArray(metadata.onTeamMemberUseSkillClassesAny)
                ? metadata.onTeamMemberUseSkillClassesAny
                      .map((entry) => normalizeSkillClassName(entry))
                      .filter(Boolean)
                : [];
            const teamSkillMatchesClassFilter =
                teamUseSkillClassesAny.length === 0 ||
                teamUseSkillClassesAny.some((entry) => hasSkillClass(skill?.classes || [], entry));
            if (!teamSkillMatchesClassFilter) return;

            const onTeamMemberUseSkillApplyStatusToOwner = metadata.onTeamMemberUseSkillApplyStatusToOwner;
            if (onTeamMemberUseSkillApplyStatusToOwner?.statusId) {
                const energyTypes = Array.isArray(onTeamMemberUseSkillApplyStatusToOwner.energyTypes)
                    ? onTeamMemberUseSkillApplyStatusToOwner.energyTypes
                    : chakraTypes;
                const matchCount = getCountForTypes(energyTypes);
                if (matchCount > 0) {
                    const nextMetadata = {
                        ...(onTeamMemberUseSkillApplyStatusToOwner.metadata || {}),
                    };
                    const scaleMetadataKeys = Array.isArray(
                        onTeamMemberUseSkillApplyStatusToOwner.scaleMetadataKeys
                    )
                        ? onTeamMemberUseSkillApplyStatusToOwner.scaleMetadataKeys.filter(
                              (key) => typeof key === 'string' && key
                          )
                        : [];
                    scaleMetadataKeys.forEach((key) => {
                        nextMetadata[key] = (Number(nextMetadata[key]) || 0) * matchCount;
                    });
                    applyStatus({
                        targetState: actorState,
                        statusId: onTeamMemberUseSkillApplyStatusToOwner.statusId,
                        duration: onTeamMemberUseSkillApplyStatusToOwner.duration,
                        sourceSkillId: status?.sourceSkillId || null,
                        sourceUsername: actingUsername || status?.sourceUsername || null,
                        sourceSlot: Number.isInteger(teamSlot)
                            ? teamSlot
                            : Number.isInteger(status?.sourceSlot)
                            ? status.sourceSlot
                            : null,
                        metadata: nextMetadata,
                        fresh: false,
                    });
                }
            }
        });
    });
};

const applyOnEnemyTeamMemberUseSkillBonuses = ({
    match,
    actorState,
    actingUsername,
    actorUnit = null,
    skill,
    skillIsMental,
}) => {
    if (!match || !actorState || !actingUsername || !skill) return;
    const opponent = (match.players || []).find((player) => player?.username && player.username !== actingUsername);
    const opponentUsername = opponent?.username;
    const opponentTeamUnits = opponentUsername ? match.board?.[opponentUsername] || [] : [];
    if (!opponentTeamUnits.length) return;
    opponentTeamUnits.forEach((teamUnit, teamSlot) => {
        if (!teamUnit || teamUnit.alive === false) return;
        const teamState = ensureUnitStateShape(teamUnit);
        (Array.isArray(teamState.statuses) ? teamState.statuses : []).forEach((status) => {
            if (!isStatusActiveForMetadata(status, teamUnit)) return;
            const metadata = status?.metadata || {};
            const applyStatusToTarget = metadata.onEnemyTeamMemberUseSkillApplyStatusToTarget;
            if (!applyStatusToTarget?.statusId) return;
            const classFilter = Array.isArray(metadata.onEnemyTeamMemberUseSkillClassesAny)
                ? metadata.onEnemyTeamMemberUseSkillClassesAny
                      .map((entry) => normalizeSkillClassName(entry))
                      .filter(Boolean)
                : [];
            if (
                classFilter.length > 0 &&
                !classFilter.some((entry) => hasSkillClass(skill?.classes || [], entry))
            ) {
                return;
            }
            applyStatus({
                targetState: actorUnit ? ensureUnitStateShape(actorUnit) : teamState,
                statusId: applyStatusToTarget.statusId,
                duration: applyStatusToTarget.duration,
                sourceSkillId:
                    typeof applyStatusToTarget.sourceSkillId === 'string' && applyStatusToTarget.sourceSkillId
                        ? applyStatusToTarget.sourceSkillId
                        : skill?.id || status?.sourceSkillId || null,
                sourceUsername: opponentUsername || status?.sourceUsername || null,
                sourceSlot: Number.isInteger(teamSlot)
                    ? teamSlot
                    : Number.isInteger(status?.sourceSlot)
                    ? status.sourceSlot
                    : null,
                metadata: applyStatusToTarget.metadata || {},
                fresh: false,
            });
        });
    });
};

const applyOnTeamMemberSuccessfulDamageBonuses = ({
    match,
    actingUsername,
    targetUnit,
    targetUsername,
    targetSlot = null,
    sourceSkillId = null,
    sourceSkillClasses = [],
    sourceSlot = null,
}) => {
    if (!match || !actingUsername || !targetUnit || !targetUsername) return;
    const teamUnits = Array.isArray(match.board?.[actingUsername]) ? match.board[actingUsername] : [];
    if (!teamUnits.length) return;
    const targetState = ensureUnitStateShape(targetUnit);
    teamUnits.forEach((teamUnit, teamSlot) => {
        if (!teamUnit || teamUnit.alive === false) return;
        const teamState = ensureUnitStateShape(teamUnit);
        (Array.isArray(teamState.statuses) ? teamState.statuses : []).forEach((status) => {
            if (!isStatusActiveForMetadata(status, teamUnit)) return;
            const metadata = status?.metadata || {};
            const applyStatusToTarget = metadata.onTeamMemberSuccessfulDamageApplyStatusToTarget;
            if (!applyStatusToTarget?.statusId) return;
            const classFilter = Array.isArray(metadata.onTeamMemberSuccessfulDamageSkillClassesAny)
                ? metadata.onTeamMemberSuccessfulDamageSkillClassesAny
                      .map((entry) => normalizeSkillClassName(entry))
                      .filter(Boolean)
                : [];
            if (
                classFilter.length > 0 &&
                !classFilter.some((entry) => hasSkillClass(sourceSkillClasses, entry))
            ) {
                return;
            }
            applyStatus({
                targetState,
                statusId: applyStatusToTarget.statusId,
                duration: applyStatusToTarget.duration,
                sourceSkillId:
                    typeof applyStatusToTarget.sourceSkillId === 'string' && applyStatusToTarget.sourceSkillId
                        ? applyStatusToTarget.sourceSkillId
                        : sourceSkillId || status?.sourceSkillId || null,
                sourceUsername: status?.sourceUsername || actingUsername || null,
                sourceSlot: Number.isInteger(status?.sourceSlot)
                    ? status.sourceSlot
                    : Number.isInteger(teamSlot)
                    ? teamSlot
                    : null,
                metadata: applyStatusToTarget.metadata || {},
                fresh: false,
            });
        });
    });
};

const applyOnTeamMemberDamageTakenBonuses = ({
    match,
    actingUsername,
    targetUnit,
    targetUsername,
    targetSlot = null,
    sourceSkillId = null,
    sourceSkillClasses = [],
    sourceSlot = null,
    afflictionDamage = false,
}) => {
    if (!match || !actingUsername || !targetUnit || !targetUsername) return;
    const teamUnits = Array.isArray(match.board?.[targetUsername]) ? match.board[targetUsername] : [];
    if (!teamUnits.length) return;
    teamUnits.forEach((teamUnit, teamSlot) => {
        if (!teamUnit || teamUnit.alive === false) return;
        const teamState = ensureUnitStateShape(teamUnit);
        (Array.isArray(teamState.statuses) ? teamState.statuses : []).forEach((status) => {
            if (!isStatusActiveForMetadata(status, teamUnit)) return;
            const metadata = status?.metadata || {};
            const applyStatusToSelf = metadata.onTeamMemberDamageTakenApplyStatusToOwner;
            if (!applyStatusToSelf?.statusId) return;
            if (Boolean(applyStatusToSelf.ownerOnly) && Number(teamSlot) !== Number(targetSlot)) {
                return;
            }
            if (Boolean(applyStatusToSelf.allyOnly) && Number(teamSlot) === Number(targetSlot)) {
                return;
            }
            if (Boolean(applyStatusToSelf.enemyOnly) && actingUsername === targetUsername) return;
            if (afflictionDamage && Boolean(applyStatusToSelf.nonAfflictionOnly)) return;
            const classFilter = Array.isArray(metadata.onTeamMemberDamageTakenSkillClassesAny)
                ? metadata.onTeamMemberDamageTakenSkillClassesAny
                      .map((entry) => normalizeSkillClassName(entry))
                      .filter(Boolean)
                : [];
            if (
                classFilter.length > 0 &&
                !classFilter.some((entry) => hasSkillClass(sourceSkillClasses, entry))
            ) {
                return;
            }
            applyStatus({
                targetState: teamState,
                statusId: applyStatusToSelf.statusId,
                duration: applyStatusToSelf.duration,
                sourceSkillId:
                    typeof applyStatusToSelf.sourceSkillId === 'string' && applyStatusToSelf.sourceSkillId
                        ? applyStatusToSelf.sourceSkillId
                        : sourceSkillId || status?.sourceSkillId || null,
                sourceUsername: targetUsername || status?.sourceUsername || actingUsername || null,
                sourceSlot: Number.isInteger(teamSlot)
                    ? teamSlot
                    : Number.isInteger(status?.sourceSlot)
                    ? status.sourceSlot
                    : Number.isInteger(sourceSlot)
                    ? sourceSlot
                    : null,
                metadata: applyStatusToSelf.metadata || {},
                fresh: false,
            });
        });
    });
};

const applyOnOwnerDamagedByBaseDamageBonuses = ({
    match,
    targetState,
    targetUnit,
    sourceUsername,
    targetUsername,
    sourceSkillId = null,
    sourceSlot = null,
    sourceBaseDamage = 0,
}) => {
    if (!targetState || !targetUnit) return;
    const statuses = Array.isArray(targetState.statuses) ? targetState.statuses : [];
    statuses.forEach((status) => {
        if (!isStatusActiveForMetadata(status, targetUnit)) return;
        const metadata = status?.metadata || {};
        const trigger = metadata.onOwnerDamagedByBaseDamageAtLeastApplyStatusToOwner;
        if (!trigger?.statusId) return;
        if (Boolean(trigger.enemyOnly) && sourceUsername === targetUsername) return;
        const threshold = Math.max(0, Number(trigger.threshold) || 0);
        if (Math.max(0, Number(sourceBaseDamage) || 0) < threshold) return;
        if (Boolean(trigger.oncePerSourceSkillPerTurn) && sourceSkillId && targetState?.snapshots) {
            const turnCount = Math.max(0, Number(match?.economy?.turnCounts?.[sourceUsername || '']) || 0);
            const key = [
                targetUsername || '',
                sourceUsername || '',
                Number.isInteger(sourceSlot) ? sourceSlot : '',
                sourceSkillId,
                turnCount,
                status?.id || '',
            ].join('|');
            if (targetState.snapshots._ownerDamageThresholdTriggerKey === key) return;
            targetState.snapshots._ownerDamageThresholdTriggerKey = key;
        }
        applyStatus({
            targetState,
            statusId: trigger.statusId,
            duration: trigger.duration,
            sourceSkillId: sourceSkillId || status?.sourceSkillId || null,
            sourceUsername: sourceUsername || null,
            sourceSlot: Number.isInteger(sourceSlot) ? sourceSlot : null,
            metadata: trigger.metadata || {},
            fresh: false,
        });
    });
};

const applyTriggeredEffectsFromStatus = ({
    effects,
    match,
    status,
    targetUnit,
    targetState,
    targetUsername,
    targetSlot,
    pendingStatuses = null,
}) => {
    if (!Array.isArray(effects) || !effects.length || !targetUnit || !targetState) return;
    const mitigationBudgetKey = `${targetUsername || ''}:${Number.isInteger(targetSlot) ? targetSlot : ''}`;
    effects.forEach((effect) => {
        if (!effect || typeof effect !== 'object') return;
        const condition = effect?.condition;
        if (
            condition &&
            !doesEffectConditionMatch({
                condition,
                actorState: targetState,
                targetState,
                actorUnit: targetUnit,
                targetUnit,
                actorUsername: targetUsername,
                targetUsername,
            })
        ) {
            return;
        }
        if (effect.type === 'damage' || effect.type === 'health_steal_damage') {
            const isHealthStealDamage = effect.type === 'health_steal_damage';
            const amount = Math.max(0, Number(effect?.amount) || 0);
            if (amount <= 0) return;
            const sourceUsername = status?.sourceUsername || null;
            const sourceSlot = Number.isInteger(status?.sourceSlot) ? status.sourceSlot : null;
            const sourceUnit =
                isHealthStealDamage &&
                match &&
                sourceUsername &&
                Number.isInteger(sourceSlot) &&
                Array.isArray(match.board?.[sourceUsername])
                    ? match.board[sourceUsername][sourceSlot]
                    : null;
            if (isHealthStealDamage && sourceUnit) {
                applyHealthStealToUnit({
                    targetUnit,
                    sourceUnit,
                    rawAmount: amount,
                    context: {
                        match,
                        sourceSkillId: status?.sourceSkillId || null,
                        sourceUsername,
                        sourceSlot,
                        targetUsername,
                        targetSlot,
                        afflictionDamage: Boolean(effect?.metadata?.afflictionDamage),
                        skillClasses: Array.isArray(effect?.metadata?.skillClasses)
                            ? effect.metadata.skillClasses
                            : [],
                        damageDebugReason: 'status effect',
                        ignoreDestructibleDefense: Boolean(effect?.metadata?.ignoreDestructibleDefense),
                        unpierceableBudgetMap: new Map(),
                        unpierceableBudgetKey: mitigationBudgetKey,
                        standardMitigationBudgetMap: new Map(),
                        standardMitigationBudgetKey: mitigationBudgetKey,
                        percentMitigationStateMap: new Map(),
                        percentMitigationStateKey: mitigationBudgetKey,
                    },
                });
            } else {
                applyDamageToUnit(targetUnit, amount, {
                    match,
                    sourceSkillId: status?.sourceSkillId || null,
                    sourceUsername,
                    sourceSlot,
                    targetUsername,
                    afflictionDamage: Boolean(effect?.metadata?.afflictionDamage),
                    skillClasses: Array.isArray(effect?.metadata?.skillClasses) ? effect.metadata.skillClasses : [],
                    damageDebugReason: 'status effect',
                    ignoreDamageReduction: Boolean(effect?.metadata?.ignoreDamageReduction),
                    ignoreDestructibleDefense: Boolean(effect?.metadata?.ignoreDestructibleDefense),
                    unpierceableBudgetMap: new Map(),
                    unpierceableBudgetKey: mitigationBudgetKey,
                    standardMitigationBudgetMap: new Map(),
                    standardMitigationBudgetKey: mitigationBudgetKey,
                    percentMitigationStateMap: new Map(),
                    percentMitigationStateKey: mitigationBudgetKey,
                });
            }
            return;
        }
        if (effect.type === 'apply_status' && effect.statusId) {
            const effectMetadata = effect.metadata || {};
            const appliesStun = Boolean(effectMetadata.cannotUseSkills) ||
                Boolean(effectMetadata.cannotUseHarmfulSkills) ||
                Boolean(effectMetadata.cannotUseNonMentalSkills) ||
                (Array.isArray(effectMetadata.cannotUseSkillClasses) &&
                    effectMetadata.cannotUseSkillClasses.length > 0) ||
                (Array.isArray(effectMetadata.cannotUseSkillIndices) &&
                    effectMetadata.cannotUseSkillIndices.length > 0);
            if (appliesStun && hasStatusMetadataFlag(targetState, 'cannotBeStunned') &&
                !effectMetadata.cannotIgnoreStuns &&
                !hasStatusMetadataFlag(targetState, 'cannotIgnoreStuns')) {
                applyStatus({
                    targetState, statusId: 'stun_ignored_notification',
                    duration: effect.duration, sourceSkillId: status?.sourceSkillId || null,
                    sourceUsername: status?.sourceUsername || null,
                    sourceSlot: Number.isInteger(status?.sourceSlot) ? status.sourceSlot : null,
                    metadata: { harmful: true, tooltipText: effectMetadata.tooltipText || 'This character is stunned.' },
                    fresh: Boolean(effect.fresh),
                });
                return;
            }
            if (effect.scope === 'all-allies' && match && status?.sourceUsername) {
                const teamUnits = Array.isArray(match.board?.[status.sourceUsername])
                    ? match.board[status.sourceUsername]
                    : [];
                teamUnits.forEach((teamUnit) => {
                    if (!teamUnit || teamUnit.alive === false) return;
                    applyStatus({
                        targetState: ensureUnitStateShape(teamUnit),
                        statusId: effect.statusId,
                        duration: effect.duration,
                        sourceSkillId: status?.sourceSkillId || null,
                        sourceUsername: status?.sourceUsername || null,
                        sourceSlot: Number.isInteger(status?.sourceSlot) ? status.sourceSlot : null,
                        metadata: effect.metadata || {},
                        fresh: false,
                    });
                });
                return;
            }
            applyStatus({
                targetState: Array.isArray(pendingStatuses) ? { statuses: pendingStatuses } : targetState,
                statusId: effect.statusId,
                duration: effect.duration,
                sourceSkillId: status?.sourceSkillId || null,
                sourceUsername: status?.sourceUsername || null,
                sourceSlot: Number.isInteger(status?.sourceSlot) ? status.sourceSlot : null,
                metadata: effect.metadata || {},
                fresh: Boolean(effect.fresh),
            });
            if (!Array.isArray(pendingStatuses)) {
                applyPassiveStunDamage({
                    match, sourceUsername: status?.sourceUsername || null,
                    sourceSlot: Number.isInteger(status?.sourceSlot) ? status.sourceSlot : null,
                    sourceSkillId: status?.sourceSkillId || null,
                    targetUnit, targetUsername, targetSlot, statusId: effect.statusId,
                });
            }
            return;
        }
        if (effect.type === 'gain_chakra') {
            const amount = Math.max(0, Number(effect?.amount) || 0);
            if (amount <= 0 || !targetUsername) return;
            const rawType = typeof effect?.chakraType === 'string' ? effect.chakraType.trim().toLowerCase() : '';
            if (rawType === 'random') {
                for (let i = 0; i < amount; i += 1) {
                    const pick = chakraTypes[Math.floor(Math.random() * chakraTypes.length)];
                    applyChakraGainToMatch({
                        match,
                        username: targetUsername,
                        chakraType: pick,
                        amount: 1,
                    });
                }
                return;
            }
            applyChakraGainToMatch({
                match,
                username: targetUsername,
                chakraType: rawType,
                amount,
            });
            return;
        }
        if (effect.type === 'cleanse_statuses') {
            const maxCountRaw = Number(effect?.count);
            const maxCount = Number.isFinite(maxCountRaw) && maxCountRaw >= 0 ? Math.floor(maxCountRaw) : 0;
            const removeAll = maxCount <= 0;
        const sourceRelation =
            typeof effect?.sourceRelation === 'string' ? effect.sourceRelation.trim().toLowerCase() : 'any';
        const exactStatusIds = [
            ...(typeof effect?.statusId === 'string' && effect.statusId ? [effect.statusId] : []),
            ...(Array.isArray(effect?.statusIdsAny)
                ? effect.statusIdsAny.filter((entry) => typeof entry === 'string' && entry)
                : []),
        ];
        const metadataAny = Array.isArray(effect?.metadataAny)
            ? effect.metadataAny.filter((entry) => typeof entry === 'string' && entry)
            : [];
            targetState.statuses = (Array.isArray(targetState.statuses) ? targetState.statuses : []).filter((entry) => {
                if (!entry || (Number(entry?.remainingTurns) || 0) <= 0) return true;
                if (!removeAll && maxCount > 0) {
                    // handled by removed counter below
                }
                if (Boolean(entry?.metadata?.cannotBeCleansed)) return true;
                const sourceUsername = entry?.sourceUsername || '';
                const fromEnemy =
                    Boolean(sourceUsername) && Boolean(targetUsername) && sourceUsername !== targetUsername;
                const fromAlly =
                    Boolean(sourceUsername) && Boolean(targetUsername) && sourceUsername === targetUsername;
                if (sourceRelation === 'enemy' && !fromEnemy) return true;
                if (sourceRelation === 'ally' && !fromAlly) return true;
                if (exactStatusIds.length > 0 && !exactStatusIds.includes(entry?.id)) return true;
                if (Boolean(effect?.harmfulOnly) && !Boolean(entry?.metadata?.harmful)) return true;
                if (metadataAny.length > 0) {
                    const hasAny = metadataAny.some((key) => Boolean(entry?.metadata?.[key]));
                    if (!hasAny) return true;
                }
                if (!removeAll) {
                    effect._removedCount = Math.max(0, Number(effect._removedCount) || 0);
                    if (effect._removedCount >= maxCount) return true;
                    effect._removedCount += 1;
                }
                return false;
            });
            refreshDerivedStatusTooltips(targetState);
        }
    });
};

const getAliveEnemyRecipients = ({ match, username }) => {
    if (!match || !username) return [];
    return (match.players || [])
        .filter((player) => player?.username && player.username !== username)
        .flatMap((player) => {
            const enemyUsername = player.username;
            const enemyUnits = Array.isArray(match.board?.[enemyUsername]) ? match.board[enemyUsername] : [];
            return enemyUnits
                .map((enemyUnit, enemySlot) => ({
                    unit: enemyUnit,
                    slot: enemySlot,
                    username: enemyUsername,
                }))
                .filter((entry) => entry?.unit && entry.unit.alive !== false && !isUnitBanished(entry.unit));
        });
};

const applyTriggeredEffectsToRecipients = ({
    effects,
    match,
    status,
    recipients,
    pendingStatuses = null,
}) => {
    if (!Array.isArray(effects) || !effects.length || !Array.isArray(recipients) || !recipients.length) return;
    recipients.forEach((recipient) => {
        if (!recipient?.unit || recipient.unit.alive === false) return;
        const targetState = ensureUnitStateShape(recipient.unit);
        applyTriggeredEffectsFromStatus({
            effects,
            match,
            status,
            targetUnit: recipient.unit,
            targetState,
            targetUsername: recipient.username || null,
            targetSlot: Number.isInteger(recipient.slot) ? recipient.slot : null,
            pendingStatuses,
        });
    });
};

const swapBoardPositions = ({ match, unitA, unitB }) => {
    if (!match || !unitA || !unitB || unitA === unitB) return;
    const usernameA = unitA.username || null;
    const usernameB = unitB.username || null;
    const slotA = Number.isInteger(unitA.slot) ? unitA.slot : null;
    const slotB = Number.isInteger(unitB.slot) ? unitB.slot : null;
    if (!usernameA || !usernameB || slotA === null || slotB === null) return;
    const boardA = Array.isArray(match.board?.[usernameA]) ? match.board[usernameA] : null;
    const boardB = Array.isArray(match.board?.[usernameB]) ? match.board[usernameB] : null;
    if (!boardA || !boardB) return;
    const sameBoard = usernameA === usernameB;
    if (sameBoard) {
        const temp = boardA[slotA];
        boardA[slotA] = boardA[slotB];
        boardA[slotB] = temp;
        if (boardA[slotA]) boardA[slotA].slot = slotA;
        if (boardA[slotB]) boardA[slotB].slot = slotB;
    } else {
        const temp = boardA[slotA];
        boardA[slotA] = boardB[slotB];
        boardB[slotB] = temp;
        if (boardA[slotA]) boardA[slotA].slot = slotA;
        if (boardB[slotB]) boardB[slotB].slot = slotB;
    }
    const nextSlotA = slotB;
    const nextSlotB = slotA;
    if (unitA) unitA.slot = nextSlotA;
    if (unitB) unitB.slot = nextSlotB;
};

const triggerStoredStatusEffects = ({
    match,
    status,
    targetUnit,
    targetState,
    targetUsername,
    targetSlot,
    pendingStatuses = null,
}) => {
    if (!status || !match || !targetUnit || !targetState) return;
    const selfEffects = Array.isArray(status?.metadata?.onExpireEffects) ? status.metadata.onExpireEffects : [];
    if (selfEffects.length > 0) {
        applyTriggeredEffectsFromStatus({
            effects: selfEffects,
            match,
            status,
            targetUnit,
            targetState,
            targetUsername,
            targetSlot,
            pendingStatuses,
        });
    }
    const enemyTeamEffects = Array.isArray(status?.metadata?.onExpireEffectsToEnemiesOfSource)
        ? status.metadata.onExpireEffectsToEnemiesOfSource
        : [];
    if (enemyTeamEffects.length > 0 && status?.sourceUsername) {
        applyTriggeredEffectsToRecipients({
            effects: enemyTeamEffects,
            match,
            status,
            recipients: getAliveEnemyRecipients({
                match,
                username: status.sourceUsername,
            }),
            pendingStatuses,
        });
    }
    const inactionEffects = Array.isArray(status?.metadata?.onExpireEffectsIfNoNewSkillUsed)
        ? status.metadata.onExpireEffectsIfNoNewSkillUsed
        : [];
    if (inactionEffects.length > 0) {
        const snapshot = Number(status?.metadata?.skillUseCountSnapshot) || 0;
        const currentCount = Number(targetState?.totalSkillUseCount) || 0;
        if (currentCount <= snapshot) {
            applyTriggeredEffectsFromStatus({
                effects: inactionEffects,
                match,
                status,
                targetUnit,
                targetState,
                targetUsername,
                targetSlot,
                pendingStatuses,
            });
        }
    }
};

const applyOnOwnerSkillCooldownFinishedBonuses = ({
    match,
    ownerUsername,
    ownerSlot,
    ownerUnit,
    finishedSkillId,
}) => {
    if (!match || !ownerUsername || !ownerUnit || !finishedSkillId) return;
    const ownerState = ensureUnitStateShape(ownerUnit);
    (Array.isArray(ownerState.statuses) ? ownerState.statuses : []).forEach((status) => {
        if (!isStatusActiveForMetadata(status, ownerUnit)) return;
        const config = status?.metadata?.onOwnerSkillCooldownFinishedApplyStatusToRandomEnemy;
        if (!config?.statusId) return;
        const restrictedSkillIds = Array.isArray(config.skillIds)
            ? config.skillIds.filter((entry) => typeof entry === 'string' && entry)
            : [];
        if (restrictedSkillIds.length > 0 && !restrictedSkillIds.includes(finishedSkillId)) return;
        const chancePercent = Number(config.chancePercent);
        if (Number.isFinite(chancePercent) && chancePercent >= 0 && chancePercent < 100) {
            if (!rollPercentSuccess(chancePercent)) return;
        }
        const aliveEnemies = getAliveEnemyRecipients({
            match,
            username: ownerUsername,
        });
        if (!aliveEnemies.length) return;
        const picked = pickRandomEntry(aliveEnemies);
        if (!picked?.unit) return;
        const pickedState = ensureUnitStateShape(picked.unit);
        applyStatus({
            targetState: pickedState,
            statusId: config.statusId,
            duration: config.duration,
            sourceSkillId:
                typeof config.sourceSkillId === 'string' && config.sourceSkillId
                    ? config.sourceSkillId
                    : status?.sourceSkillId || null,
            sourceUsername: ownerUsername,
            sourceSlot: Number.isInteger(ownerSlot)
                ? ownerSlot
                : Number.isInteger(status?.sourceSlot)
                ? status.sourceSlot
                : null,
            metadata: config.metadata || {},
            fresh: false,
        });
    });
};

const getTurnEndExtraCooldownTicksForSkill = (actorState, skillId) => {
    if (!skillId) return 0;
    const statuses = Array.isArray(actorState?.statuses) ? actorState.statuses : [];
    return statuses.reduce((sum, status) => {
        const remaining = Number(status?.remainingTurns) || 0;
        if (remaining <= 0) return sum;
        const metadata = status?.metadata || {};
        const allSkills = Math.max(0, Number(metadata?.ownerTurnEndExtraCooldownTicksAllSkills) || 0);
        const bySkillId =
            metadata?.ownerTurnEndExtraCooldownTicksBySkillId &&
            typeof metadata.ownerTurnEndExtraCooldownTicksBySkillId === 'object'
                ? Math.max(0, Number(metadata.ownerTurnEndExtraCooldownTicksBySkillId[skillId]) || 0)
                : 0;
        return sum + allSkills + bySkillId;
    }, 0);
};

const tickCooldownsForTurnEnd = ({ match, endingUsername }) => {
    if (!match || !endingUsername) return;
    const units = match.board?.[endingUsername] || [];
    units.forEach((unit, unitSlot) => {
        const actorState = ensureUnitStateShape(unit);
        const startedThisTurn =
            actorState._cooldownsStartedThisTurn && typeof actorState._cooldownsStartedThisTurn === 'object'
                ? actorState._cooldownsStartedThisTurn
                : {};
        const freezeActive = hasStatusMetadataFlag(actorState, 'freezeCooldowns');
        if (hasStatusMetadataFlag(actorState, 'freezeCooldowns')) {
            const cooldowns =
                actorState.cooldowns && typeof actorState.cooldowns === 'object' ? actorState.cooldowns : {};
            Object.keys(cooldowns).forEach((skillId) => {
                if (!startedThisTurn[skillId]) return;
                const current = Math.max(0, Number(cooldowns[skillId]) || 0);
                const next = Math.max(0, current - 1);
                if (next <= 0) {
                    delete cooldowns[skillId];
                    if (current > 0) {
                        applyOnOwnerSkillCooldownFinishedBonuses({
                            match,
                            ownerUsername: endingUsername,
                            ownerSlot: unitSlot,
                            ownerUnit: unit,
                            finishedSkillId: skillId,
                        });
                    }
                } else {
                    cooldowns[skillId] = next;
                }
            });
            actorState.cooldowns = cooldowns;
            actorState._cooldownsStartedThisTurn = {};
            return;
        }
        const cooldowns =
            actorState.cooldowns && typeof actorState.cooldowns === 'object' ? actorState.cooldowns : {};
        Object.keys(cooldowns).forEach((skillId) => {
            const current = Math.max(0, Number(cooldowns[skillId]) || 0);
            const extraTicks = getTurnEndExtraCooldownTicksForSkill(actorState, skillId);
            const next = Math.max(0, current - 1 - extraTicks);
            if (next <= 0) {
                delete cooldowns[skillId];
                if (current > 0) {
                    applyOnOwnerSkillCooldownFinishedBonuses({
                        match,
                        ownerUsername: endingUsername,
                        ownerSlot: unitSlot,
                        ownerUnit: unit,
                        finishedSkillId: skillId,
                    });
                }
            } else {
                cooldowns[skillId] = next;
            }
        });
        actorState.cooldowns = cooldowns;
        if (!freezeActive) {
            actorState._cooldownsStartedThisTurn = {};
        }
    });
};

const METADATA_REGISTRY = {
    adaptivePaintingActive: true,
    afflictionDamagePerTurn: true,
    cannotBeIgnored: true,
    cannotBeKilled: true,
    cannotBeRemoved: true,
    clayMoldExtraDefense: true,
    consumeChargeStatusId: true,
    consumeStackOnSkillUseExceptInvul: true,
    cooldownIncrease: true,
    cooldownReduction: true,
    damageDealtFlatModifier: true,
    damageOnHarmfulSkillUsePiercing: true,
    damageOnSkillUseAffliction: true,
    damageOnSkillUsePiercing: true,
    damagePerTurn: true,
    damageReductionUnpierceableFlat: true,
    damageTakenFromSkillClassModifiers: true,
    damageToTargetingEnemiesPiercing: true,
    destructibleDefensePermanent: true,
    destructibleDefensePointsPerTurn: true,
    durationPerChargeBonus: true,
    enemySkillCooldownIncreaseOnUse: true,
    energyCostIncrease: true,
    energyDrainResistance: true,
    ignoreCounters: true,
    ignoreHarmfulNonDamageEffects: true,
    ignoreHelpfulNonEnergyEffects: true,
    ignoreReflects: true,
    immuneToEnergyDrain: true,
    immuneToNonConditionalAfflictionDamage: true,
    immuneToStun: true,
    invulnerableToAfflictionSkills: true,
    invulnerableToEnemyDamage: true,
    invulnerableToEnergySkills: true,
    invulnerableToFriendlySkills: true,
    invulnerableToHarmfulSkills: true,
    invulnerableToMentalSkills: true,
    invulnerableToNonStrategicSkills: true,
    invulnerableToPhysicalSkills: true,
    maxStacks: true,
    onApplyGainChakra: true,
    onExpireIfUnusedEffects: true,
    reflectOnEnemyHarmfulNonMental: true,
    retaliateOnIncomingHarmfulPhysicalDamage: true,
    revealInvisibleSkills: true,
    skillClassDamageDealtModifiers: true,
    skillCooldownOverridesBySkillId: true,
    stackable: true,
    stunDurationReduction: true,
};

module.exports = {
    DEFAULT_HP,
    buildInitialBoard,
    getSkillTargetType,
    resolveEffectiveSkill,
    computeTargetOptions,
    validateTargetSelection,
    resolvePendingTurnSkills,
    computeEffectiveEnergyCost,
    getLivingTeamPassiveChakraCount,
    tickStatusesForTurnEnd,
    tickCooldownsForTurnEnd,
    getSkillCooldownRemaining,
    isSkillIndexBlockedForActor,
    isActorUnableToUseSkills,
    isUnitInvulnerableForSkill,
    doesSkillIgnoreInvulnerability,
    getUnitState,
    applyHealToUnit,
    cleanseHarmfulStatuses,
    reviveUnitToHp,
    applyDamageToUnit,
    applyStatus,
    purgeTetheredStatusesOnSourceDeath,
    selectTurnStartChoiceTarget,
    queueTurnStartChoicePrompts,
};
