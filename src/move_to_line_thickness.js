const d3 = require('d3');
const { Line, Coord, coordInRhombus } = require('./coordInRhombusVerifier');
const { collide } = require('./collide');

const SPRITE_COLUMNS = 15;
const IMAGE_SIZE = 150;
const IMAGE_SET = 'gold';
const SPRITE_URL = `https://s3.eu-west-2.amazonaws.com/pokemon-sprite-sheets/${IMAGE_SET}.png`;
const SVG_WIDTH = 1200;
const SVG_HEIGHT = 1200;

module.exports.runVisualisation = function() {
  d3.json('/force_data_151.json', function(error, data) {
    if (error) throw error;

    const svg = d3.select('svg');

    draw(svg, data);
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
            const x = d.x - (IMAGE_SIZE/2);
            const y = d.y - (IMAGE_SIZE/2);
            return `translate(${x},${y})`;
        })
        .each(collide(0.1, IMAGE_SIZE, nodes));
}

function draw(svg, data) {
    const filtered_links = [];
  
    svg
      .attr('width', SVG_WIDTH)
      .attr('height', SVG_HEIGHT);
  
    svg.append('g').attr('id', 'links');
    svg.append('g').attr('id', 'nodes');
  
    var force = d3.layout.force()
      .size([SVG_WIDTH, SVG_HEIGHT])
      .gravity(0.1)
      .alpha(0.1)
      .nodes(data.nodes)
      .links(filtered_links)
      .charge(-200)
      .chargeDistance(1000)
      .linkDistance(IMAGE_SIZE*0.6*2)
  //    .linkDistance(function (link) { return ( link.value )*6 })
      .on('tick', tick.bind({svg: svg, nodes: data.nodes}));
  
    function update(threshold) {
      if (threshold < 3) {
          force.gravity(0.8).alpha(1);
      } else {
          force.gravity(0.1).alpha(0.1);
      }
  
      filtered_links.splice(0, filtered_links.length);

      Array.prototype.push.apply(
          filtered_links,
          data.links.filter(function (d) {return d.value >= threshold; })
      );
  
      links = svg.select('#links')
        .selectAll('.link')
        .data(force.links(), link => `${link.source.index}-${link.target.index}`);
  
      links.enter()
        .append('line')
        .attr('class', 'link')
        .style('stroke-width', d => d.value)
        .on('mousemove', d => handleMousemove(d))
        .on('mouseout', d => removeTooltips());
  
      links.exit().remove();
  
      nodes = svg.select('#nodes')
        .selectAll('.node')
        .data(force.nodes());
  
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
        .attr('x', d => -xSpriteOffset(d.number))
        .attr('y', d => -ySpriteOffset(d.number));

      groups
        .append('image')
        .attr('xlink:href', SPRITE_URL)
        .attr('clip-path', d => `url(#${d.name}-clip)`)
        .attr('transform', d => {
            const offsetX = xSpriteOffset(d.number);
            const offsetY = ySpriteOffset(d.number);
            return `translate(${offsetX},${offsetY})`
        })
        .call(force.drag)
        .on('mousemove', d => handleMousemove(d))
        .on('mouseout', d => removeTooltips());
  
      nodes.exit().remove();
  
      force.start();
    }
  
    update(0);
    update(6);
  
    d3.select('#threshold').on('input', function() {
      update(+this.value);
    });
}

function xSpriteOffset(index) {
    return ((index - 1) % SPRITE_COLUMNS) * -IMAGE_SIZE;
}

function ySpriteOffset(index) {
    return (Math.floor((index - 1) / SPRITE_COLUMNS)) * -IMAGE_SIZE;
}

function handleMousemove(d) {
  element = getIntersectingElements()[0];
  if (element != undefined) {
    data = element.__data__;
    console.log('source, target:', data.source.name, data.target.name);
    console.log('shared moves:', data.shared_moves);
    makeTooltip(d, data);
  }
}

function getIntersectingElements() {
  var svg = d3.select('svg').node();
  var irect = svg.createSVGRect();
  var coordinates = d3.mouse(svg);
  irect.x = coordinates[0];
  irect.y = coordinates[1];
  irect.width = irect.height = 1;
  intersectingElements = [].slice.call(svg.getIntersectionList(irect, null));
  intersectingLines = intersectingElements.filter((o) => o.nodeName == 'line');
  actualLines = intersectingLines.filter((o) => {
    coord = new Coord(irect.x, irect.y);
    line = new Line(new Coord(o.x1.baseVal.value, o.y1.baseVal.value),
                    new Coord(o.x2.baseVal.value, o.y2.baseVal.value));
    return coordInRhombus(line, parseInt(o.style.strokeWidth), coord);
  });
  return actualLines;
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
