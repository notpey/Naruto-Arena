const { test } = require('node:test');
const assert = require('node:assert/strict');

test('clan schema validation and rank management logic', () => {
    const clan = {
        name: 'Uchiha',
        tag: 'UCH',
        description: 'Elite sharingan shinobi of the Leaf.',
        leader: 'Madara',
        recruitmentOpen: true,
        ranks: [
            { name: 'Leader', permissions: { canInvite: true, canKick: true, canEditRanks: true } },
            { name: 'Elder', permissions: { canInvite: true, canKick: false, canEditRanks: false } },
            { name: 'Member', permissions: { canInvite: false, canKick: false, canEditRanks: false } }
        ],
        members: [
            { username: 'Madara', rank: 'Leader', joinedAt: new Date() },
            { username: 'Sasuke', rank: 'Member', joinedAt: new Date() }
        ]
    };

    assert.equal(clan.ranks.length, 3);
    assert.equal(clan.members.length, 2);
    assert.equal(clan.recruitmentOpen, true);

    // Test rank assignment
    const targetMember = clan.members.find(m => m.username === 'Sasuke');
    assert.ok(targetMember);
    targetMember.rank = 'Elder';
    assert.equal(targetMember.rank, 'Elder');

    // Test rank deletion fallback
    const rankToDelete = 'Elder';
    clan.ranks = clan.ranks.filter(r => r.name !== rankToDelete);
    clan.members.forEach(m => {
        if (m.rank === rankToDelete) {
            m.rank = 'Member';
        }
    });

    assert.equal(clan.ranks.length, 2);
    assert.equal(targetMember.rank, 'Member', 'Members with deleted custom ranks must fall back to Member rank');
});

test('clan invitation and recruitment checks', () => {
    const invitations = [];
    
    // Invite member
    invitations.push({
        clanName: 'Akatsuki',
        invitedUsername: 'itachi',
        invitedBy: 'pain',
        createdAt: new Date()
    });

    assert.equal(invitations.length, 1);
    assert.equal(invitations[0].invitedUsername, 'itachi');

    // Retract invitation
    const index = invitations.findIndex(i => i.clanName === 'Akatsuki' && i.invitedUsername === 'itachi');
    assert.ok(index >= 0);
    invitations.splice(index, 1);
    assert.equal(invitations.length, 0);
});
