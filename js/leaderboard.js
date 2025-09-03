import { html, useState, useEffect } from "./utils/preact-htm.js";
import { getDropdownValue } from "./populateGeneralDropdowns.js";
import { variableFormatting, isMobile, dataPullFromSheet } from "./helpers.js";
import { fetchGoogleSheetCSV } from "./googleSheets.js";

const INITIAL_VISIBLE = 5;
const MAX_VISIBLE = 10;

export function Leaderboard() {
  const [data, setData] = useState([]);
  const [system, setSystem] = useState(getDropdownValue("system"));
  const [field, setField] = useState("Sportsbetting");
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
  // useEffect(() => {
  //   const handleFieldChange = (e) => setField(e.detail.selectedField);
  //   document.addEventListener(
  //     "vis-general-dropdown-field-changed",
  //     handleFieldChange
  //   );
  //   return () => {
  //     document.removeEventListener(
  //       "vis-general-dropdown-field-changed",
  //       handleFieldChange
  //     );
  //   };
  // }, []);

  useEffect(() => {
    if (dataPullFromSheet) {
      fetchGoogleSheetCSV("leaderboard")
        .then((data) => handleData(data))
        .catch((error) => {
          console.error(
            "Error fetching sheet data (last updated date):",
            error
          );
        });
    } else {
      d3.csv(
        "https://raw.githubusercontent.com/parabolestudio/molocormgcampaign/refs/heads/main/data/leaderboard-data2.csv"
      ).then((data) => handleData(data));
    }
  }, []);
  function handleData(data) {
    data.forEach((d) => {
      d["system"] = d["os"];
      d["field"] = d["sub_genre"];
      d["date"] = d["week_utc"];
      d["country"] = d["country"];
      d["cpm"] =
        d["cpm"] && d["cpm"] !== "" ? +d["cpm"].replace("$", "") : null;
      d["cpi"] =
        d["cpi"] && d["cpi"] !== "" ? +d["cpi"].replace("$", "") : null;
      d["cpftd"] =
        d["cpftd"] && d["cpftd"] !== ""
          ? +d["cpftd"].replace("$", "").replace(",", "")
          : null;
      d["arppu"] =
        d["arppu_d30"] && d["arppu_d30"] !== ""
          ? +d["arppu_d30"].replace("$", "")
          : null;

      d["rank"] = +d["rank_by_spend"];
    });

    setData(data);
  }

  const filteredData = data
    .filter((d) => {
      return d["system"] === system && d["field"] === field;
    })
    .sort((a, b) => a.rank - b.rank);

  const visibleRows = showMore
    ? filteredData.slice(0, MAX_VISIBLE)
    : filteredData.slice(0, INITIAL_VISIBLE);

  const rows = visibleRows.map((d) => {
    return html`
      <div
        class="row"
        style="display: grid; width: 100%; border-radius: 10px; background: ${d.rank ===
        1
          ? "#60E2B7"
          : "#CCF5E8"}; ${isMobile
          ? "grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(2, 1fr);"
          : "grid-template-columns: 80px auto repeat(4, 150px); "}"
      >
        <div
          class="row-cell row-rank"
          style="${isMobile ? "grid-area: 1 / 1 / 2 / 2;" : ``}"
        >
          ${isMobile
            ? html`<span class="charts-text-body-bold row-title-mobile"
                >Rank</span
              >`
            : null}
          ${d.rank}.
        </div>
        <div
          class="row-cell row-name"
          style="${isMobile ? "grid-area: 1 / 2 / 2 / 4; " : ``}"
        >
          ${isMobile
            ? html`<span class="charts-text-body-bold row-title-mobile"
                >Name</span
              >`
            : null}
          Advertiser ${d.rank}
        </div>
        <div
          class="row-cell row-value"
          style="${isMobile ? "grid-area: 2 / 1 / 3 / 2;" : ``}"
        >
          ${isMobile
            ? html`<span class="charts-text-body-bold row-title-mobile"
                >CPM</span
              >`
            : null}
          ${d.cpm ? variableFormatting["cpm"](d.cpm) : "-"}
        </div>
        <div
          class="row-cell row-value"
          style="${isMobile ? "grid-area: 2 / 2 / 3 / 3;" : ``}"
        >
          ${isMobile
            ? html`<span class="charts-text-body-bold row-title-mobile"
                >CPI</span
              >`
            : null}
          ${d.cpi ? variableFormatting["cpi"](d.cpi) : "-"}
        </div>
        <div
          class="row-cell row-value"
          style="${isMobile ? "grid-area: 2 / 3 / 3 / 4" : ``}"
        >
          ${isMobile
            ? html`<span class="charts-text-body-bold row-title-mobile"
                >CPFTD</span
              >`
            : null}
          ${d.cpftd ? variableFormatting["cpftd"](d.cpftd) : "-"}
        </div>
        ${isMobile
          ? null
          : html`<div class="row-cell row-value">
              ${d.arppu ? variableFormatting["arppu"](d.arppu) : "-"}
            </div>`}
      </div>
    `;
  });

  const headerRow = html`
    <div
      style="display: grid; grid-template-columns: 80px auto repeat(4, 150px); width: 100%;"
    >
      <div class="header-cell" style="grid-area: 1 / 1 / 2 / 2;">Rank</div>
      <div class="header-cell" style="grid-area: 1 / 2 / 2 / 3;">Name</div>
      <div class="header-cell" style="grid-area: 1 / 3 / 2 / 4;">CPM</div>
      <div class="header-cell" style="grid-area: 1 / 4 / 2 / 5;">CPI</div>
      <div class="header-cell" style="grid-area: 1 / 5 / 2 / 6;">CPFTD</div>
      <div class="header-cell" style="grid-area: 1 / 6 / 2 / 7;">ARPPU</div>
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
