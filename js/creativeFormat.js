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
  const height = 600;

  return html`<svg
    viewBox="0 0 ${width} ${height}"
    style="background: #D9D9D933; width: 100%; height: 100%;"
  ></svg>`;
}
