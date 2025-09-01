import { html, useState, useEffect } from "./utils/preact-htm.js";
import {
  prevTimeScale,
  currentTimeScale,
  buttonToVariableMapping,
  addMissingDaysPrev,
  addMissingDaysCurrent,
  formatDate,
  variableFormatting,
  isMobile,
  dataPullFromSheet,
} from "./helpers.js";
import { getDropdownValue } from "./populateGeneralDropdowns.js";
import { fetchGoogleSheetCSV } from "./googleSheets.js";

export function ConsumerTrends() {
  const [selectedVariable, setSelectedVariable] = useState("DAU");
  const [system, setSystem] = useState(getDropdownValue("system"));
  const [country, setCountry] = useState(getDropdownValue("country"));
  const [field, setField] = useState(getDropdownValue("field"));
  const [data, setData] = useState([]);
  const [hoveredItem, setHoveredItem] = useState(null);

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

  useEffect(() => {
    if (dataPullFromSheet) {
      fetchGoogleSheetCSV("daily-data")
        .then((data) => handleData(data))
        .catch((error) => {
          console.error(
            "Error fetching sheet data (last updated date):",
            error
          );
        });
    } else {
      d3.csv(
        "https://raw.githubusercontent.com/parabolestudio/molocormgcampaign/refs/heads/main/data/daily-data.csv"
      ).then((data) => handleData(data));
    }
  }, []);
  function handleData(data) {
    data.forEach((d) => {
      d["system"] = d["os"];
      d["field"] = d["vertical"];
      d["date"] = d["date"];
      d["country"] = d["country"];
      d["dau"] =
        d["total_DAU"] === "" ? null : +d["total_DAU"].replaceAll(",", "");
      d["downloads"] =
        d["total_downloads"] === ""
          ? null
          : +d["total_downloads"].replaceAll(",", "");
      d["time_spent"] =
        d["total_duration_minutes"] === "" ||
        d["total_duration_minutes"] === null
          ? null
          : +d["total_duration_minutes"].replaceAll(",", "");
    });
    setData(data);
  }

  if (data.length === 0) {
    return html`<div>Data loading...</div>`;
  }

  // filtering data
  const filteredData = data.filter((d) => {
    return (
      d["system"] === system && d["country"] === country && d["field"] === field
    );
  });

  // console.log("Rendering consumer trends with", {
  //   selectedVariable,
  //   system,
  //   country,
  //   field,
  //   filteredData,
  // });

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
  const axisOffsetX = isMobile ? 0 : 20;
  const margin = {
    top: 30,
    right: 1,
    bottom: isMobile ? 80 : 50,
    left: isMobile ? 1 : 60,
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

  const yAxisTicks = isMobile ? valueScale.domain() : valueScale.ticks(4);

  // <text dy="15" style="fill: orange; font-size: 12px;">
  //       Debug: ${selectedVariable} | ${field} | ${system} | ${country} ||
  //       #datapoints prev year: ${datapointsPrev.length} || #datapoints current
  //       year: ${datapointsCurrent.length}
  //     </text>
  return html`<div style="position: relative;">
    <svg
      viewBox="0 0 ${width} ${height}"
      onmousemove="${(event) => {
        const pointer = d3.pointer(event);

        const leftSide = margin.left + axisOffsetX;
        const rightSide = leftSide + chartWidth;

        if (pointer[0] >= leftSide && pointer[0] <= rightSide) {
          const innerX = pointer[0] - margin.left - axisOffsetX;
          const datePrev = prevTime.invert(innerX).toISOString().slice(0, 10);
          const dateCurrent = currentTime
            .invert(innerX)
            .toISOString()
            .slice(0, 10);

          // get value for hoveredItem
          const datapointPrev =
            datapointsPrev.find((d) => d.date === datePrev) || {};
          const datapointCurrent =
            datapointsCurrent.find((d) => d.date === dateCurrent) || {};

          setHoveredItem({
            x: innerX,
            tooltipX: innerX + margin.left + axisOffsetX,
            tooltipY: margin.top,
            datePrev,
            dateCurrent,
            variable: selectedVariable,
            variablePrev:
              datapointPrev[buttonToVariableMapping[selectedVariable]] || null,
            variableCurrent:
              datapointCurrent[buttonToVariableMapping[selectedVariable]] ||
              null,
          });
        } else {
          setHoveredItem(null);
        }
      }}"
      onmouseleave="${() => setHoveredItem(null)}"
    >
      <g transform="translate(${margin.left}, ${margin.top})">
        ${isMobile ? "" : html`<line y2="${innerHeight}" stroke="black" />`}
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
                    y="${innerHeight}"
                    width="${xAxisTicksWidth}"
                    height="${isMobile ? 20 : 40}"
                    fill="#D3F5FF"
                    stroke="white"
                    stroke-width="5"
                  />
                  ${isMobile &&
                  (index === 0 ||
                    index === xAxisTicks.length / 2 - 1 ||
                    index === xAxisTicks.length - 1)
                    ? html`<text
                        x="${xAxisTicksWidth / 2}"
                        y="${innerHeight + 30}"
                        dominant-baseline="middle"
                        text-anchor="middle"
                        class="charts-text-body"
                      >
                        ${d3.timeFormat("%b")(tick)}
                      </text>`
                    : null}
                  ${!isMobile
                    ? html` <text
                        x="${xAxisTicksWidth / 2}"
                        y="${innerHeight + 20}"
                        dominant-baseline="middle"
                        text-anchor="middle"
                        class="charts-text-body"
                      >
                        ${d3.timeFormat("%B")(tick)}
                      </text>`
                    : null}</g
                >
              `;
            })}
          </g>

          <path
            d="${prevLine(addMissingDaysPrev(datapointsPrev))}"
            fill="none"
            stroke="#C3C3C3"
            stroke-width="${isMobile ? 2 : 3}"
            stroke-joint="round"
            stroke-linecap="round"
            style="transition: all ease 0.3s"
          />
          <path
            d="${currentLine(addMissingDaysCurrent(datapointsCurrent))}"
            fill="none"
            stroke="#0280FB"
            stroke-width="${isMobile ? 2 : 3}"
            style="transition: all ease 0.3s"
          />
          ${hoveredItem
            ? html`<line
                x1="${hoveredItem.x}"
                x2="${hoveredItem.x}"
                y1="0"
                y2="${innerHeight}"
                stroke="black"
                stroke-dasharray="2,2"
              />`
            : null}
        </g>
        <g class="y-axis">
          ${yAxisTicks.map((tick, i) => {
            return html`
              <g transform="translate(0, ${valueScale(tick)})">
                <text
                  x="${isMobile ? 8 : -10}"
                  y="${isMobile ? (i === 0 ? -12 : 15) : 0}"
                  dominant-baseline="middle"
                  text-anchor="${isMobile ? "start" : "end"}"
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
      </g>
    </svg>
    <${Tooltip} hoveredItem=${hoveredItem} />
  </div> `;
}

function Tooltip({ hoveredItem }) {
  if (!hoveredItem) return null;

  return html`<div
    class="tooltip"
    style="left: ${hoveredItem.x}px; top: ${hoveredItem.y}px;"
  >
    <p class="tooltip-title">${formatDate(hoveredItem.datePrev)}</p>
    <div>
      <p class="tooltip-label">${hoveredItem.variable}</p>

      <p class="tooltip-value">
        ${hoveredItem.variablePrev &&
        variableFormatting[buttonToVariableMapping[hoveredItem.variable]]
          ? variableFormatting[buttonToVariableMapping[hoveredItem.variable]](
              hoveredItem.variablePrev,
              2
            )
          : hoveredItem.variablePrev}
      </p>
    </div>

    <div style="border-top: 1px solid #D9D9D9; width: 100%;" />
    <p class="tooltip-title">${formatDate(hoveredItem.dateCurrent)}</p>
    <div>
      <p class="tooltip-label">${hoveredItem.variable}</p>
      <p class="tooltip-value">
        ${hoveredItem.variableCurrent &&
        variableFormatting[buttonToVariableMapping[hoveredItem.variable]]
          ? variableFormatting[buttonToVariableMapping[hoveredItem.variable]](
              hoveredItem.variableCurrent,
              2
            )
          : hoveredItem.variableCurrent}
      </p>
    </div>
  </div>`;
}
