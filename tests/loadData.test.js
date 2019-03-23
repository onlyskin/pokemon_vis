const { toForce } = require('../src/pokedex');
const o = require('ospec');

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

o('transforms response from api', () => {
    const data = [
        {
            name: 'bulbasaur',
            id: 1,
            moves: [ vineWhipLevelUp, razorWindEgg ],
        },
        {
            name: 'ivysaur',
            id: 2,
            moves: [ vineWhipLevelUp ]
        }
    ];

    const actual = toForce(data);

    const expected = {
        nodes: [
            {
                moves: [ 'vine-whip' ],
                name: 'bulbasaur',
                number: 1,
            },
            {
                moves: [ 'vine-whip' ],
                name: 'ivysaur',
                number: 2,
            }
        ],
        links: [
            {
                source: 0,
                target: 1,
                value: 1,
                shared_moves: [ 'vine-whip' ]
            }
        ],
    };

    o(actual).deepEquals(expected);
});
