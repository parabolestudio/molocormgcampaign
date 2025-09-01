// fetch data from a public Google sheet without the API directly from the URL
export async function fetchGoogleSheetCSV(tabName) {
  const sheetUrl = getSheetUrl(tabName);
  const response = await fetch(sheetUrl);
  const csvText = await response.text();
  const lines = csvText.trim().split("\n");
  const headers = lines[0].split(",");
  const data = lines.slice(1).map((line) => {
    const values = line.split(",");
    const rowObj = {};
    headers.forEach((header, i) => {
      header = header.trim();
      let cellValue = values[i] || "";
      if (cellValue.startsWith('"')) {
        cellValue = cellValue.slice(1);
      }
      if (cellValue.endsWith('"')) {
        cellValue = cellValue.slice(0, -1);
      }
      rowObj[header] = cellValue;
    });
    return rowObj;
  });
  return data;
}

const SHEET_ID =
  "2PACX-1vTOmbHaf7C-yNazrNfKd8CCHgDlpLUwYw5W9BGw_kkAiEx7oDgaQ08dFapzk82JugiA1VHN8JcgwC7E";

const SHEET_TAB_IDS = {
  "daily-data": "50498285",
  "advertiser-trends": "927917492",
  "last-data-update": "255109729",
};

function getSheetUrl(tabName) {
  const gid = SHEET_TAB_IDS[tabName];
  if (!gid) {
    throw new Error(`No GID found for tab name: ${tabName}`);
  }
  return `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?gid=${gid}&single=true&output=csv`;
}
