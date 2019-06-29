const o = require('ospec');
const { Data } = require('../src/data');
const { Model } = require('../src/model');
const { Search } = require('../src/search');
const { Image } = require('../src/image');
const bulbasaur = require('./fixtures/bulbasaur');
const mew = JSON.parse(JSON.stringify(require('./fixtures/mew')));
mew.id = 2;
const chikorita = JSON.parse(JSON.stringify(require('./fixtures/chikorita')));
chikorita.id = 3;
const cyndaquil = JSON.parse(JSON.stringify(require('./fixtures/cyndaquil')));
cyndaquil.id = 4;

o.spec('get pokemons', () => {
    let pokedex;
    let model;
    let redraw;
    let namesPromise;
    let pokemonDataPromises;
    const generation = {
        getGeneration: ({ id }) => {
            return id < 3 ? 'gen_1' : 'gen_2';
        },
        generations: ['gen_1', 'gen_2'],
    };
    const search = new Search(generation);

    o.beforeEach(() => {
        model = new Model(null, generation, new Image());
        redraw = o.spy();

        namesPromise = Promise.resolve({ results: [
            { name: 'bulbasaur' },
            { name: 'mew' },
            { name: 'chikorita' },
            { name: 'cyndaquil' },
        ]});

        pokemonDataPromises = {
            'bulbasaur': Promise.resolve(bulbasaur),
            'mew': Promise.resolve(mew),
            'chikorita': Promise.resolve(chikorita),
            'cyndaquil': Promise.resolve(cyndaquil),
        };

        pokedex = o.spy();
        pokedex.getPokemonsList = o.spy(() => namesPromise);
        pokedex.getPokemonByName = (name) => pokemonDataPromises[name];
    });

    o('returns available pokemon where not all are loaded', async () => {
        const data = new Data(pokedex, redraw, model, search, generation);
        pokemonDataPromises.bulbasaur = Promise.reject();

        await namesPromise;
        data.pokemons;

        await pokemonDataPromises['mew'];

        o(data.pokemons).deepEquals([ mew ]);
    });

    o('returns generation 1 pokemon after all are loaded', async () => {
        const data = new Data(pokedex, redraw, model, search, generation);

        await namesPromise;
        o(data.pokemons).deepEquals([]);

        await pokemonDataPromises['bulbasaur'];
        await pokemonDataPromises['mew'];
        o(data.pokemons).deepEquals([ bulbasaur, mew ]);
    });

    o('returns generation 2 pokemon after all are loaded', async () => {
        const data = new Data(pokedex, redraw, model, search, generation);
        model.toggleGeneration('gen_1');
        model.toggleGeneration('gen_2');

        await namesPromise;
        o(data.pokemons).deepEquals([]);

        await pokemonDataPromises['chikorita'];
        await pokemonDataPromises['cyndaquil'];
        o(data.pokemons).deepEquals([ chikorita, cyndaquil ]);
    });

    o('returns all pokemon once loaded', async () => {
        const data = new Data(pokedex, redraw, model, search, generation);
        model.toggleGeneration('gen_2');

        await namesPromise;
        o(data.pokemons).deepEquals([]);

        await Promise.all(Object.values(pokemonDataPromises));
        o(data.pokemons).deepEquals([ bulbasaur, mew, chikorita, cyndaquil ]);
    });

    o('doesnt request any data if no generations active', async () => {
        const data = new Data(pokedex, redraw, model, search, generation);
        model.toggleGeneration('gen_1');

        await namesPromise;
        await Promise.all(Object.values(pokemonDataPromises));

        o(data._loadedPokemon).deepEquals({
            'bulbasaur': null,
            'mew': null,
            'chikorita': null,
            'cyndaquil': null,
        });
    });

    o('only requests names once at the start', async () => {
        const data = new Data(pokedex, redraw, model, search, generation);

        await namesPromise;
        await pokemonDataPromises['bulbasaur'];
        await pokemonDataPromises['mew'];

        data.pokemons;
        data.pokemons;

        o(pokedex.getPokemonsList.callCount).deepEquals(1);
    });

    o('calls redraw when new pokemon are loaded', async () => {
        const data = new Data(pokedex, redraw, model, search, generation);

        await namesPromise;
        data.pokemons;

        o(redraw.callCount).equals(0);
        await pokemonDataPromises['bulbasaur'];
        await pokemonDataPromises['mew'];
        o(redraw.callCount).equals(2);
    });
});
