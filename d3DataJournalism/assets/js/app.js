// svg nominal area
var svgWidth = 1000;
var svgHeight = 750;

// margin arounbd chart area
var margin = {
    top: 80,
    right: 80,
    bottom: 80,
    left: 80
};

// define chart dimensions inside margin
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// append svg area to the 'scatter' div and make chart responsive
var svg = d3.select('#scatter')
    .append('svg')
    .attr('viewBox', `0 0 ${svgWidth} ${svgHeight}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

// append group area with margins
var chartGroup = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);  

// load csv data
d3.csv('./assets/data/data.csv').then( censusData => {

    // log the censusData
    console.log(censusData);
  
    // cast strings to number
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
    
    // x-scale - 5% padding left & right
    var xLinearScale = d3.scaleLinear()
        .domain([
            d3.min( censusData, d => d.income ) * 0.95, 
            d3.max( censusData, d => d.income ) * 1.05
        ])
        .range([0, chartWidth])
        .nice();
        
    // y-scale - 5% padding top & bottom
    var yLinearScale = d3.scaleLinear()
        .domain([
            d3.min( censusData, d => d.obesity ) * 0.95, 
            d3.max( censusData, d => d.obesity ) * 1.05
        ])
        .range([chartHeight, 0])
        .nice();

    // chart axes relative to x/y scale
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // tooltip for mouse hover
    var d3Tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([40, -65])
        .html( d => `
            <b>${d.state}</b><br>
            Income: $${d.income.toLocaleString()}<br>
            Obesity: ${d.obesity}%
        `);

    svg.call(d3Tip);

    // append SVG circles
    chartGroup.selectAll('circle')
        .data(censusData)
        .enter()
        .append('circle')
        .attr('class', 'stateCircle')
        .attr('cx', d => xLinearScale(d.income) )
        .attr('cy', d => yLinearScale(d.obesity))
        .attr('r', '12');
    
    // append SVG text
    chartGroup.selectAll('text')
        .data(censusData)
        .enter()
        .append('text')
        .text( d => d.abbr )
        .attr('class', 'aText  stateText active inactive')
        .attr('dominant-baseline', 'central')
        .attr('x', d => xLinearScale(d.income) )
        .attr('y', d => yLinearScale(d.obesity))
        .on('mouseover', d3Tip.show)
        .on('mouseout', d3Tip.hide);

    // append SVG group with left axis
    chartGroup.append('g')
        .attr('class', 'axis')
        .call(leftAxis)
        .append('text')
        .attr('class', 'axis-title')
        .attr('transform', `translate(${-margin.left * 0.5}, ${chartHeight * 0.5}) rotate(-90)` )
        .text('Obesity [%]');

    // append SVG group with bottom axis
    chartGroup.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0, ${chartHeight})`)
        .call(bottomAxis)
        .append('text')
        .attr('class', 'axis-title')
        .attr('transform', `translate(${chartWidth * 0.5}, ${margin.bottom * 0.5})` )
        .text('Income [$]');

});