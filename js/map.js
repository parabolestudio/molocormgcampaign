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

  return html`<svg
    viewBox="0 0 ${width} ${height}"
    style="background: #D9D9D933; max-width: 100%; height: auto;"
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
          topojson.mesh(usGeoData, usGeoData.objects.states, (a, b) => a !== b)
        )}"
        stroke="white"
        fill="none"
        border-width="4"
      />
    </g>
  </svg>`;
}
