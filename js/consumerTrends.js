import { html, useState, useEffect } from "./utils/preact-htm.js";
import {
  prevTimeScale,
  currentTimeScale,
  buttonToVariableMapping,
  addMissingDaysPrev,
  addMissingDaysCurrent,
} from "./helpers.js";
import { getDropdownValue } from "./populateGeneralDropdowns.js";

export function ConsumerTrends() {
  const [selectedVariable, setSelectedVariable] = useState("DAU");
  const [system, setSystem] = useState(getDropdownValue("system"));
  const [country, setCountry] = useState(getDropdownValue("country"));
  const [field, setField] = useState(getDropdownValue("field"));
  const [data, setData] = useState([]);

  // listen to change in general system dropdown
  useEffect(() => {
    const handleSystemChange = (e) => setSystem(e.detail.selectedSystem);
    document.addEventListener(
      "vis-general-dropdown-system-changed",
      handleSystemChange
    );
    return () => {
      document.removeEventListener(
        "vis-general-dropdown-system-changed",
        handleSystemChange
      );
    };
  }, []);

  // listen to change in general field dropdown
  useEffect(() => {
    const handleFieldChange = (e) => setField(e.detail.selectedField);
    document.addEventListener(
      "vis-general-dropdown-field-changed",
      handleFieldChange
    );
    return () => {
      document.removeEventListener(
        "vis-general-dropdown-field-changed",
        handleFieldChange
      );
    };
  }, []);

  // listen to change in general country dropdown
  useEffect(() => {
    const handleCountryChange = (e) => setCountry(e.detail.selectedCountry);
    document.addEventListener(
      "vis-general-dropdown-country-changed",
      handleCountryChange
    );
    return () => {
      document.removeEventListener(
        "vis-general-dropdown-country-changed",
        handleCountryChange
      );
    };
  }, []);

  // Listen for custom change event in button group
  useEffect(() => {
    const handleButtonChange = (e) => {
      const newButton = e.detail.selectedButton;
      if (newButton && newButton !== selectedVariable)
        setSelectedVariable(newButton);
    };
    document.addEventListener(
      "vis-consumer-trends-button-group-changed",
      handleButtonChange
    );
    return () => {
      document.removeEventListener(
        "vis-consumer-trends-button-group-changed",
        handleButtonChange
      );
    };
  }, [selectedVariable]);

  // console.log("Rendering consumer trends with", {
  //   selectedVariable,
  //   system,
  //   country,
  //   field,
  // });

  // fetch data from file, later from live sheet
  useEffect(() => {
    d3.csv(
      "https://raw.githubusercontent.com/parabolestudio/molocormgcampaign/refs/heads/main/data/consumer-trends-data2.csv"
    ).then((data) => {
      data.forEach((d) => {
        d["system"] = d["os"];
        d["field"] = d["vertical"];
        d["date"] = d["date"];
        d["country"] = d["country"];
        d["mau"] = +d[" mau"];
        d["dau"] = +d["dau"];
        d["cftd"] = +d["cftd"].replace("$", "");
        d["spend"] = +d[" avg_user_spend"].replace("$", "");
      });

      setData(data);
    });
  }, []);

  if (data.length === 0) {
    return html`<div>Data loading...</div>`;
  }

  // filtering data
  const filteredData = data.filter((d) => {
    return (
      d["system"] === system && d["country"] === country && d["field"] === field
    );
  });

  let datapoints = filteredData.map((d) => {
    return {
      date: d["date"],
      [buttonToVariableMapping[selectedVariable]]:
        d[buttonToVariableMapping[selectedVariable]],
    };
  });

  // set up dimensions
  const visContainer = document.querySelector("#vis-consumer-trends");
  const width =
    visContainer && visContainer.offsetWidth ? visContainer.offsetWidth : 600;
  const height = 500;
  const axisOffsetX = 20;
  const margin = {
    top: 30,
    right: 1,
    bottom: 50,
    left: 60,
  };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const chartWidth = innerWidth - axisOffsetX;

  // scales
  const valueScale = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(datapoints, (d) => d[buttonToVariableMapping[selectedVariable]]),
    ])
    .range([innerHeight, 0])
    .nice();
  const prevTime = prevTimeScale.range([0, chartWidth]);
  const currentTime = currentTimeScale.range([0, chartWidth]);

  // lines
  const prevLine = d3
    .line()
    .y((d) => valueScale(d[buttonToVariableMapping[selectedVariable]]))
    .x((d) => prevTime(new Date(d.date)))
    .defined((d) => d[buttonToVariableMapping[selectedVariable]] !== null);

  const currentLine = d3
    .line()
    .y((d) => valueScale(d[buttonToVariableMapping[selectedVariable]]))
    .x((d) => currentTime(new Date(d.date)))
    .defined((d) => d[buttonToVariableMapping[selectedVariable]] !== null);

  // data points
  const datapointsPrev = datapoints.filter((d) => {
    const date = new Date(d.date);
    return (
      date >= prevTime.domain()[0] &&
      date <= prevTime.domain()[1] &&
      !isNaN(d[buttonToVariableMapping[selectedVariable]])
    );
  });
  const datapointsCurrent = datapoints.filter((d) => {
    const date = new Date(d.date);
    return (
      date >= currentTime.domain()[0] &&
      date <= currentTime.domain()[1] &&
      !isNaN(d[buttonToVariableMapping[selectedVariable]])
    );
  });

  // ticks
  const xAxisTicks = prevTime.ticks(12);
  let xAxisTicksWidth = prevTime(xAxisTicks[1]) - prevTime(xAxisTicks[0]);

  const yAxisTicks = valueScale.ticks(4);

  // stroke-dasharray="0.10000000149011612, 10"
  return html`<svg viewBox="0 0 ${width} ${height}">
    <text dy="15" style="fill: orange; font-size: 12px;">
      Debug: ${selectedVariable} | ${field} | ${system} | ${country} ||
      #datapoints prev year: ${datapointsPrev.length} || #datapoints current
      year: ${datapointsCurrent.length}
    </text>
    <g transform="translate(${margin.left}, ${margin.top})">
      <line y2="${innerHeight}" stroke="black" />
      <g class="y-axis">
        ${yAxisTicks.map((tick) => {
          return html`
            <g transform="translate(0, ${valueScale(tick)})">
              <text
                x="${-10}"
                y="${0}"
                dominant-baseline="middle"
                text-anchor="end"
                class="charts-text-body"
              >
                ${tick >= 1_000_000
                  ? (tick / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M"
                  : tick >= 1_000
                  ? (tick / 1_000).toFixed(1).replace(/\.0$/, "") + "k"
                  : tick}
              </text>
            </g>
          `;
        })}
      </g>
      <g transform="translate(${axisOffsetX}, 0)">
        <g class="x-axis">
          ${xAxisTicks.map((tick, index) => {
            if (index < xAxisTicks.length - 1) {
              xAxisTicksWidth =
                prevTime(xAxisTicks[index + 1]) - prevTime(xAxisTicks[index]);
            }
            return html`
              <g transform="translate(${prevTime(tick)}, 0)">
                <rect
                  x="${0}"
                  y="${0}"
                  width="${xAxisTicksWidth}"
                  height="${innerHeight}"
                  fill="#D9D9D933"
                  stroke="white"
                  stroke-width="5"
                />
                <rect
                  x="${0}"
                  y="${innerHeight + 5}"
                  width="${xAxisTicksWidth}"
                  height="${40}"
                  fill="#D3F5FF"
                  stroke="white"
                  stroke-width="5"
                />
                <text
                  x="${xAxisTicksWidth / 2}"
                  y="${innerHeight + 5 + 20}"
                  dominant-baseline="middle"
                  text-anchor="middle"
                  class="charts-text-body"
                >
                  ${d3.timeFormat("%B")(tick)}
                </text></g
              >
            `;
          })}
        </g>
        <path
          d="${prevLine(addMissingDaysPrev(datapointsPrev))}"
          fill="none"
          stroke="#C3C3C3"
          stroke-width="3"
          stroke-joint="round"
          stroke-linecap="round"
          style="transition: all ease 0.3s"
        />
        <path
          d="${currentLine(addMissingDaysCurrent(datapointsCurrent))}"
          fill="none"
          stroke="#0280FB"
          stroke-width="3"
          style="transition: all ease 0.3s"
        />
      </g>
    </g>
  </svg>`;
}
