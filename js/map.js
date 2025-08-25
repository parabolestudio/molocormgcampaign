import { html, useState, useEffect } from "./utils/preact-htm.js";
const geoPath = d3.geoPath();

export function Map() {
  const [selectedVariable, setSelectedVariable] = useState("Button 2");
  const [usGeoData, setUsGeoData] = useState(null);

  // fetch US Geo data
  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/parabolestudio/molocormgcampaign/refs/heads/main/data/states-albers-10m.json"
    )
      .then((res) => res.json())
      .then(setUsGeoData);
  }, []);

  if (!usGeoData) return html`<div>Loading map data...</div>`;

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
  console.log("Selected variable in Map:", selectedVariable);

  const width = 975;
  const height = 610;

  const states = topojson.feature(usGeoData, usGeoData.objects.states).features;

  const colors = d3.scaleOrdinal(d3.schemeBlues[9]);

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
            fill="${colors(Math.random())}"
            data-state-id="${d.properties.name}"
            onmouseover="${(e) => {
              const stateId = e.target.dataset.stateId;
              console.log("Hovered state ID:", stateId);
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
      <div>...</div>
    </div>
  </div>`;
}

export function MapTimeSelector() {
  // Date range: Jan 1 to Jan 30
  const startDate = new Date(2025, 0, 1); // Jan is month 0
  const endDate = new Date(2025, 0, 30);
  const numDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  const [sliderValue, setSliderValue] = useState(0);

  const getDateString = (offset) => {
    const d = new Date(startDate);
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

// <div
//   style="display: flex; justify-content: space-between; width: 100%; font-size: 0.9em;"
// >
//   <span>${getDateString(0)}</span>
//   <span>${getDateString(numDays - 1)}</span>
// </div>
