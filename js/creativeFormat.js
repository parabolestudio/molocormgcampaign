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
  addMissingDaysPrev,
  addMissingDaysCurrent,
  addMissingWeeksPrev,
  addMissingWeeksCurrent,
  formatDate,
  variableFormatting,
} from "./helpers.js";

export function renderCreativeFormats() {
  const formats = [
    {
      name: "Video",
      containerId: "vis-creative-format-video",
      color: "#C368F9",
    },
    {
      name: "Statics",
      containerId: "vis-creative-format-statics",
      color: "#0280FB",
    },
    {
      name: "Playables",
      containerId: "vis-creative-format-playables",
      color: "#37BF92",
    },
  ];

  Promise.all([
    d3.csv(
      "https://raw.githubusercontent.com/parabolestudio/molocormgcampaign/refs/heads/main/data/creative-formats-data2-usa.csv"
    ),
    d3.csv(
      "https://raw.githubusercontent.com/parabolestudio/molocormgcampaign/refs/heads/main/data/creative-formats-data2-world.csv"
    ),
  ])
    .then((files) => {
      const usData = files[0];
      const worldData = files[1];

      // daily
      usData.forEach((d) => {
        d["system"] = d["os"];
        d["field"] = d["vertical"];
        d["country"] = d["country"];
        d["format"] = d["creative_format"];
        d["date"] = d["date"];
        d["cpm"] = +d["cpm"];
        d["cpi"] = +d["cpi"];
        d["cftd"] = +d["cftd"];
        d["spend_share"] = 0.5; // +d["avg_user_spend"];
      });

      // weekly
      worldData.forEach((d) => {
        d["system"] = d["os"];
        d["field"] = d["vertical"];
        d["country"] = d["country"];
        d["format"] = d["creative_format"];
        d["date"] = d["utc_week"];
        d["cpm"] = +d["cpm"];
        d["cpi"] = +d["cpi"];
        d["cftd"] = +d["cftd"];
        d["spend_share"] = 0.5; // +d["avg_user_spend"];
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
              usData=${usData.filter((d) => d["format"] === name)}
              worldData=${worldData.filter((d) => d["format"] === name)}
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
  usData = [],
  worldData = [],
  color = "black",
}) {
  const [selectedVariable, setSelectedVariable] = useState("CPM");
  const [system, setSystem] = useState(getDropdownValue("system"));
  const [field, setField] = useState(getDropdownValue("field"));
  const [country, setCountry] = useState(getDropdownValue("country"));
  const isDaily = country === "USA";
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

  const dataset = isDaily
    ? usData
    : worldData.filter((d) => d["country"] === country);

  // filtering data
  const filteredData = dataset.filter((d) => {
    // console.log("Filtering data:", d);
    // return true;
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
    allLeft: 50,
    allRight: 5,
    costTop: 50,
    costBottom: 50,
    spendTop: 30,
    spendBottom: 30,
  };

  const heightCost = 300;
  const heightSpend = 175;
  const innerWidth = width - margin.allLeft - margin.allRight;
  const axisOffsetX = 4;
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
    .domain(allDaysPrev)
    .range([0, chartWidth])
    .padding(0.1);
  const barsScaleCurrent = d3
    .scaleBand()
    .domain(allDaysCurrent)
    .range([0, chartWidth])
    .padding(0.1);

  // y axis ticks
  const yAxisTicks = costScale.ticks(4);

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
      <text dy="15" style="fill: orange; font-size: 12px;">
        ${selectedVariable} | ${field} | ${system} | ${country} || #prev:
        ${datapointsPrev.length} || #current: ${datapointsCurrent.length}
      </text>
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
        <line x1="0" y1="0" x2="0" y2="${heightCost}" stroke="black" />
        <g transform="translate(${axisOffsetX},0)">
          <rect
            x="0"
            y="0"
            width="${chartWidth}"
            height="${heightCost}"
            fill="#D9D9D933"
          />
          <g class="y-axis">
            ${yAxisTicks.map((tick) => {
              return html`<g class="y-axis-tick">
                <text
                  x="${-axisOffsetX}"
                  dx="-6"
                  y="${costScale(tick)}"
                  dominant-baseline="middle"
                  text-anchor="end"
                  class="charts-text-body"
                >
                  $${tick}
                </text>
              </g>`;
            })}
            <text
              x="${-axisOffsetX}"
              y="${-margin.costTop / 2}"
              dominant-baseline="middle"
              text-anchor="end"
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
              ${d3.timeFormat("%B")(prevTime.domain()[0])}
            </text>
            <text
              x="${currentTime.range()[1]}"
              y="${heightCost + 20}"
              dominant-baseline="middle"
              text-anchor="end"
              class="charts-text-body"
            >
              ${d3.timeFormat("%B")(currentTime.domain()[1])}
            </text>
          </g>
          <path
            d="${prevLine}"
            fill="none"
            stroke="#C3C3C3"
            stroke-width="2"
            style="transition: all ease 0.3s"
          />
          <path
            d="${currentLine}"
            fill="none"
            stroke="${color}"
            stroke-width="2"
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
        <line x1="0" y1="0" x2="0" y2="${heightSpend}" stroke="black" />

        <g transform="translate(${axisOffsetX},0)">
          <g class="y-axis">
            <text
              x="${-axisOffsetX}"
              dx="-6"
              y="${spendScale(0)}"
              dominant-baseline="alphabetic"
              text-anchor="end"
              class="charts-text-body"
            >
              0%
            </text>
            <text
              x="${-axisOffsetX}"
              dx="-6"
              y="${spendScale(1)}"
              dominant-baseline="hanging"
              text-anchor="end"
              class="charts-text-body"
            >
              100%
            </text>
            <text
              x="${-axisOffsetX - 40}"
              y="${-margin.spendTop / 2}"
              dominant-baseline="middle"
              text-anchor="start"
              class="charts-text-body-bold"
            >
              Spend Share (Not real data atm)
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
              ${d3.timeFormat("%B")(prevTime.domain()[0])}
            </text>
            <text
              x="${currentTime.range()[1]}"
              y="${heightSpend + 20}"
              dominant-baseline="middle"
              text-anchor="end"
              class="charts-text-body"
            >
              ${d3.timeFormat("%B")(currentTime.domain()[1])}
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
    <${Tooltip} hoveredItem=${isDaily ? hoveredItem : null} />
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

// <p class="tooltip-value">
//       ${variableFormatting[buttonToVariableMapping[hoveredItem.variable]]
//         ? variableFormatting[buttonToVariableMapping[hoveredItem.variable]](
//             hoveredItem.value,
//             2
//           )
//         : hoveredItem.value}
//     </p>
