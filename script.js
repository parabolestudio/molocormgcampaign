import { html, renderComponent } from "./js/utils/preact-htm.js";

import { AdvertiserTrends } from "./js/advertiserTrends.js";
import { ConsumerTrends } from "./js/consumerTrends.js";
import { Map } from "./js/map.js";
import { Leaderboard } from "./js/leaderboard.js";
import { populateGeneralDropdowns } from "./js/populateGeneralDropdowns.js";
import renderButtonGroup from "./js/renderButtonGroup.js";

const Vis = async (props) => {
  console.log("Rendering Vis component with props:", props);
  return html`<div class="vis-container">
    <${props.component} ...${props} />
  </div>`;
};

// loop over all visualizations and render them in general Vis component
const visList = [
  {
    id: "vis-advertiser-trends",
    component: AdvertiserTrends,
  },
  {
    id: "vis-consumer-trends",
    component: ConsumerTrends,
  },
  {
    id: "vis-map",
    component: Map,
  },
  {
    id: "vis-leaderboard",
    component: Leaderboard,
  },
];

visList.forEach((vis) => {
  const containerElement = document.getElementById(vis.id);
  if (containerElement) {
    // clear existing content before rendering
    containerElement.innerHTML = "";

    // wait for async Vis to resolve before rendering
    (async () => {
      const rendered = await Vis(vis);
      renderComponent(rendered, containerElement);
    })();
  } else {
    console.error(`Could not find container element for vis with id ${vis.id}`);
  }
});

// add options to the general dropdowns
populateGeneralDropdowns();

// render button groups
const itemsConsumer = ["Button 1", "Button 2", "Button 3"];
renderButtonGroup(
  "vis-consumer-trends-button-group",
  itemsConsumer,
  "Button 2"
);

const itemsAdvertiser = ["Button 1", "Button 2", "Button 3"];
renderButtonGroup(
  "vis-advertiser-trends-button-group",
  itemsAdvertiser,
  "Button 2"
);
const itemsMap = ["Button 1", "Button 2", "Button 3"];
renderButtonGroup("vis-map-button-group", itemsMap, "Button 2");

// fetch data from a public Google sheet without the API directly from the URL
async function fetchGoogleSheetCSV(sheetUrl) {
  const response = await fetch(sheetUrl);
  const csvText = await response.text();
  const rows = csvText
    .trim()
    .split("\n")
    .map((row) => row.split(","));
  return rows;
}

// Example usage:
const SHEET_ID =
  "2PACX-1vTHjzo63bGZDnWJEY7Znbn7_iaFFkaavshfQgbIVQ9wwawIRN959vAT8t_VT-k2pK3Enz3xPMJcJE-s";
const SHEET_TAB_GID_1 = "0";
const SHEET_TAB_GID_2 = "1850923812";

const sheetUrlTab1 = `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?gid=${SHEET_TAB_GID_1}&single=true&output=csv`;
const sheetUrlTab2 = `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?gid=${SHEET_TAB_GID_2}&single=true&output=csv`;

fetchGoogleSheetCSV(sheetUrlTab1).then((data) => {
  console.log("Sheet data 1:", data);
});
fetchGoogleSheetCSV(sheetUrlTab2).then((data) => {
  console.log("Sheet data 2:", data);
});
