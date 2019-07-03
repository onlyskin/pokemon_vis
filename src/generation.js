const GEN_1 = 'gen_1';
const GEN_2 = 'gen_2';
const GEN_3 = 'gen_3';

class Generation {
    constructor() {
        this._generations = {
            [GEN_1]: {
                string: 'Gen 1',
                path: '1',
                range: new Set(this._range(1, 151)),
                start: 1,
                end: 151,
            },
            [GEN_2]: {
                string: 'Gen 2',
                path: '2',
                range: new Set(this._range(152, 251)),
                start: 152,
                end: 251,
            },
            [GEN_3]: {
                string: 'Gen 3',
                path: '3',
                range: new Set(this._range(252, 386)),
                start: 252,
                end: 386,
            },
        };
        this._first = new Set(this._range(1, 151));
        this._second = new Set(this._range(152, 251));
        this._third = new Set(this._range(252, 386));
    }

    getGeneration(pokemon) {
        if (this._generations[GEN_1].range.has(pokemon.id)) {
            return GEN_1;
        } else if (this._generations[GEN_2].range.has(pokemon.id)) {
            return GEN_2;
        } else if (this._generations[GEN_3].range.has(pokemon.id)) {
            return GEN_3;
        } else {
            return null;
        }
    }

    highest(generations) {
        const ends = Object.entries(this._generations)
            .filter(entry => generations.has(entry[0]))
            .map(entry => entry[1].end);
        return Math.max(...ends);
    }

    get generations() {
        return [ GEN_1, GEN_2, GEN_3];
    }

    getGenerationPath(pokemon) {
        const generation = this.getGeneration(pokemon);
        return this._generations[generation].path;
    }

    toString(generation) {
        return this._generations[generation].string;
    }

    localNumber(id) {
        const generation = this._generations[this.getGeneration({ id })];
        return id - generation.start + 1;
    }

    _range(start, end) {
        return Array(end - start + 1).fill().map((_, idx) => start + idx);
    }
}

module.exports = {
    Generation,
};
