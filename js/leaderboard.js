import { html, useState, useEffect } from "./utils/preact-htm.js";
import { getDropdownValue } from "./populateGeneralDropdowns.js";
import { variableFormatting, isMobile } from "./helpers.js";

const INITIAL_VISIBLE = 5;
const MAX_VISIBLE = 10;

export function Leaderboard() {
  const [data, setData] = useState([]);
  const [system, setSystem] = useState(getDropdownValue("system"));
  const [field, setField] = useState(getDropdownValue("field"));
  const [showMore, setShowMore] = useState(false);

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
        d["cpm"] = +d["cpm"];
        d["cpi"] = +d["cpi"];
        d["ftd_rate"] = +d["ftd_rate"];
        d["rnk"] = +d["rnk"];
      });

      setData(data);
    });
  }, []);

  const filteredData = data
    .filter((d) => {
      return (
        d["system"] === system && d["field"] === field && d["country"] === "USA"
      );
    })
    .sort((a, b) => a.rnk - b.rnk);

  const visibleRows = showMore
    ? filteredData.slice(0, MAX_VISIBLE)
    : filteredData.slice(0, INITIAL_VISIBLE);

  const rows = visibleRows.map((d) => {
    return html`
      <div
        class="row"
        style="display: grid;grid-template-columns: 80px auto repeat(3, 150px); width: 100%; border-radius: 10px; background: ${d.rnk ===
        1
          ? "#60E2B7"
          : "#CCF5E8"};"
      >
        <div
          class="row-cell row-rank"
          style="grid-area: ${d.rnk + 1} / 1 / ${d.rnk + 2} / 2; "
        >
          ${isMobile
            ? html`<span class="charts-text-body-bold row-title-mobile"
                >Rank</span
              >`
            : null}
          ${d.rnk}.
        </div>
        <div
          class="row-cell row-name"
          style="grid-area: ${d.rnk + 1} / 2 / ${d.rnk + 2} / 3;"
        >
          ${isMobile
            ? html`<span class="charts-text-body-bold row-title-mobile"
                >Name</span
              >`
            : null}
          Advertiser ${d.rnk}
        </div>
        <div
          class="row-cell row-value"
          style="grid-area: ${d.rnk + 1} / 3 / ${d.rnk + 2} / 4;"
        >
          ${isMobile
            ? html`<span class="charts-text-body-bold row-title-mobile"
                >Avg CPM</span
              >`
            : null}
          ${variableFormatting["cpm"](d.cpm)}
        </div>
        <div
          class="row-cell row-value"
          style="grid-area: ${d.rnk + 1} / 4 / ${d.rnk + 2} / 5;"
        >
          ${isMobile
            ? html`<span class="charts-text-body-bold row-title-mobile"
                >Avg CPI</span
              >`
            : null}
          ${variableFormatting["cpi"](d.cpi)}
        </div>
        <div
          class="row-cell row-value"
          style="grid-area: ${d.rnk + 1} / 5 / ${d.rnk + 2} / 6;"
        >
          ${isMobile
            ? html`<span class="charts-text-body-bold row-title-mobile"
                >Avg FTD</span
              >`
            : null}
          ${d.ftd_rate !== 0 ? d.ftd_rate.toFixed(2) : ""}
        </div>
      </div>
    `;
  });

  const headerRow = html`
    <div
      style="display: grid; grid-template-columns: 80px auto repeat(3, 150px); width: 100%;"
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
    </div>
  `;

  return html`<div
    id="leaderboard-container"
    style="display: flex; flex-direction: column; align-items: flex-end;"
  >
    <div style="display: flex; flex-direction: column; gap: 8px;width: 100%;">
      ${isMobile ? null : headerRow} ${rows}
    </div>
    ${filteredData.length > INITIAL_VISIBLE
      ? html`
          <p
            onclick="${() => setShowMore(!showMore)}"
            class="charts-text-body-bold"
            style="color: white; cursor: pointer; text-decoration: underline;"
          >
            Show ${showMore ? "Less" : "More"}
          </p>
        `
      : null}
  </div>`;
}

// ${!isMobile ? headerCells : null} ${rows}
