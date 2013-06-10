var SQ = SQ || {};

SQ.Utils = (function(document, window, undefined) {
  // utility to calculate the width of numbers based on their size
  // based on LeagueGothic font with a fallback for Arial
  var KernCalculator = (function() {
    var pcentWidths = { 
      0:{ width:18 }, 1:{ width:12 }, 2:{ width:18 }, 
      3:{ width:17 }, 4:{ width:17 }, 5:{ width:17 }, 
      6:{ width:17 }, 7:{ width:14 }, 8:{ width:17 },
      9:{ width:18 } 
    };
    var pcentSymbolWidth = 15;

    var calculatePercentOffset = function(numString, ieFlag) {
      var totalLength = 0,
          i = 0;
      numString = String(numString);
      if (ieFlag) {// Arial fallback
        return numString.length * 21;
      }
      for (i = 0; i < numString.length; i++) {
        var characterObj = pcentWidths[numString.charAt(i)];
        totalLength = totalLength + characterObj.width;
      }
      return totalLength;
    };

    return calculatePercentOffset;
  }());

  // convenience function to format the data for easy 
  // consumption by our donut
  var DataFormatter = (function () {
    var getRemainder = function (match) {
      return 100 - match;
    };

    var writeDataToArray = function(data) {
      var score = parseInt(data.score, 10);
      var remainder = getRemainder(score);
      return {
        userId:    data.userId,
        quartile:  data.quartile,
        scoreData: [{population: remainder, label: 'not-match' },
                    {population: score,     label: 'match' }]
      };

    };

    var dataFormatter = function (data) {
      _.each(data, function(element, index, array){
        array[index] = writeDataToArray(element);
      });
      return data;
    };

    return dataFormatter;
  }());
  return {
    KernCalculator: KernCalculator,
    DataFormatter:  DataFormatter
  };

}(document, window, document));

SQ.Charts = SQ.Charts || {};
(function (d3, Charts, document, window, undefined) {

  // defaults, and variable declarations
  var width = 160,
      height = 160,
      innerCircleRadius = 40,
      outerArcOuterRadius,
      outerArcInnerRadius,
      arc,
      pie,
      colors, innerFill, textColor;

  // loop through an array of formatted data
  var createDonutCharts = function (data, options) {
    setOptions(options);
    _.each(data, function(element, index, list) {
      drawDonutChart(element);
    });
  };

  // draw a single donut chart
  var drawDonutChart = function ( data ) {
    var userId = data.userId,
        divPrefix = '.donut-user-',// TODO make this configurable
        destinationDiv = divPrefix + userId,
        chartData = data.scoreData,
        total = chartData[1].population;

    chooseColors(data.quartile);
    var svg = appendSVGElement(destinationDiv);
    drawOuterCircle(svg, chartData);
    drawInnerCircle(svg, total);
    drawText(svg, total);
  };
  // end draw donut chart - single donut
  
  // set the configurable options on our donut chart
  // TODO - make some shit configurable!
  var setOptions = function (options) {
    options = options || {};
    determineRadii();
  };

  var chooseColors = function(quartile) {
    var green  = '#97ce68',
        grey   = '#e3e3e4',
        red    = '#ff6766',
        orange = '#f7a720',
        colorSelector = [undefined, green, orange, red];

    innerFill = '#6BCBCA';
    textColor = '#ffffff';
        

    var colorRange = [grey, colorSelector[quartile]];

    colors = d3.scale.ordinal()
        .range(colorRange);
  };

  //set the radii for the outer arcs
  var determineRadii = function () {
    outerArcOuterRadius = Math.min(width, height) / 2;
    outerArcInnerRadius = innerCircleRadius + 2;
  };


  // append the svg element to our selector
  var appendSVGElement = function(selector) {
    return d3.select(selector).append("svg")
                              .attr("width", width)
                              .attr("height", height)
                              .append("g")
                              .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
  };

  // draw the outer arcs
  var drawOuterCircle = function(svg, chartData) {
    // set up the arcs with correct radii
      arc = d3.svg.arc()
                  .outerRadius(outerArcOuterRadius)
                  .innerRadius(outerArcInnerRadius);


      pie = d3.layout.pie()
                     .sort(null)
                     .value(function(d) { 
                       return d.population; 
                     });
      // create the outer segments
      var g = svg.selectAll(".arc")
              .data(pie(chartData))
              .enter()
              .append("g")
              .attr("class", "arc");
      g.append("path")
       .attr("d", arc)
       .style("fill", function(d) {
         return colors(d.data.label);
       });
  };

  var drawInnerCircle = function(svg, total) {
    // create the inner circle
    var innerCircle = svg.selectAll('circle')
                         .data([total])
                         .enter()
                         .append('circle');

    innerCircle.attr("r", innerCircleRadius)
               .attr("fill", innerFill);
  };

  var drawText = function(svg, total) {
    //
    // TODO - detect IE8 for text width calculation
    var ieFlag = SQ.IEFlag,
        textWidth = SQ.Utils.KernCalculator(total, ieFlag),
        textYOffset,
        textSize,
        percentYOffset,
        percentSize;

    if (ieFlag) {
      textYOffset = 1;
      textSize = '40px';
      percentYOffset = 4;
      percentSize = '26px';
    }
    else {
      textYOffset = 17;
      textSize = '50px';
      percentYOffset = 16;
      percentSize = '30px';
    }

    

    var numText = svg.append("text")
        .data([total])
        .attr("x", function(d){

           return -( textWidth / 2 ) - 7;
         })
        .attr("y", function(d){
           return textYOffset;
         })
        .text(function(d){
          return d;
        })
        .attr('fill', textColor)
        .style('font-size', textSize)
        .style('font-family', 'LeagueGothic, Verdana, Arial');

      // work out the  position of the text

    var percentText = svg.append("text")
        .attr("x", function(d){
           return textWidth / 2 - 7;
         })
        .attr("y", function(d){
           return percentYOffset;
         })
        .text(function(d){
          return '%';
        })
        .attr('fill', textColor)
        .style('font-size', percentSize)
        .style('font-family', 'LeagueGothic, Verdana, Arial');
  };

  Charts.Donut = {
    createDonutCharts: createDonutCharts,
    setOptions: setOptions
  };

}(d3, SQ.Charts, document, window));
