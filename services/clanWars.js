// Clan war state. Every function here takes a war document and returns the
// next one (or throws a WarError), with no database access, so the rules can
// be tested directly. Combat stays in battleLogic.js; a war only decides who
// may fight, with which teams, and what each finished battle means for the
// score.
//
// Vocabulary: a battle is one game, a set is a best-of-3 or best-of-5 series
// between two players, and the war is decided by sets won.

const { normalizeWarRuleset } = require('./warRules');

const SIDES = ['challenger', 'defender'];
const BEST_OF_OPTIONS = [3, 5];
const REPEAT_OPPONENT_OPTIONS = ['allowed', 'once'];
const PROPOSAL_RESPONSE_MS = 72 * 60 * 60 * 1000;
const MIN_DURATION_HOURS = 24;
const MAX_DURATION_HOURS = 14 * 24;
const MAX_WIN_TARGET = 25;
const MAX_SETS_PER_MEMBER = 10;
const OPEN_SET_STATUSES = ['pending', 'active'];

const DEFAULT_TERMS = {
    bestOf: 3,
    winTarget: 5,
    maxSetsPerMember: 3,
    repeatOpponents: 'once',
    durationHours: 72,
};

// Placeholder amounts; tune once war numbers are decided.
const WAR_REWARDS = {
    setParticipationRyo: 50,
    setWinRyo: 50,
    warWinRyo: 150,
    clanWarWinExp: 300,
    clanSetWinExp: 30,
};

class WarError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

const otherSide = (side) => (side === 'challenger' ? 'defender' : 'challenger');
const sameName = (left, right) =>
    typeof left === 'string' && typeof right === 'string' && left.trim().toLowerCase() === right.trim().toLowerCase();
const clone = (value) => JSON.parse(JSON.stringify(value));
const toTime = (value) => new Date(value).getTime();

const normalizeIntegerTerm = (value, fallback, min, max, label, strict) => {
    if (value === undefined || value === null || value === '') return fallback;
    const number = Number(value);
    if (!Number.isInteger(number) || number < min || number > max) {
        if (strict) throw new WarError(400, `${label} must be a whole number from ${min} to ${max}.`);
        return fallback;
    }
    return number;
};

const normalizeWarTerms = (input, { strict = false } = {}) => {
    const source = input && typeof input === 'object' ? input : {};
    let ruleset;
    try {
        ruleset = normalizeWarRuleset(source.ruleset, { strict });
    } catch (error) {
        throw new WarError(400, error.message);
    }

    let bestOf = Number(source.bestOf ?? DEFAULT_TERMS.bestOf);
    if (!BEST_OF_OPTIONS.includes(bestOf)) {
        if (strict) throw new WarError(400, 'Sets must be best of 3 or best of 5.');
        bestOf = DEFAULT_TERMS.bestOf;
    }

    let repeatOpponents = source.repeatOpponents ?? DEFAULT_TERMS.repeatOpponents;
    if (!REPEAT_OPPONENT_OPTIONS.includes(repeatOpponents)) {
        if (strict) throw new WarError(400, 'Repeat opponents must be "allowed" or "once".');
        repeatOpponents = DEFAULT_TERMS.repeatOpponents;
    }

    return {
        ruleset,
        bestOf,
        repeatOpponents,
        winTarget: normalizeIntegerTerm(source.winTarget, DEFAULT_TERMS.winTarget, 1, MAX_WIN_TARGET, 'Sets needed to win', strict),
        maxSetsPerMember: normalizeIntegerTerm(
            source.maxSetsPerMember,
            DEFAULT_TERMS.maxSetsPerMember,
            1,
            MAX_SETS_PER_MEMBER,
            'Sets per member',
            strict
        ),
        durationHours: normalizeIntegerTerm(
            source.durationHours,
            DEFAULT_TERMS.durationHours,
            MIN_DURATION_HOURS,
            MAX_DURATION_HOURS,
            'War length in hours',
            strict
        ),
    };
};

const setWinsNeeded = (bestOf) => Math.floor(bestOf / 2) + 1;

const sideOfClan = (war, clanKey) => SIDES.find((side) => war?.[side]?.clanKey === clanKey) || null;

const findSet = (war, setId) => {
    const set = (war.sets || []).find((entry) => entry.setId === setId);
    if (!set) throw new WarError(404, 'Set not found.');
    return set;
};

const sideOfPlayerInSet = (set, username) => {
    if (sameName(set.players.challenger, username)) return 'challenger';
    if (sameName(set.players.defender, username)) return 'defender';
    return null;
};

const assertStatus = (war, status, message) => {
    if (war.status !== status) throw new WarError(409, message);
};

const createWarProposal = ({ warId, challenger, defender, proposedBy, terms, now }) => {
    if (!challenger?.clanKey || !defender?.clanKey) {
        throw new WarError(400, 'Both clans are required.');
    }
    if (challenger.clanKey === defender.clanKey) {
        throw new WarError(400, 'A clan cannot declare war on itself.');
    }
    const normalizedTerms = normalizeWarTerms(terms, { strict: true });
    return {
        warId,
        status: 'proposed',
        challenger: { clanKey: challenger.clanKey, name: challenger.name, abbreviation: challenger.abbreviation || '' },
        defender: { clanKey: defender.clanKey, name: defender.name, abbreviation: defender.abbreviation || '' },
        terms: normalizedTerms,
        awaitingSide: 'defender',
        proposals: [{ side: 'challenger', by: proposedBy, at: new Date(now), terms: normalizedTerms }],
        respondBy: new Date(toTime(now) + PROPOSAL_RESPONSE_MS),
        createdAt: new Date(now),
        acceptedAt: null,
        endsAt: null,
        archetypeSnapshot: null,
        rosters: { challenger: [], defender: [] },
        sets: [],
        score: { challenger: 0, defender: 0 },
        result: null,
        rewards: null,
        revision: 0,
    };
};

// Accept, decline, or counter-propose. Only the side the proposal is waiting
// on may respond; a counter-proposal hands the decision back to the other side.
const respondToProposal = (war, { side, by, action, terms, now, archetypeSnapshot }) => {
    assertStatus(war, 'proposed', 'This war is no longer open for negotiation.');
    if (side !== war.awaitingSide) {
        throw new WarError(403, 'Waiting for the other clan to respond.');
    }
    const next = clone(war);
    if (action === 'decline') {
        next.status = 'declined';
        next.result = { winnerSide: null, reason: 'declined', at: new Date(now) };
        return next;
    }
    if (action === 'counter') {
        const normalizedTerms = normalizeWarTerms(terms, { strict: true });
        next.terms = normalizedTerms;
        next.proposals.push({ side, by, at: new Date(now), terms: normalizedTerms });
        next.awaitingSide = otherSide(side);
        next.respondBy = new Date(toTime(now) + PROPOSAL_RESPONSE_MS);
        return next;
    }
    if (action !== 'accept') {
        throw new WarError(400, 'Choose accept, decline, or counter.');
    }
    if (!archetypeSnapshot) {
        throw new WarError(500, 'Character types are unavailable.');
    }
    // The archetype snapshot locks character types for the life of the war,
    // so a balance patch cannot change the rules both clans accepted.
    next.status = 'active';
    next.awaitingSide = null;
    next.acceptedAt = new Date(now);
    next.endsAt = new Date(toTime(now) + next.terms.durationHours * 60 * 60 * 1000);
    next.archetypeSnapshot = archetypeSnapshot;
    return next;
};

const withdrawProposal = (war, { side, now }) => {
    assertStatus(war, 'proposed', 'Only a pending proposal can be withdrawn.');
    if (side !== otherSide(war.awaitingSide)) {
        throw new WarError(403, 'Only the clan that made the latest proposal can withdraw it.');
    }
    const next = clone(war);
    next.status = 'cancelled';
    next.result = { winnerSide: null, reason: 'withdrawn', at: new Date(now) };
    return next;
};

const completeWar = (war, winnerSide, reason, now) => {
    war.status = 'completed';
    war.result = { winnerSide, reason, at: new Date(now) };
    for (const set of war.sets) {
        if (set.status === 'pending') set.status = 'cancelled';
        if (set.status === 'active') set.status = 'void';
    }
    war.rewards = calculateWarRewards(war);
};

const checkWinTarget = (war, now) => {
    for (const side of SIDES) {
        if (war.score[side] >= war.terms.winTarget) {
            completeWar(war, side, 'target', now);
            return;
        }
    }
};

// Expires unanswered proposals and resolves wars past their deadline: the
// clan with more sets won takes the war, and an equal count is a draw. Sets
// still in progress at the deadline do not count.
const applyTimeouts = (war, now) => {
    if (war.status === 'proposed' && toTime(now) >= toTime(war.respondBy)) {
        const next = clone(war);
        next.status = 'expired';
        next.result = { winnerSide: null, reason: 'expired', at: new Date(now) };
        return { war: next, changed: true };
    }
    if (war.status === 'active' && toTime(now) >= toTime(war.endsAt)) {
        const next = clone(war);
        const { challenger, defender } = next.score;
        const winnerSide = challenger === defender ? null : challenger > defender ? 'challenger' : 'defender';
        completeWar(next, winnerSide, 'deadline', now);
        return { war: next, changed: true };
    }
    return { war, changed: false };
};

const surrenderWar = (war, { side, now }) => {
    assertStatus(war, 'active', 'Only an active war can be surrendered.');
    const next = clone(war);
    completeWar(next, otherSide(side), 'surrender', now);
    next.result.surrenderedBy = side;
    return next;
};

const joinRoster = (war, { side, username }) => {
    if (!['proposed', 'active'].includes(war.status)) {
        throw new WarError(409, 'This war is over.');
    }
    if (war.rosters[side].some((entry) => sameName(entry, username))) {
        throw new WarError(409, 'You are already on the war roster.');
    }
    const next = clone(war);
    next.rosters[side].push(username);
    return next;
};

const removeFromRoster = (war, { side, username }) => {
    if (!war.rosters[side].some((entry) => sameName(entry, username))) {
        throw new WarError(404, 'That player is not on the war roster.');
    }
    const hasOpenSet = war.sets.some(
        (set) => OPEN_SET_STATUSES.includes(set.status) && sameName(set.players[side], username)
    );
    if (hasOpenSet) {
        throw new WarError(409, 'Finish or forfeit the open set before leaving the roster.');
    }
    const next = clone(war);
    next.rosters[side] = next.rosters[side].filter((entry) => !sameName(entry, username));
    return next;
};

const countsTowardMemberCap = (set) => set.status !== 'declined' && set.status !== 'cancelled';

// Open Challenge: any rostered member may challenge any rostered member of the
// other clan, within the per-member set cap and repeat-opponent rule.
const createChallenge = (war, { side, username, opponent, setId, now }) => {
    assertStatus(war, 'active', 'Challenges can only be issued during an active war.');
    const opposing = otherSide(side);
    const challenger = war.rosters[side].find((entry) => sameName(entry, username));
    if (!challenger) throw new WarError(403, 'Join the war roster before issuing a challenge.');
    const target = war.rosters[opposing].find((entry) => sameName(entry, opponent));
    if (!target) throw new WarError(404, 'That player is not on the enemy war roster.');

    for (const [name, playerSide] of [[challenger, side], [target, opposing]]) {
        const sets = war.sets.filter((set) => sameName(set.players[playerSide], name));
        if (sets.some((set) => OPEN_SET_STATUSES.includes(set.status))) {
            throw new WarError(409, `${name} already has an open set in this war.`);
        }
        if (sets.filter(countsTowardMemberCap).length >= war.terms.maxSetsPerMember) {
            throw new WarError(409, `${name} has already played the maximum ${war.terms.maxSetsPerMember} sets in this war.`);
        }
    }

    if (war.terms.repeatOpponents === 'once') {
        const alreadyPlayed = war.sets.some(
            (set) =>
                set.status === 'completed' &&
                sameName(set.players[side], challenger) &&
                sameName(set.players[opposing], target)
        );
        if (alreadyPlayed) throw new WarError(409, `You have already played a set against ${target} in this war.`);
    }

    const next = clone(war);
    next.sets.push({
        setId,
        status: 'pending',
        challengedBy: side,
        players: { [side]: challenger, [opposing]: target },
        createdAt: new Date(now),
        startedAt: null,
        completedAt: null,
        battles: [],
        score: { challenger: 0, defender: 0 },
        winnerSide: null,
        forfeitedBy: null,
    });
    return next;
};

const respondToChallenge = (war, { setId, username, accept, now }) => {
    assertStatus(war, 'active', 'This war is over.');
    const set = findSet(war, setId);
    if (set.status !== 'pending') throw new WarError(409, 'This challenge is no longer pending.');
    const playerSide = sideOfPlayerInSet(set, username);
    if (!playerSide || playerSide === set.challengedBy) {
        throw new WarError(403, 'Only the challenged player can respond.');
    }
    const next = clone(war);
    const nextSet = findSet(next, setId);
    nextSet.status = accept ? 'active' : 'declined';
    if (accept) nextSet.startedAt = new Date(now);
    return next;
};

const cancelChallenge = (war, { setId, username }) => {
    const set = findSet(war, setId);
    if (set.status !== 'pending') throw new WarError(409, 'This challenge is no longer pending.');
    if (sideOfPlayerInSet(set, username) !== set.challengedBy) {
        throw new WarError(403, 'Only the player who issued the challenge can cancel it.');
    }
    const next = clone(war);
    findSet(next, setId).status = 'cancelled';
    return next;
};

const finishSet = (war, set, winnerSide, now) => {
    set.status = 'completed';
    set.winnerSide = winnerSide;
    set.completedAt = new Date(now);
    war.score[winnerSide] += 1;
    checkWinTarget(war, now);
};

const forfeitSet = (war, { setId, username, now }) => {
    assertStatus(war, 'active', 'This war is over.');
    const set = findSet(war, setId);
    if (set.status !== 'active') throw new WarError(409, 'Only an active set can be forfeited.');
    const playerSide = sideOfPlayerInSet(set, username);
    if (!playerSide) throw new WarError(403, 'You are not playing in this set.');
    const next = clone(war);
    const nextSet = findSet(next, setId);
    nextSet.forfeitedBy = playerSide;
    finishSet(next, nextSet, otherSide(playerSide), now);
    return next;
};

// Characters this player may not pick again under the ruleset's no-repeat
// scope, gathered from battles already recorded.
const getUsedCharacterIds = (war, set, playerSide) => {
    const scope = war.terms.ruleset.noRepeatScope;
    if (scope === 'none') return [];
    const username = set.players[playerSide];
    const sets =
        scope === 'set'
            ? [set]
            : war.sets.filter((entry) => sameName(entry.players[playerSide], username));
    const used = new Set();
    for (const entry of sets) {
        for (const battle of entry.battles) {
            (battle.teams?.[playerSide] || []).forEach((id) => used.add(id));
        }
    }
    return Array.from(used);
};

// Everything the match join needs to start a war battle for this player.
const getBattleContext = (war, { setId, username }) => {
    assertStatus(war, 'active', 'This war is over.');
    const set = findSet(war, setId);
    if (set.status !== 'active') throw new WarError(409, 'This set is not in progress.');
    const playerSide = sideOfPlayerInSet(set, username);
    if (!playerSide) throw new WarError(403, 'You are not playing in this set.');
    return {
        set,
        side: playerSide,
        opponent: set.players[otherSide(playerSide)],
        ruleset: war.terms.ruleset,
        archetypeSnapshot: war.archetypeSnapshot,
        usedCharacterIds: getUsedCharacterIds(war, set, playerSide),
    };
};

// Records a finished war battle. Safe to call twice for the same match; the
// second call changes nothing. Battles that end without a winner do not score.
const recordBattle = (war, { setId, matchId, winnerUsername, teams, endReason, now }) => {
    const set = findSet(war, setId);
    if (set.battles.some((battle) => battle.matchId === matchId)) {
        return { war, changed: false };
    }
    if (war.status !== 'active' || set.status !== 'active') {
        return { war, changed: false };
    }
    const next = clone(war);
    const nextSet = findSet(next, setId);
    const winnerSide = winnerUsername ? sideOfPlayerInSet(nextSet, winnerUsername) : null;
    nextSet.battles.push({
        matchId,
        winnerSide,
        teams: {
            challenger: teams?.[nextSet.players.challenger] || [],
            defender: teams?.[nextSet.players.defender] || [],
        },
        endReason: endReason || null,
        endedAt: new Date(now),
    });
    if (winnerSide) {
        nextSet.score[winnerSide] += 1;
        if (nextSet.score[winnerSide] >= setWinsNeeded(next.terms.bestOf)) {
            finishSet(next, nextSet, winnerSide, now);
        }
    }
    return { war: next, changed: true };
};

// Players earn for completed sets they actually played (forfeits and sets with
// no battles earn nothing), plus bonuses for set wins and for their clan
// winning the war. Clans earn for sets won and for winning the war.
const calculateWarRewards = (war) => {
    const players = {};
    const clans = { challenger: 0, defender: 0 };
    const participated = { challenger: new Set(), defender: new Set() };
    const credit = (username, amount) => {
        players[username] = (players[username] || 0) + amount;
    };

    for (const set of war.sets) {
        if (set.status !== 'completed' || set.battles.length === 0) continue;
        clans[set.winnerSide] += WAR_REWARDS.clanSetWinExp;
        for (const side of SIDES) {
            if (set.forfeitedBy === side) continue;
            const username = set.players[side];
            credit(username, WAR_REWARDS.setParticipationRyo);
            participated[side].add(username);
            if (set.winnerSide === side) credit(username, WAR_REWARDS.setWinRyo);
        }
    }

    const winnerSide = war.result?.winnerSide;
    if (winnerSide) {
        clans[winnerSide] += WAR_REWARDS.clanWarWinExp;
        participated[winnerSide].forEach((username) => credit(username, WAR_REWARDS.warWinRyo));
    }

    return { players, clans, paidAt: null };
};

module.exports = {
    SIDES,
    DEFAULT_TERMS,
    WAR_REWARDS,
    WarError,
    otherSide,
    sideOfClan,
    normalizeWarTerms,
    createWarProposal,
    respondToProposal,
    withdrawProposal,
    applyTimeouts,
    surrenderWar,
    joinRoster,
    removeFromRoster,
    createChallenge,
    respondToChallenge,
    cancelChallenge,
    forfeitSet,
    getBattleContext,
    recordBattle,
    calculateWarRewards,
};
