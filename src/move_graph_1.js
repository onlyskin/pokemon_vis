d3.json("static/data/stripped_down_json.json", function(error, json) {
  if (error) throw error;

  function build_move_dict(data) {
  	data = data["json"];
  	move_dict = {};
  	for (var i = 0; i < data.length; i++) {
  		for (var j = 0; j < data[i]["moves"].length; j++) {
  			if (data[i]["moves"][j] in move_dict) {
  				move_dict[data[i]["moves"][j]] += 1;
  			}
  			else {
  				move_dict[data[i]["moves"][j]] = 1;
  			}
  		}
  	}
  	console.log(move_dict);
  	final_data_array = [];
  	for (var i in move_dict) {
  		var temp_obj = {};
  		temp_obj["move_name"] = i;
  		temp_obj["value"] = move_dict[i];
  		final_data_array.push(temp_obj)
  	}
  	return final_data_array;
  };

  height = 600;
  width = 1200;

  svgContainer = d3.select("body")
  				.append("svg")
  				.attr("height", height)
  				.attr("width", width);

  bar_group = svgContainer.append("g").attr("id", "bars");

  var move_to_value = build_move_dict(json);
  console.log(move_to_value);
  var max_shared_moves = d3.max(move_to_value, function(d) {return d.value;});

  function update() {

	  bar_update_selection = svgContainer.select("#bars").selectAll("rect")
	  					 .data(move_to_value.sort( function (a,b) {return +b.value - +a.value;}));

	  bar_enter_selection = bar_update_selection.enter();

	  bar_update_selection.exit().remove();

	  actual_bars = bar_enter_selection.append("rect")
	  					 .attr("x", function(d, i) { return width / move_to_value.length * i; })
	  					 .attr("y", height)
	  					 .attr("width", function(d) { return width / move_to_value.length; })
	  					 .attr("height", 0)
	  					 .attr("shape-rendering", "crispEdges")
	  					 .attr("fill", "blue")
	  					 .attr("opacity", 1e-6)
	  					 .transition()
	  					 .duration(2000)
	  					 .attr("y", function(d) { return height - ((height / max_shared_moves) * d.value); })
	  					 .attr("height", function(d) { return (height / max_shared_moves) * d.value; })
	  					 .attr("opacity", 0.5);

	  transparent_bars = bar_enter_selection.append("rect")
	  					 .attr("x", function(d, i) { return width / move_to_value.length * i; })
	  					 .attr("y", 0)
	  					 .attr("width", function(d) { return width / move_to_value.length; })
	  					 .attr("height", height)
	  					 .attr("opacity", 0)
	  					 .attr("shape-rendering", "crispEdges");

	  mouseover_text = transparent_bars.on("mouseover", function(d, i) { svgContainer.append("text")
	  												 			 .text(d.move_name + " - " + d.value)
	  												 			 .attr("x", width / move_to_value.length * i)
	  												 			 .attr("y", height - ((height / max_shared_moves) * d.value))
	  												 			 .classed("mouseover_text", true);

	  												 			 d3.select(this).attr("opacity", 1);
																		})

	  				  .on("mouseout", function() { svgContainer.selectAll(".mouseover_text").remove();

	  				  							   d3.select(this).attr("opacity", 0);
	  				  							 } );
  	}

  	update();

});