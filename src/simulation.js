const d3 = require('d3');

module.exports.simulate = function(svg, nodeSize) {
    const { height, width } = boundingDimensions(svg);

    return d3.forceSimulation()
        .force('collision', d3.forceCollide(nodeSize / 2))
        .force('charge', d3.forceManyBody(-400))
        .force('x', d3.forceX(width * 0.5).strength(0.02))
        .force('y', d3.forceY(height * 0.5).strength(0.02))
        .force('center', d3.forceCenter(width * 0.5, height * 0.5))
        .force('link', d3.forceLink([]).distance(link => nodeSize + (24 - link.value * 5)).strength(1.0))
        .alpha(0.1)
        .alphaDecay(0);
}

function boundingDimensions(svg) {
    const boundingRect = svg.getBoundingClientRect();
    const width = boundingRect.width;
    const height = boundingRect.height;
    return { width, height };
}
