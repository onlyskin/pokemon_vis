d3.json("static/data/force_data_151.json", function(error, graph) {
  if (error) throw error;

  var filtered_links = [],
    filtered_nodes = [];

  var current_threshold = 0;

  var width = 1200,
    height = 1200,
    image_size = 60;

  var padding = 1,
      radius = image_size/2;

  var svg = d3.select("#svg_container").append("svg")
    .attr("width", width)
    .attr("height", height);

  svg.append("g").attr("id", "links");
  svg.append("g").attr("id", "nodes");

  var force = d3.layout.force()
    .size([width, height])
    .gravity(0.1)
    .alpha(0.1)
    .nodes(filtered_nodes)
    .links(filtered_links)
    .charge(-300)
    .chargeDistance(500)
    .linkDistance(image_size*0.6)
//    .linkDistance(function (link) { return ( link.value )*6 })
    .on("tick", tick);

  function tick() {
    links
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

    nodes
      .attr("x", function(d) { return d.x - (image_size/2); })
      .attr("y", function(d) { return d.y - (image_size/2); });

    nodes.each(collide(0.1));
  }

  function stay_in_area() {
    return
  }

  function calculate_link_stroke_width(value) {
    //return 0;
    return value.value;
    //return Math.sqrt(value.value);
  };

  function collide(alpha) {
    var quadtree = d3.geom.quadtree(graph.nodes);
    return function(d) {
      var rb = 2*radius + padding,
          nx1 = d.x - rb,
          nx2 = d.x + rb,
          ny1 = d.y - rb,
          ny2 = d.y + rb;
      quadtree.visit(function(quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== d)) {
          var x = d.x - quad.point.x,
              y = d.y - quad.point.y,
              l = Math.sqrt(x * x + y * y);
            if (l < rb) {
            l = (l - rb) / l * alpha;
            d.x -= x *= l;
            d.y -= y *= l;
            quad.point.x += x;
            quad.point.y += y;
          }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
      });
    };
  }

  function update(threshold) {

    current_threshold = threshold;
    if (current_threshold < 3) {radius = image_size; force.gravity(0.8).alpha(1);}
    else {radius = image_size/2; force.gravity(0.1).alpha(0.1);}

    filtered_links.splice(0, filtered_links.length);
    Array.prototype.push.apply(filtered_links, graph.links.filter(function (d) {return d.value >= threshold; }));

    function name(link) {
      return "" + link.source.index + "-" + link.target.index;
    }

    links = svg.select("#links").selectAll(".link").data(force.links(), name);

    links.enter()
      .append("line")
      .attr("class", "link")
      .style("stroke-width", function(d) { return calculate_link_stroke_width(d) });

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
      .attr("xlink:href", function(d) { return "sprites/pokeapi_cache_sprites_gold/" + d.number + ".png"})
      .attr("width", image_size + "px")
      .attr("height", image_size + "px")
      .call(force.drag);

    nodes.exit().remove();

    force.start();
  }

  update(0);
  update(10);

  d3.select("#threshold").on("input", function() {
    update(+this.value);
  });

});