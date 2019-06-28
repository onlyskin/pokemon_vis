const d3 = require('d3');

class Simulation {
    constructor(forceData) {
        this._forceData = forceData;
        this._simulation = d3.forceSimulation()
            .force('x', d3.forceX().strength(() => 0.005).x(0))
            .force('y', d3.forceY().strength(() => 0.005).y(0))
            .force('collision', d3.forceCollide())
            .force('repulsion', d3.forceManyBody())
            .force('link', d3.forceLink().strength(0.6).id(node => node.name))
            .alpha(0.1)
            .alphaDecay(0);
    }

    get nodes() {
        return this._simulation.nodes();
    }

    updateData(model, pokemons) {
        const forceData = this._forceData.forceFrom(
            pokemons, this.nodes, model.threshold);

        this._simulation.nodes(forceData.nodes);
        this._simulation.force('link').links(forceData.links);
    }

    get links() {
        return this._simulation.force('link').links();
    }

    get linkKey() {
        return link => `${link.source.name}-${link.target.name}`;
    }

    get nodeKey() {
        return node => node.name;
    }

    restart() {
        this._simulation.alpha(0.1);
    }

    updateDimensions(spriteSize) {
        this._simulation
            .force('collision')
            .radius(() => spriteSize * 0.6);
        this._simulation
            .force('repulsion')
            .strength(() => -4 * spriteSize)
            .distanceMax(spriteSize * 4);
        this._simulation
            .force('link')
            .distance(link => spriteSize * 2 * (1 / link.shared_moves.length));
    }

    get ontick() {
        this._simulation.on('tick');
    }

    set ontick(tick) {
        this._simulation.on('tick', tick);
    }
}

module.exports = {
    Simulation,
};
