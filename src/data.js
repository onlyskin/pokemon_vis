const UNTOUCHED = 'never_loaded';
const LOADING = 'loading';

class Data {
    constructor(
        pokedex,
        redraw,
        model,
        search,
        generation,
        requestAnimationFrame,
        loadInterval,
    ) {
        this._pokedex = pokedex;
        this._redraw = redraw;
        this._model = model;
        this._search = search;
        this._generation = generation;
        this._requestAnimationFrame = requestAnimationFrame;
        this._loadInterval = loadInterval;

        this._loadedPokemon = {};
        this._loadingCount = 0;

        this._loadNames();
    }

    async _loadNames() {
        const { results } = await this._pokedex.getPokemonsList();
        const names = results
            .map(pokemon => pokemon.name);

        names.forEach(name => this._loadedPokemon[name] = UNTOUCHED);
        this._redraw();
    }

    get pokemons() {
        this._loadNewPokemon();

        return this._search.match(
            Object.values(this._loadedPokemon).filter(value =>
                value !== UNTOUCHED && value !== LOADING),
            this._model.types,
            this._model.generations,
        );
    }

    isLoading() {
        return this._loadingCount > 0;
    }

    async _loadNewPokemon() {
        this._untouchedForGen()
            .forEach((name, i) => {
                this._loadedPokemon[name] = LOADING;
                this._loadingCount = this._loadingCount + 1;
                setTimeout(async () => {
                    try {
                        const pokemon = await this._pokedex
                            .getPokemonByName(name);

                        this._loadedPokemon[name] = pokemon;
                        if (!this._pendingRedraw) {
                            this._pendingRedraw = true;
                            this._requestAnimationFrame(() => {
                                this._pendingRedraw = false;
                                this._redraw();
                            });
                        }
                    } catch (e) { console.error(e); }
                    this._loadingCount = this._loadingCount - 1;
                }, this._loadInterval * i);
            });
    }

    _untouchedForGen() {
        return Object.entries(this._loadedPokemon)
            .filter((entry, i) => {
                return this._isSelectedGeneration(i) && entry[1] === UNTOUCHED;
            })
            .map(entry => entry[0]);
    }

    _isSelectedGeneration(index) {
        return this._model.generations.has(
            this._generation.getGeneration({ id: index + 1 })
        );
    }

    maxSharedMoves() {
        return 20;
    }
}

module.exports = {
    Data,
};
