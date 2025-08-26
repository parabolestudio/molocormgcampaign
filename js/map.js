import { html, useState, useEffect } from "./utils/preact-htm.js";
const geoPath = d3.geoPath();
import { getDropdownValue } from "./populateGeneralDropdowns.js";
import { stateMapping } from "./helpers.js";

const buttonToVariableMapping = {
  CPM: "cpm",
  CPI: "cpi",
  "Spend Share": "spend_share",
};

export function Map() {
  const [selectedVariable, setSelectedVariable] = useState("CPM");
  const [system, setSystem] = useState(getDropdownValue("system"));
  const [field, setField] = useState(getDropdownValue("field"));
  const [usGeoData, setUsGeoData] = useState(null);
  const [data, setData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

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

  // Listen for custom change event in button group
  useEffect(() => {
    const handleButtonChange = (e) => {
      const newButton = e.detail.selectedButton;
      if (newButton && newButton !== selectedVariable)
        setSelectedVariable(newButton);
    };
    document.addEventListener(
      "vis-map-button-group-changed",
      handleButtonChange
    );

    return () => {
      document.removeEventListener(
        "vis-map-button-group-changed",
        handleButtonChange
      );
    };
  }, [selectedVariable]);

  // fetch US Geo data
  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/parabolestudio/molocormgcampaign/refs/heads/main/data/states-albers-10m.json"
    )
      .then((res) => res.json())
      .then(setUsGeoData);
  }, []);

  if (!usGeoData) {
    return html`<div>Loading US Geo data...</div>`;
  }

  // fetch data from file, later from live sheet
  useEffect(() => {
    d3.csv(
      "https://raw.githubusercontent.com/parabolestudio/molocormgcampaign/refs/heads/main/data/map-data.csv"
    ).then((data) => {
      data.forEach((d) => {
        d["system"] = d["os"];
        d["field"] = d["subgenre"];
        d["state"] = d["state"];
        d["date_utc"] = d["date_utc"];
        d["cpm"] = +d["cpm"];
        d["cpi"] = +d["cpi"];
        d["spend_share"] = +(
          d["spend_share_state_level"].replace(/%/g, "") / 100
        );

        // delete all other fields without knowing the fields names
        Object.keys(d).forEach((key) => {
          if (
            ![
              "system",
              "field",
              "cpm",
              "cpi",
              "spend_share",
              "state",
              "date_utc",
            ].includes(key)
          ) {
            delete d[key];
          }
        });
      });

      setData(data);
    });
  }, []);

  if (data.length === 0) {
    return html`<div>Data loading...</div>`;
  }

  // filter data by field and system & sort by date
  const filteredData = data
    .filter((d) => {
      return d["field"] === field && d["system"] === system;
    })
    .sort((a, b) => new Date(a["date_utc"]) - new Date(b["date_utc"]));

  // get all unique dates
  const uniqueDates = Array.from(
    new Set(filteredData.map((d) => d["date_utc"]))
  ).sort((a, b) => new Date(a) - new Date(b));

  const [startDate, setStartDate] = useState(uniqueDates[0]);
  const [endDate, setEndDate] = useState(uniqueDates[uniqueDates.length - 1]);

  useEffect(() => {
    if (!selectedDate) setSelectedDate(uniqueDates[0]);
    if (startDate !== uniqueDates[0]) setStartDate(uniqueDates[0]);
    if (endDate !== uniqueDates[uniqueDates.length - 1])
      setEndDate(uniqueDates[uniqueDates.length - 1]);
  }, [uniqueDates]);

  // Dispatch custom events to notify time selector component
  useEffect(() => {
    document.dispatchEvent(
      new CustomEvent("vis-map-start-date-changed-from-data", {
        detail: { startDate: startDate },
      })
    );
  }, [startDate]);
  useEffect(() => {
    document.dispatchEvent(
      new CustomEvent("vis-map-end-date-changed-from-data", {
        detail: { endDate: endDate },
      })
    );
  }, [endDate]);

  // listen for change in selected date in map time range slider
  useEffect(() => {
    const handleSelectedDateChange = (e) => {
      setSelectedDate(e.detail.selectedDate);
    };
    document.addEventListener(
      "vis-map-selected-date-changed",
      handleSelectedDateChange
    );

    return () => {
      document.removeEventListener(
        "vis-map-selected-date-changed",
        handleSelectedDateChange
      );
    };
  }, []);

  // filter for daily data
  const dailyData = filteredData.filter((d) => d["date_utc"] === selectedDate);
  console.log(
    "Daily Data:",
    dailyData,
    "for",
    selectedDate,
    " and ",
    selectedVariable
  );
  if (dailyData.length === 0) {
    return html`<div>No data available for selected date.</div>`;
  }

  const width = 975;
  const height = 610;

  const states = topojson.feature(usGeoData, usGeoData.objects.states).features;

  const maxValue = d3.max(
    filteredData.filter((d) => d["state"] !== "ON"),
    (d) => d[buttonToVariableMapping[selectedVariable]]
  );
  const maxItem = filteredData.find(
    (d) => d[buttonToVariableMapping[selectedVariable]] === maxValue
  );
  console.log("Max Item:", maxItem);
  const colorScale = d3
    .scaleSequential(["#16D2FF", "#040078"])
    .domain([0, maxValue])
    .nice();

  function getStateFill(state) {
    const stateId = stateMapping[state];

    if (stateId === undefined) {
      console.error("cannot find state id");
      return "red";
    }
    // find item in daily data
    const dailyItem = dailyData.find((d) => d.state === stateId);
    if (dailyItem) {
      return colorScale(dailyItem[buttonToVariableMapping[selectedVariable]]);
    } else {
      return "#D9D9D9";
    }
  }

  return html`<div
    style="display: flex; flex-direction: column; align-items: flex-end;"
  >
    <svg
      viewBox="0 0 ${width} ${height}"
      style="max-width: 1122px;margin: 0 auto; height: auto;"
    >
      <g stroke-linejoin="round" stroke-linecap="round">
        ${states.map(
          (d) => html`<path
            d="${geoPath(d)}"
            fill="${getStateFill(d.properties.name)}"
            data-state-name="${d.properties.name}"
            onmouseover="${(e) => {
              const stateName = e.target.dataset.stateName;
              // console.log("Hovered state Name:", stateName);
            }}"
            class="map-state"
          ></path>`
        )}
        <path
          d="${geoPath(
            topojson.mesh(
              usGeoData,
              usGeoData.objects.states,
              (a, b) => a !== b
            )
          )}"
          stroke="white"
          fill="none"
          border-width="4"
        />
      </g>
    </svg>
    <div>
      <div class="rmg-filter-label">Value legend</div>
      <div
        style="width: 300px; height: 20px;   background: linear-gradient(90deg, ${colorScale(
          0
        )} 0%, ${colorScale(maxValue)} 100%);
"
      ></div>
      <div>min: ${colorScale.domain()[0]}</div>
      <div>max: ${colorScale.domain()[1]}</div>
      <div>Date for max value: ${maxItem ? maxItem["date_utc"] : "N/A"}</div>
    </div>
  </div>`;
}

export function MapTimeSelector() {
  const [startDateRaw, setStartDateRaw] = useState("2024-08-01");
  const [endDateRaw, setEndDateRaw] = useState("2025-08-25");
  const [sliderValue, setSliderValue] = useState(0);

  // listen to change in start date from new data
  useEffect(() => {
    const handleStartDateChangeFromData = (e) => {
      setStartDateRaw(e.detail.startDate);
      setSliderValue(0);
    };
    document.addEventListener(
      "vis-map-start-date-changed-from-data",
      handleStartDateChangeFromData
    );

    return () => {
      document.removeEventListener(
        "vis-map-start-date-changed-from-data",
        handleStartDateChangeFromData
      );
    };
  }, []);
  // listen to change in end date from new data
  useEffect(() => {
    const handleEndDateChangeFromData = (e) => {
      setEndDateRaw(e.detail.endDate);
      setSliderValue(0);
    };
    document.addEventListener(
      "vis-map-end-date-changed-from-data",
      handleEndDateChangeFromData
    );

    return () => {
      document.removeEventListener(
        "vis-map-end-date-changed-from-data",
        handleEndDateChangeFromData
      );
    };
  }, []);

  useEffect(() => {
    document.dispatchEvent(
      new CustomEvent("vis-map-selected-date-changed", {
        detail: { selectedDate: getDateString(sliderValue) },
      })
    );
  }, [sliderValue]);

  const numDays =
    Math.floor(
      (new Date(endDateRaw) - new Date(startDateRaw)) / (1000 * 60 * 60 * 24)
    ) + 1;

  const getDateString = (offset) => {
    const d = new Date(startDateRaw);
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  };

  return html`<div
    style="display: flex; flex-direction: row; align-items: center; border: 1px solid black; border-radius: 20px;"
  >
    <div
      style="padding:  12.5px 12.5px 12.5px 20px; border-right: 1px solid black; cursor: pointer;"
      onclick="${() => setSliderValue(sliderValue + 1)}"
    >
      <svg
        width="11"
        height="16"
        viewBox="0 0 11 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 13.8699L0 2.91292C0 1.19374 2.02562 0.275703 3.31839 1.40898L9.34471 6.69179C10.2321 7.46971 10.2565 8.84288 9.39734 9.65186L3.37102 15.326C2.09478 16.5276 0 15.6228 0 13.8699Z"
          fill="black"
        />
      </svg>
    </div>

    <label
      for="dateRange"
      style="margin-bottom:0; padding: 0 18px; white-space: nowrap;"
      class="charts-text-body"
      >${getDateString(sliderValue)}</label
    >
    <input
      id="dateRange"
      type="range"
      class="myRange"
      min="0"
      max="${numDays - 1}"
      value="${sliderValue}"
      step="1"
      oninput="${(e) => setSliderValue(Number(e.target.value))}"
      style="margin-right:20px;"
    />
  </div>`;
}
