function drawRangeChart(data, response) {
    
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
        .text(d => d.label)
        .style('font-size', function(d){
            if (plotWidth > 700){
                return "18px";
            } else {
                return plotWidth/60;
            }
        });


    let filteredXTitle = [moduleVars[i]]


    svg.selectAll(".xTitle")
        .data(moduleVars)
        .enter()
        .append("text")
        .attr("class", "xTitle")
        //.attr("transform", `translate(${margin.left + smallMultiplePadding +  smallMultipleWidth * i + 10}, ${margin.top })`)
        .attr("text-anchor", "start")
        .attr("x", (d,i) => margin.left + smallMultiplePadding +  smallMultipleWidth * i )
        .attr("y", margin.top)
        .style("font-family", "sans-serif")
        .style("font-size", plotWidth/50)
        .style("opacity", 0)
        .text(function(d) { 
            return Object.values(d); 
            })
        .transition()
        .duration(DURATION * 0.5)
            .style("opacity", 1)

    /***************************************
    ***** Y AXIS, AXIS LABEL, GRIDLINE *****
    ***************************************/

    svg.select(".yAxis")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .call(d3.axisLeft(yScale)
            .tickSize(5)
            .tickPadding(5)
            //.tickSizeOuter(0) //this is to hide the ticks at the bottom and top
            )
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
        .data([{"label": "Minimum and maximum number of ad-clicks by module and education system"}])
        .enter()
        .append("text")
        .text(function(d) {return d.label;})
        .attr("x", margin.left + smallMultiplePadding)
        .attr("y", margin.top - 25)
        .attr("text-anchor", "start")
        .attr("class", "chartTitle")
        .style("font-family", "sans-serif")
        .style("font-weight", "bold")
        .style("font-size", plotWidth/36.5) //to make the font size responsive
        //console.log(plotWidth);

    // Create footer grouping
    const footer = svg.select("#footer");

    // Caption with data source
    footer.selectAll(".captionText")
        .data([{"label": "Data source: ePIRLS 2016 data"}])
        .enter()
        .append("text")
        .text(function(d) {return d.label;})
        .attr("x", margin.left + smallMultiplePadding)
        .attr("y", height - 15)
        .attr("text-anchor", "start")
        .attr("class", "captionText")
    


    /****************
    ***** LOOP  *****
    *****************/
    var i;
    for (i = 0; i < moduleVars.length; i ++){
        /***********************
        ***** X & Y SCALES *****
        ***********************/

        let xScale = d3.scaleLinear()
            .domain([xMin, 600]) //because xMax is 604, replace it into 600 to make the xAxis look nicer
            .range([smallMultipleWidth * i + smallMultiplePadding, smallMultipleWidth * (i+1)]);

        /***************************************
        ***** X AXIS, AXIS LABEL, GRIDLINE *****
        ***************************************/

        svg.select(".xAxis".concat(i))
            .attr("transform", `translate(${margin.left}, ${plotHeight + margin.top})`)
            .call(d3.axisBottom(xScale)
                .ticks(3)
            );

        svg.select(".xGrid".concat(i))
            .attr("transform", `translate(${margin.left}, ${margin.top})`)
            .call(d3.axisBottom(xScale)
                .tickSize(plotHeight)
                .ticks(3)
                .tickFormat("")
            );





        



        /*************************
        ***** LINES & CIRCLES*****
        **************************/

        // Append g to hold lines
        var plot = svg.select("#plot")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);


        let filteredData = data.filter(d => d["Var"] === Object.keys(moduleVars[i])[0]);

        //console.log(filteredData)

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
            .style("opacity", 0);
            

        plot.selectAll(".circleLeft".concat(i))
            .data(filteredData)
            .enter()
            .append("circle")
            .attr("class", "circleLeft".concat(i))
            .attr("cy", d => yScale(d[yGroup]) + yScale.bandwidth()/2 )
            .attr("cx", d => xScale(d["Min"]))
            .attr("r", 4.5)
            // .style("fill", "maroon")
            .style("opacity", 0)
            // .style("stroke", "#4A4A4A")
            .style("stroke-width", "1px");
            

        plot.selectAll(".circleRight".concat(i))
            .data(filteredData)
            .enter()
            .append("circle")
            .attr("class", "circleRight".concat(i))
            .attr("cy", d => yScale(d[yGroup]) + yScale.bandwidth()/2 )
            .attr("r", 4.5)
            // .style("fill", "maroon")
            .style("opacity", 1)
            // .style("stroke", "#4A4A4A")
            .style("stroke-width", "1px")
            .attr("cx", d => xScale(d["Min"]))
            .style("opacity", 0);

        if (response.direction === "up") { //i.e. if moving from second plot (range plot with dots) to here

            plot.selectAll(".line".concat(i))
                .transition()
                .duration(DURATION)
                    .attr("x2", d => xScale(d["Min"]))
                    .style("opacity", 0);
                    
                

            plot.selectAll(".circleLeft".concat(i))
                .transition()
                .duration(DURATION)    
                    .style("opacity", 0);
                

            plot.selectAll(".circleRight".concat(i))
                .transition()
                .duration(DURATION)
                    .attr("cx", d => xScale(d["Min"]))
                    .style("opacity", 0);
                
        }
            

        /************************
        ***** HIGHLIGHT BOX *****
        *************************/

        if (Object.keys(moduleVars[i])[0] === "en11radz" & plot.selectAll(".highlightBox".concat(i)).empty()) {
            plot.append("rect")
                .attr("class", "highlightBox highlightBox".concat(i))
                .attr("x", xScale(xMin) - 7)
                .attr("y", yScale("Chinese Taipei") )
                .attr("width", xScale(xMax) - xScale(xMin) + 7 * 2)
                .attr("height", yScale.bandwidth() )
                .attr("fill", "#1DACE8")
                .style("opacity", 0)
                .lower();
        }

        if (response.direction === "up") {
        d3.selectAll(".highlightBox")
            .transition()
            .duration(0.5 * DURATION)
            .style("opacity", 0)    
        };

    }

    
    

    


}
