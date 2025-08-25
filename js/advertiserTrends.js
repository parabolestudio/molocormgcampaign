import { html } from "./utils/preact-htm.js";

export function AdvertiserTrends() {
  const visContainer = document.querySelector("#vis-advertiser-trends");
  const width =
    visContainer && visContainer.offsetWidth ? visContainer.offsetWidth : 600;
  const height = 500;

  return html`<svg
    viewBox="0 0 ${width} ${height}"
    style="background: #D9D9D933;"
  ></svg>`;
}
