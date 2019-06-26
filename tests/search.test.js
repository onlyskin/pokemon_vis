const o = require('ospec');
const bulbasaur = require('./fixtures/bulbasaur');
const mew = require('./fixtures/mew');
const cyndaquil = require('./fixtures/cyndaquil');
const chikorita = require('./fixtures/chikorita');

const { Search } = require('../src/search');
const { TYPES } = require('../src/constant');
const { Generation } = require('../src/generation');

const search = new Search(new Generation);

o('filters searches by generation', () => {
    const pokemon = [ bulbasaur, mew, chikorita, cyndaquil ];
    const types = new Set(TYPES);

    gen_1_matches = search.match(pokemon, types, new Set(['gen_1']));
    o(gen_1_matches).deepEquals([ bulbasaur, mew ]);

    gen_2_matches = search.match(pokemon, types, new Set(['gen_2']));
    o(gen_2_matches).deepEquals([ chikorita, cyndaquil ]);

    both_gen_matches = search.match(pokemon, types, new Set(['gen_1', 'gen_2']));
    o(both_gen_matches).deepEquals(pokemon);
});

o('filters searches by type', () => {
    const pokemon = [ bulbasaur, cyndaquil ];
    const generations = new Set(['gen_1', 'gen_2']);

    all_types_matches = search.match(pokemon, new Set(TYPES), generations);
    o(all_types_matches).deepEquals([ bulbasaur, cyndaquil ]);

    grass_type_matches = search.match(pokemon, new Set(['grass']), generations);
    o(grass_type_matches).deepEquals([ bulbasaur ]);
});
