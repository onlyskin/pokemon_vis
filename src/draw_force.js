const d3 = require('d3');
const { getIntersectingElements } = require('./coord');

const SPRITE_COLUMNS = 15;
const ACTUAL_SPRITE_SIZE = 150;
const IMAGE_SET = 'gold';
const SPRITE_URL = `https://s3.eu-west-2.amazonaws.com/pokemon-sprite-sheets/${IMAGE_SET}.png`;

module.exports.draw = async function(svgNode, simulation, threshold, data) {
    const svg = d3.select(svgNode);

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
    const spriteScale = Math.min(height, width) * 0.1 / ACTUAL_SPRITE_SIZE;

    simulation.force('center').x(width * 0.5);
    simulation.force('center').y(height * 0.5);
    simulation.force('x').x(width * 0.5);
    simulation.force('y').y(height * 0.5);
    simulation
        .force('collision')
        .radius(() => ACTUAL_SPRITE_SIZE * spriteScale / 2);
    simulation
        .force('repulsion')
        .strength(() => spriteScale * -100)
        .distanceMax(ACTUAL_SPRITE_SIZE * spriteScale * 4);
    simulation
        .force('link')
        .distance(link => spriteScale * ACTUAL_SPRITE_SIZE + (24 - link.value * 5));

    simulation.nodes(data.nodes);

    simulation.force('link')
        .links(data.links.filter((d) => d.value >= threshold));

    const offset = ACTUAL_SPRITE_SIZE * spriteScale / 2
    const boundaries = {
        left: 0 + offset,
        right: width - offset,
        top: 0 + offset,
        bottom: height - offset,
    };

    simulation.on('tick', tick.bind({ svg, spriteScale, boundaries }));

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
        .style('stroke-width', d => d.value * spriteScale);

    const nodes = svg.select('.node-group')
        .selectAll('.node')
        .data(simulation.nodes());

    const groups = nodes.enter()
        .append('g')
        .attr('class', 'node')
        .call(d3.drag()
            .on("drag", function(d) {
                const selection = d3.select(this);
                const x = d.x = d3.event.x;
                const y = d.y = d3.event.y;
                selection.attr('transform', `translate(${x},${y})`);
            })
        );

    groups
        .append('defs')
        .append('clipPath')
        .attr('id', d => `${d.name}-clip`)
        .append('rect')
        .attr('height', ACTUAL_SPRITE_SIZE)
        .attr('width', ACTUAL_SPRITE_SIZE)
        .attr('x', d => xSpriteOffset(d.number))
        .attr('y', d => ySpriteOffset(d.number));

    svg.selectAll('clipPath')
        .attr('height', ACTUAL_SPRITE_SIZE)
        .attr('width', ACTUAL_SPRITE_SIZE);

    groups
        .append('image')
        .attr('xlink:href', SPRITE_URL)
        .attr('clip-path', d => `url(#${d.name}-clip)`)
        .attr('transform', d => {
            const offsetX = -xSpriteOffset(d.number) * spriteScale;
            const offsetY = -ySpriteOffset(d.number) * spriteScale;
            return `translate(${offsetX},${offsetY}) scale(${spriteScale})`;
        })
        .on('mousemove', d => handleMousemove(d))
        .on('mouseout', () => removeTooltips());

    svg.selectAll('.node')
        .selectAll('image')
        .attr('transform', d => {
            const offsetX = -xSpriteOffset(d.number) * spriteScale;
            const offsetY = -ySpriteOffset(d.number) * spriteScale;
            return `translate(${offsetX},${offsetY}) scale(${spriteScale})`;
        });

    nodes.exit().remove();

    simulation.alpha(0.1);
};

function tick() {
    const { svg, spriteScale, boundaries } = this;

    const { height, width } = boundingDimensions(svg.node());
    const { left, right, top, bottom } = boundaries;
    const offset = ACTUAL_SPRITE_SIZE * spriteScale / 2

    svg.select('.node-group')
        .selectAll('.node')
        .attr('transform', d => {
            const x = Math.max(left, Math.min(right, d.x));
            const y = Math.max(top, Math.min(bottom, d.y));

            d.x = x;
            d.y = y;
            return `translate(${x - offset},${y - offset})`;
        });

    svg.select('.link-group')
        .selectAll('.link')
        .attr('x1', function(d) { return d.source.x; })
        .attr('y1', function(d) { return d.source.y; })
        .attr('x2', function(d) { return d.target.x; })
        .attr('y2', function(d) { return d.target.y; });
}

function boundingDimensions(svgNode) {
    const boundingRect = svgNode.getBoundingClientRect();
    const width = boundingRect.width;
    const height = boundingRect.height;
    return { width, height };
}

function xSpriteOffset(index) {
    return ((index - 1) % SPRITE_COLUMNS) * ACTUAL_SPRITE_SIZE;
}

function ySpriteOffset(index) {
    return (Math.floor((index - 1) / SPRITE_COLUMNS)) * ACTUAL_SPRITE_SIZE;
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

    const svgContainer = d3.select('body');

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
