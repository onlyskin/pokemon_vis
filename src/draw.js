const d3 = require('d3');

const { getIntersectingElements } = require('./coord');

const SPRITE_COLUMNS = 15;
const ACTUAL_SPRITE_SIZE = 150;

function spriteSizeFrom(svgNode) {
    const { height, width } = boundingDimensions(svgNode);
    return Math.min(height, width) * 0.07;
}

function draw(svgNode, simulation, model) {
    const svg = d3.select(svgNode);
    const { height, width } = boundingDimensions(svgNode);
    const spriteSize = spriteSizeFrom(svgNode);
    const spriteScale = spriteSize / ACTUAL_SPRITE_SIZE;

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

    simulation.updateDimensions(spriteSize);
    simulation.updateData(model);

    simulation.ontick = tick.bind({ svg });

    svg.select('.link-group')
        .selectAll('.link')
        .data(simulation.links, simulation.linkKey)
        .join(
            enter => enter
                .append('line')
                .attr('class', 'link')
                .on('mousemove', d => handleMousemove(d))
                .on('mouseout', () => removeTooltips()),
            update => update,
            exit => exit.remove(),
        )
        .style('stroke-width', link => link.shared_moves.length * spriteScale);

    const updatingNodes = svg.select('.node-group')
        .selectAll('.node')
        .data(simulation.nodes, simulation.nodeKey);

    const enteringNodes = updatingNodes.enter()
        .append('g')
        .attr('class', 'node');

    enteringNodes.call(d3.drag()
        .on("drag", function(d) {
            const selection = d3.select(this);
            const x = d.x = d3.event.x;
            const y = d.y = d3.event.y;
            selection.attr('transform', `translate(${x + 0.5 * width},${y + 0.5 * height})`);
        })
    );

    const enteringClipPaths = enteringNodes
        .append('defs')
        .append('clipPath');

    enteringClipPaths
        .attr('height', ACTUAL_SPRITE_SIZE)
        .attr('width', ACTUAL_SPRITE_SIZE)
        .attr('id', d => `${d.name}-clip`);

    const enteringClipPathRects = enteringClipPaths
        .append('rect');

    enteringClipPathRects
        .attr('height', ACTUAL_SPRITE_SIZE)
        .attr('width', ACTUAL_SPRITE_SIZE)
        .attr('x', d => xSpriteOffset(d.number))
        .attr('y', d => ySpriteOffset(d.number));

    const enteringImages = enteringNodes
        .append('image');

    enteringImages
        .attr('clip-path', d => `url(#${d.name}-clip)`)
        .on('mousemove', d => handleMousemove(d))
        .on('mouseout', () => removeTooltips());

    const mergedImages = enteringImages.merge(updatingNodes.select('image'));

    mergedImages
        .attr('xlink:href', model.spriteUrl)
        .attr('transform', d => {
            const offsetX = -xSpriteOffset(d.number) * spriteScale;
            const offsetY = -ySpriteOffset(d.number) * spriteScale;
            return `translate(${offsetX},${offsetY}) scale(${spriteScale})`;
        });

    updatingNodes.exit().remove();

    simulation.restart();
}

function tick() {
    const { svg } = this;

    const offset = spriteSizeFrom(svg.node()) / 2;
    const { height, width } = boundingDimensions(svg.node());
    const left = -0.5 * width + offset;
    const right = 0.5 * width - offset;
    const top = -0.5 * height + offset;
    const bottom = 0.5 * height - offset;

    svg.select('.node-group')
        .selectAll('.node')
        .attr('transform', d => {
            const x = Math.max(left, Math.min(right, d.x));
            const y = Math.max(top, Math.min(bottom, d.y));

            d.x = x;
            d.y = y;
            return `translate(${x - offset + 0.5 * width},${y - offset + 0.5 * height})`;
        });

    svg.select('.link-group')
        .selectAll('.link')
        .attr('x1', function(d) { return d.source.x + 0.5 * width; })
        .attr('y1', function(d) { return d.source.y + 0.5 * height; })
        .attr('x2', function(d) { return d.target.x + 0.5 * width; })
        .attr('y2', function(d) { return d.target.y + 0.5 * height; });
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

module.exports = {
    draw
};
