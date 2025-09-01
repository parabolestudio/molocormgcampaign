import { html, renderComponent } from "./utils/preact-htm.js";

export default function renderLineChartLegends() {
  console.log("Rendering line chart legends");

  const legends = [
    {
      containerId: "vis-line-chart-legend-consumer",
      color: "#0280FB",
    },
    {
      containerId: "vis-line-chart-legend-advertiser",
      color: "#C368F9",
    },
    {
      containerId: "vis-line-chart-legend-formats",
      color: "#535353",
    },
  ];

  for (let index = 0; index < legends.length; index++) {
    const element = legends[index];

    const containerElement = document.getElementById(element.containerId);
    if (containerElement) {
      // clear existing content before rendering
      containerElement.innerHTML = "";

      // Render ButtonGroup as a component so hooks work
      renderComponent(
        html`<${LineChartLegend} color=${element.color} />`,
        containerElement
      );
    } else {
      console.error(
        `Could not find container element for button group with id ${element.containerId}`
      );
    }
  }
}

function LineChartLegend(props) {
  return html`<div
    class="vis-line-chart-legend"
    style="display: flex; column-gap: 24px; row-gap: 8px; flex-wrap: wrap;"
  >
    <p
      class="legend-item rmg-viz-subtitle"
      style="display: flex; align-items: center; gap: 4px; margin: 0;"
    >
      Past (2024/2025)
      <span
        style="width: 60px; height: 3px; display: inline-block; border-radius: 4px; background-color: #C3C3C3;"
      ></span>
    </p>
    <p
      class="legend-item rmg-viz-subtitle"
      style="display: flex; align-items: center; gap: 4px; margin: 0;"
    >
      Current (2025/2026)
      <span
        style="width: 60px; height: 3px; display: inline-block; border-radius: 4px;  background-color: ${props.color};"
      ></span>
    </p>
  </div>`;
}
