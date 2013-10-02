var $container = $('#chart-show'),
    container_width  = $container.width(),
    container_height = $container.height();

var margin = {top: 0, right: 0, bottom: 0, left: 0},
    width = container_width - margin.left - margin.right,
    height = container_height - margin.top - margin.bottom;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var y = d3.scale.linear()
    .rangeRound([height, 0]);

var color = d3.scale.ordinal()
    .range(['#FC8D62','#8DA0CB','#8df6cc'])
    .domain(['auto','bike','other']);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format(".2s"));

var dataset;

d3.csv("cum_sum_at_fault.csv", function(error, data) {

  window.format = d3.time.format("%Y-%m-%d");

  data.forEach(function(d) {

    d.day   = format.parse(d.date);

    d.auto  = +d.auto;
    d.bike  = +d.bike;
    d.other = +d.other;
    d.total = d.auto + d.bike + d.other;
  });

  dataset = data;

  var currentDay = data[0].day;

  // setInterval(function(){
  //   showUpTo(currentDay);
  //   currentDay.setTime(currentDay.getTime() + (24 * 60 * 60 * 1000));
  // },20);


  // showUpTo(new Date());
});

function showUpTo(endDate){
  var range = [];
  var lastItem;

  dataset.forEach(function(item){
    if (item.day <= endDate){
      if (lastItem && lastItem.year_month == item.year_month){
        range[range.length-1] = item;
      } else {
        lastItem = item;
        range.push(item);
      }
    }
  })

  range.forEach(function(day){
    var y0 = 0;
    
    day.crashes = color.domain().map(function(name) { 
      return { name: name, y0: y0, y1: y0 += +day[name] }; 
    });

    day.total = day.crashes[day.crashes.length - 1].y1;
  })

  d3.select(".barchart").remove();

  var svg = d3.select("#chart-show").append("svg")
      .attr("class", "barchart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
  x.domain(range.map(function(d) { return d.year_month; }));
  y.domain([0, d3.max(range, function(d) { return d.total; })]);

  var month = svg.selectAll(".month")
      .data(range)
    .enter().append("g")
      .attr("class", "g")
      .attr("transform", function(d) { return "translate(" + x(d.year_month) + ",0)"; });

  month.selectAll("rect")
      .data(function(d) { return d.crashes; })
    .enter().append("rect")
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.y1); })
      .attr("height", function(d) { return y(d.y0) - y(d.y1); })
      .style("fill", function(d) { return color(d.name); });
}