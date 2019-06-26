class Data {
    constructor(pokedex, redraw, model, search) {
        this._pokedex = pokedex;
        this._redraw = redraw;
        this._model = model;
        this._search = search;

        this._pokemon = [];
        this._pending = false;

        this._init();
    }

    async _init() {
        this._pending = true;

        const { results } = await this._pokedex.getPokemonsList();
        const names = results.map(pokemon => pokemon.name);
        this._pokemon = await Promise.all(
            names.map(async name => await this._pokemonFrom(name))
        );

        this._pending = false;

        this._redraw();
    }

    async _pokemonFrom(name) {
        return await this._pokedex.getPokemonByName(name);
    }

    dataFor() {
        return this._search.match(
            this._pokemon,
            this._model.types,
            this._model.generations,
        );
    }
}

module.exports = {
    Data,
};
