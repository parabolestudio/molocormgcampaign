import { html, useState, useEffect } from "./utils/preact-htm.js";

export function Map() {
  const [selectedVariable, setSelectedVariable] = useState("Button 2");

  const visContainer = document.querySelector("#vis-map");
  const width =
    visContainer && visContainer.offsetWidth ? visContainer.offsetWidth : 600;
  const height = 500;

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

  return html`<svg
    viewBox="0 0 ${width} ${height}"
    style="background: #D9D9D933;"
  ></svg>`;
}
