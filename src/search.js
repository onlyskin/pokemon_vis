class Search {
    constructor(generation) {
        this._generation = generation;
    }

    match(pokemon, types, generations) {
        if (pokemon.length === 0) {
            return pokemon;
        }

        return pokemon
            .filter(pokemon => generations.has(
                this._generation.getGeneration(pokemon)))
            .filter(pokemon => pokemon.types.some(type =>
                types.has(type.type.name)));
    }
}

module.exports = { Search };
