const SPRITE_URL = 'https://s3.eu-west-2.amazonaws.com/pokemon-sprite-sheets';
const RED_BLUE = 'rb';
const YELLOW = 'yellow';
const GOLD = 'gold';

class Image {
    constructor() {
        this._image_sets = {
            [RED_BLUE]: {
                string: 'Red/Blue',
                url: `${SPRITE_URL}/rb.png` 
            },
            [YELLOW]: {
                string: 'Yellow',
                url: `${SPRITE_URL}/yellow.png` 
            },
            [GOLD]: {
                string: 'Gold',
                url: `${SPRITE_URL}/gold.png` 
            },
        };
    }

    getUrl(imageSet) {
        return this._image_sets[imageSet].url;
    }

    get imageSets() {
        return [ RED_BLUE, YELLOW, GOLD];
    }

    toString(image_set) {
        return this._image_sets[image_set].string;
    }
}

module.exports = {
    Image,
};
