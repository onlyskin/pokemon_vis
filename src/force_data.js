class ForceData {
    forceFrom(pokemons, existingNodes, threshold) {
        const existingPhysics = {};
        existingNodes.forEach(node => {
            existingPhysics[node.name] = node;
        });

        const nodes = pokemons.map(pokemon => {
            return this._nodeFrom(pokemon, existingPhysics);
        });

        return {
            nodes: nodes,
            links: this._linksFrom(nodes).filter(link =>
                link.shared_moves.length >= threshold),
        };
    }

    _linksFrom(nodes) {
        const links = [];

        nodes.forEach((source_node, i) => {
            nodes.forEach((target_node, j) => {
                if (i < j) {
                    const link = {};
                    link.source = source_node.name;
                    link.target = target_node.name;
                    link.shared_moves = source_node.moves
                        .reduce((moves, move) => {
                            return target_node.moves.includes(move) ?
                                moves.concat(move) :
                                moves;
                        }, []);

                    if (link.shared_moves.length > 0) {
                        links.push(link);
                    }
                }
            });
        });

        return links;
    }

    _nodeFrom(pokemon, existingPhysics) {
        const node = {
            'name': pokemon.name,
            'number': pokemon.id,
            'moves': this._movesFrom(pokemon),
        };

        if (existingPhysics[pokemon.name] !== undefined) {
            Object.assign(node, existingPhysics[pokemon.name]);
        }

        return node;
    }

    _movesFrom(pokemon) {
        return pokemon.moves
            .filter(this._isLevelUpMove)
            .map(moveData => moveData.move.name);
    }

    _isLevelUpMove(moveData) {
        return moveData.version_group_details
            .some(detail => detail.move_learn_method.name === 'level-up');
    }
}

module.exports = {
    ForceData,
};
