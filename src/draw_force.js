const d3 = require('d3');
const { getIntersectingElements } = require('./coord');
const { makeSimulation } = require('./simulation');

const SPRITE_COLUMNS = 15;
const IMAGE_SIZE = 150;
const TARGET_IMAGE_SIZE = 60;
const IMAGE_SCALE = TARGET_IMAGE_SIZE / IMAGE_SIZE;
const IMAGE_SET = 'gold';
const SPRITE_URL = `https://s3.eu-west-2.amazonaws.com/pokemon-sprite-sheets/${IMAGE_SET}.png`;
const SVG_WIDTH = 1200;
const SVG_HEIGHT = 1200;

module.exports.draw = async function() {
    const data = await d3.json('/force_data_151.json');
    const svg = d3.select('svg');

    svg
        .attr('width', SVG_WIDTH)
        .attr('height', SVG_HEIGHT);

    svg.append('g').attr('id', 'links');
    svg.append('g').attr('id', 'nodes');

    const simulation = makeSimulation(svg.node(), TARGET_IMAGE_SIZE);
    simulation
        .on('tick', tick.bind({svg: svg, nodes: data.nodes}))
        .nodes(data.nodes);

    update(0, simulation, data, svg);
    update(6, simulation, data, svg);

    d3.select('#threshold').on('input', function() {
        update(+this.value, simulation, data, svg);
    });
};

function tick() {
    const { svg, nodes } = this;

    svg.select('#links')
        .selectAll('.link')
        .attr('x1', function(d) { return d.source.x; })
        .attr('y1', function(d) { return d.source.y; })
        .attr('x2', function(d) { return d.target.x; })
        .attr('y2', function(d) { return d.target.y; });

    svg.select('#nodes')
        .selectAll('.node')
        .attr('transform', d => {
            const x = d.x - (TARGET_IMAGE_SIZE/2);
            const y = d.y - (TARGET_IMAGE_SIZE/2);
            return `translate(${x},${y})`;
        });
}

function update(threshold, simulation, data, svg) {
    simulation.force('link').links(data.links.filter((d) => d.value >= threshold))

    links = svg.select('#links')
        .selectAll('.link')
        .data(simulation.force('link').links(), link => `${link.source.index}-${link.target.index}`)
        .join(
            enter => enter
                .append('line')
                .attr('class', 'link')
                .on('mousemove', d => handleMousemove(d))
                .on('mouseout', d => removeTooltips())
            ,
            update => update,
            exit => exit.remove()
        )
        .style('stroke-width', d => d.value);

    nodes = svg.select('#nodes')
        .selectAll('.node')
        .data(simulation.nodes())
        .call(d3.drag()
            .on("drag", function(d) {
                const selection = d3.select(this);
                const x = d.x = d3.event.x;
                const y = d.y = d3.event.y;
                selection.attr('transform', `translate(${x},${y})`);
            })
        );

    const groups = nodes.enter()
        .append('g')
        .attr('class', 'node');

    groups
        .append('defs')
        .append('clipPath')
        .attr('id', d => `${d.name}-clip`)
        .append('rect')
        .attr('height', IMAGE_SIZE)
        .attr('width', IMAGE_SIZE)
        .attr('x', d => xSpriteOffset(d.number))
        .attr('y', d => ySpriteOffset(d.number));

    groups
        .append('image')
        .attr('xlink:href', SPRITE_URL)
        .attr('clip-path', d => `url(#${d.name}-clip)`)
        .attr('transform', d => {
            const offsetX = -xSpriteOffset(d.number) * IMAGE_SCALE;
            const offsetY = -ySpriteOffset(d.number) * IMAGE_SCALE;
            return `translate(${offsetX},${offsetY}) scale(${IMAGE_SCALE})`
        })
        //.call(force.drag)
        .on('mousemove', d => handleMousemove(d))
        .on('mouseout', d => removeTooltips());

    nodes.exit().remove();

    simulation.alpha(0.1);
    simulation.restart();
}

function xSpriteOffset(index) {
    return ((index - 1) % SPRITE_COLUMNS) * IMAGE_SIZE;
}

function ySpriteOffset(index) {
    return (Math.floor((index - 1) / SPRITE_COLUMNS)) * IMAGE_SIZE;
}

function handleMousemove(d) {
    const svg = d3.select('svg').node();
    const coordinates = d3.mouse(svg);

    element = getIntersectingElements(svg, coordinates)[0];
    if (element != undefined) {
        data = element.__data__;
        console.log('source, target:', data.source.name, data.target.name);
        console.log('shared moves:', data.shared_moves);
        makeTooltip(d, data);
    }
}

function removeTooltips() {
    body = d3.select('body');
    body.selectAll('.tooltip').remove();
}

function makeTooltip(d, data) {
    removeTooltips();

    if (d.source == undefined) {
        x = d.x;
        y = d.y
    } else {
        x = (d.source.x + d.target.x) / 2;
        y = (d.source.y + d.target.y) / 2;
    }

    svgContainer = d3.select('#svg_container');
    tooltip = svgContainer.append('div')
        .attr('class', 'tooltip')
        .style('left', x + 70 + 'px')
        .style('top', y + 70 + 'px');

    tooltip.append('p')
        .attr('class', 'heading')
        .text(`${data.source.name}-${data.target.name}`);

    data.shared_moves.map((o) => {
        tooltip.append('p')
            .attr('class', 'movename')
            .text(o);
    })
}
