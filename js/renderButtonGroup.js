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

    // Render ButtonGroup as a component so hooks work
    renderComponent(
      html`<${ButtonGroup}
        items=${items}
        defaultSelected=${defaultSelected}
        containerId=${containerId}
      />`,
      containerElement
    );
  } else {
    console.error(
      `Could not find container element for button group with id ${containerId}`
    );
  }
}

function ButtonGroup(props) {
  const [selected, setSelected] = useState(props.defaultSelected);
  return html`<div class="rmg-coded-button-group">
    ${props.items.map(
      (item) =>
        html`<button
          class="${item === selected ? "selected" : ""}"
          onClick=${() => {
            setSelected(item);
            // Dispatch custom event to notify other components
            document.dispatchEvent(
              new CustomEvent(`${props.containerId}-changed`, {
                detail: { selectedButton: item },
              })
            );
          }}
        >
          ${item}
        </button>`
    )}
  </div>`;
}
