//toggle style: https://cdn.jsdelivr.net/gh/gitbrent/bootstrap4-toggle@3.6.1/css/bootstrap4-toggle.min.css

class Map {
  constructor(id, width, height) {
    this.parentDiv = d3.select(`#${id}`);
    this.width = width;
    this.height = height;
    this.svg = this.parentDiv
      .append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", "0 0 1100 1200")
      // I commentted out the following two lines, and added the above two lines instead to make the map responsive. based on https://stackoverflow.com/questions/16265123/resize-svg-when-window-is-resized-in-d3-js
      // .attr("width", width)
      // .attr("height", height);
    this.g = this.svg.append("g");
    this.tip();
    this.initMap();
    this.toggleEvent();
  }
  async initData() {
    this.mapData = await d3.json("../data/counties-10m.json");
    this.data = await d3.csv("../data/testDataSet.csv");
    this.statesMap = topojson.feature(
      this.mapData,
      this.mapData.objects.states
    );
    console.log(this.data);
    // this.countiesMap = topojson.feature(
    //   this.mapData,
    //   this.mapData.objects.counties
    // );
    // this.nationMap = topojson.feature(
    //   this.mapData,
    //   this.mapData.objects.nation
    // );
  }

  async initMap() {
    await this.initData();

    this.epsilon = 0.000001;
    this.project = geoAlbersUsaPr(this.epsilon);

    this.project
      .scale(this.width * 1.05)
      .translate([this.width / 2, this.height / 2.7]);
    //由于重写了美国地图的方法(在本js最底下的函数),因此该地图方法无匹配大小功能
    // project.fitSize([this.width, this.height], geoMap);

    this.geoPath = d3.geoPath().projection(this.project);

    this.addStatesPath();

    // this.addCountiesPath(); //turn this off to NOT draw county path
    this.addSchoolCircles();
  }
  addStatesPath() {
    this.g
      .selectAll("path")
      .data(this.statesMap.features)
      .join("path")
      .attr("d", this.geoPath)
      .attr("fill", "none")
      .attr("stroke", "gray")
      .attr("stroke-opacity", 0.7);
  }
  addCountiesPath() {
    this.g
      .append("path")
      .attr(
        "d",
        this.geoPath(
          topojson.mesh(
            this.mapData,
            this.mapData.objects.counties,
            (a, b) => a !== b && ((a.id / 1000) | 0) === ((b.id / 1000) | 0)
          )
        )
      )
      .attr("fill", "none")
      .attr("stroke-width", 0.5)
      .attr("stroke", "#000")
      .attr("stroke-opacity", 0.5);
  }
  addSchoolCircles() {
    this.g
      .selectAll(".school")
      .data(this.data)
      .join("circle")
      .attr(
        "cx",
        (d) =>
          this.project([
            +d["HD2018.Longitude.location.of.institution"],
            +d["HD2018.Latitude.location.of.institution"],
          ])?.[0]
      )
      .attr(
        "cy",
        (d) =>
          this.project([
            +d["HD2018.Longitude.location.of.institution"],
            +d["HD2018.Latitude.location.of.institution"],
          ])?.[1]
      )
      .attr("r", 4)
      .attr(
        "class",
        (d) =>
          `school ${
            d.ruralDefinition2 === "1"
              ? "ruralDefinition2-1"
              : "ruralDefinition2-0"
          } ${
            d.ruralDefinition1 === "1"
              ? "ruralDefinition1-1"
              : "ruralDefinition1-0"
          }`
      )
      .attr("fill", "#046582")
      .attr("opacity", 0.8)
      .attr("stroke", "white")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 0.5)
      .on("mouseover", this.tool_tip.show)
      .on("mouseout", this.tool_tip.hide);
  }

  // initialize the tooltip
  tip() {
    this.tool_tip = d3
      .tip()
      .attr("class", "d3-tip")
      .offset([1, 1])
      .html(
        (e, d) => `
          <li> Institution Name: ${d.College} </li>
          <li> City: ${d.City} </li>
          <li> State: ${d.State} </li>
          <li> Degree of urbanization: ${d["HD2018.Degree.of.urbanization..Urban.centric.locale."]} </li>
          <li> Total enrollment: ${d["DRVEF2018.Total..enrollment"]} </li>
      `
      );

    this.svg.call(this.tool_tip);
  }

  toggleEvent() {
    this.toggledCircles = {
      ruralDefinition1: false,
      ruralDefinition2: false,
    };
    let selectedColor = "#26a69a";
    d3.select("#switch-ruralDefinition1").on("change", (e) => {
      let value = d3.select(e.target).property("checked");

      //change color
      if (value) {
        this.toggledCircles.ruralDefinition1 = true;
        d3.selectAll(".ruralDefinition1-1").attr("fill", selectedColor);
        this.toggledCircles.ruralDefinition2 &&
          d3.selectAll(".ruralDefinition2-1").attr("fill", selectedColor);
      } else {
        this.toggledCircles.ruralDefinition1 = false;
        d3.selectAll(".ruralDefinition1-1").attr("fill", "#046582");
        this.toggledCircles.ruralDefinition2 &&
          d3.selectAll(".ruralDefinition2-1").attr("fill", selectedColor);
      }
    });
    d3.select("#switch-ruralDefinition2").on("change", (e) => {
      let value = d3.select(e.target).property("checked");
      if (value) {
        this.toggledCircles.ruralDefinition2 = true;
        d3.selectAll(".ruralDefinition2-1").attr("fill", selectedColor);
        this.toggledCircles.ruralDefinition1 &&
          d3.selectAll(".ruralDefinition1-1").attr("fill", selectedColor);
      } else {
        this.toggledCircles.ruralDefinition2 = false;
        d3.selectAll(".ruralDefinition2-1").attr("fill", "#046582");
        this.toggledCircles.ruralDefinition1 &&
          d3.selectAll(".ruralDefinition1-1").attr("fill", selectedColor);
      }
    });
  }
}

new Map("map", 1100, 800);

function geoAlbersUsaPr(epsilon) {
  var cache,
    cacheStream,
    lower48 = d3.geoAlbers(),
    lower48Point,
    alaska = d3
      .geoConicEqualArea()
      .rotate([154, 0])
      .center([-2, 58.5])
      .parallels([55, 65]),
    alaskaPoint,
    hawaii = d3
      .geoConicEqualArea()
      .rotate([157, 0])
      .center([-3, 19.9])
      .parallels([8, 18]),
    hawaiiPoint,
    puertoRico = d3
      .geoConicEqualArea()
      .rotate([66, 0])
      .center([0, 18])
      .parallels([8, 18]),
    puertoRicoPoint,
    guamMariana = d3
      .geoConicEqualArea()
      .rotate([-145, 0])
      .center([0, 16])
      .parallels([10, 20]),
    guamMarianaPoint,
    americanSamoa = d3
      .geoConicEqualArea()
      .rotate([170, 0])
      .center([0, -14])
      .parallels([-14, 0]),
    americanSamoaPoint,
    point,
    pointStream = {
      point: function (x, y) {
        point = [x, y];
      },
    };

  function albersUsa(coordinates) {
    var x = coordinates[0],
      y = coordinates[1];
    return (
      (point = null),
      (lower48Point.point(x, y), point) ||
        (alaskaPoint.point(x, y), point) ||
        (hawaiiPoint.point(x, y), point)
      // (puertoRicoPoint?.point(x, y), point) ||
      // (guamMarianaPoint.point(x, y), point) ||
      // (americanSamoaPoint.point(x, y), point)
    );
  }

  albersUsa.invert = function (coordinates) {
    var k = lower48.scale(),
      t = lower48.translate(),
      x = (coordinates[0] - t[0]) / k,
      y = (coordinates[1] - t[1]) / k;
    return (y >= 0.12 && y < 0.234 && x >= -0.225 && x < -0.185
      ? alaska
      : y >= 0.166 && y < 0.234 && x >= -0.185 && x < -0.08
      ? hawaii
      : y >= 0.204 && y < 0.234 && x >= 0.3 && x < 0.38
      ? puertoRico
      : y >= 0.05 && y < 0.204 && x >= -0.415 && x < -0.225
      ? guamMariana
      : y >= 0.18 && y < 0.234 && x >= -0.415 && x < -0.225
      ? americanSamoa
      : lower48
    ).invert(coordinates);
  };

  albersUsa.stream = function (stream) {
    return cache && cacheStream === stream
      ? cache
      : (cache = multiplex([
          lower48.stream((cacheStream = stream)),
          alaska.stream(stream),
          hawaii.stream(stream),
          puertoRico.stream(stream),
          guamMariana.stream(stream),
          americanSamoa.stream(stream),
        ]));
  };

  albersUsa.precision = function (_) {
    if (!arguments.length) return lower48.precision();
    lower48.precision(_),
      alaska.precision(_),
      hawaii.precision(_),
      puertoRico.precision(_),
      guamMariana.precision(_),
      americanSamoa.precision(_);
    return reset();
  };

  albersUsa.scale = function (_) {
    if (!arguments.length) return lower48.scale();
    lower48.scale(_),
      alaska.scale(_ * 0.35),
      hawaii.scale(_),
      puertoRico.scale(_),
      guamMariana.scale(_),
      americanSamoa.scale(_);
    return albersUsa.translate(lower48.translate());
  };

  albersUsa.translate = function (_) {
    if (!arguments.length) return lower48.translate();
    var k = lower48.scale(),
      x = +_[0],
      y = +_[1];

    lower48Point = lower48
      .translate(_)
      .clipExtent([
        [x - 0.455 * k, y - 0.238 * k],
        [x + 0.455 * k, y + 0.238 * k],
      ])
      .stream(pointStream);

    alaskaPoint = alaska
      .translate([x - 0.275 * k, y + 0.201 * k])
      .clipExtent([
        [x - 0.425 * k + epsilon, y + 0.12 * k + epsilon],
        [x - 0.185 * k - epsilon, y + 0.234 * k - epsilon],
      ])
      .stream(pointStream);

    hawaiiPoint = hawaii
      .translate([x - 0.18 * k, y + 0.212 * k])
      .clipExtent([
        [x - 0.185 * k + epsilon, y + 0.166 * k + epsilon],
        [x - 0.08 * k - epsilon, y + 0.234 * k - epsilon],
      ])
      .stream(pointStream);

    puertoRicoPoint = puertoRico
      .translate([x + 0.335 * k, y + 0.224 * k])
      .clipExtent([
        [x + 0.3 * k, y + 0.204 * k],
        [x + 0.38 * k, y + 0.234 * k],
      ])
      .stream(pointStream).point;

    guamMarianaPoint = guamMariana
      .translate([x - 0.415 * k, y + 0.14 * k])
      .clipExtent([
        [x - 0.45 * k, y + 0.05 * k],
        [x - 0.39 * k, y + 0.21 * k],
      ])
      .stream(pointStream).point;

    americanSamoaPoint = americanSamoa
      .translate([x - 0.415 * k, y + 0.215 * k])
      .clipExtent([
        [x - 0.45 * k, y + 0.21 * k],
        [x - 0.39 * k, y + 0.234 * k],
      ])
      .stream(pointStream).point;

    return reset();
  };

  function reset() {
    cache = cacheStream = null;
    return albersUsa;
  }

  return albersUsa.scale(1070);
}
function multiplex(streams) {
  const n = streams.length;
  return {
    point(x, y) {
      for (const s of streams) s.point(x, y);
    },
    sphere() {
      for (const s of streams) s.sphere();
    },
    lineStart() {
      for (const s of streams) s.lineStart();
    },
    lineEnd() {
      for (const s of streams) s.lineEnd();
    },
    polygonStart() {
      for (const s of streams) s.polygonStart();
    },
    polygonEnd() {
      for (const s of streams) s.polygonEnd();
    },
  };
}
