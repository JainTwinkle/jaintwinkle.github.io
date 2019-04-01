/*global d3, console */

// https://archive.ics.uci.edu/ml/machine-learning-databases/glass/glass.data

// color is taken from quantitive colormaps of color brewer website
var color = ['#e41a1c','#377eb8','#4daf4a','#984ea3',
             '#ff7f00','#ffff33','#a65628','#f781bf']

function makeDonutChart() {
  var margin = {top:40, bottom:40, left:40, right:40};
  var height = 200;
  var width = 200;
  var radius = Math.min(width, height) / 2;
  var donutWidth = 25;

  function chart(selection) {

    selection.each(function(data) {
      // select the svg
      var svg = d3.select(this)
                  .attr("width", width)
                  .attr("height", height);

      // define graphics object
      var g = svg.selectAll("g")
                 .data([data]);

      g = g.enter().append("g")
        .merge(g)
        .attr('transform', 'translate(' + (width/2) + ',' + (height/2) + ')');

      // define scatter plot height-width
      var svgWidth = width - margin.left - margin.right;
      var svgHeight = height - margin.bottom - margin.top;

      // count same glass type occurrance in the dataset and make new dataset;
      // This new dataset "data_count" will be used for the donut chart
      var data_count = d3.nest()
        .key(function(d) {
          return d.glassType;
        })
        .rollup(function(leaves) {
          return (leaves.length != 0) ? leaves.length : 0 ;
        })
        .entries(data);

      // The tooltip code is taken from :
      //  https://bl.ocks.org/mbhall88/b2504f8f3e384de4ff2b9dfa60f325e2

      // define tooltip and update the scatter plot on mouse events
      function toolTip(selection) {
        selection.on('mouseenter', function (data) {
          svg.append('text')
            .attr('class', 'toolCircle')
            .attr('dx', 100)
            .attr('dy', 108)
            .html("<tspan> Type " + data.data.key + " count: " + data.data.value
                  + "</tspan>") // add text
            .style('font-size', '1.0em')
            .style('text-anchor', 'middle'); // centres text in tooltip

          svg.append('circle')
            .attr('class', 'toolCircle')
            .attr('transform', 'translate(' + (width/2) + ',' + (height/2) + ')')
            .attr('r', radius * 0.65) // radius of tooltip circle
            .style("fill", color[data.data.key])
            .style('fill-opacity', 0.35);

          // update the scatter-plot with one category
          var scatterChart = makeScatterPlot()
                              .category([data.data.key]);
          d3.select("#svg1")
            .call(scatterChart);
      });

      // remove the tooltip objects and reset the scatter plot
      selection.on('mouseout', function () {
        d3.selectAll('.toolCircle').remove();

        var scatterChart = makeScatterPlot();
        d3.select("#svg1")
          .call(scatterChart);
        });
      }

      // define the arc
      var arc = d3.arc()
                  .innerRadius(radius - donutWidth)
                  .outerRadius(radius);

      // define the slice
      var pie = d3.pie()
                  .value(function(d) { return d.value; })
                  .padAngle(.02)
                  .sort(null);

      // mark empty if brushed area doesn't include any datapoints
      if (data_count.length == 0) {
        data_count = [{key : "empty", value:1}];
      }

      // process the data_count dataset
      data_count.forEach(function(d) {
          d.value = +d.value;
      });
      // define donut for the arc slice
      var donut = g.selectAll("path")
                  .data(pie(data_count));
      donut.exit().remove();
      donut.enter().append("path")
        .merge(donut)
          .attr('d', arc)
          .style("fill", function(d) { return color[d.data.key]; })

      // call tooltip function
      d3.selectAll("path").call(toolTip);

    }); // selection.each ends here
  } // chart function ends here
  return chart;
}
// scatter plot is inspired by:
// http://bl.ocks.org/curran/f4041cac02f19ee460dfe8b709dc24e7
function makeScatterPlot() {
  // define variables
  var margin = {top:40, bottom:40, left:40, right:40};
  var height = 450;
  var width = 450;
  var xField = "Ca";
  var yField = "Al";
  var svgWidth = width - margin.left - margin.right;
  var svgHeight = height - margin.bottom - margin.top;
  var x = d3.scaleLinear().range([0, svgWidth]);
  var y = d3.scaleLinear().range([svgHeight, 0]);
  var xAxis = d3.axisBottom(x);
  var yAxis = d3.axisLeft(y);
  var category = [1,2,3,4,5,6,7];

  function chart(selection) {

    selection.each(function() {
      // select the svg
      var svg = d3.select(this)
          .attr("width", width)
          .attr("height", height);

      // remove all object before redrawing
      // this was needed to clear the brush as in v4
      svg.selectAll("*").remove();

      var g = svg.append('g')
          .attr("transform",
                "translate(" + margin.left + "," + margin.top +")");

      // set opacity if the scatter plot is updated from donut chart
      function setOpacity(d)
      {
        if (category.length == 1) {
          var cat = +category[0];
          return (d != cat) ? "0.0" : "1";
        }
        else {
          return "1";
        }
      }
      // Get the data
      d3.csv("glass.data", function(error, data) {
        // process the data
        data.forEach(function(d) {
            d[xField] = +d[xField];
            d[yField] = +d[yField];
            d.glassType = +d.glassType;
        });

        // this will also make grid lines
        xAxis.tickSize(-svgWidth);
        yAxis.tickSize(-svgHeight);
        // set the scale
        x.domain([Math.floor(d3.min(data, function (d) { return d[xField]; })),
                 Math.ceil(d3.max(data, function (d) { return d[xField]; })) ]);
        y.domain([Math.floor(d3.min(data, function (d) { return d[yField]; })),
                 Math.ceil(d3.max(data, function (d) { return d[yField]; })) ]);

        // Add the X Axis
        g.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + svgHeight + ")")
          .call(xAxis)
          .append("text")
            .attr("x", svgWidth - 45)
            .attr("dy", "-0.5em")
            .style("fill", "red")
            .style("font-size","12.5px")
            .text(xField); // add X-axis label

        // Add the Y Axis
        g.append("g")
          .attr("class", "y axis")
          .call(yAxis)
          .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dx", "-1.81em")
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .style("fill", "red")
            .style("font-size","12.5px")
            .text(yField); // add Y-axis text

        // define brush and datapoint graphics object
        var datapoints = g.append('g');
        var brush = d3.brush()
                .extent([[0,0], [svgWidth, svgHeight]])
                .on("start brush end", brushed); // call brushed upon brushing

        // call brush
        g.append('g')
          .attr("class", "brush")
          .call(brush);

        // add circle datapoints
        var dots = datapoints.selectAll('.dot')
            .data(data);
        dots.enter().append("circle")
          .attr("class", 'dot')
          .attr('r', 3.0)
          .attr('cx', function(d) { return x(d[xField]);})
          .attr('cy', function(d) { return y(d[yField]);})
          .style("fill", function(d) { return color[d.glassType] })
          .style("position", "fixed")
          .style("opacity", function(d) { return setOpacity(d.glassType); });

        var donutChart = makeDonutChart(data);

        // don't create/modify donut chart if updated from donut chart
        if (category.length != 1) {
          d3.select("#svg2")
          .datum(data)
          .call(donutChart);
        }
        // code for calculate the selected datapoints
        function getSelectedData(topLeftX, topLeftY, bottomRightX, bottomRightY)
        {
          var listData = [];
          data.forEach(function(d) {
              var xPos = x(d[xField]),
                  yPos = y(d[yField]);
              if ((xPos >= topLeftX && yPos >= topLeftY &&
                   xPos < bottomRightX && yPos < bottomRightY ) ||
                  (xPos > topLeftX && yPos > topLeftY &&
                  xPos <= bottomRightX && yPos <= bottomRightY )
                 ) {
                  listData.push(d);
              }
          });
          return listData;
        }

        // define brushed function
        function brushed()
        {
          if (!d3.event.selection) {
              // reset the donut chart if not brush is not selected
              d3.select("#svg2")
              .datum(data)
              .call(donutChart);
          } else
            {
              var s = d3.event.selection, selectedData;
              if(dots) {
                // get the selected data
                selectedData = getSelectedData(s[0][0], s[0][1], s[1][0], s[1][1]);
              }
              // updated the donut chart
              d3.select("#svg2")
              .datum(selectedData)
              .call(donutChart);
            }
        }
      }); // csv data function
    }); // selection.each
  } // chart function

  // category can be configured for updating the chart
  chart.category = function(_) {
    return arguments.length ? (category = _, chart) : category;
  };
  return chart;
}

// make legends seperately
function makeLegends()
{
  var margin = {top:40, bottom:40, left:40, right:40};
  var width = 450;
  var height = 260;

  // use the legend dataset
  d3.csv("legend.data", function(error, data) {
    var svg = d3.select("#legend").append("svg")
                .attr("width", width - margin.left - margin.right)
                .attr("height", height - margin.top - margin.bottom)
                .append("g")
                .attr("transform", "translate(0," + margin.top + ")");
    data.forEach(function(d) {
        d.num = +d.num;
    });
    // add the rectangles
    var legend = svg.selectAll(".legend")
                    .data(data)
                    .enter()
                    .append("g");
    legend.append("rect")
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", function(d) { return color[d.num]})
      .attr("y", function (d, i) {
          return (i+1) * 25 - 60;
      });
      // add the labels
      legend.append("text")
        .attr("class", "label")
        .attr("y", function (d, i) {
            return (i+1) * 25 - 46;
        })
        .attr("dx", "2.3em")
        .attr("text-anchor", "start")
        .style("marginleft", "25px")
        .text(function (d) {
            return d.name;
        });
  }); // csv data
}

// main function
function main()
{
  makeLegends();
  var scatterChart = makeScatterPlot();
  d3.select("#svg1")
    .call(scatterChart);
}

main();
