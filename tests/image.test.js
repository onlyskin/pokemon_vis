const o = require('ospec');

const { Image } = require('../src/image');
const { Generation } = require('../src/generation');

const generation = new Generation;
const [ GEN_1, GEN_2 ] = generation.generations;

('gets valid image sets', () => {
    const image = new Image();

    o(image.validImageSets(new Set([GEN_1])))
        .deepEquals([ 'rb', 'yellow', 'gold' ]);
    o(image.validImageSets(new Set([GEN_2])))
        .deepEquals([ 'gold' ]);
    o(image.validImageSets(new Set([GEN_1, GEN_2])))
        .deepEquals([ 'rb', 'yellow', 'gold' ]);
});
