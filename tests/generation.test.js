const o = require('ospec');
const bulbasaur = require('./fixtures/bulbasaur');
const mew = require('./fixtures/mew');
const cyndaquil = require('./fixtures/cyndaquil');
const chikorita = require('./fixtures/chikorita');

const { Generation } = require('../src/generation');

const generation = new Generation;

o('categorises pokemon generations', () => {
    const [ GEN_1, GEN_2 ] = generation.generations;

    o(GEN_1).equals('gen_1');
    o(GEN_2).equals('gen_2');

    o(generation.getGeneration(bulbasaur)).equals('gen_1');
    o(generation.getGeneration(mew)).equals('gen_1');
    o(generation.getGeneration(cyndaquil)).equals('gen_2');
    o(generation.getGeneration(chikorita)).equals('gen_2');
});
