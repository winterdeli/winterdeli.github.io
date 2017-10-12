(function () {
  var projection;
  var geoPath;
  var svg;
  var g;
  var width = 1100;
  var height = 500;
  var scale = 1350;
  var centered;

  function clicked(d) {
    // If the click was on the centered state or the background, re-center.
    // Otherwise, center the clicked-on state.
    if (!d || centered === d) {
      projection.scale(scale);
      projection.translate([width / 2, height / 2]);
      centered = null;
    } else {
      // scale first, then translate
      projection.scale(scale * 4);
      // then translate
      var centroid = geoPath.centroid(d);
      var translate = projection.translate();
      projection.translate([
        (translate[0] - centroid[0] + width / 2),
        (translate[1] - centroid[1] + height / 2)
      ]);
      centered = d;
    }

    g.selectAll("path")
      .classed("active", centered && function (d) { return d === centered; });

    g.selectAll("path")
      .transition()
      .duration(750)
      .attr("d", geoPath)
      ;

    var event = new CustomEvent('selectProv', { detail: { data: d } });
    document.dispatchEvent(event);
  }

  window.LAB1 = {};

  window.LAB1.init = function () {
    projection = d3.geoEquirectangular()
      .scale(scale)
      .translate([width / 2, height / 2])
      .center([118, -3])
      ;

    geoPath = d3.geoPath()
      .projection(projection);

    svg = d3.select('#map_area')
      .append('svg')
      .attr('width', width)
      .attr('height', height)

    svg.append("rect")
      .attr("class", "background")
      .attr("width", width)
      .attr("height", height)
      .on("click", clicked);

    g = svg.append('g');

    d3.queue()
      // .defer(d3.json, 'assets/lab/indonesia.json')
      .defer(d3.json, 'assets/lab/idn.json')
      .defer(d3.json, 'assets/lab/idn_data1.json')
      .await(function (error, topology, data) {
        console.log(arguments);
        if (error) {
          throw error;
        }

        var i = 0;
        var di = 0;
        var total = 0;
        for (i = 0; i < data.length; i++) {
          total += data[i]['2015'];
        }
        var avg = total / data.length;
        console.log(total, avg);

        var b = geoPath.bounds(topology);
        var geojson = topojson.feature(topology, topology.objects.IDN_adm1);
        // var geojson = topojson.feature(topology, topology.objects.states_provinces);

        g.append('g')
          .attr('class', 'prov')
          .selectAll('path')
          .data(geojson.features)
          .enter().append('path')
          .attr('d', geoPath)
          .attr('fill', function (d) {
            console.log(d);
            for (i = 0; i < data.length; i++) {
              di = 0;
              if (data[i].prov === d.properties.NAME_1) {
                // if (data[i].prov === d.properties.name) {
                di = data[i]['2015'];
                if (di >= 50 && di < 60) {
                  return '#C4FFF9';
                } else if (di >= 60 && di < 70) {
                  return '#68D8D6';
                } else if (di >= 70 && di < 80) {
                  return '#07BEB8';
                } else {
                  return '#ddd';
                }
                break;
              }
            }
          })
          .on("click", clicked);;
      });
  };
}());