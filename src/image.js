const TROZEI = 'trozei';
const YELLOW = 'yellow';
const GOLD = 'gold';

const SPRITE_COLUMNS = 15;

class Image {
    constructor(generation) {
        this._generation = generation;
        this._imageSets = {
            [TROZEI]: {
                string: 'Trozei',
                path: 'trozei',
                size: 128,
                finalId: 718,
            },
            [YELLOW]: {
                string: 'Yellow',
                path: 'yellow',
                size: 60,
                finalId: 151,
            },
            [GOLD]: {
                string: 'Gold',
                path: 'gold',
                size: 60,
                finalId: 251,
            },
        };
    }

    spriteUrl(imageSet, pokemonId) {
        const generation = this._generation.getGenerationPath({ id: pokemonId });
        const setPath = this._imageSets[imageSet].path;
        return `${env.IMAGES_URL}/${setPath}/${generation}.png`
    }

    xOffset(imageSet, pokemonId) {
        const index = this._generation.localNumber(pokemonId);
        return ((index - 1) % SPRITE_COLUMNS) * this._imageSets[imageSet].size;
    }

    yOffset(imageSet, pokemonId) {
        const index = this._generation.localNumber(pokemonId);
        return (Math.floor((index - 1) / SPRITE_COLUMNS)) *
            this._imageSets[imageSet].size;
    }

    actualSpriteSize(imageSet) {
        return this._imageSets[imageSet].size;
    }

    get imageSets() {
        return [ TROZEI, YELLOW, GOLD];
    }

    validImageSets(generations) {
        const highest = this._generation.highest(generations);

        return Object.entries(this._imageSets)
            .filter(entry => entry[1].finalId >= highest)
            .map(entry => entry[0]);
    }

    toString(image_set) {
        return this._imageSets[image_set].string;
    }
}

module.exports = {
    Image,
};
