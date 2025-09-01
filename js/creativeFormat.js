import {
  html,
  renderComponent,
  useState,
  useEffect,
} from "./utils/preact-htm.js";
import { getDropdownValue } from "./populateGeneralDropdowns.js";
import {
  buttonToVariableMapping,
  prevTimeScale,
  currentTimeScale,
  allDaysPrev,
  allDaysCurrent,
  allWeeksCurrent,
  allWeeksPrev,
  addMissingDaysPrev,
  addMissingDaysCurrent,
  addMissingWeeksPrev,
  addMissingWeeksCurrent,
  formatDate,
  variableFormatting,
  isMobile,
} from "./helpers.js";

export function renderCreativeFormats() {
  const formats = [
    {
      name: "Video",
      containerId: "vis-creative-format-video",
      color: "#0280FB",
    },
    {
      name: "Statics",
      containerId: "vis-creative-format-statics",
      color: "#37BF92",
    },
    // {
    //   name: "Playables",
    //   containerId: "vis-creative-format-playables",
    //   color: "#37BF92",
    // },
  ];

  Promise.all([
    d3.csv(
      "https://raw.githubusercontent.com/parabolestudio/molocormgcampaign/refs/heads/main/data/creative-formats-data4.csv"
    ),
    // d3.csv(
    //   "https://raw.githubusercontent.com/parabolestudio/molocormgcampaign/refs/heads/main/data/creative-formats-data3-world.csv"
    // ),
  ])
    .then((files) => {
      const weeklyData = files[0];
      // const worldData = files[1];

      // daily
      // usData.forEach((d) => {
      //   d["system"] = d["os"];
      //   d["field"] = d["vertical"];
      //   d["country"] = d["country"];
      //   d["format"] = d["creative_format"];
      //   d["date"] = d["date"];
      //   d["cpm"] = +d["cpm"];
      //   d["cpi"] = +d["cpi"];
      //   d["cpftd"] = +d["cftd"];
      //   d["spend_share"] = +d["spend_share"];
      // });

      // weekly
      weeklyData.forEach((d) => {
        d["system"] = d["os"];
        d["field"] = d["sub_genre"];
        d["country"] = "USA"; // d["country"];
        d["format"] = d["format_type"];
        d["date"] = d["week_utc"];
        d["cpm"] =
          d["cpm_bm"] && d["cpm_bm"] !== ""
            ? +d["cpm_bm"].replace("$", "")
            : null;
        d["cpi"] =
          d["cpi_bm"] && d["cpi_bm"] !== ""
            ? +d["cpi_bm"].replace("$", "")
            : null;
        d["cpftd"] =
          d["cpftd_bm"] && d["cpftd_bm"] !== ""
            ? +d["cpftd_bm"].replace("$", "")
            : null;
        d["ipm"] =
          d["ipm_bm"] && d["ipm_bm"] !== ""
            ? +d["ipm_bm"].replace("$", "")
            : null;
        d["i2a"] =
          d["i2a_bm"] && d["i2a_bm"] !== ""
            ? +d["i2a_bm"].replace("%", "") / 100
            : null;
        d["spend_share"] = +d["format_spend_share"].replace("%", "") / 100;
      });

      for (let i = 0; i < formats.length; i++) {
        const { name, containerId, color } = formats[i];
        const containerElement = document.getElementById(containerId);
        if (containerElement) {
          // clear existing content before rendering
          containerElement.innerHTML = "";

          // Render ButtonGroup as a component so hooks work
          renderComponent(
            html`<${CreativeFormat}
              formatName=${name}
              containerId=${containerId}
              data=${weeklyData.filter((d) => d["format"] === name)}
              color=${color}
            />`,
            containerElement
          );
        } else {
          console.error(
            `Could not find container element for creative format with id ${containerId}`
          );
        }
      }
    })
    .catch((err) => {
      console.error("Error loading creative formats data:", err);
    });
}

export function CreativeFormat({
  formatName,
  containerId,
  data = [],
  color = "black",
}) {
  const [selectedVariable, setSelectedVariable] = useState("CPM");
  const [system, setSystem] = useState(getDropdownValue("system"));
  const [field, setField] = useState(getDropdownValue("field"));
  const [country, setCountry] = useState(getDropdownValue("country"));
  const isDaily = false; //country === "USA";
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
      "vis-creative-formats-button-group-changed",
      handleButtonChange
    );
    return () => {
      document.removeEventListener(
        "vis-creative-formats-button-group-changed",
        handleButtonChange
      );
    };
  }, [selectedVariable]);

  // const dataset = isDaily
  //   ? usData
  //   : worldData.filter((d) => d["country"] === country);

  // filtering data
  const filteredData = data.filter((d) => {
    return d["system"] === system && d["field"] === field;
  });

  let datapoints = filteredData.map((d) => {
    return {
      date: d["date"],
      cost: d[buttonToVariableMapping[selectedVariable]],
      spend_share: d["spend_share"],
    };
  });

  //   console.log(
  //     "Rendering CreativeFormat component for:",
  //     formatName,
  //     filteredData,
  //     system,
  //     country,
  //     field,
  //     selectedVariable,
  //     datapoints
  //   );

  // set up vis dimensions
  const visContainer = document.querySelector(`#${containerId}`);
  const width =
    visContainer && visContainer.offsetWidth ? visContainer.offsetWidth : 600;

  const margin = {
    allLeft: 45,
    allRight: 0,
    costTop: 50,
    costBottom: 50,
    spendTop: 30,
    spendBottom: 30,
  };

  const heightCost = 300;
  const heightSpend = 175;
  const innerWidth = width - margin.allLeft - margin.allRight;
  const axisOffsetX = isMobile ? 0 : 4;
  const chartWidth = innerWidth - axisOffsetX;

  const totalHeight =
    heightCost +
    heightSpend +
    margin.costTop +
    margin.costBottom +
    margin.spendTop +
    margin.spendBottom;

  // scales
  const costScale = d3
    .scaleLinear()
    .domain([0, d3.max(datapoints, (d) => d.cost)])
    .range([heightCost, 0])
    .nice();
  const spendScale = d3.scaleLinear().domain([0, 1]).range([heightSpend, 0]);
  const prevTime = prevTimeScale.range([0, chartWidth]);
  const currentTime = currentTimeScale.range([0, chartWidth]);

  const prevLineGen = d3
    .line()
    .y((d) => costScale(d.cost))
    .x((d) => prevTime(new Date(d.date)))
    .defined((d) => d.cost !== null);
  // .curve(d3.curveBasis);

  const currentLineGen = d3
    .line()
    .y((d) => costScale(d.cost))
    .x((d) => currentTime(new Date(d.date)))
    .defined((d) => d.cost !== null);
  // .curve(d3.curveCatmullRom);

  const datapointsPrev = datapoints
    .filter((d) => {
      const date = new Date(d.date);
      return (
        date >= prevTime.domain()[0] &&
        date <= prevTime.domain()[1] &&
        !isNaN(d.cost)
      );
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const datapointsCurrent = datapoints
    .filter((d) => {
      const date = new Date(d.date);
      return (
        date >= currentTime.domain()[0] &&
        date <= currentTime.domain()[1] &&
        !isNaN(d.cost)
      );
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const prevLine = prevLineGen(
    isDaily ? addMissingDaysPrev(datapointsPrev) : datapointsPrev
    //   : addMissingWeeksPrev(datapointsPrev)
  );
  const currentLine = currentLineGen(
    isDaily ? addMissingDaysCurrent(datapointsCurrent) : datapointsCurrent
    //   : addMissingWeeksCurrent(datapointsCurrent)
  );

  const barsScalePrev = d3
    .scaleBand()
    .domain(allWeeksPrev)
    .range([0, chartWidth])
    .padding(0.1);
  const barsScaleCurrent = d3
    .scaleBand()
    .domain(allWeeksCurrent)
    .range([0, chartWidth])
    .padding(0.1);

  // y axis ticks
  const yAxisTicks = isMobile ? costScale.domain() : costScale.ticks(4);

  //  <text dy="15" style="fill: orange; font-size: 12px;">
  //       ${selectedVariable} | ${field} | ${system} | ${country} || #prev:
  //       ${datapointsPrev.length} || #current: ${datapointsCurrent.length}
  //     </text>
  return html`<div style="position: relative">
    <svg
      viewBox="0 0 ${width} ${totalHeight}"
      style="width: 100%; height: 100%;"
      onmouseleave="${() => setHoveredItem(null)}"
      onmousemove="${(event) => {
        const pointer = d3.pointer(event);

        const leftSide = margin.allLeft + axisOffsetX;
        const rightSide = leftSide + chartWidth;

        if (pointer[0] >= leftSide && pointer[0] <= rightSide) {
          const innerX = pointer[0] - margin.allLeft - axisOffsetX;
          const datePrev = prevTime.invert(innerX).toISOString().slice(0, 10);
          const dateCurrent = currentTime
            .invert(innerX)
            .toISOString()
            .slice(0, 10);

          // // get first day of week for datePrev
          // const firstDayOfWeekPrev = d3.timeMonday
          //   .offset(new Date(datePrev), -1)
          //   .toISOString()
          //   .slice(0, 10);
          // console.log(
          //   "Tag prev:",
          //   datePrev,
          //   "Week prev:",
          //   firstDayOfWeekPrev,
          //   allWeeksPrev
          // );

          // const firstDayOfWeekCurrent = d3.timeMonday
          //   .offset(new Date(dateCurrent), -1)
          //   .toISOString()
          //   .slice(0, 10);

          // get value for hoveredItem
          const datapointPrev =
            datapointsPrev.find((d) => d.date === datePrev) || {};
          const datapointCurrent =
            datapointsCurrent.find((d) => d.date === dateCurrent) || {};

          setHoveredItem({
            x: innerX,
            tooltipX: innerX + margin.allLeft + axisOffsetX,
            tooltipY: margin.costTop,
            datePrev,
            dateCurrent,
            variable1: selectedVariable,
            costPrev: datapointPrev.cost || null,
            costCurrent: datapointCurrent.cost || null,
            variable2: "Spend Share",
            spendPrev: datapointPrev.spend_share || null,
            spendCurrent: datapointCurrent.spend_share || null,
          });
        } else {
          setHoveredItem(null);
        }
      }}"
    >
      <g transform="translate(${margin.allLeft}, ${margin.costTop})">
        ${hoveredItem
          ? html`<line
              x1="${hoveredItem.x}"
              x2="${hoveredItem.x}"
              y1="0"
              y2="${heightCost +
              margin.costBottom +
              margin.spendTop +
              heightSpend}"
              stroke="black"
              stroke-dasharray="2,2"
            />`
          : null}
        ${isMobile ? null : html`<line y2="${heightCost}" stroke="black" />`}
        <g transform="translate(${axisOffsetX},0)">
          <rect
            x="0"
            y="0"
            width="${chartWidth}"
            height="${heightCost}"
            fill="#D9D9D933"
          />
          <g class="y-axis">
            ${yAxisTicks.map((tick, i) => {
              if (!tick) return null;
              return html`<g class="y-axis-tick">
                <text
                  x="${-axisOffsetX}"
                  dx="-6"
                  y="${costScale(tick)}"
                  dy=${isMobile ? (i === 0 ? -12 : 12) : 0}
                  dominant-baseline="middle"
                  text-anchor="end"
                  class="charts-text-body"
                >
                  ${i === yAxisTicks.length - 1 &&
                  ["CPM", "CPI", "CPFTD", "IPM"].includes(selectedVariable)
                    ? "$"
                    : ""}${tick}
                </text>
              </g>`;
            })}
            <text
              x="${isMobile ? -axisOffsetX - margin.allLeft : -axisOffsetX}"
              y="${-margin.costTop / 2}"
              dominant-baseline="middle"
              text-anchor="${isMobile ? "start" : "end"}"
              class="charts-text-body-bold"
            >
              Cost
            </text>
          </g>
          <g class="x-axis">
            <text
              x="${prevTime.range()[0]}"
              y="${heightCost + 20}"
              dominant-baseline="middle"
              text-anchor="start"
              class="charts-text-body"
            >
              ${d3.timeFormat(isMobile ? "%b" : "%B")(prevTime.domain()[0])}
            </text>
            <text
              x="${currentTime.range()[1]}"
              y="${heightCost + 20}"
              dominant-baseline="middle"
              text-anchor="end"
              class="charts-text-body"
            >
              ${d3.timeFormat(isMobile ? "%b" : "%B")(currentTime.domain()[1])}
            </text>
          </g>
          <path
            d="${prevLine}"
            fill="none"
            stroke="#C3C3C3"
            stroke-width="3"
            style="transition: all ease 0.3s"
          />
          <path
            d="${currentLine}"
            fill="none"
            stroke="${color}"
            stroke-width="3"
            style="transition: all ease 0.3s"
          />
        </g>
      </g>
      <g
        transform="translate(${margin.allLeft}, ${margin.costTop +
        heightCost +
        margin.costBottom +
        margin.spendTop})"
      >
        ${isMobile ? null : html`<line y2="${heightSpend}" stroke="black" />`}

        <g transform="translate(${axisOffsetX},0)">
          <g class="y-axis">
            <text
              x="${-axisOffsetX}"
              dx="-6"
              y="${spendScale(0)}"
              dy=${isMobile ? -8 : -8}
              dominant-baseline="middle"
              text-anchor="end"
              class="charts-text-body"
            >
              0%
            </text>
            <text
              x="${-axisOffsetX}"
              dx="-6"
              y="${spendScale(1)}"
              dy=${isMobile ? 8 : 8}
              dominant-baseline="middle"
              text-anchor="end"
              class="charts-text-body"
            >
              100%
            </text>
            <text
              x="${isMobile
                ? -axisOffsetX - margin.allLeft
                : -axisOffsetX - 40}"
              y="${-25}"
              dominant-baseline="middle"
              text-anchor="start"
              class="charts-text-body-bold"
            >
              Spend Share
            </text>
          </g>
          <g class="x-axis">
            <text
              x="${prevTime.range()[0]}"
              y="${heightSpend + 20}"
              dominant-baseline="middle"
              text-anchor="start"
              class="charts-text-body"
            >
              ${d3.timeFormat(isMobile ? "%b" : "%B")(prevTime.domain()[0])}
            </text>
            <text
              x="${currentTime.range()[1]}"
              y="${heightSpend + 20}"
              dominant-baseline="middle"
              text-anchor="end"
              class="charts-text-body"
            >
              ${d3.timeFormat(isMobile ? "%b" : "%B")(prevTime.domain()[1])}
            </text>
          </g>

          <g>
            ${datapointsPrev.map((d) => {
              return html`<rect
                x="${barsScalePrev(d.date)}"
                y="${spendScale(d.spend_share)}"
                width="${barsScalePrev.bandwidth() / 2}"
                height="${heightSpend - spendScale(d.spend_share)}"
                fill="#D9D9D9"
              />`;
            })}
            ${datapointsCurrent.map((d) => {
              return html`<rect
                x="${barsScaleCurrent(d.date) +
                barsScaleCurrent.bandwidth() / 2}"
                y="${spendScale(d.spend_share)}"
                width="${barsScaleCurrent.bandwidth() / 2}"
                height="${heightSpend - spendScale(d.spend_share)}"
                fill="${color}"
              />`;
            })}
          </g>
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
    style="left: ${hoveredItem.tooltipX}px; top: ${hoveredItem.tooltipY}px;"
  >
    <p class="tooltip-title">${formatDate(hoveredItem.datePrev)}</p>
    <div>
      <p class="tooltip-label">${hoveredItem.variable1}</p>
      <p class="tooltip-value">
        ${hoveredItem.costPrev
          ? variableFormatting[buttonToVariableMapping[hoveredItem.variable1]](
              hoveredItem.costPrev,
              2
            )
          : "-"}
      </p>
    </div>
    <div>
      <p class="tooltip-label">${hoveredItem.variable2}</p>
      <p class="tooltip-value">
        ${hoveredItem.spendPrev
          ? variableFormatting[buttonToVariableMapping[hoveredItem.variable2]](
              hoveredItem.spendPrev,
              0
            )
          : "-"}
      </p>
    </div>
    <div style="border-top: 1px solid #D9D9D9; width: 100%;" />
    <p class="tooltip-title">${formatDate(hoveredItem.dateCurrent)}</p>
    <div>
      <p class="tooltip-label">${hoveredItem.variable1}</p>
      <p class="tooltip-value">
        ${hoveredItem.costCurrent
          ? variableFormatting[buttonToVariableMapping[hoveredItem.variable1]](
              hoveredItem.costCurrent,
              2
            )
          : "-"}
      </p>
    </div>
    <div>
      <p class="tooltip-label">${hoveredItem.variable2}</p>
      <p class="tooltip-value">
        ${hoveredItem.spendCurrent
          ? variableFormatting[buttonToVariableMapping[hoveredItem.variable2]](
              hoveredItem.spendCurrent,
              0
            )
          : "-"}
      </p>
    </div>
  </div>`;
}
