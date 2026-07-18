const assert = require('node:assert/strict');
const test = require('node:test');

const gauntlet = require('../gauntlet');
const characters = require('../characters');

test('act 2 map generation is deterministic by seed', () => {
    const first = gauntlet.generateAct2Map({ seed: 'team-7-seed', startingScrollType: 'heaven' });
    const second = gauntlet.generateAct2Map({ seed: 'team-7-seed', startingScrollType: 'heaven' });

    assert.deepEqual(first, second);
});

test('act 2 map follows row shape and allowed node types', () => {
    const map = gauntlet.generateAct2Map({ seed: 'shape-check', startingScrollType: 'earth' });

    assert.equal(map.rows.length, 7);
    assert.equal(map.rows[0].length, 1);
    assert.ok(map.rows[6].length >= 2);
    assert.ok(map.rows[6].length <= 3);

    const allowedByRow = new Map([
        [1, new Set(['battle'])],
        [2, new Set(['battle', 'event', 'merchant'])],
        [3, new Set(['battle', 'event', 'merchant', 'elite_battle'])],
        [4, new Set(['rest_camp'])],
        [5, new Set(['scroll_cache', 'elite_battle'])],
        [6, new Set(['battle', 'elite_battle', 'rest_camp'])],
        [7, new Set(['elite_battle'])],
    ]);

    for (const node of map.nodes) {
        assert.ok(allowedByRow.get(node.row).has(node.type), `${node.id} has invalid type ${node.type}`);
        if (node.row < 7) {
            assert.ok(node.connectsTo.length >= 1, `${node.id} should connect forward`);
            assert.ok(node.connectsTo.length <= 2, `${node.id} should have bounded branching`);
        }
        if (node.row === 7) {
            assert.deepEqual(node.connectsTo, []);
        }
    }
});

test('every generated path has a rest camp and at least two scroll sources', () => {
    for (let index = 0; index < 25; index += 1) {
        const map = gauntlet.generateAct2Map({ seed: `path-invariant-${index}`, startingScrollType: 'heaven' });
        const paths = gauntlet.findAllPaths(map);

        assert.ok(paths.length > 0);
        for (const path of paths) {
            assert.ok(
                gauntlet.pathHasRestAndScrollSource(path),
                `path ${path.map((node) => node.id).join(' -> ')} misses required support nodes`
            );
        }
    }
});

test('scroll cache nodes declare sibling locks when they share a parent choice', () => {
    const map = gauntlet.generateAct2Map({ seed: 'cache-locks', startingScrollType: 'heaven' });
    const byId = new Map(map.nodes.map((node) => [node.id, node]));

    for (const parent of map.nodes) {
        const children = parent.connectsTo.map((id) => byId.get(id)).filter(Boolean);
        for (const child of children) {
            if (child.type !== 'scroll_cache' || children.length <= 1) continue;
            const siblingIds = children.filter((entry) => entry.id !== child.id).map((entry) => entry.id);
            assert.deepEqual(new Set(child.locksSiblings || []), new Set(siblingIds));
        }
    }
});

test('row 7 exit battles require both Heaven and Earth scrolls', () => {
    const map = gauntlet.generateAct2Map({ seed: 'exit-gate' });
    const exitNode = map.nodes.find((node) => node.row === 7);

    assert.equal(gauntlet.canEnterNode({ heavenScrolls: 1, earthScrolls: 0 }, exitNode), false);
    assert.equal(gauntlet.canEnterNode({ heavenScrolls: 0, earthScrolls: 1 }, exitNode), false);
    assert.equal(gauntlet.canEnterNode({ heavenScrolls: 1, earthScrolls: 1 }, exitNode), true);
});

test('initial run state stores a generated map and starts in Act 1', () => {
    const run = gauntlet.createInitialRunState({
        seed: 'run-state',
        team: [0, 1, 2],
        startingScrollType: 'earth',
    });

    assert.equal(run.status, 'active');
    assert.deepEqual(run.team, [0, 1, 2]);
    assert.deepEqual(run.teamHp, [100, 100, 100]);
    assert.equal(run.heavenScrolls, 0);
    assert.equal(run.earthScrolls, 1);
    assert.equal(run.currentAct, 1);
    assert.ok(Array.isArray(run.map.nodes));
    assert.deepEqual(gauntlet.getReachableNodeIds(run), []);
});

test('reachable node ids advance from the current node and ignore locked or visited nodes', () => {
    const run = gauntlet.createInitialRunState({ seed: 'reachable-state' });
    run.currentAct = 2;
    const startNode = gauntlet.getNodeById(run.map, 'r1n1');
    const firstChild = startNode.connectsTo[0];

    run.currentNodeId = 'r1n1';
    assert.ok(gauntlet.getReachableNodeIds(run).includes(firstChild));

    run.lockedNodeIds = [firstChild];
    assert.ok(!gauntlet.getReachableNodeIds(run).includes(firstChild));

    run.lockedNodeIds = [];
    run.visitedNodeIds = [firstChild];
    assert.ok(!gauntlet.getReachableNodeIds(run).includes(firstChild));
});

test('act 3 exposes preliminary and finals nodes in order', () => {
    const run = gauntlet.createInitialRunState({ seed: 'act3-state' });
    run.currentAct = 3;

    assert.deepEqual(gauntlet.getReachableNodeIds(run), ['act3-preliminary']);
    run.visitedNodeIds = ['act3-preliminary'];
    assert.deepEqual(gauntlet.getReachableNodeIds(run), ['act3-finals']);
    run.visitedNodeIds = ['act3-preliminary', 'act3-finals'];
    assert.deepEqual(gauntlet.getReachableNodeIds(run), []);
});

test('launch relic and curse catalogs include the requested minimum content', () => {
    assert.equal(gauntlet.RELIC_SCROLLS.length, 10);
    assert.equal(gauntlet.CURSES.length, 4);
    assert.equal(gauntlet.ACT_ONE_EVENTS.length, 8);
    assert.equal(gauntlet.ACT_TWO_EVENTS.length, 12);
    assert.ok(gauntlet.RELIC_SCROLLS.every((entry) => entry.isCurse === false));
    assert.ok(gauntlet.CURSES.every((entry) => entry.isCurse === true));
});

test('gauntlet enemy teams reference implemented roster characters', () => {
    const characterIds = new Set(characters.map((character) => character.characterId).filter(Boolean));

    for (const team of gauntlet.ENEMY_TEAMS) {
        assert.equal(team.characterIds.length, 3, `${team.id} should have exactly 3 characters`);
        for (const characterId of team.characterIds) {
            assert.ok(characterIds.has(characterId), `${team.id} references missing character ${characterId}`);
        }
    }
});

test('act 3 nodes reference implemented enemy teams', () => {
    const enemyTeamIds = new Set(gauntlet.ENEMY_TEAMS.map((team) => team.id));

    for (const node of gauntlet.ACT_THREE_NODES) {
        assert.ok(enemyTeamIds.has(node.content.enemyTeamId), `${node.id} references missing enemy team`);
        assert.equal(node.type, 'elite_battle');
    }
});

test('gauntlet event choices reference valid relic and curse content', () => {
    const relicIds = new Set(gauntlet.RELIC_SCROLLS.map((entry) => entry.id));
    const curseIds = new Set(gauntlet.CURSES.map((entry) => entry.id));
    const events = [...gauntlet.ACT_ONE_EVENTS, ...gauntlet.ACT_TWO_EVENTS];

    for (const event of events) {
        assert.ok(event.title, `${event.eventId} should have a title`);
        assert.ok(event.choices.length >= 2, `${event.eventId} should have at least two choices`);
        for (const choice of event.choices) {
            assert.ok(choice.label, `${event.eventId} choice should have a label`);
            assert.ok(choice.outcomeSummary, `${event.eventId} choice should show outcome summary`);
            for (const effect of choice.effects) {
                if (effect.kind === 'relic') {
                    assert.ok(relicIds.has(effect.relicId), `${event.eventId} references missing relic ${effect.relicId}`);
                }
                if (effect.kind === 'curse_offer') {
                    assert.ok(curseIds.has(effect.curseId), `${event.eventId} references missing curse ${effect.curseId}`);
                }
            }
        }
    }
});
