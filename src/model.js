const stream = require('mithril/stream');
const { TYPES } = require('./constant');

class Model {
    constructor(redraw, generation, image) {
        this._redraw = redraw;
        this._threshold = stream(6);
        this._image = image;

        this._types = stream(new Set(TYPES));
        this._generations = stream(new Set([generation.generations[0]]));
        this._imageSet = stream(image.imageSets[0]);
    }

    get threshold() {
        return this._threshold();
    }

    set threshold(threshold) {
        this._threshold(threshold);
    }

    get types() {
        return this._types();
    }

    isActiveType(type) {
        return this._types().has(type);
    }

    toggleType(type) {
        if (this._types().has(type)) {
            this._types().delete(type);
        } else {
            this._types().add(type);
        }
    }

    get generations() {
        return this._generations();
    }

    isActiveGeneration(generation) {
        return this._generations().has(generation);
    }

    toggleGeneration(generation) {
        if (this._generations().has(generation)) {
            this._generations().delete(generation);
        } else {
            this._generations().add(generation);
        }

        this._checkImageSet();
    }

    _checkImageSet() {
        const validImageSets = this._image.validImageSets(this.generations)
        if (!validImageSets.includes(this.imageSet)) {
            this.imageSet = validImageSets[0];
        }
    }

    get imageSet() {
        return this._imageSet();
    }

    set imageSet(imageSet) {
        this._imageSet(imageSet);
    }
}

module.exports = {
    Model,
};
