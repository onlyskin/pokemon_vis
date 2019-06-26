function isSuperset(set, subset) {
    for (var elem of subset) {
        if (!set.has(elem)) {
            return false;
        }
    }
    return true;
}

class Data {
    constructor(pokedex, redraw) {
        this._pokedex = pokedex;
        this._redraw = redraw;
        this._names = [];
        this._loaded = {};

        this._pending = false;
        this._init();
    }

    async _init() {
        const { results } = await this._pokedex.getPokemonsList();
        this._names = results.map(pokemon => pokemon.name);
        this._redraw();
    }

    dataFor(generation) {
        const generationNames = this._names.slice(
            ...this._rangeFor(generation));
        const generationNameSet = new Set(generationNames);

        const loadedNameSet = new Set(Object.keys(this._loaded));

        if (isSuperset(loadedNameSet, generationNameSet)) {
            return generationNames.map(name => this._loaded[name]);
        }

        if (!this.pending) {
            this._loadPokemon(generation);
        }

        return [];
    }

    async _loadPokemon(generation) {
        const names = this._names.slice(...this._rangeFor(generation));

        this._pending = true;
        const pokemon = await Promise.all(
            names.map(async name => await this._pokemonFrom(name))
        );
        pokemon.forEach(pokemon => {
            this._loaded[pokemon.name] = pokemon;
        });

        this._pending = false;
        this._redraw();
    }

    async _pokemonFrom(name) {
        return await this._pokedex.getPokemonByName(name);
    }

    _rangeFor(generation) {
        if (generation === 2) return [ 151, 251 ];

        return [ 0, 151 ];
    }
}

module.exports = {
    Data,
};
