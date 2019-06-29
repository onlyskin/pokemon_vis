class Search {
    constructor(generation) {
        this._generation = generation;
    }

    match(pokemons, types, generations) {
        if (pokemons.length === 0) {
            return pokemons;
        }

        return pokemons
            .filter(pokemon => generations.has(
                this._generation.getGeneration(pokemon)))
            .filter(pokemon => pokemon.types.some(type =>
                types.has(type.type.name)));
    }
}

module.exports = { Search };
