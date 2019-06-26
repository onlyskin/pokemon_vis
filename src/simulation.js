const d3 = require('d3');

class Simulation {
    constructor(dataProvider, forceData) {
        this._dataProvider = dataProvider;
        this._forceData = forceData;
        this._simulation = d3.forceSimulation()
            .force('center', d3.forceCenter())
            .force('x', d3.forceX().strength(() => 0.005))
            .force('y', d3.forceY().strength(() => 0.005))
            .force('collision', d3.forceCollide())
            .force('repulsion', d3.forceManyBody())
            .force('link', d3.forceLink().strength(1.0).id(node => node.name))
            .alpha(0.1)
            .alphaDecay(0);
    }

    get nodes() {
        return this._simulation.nodes();
    }

    updateData(model) {
        const pokemons = this._dataProvider.dataFor();
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

    updateDimensions(height, width, spriteSize) {
        this._simulation.force('center').x(width * 0.5);
        this._simulation.force('center').y(height * 0.5);
        this._simulation.force('x').x(width * 0.5);
        this._simulation.force('y').y(height * 0.5);
        this._simulation
            .force('collision')
            .radius(() => spriteSize / 2);
        this._simulation
            .force('repulsion')
            .strength(() => spriteSize * -1.5)
            .distanceMax(spriteSize * 4);
        this._simulation
            .force('link')
            .distance(link => spriteSize + 24 - link.shared_moves.length * 5);
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
