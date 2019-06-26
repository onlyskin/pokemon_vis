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

        const expected = {
            'nodes': [
                {
                    'name': 'bulbasaur',
                    'number': 1,
                    'moves': [
                        'vine-whip',
                    ]
                }
            ],
            'links': []
        };
        o(forceData.forceFrom(pokemons, nodes, 0)).deepEquals(expected);
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
        ];

        const nodes = [
            {
                'name': 'bulbasaur',
                'number': 1,
                'moves': [
                    'vine-whip',
                ],
                'index': 0,
                'x': 624.2553712354669,
                'y': 458.29530522022213,
                'vy': -13.621707500753173,
                'vx': -19.05447720983199
            }
        ];

        const expected = {
            'nodes': [
                {
                    'name': 'bulbasaur',
                    'number': 1,
                    'moves': [
                        'vine-whip',
                    ],
                    'index': 0,
                    'x': 624.2553712354669,
                    'y': 458.29530522022213,
                    'vy': -13.621707500753173,
                    'vx': -19.05447720983199
                },
                {
                    'name': 'ivysaur',
                    'number': 2,
                    'moves': [
                        'vine-whip',
                    ],
                }
            ],
            'links': [
                {
                    'source': 'bulbasaur',
                    'target': 'ivysaur',
                    'shared_moves': [
                        'vine-whip',
                    ],
                }
            ]
        };
        o(forceData.forceFrom(pokemons, nodes, 0)).deepEquals(expected);
    })
});
