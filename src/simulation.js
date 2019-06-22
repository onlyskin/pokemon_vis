const d3 = require('d3');

const TARGET_IMAGE_SIZE = 60;

module.exports.simulate = function() {
    const linkForce = d3.forceLink()
        .distance(link => TARGET_IMAGE_SIZE + (24 - link.value * 5))
        .strength(1.0);

    return d3.forceSimulation()
        .force('collision', d3.forceCollide(TARGET_IMAGE_SIZE / 2))
        .force('charge', d3.forceManyBody(-400))
        .force('link', linkForce)
        .alpha(0.1)
        .alphaDecay(0);
};
