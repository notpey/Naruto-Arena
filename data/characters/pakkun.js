module.exports = {
    "id": "pakkun",
    "characterId": "pakkun",
    "name": "Pakkun",
    "facePicture": "https://www.animehistory.org/uploads/screencaps/naruto-episode-072-a-mistake-from-the-past-a-face-revealed_/cap_02-06_0794.jpg",
    "characterdeescription": "Pakkun is one of Kakashi's ninken, a small but highly skilled ninja hound with an exceptional sense of smell. Though lacking in combat prowess, Pakkun specializes in tracking enemies, coordinating attacks, and protecting his allies.",
    "skills": [
        {
            "id": "pakkun-pakkun-bite",
            "name": "Pakkun Bite",
            "skillimage": "https://www.animehistory.org/uploads/screencaps/naruto-episode-069-village-in-distress-a-new-a-ranked-mission_/cap_05-09_6ed2.jpg",
            "skilldescription": "Pakkun deals 10 physical damage to one enemy. If another ally uses a damaging skill on that enemy this turn, their strategic skills will be stunned for 1 turn. During 'Guardian Dog', this skill costs 1 less random chakra. If this skill is countered, Pakkun and his linked ally will each heal 10 health.",
            "energy": [
                "Random"
            ],
            "target": "single-enemy",
            "cooldown": 0,
            "classes": [
                "Physical",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 10,
                    "scope": "target"
                }
            ]
        },
        {
            "id": "pakkun-aggressive-genjutsu-dispel",
            "name": "Aggressive Genjutsu Dispel",
            "skillimage": "https://www.animehistory.org/uploads/screencaps/naruto-episode-069-village-in-distress-a-new-a-ranked-mission_/cap_04-54_f5f9.jpg",
            "skilldescription": "For 2 turns, Pakkun will ignore all enemy non-damage effects. During 'Guardian Dog', his linked ally will ignore all enemy stun effects for 2 turns instead. In either case, Pakkun will deal 5 additional damage and heal 5 additional health for 2 turns.",
            "energy": [
                "Bloodline"
            ],
            "target": "single-ally",
            "cooldown": 1,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": []
        },
        {
            "id": "pakkun-supersoft-paw",
            "name": "Supersoft Paw",
            "skillimage": "https://www.animehistory.org/uploads/screencaps/naruto-episode-069-village-in-distress-a-new-a-ranked-mission_/cap_06-22_5f79.jpg",
            "skilldescription": "Pakkun heals himself for 10 health and gains 1 random chakra. During 'Guardian Dog', Pakkun will heal his linked ally for 20 health instead of healing himself.",
            "energy": [
                "Random"
            ],
            "target": "single-ally",
            "cooldown": 0,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": []
        },
        {
            "id": "pakkun-guardian-dog",
            "name": "Guardian Dog",
            "skillimage": "https://www.animehistory.org/uploads/screencaps/naruto-episode-069-village-in-distress-a-new-a-ranked-mission_/cap_06-36_1b4c.jpg",
            "skilldescription": "Pakkun links himself to one ally for 4 turns. During this time, Pakkun will be invulnerable and his other skills will gain additional effects involving his linked ally. This skill will end prematurely if the linked ally dies.",
            "energy": [
                "Random"
            ],
            "target": "single-ally",
            "cooldown": 4,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": []
        }
    ],
    "passive": {
        "name": "Tracking Dog",
        "icon": "https://www.animehistory.org/uploads/screencaps/naruto-episode-070-a-shirker_s-call-to-action-a-layabout-no-more_/cap_06-03_85dc.jpg",
        "description": "Whenever an enemy uses a skill on Pakkun or his linked ally, that enemy will be marked for 1 turn. Any partial stun applied to a marked enemy will become a full stun instead."
    }
};
