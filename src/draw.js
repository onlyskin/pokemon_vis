const { getIntersectingElements } = require('./coord');

function boundingDimensions(svgNode) {
    const boundingRect = svgNode.getBoundingClientRect();
    const width = boundingRect.width;
    const height = boundingRect.height;
    return { width, height };
}

class Draw {
    constructor(d3, simulation, model, data_provider, image) {
        this._d3 = d3;
        this._simulation = simulation;
        this._data_provider = data_provider;
        this._image = image;
    }

    render(svgNode, imageSet) {
        const pokemons = this._data_provider.pokemons;

        const svg = this._d3.select(svgNode);
        const { height, width } = boundingDimensions(svgNode);
        const spriteSize = this._spriteSizeFrom(svgNode, pokemons.length);
        const actualSpriteSize = this._image.actualSpriteSize(imageSet);
        const setScale = this._image.setScale(imageSet);
        const spriteScale = spriteSize * setScale / actualSpriteSize;

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

        this._simulation.ontick = this._tick.bind({
            svg,
            spriteSize,
            setScale,
        });

        svg.select('.link-group')
            .selectAll('.link')
            .data(this._simulation.links, this._simulation.linkKey)
            .join(
                enter => enter
                .append('path')
                .attr('class', 'link'),
                //.on('mousemove', d => this._handleMousemove(d))
                //.on('mouseout', () => this._removeTooltips()),
                update => update,
                exit => exit.remove(),
            )
            .style('stroke-width', link =>
                link.sharedMoves.size * spriteSize * 0.01);

        const updatingNodes = svg.select('.node-group')
            .selectAll('.node')
            .data(this._simulation.nodes, this._simulation.nodeKey);

        const enteringNodes = updatingNodes.enter()
            .append('g')
            .attr('class', 'node');

        const handlerClosure = { d3: this._d3 };
        enteringNodes.call(this._d3.drag()
            .on("drag", function(d) {
                const selection = handlerClosure.d3.select(this);
                const x = d.x = handlerClosure.d3.event.x;
                const y = d.y = handlerClosure.d3.event.y;
                d.fx = x;
                d.fy = y;
                selection.attr(
                    'transform',
                    `translate(${x + 0.5 * width},${y + 0.5 * height})`,
                );
            })
            .on("end", function(d) {
                d.fx = null;
                d.fy = null;
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
            .attr('height', actualSpriteSize)
            .attr('width', actualSpriteSize);

        const enteringClipPathRects = enteringClipPaths
            .append('rect');

        const mergedClipPathRects = enteringClipPathRects.merge(
            updatingNodes.select('rect'));

        mergedClipPathRects
            .attr('height', actualSpriteSize)
            .attr('width', actualSpriteSize)
            .attr('x', d => this._image.xOffset(imageSet, d.number))
            .attr('y', d => this._image.yOffset(imageSet, d.number));

        const enteringImages = enteringNodes
            .append('image');

        enteringImages
            .attr('clip-path', d => `url(#${d.name}-clip)`);
            //.on('mousemove', d => this._handleMousemove(d))
            //.on('mouseout', () => this._removeTooltips());

        const mergedImages = enteringImages.merge(
            updatingNodes.select('image'));

        mergedImages
            .attr('href', d => this._image.spriteUrl(imageSet, d.number))
            .attr('transform', d => {
                const x = spriteScale *
                    -this._image.xOffset(imageSet, d.number);
                const y = spriteScale *
                    -this._image.yOffset(imageSet, d.number);
                return `translate(${x},${y}) scale(${spriteScale})`;
            });

        updatingNodes.exit().remove();

        this._simulation.restart();
    }

    _tick() {
        const { svg, spriteSize, setScale } = this;

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

                const screenX = x - offset * setScale + 0.5 * width;
                const screenY = y - offset * setScale + 0.5 * height;
                return `translate(${screenX},${screenY})`;
            });

        svg.select('.link-group')
            .selectAll('.link')
            .attr('d', d => {
                const x1 = d.source.x + 0.5 * width;
                const y1 = d.source.y + 0.5 * height;
                const x2 = d.target.x + 0.5 * width;
                const y2 = d.target.y + 0.5 * height;
                return `M ${x1} ${y1} C ${x1+10} ${y1+10}, ${x1-10} ${y1+10}, ${x2} ${y2}`
            });
    }

    _spriteSizeFrom(svgNode, nodeCount) {
        const { height, width } = boundingDimensions(svgNode);
        const totalArea = height * width;
        const targetFraction = 0.5;
        const areaPerSprite = (totalArea * targetFraction) / nodeCount;
        return Math.sqrt(areaPerSprite);
    }

    _handleMousemove(d) {
        const svg = this._d3.select('svg').node();
        const coordinates = this._d3.mouse(svg);

        const element = getIntersectingElements(svg, coordinates)[0];
        if (element !== undefined) {
            const data = element.__data__;
            console.log('source, target:', data.source.name, data.target.name);
            console.log('shared moves:', data.sharedMoves);
            this._makeTooltip(d, data);
        }
    }

    _removeTooltips() {
        const body = this._d3.select('body');
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

        const svgContainer = this._d3.select('body');

        const tooltip = svgContainer.append('div')
            .attr('class', 'tooltip')
            .style('left', x + 70 + 'px')
            .style('top', y + 70 + 'px');

        tooltip.append('p')
            .attr('class', 'heading')
            .text(`${data.source.name}-${data.target.name}`);

        Array.from(data.sharedMoves).map((o) => {
            tooltip.append('p')
                .attr('class', 'movename')
                .text(o);
        });
    }
}

module.exports = {
    Draw
};
