// svg area, margins, & chart area
var svgWidth = 800;
var svgHeight = 500;

var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
};

var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// console.log(svgHeight);

// append svg area to 'scatter' div make chart responsive
var svg = d3.select('#scatter')
  .append('svg')
  .attr('viewBox', `0 0 ${svgWidth} ${svgHeight}`)
  .attr('preserveAspectRatio', 'xMidYMid meet');



// Append a group area with margins
var chartGroup = svg.append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`);  

// Load data from miles-walked-this-month.csv
d3.csv('./assets/data/data.csv').then( censusData => {

    // Print the milesData
    console.log(censusData);
  
    // Cast strings to a number
    censusData.forEach( d => {
      d.age = +d.age;
      d.ageMoe = +d.ageMoe;
      d.healthcare = +d.healthcare;
      d.healthcareHigh = +d.healthcareHigh;
      d.healthcareLow = +d.healthcareLow;
      d.id = +d.id;
      d.income = +d.income;
      d.incomeMoe = +d.incomeMoe;
      d.obesity = +d.obesity;
      d.obesityHigh = +d.obesityHigh;
      d.obesityLow = +d.obesityLow;
      d.poverty = +d.poverty;
      d.povertyMoe = +d.povertyMoe;
      d.smokes = +d.smokes;
      d.smokesHigh = +d.smokesHigh;
      d.smokesLow = +d.smokesLow;
    });  
    
    // x scale with 5% padding
    var xLinearScale = d3.scaleLinear()
        .domain([
            d3.min( censusData, d => d.income ) * 0.95, 
            d3.max( censusData, d => d.income ) * 1.05
        ])
        .range([0, chartWidth]);

    // y scale with 5% padding
    var yLinearScale = d3.scaleLinear()
        .domain([
            d3.min( censusData, d => d.obesity ) * 0.95, 
            d3.max( censusData, d => d.obesity ) * 1.05
        ])
        .range([chartHeight, 0]);

    // Functions for chart axes relative to x/y scale
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // tooltip for mouse hover
    var d3Tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([40, -65])
        .html( d => `<b>${d.state}</b><br>Income: $${d.income.toLocaleString()}<br>Obesity: ${d.obesity}%` );

    svg.call(d3Tip);

    // Append an SVG path and plot its points using the line function, give the path a class of line
    chartGroup.selectAll('circle')
        .data(censusData)
        .enter()
        .append('circle')
        .attr('class', 'stateCircle')
        .attr('cx', d => xLinearScale(d.income) )
        .attr('cy', d => yLinearScale(d.obesity))
        .attr('r', '12');
        // .attr('fill', 'darkblue')
        // .attr('opacity', '0.6');

    chartGroup.selectAll('text')
        .data(censusData)
        .enter()
        .append('text')
        .text( d => d.abbr )
        .attr('class', 'aText active inactive')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('x', d => xLinearScale(d.income) )
        .attr('y', d => yLinearScale(d.obesity))
        .on('mouseover', d3Tip.show)
        .on('mouseout', d3Tip.hide);

    // Append an SVG group element to the SVG area, create the left axis inside of it, and give it a class of 'axis'
    chartGroup.append('g')
        .attr('class', 'axis')
        .call(leftAxis);

    chartGroup.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0, ${chartHeight})`)
        .call(bottomAxis);

});