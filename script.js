console.log("Moloco RMG Campaign");

import { html, renderComponent } from "./js/utils/preact-htm.js";

import { AdvertiserTrends } from "./js/advertiserTrends.js";
import { ConsumerTrends } from "./js/consumerTrends.js";
import { Map } from "./js/map.js";
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

populateGeneralDropdowns();
const items = ["Button 1", "Button 2", "Button 3"];
renderButtonGroup("vis-consumer-trends-button-group", items);
