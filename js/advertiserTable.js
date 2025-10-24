import { html, useState, useEffect } from "./utils/preact-htm.js";
import { fetchGoogleSheetCSV } from "./googleSheets.js";
import { isMobile } from "./helpers.js";

export function AdvertiserTable() {
  const [data, setData] = useState([]);
  const [system, setSystem] = useState("IOS");
  const [country, setCountry] = useState("USA");
  const [field, setField] = useState("Sportsbetting");
  const [showMore, setShowMore] = useState(false);

  // listen to change in general system dropdown
  useEffect(() => {
    const handleSystemChange = (e) => setSystem(e.detail.selected);
    document.addEventListener(
      "vis-general-filters-system-changed",
      handleSystemChange
    );
    return () => {
      document.removeEventListener(
        "vis-general-filters-system-changed",
        handleSystemChange
      );
    };
  }, []);

  // listen to change in general field dropdown
  useEffect(() => {
    const handleFieldChange = (e) => setField(e.detail.selected);
    document.addEventListener(
      "vis-general-filters-field-changed",
      handleFieldChange
    );
    return () => {
      document.removeEventListener(
        "vis-general-filters-field-changed",
        handleFieldChange
      );
    };
  }, []);

  // listen to change in general country dropdown
  useEffect(() => {
    const handleCountryChange = (e) => setCountry(e.detail.selected);
    document.addEventListener(
      "vis-general-filters-country-changed",
      handleCountryChange
    );
    return () => {
      document.removeEventListener(
        "vis-general-filters-country-changed",
        handleCountryChange
      );
    };
  }, []);

  useEffect(() => {
    fetchGoogleSheetCSV("advertiser-table")
      .then((data) => handleData(data))
      .catch((error) => {
        console.error("Error fetching sheet data (last updated date):", error);
      });
  }, []);

  function handleData(data) {
    data.forEach((d) => {
      d["system"] = d["os"];
      d["field"] = d["sub_genre"];
      d["month"] = d["Month"];
      d["monthShort"] = d["Month"].substring(0, 3) + " " + d["Month"].slice(-4);
      d["country"] = d["country"];
      d["cpm"] =
        d["CPM"] && d["CPM"] !== "" ? +d["CPM"].replace("$", "") : null;
      d["cpi"] =
        d["CPI"] && d["CPI"] !== "" ? +d["CPI"].replace("$", "") : null;
      d["cpftd"] =
        d["cpFTD"] && d["cpFTD"] !== "" ? +d["cpFTD"].replace("$", "") : null;
      d["cpm_mom"] =
        d["CPM_MoM_Pct"] && d["CPM_MoM_Pct"] !== "" ? +d["CPM_MoM_Pct"] : null;
      d["cpi_mom"] =
        d["CPI_MoM_Pct"] && d["CPI_MoM_Pct"] !== "" ? +d["CPI_MoM_Pct"] : null;
      d["cpftd_mom"] =
        d["cpFTD_MoM_Pct"] && d["cpFTD_MoM_Pct"] !== ""
          ? +d["cpFTD_MoM_Pct"]
          : null;
    });

    setData(data);
  }

  if (data.length === 0) {
    return html`<div>Data loading...</div>`;
  }

  // filtering data
  const filteredData = data
    .filter((d) => {
      return (
        d["system"] === system &&
        d["country"] === country &&
        d["field"] === field
      );
    })
    .slice(0, showMore ? undefined : 3);

  console.log("Rendering advertisers table with", {
    system,
    country,
    field,
    filteredData,
  });

  const labelHeaderRowDesktop = [0, 2, 4].map((i) => {
    return html`
      <div
        style="grid-area: 2 / ${i + 2} / 3 / ${i + 3};"
        class="header-cell-label"
      >
        Average value
      </div>
      <div
        style="grid-area: 2 / ${i + 3} / 3 / ${i + 4};"
        class="header-cell-label"
      >
        Monthly change
      </div>
    `;
  });

  const monthsRowsDesktop = filteredData.map((d, i) => {
    return html`
      <div style="grid-area: ${i + 3} / 1 / ${i + 4} / 2;" class="cell-month">
        ${d["month"]}
      </div>
      <div style="grid-area: ${i + 3} / 2 / ${i + 4} / 3;" class="cell-value">
        ${formatAverageValue(d["cpm"])}
      </div>
      <div style="grid-area: ${i + 3} / 3 / ${i + 4} / 4;" class="cell-growth">
        ${formatPercent(d["cpm_mom"])}
      </div>
      <div style="grid-area: ${i + 3} / 4 / ${i + 4} / 5;" class="cell-value">
        ${formatAverageValue(d["cpi"])}
      </div>
      <div style="grid-area: ${i + 3} / 5 / ${i + 4} / 6;" class="cell-growth">
        ${formatPercent(d["cpi_mom"])}
      </div>
      <div style="grid-area: ${i + 3} / 6 / ${i + 4} / 7;" class="cell-value">
        ${formatAverageValue(d["cpftd"])}
      </div>
      <div style="grid-area: ${i + 3} / 7 / ${i + 4} / 8;" class="cell-growth">
        ${formatPercent(d["cpftd_mom"])}
      </div>
    `;
  });

  const monthsRowsMobile = filteredData.map((d, i) => {
    return html`
      <div
        style="grid-area: ${i * 2 + 2} / 1 / ${i * 2 + 4} / 2;"
        class="cell-month"
      >
        ${d["monthShort"]}
      </div>
      <div
        style="grid-area: ${i * 2 + 2} / 2 / ${i * 2 + 3} / 3;"
        class="cell-value"
      >
        ${formatAverageValue(d["cpm"])}
      </div>
      <div
        style="grid-area: ${i * 2 + 3} / 2 / ${i * 2 + 4} / 3;"
        class="cell-growth"
      >
        ${formatPercent(d["cpm_mom"])}
      </div>
      <div
        style="grid-area: ${i * 2 + 2} / 3 / ${i * 2 + 3} / 4;"
        class="cell-value"
      >
        ${formatAverageValue(d["cpi"])}
      </div>
      <div
        style="grid-area: ${i * 2 + 3} / 3 / ${i * 2 + 4} / 4;"
        class="cell-growth"
      >
        ${formatPercent(d["cpi_mom"])}
      </div>
      <div
        style="grid-area: ${i * 2 + 2} / 4 / ${i * 2 + 3} / 5;"
        class="cell-value"
      >
        ${formatAverageValue(d["cpftd"])}
      </div>
      <div
        style="grid-area: ${i * 2 + 3} / 4 / ${i * 2 + 4} / 5;"
        class="cell-growth"
      >
        ${formatPercent(d["cpftd_mom"])}
      </div>
    `;
  });

  function formatPercent(value) {
    if (value === null || isNaN(value)) {
      return "-";
    }
    const valueFormatted = (value * 100).toFixed(0);
    if (value > 0) {
      return `+${valueFormatted}%`;
    }
    return `${valueFormatted}%`;
  }

  function formatAverageValue(value) {
    if (value === null || isNaN(value)) {
      return "-";
    }
    return `$${value.toFixed(2)}`;
  }

  const desktopTable = html`<div
    style="display: grid;
grid-template-columns: 1.5fr repeat(6, 1fr);
grid-template-rows: repeat(${filteredData.length + 2 + 1}, 1fr);
grid-column-gap: 6px;
grid-row-gap: 6px;"
  >
    <div style="grid-area: 1 / 2 / 2 / 4;" class="header-cell-metric">CPM</div>
    <div style="grid-area: 1 / 4 / 2 / 6;" class="header-cell-metric">CPI</div>
    <div style="grid-area: 1 / 6 / 2 / 8;" class="header-cell-metric">
      CFTD (D7)
    </div>
    <div
      style="grid-area: 2 / 1 / 3 / 2; "
      class="header-cell-label header-cell-month"
    >
      Month
    </div>
    ${labelHeaderRowDesktop} ${monthsRowsDesktop}
    <div
      style="grid-area: ${filteredData.length + 3} / 1 / ${filteredData.length +
      4} / 2;"
      class="show-more"
    >
      <button onClick=${() => setShowMore(!showMore)}>
        ${showMore ? "Show less" : "Show more"}
      </button>
    </div>
  </div>`;

  const mobileTable = html`<div
    style="display: grid;
grid-template-columns: repeat(4, 1fr);
grid-template-rows: repeat(${filteredData.length * 2 + 2}, 1fr);
grid-column-gap: 2px;
grid-row-gap: 2px;"
  >
    <div style="grid-area: 1 / 2 / 2 / 3;" class="header-cell-metric">CPM</div>
    <div style="grid-area: 1 / 3 / 2 / 4;" class="header-cell-metric">CPI</div>
    <div style="grid-area: 1 / 4 / 2 / 5;" class="header-cell-metric">
      <span>CFTD</span>
      <span style="padding-left: 2px; font-size: 10px;">(D7)</span>
    </div>
    ${monthsRowsMobile}
    <div
      style="grid-area: ${filteredData.length * 2 +
      2} / 1 / ${filteredData.length * 2 + 3} / 3;"
      class="show-more"
    >
      <button onClick=${() => setShowMore(!showMore)}>
        ${showMore ? "Show less" : "Show more"}
      </button>
    </div>
  </div>`;

  const mobileLegend = html`<div
    style="display: grid; grid-template-rows: repeat(2, 1fr); margin-bottom: 16px; width: fit-content;"
  >
    <div
      style="grid-area: 1 / 1 / 2 / 2; margin: 0; font-size: 14px;"
      class="cell-value"
    >
      Average value
    </div>
    <div
      style="grid-area: 2 / 1 / 3 / 2; margin:0; font-weight: 400; padding: 8px 24px; font-size: 14px;"
      class="cell-growth"
    >
      Monthly change
    </div>
  </div>`;

  return html`<div style="margin-top: ${isMobile ? "20px" : "65px"};">
    <div class="rmg-viz-subtitle" style="margin-bottom: 20px;">
      Monthly marketing metrics
    </div>
    ${isMobile ? mobileLegend : null} ${isMobile ? mobileTable : desktopTable}
  </div>`;
}
