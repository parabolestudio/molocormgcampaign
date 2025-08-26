import { html, renderComponent } from "./utils/preact-htm.js";

export function renderCreativeFormats() {
  console.log("Rendering Creative Formats");

  const formats = [
    {
      name: "video",
      containerId: "vis-creative-format-video",
    },
    {
      name: "statics",
      containerId: "vis-creative-format-statics",
    },
    {
      name: "playables",
      containerId: "vis-creative-format-playables",
    },
  ];

  for (let i = 0; i < formats.length; i++) {
    const { name, containerId } = formats[i];
    const containerElement = document.getElementById(containerId);
    if (containerElement) {
      // clear existing content before rendering
      containerElement.innerHTML = "";

      // Render ButtonGroup as a component so hooks work
      renderComponent(
        html`<${CreativeFormat}
          formatName=${name}
          containerId=${containerId}
        />`,
        containerElement
      );
    } else {
      console.error(
        `Could not find container element for creative format with id ${containerId}`
      );
    }
  }
}

export function CreativeFormat({ formatName = "Video", containerId }) {
  console.log("Rendering CreativeFormat component for format:", formatName);

  const visContainer = document.querySelector(`#${containerId}`);
  const width =
    visContainer && visContainer.offsetWidth ? visContainer.offsetWidth : 600;

  const margin = {
    allLeft: 10,
    allRight: 10,
    costTop: 10,
    costBottom: 10,
    spendTop: 10,
    spendBottom: 10,
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

  const costScale = d3
    .scaleLinear()
    //   .domain([0, d3.max(data, d => d.cost)])
    .range([heightCost, 0]);

  const spendScale = d3.scaleLinear().domain([0, 1]).range([heightSpend, 0]);

  const timeScale = d3.scaleLinear().domain([0, 1]).range([0, innerWidth]);

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
          fill="pink"
        />
      </g>
    </g>
  </svg>`;
}
