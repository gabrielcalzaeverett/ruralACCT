function drawRangeChartB(data, response) {

    /**********************
    ***** BASIC SETUP *****
    **********************/

    // dynamic dimension sizing code adapted from
    // https://github.com/d3/d3-selection/issues/128
    const bbox = d3.select("#chart").node().getBoundingClientRect()

    const width = bbox.width;
    const height = bbox.height;
    const margin = {top: 50, left: 130, right: 50, bottom: 50};

    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.bottom - margin.top;

    const smallMultipleWidth = plotWidth/5

    const svg = d3.select("#chart").select("svg");

    const DURATION = 1000;

    /// draw most of the elements 5 times
    var moduleVars = [{"en11madz": "Mars"}, 
                      {"en11radz": "Rainforests"},
                      {"en11badz": "Dr. Blackwell"},
                      {"en11zadz": "Wildebeest Migration"}, 
                      {"en11tadz": "The Legend of Troy"}];

    /***********************
    ***** X & Y SCALES *****
    ***********************/

    let xMin = 0;
    let xMax = 610;
    let yGroup = "IDCNTRY";

    let smallMultiplePadding = 30
   
    let yScale = d3.scaleBand()
        .domain(data.map(d => d[yGroup]))
        .range([0, plotHeight])
        .padding(.5);


    /***************************************
    ***** X AXIS, AXIS LABEL, GRIDLINE *****
    ***************************************/

    svg.selectAll(".xLabel")
        .data([{"label": "Number of ad clicks"}])
        .text(d => d.label);


    /*************************
    ***** TITLE, CAPTION *****
    *************************/

    // Create header grouping
    const header = svg.select("#header");

    // chart title
    header.selectAll(".chartTitle")
        .data([{"label": "Minimum and maximum number of ad-clicks by module and education system"}])
        .text(function(d) {return d.label;})

    /******************
    ***** TOOLTIP *****
    *******************/
   var div = d3.select(".tooltipRangeChart")
                .style("opacity", 0)



    /*******************
    ***** SHOW BOX *****
    ********************/
    

     if (response.direction === "down") {
        d3.selectAll(".highlightBox")
            .transition()
            .duration(0.5 * DURATION)
            .style("opacity", 1)    
    } else {
        d3.selectAll(".highlightBox")
            .transition()
            .delay(DURATION * 2)
            .duration(0.5 * DURATION)
            .style("opacity", 1)    

    };

    
    /****************
    ***** LOOP  *****
    *****************/
    var i;
    for (i = 0; i < moduleVars.length; i ++){
        /***********************
        ***** X & Y SCALES *****
        ***********************/
        // console.log(i)
        // console.log([xMin, xMax])
        // console.log([smallMultipleWidth * i + smallMultiplePadding, smallMultipleWidth * (i+1)])
        let xScale = d3.scaleLinear()
            .domain([xMin, 600]) //because xMax is 604, replace it into 600 to make the xAxis look nicer
            .range([smallMultipleWidth * i + smallMultiplePadding, smallMultipleWidth * (i+1)]);

        /***************************************
        ***** X AXIS, AXIS LABEL, GRIDLINE *****
        ***************************************/

        svg.select(".xAxis".concat(i))
            .transition()
            .duration(DURATION)
            .attr("transform", `translate(${margin.left}, ${plotHeight + margin.top})`)
            .call(d3.axisBottom(xScale)
                .ticks(4)
                //.tickFormat(d3.format("d"))
            );

        svg.select(".xGrid".concat(i))
            .transition()
            .duration(DURATION)
            .attr("transform", `translate(${margin.left}, ${margin.top})`)
            .call(d3.axisBottom(xScale)
                .tickSize(plotHeight)
                .ticks(3)
                .tickFormat("")
            );

        /********************************
        ***** LINES , CIRCLES, RECTS*****
        *********************************/

        // Append g to hold lines
        var plot = svg.select("#plot")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);


        let filteredData = data.filter(d => d["Var"] === Object.keys(moduleVars[i])[0]);

        //console.log(filteredData)
        if (response.direction === "up") { //i.e. if moving from bar chart to here


            plot.selectAll(".rect".concat(i))
            .transition()
            .duration(DURATION)
                .style("opacity", 0)
                .remove();

            plot.selectAll(".line".concat(i))
            .data(filteredData)
            .enter()
            .append("line")
            .attr("class", "line".concat(i))
            .attr("y1", d => yScale(d[yGroup]) + yScale.bandwidth()/2 )
            .attr("y2", d => yScale(d[yGroup]) + yScale.bandwidth()/2 )
            .attr("x1", d => xScale(d["Min"]))
            .attr("stroke", "darkgray")
            .attr("stroke-width", "3px")
            .attr("x2", d => xScale(d["Min"]))
            .transition()
            .delay(DURATION)
            .duration(DURATION)
                .attr("x2", d => xScale(d["Max"]));

        plot.selectAll(".circleLeft".concat(i))
            .data(filteredData)
            .enter()
            .append("circle")
            .attr("class", "circleLeft".concat(i))
            .attr("cy", d => yScale(d[yGroup]) + yScale.bandwidth()/2 )
            .attr("cx", d => xScale(d["Min"]))
            .attr("r", 4.5)
            // .style("fill", "maroon")
            // .style("stroke", "#4A4A4A")
            .style("stroke-width", "1px")
            .style("opacity", 0)
            .transition()
            .delay(DURATION)
                .style("opacity", 1);
        
        plot.selectAll(".circleLeft".concat(i))
            //.style("opacity", 1)
            .on("mouseenter", function(d) {
                //console.log(d);
                d3.select(this)
                    .style("fill", "#F24D29")
                    .style("stroke", "#F24D29");
                
                div.style("opacity", 1)
                    .html("<strong>Minimum</strong>: "+ d["Min"])
                    .style("transform", `translate(`
                            + `calc( -50% + ${xScale(d["Min"]) + margin.left}px),`
                            + `calc(-100% + ${yScale(d[yGroup]) - yScale.bandwidth()/4 + margin.top}px)`
                            + `)`)
                })              
            .on("mouseleave", function(d) { 
                d3.select(this)
                    .style("fill", "#1C366B")
                    .style("stroke", "#1C366B");
                div.style("opacity", 0); 
                })

        plot.selectAll(".circleRight".concat(i))
            .data(filteredData)
            .enter()
            .append("circle")
            .attr("class", "circleRight".concat(i))
            .attr("cy", d => yScale(d[yGroup]) + yScale.bandwidth()/2 )
            .attr("r", 4.5)
            // .style("fill", "maroon")
            .style("opacity", 0)
            // .style("stroke", "#4A4A4A")
            .style("stroke-width", "1px")
            .attr("cx", d => xScale(d["Min"]))
            .transition()
            .delay(DURATION)
            .duration(DURATION)
                .attr("cx", d => xScale(d["Max"]))
                .style("opacity", 1);
        
        plot.selectAll(".circleRight".concat(i))
            //.style("opacity", 1)
            .on("mouseenter", function(d) {
                //console.log(d);
                d3.select(this)
                .style("fill", "#F24D29")
                .style("stroke", "#F24D29");
                
                div.style("opacity", 1)
                    //.text([d["Max"]])
                    .html("<strong>Maximum</strong>: "+ d["Max"])
                    .style("transform", `translate(`
                            + `calc( -50% + ${xScale(d["Max"]) + margin.left}px),`
                            + `calc(-100% + ${yScale(d[yGroup]) - yScale.bandwidth()/4 + margin.top}px)`
                            + `)`)
                })              
            .on("mouseleave", function(d) { 
                d3.select(this)
                    .style("fill", "#1C366B")
                    .style("stroke", "#1C366B");
                div.style("opacity", 0); 
                });
        }

    }







}
