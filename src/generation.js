const GEN_1 = 'gen_1';
const GEN_2 = 'gen_2';

class Generation {
    constructor() {
        this._generations = {
            [GEN_1]: {
                string: 'Gen 1',
                range: new Set(this._range(1, 151)),
            },
            [GEN_2]: {
                string: 'Gen 2',
                range: new Set(this._range(152, 251)),
            },
        };
        this._first = new Set(this._range(1, 151));
        this._second = new Set(this._range(152, 251));
    }

    getGeneration(pokemon) {
        if (this._generations[GEN_1].range.has(pokemon.id)) {
            return GEN_1;
        } else if (this._generations[GEN_2].range.has(pokemon.id)) {
            return GEN_2;
        } else {
            return null;
        }
    }

    isFirst(id) {
        return this.getGeneration({ id }) === GEN_1;
    }

    isSecond(id) {
        return this.getGeneration({ id }) === GEN_2;
    }

    get generations() {
        return [ GEN_1, GEN_2];
    }

    toString(generation) {
        return this._generations[generation].string;
    }

    _range(start, end) {
        return Array(end - start + 1).fill().map((_, idx) => start + idx);
    }
}

module.exports = {
    Generation,
};
