const d3 = require('d3');
const { Line, Coord, coordInRhombus } = require('./coordInRhombusVerifier');
const { collide } = require('./collide');

module.exports.runVisualisation = function() {
  d3.json("/force_data_151.json", function(error, data) {
    if (error) throw error;

    draw(data);
  });
};
  
function draw(data) {
    const filtered_links = [];
    const filtered_nodes = []
  
    const width = 1200;
    const height = 1200;
    const imageSize = 60;
  
    var svg = d3.select("svg")
      .attr('width', width)
      .attr('height', height);
  
    svg.append("g").attr("id", "links");
    svg.append("g").attr("id", "nodes");
  
    var force = d3.layout.force()
      .size([width, height])
      .gravity(0.1)
      .alpha(0.1)
      .nodes(filtered_nodes)
      .links(filtered_links)
      .charge(-200)
      .chargeDistance(1000)
      .linkDistance(imageSize*0.6*2)
  //    .linkDistance(function (link) { return ( link.value )*6 })
      .on("tick", tick);
  
    function tick() {
      links
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
  
      nodes
        .attr("x", function(d) { return d.x - (imageSize/2); })
        .attr("y", function(d) { return d.y - (imageSize/2); });
  
      nodes.each(collide(0.1, imageSize, data.nodes));
    }
  
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
  
      links = svg.select("#links")
        .selectAll(".link")
        .data(force.links(), link => link.source.index + "-" + link.target.index);
  
      links.enter()
        .append("line")
        .attr("class", "link")
        .style("stroke-width", d => d.value)
        .on('mousemove', d => handleMousemove(d))
        .on('mouseout', d => removeTooltips());
  
      links.exit().remove();
  
      filtered_nodes.splice(0, filtered_nodes.length);
      Array.prototype.push.apply(filtered_nodes, data.nodes);
  
      nodes = svg.select("#nodes").selectAll(".node")
        .data(force.nodes());
  
      nodes.enter()
        .append("image")
        .attr("class", "node")
        .attr("xlink:href", function(d) { return "sprites/" + d.number + ".png"})
        .attr("width", imageSize + "px")
        .attr("height", imageSize + "px")
        .call(force.drag)
        .on('mousemove', (d) => handleMousemove(d))
        .on('mouseout', (d) => removeTooltips());
  
      nodes.exit().remove();
  
      force.start();
    }
  
    update(0);
    update(6);
  
    d3.select("#threshold").on("input", function() {
      update(+this.value);
    });
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
    .text(data.source.name + '-' + data.target.name);

  data.shared_moves.map((o) => {
    tooltip.append('p')
      .attr('class', 'movename')
      .text(o);
  })

}
