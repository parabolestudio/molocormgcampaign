import { html, useState, useEffect } from "./utils/preact-htm.js";
import { getDropdownValue } from "./populateGeneralDropdowns.js";

export function Leaderboard() {
  const [data, setData] = useState([]);
  const [system, setSystem] = useState(getDropdownValue("system"));
  const [field, setField] = useState(getDropdownValue("field"));

  // listen to change in general system dropdown
  useEffect(() => {
    const handleSystemChange = (e) => setSystem(e.detail.selectedSystem);
    document.addEventListener(
      "vis-general-dropdown-system-changed",
      handleSystemChange
    );
    return () => {
      document.removeEventListener(
        "vis-general-dropdown-system-changed",
        handleSystemChange
      );
    };
  }, []);

  // listen to change in general field dropdown
  useEffect(() => {
    const handleFieldChange = (e) => setField(e.detail.selectedField);
    document.addEventListener(
      "vis-general-dropdown-field-changed",
      handleFieldChange
    );
    return () => {
      document.removeEventListener(
        "vis-general-dropdown-field-changed",
        handleFieldChange
      );
    };
  }, []);

  // fetch data from file, later from live sheet
  useEffect(() => {
    d3.csv(
      "https://raw.githubusercontent.com/parabolestudio/molocormgcampaign/refs/heads/main/data/leaderboard-data.csv"
    ).then((data) => {
      data.forEach((d) => {
        d["system"] = d["os"];
        d["field"] = d["vertical"];
        d["date"] = d["utc_week"];
        d["country"] = d["country"];
        d["dau"] = +d["dau"];
        d["cpm"] = +d["cpm"];
        d["cpi"] = +d["cpi"];
        d["ftd_rate"] = +d["ftd_rate"];
        d["rnk"] = +d["rnk"];
      });

      setData(data);
    });
  }, []);

  const filteredData = data.filter((d) => {
    return (
      d["system"] === system && d["field"] === field && d["country"] === "USA"
    );
  });
  console.log("Leaderboard data:", filteredData);

  const fakeData = [
    {
      name: "Name of Advertiser 1",
      value1: "$100",
      value2: "$200",
      value3: "$300",
    },
    {
      name: "Name of Advertiser 2",
      value1: "$150",
      value2: "$250",
      value3: "$350",
    },
    {
      name: "Name of Advertiser 3",
      value1: "$200",
      value2: "$300",
      value3: "$400",
    },
    {
      name: "Name of Advertiser 4",
      value1: "$250",
      value2: "$350",
      value3: "$450",
    },
    {
      name: "Name of Advertiser 5",
      value1: "$300",
      value2: "$400",
      value3: "$500",
    },
  ];

  const rows = fakeData.map((d, i) => {
    i = i + 1;
    return html`
      <div
        style="grid-area: ${i + 1} / 1 / ${i + 2} / 6; background: ${i === 1
          ? "#60E2B7"
          : "#CCF5E8"}; border-radius: 10px;"
      ></div>
      <div
        class="row-rank"
        style="grid-area: ${i + 1} / 1 / ${i +
        2} / 2; padding: 10px; background-opacity: 0.1;"
      >
        ${i}.
      </div>
      <div
        class="row-name"
        style="grid-area: ${i + 1} / 2 / ${i +
        2} / 3; padding: 10px; background-opacity: 0.1;"
      >
        ${d.name}
      </div>
      <div
        class="row-value"
        style="grid-area: ${i + 1} / 3 / ${i +
        2} / 4; padding: 10px; background-opacity: 0.1;"
      >
        ${d.value1}
      </div>
      <div
        class="row-value"
        style="grid-area: ${i + 1} / 4 / ${i +
        2} / 5; padding: 10px; background-opacity: 0.1;"
      >
        ${d.value2}
      </div>
      <div
        class="row-value"
        style="grid-area: ${i + 1} / 5 / ${i +
        2} / 6; padding: 10px; background-opacity: 0.1;"
      >
        ${d.value3}
      </div>
    `;
  });

  return html`<div id="leaderboard-container">
    <div
      style="display: grid; row-gap: 7px; grid-template-columns: 80px auto repeat(3, 80px);"
    >
      <div class="header-cell" style="grid-area: 1 / 1 / 2 / 2;">Rank</div>
      <div class="header-cell" style="grid-area: 1 / 2 / 2 / 3;">Name</div>
      <div class="header-cell" style="grid-area: 1 / 3 / 2 / 4;">
        Average CPM
      </div>
      <div class="header-cell" style="grid-area: 1 / 4 / 2 / 5;">
        Average CPI
      </div>
      <div class="header-cell" style="grid-area: 1 / 5 / 2 / 6;">
        Average FTD
      </div>
      ${rows}
    </div>
  </div>`;
}
