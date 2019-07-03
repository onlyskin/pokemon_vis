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
    forceFrom(pokemons, data, threshold) {
        const existingNamesToNodes = {};
        data.nodes.forEach(node => {
            existingNamesToNodes[node.name] = node;
        });

        const nodes = [];
        const pokemonNamesSet = new Set();
        const remainingNodes = [];
        const newNodes = [];
        pokemons.forEach(pokemon => {
            const name = pokemon.name;
            const existingNode = existingNamesToNodes[name];

            let node;
            if (existingNode === undefined) {
                node = this._nodeFrom(pokemon);
                newNodes.push(node);
            } else {
                node = existingNode;
                remainingNodes.push(node);
            }

            nodes.push(node);
            pokemonNamesSet.add(name);
        });

        let links;
        if (data.threshold === threshold) {
            links = this._linksFromSameThreshold(data.links, newNodes,
                remainingNodes, pokemonNamesSet, threshold);
        } else {
            links = this._linksFrom(nodes, threshold);
        }

        return { nodes, links };
    }

    _linksFromSameThreshold(links, newNodes, remainingNodes, pokemonNamesSet,
                            threshold) {
        const remainingLinks = [];

        links.forEach(link => {
            if ((
                    pokemonNamesSet.has(link.source.name) ||
                    pokemonNamesSet.has(link.source)
                ) && (
                    pokemonNamesSet.has(link.target.name) ||
                    pokemonNamesSet.has(link.target)
                )) {
                remainingLinks.push(link);
            }
        });

        const newOldLinks = this._newLinksFrom(newNodes, remainingNodes,
            threshold);
        const newLinks = this._linksFrom(newNodes, threshold);

        return remainingLinks.concat(newOldLinks).concat(newLinks);
    }

    _newLinksFrom(newNodes, remainingNodes, threshold) {
        const links = [];

        remainingNodes.forEach((sourceNode) => {
            newNodes.forEach((targetNode) => {
                const sharedMoves = this._sharedMovesFrom(
                    sourceNode, targetNode);

                if (sharedMoves.size >= threshold) {
                    links.push({
                        source: sourceNode.name,
                        target: targetNode.name,
                        sharedMoves,
                    });
                }
            });
        });

        return links;
    }

    _linksFrom(nodes, threshold) {
        const links = [];

        nodes.forEach((sourceNode, i) => {
            nodes.forEach((targetNode, j) => {
                if (i < j) {
                    const sharedMoves = this._sharedMovesFrom(
                        sourceNode, targetNode);

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

    _sharedMovesFrom(sourceNode, targetNode) {
        const cacheKey = `${sourceNode.name}${targetNode.name}`;
        if (cachedSharedMoves[cacheKey] === undefined) {
            cachedSharedMoves[cacheKey] = intersection(
                sourceNode.moves, targetNode.moves
            );
        }

        return cachedSharedMoves[cacheKey];
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
