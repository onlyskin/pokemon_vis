const d3 = require('d3');
const { Line, Coord, coordInRhombus } = require('./coordInRhombusVerifier');
const { collide } = require('./collide');

module.exports.runVisualisation = function() {
  d3.json("/force_data_151.json", function(error, graph) {
    if (error) throw error;
  
    var filtered_links = [],
      filtered_nodes = [];
  
    var current_threshold = 0;
  
    var width = 1200,
      height = 1200,
      imageSize = 60;
  
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
  
      nodes.each(collide(0.1, imageSize, graph.nodes));
    }
  
    function stay_in_area() {
      return
    }
  
    function calculate_link_stroke_width(value) {
      //return 0;
      return value.value;
      //return Math.sqrt(value.value);
    };
  
    function update(threshold) {
  
      current_threshold = threshold;
      if (current_threshold < 3) {radius = imageSize; force.gravity(0.8).alpha(1);}
      else {radius = imageSize/2; force.gravity(0.1).alpha(0.1);}
  
      filtered_links.splice(0, filtered_links.length);
      Array.prototype.push.apply(
          filtered_links,
          graph.links.filter(function (d) {return d.value >= threshold; })
      );
  
      function name(link) {
        return "" + link.source.index + "-" + link.target.index;
      }
  
      links = svg.select("#links").selectAll(".link").data(force.links(), name);
  
      links.enter()
        .append("line")
        .attr("class", "link")
        .style("stroke-width", function(d) { return calculate_link_stroke_width(d) })
        .on('mousemove', (d) => handleMousemove(d))
        .on('mouseout', (d) => removeTooltips());
  
      links.exit().remove();
  
      filtered_nodes.splice(0, filtered_nodes.length);
      Array.prototype.push.apply(filtered_nodes, graph.nodes);
  
      nodes = svg.select("#nodes").selectAll(".node")
        .data(force.nodes());
  
      nodes.enter()
        .append("image")
        .attr("class", "node")
  //This commented out section printed to console all the link pairs involving the mouseover'd pokemon and what moves they had in common
  /*      .on("mouseover", function(d) { console.log(d.name);
                                       for (var i = 0; i < filtered_links.length; i++) {
                                        if (filtered_links[i].source.number == d.number || filtered_links[i].target.number == d.number) {
                                          console.log(filtered_links[i].source.name, filtered_links[i].target.name, filtered_links[i].shared_moves)
                                        }
                                       };
                                      })*/
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
  
  });
  
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
};
