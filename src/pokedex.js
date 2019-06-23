const { Pokedex } = require('pokeapi-js-wrapper');

const pokedex = new Pokedex();

function toForce(pokemons) {
    const nodes = pokemons.map(nodeFrom);

    return {
        nodes: nodes,
        links: linksFrom(nodes),
    };
}

function linksFrom(nodes) {
    const links = [];

    nodes.forEach((source_node, i) => {
        nodes.forEach((target_node, j) => {
            if (i < j) {
                const link = {};
                link.source = i;
                link.target = j;
                link.value = 0;
                link.shared_moves = [];
                source_node.moves.forEach(move => {
                    if (target_node.moves.includes(move)) {
                        link.value = link.value + 1;
                        link.shared_moves.push(move);
                    }
                });
                if (link.value > 0) {
                    links.push(link);
                }
            }
        });
    });

    return links;
}

function nodeFrom(pokemon) {
    return {
        'name': pokemon.name,
        'number': pokemon.id,
        'moves': movesFrom(pokemon),
    };
}

function movesFrom(pokemon) {
    return pokemon.moves
        .filter(isLevelUpMove)
        .map(moveData => moveData.move.name);
}

function isLevelUpMove(moveData) {
    return moveData.version_group_details
        .some(detail => detail.move_learn_method.name === 'level-up');
}

async function loadForceData(generation) {
    const pokemonData = await loadPokemonData(generation);
    return toForce(pokemonData);
}

async function loadPokemonData(generation) {
    const pokemonNames = await listPokemon(generation);
    return await Promise.all(pokemonNames.map(async (name) => {
        return await pokedex.getPokemonByName(name);
    }));
}

function rangeFor(generation) {
    if (generation === 2) return [ 151, 251 ];

    return [ 0, 151 ];
}

async function listPokemon(generation) {
    const { results } = await pokedex.getPokemonsList();
    const names = results.map(pokemon => pokemon.name);

    return names.slice(...rangeFor(generation));
}

module.exports = {
    toForce,
    loadForceData,
    loadPokemonData,
};
