import { html, useState, useEffect } from "./utils/preact-htm.js";
import { formatDate } from "./helpers.js";

export function LastDataUpdate() {
  const [latestDate, setLatestDate] = useState("");

  useEffect(() => {
    d3.csv(
      "https://raw.githubusercontent.com/parabolestudio/molocormgcampaign/refs/heads/main/data/latest-data-update.csv"
    ).then((data) => {
      const dateArray = data.map((d) => d["date"]);

      // get latest date from dateArray
      const latestDate = d3.max(dateArray);
      setLatestDate(latestDate);
    });
  }, []);

  if (!latestDate) {
    return html`August 25, 2025`;
  }

  return html`<span>${formatDate(latestDate)}</span>`;
}
