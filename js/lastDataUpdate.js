import { html, useState, useEffect } from "./utils/preact-htm.js";
import { formatDate, dataPullFromSheet } from "./helpers.js";
import { fetchGoogleSheetCSV } from "./googleSheets.js";

export function LastDataUpdate() {
  const [latestDate, setLatestDate] = useState("");

  function handleData(data) {
    setLatestDate(d3.max(data.map((d) => d["date"])));
  }

  useEffect(() => {
    if (dataPullFromSheet) {
      fetchGoogleSheetCSV("last-data-update")
        .then((data) => handleData(data))
        .catch((error) => {
          console.error(
            "Error fetching sheet data (last updated date):",
            error
          );
        });
    } else {
      d3.csv(
        "https://raw.githubusercontent.com/parabolestudio/molocormgcampaign/refs/heads/main/data/latest-data-update.csv"
      )
        .then((data) => handleData(data))
        .catch((error) => {
          console.error("Error fetching CSV data (last updated date):", error);
        });
    }
  }, []);

  // fallback until data is loaded
  if (!latestDate) {
    return html`August 25, 2025`;
  }

  return html`<span>${formatDate(latestDate)}</span>`;
}
