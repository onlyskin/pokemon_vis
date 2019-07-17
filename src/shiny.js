class Shiny {
    constructor() {
        this._shinyIndex = Math.floor(Math.random() * 8000);
    }

    check(pokemonId) {
        return pokemonId === this._shinyIndex;
    }
}

module.exports = {
    Shiny,
};
