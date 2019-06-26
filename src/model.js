const stream = require('mithril/stream');

const SPRITE_URL = 'https://s3.eu-west-2.amazonaws.com/pokemon-sprite-sheets';

const imageSets = {
    'Red/Blue': `${SPRITE_URL}/rb.png`,
    'Yellow': `${SPRITE_URL}/yellow.png`,
    'Gold': `${SPRITE_URL}/gold.png`,
};

class Model {
    constructor(redraw) {
        this._redraw = redraw;
        this._generation = stream(1);
        this._threshold = stream(6);
        this._imageSet = stream(Object.keys(imageSets)[0]);
    }

    get generation() {
        return this._generation();
    }

    set generation(generation) {
        this._generation(generation);
    }

    get threshold() {
        return this._threshold();
    }

    set threshold(threshold) {
        this._threshold(threshold);
    }

    get imageSets() {
        return Object.keys(imageSets);
    }

    get spriteUrl() {
        return imageSets[this._imageSet()];
    }

    get imageSet() {
        return this._imageSet();
    }

    set imageSet(name) {
        this._imageSet(name);
        this._redraw();
    }
}

module.exports = {
    Model
};
