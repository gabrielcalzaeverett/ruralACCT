function drawTwoBarsWithWaterFalls(data, response) {
    var data = data.sort( (a, b) => d3.descending(a["MEAN.NO"], b["MEAN.NO"]));

    //data = data.sort( (a, b) => d3.descending(a["PCT"], b["PCT"]));
    //console.log(data);
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

    //const smallMultipleWidth = plotWidth/5

    const svg = d3.select("#chart").select("svg");

    const DURATION = 1000;


    /***********************
    ***** X & Y SCALES *****
    ***********************/

    let xMin = 0;
    let xMax = 800;
    let yGroup = "IDCNTRY";

    let smallMultiplePadding = 30

    let xScale = d3.scaleLinear()
            .domain([xMin, xMax])
            .range([smallMultiplePadding, plotWidth]);
   
    //using the same yScale order as in 03-drawLongBarChart.js
    let yScale = d3.scaleBand()
        .domain(data.map(d => d[yGroup]))
        .range([0, plotHeight])
        .padding(.5);
    
    /***************************************
    ***** X AXIS, AXIS LABEL, GRIDLINE *****
    ***************************************/

    // svg.selectAll(".xAxis1,.xAxis2,.xAxis3,.xAxis4")
    //     .remove()

    svg.selectAll(".xAxis0")
            .transition()
            .duration(DURATION)
            .attr("transform", `translate(${margin.left}, ${plotHeight + margin.top})`)
            .call(d3.axisBottom(xScale)
                .ticks(4)
                //.tickFormat(d3.format("d"))
            );

    // svg.selectAll(".xGrid1,.xGrid2,.xGrid3,.xGrid4")
    //     .remove()

    svg.selectAll(".xGrid0")
        .transition()
        .duration(DURATION)
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .call(d3.axisBottom(xScale)
            .tickSize(plotHeight)
            .ticks(3)
            .tickFormat("")
        );

    svg.selectAll(".xLabel")
        .data([{"label": "Average score in online reading"}])
        .text(d => d.label);


    // svg.selectAll(".xTitle")
    //     .transition()
    //     .duration(DURATION * 0.5)
    //         .style("opacity", 0)
    //         .remove()



    /***************************************
    ***** Y AXIS, AXIS LABEL, GRIDLINE *****
    ***************************************/

    svg.select(".yAxis")
        .transition()
        .duration(DURATION)
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


    /******************
    ***** TOOLTIP *****
    *******************/
    var div = d3.select(".tooltipBarChart")
    .style("opacity", 0)

    /***************************************
    ***** LINES , CIRCLES, RECTS *****
    ***************************************/

    // Append g to hold lines
    var plot = svg.select("#plot")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    plot.selectAll(".rectLongBoy,.rectLongGirl")
        .transition()
        .duration(DURATION * 0.5)
            .attr("width", 0)
            .remove();

    
    if (response.direction === "down") {
        plot.selectAll(".rectLongNoClick")
            .data(data)
            .enter() 
            .append("rect")
            .attr("class", "rectLongNoClick")
            .attr("x", d => xScale(0))
            .attr("y", d => yScale(d[yGroup]) - yScale.bandwidth()*0.4)
            .attr("height", yScale.bandwidth()*0.8)
            //.style("fill", "green")
            .style("opacity", 1)
            .attr("width", 0)
            .transition()
            .delay(DURATION * 0.5)//wait for the removal to happen first
            .duration(DURATION)
                .attr("width", function(d){
                    return xScale(d["MEAN.NO"]) - xScale(0)
                });


        plot.selectAll(".rectLongYesClick")
            .data(data)
            .enter() 
            .append("rect")
            .attr("class", "rectLongYesClick")
            .attr("x", d => xScale(0))
            .attr("y", d => yScale(d[yGroup]) + yScale.bandwidth()*0.4)
            .attr("height", yScale.bandwidth()*0.8)
            // .style("fill", "red")
            .style("opacity", 1)
            .attr("width", 0)
            .transition()
            .delay(DURATION * 0.5)//wait for the removal to happen first
            .duration(DURATION)
                .attr("width", function(d){
                    return xScale(d["MEAN.YES"]) - xScale(0)
                });
                
        
        

        plot.selectAll(".rectLongGap")
            .data(data.filter(function(d){return d["IDCNTRY"] !== "Singapore"})) //filter out Singapore as it is not significant
            .enter() 
            .append("rect")
            .attr("class", "rectLongGap")
            .attr("x", d => xScale(d["MEAN.YES"]))
            .attr("y", d => yScale(d[yGroup]) + yScale.bandwidth()*0.4)
            .attr("height", yScale.bandwidth()*0.8)
            // .style("fill", "yellow")
            .attr("width", function(d){
                return xScale(d["MEAN.GAP"]) - xScale(0)
            })
            .style("opacity", 0)

         
    } else {

        plot.selectAll(".rectLongNoClick, .rectLongYesClick")
            .transition()
            .duration(DURATION)
                .style("opacity", 1)

         plot.selectAll(".rectLongGap")
            .transition()
            .duration(DURATION)
                .style("opacity", 0)
    }

    plot.selectAll(".rectLongNoClick")
        .on("mouseenter", function(d) {
            d3.select(this)
                .style("fill", "#F24D29")
            
            div.style("opacity", 1)
                //.text([d["Min"]])
                .html(d3.format(".1f")(d["MEAN.NO"]))
                .style("transform", `translate(`
                    + `calc( 0% + ${xScale(d["MEAN.NO"]) + margin.left + 10}px),`
                    + `calc(-50% + ${yScale(d[yGroup]) + margin.top}px)`
                    + `)`)
                // .style("left", (xScale(d["MEAN.NO"]) + 142) + "px")
                // .style("top", (yScale(d[yGroup]) - yScale.bandwidth()*0.4 + 38) + "px")
            })              
        .on("mouseleave", function(d) { 
            d3.select(this)
                .style("fill", "#1C366B")
            div.style("opacity", 0)
            })

    plot.selectAll(".rectLongYesClick")
        .on("mouseenter", function(d) {
            d3.select(this)
                .style("fill", "#F24D29")
            
            div.style("opacity", 1)
                .html(d3.format(".1f")(d["MEAN.YES"]))
                .style("transform", `translate(`
                    + `calc( 0% + ${xScale(d["MEAN.YES"]) + margin.left + 10}px),`
                    + `calc(-50% + ${yScale(d[yGroup]) + yScale.bandwidth() + margin.top}px)`
                    + `)`)
                // .style("left", (xScale(d["MEAN.YES"]) + 142) + "px")
                // .style("top", (yScale(d[yGroup]) + yScale.bandwidth()*0.4 + 38) + "px")
            })              
        .on("mouseleave", function(d) { 
            d3.select(this)
                .style("fill", "#1DACE8")
            div.style("opacity", 0)
            }) 

    plot.selectAll(".rectLongGap")
        .on("mouseenter", function(d) {
            // d3.select(this)
            //     .style("fill", "#F24D29")
            
            div.style("opacity", 0)
                //.text([d["Min"]])
                .html(d3.format(".1f")(d["MEAN.GAP"]))
                .style("transform", `translate(`
                    + `calc( 0% + ${xScale(d["MEAN.NO"]) + margin.left + 10}px),`
                    + `calc(-50% + ${yScale(d[yGroup]) + yScale.bandwidth() + margin.top}px)`
                    + `)`)
                // .style("left", (xScale(d["MEAN.NO"]) + 142) + "px")
                // .style("top", (yScale(d[yGroup]) + yScale.bandwidth()*0.4 + 38) + "px")
            })              
        .on("mouseleave", function(d) { 
            d3.select(this)
                .style("fill", "#F8DF4F")
            div.style("opacity", 0)
            })


    plot.append("line")
        .attr("class", "lineAverageNoClick")
        .attr("x1", xScale(537.5))
        .attr("x2", xScale(537.5))
        .attr("y1", 0)
        .attr("y2", plotHeight)
        .attr("stroke", "#1C366B")
        .attr("stroke-width", "2px")
        .attr("stroke-opacity", 0)
        .attr("stroke-dasharray", 5)
        .lower()
        .transition()
        .delay(function(d){
            if (response.direction === "down") {
                return DURATION * 1.5
            } else {
            return 0}
        })
        .duration(DURATION)
            .attr("stroke-opacity", 1)
            

     plot.append("line")
        .attr("class", "lineAverageYesClick")
        .attr("x1", xScale(502.1))
        .attr("x2", xScale(502.1))
        .attr("y1", 0)
        .attr("y2", plotHeight)
        .attr("stroke", "#1DACE8")
        .attr("stroke-width", "2px")
        .attr("stroke-opacity", 0)
        .attr("stroke-dasharray", 5)
        .lower()
        .transition()
        .delay(function(d){
            if (response.direction === "down") {
                return DURATION * 1
            } else {
            return 0}
        })
        .duration(DURATION)
            .attr("stroke-opacity", 1)


    // Annotations for lines
    const type = d3.annotationCalloutCurve

    const annotationsNoClicks = [
      {
        note: {
          label: "537.5: Average score for students who did not click on ads"
          //bgPadding: 20,
          //title: "Annotation title"
        },
        color:"#1C366B",
        x: xScale(537.5),
        y: yScale("Portugal"),
        dy: -plotHeight/16*2.5,
        dx: plotWidth/8,
        connector: {
          points: 1
        }
      }
    ]

    // Add annotation to the chart
    const makeAnnotationsNoClicks = d3.annotation()
        //.editMode(true)
        //.notePadding(15)
        .type(type)
        .annotations(annotationsNoClicks)

    //console.log(plotWidth)
    console.log(plotHeight)
    d3.select("#plot")
      .append("g")
      .style('font-size', function(d){
          if (plotWidth > 700){
              return "16px";
          } else {
              return plotWidth/40;
          }
      })
      .call(makeAnnotationsNoClicks)
      .attr("opacity", 0)
      .transition()
         .delay(function(d){
            if (response.direction === "down") {
                return DURATION * 1.5
            } else {
            return 0}
        })
        .duration(DURATION)
            .attr("opacity", 1)





    const annotationsYesClicks = [
      {
        note: {
          label: "502.1: Average score for students who clicked on ads"
          //bgPadding: 20,
          //title: "Annotation title"
        },
        color:"#1DACE8",
        x: xScale(502.1),
        y: yScale("Abu Dhabi, UAE"),
        dy: -plotHeight/16*2.5,
        dx: xScale(537.5) - xScale(502.1) + plotWidth/8,
        connector: {
          points: 1
        }
      }
    ]

    // Add annotation to the chart
    const makeAnnotationsYesClicks = d3.annotation()
        //.editMode(true)
        //.notePadding(15)
        .type(type)
        .annotations(annotationsYesClicks)
    
    d3.select("#plot")
      .append("g")
      .style('font-size', function(d){
        if (plotWidth > 700){
            return "16px";
        } else {
            return plotWidth/40;
        }
    })
      .call(makeAnnotationsYesClicks)
      .attr("opacity", 0)
      .transition()
         .delay(function(d){
            if (response.direction === "down") {
                return DURATION * 1
            } else {
            return 0}
        })
        .duration(DURATION)
            .attr("opacity", 1)
    

    
    /*************************
    ***** TITLE, CAPTION *****
    *************************/

    // Create header grouping
    const header = svg.select("#header");

    // chart title
    header.selectAll(".chartTitle")
        .data([{"label": "Average score of students by ad-clicking behavior and education system"}])
        .text(function(d) {return d.label;})


    // Create footer grouping
    const footer = svg.select("#footer");

    // Caption with data source
    footer.selectAll(".captionText")
        .data([{"label": "Data source: ePIRLS 2016 data"}])
        .text(function(d) {return d.label;})


    /*********************
    ***** HIDE BOX V3*****
    **********************/

    d3.selectAll(".highlightBoxV3")
        .transition()
        .duration(0.5 * DURATION)
        .style("stroke-opacity", 0)    



}
