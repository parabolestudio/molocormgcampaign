import { html, renderComponent, useState } from "./utils/preact-htm.js";

export default function renderButtonGroup(
  containerId,
  items,
  defaultSelected = items[0]
) {
  console.log("Rendering button group", containerId);

  const containerElement = document.getElementById(containerId);
  if (containerElement) {
    // clear existing content before rendering
    containerElement.innerHTML = "";

    // wait for async button group to resolve before rendering
    (async () => {
      const rendered = await ButtonGroup({ items, defaultSelected });
      renderComponent(rendered, containerElement);
    })();
  } else {
    console.error(
      `Could not find container element for button group with id ${containerId}`
    );
  }
}

const ButtonGroup = async (props) => {
  console.log("...", props);
  return html`<div class="rmg-coded-button-group">
    ${props.items.map(
      (item) =>
        html`<button
          class="${item === props.defaultSelected ? "selected" : ""}"
          onClick=${() => {
            console.log("Button clicked:", item);
          }}
        >
          ${item}
        </button>`
    )}
  </div>`;
};
