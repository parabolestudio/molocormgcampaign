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
} from "./helpers.js";

export function renderCreativeFormats() {
  console.log("Rendering Creative Formats");

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

  // load data from creative-formats-data.csv file
  d3.csv(
    "https://raw.githubusercontent.com/parabolestudio/molocormgcampaign/refs/heads/main/data/creative-formats-data.csv"
  ).then((fullData) => {
    console.log("Loaded formats data:", fullData);

    fullData.forEach((d) => {
      d["system"] = d["os"];
      d["field"] = d["subgenre"];
      d["country"] = d["country"];
      d["date"] = d["date"];
      d["cpm"] = +d["avg_cpm"];
      d["cpi"] = +d["avg_cpi"];
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
            data=${fullData.filter((d) => d["format"] === name)}
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
  });
}

export function CreativeFormat({
  formatName = "Video",
  containerId,
  data = [],
  color = "black",
}) {
  const [selectedVariable, setSelectedVariable] = useState("CPM");
  const [system, setSystem] = useState(getDropdownValue("system"));
  const [country, setCountry] = useState(getDropdownValue("country"));
  const [field, setField] = useState(getDropdownValue("field"));

  // listen to change in general system dropdown
  useEffect(() => {
    const handleSystemChange = (e) => {
      setSystem(e.detail.selectedSystem);
    };
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
    const handleFieldChange = (e) => {
      setField(e.detail.selectedField);
    };
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
    const handleCountryChange = (e) => {
      setCountry(e.detail.selectedCountry);
    };
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

  // filtering data
  const filteredData = data.filter((d) => {
    return (
      d["system"] === system && d["country"] === country && d["field"] === field
    );
  });

  const datapoints = filteredData.map((d) => {
    return {
      date: d["date"],
      value: d[buttonToVariableMapping[selectedVariable]],
    };
  });

  console.log(
    "Rendering CreativeFormat component for format:",
    formatName,
    filteredData,
    system,
    country,
    field,
    selectedVariable,
    datapoints
  );

  // set up vis dimensions
  const visContainer = document.querySelector(`#${containerId}`);
  const width =
    visContainer && visContainer.offsetWidth ? visContainer.offsetWidth : 600;

  const margin = {
    allLeft: 50,
    allRight: 20,
    costTop: 50,
    costBottom: 50,
    spendTop: 30,
    spendBottom: 60,
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
    .domain([0, d3.max(datapoints, (d) => d.value)])
    .range([heightCost, 0])
    .nice();
  console.log("Cost scale domain:", costScale.domain());

  const spendScale = d3.scaleLinear().domain([0, 1]).range([heightSpend, 0]);

  const prevTime = prevTimeScale.range([0, chartWidth]);
  const currentTime = currentTimeScale.range([0, chartWidth]);

  console.log("Time scale start and end dates:", prevTime.domain());

  const prevLine = d3
    .line()
    .y((d) => costScale(d.value))
    .x((d) => prevTime(new Date(d.date)))
    .curve(d3.curveCatmullRom);

  const currentLine = d3
    .line()
    .y((d) => costScale(d.value))
    .x((d) => currentTime(new Date(d.date)))
    .curve(d3.curveCatmullRom);

  const datapointsPrev = datapoints.filter((d) => {
    const date = new Date(d.date);
    return date >= prevTime.domain()[0] && date <= prevTime.domain()[1];
  });
  const datapointsCurrent = datapoints.filter((d) => {
    const date = new Date(d.date);
    return date >= currentTime.domain()[0] && date <= currentTime.domain()[1];
  });

  // y axis ticks
  const yAxisTicks = costScale.ticks(4);

  return html`<svg
    viewBox="0 0 ${width} ${totalHeight}"
    style="border: 1px solid gray; width: 100%; height: 100%;"
  >
    <g transform="translate(${margin.allLeft}, ${margin.costTop})">
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
          d="${prevLine(datapointsPrev)}"
          fill="none"
          stroke="#C3C3C3"
          stroke-width="2"
          style="transition: all ease 0.3s"
        />
        <path
          d="${currentLine(datapointsCurrent)}"
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
        <rect
          x="0"
          y="0"
          width="${chartWidth}"
          height="${heightSpend}"
          fill="#D9D9D933"
        />
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
            x="${-axisOffsetX - 30}"
            y="${-margin.spendTop / 2}"
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
      </g>
    </g>
  </svg>`;
}
