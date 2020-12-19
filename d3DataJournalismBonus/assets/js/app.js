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

// append margins to chart area group
var chartGroup = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);  

// -----------------------------------------------

// initial params
var chosenXAxis = 'income';

// fupdate x-scale upon click on axis label - 5% padding
function xScale(censusData, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
        .domain([
            d3.min(censusData, d => d[chosenXAxis]) * 0.95,
            d3.max(censusData, d => d[chosenXAxis]) * 1.05
        ])
        .range([0, chartWidth])
        .nice();
    return xLinearScale;
}

// update xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}

// update circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr('cx', d => newXScale(d[chosenXAxis]));
    return circlesGroup;
}

// update text group with a transition to new circles
function renderText(textGroup, newXScale, chosenXAxis) {
    textGroup.transition()
        .duration(1000)
        .attr('x', d => newXScale(d[chosenXAxis]));
    return textGroup;
}

// updating text group with new tooltip
function updateToolTip(chosenXAxis, textGroup) {
    var label;
    if ( chosenXAxis === 'income' ) { label = 'Income: '; }
    else { label = 'Age: '; }
    var d3Tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([40, -65])
        .html( d => 
            `<b>${d.state}</b><br>
            ${label}: ${d[chosenXAxis]}<br>
            Obesity: ${d.obesity}%`
        );
    textGroup.call(d3Tip);
    textGroup.on('mouseover', d3Tip.show).on('mouseout', d3Tip.hide);
    return textGroup;
}

// -----------------------------------------------

// load csv data
d3.csv('./assets/data/data.csv').then( (censusData, err) => {

    // error handler
    if (err) throw err;

    // log the censusData
    // console.log(censusData);
  
    // cast strings to numbers
    censusData.forEach( d => {
        d.age = +d.age;
        d.income = +d.income;
        d.obesity = +d.obesity;
    });  
    
    // x-scale for chosen axis
    var xLinearScale = xScale(censusData, chosenXAxis);
        
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

    // append SVG circles
    var circlesGroup = chartGroup.selectAll('circle')
        .data(censusData)
        .enter()
        .append('circle')
        .attr('class', 'stateCircle active inactive')
        .attr('cx', d => xLinearScale(d[chosenXAxis]) )
        .attr('cy', d => yLinearScale(d.obesity))
        .attr('r', '12');

    // // append SVG text
    var textGroup = chartGroup.selectAll('text')
        .data(censusData)
        .enter()
        .append('text')
        .text( d => d.abbr )
        .attr('class', 'aText stateText active inactive')
        .attr('dominant-baseline', 'central')
        .attr('x', d => xLinearScale(d[chosenXAxis]) )
        .attr('y', d => yLinearScale(d.obesity));
    
    // group for two x-axis labels
    var labelsGroup = chartGroup.append('g')
        .attr('transform', `translate(${chartWidth * 0.5}, ${chartHeight + (margin.bottom / 4)})`);

    var incomeLabel = labelsGroup.append('text')
        .attr('x', 0)
        .attr('y', margin.bottom / 4)
        .attr('value', 'income')
        .attr('class', 'active')
        .text('Income [$]');

    var ageLabel = labelsGroup.append('text')
        .attr('x', 0)
        .attr('y', margin.bottom / 2)
        .attr('value', 'age')
        .attr('class', 'inactive')
        .text('Age [years]');

    // append SVG group with left axis
    chartGroup.append('g')
        .attr('class', 'axis')
        .call(leftAxis)
        .append('text')
        .attr('class', 'active')
        .attr('transform', `translate(${-margin.left * 0.5}, ${chartHeight * 0.5}) rotate(-90)` )
        .text('Obesity [%]');

    // append SVG group with bottom axis
    var xAxis = chartGroup.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0, ${chartHeight})`)
        .call(bottomAxis);

    // updateToolTip function above csv import
    var textGroup = updateToolTip(chosenXAxis, textGroup);

    // x axis labels event listener
    labelsGroup.selectAll('text').on('click', function() {
    
        // get value of selection
        var value = d3.select(this).attr('value');
        if (value !== chosenXAxis) {

            // replaces chosenXAxis with value
            chosenXAxis = value;
            console.log(chosenXAxis);

            // functions here found above csv import
            // updates x scale for new data
            xLinearScale = xScale(censusData, chosenXAxis);

            // updates x axis with transition
            xAxis = renderAxes(xLinearScale, xAxis);

            // updates circles and text with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
            textGroup = renderText(textGroup, xLinearScale, chosenXAxis);

            // updates tooltips with new info
            textGroup = updateToolTip(chosenXAxis, textGroup);

            // changes classes to change bold text
            if (chosenXAxis === 'age') {
                ageLabel.attr('class', 'active');
                incomeLabel.attr('class', 'inactive');
            }
            else {
                ageLabel.attr('class', 'inactive');
                incomeLabel.attr('class', 'active');
            }
        }
    });

}).catch( error => console.log(error) );