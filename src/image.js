const TROZEI = 'trozei';
const YELLOW = 'yellow';
const GOLD = 'gold';

class Image {
    constructor() {
        this._image_sets = {
            [TROZEI]: {
                string: 'Trozei',
                url: `${env.IMAGES_URL}/trozei.png`,
                size: 128,
            },
            [YELLOW]: {
                string: 'Yellow',
                url: `${env.IMAGES_URL}/yellow.png`,
                size: 60,
            },
            [GOLD]: {
                string: 'Gold',
                url: `${env.IMAGES_URL}/gold.png`,
                size: 60,
            },
        };
    }

    getUrl(imageSet) {
        return this._image_sets[imageSet].url;
    }

    getActualSpriteSize(imageSet) {
        return this._image_sets[imageSet].size;
    }

    get imageSets() {
        return [ TROZEI, YELLOW, GOLD];
    }

    validImageSets(generations) {
        return this.imageSets;
    }

    toString(image_set) {
        return this._image_sets[image_set].string;
    }
}

module.exports = {
    Image,
};
