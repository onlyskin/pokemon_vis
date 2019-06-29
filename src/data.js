class Data {
    constructor(pokedex, redraw, model, search, generation) {
        this._pokedex = pokedex;
        this._redraw = redraw;
        this._model = model;
        this._search = search;
        this._generation = generation;

        this._loadedPokemon = {};

        this._loadNames();
    }

    async _loadNames() {
        const { results } = await this._pokedex.getPokemonsList();
        const names = results
            .map(pokemon => pokemon.name);

        names.forEach(name => this._loadedPokemon[name] = null);
    }

    async _loadPokemon() {
        this._namesForGen()
            .forEach(async (name) => {
                this._loadedPokemon[name] = false;
                try {
                    const pokemon = await this._pokedex.getPokemonByName(name);
                    this._loadedPokemon[name] = pokemon;
                    this._redraw();
                } catch { console.error(`Pokeapi error: ${name}`) }
            });
    }

    _namesForGen() {
        return Object.keys(this._loadedPokemon)
            .filter((_, i) => {
                const pokemonGeneration = this._generation
                    .getGeneration({ id: i + 1 })
                return this._model.generations.has(pokemonGeneration);
            });
    }

    get pokemons() {
        if (this._loaded()) {
            return this._search.match(
                Object.values(this._loadedPokemon)
                .filter(value => value !== false && value !== null),
                this._model.types,
                this._model.generations,
            );
        } else {
            this._loadPokemon();
            return [];
        }
    }

    _loaded() {
        return this._namesForGen()
            .every(name => this._loadedPokemon[name] !== null);
    }

    maxSharedMoves() {
        return 20;
    }
}

module.exports = {
    Data,
};
