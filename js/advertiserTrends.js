import { html, useState, useEffect } from "./utils/preact-htm.js";

export function AdvertiserTrends() {
  const [selectedVariable, setSelectedVariable] = useState("CPM");

  const visContainer = document.querySelector("#vis-advertiser-trends");
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
      "vis-advertiser-trends-button-group-changed",
      handleButtonChange
    );

    return () => {
      document.removeEventListener(
        "vis-consumer-trends-button-group-changed",
        handleButtonChange
      );
    };
  }, [selectedVariable]);

  return html`<svg
    viewBox="0 0 ${width} ${height}"
    style="background: #D9D9D933;"
  ></svg>`;
}
