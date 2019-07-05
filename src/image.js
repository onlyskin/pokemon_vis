const TROZEI = 'trozei';
const YELLOW = 'yellow';
const REDBLUE = 'redblue';
const GOLD = 'gold';
const SILVER = 'silver';
const SUNMOON = 'sunmoon';

const SPRITE_COLUMNS = 15;

class Image {
    constructor(generation, imageCache, shiny) {
        this._generation = generation;
        this._imageCache = imageCache;
        this._shiny = shiny;
        this._imageSets = {
            [TROZEI]: {
                string: 'Trozei',
                path: 'trozei',
                size: 128,
                finalId: 718,
                setScale: 1,
                hasShiny: false,
            },
            [YELLOW]: {
                string: 'Yellow',
                path: 'yellow',
                size: 60,
                finalId: 151,
                setScale: 1,
                hasShiny: false,
            },
            [REDBLUE]: {
                string: 'Red/Blue',
                path: 'redblue',
                size: 60,
                finalId: 151,
                setScale: 1,
                hasShiny: false,
            },
            [GOLD]: {
                string: 'Gold',
                path: 'gold',
                size: 60,
                finalId: 251,
                setScale: 1,
                hasShiny: true,
            },
            [SILVER]: {
                string: 'Silver',
                path: 'silver',
                size: 60,
                finalId: 251,
                setScale: 1,
                hasShiny: false,
            },
            [SUNMOON]: {
                string: 'Sun/Moon',
                path: 'sunmoon',
                size: 210,
                finalId: 809,
                setScale: 2.5,
                hasShiny: true,
            },
        };
    }

    spriteUrl(imageSet, pokemonId) {
        const imageSetData = this._imageSets[imageSet];
        const isShiny = this._shiny.check(pokemonId) && imageSetData.hasShiny;

        const generation = this._generation
            .getGenerationPath({ id: pokemonId });

        const setPath = imageSetData.path;

        if (this._imageCache.loadedHigh(setPath, generation, isShiny)) {
            return this._imageCache.high(setPath, generation, isShiny);
        }

        if (this._imageCache.loadedLow(setPath, generation)) {
            return this._imageCache.low(setPath, generation);
        }

        return this._imageCache.emptyUrl;
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

    setScale(imageSet) {
        return this._imageSets[imageSet].setScale;
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
