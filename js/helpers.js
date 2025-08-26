// mapping from state name to state short id
export const stateMapping = {
  Alabama: "AL",
  Alaska: "AK",
  Arizona: "AZ",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Connecticut: "CT",
  Delaware: "DE",
  Florida: "FL",
  Georgia: "GA",
  Hawaii: "HI",
  Idaho: "ID",
  Illinois: "IL",
  Indiana: "IN",
  Iowa: "IA",
  Kansas: "KS",
  Kentucky: "KY",
  Louisiana: "LA",
  Maine: "ME",
  Maryland: "MD",
  Massachusetts: "MA",
  Michigan: "MI",
  Minnesota: "MN",
  Mississippi: "MS",
  Missouri: "MO",
  Montana: "MT",
  Nebraska: "NE",
  Nevada: "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennsylvania: "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  Virginia: "VA",
  Washington: "WA",
  "West Virginia": "WV",
  Wisconsin: "WI",
  Wyoming: "WY",
  "District of Columbia": "DC",
};

export const buttonToVariableMapping = {
  CPM: "cpm",
  CPI: "cpi",
  "Spend Share": "spend_share",
  DAU: "dau",
};

// time scales
const prevYear = new Date().getFullYear() - 1;
const currentYear = new Date().getFullYear();

// Create a time scale from Aug 1 to end of July the following year
export const prevTimeScale = d3.scaleTime().domain([
  new Date(prevYear, 7, 1), // Aug is month 7 (0-based)
  new Date(currentYear, 6, 31), // July is month 6, day 31
]);
export const currentTimeScale = d3
  .scaleTime()
  .domain([new Date(currentYear, 7, 1), new Date(currentYear + 1, 6, 31)]);

// get all days between two dates
function getDaysBetween(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate).toISOString().split("T")[0]); // format as YYYY-MM-DD
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
}

export const allDaysPrev = getDaysBetween(
  prevTimeScale.domain()[0],
  prevTimeScale.domain()[1]
);
export const allDaysCurrent = getDaysBetween(
  currentTimeScale.domain()[0],
  currentTimeScale.domain()[1]
);

function addNonExistingDates(dataArray, startDate, endDate) {
  const allDates = getDaysBetween(startDate, endDate);
  const existingDates = dataArray.map((d) => d.date);
  const missingDates = allDates.filter((date) => !existingDates.includes(date));

  const filledData = dataArray.concat(
    missingDates.map((date) => ({
      date,
      cost: null,
      spend_share: null,
      dau: null,
    }))
  );

  return filledData;
}

// export function addMissingDates(dataArray) {
//   const filledData = addNonExistingDates(
//     dataArray,
//     prevTimeScale.domain()[0],
//     currentTimeScale.domain()[1]
//   );
//   // sort by date
//   filledData.sort((a, b) => new Date(a.date) - new Date(b.date));
//   return filledData;
// }

export function addMissingDatesPrev(dataArray) {
  const filledData = addNonExistingDates(
    dataArray,
    prevTimeScale.domain()[0],
    prevTimeScale.domain()[1]
  );
  // sort by date
  filledData.sort((a, b) => new Date(a.date) - new Date(b.date));
  return filledData;
}

export function addMissingDatesCurrent(dataArray) {
  const filledData = addNonExistingDates(
    dataArray,
    currentTimeScale.domain()[0],
    currentTimeScale.domain()[1]
  );
  // sort by date
  filledData.sort((a, b) => new Date(a.date) - new Date(b.date));
  return filledData;
}
