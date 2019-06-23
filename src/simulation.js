const d3 = require('d3');

module.exports.simulate = function() {
    return d3.forceSimulation()
        .force('center', d3.forceCenter())
        .force('x', d3.forceX().strength(() => 0.005))
        .force('y', d3.forceY().strength(() => 0.005))
        .force('collision', d3.forceCollide())
        .force('repulsion', d3.forceManyBody())
        .force('link', d3.forceLink().strength(1.0))
        .alpha(0.1)
        .alphaDecay(0);
};
