const d3 = require('d3');

const { getIntersectingElements } = require('./coord');

const SPRITE_COLUMNS = 15;

function boundingDimensions(svgNode) {
    const boundingRect = svgNode.getBoundingClientRect();
    const width = boundingRect.width;
    const height = boundingRect.height;
    return { width, height };
}

class Draw {
    constructor(simulation, model, data_provider) {
        this._simulation = simulation;
        this._model = model;
        this._data_provider = data_provider;
    }

    render(svgNode) {
        const pokemons = this._data_provider.pokemons;

        const svg = d3.select(svgNode);
        const { height, width } = boundingDimensions(svgNode);
        const spriteSize = this._spriteSizeFrom(svgNode, pokemons.length);
        const spriteScale = spriteSize / this._model.actualSpriteSize;

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

        this._simulation.updateDimensions(spriteSize);
        this._simulation.updateData(pokemons);

        this._simulation.ontick = this._tick.bind({ svg, spriteSize });

        svg.select('.link-group')
            .selectAll('.link')
            .data(this._simulation.links, this._simulation.linkKey)
            .join(
                enter => enter
                .append('line')
                .attr('class', 'link')
                .on('mousemove', d => this._handleMousemove(d))
                .on('mouseout', () => this._removeTooltips()),
                update => update,
                exit => exit.remove(),
            )
            .style('stroke-width', link =>
                link.sharedMoves.size * spriteScale);

        const updatingNodes = svg.select('.node-group')
            .selectAll('.node')
            .data(this._simulation.nodes, this._simulation.nodeKey);

        const enteringNodes = updatingNodes.enter()
            .append('g')
            .attr('class', 'node');

        enteringNodes.call(d3.drag()
            .on("drag", function(d) {
                const selection = d3.select(this);
                const x = d.x = d3.event.x;
                const y = d.y = d3.event.y;
                selection.attr(
                    'transform',
                    `translate(${x + 0.5 * width},${y + 0.5 * height})`,
                );
            })
        );

        const enteringClipPaths = enteringNodes
            .append('defs')
            .append('clipPath');

        enteringClipPaths
            .attr('id', d => `${d.name}-clip`);

        const mergedClipPaths = enteringClipPaths.merge(
            updatingNodes.select('clipPath'));

        mergedClipPaths
            .attr('height', this._model.actualSpriteSize)
            .attr('width', this._model.actualSpriteSize);

        const enteringClipPathRects = enteringClipPaths
            .append('rect');

        const mergedClipPathRects = enteringClipPathRects.merge(
            updatingNodes.select('rect'));

        mergedClipPathRects
            .attr('height', this._model.actualSpriteSize)
            .attr('width', this._model.actualSpriteSize)
            .attr('x', d => this._xSpriteOffset(d.number))
            .attr('y', d => this._ySpriteOffset(d.number));

        const enteringImages = enteringNodes
            .append('image');

        enteringImages
            .attr('clip-path', d => `url(#${d.name}-clip)`)
            .on('mousemove', d => this._handleMousemove(d))
            .on('mouseout', () => this._removeTooltips());

        const mergedImages = enteringImages.merge(
            updatingNodes.select('image'));

        mergedImages
            .attr('xlink:href', this._model.spriteUrl)
            .attr('transform', d => {
                const x = -this._xSpriteOffset(d.number) * spriteScale;
                const y = -this._ySpriteOffset(d.number) * spriteScale;
                return `translate(${x},${y}) scale(${spriteScale})`;
            });

        updatingNodes.exit().remove();

        this._simulation.restart();
    }

    _tick() {
        const { svg, spriteSize } = this;

        const offset = 0.5 * spriteSize;
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

                const screenX = x - offset + 0.5 * width;
                const screenY = y - offset + 0.5 * height;
                return `translate(${screenX},${screenY})`;
            });

        svg.select('.link-group')
            .selectAll('.link')
            .attr('x1', function(d) { return d.source.x + 0.5 * width; })
            .attr('y1', function(d) { return d.source.y + 0.5 * height; })
            .attr('x2', function(d) { return d.target.x + 0.5 * width; })
            .attr('y2', function(d) { return d.target.y + 0.5 * height; });
    }

    _spriteSizeFrom(svgNode, nodeCount) {
        const { height, width } = boundingDimensions(svgNode);
        const totalArea = height * width;
        const targetFraction = 0.5;
        const areaPerSprite = (totalArea * targetFraction) / nodeCount;
        return Math.sqrt(areaPerSprite);
    }

    _xSpriteOffset(index) {
        return ((index - 1) % SPRITE_COLUMNS) * this._model.actualSpriteSize;
    }

    _ySpriteOffset(index) {
        return (Math.floor((index - 1) / SPRITE_COLUMNS)) * this._model.actualSpriteSize;
    }

    _handleMousemove(d) {
        const svg = d3.select('svg').node();
        const coordinates = d3.mouse(svg);

        const element = getIntersectingElements(svg, coordinates)[0];
        if (element !== undefined) {
            const data = element.__data__;
            console.log('source, target:', data.source.name, data.target.name);
            console.log('shared moves:', data.shared_moves);
            this._makeTooltip(d, data);
        }
    }

    _removeTooltips() {
        const body = d3.select('body');
        body.selectAll('.tooltip').remove();
    }

    _makeTooltip(d, data) {
        this._removeTooltips();

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
}

module.exports = {
    Draw
};
