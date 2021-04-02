/*
ePIRLS data story
Yuqi Liao
*/

// scollama code heavily adapted from
//https://pudding.cool/process/introducing-scrollama/

// initial d3 selections for convenience
var container = d3.select('#scroll');
var graphic = container.select('.scroll__graphic');
var chart = graphic.select('.plotArea');
var text = container.select('.scroll__text');
var step = text.selectAll('.step');

// initialize scrollama
var scroller = scrollama();

// resize function to set dimensions on load and on page resize
function handleResize() {

	// 1. update height of step elements for breathing room between steps
	var stepHeight = Math.floor(window.innerHeight * 0.9);
	step.style('height', stepHeight + 'px');

	// 2. update height of graphic element
	var bodyWidth = d3.select('body').node().offsetWidth;

	graphic
		.style('height', window.innerHeight + 'px');

	// 3. update width of chart by subtracting from text width
	var chartMargin = 10;
	var textWidth = text.node().offsetWidth;
	var chartWidth = graphic.node().offsetWidth - textWidth - chartMargin;
    var chartHeight = Math.floor(chartWidth * 0.66)

	chart
		.style('width', chartWidth + 'px')
		.style('height', chartHeight + 'px');

    // 4. update dimensions of svg element in chart div
    var svg = d3.select(".plotArea is-active").select("svg")

    svg
        .attr("width", chartWidth + "px")
        .attr("height", chartHeight + "px")

	// 5. tell scrollama to update new element dimensions
	scroller.resize();
}


function handleStepEnter(response) {
	// response = { element, direction, index }
   //console.log(step);
    //console.log(step.attr('class'));
    //console.log(step.classed('is-active', false));


    // change class for current text to active
    // console.log(step.classed('is-active'));
    step.classed('is-active', function (d, i) {
         // console.log(d);
         // console.log(i);
         //console.log(response.index);
         //console.log(i === response.index);

        return i === response.index;
    });
    //console.log(step.classed('is-active'));
    // console.log(response.index);


    // console.log(step.attr());
    // console.log(step.attr('class'));
    // console.log(step.attr('data-step'));

    // update svgs
    switch(response.index) {
        case 0:
            drawRangeChart(data_1, response);
            break;
        case 1:
            drawRangeChartA(data_1, response);
            break;
        case 2:
            drawRangeChartB(data_1, response);
            break;
        case 3:
            drawBarChart(data_2, response);
            break;
        case 4:
            drawBarChartA(data_2, response);
            break;
        case 5:
            drawLongBarChart(data_3, response);
            break;
        case 6:
            //no nothing
            break;
        case 7:
            drawTwoBars(data_4, response);
            break;
        case 8:
            drawTwoBarsWithWaterFalls(data_5, response);
            break;
        case 9:
            drawTwoBarsWithWaterFallsA(data_5, response);
            break;
        case 10:
            drawTwoBarsWithWaterFallsB(data_6, response);
            break;
        case 11:
            drawTwoBarsWithWaterFallsC(data_6, response);
            break;
        case 12:
            //no nothing
            break;
    }

    // redraw chart upon display
    handleResize();
}

function toggleChart(response) {


    chart.classed('is-active', false);

    // if moving down to step 5, switch divs
    if (response.index === 5) {
        // toggle z-index
        chart.classed('is-active', function(d, i) {
            return i === 1;
        });
    } else {
        chart.classed('is-active', function(d, i) {
            return i === 0;
        });

        // reset circles
        d3.select("#mapPlot").select("svg").select("#plot")
            .selectAll(".centroid")
            .attr("opacity", 0);
    };

}

function setupStickyfill() {
    d3.selectAll('.sticky').each(function () {
        Stickyfill.add(this);
    });
}

// run initializer code once on page load
function scroll_init() {
    setupStickyfill();

	// call a resize on load to update width/height/position of elements
	handleResize();

	// setup the scrollama instance and bind scrollama event handlers
	scroller
		.setup({
			container: document.querySelector('#scroll'), // our outermost scrollytelling element
			graphic: '.scroll__graphic', // the graphic
			text: '.scroll__text', // the step container
			step: '.scroll__text .step', // the step elements
			offset: 0.5, // set the trigger to be 2/3 way down screen
			debug: false, // display the trigger offset for testing
		})
		.onStepEnter(handleStepEnter);

	// setup resize event
	window.addEventListener('resize', handleResize);
}


// LOAD DATA
Promise.all([
    d3.json("data/data1"),
    d3.json("data/data2"),
    d3.json("data/data3"),
    d3.json("data/data4"),
    d3.json("data/data5"),
    d3.json("data/data6")
]).then(results => {

    // assign separate references for each dataset
    this.data_1 = results[0];
    this.data_2 = results[1];
    this.data_3 = results[2];
    this.data_4 = results[3];
    this.data_5 = results[4];
    this.data_6 = results[5];

    //console.log(data_1)
    //console.log(Array.from(new Set(data_1["IDCNTRY"])))


    // Go!
    scroll_init();  // initialize scrollama
    svg_init(); // initialize svg divs, g containers common to all plots

}).catch(error => {
    console.log(error);
    document.getElementById("errMsg").innerHTML = error;
});

//
