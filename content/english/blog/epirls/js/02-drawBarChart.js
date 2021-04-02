function drawBarChart(data, response) {
    
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

    //console.log(moduleVars)
    //console.log(Object.values(moduleVars[0])[0])


    /***********************
    ***** X & Y SCALES *****
    ***********************/

    let xMin = 0;
    let xMax = 25;
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
        .data([{"label": "Percent of students who clicked on ads"}])
        .text(d => d.label);


    // let filteredXTitle = [moduleVars[i]]

    // svg.selectAll(".xTitle")
    //     .data(moduleVars)
    //     .enter()
    //     .append("text")
    //     .attr("class", "xTitle")
    //     //.attr("transform", `translate(${margin.left + smallMultiplePadding +  smallMultipleWidth * i + 10}, ${margin.top })`)
    //     .attr("text-anchor", "start")
    //     .attr("x", (d,i) => margin.left + smallMultiplePadding +  smallMultipleWidth * i + 10)
    //     .attr("y", margin.top)
    //     .style("font-family", "sans-serif")
    //     .style("font-size", 12)
    //     //.text(d => Object.values(d));
    //     .text(function(d) { 
    //         return Object.values(d); 
    //         })

    /***************************************
    ***** Y AXIS, AXIS LABEL, GRIDLINE *****
    ***************************************/

    svg.select(".yAxis")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .call(d3.axisLeft(yScale)
            .tickSize(5)
            .tickPadding(5))
        .style("text-anchor", "end")
        .style("alignment-baseline", "middle")
        //.style("font-weight", "bold")
        .style("font-family", "sans-serif")
        .style("font-size", 12);

    // svg.select(".yGrid")
    //     .attr("transform", `translate(${margin.left}, ${margin.top})`) //+ 1 * yScale.bandwidth()
    //     .call(d3.axisLeft(yScale)
    //         .tickSize(-(plotWidth))
    //         .tickFormat("")
    //     );

    
    /*************************
    ***** TITLE, CAPTION *****
    *************************/

    // Create header grouping
    const header = svg.select("#header");

    // chart title
    header.selectAll(".chartTitle")
        .data([{"label": "Percent of students who clicked on ads by module and education system"}])
        //.enter()
        //.append("text")
        .text(function(d) {return d.label;})
        // .attr("x", margin.left + smallMultiplePadding)
        // .attr("y", margin.top - 30)
        // .attr("text-anchor", "start")
        // .attr("class", "chartTitle")
        // .style("font-family", "sans-serif")
        // .style("font-weight", "bold")
        // .style("font-size", 20)

    // Create footer grouping
    const footer = svg.select("#footer");

    // Caption with data source
    footer.selectAll(".captionText")
        .data([{"label": "Data source: ePIRLS 2016 data"}])
        //.enter()
        //.append("text")
        .text(function(d) {return d.label;})
        // .attr("x", margin.left + smallMultiplePadding)
        // .attr("y", height - 15)
        // .attr("text-anchor", "start")
        // .attr("class", "captionText")
    
    /******************
    ***** TOOLTIP *****
    *******************/
    var div = d3.select(".tooltipBarChart")
                .style("opacity", 0)

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
            .domain([xMin, xMax])
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
        let moduleName = Object.values(moduleVars[i]);

        plot.selectAll(".rect".concat(i))
            .data(filteredData)
            .enter() 
            .append("rect")
            .attr("class", "rect rect".concat(i))
            .attr("x", d => xScale(0))
            .attr("y", d => yScale(d[yGroup]))
            .attr("height", yScale.bandwidth())
            // .style("fill", "blue")
            .attr("width", 0)
            .transition()
            .delay(DURATION)//wait for the removal to happen first
            .duration(DURATION)
                .attr("width", function(d){
                    return xScale(d["PCT"]) - xScale(0)
                });
        
        
        plot.selectAll(".rect".concat(i))
            .on("mouseenter", function(d) {
                    
                d3.select(this)
                    .style("fill", "#F24D29")
                
                div.style("opacity", 1)
                    //.text([d["PCT"]])
                    .html(d3.format(".1f")(d["PCT"]) + "% of students <br />in " + d["IDCNTRY"] + "<br />clicked on ads during the <br />\"" + moduleName + "\" module")
                    .style("transform", `translate(`
                            + `calc( 0% + ${xScale(d["PCT"]) + margin.left + 10}px),`
                            + `calc(-50% + ${yScale(d[yGroup]) + yScale.bandwidth()/2 + margin.top}px)`
                            + `)`)
                    // .style("left", (xScale(d["PCT"]) + 142) + "px")
                    // .style("top", (yScale(d[yGroup]) + 40) + "px")
                })              
            .on("mouseleave", function(d) { 
                d3.select(this)
                    .style("fill", "#1C366B")
                div.style("opacity", 0)
                })

        plot.selectAll(".line".concat(i))
            .transition()
            .duration(DURATION)
                .style("opacity", 0)
                .remove();

        plot.selectAll(".circleLeft".concat(i))
            .transition()
            .duration(DURATION)
                .style("opacity", 0)
                .remove();

        plot.selectAll(".circleRight".concat(i))
            .transition()
            .duration(DURATION)
                .style("opacity", 0)
                .remove();

        /************************
        ***** HIDE BOX *****
        *************************/
        
        d3.selectAll(".highlightBox")
            .transition()
            .duration(0.5 * DURATION)
            .style("opacity", 0);


        /**************************
        ***** HIGHLIGHT BOX V2*****
        ***************************/
        let boxWidthAbuDhabi = filteredCountryData = filteredData.filter(d => d[yGroup] === "Abu Dhabi, UAE")[0]["PCT"] 
       
        if (Object.keys(moduleVars[i])[0] === "en11madz" & plot.selectAll(".highlightBoxV2".concat(i)).empty()) {
            plot.append("rect")
                .attr("class", "highlightBoxV2 highlightBoxV2".concat(i))
                .attr("x", xScale(xMin) - 3)
                .attr("y", yScale("Abu Dhabi, UAE") - yScale.bandwidth() * 0.4 )
                .attr("width", xScale(boxWidthAbuDhabi) - xScale(xMin) + 3*2)
                .attr("height", yScale.bandwidth() + yScale.bandwidth() * 0.8 )
                .attr("fill", "#1DACE8")
                .style("opacity", 0)
                .lower();
        }

        let boxWidthSweden = filteredCountryData = filteredData.filter(d => d[yGroup] === "Sweden")[0]["PCT"] 
       
        if (Object.keys(moduleVars[i])[0] === "en11zadz" & plot.selectAll(".highlightBoxV2".concat(i)).empty()) {
            plot.append("rect")
                .attr("class", "highlightBoxV2 highlightBoxV2".concat(i))
                .attr("x", xScale(xMin) - 3)
                .attr("y", yScale("Sweden") - yScale.bandwidth() * 0.4 )
                .attr("width", xScale(boxWidthSweden) - xScale(xMin) + 3*2)
                .attr("height", yScale.bandwidth() + yScale.bandwidth() * 0.8 )
                .attr("fill", "#1DACE8")
                .style("opacity", 0)
                .lower();
        }

        if (response.direction === "up") {
        d3.selectAll(".highlightBoxV2")
            .transition()
            .duration(0.5 * DURATION)
            .style("opacity", 0)    
        };

        // /**************************
        // ***** HIGHLIGHT BOX V3*****
        // ***************************/ I decide to drop this box (and accordingly drop 02-drawBarChartB.js)

        // if (Object.keys(moduleVars[i])[0] === "en11madz" & plot.selectAll(".highlightBoxV3".concat(i)).empty()) {
        //     plot.append("rect")
        //         .attr("class", "highlightBoxV3 highlightBoxV3".concat(i))
        //         .attr("x", xScale(xMin) - 10)
        //         .attr("y", - yScale.bandwidth() * 1.2 )
        //         .attr("width", xScale(xMax) - xScale(xMin) + 10*2)
        //         .attr("height", plotHeight  + yScale.bandwidth() * 1.2)
        //         .style("stroke", "purple")
        //         .style("stroke-width", 3)
        //         .style("stroke-opacity", 0)
        //         .style("fill-opacity", 0);
        // }




    }

    


}
