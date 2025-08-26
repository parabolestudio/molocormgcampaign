import { html, useState, useEffect } from "./utils/preact-htm.js";
import { prevTimeScale, currentTimeScale } from "./helpers.js";
import { getDropdownValue } from "./populateGeneralDropdowns.js";

export function ConsumerTrends() {
  const [selectedVariable, setSelectedVariable] = useState("MAU");
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

  console.log("Rendering consumer trends with", {
    selectedVariable,
    system,
    country,
    field,
  });

  // set up dimensions
  const visContainer = document.querySelector("#vis-consumer-trends");
  const width =
    visContainer && visContainer.offsetWidth ? visContainer.offsetWidth : 600;
  const height = 500;
  const axisOffsetX = 20;
  const margin = {
    top: 20,
    right: 20,
    bottom: 60,
    left: 50,
  };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const chartWidth = innerWidth - axisOffsetX;

  // scales
  const prevTime = prevTimeScale.range([0, chartWidth]);
  // const currentTime = currentTimeScale.range([0, chartWidth]);

  const xAxisTicks = prevTime.ticks(12);
  let xAxisTicksWidth = prevTime(xAxisTicks[1]) - prevTime(xAxisTicks[0]);

  return html`<svg
    viewBox="0 0 ${width} ${height}"
    style="border: 1px solid gray;"
  >
    <g transform="translate(${margin.left}, ${margin.top})">
      <line y2="${innerHeight}" stroke="black" />
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
      </g>
    </g>
  </svg>`;
}
