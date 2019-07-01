const cachedMoves = {};
const cachedSharedMoves = {};

function intersection(setA, setB) {
    var _intersection = new Set();
    for (var elem of setB) {
        if (setA.has(elem)) {
            _intersection.add(elem);
        }
    }
    return _intersection;
}

class ForceData {
    forceFrom(pokemons, existingNodes, existingLinks, threshold) {
        const existingNamesToNodes = {};
        existingNodes.forEach(node => {
            existingNamesToNodes[node.name] = node;
        });

        const nodes = [];
        pokemons.forEach(pokemon => {
            const name = pokemon.name;
            const existingNode = existingNamesToNodes[name];

            if (existingNode === undefined) {
                nodes.push(this._nodeFrom(pokemon));
            } else {
                nodes.push(existingNode);
            }
        });

        return {
            nodes: nodes,
            links: this._linksFrom(nodes, threshold),
        };
    }

    _linksFrom(nodes, threshold) {
        const links = [];

        nodes.forEach((sourceNode, i) => {
            nodes.forEach((targetNode, j) => {
                if (i < j) {
                    const cacheKey = `${sourceNode.name}${targetNode.name}`;
                    if (cachedSharedMoves[cacheKey] === undefined) {
                        cachedSharedMoves[cacheKey] = intersection(
                            sourceNode.moves, targetNode.moves
                        );
                    }

                    const sharedMoves = cachedSharedMoves[cacheKey];
                    if (sharedMoves.size >= threshold) {
                        links.push({
                            source: sourceNode.name,
                            target: targetNode.name,
                            sharedMoves,
                        });
                    }
                }
            });
        });

        return links;
    }

    _nodeFrom(pokemon) {
        return {
            'name': pokemon.name,
            'number': pokemon.id,
            'moves': this._movesFrom(pokemon),
        };
    }

    _movesFrom(pokemon) {
        if (cachedMoves[pokemon.name] === undefined) {
            cachedMoves[pokemon.name] = new Set(
                pokemon.moves
                .filter(this._isLevelUpMove)
                .map(moveData => moveData.move.name)
            );
        }

        return cachedMoves[pokemon.name];
    }

    _isLevelUpMove(moveData) {
        return moveData.version_group_details
            .some(detail => detail.move_learn_method.name === 'level-up');
    }
}

module.exports = {
    ForceData,
};
