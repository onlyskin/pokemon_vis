const d3 = require('d3');
const { getIntersectingElements } = require('./coord');

const SPRITE_COLUMNS = 15;
const IMAGE_SIZE = 150;
const TARGET_IMAGE_SIZE = 60;
const IMAGE_SCALE = TARGET_IMAGE_SIZE / IMAGE_SIZE;
const IMAGE_SET = 'yellow';
const SPRITE_URL = `https://s3.eu-west-2.amazonaws.com/pokemon-sprite-sheets/${IMAGE_SET}.png`;
const SVG_WIDTH = 1200;
const SVG_HEIGHT = 1200;

module.exports.draw = async function(svgNode, simulation, threshold, data) {
    const svg = d3.select(svgNode);

    svg.attr('width', SVG_WIDTH);
    svg.attr('height', SVG_HEIGHT);

    svg.selectAll('.link-group')
        .data([0])
        .enter()
        .append('g')
        .attr('class', 'link-group');

    svg.selectAll('.node-group')
        .data([0])
        .enter()
        .append('g')
        .attr('class', 'node-group');

    const { height, width } = boundingDimensions(svgNode);

    simulation
        .force('x', d3.forceX(width * 0.5).strength(0.02))
        .force('y', d3.forceY(height * 0.5).strength(0.02))
        .force('center', d3.forceCenter(width * 0.5, height * 0.5));

    simulation.nodes(data.nodes);

    simulation.force('link')
        .links(data.links.filter((d) => d.value >= threshold));

    simulation.on('tick', tick.bind({ svg }));

    svg.select('.link-group')
        .selectAll('.link')
        .data(
            simulation.force('link').links(),
            link => `${link.source.index}-${link.target.index}`,
        )
        .join(
            enter => enter
                .append('line')
                .attr('class', 'link')
                .on('mousemove', d => handleMousemove(d))
                .on('mouseout', () => removeTooltips()),
            update => update,
            exit => exit.remove()
        )
        .style('stroke-width', d => d.value);

    const nodes = svg.select('.node-group')
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
            return `translate(${offsetX},${offsetY}) scale(${IMAGE_SCALE})`;
        })
        .on('mousemove', d => handleMousemove(d))
        .on('mouseout', () => removeTooltips());

    nodes.exit().remove();

    simulation.alpha(0.1);
};

function tick() {
    const { svg } = this;

    svg.select('.link-group')
        .selectAll('.link')
        .attr('x1', function(d) { return d.source.x; })
        .attr('y1', function(d) { return d.source.y; })
        .attr('x2', function(d) { return d.target.x; })
        .attr('y2', function(d) { return d.target.y; });

    svg.select('.node-group')
        .selectAll('.node')
        .attr('transform', d => {
            const x = d.x - (TARGET_IMAGE_SIZE/2);
            const y = d.y - (TARGET_IMAGE_SIZE/2);
            return `translate(${x},${y})`;
        });
}

function boundingDimensions(svgNode) {
    const boundingRect = svgNode.getBoundingClientRect();
    const width = boundingRect.width;
    const height = boundingRect.height;
    return { width, height };
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

    const element = getIntersectingElements(svg, coordinates)[0];
    if (element !== undefined) {
        const data = element.__data__;
        console.log('source, target:', data.source.name, data.target.name);
        console.log('shared moves:', data.shared_moves);
        makeTooltip(d, data);
    }
}

function removeTooltips() {
    const body = d3.select('body');
    body.selectAll('.tooltip').remove();
}

function makeTooltip(d, data) {
    removeTooltips();

    let x, y;
    if (d.source === undefined) {
        x = d.x;
        y = d.y;
    } else {
        x = (d.source.x + d.target.x) / 2;
        y = (d.source.y + d.target.y) / 2;
    }

    const svgContainer = d3.select('#svg_container');

    const tooltip = svgContainer.append('div')
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
    });
}
