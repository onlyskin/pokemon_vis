const GEN_1 = 'gen_1';
const GEN_2 = 'gen_2';
const GEN_3 = 'gen_3';

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
            [GEN_3]: {
                string: 'Gen 3',
                range: new Set(this._range(252, 386)),
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

    isFirst(id) {
        return this.getGeneration({ id }) === GEN_1;
    }

    isSecond(id) {
        return this.getGeneration({ id }) === GEN_2;
    }

    isThird(id) {
        return this.getGeneration({ id }) === GEN_3;
    }

    get generations() {
        return [ GEN_1, GEN_2, GEN_3];
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
