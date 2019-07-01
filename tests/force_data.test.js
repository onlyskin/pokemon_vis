const o = require('ospec');
const { ForceData } = require('../src/force_data');

const vineWhipLevelUp = {
    move: {
        name: 'vine-whip',
        url: 'https://pokeapi.co/api/v2/move/22/'
    },
    version_group_details: [
        {
            level_learned_at: 13,
            move_learn_method: {
                name: 'level-up',
            },
            version_group: {
                name: 'red-blue',
            }
        }
    ]
};

const razorWindEgg = {
    move: {
        name: 'razor-wind',
        url: 'https://pokeapi.co/api/v2/move/13/'
    },
    version_group_details: [
        {
            level_learned_at: 0,
            move_learn_method: {
                name: 'egg',
                url: 'https://pokeapi.co/api/v2/move-learn-method/2/'
            },
            version_group: {
                name: 'crystal',
                url: 'https://pokeapi.co/api/v2/version-group/4/'
            }
        },
        {
            level_learned_at: 0,
            move_learn_method: {
                name: 'egg',
                url: 'https://pokeapi.co/api/v2/move-learn-method/2/'
            },
            version_group: {
                name: 'gold-silver',
                url: 'https://pokeapi.co/api/v2/version-group/3/'
            }
        }
    ]
};

o.spec('addPokemon', () => {
    const forceData = new ForceData();

    o('creates_force_from_pokemon', () => {
        const pokemons = [{
            name: 'bulbasaur',
            id: 1,
            moves: [ vineWhipLevelUp, razorWindEgg ],
        }];

        const nodes = [];
        const links = [];

        const expected = JSON.stringify({
            'nodes': [
                {
                    'name': 'bulbasaur',
                    'number': 1,
                    'moves': new Set([
                        'vine-whip',
                    ]),
                }
            ],
            'links': []
        });
        const actual = JSON.stringify(forceData.forceFrom(pokemons, nodes, links, 0));
        o(actual).deepEquals(expected);
    });

    o('adds next pokemon', () => {
        const pokemons = [
            {
                name: 'bulbasaur',
                id: 1,
                moves: [ vineWhipLevelUp, razorWindEgg ],
            },
            {
                name: 'ivysaur',
                id: 2,
                moves: [ vineWhipLevelUp ]
            },
            {
                name: 'venusaur',
                id: 3,
                moves: [ vineWhipLevelUp ]
            },
        ];

        const nodes = [
            {
                'name': 'bulbasaur',
                'number': 1,
                'moves': new Set([
                    'vine-whip',
                ]),
                'index': 0,
                'x': 624.2553712354669,
                'y': 458.29530522022213,
                'vy': -13.621707500753173,
                'vx': -19.05447720983199
            }
        ];

        const links = [];

        const expected = JSON.stringify({
            'nodes': [
                {
                    'name': 'bulbasaur',
                    'number': 1,
                    'moves': new Set([
                        'vine-whip',
                    ]),
                    'index': 0,
                    'x': 624.2553712354669,
                    'y': 458.29530522022213,
                    'vy': -13.621707500753173,
                    'vx': -19.05447720983199
                },
                {
                    'name': 'ivysaur',
                    'number': 2,
                    'moves': new Set([
                        'vine-whip',
                    ]),
                },
                {
                    'name': 'venusaur',
                    'number': 3,
                    'moves': new Set([
                        'vine-whip',
                    ]),
                }
            ],
            'links': [
                {
                    'source': 'bulbasaur',
                    'target': 'ivysaur',
                    'sharedMoves': new Set([
                        'vine-whip',
                    ]),
                },
                {
                    'source': 'bulbasaur',
                    'target': 'venusaur',
                    'sharedMoves': new Set([
                        'vine-whip',
                    ]),
                },
                {
                    'source': 'ivysaur',
                    'target': 'venusaur',
                    'sharedMoves': new Set([
                        'vine-whip',
                    ]),
                },
            ]
        });
        const actual = JSON.stringify(forceData.forceFrom(pokemons, nodes, links, 0));
        o(actual).deepEquals(expected);
    })

    o('removes existing nodes when pokemon removed', () => {
        const pokemons = [
            {
                name: 'ivysaur',
                id: 2,
                moves: [ vineWhipLevelUp ]
            },
            {
                name: 'venusaur',
                id: 3,
                moves: [ vineWhipLevelUp ]
            },
        ];

        const nodes = [
            {
                'name': 'bulbasaur',
                'number': 1,
                'moves': new Set([
                    'vine-whip',
                ]),
                'index': 0,
                'x': 624.2553712354669,
                'y': 458.29530522022213,
                'vy': -13.621707500753173,
                'vx': -19.05447720983199
            },
            {
                'name': 'ivysaur',
                'number': 2,
                'moves': new Set([
                    'vine-whip',
                ]),
                'index': 0,
                'x': 624.2553712354669,
                'y': 458.29530522022213,
                'vy': -13.621707500753173,
                'vx': -19.05447720983199
            },
            {
                'name': 'venusaur',
                'number': 3,
                'moves': new Set([
                    'vine-whip',
                ]),
                'index': 0,
                'x': 624.2553712354669,
                'y': 458.29530522022213,
                'vy': -13.621707500753173,
                'vx': -19.05447720983199
            },
        ];

        const links = [
                {
                    'source': 'bulbasaur',
                    'target': 'ivysaur',
                    'sharedMoves': new Set([
                        'vine-whip',
                    ]),
                },
                {
                    'source': 'bulbasaur',
                    'target': 'venusaur',
                    'sharedMoves': new Set([
                        'vine-whip',
                    ]),
                },
                {
                    'source': 'ivysaur',
                    'target': 'venusaur',
                    'sharedMoves': new Set([
                        'vine-whip',
                    ]),
                },
            ];

        const expected = JSON.stringify({
            'nodes': [
                {
                    'name': 'ivysaur',
                    'number': 2,
                    'moves': new Set([
                        'vine-whip',
                    ]),
                    'index': 0,
                    'x': 624.2553712354669,
                    'y': 458.29530522022213,
                    'vy': -13.621707500753173,
                    'vx': -19.05447720983199
                },
                {
                    'name': 'venusaur',
                    'number': 3,
                    'moves': new Set([
                        'vine-whip',
                    ]),
                    'index': 0,
                    'x': 624.2553712354669,
                    'y': 458.29530522022213,
                    'vy': -13.621707500753173,
                    'vx': -19.05447720983199
                },
            ],
            'links': [
                {
                    'source': 'ivysaur',
                    'target': 'venusaur',
                    'sharedMoves': new Set([
                        'vine-whip',
                    ]),
                }
            ]
        });
        console.log('here');
        const actual = JSON.stringify(forceData.forceFrom(pokemons, nodes, links, 0));
        o(actual).deepEquals(expected);
    });
});
