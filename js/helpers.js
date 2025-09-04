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
  CPFTD: "cpftd",
  "CPFTD (D7)": "cpftd",
  "Spend Share": "spend_share",
  DAU: "dau",
  IPM: "ipm",
  I2A: "i2a",
  Spend: "spend",
  Downloads: "downloads",
  "Time Spent": "time_spent",
  ARPPU: "arppu",
};

export const variableFormatting = {
  cpm: (value, precision = 2) => `$${value.toFixed(precision)}`,
  cpi: (value, precision = 2) => `$${value.toFixed(precision)}`,
  cpftd: (value, precision = 2) => `$${value.toFixed(precision)}`,
  spend: (value, precision = 2) => `$${value.toFixed(precision)}`,
  arppu: (value, precision = 2) => `$${value.toFixed(precision)}`,
  spend_share: (value, precision = 2) => `${(value * 100).toFixed(precision)}%`,
  dau: (value, precision = 2) => {
    return value >= 1_000_000
      ? (value / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M"
      : value >= 1_000
      ? (value / 1_000).toFixed(1).replace(/\.0$/, "") + "k"
      : value;
  },
  downloads: (value, precision = 2) => {
    return value >= 1_000_000
      ? (value / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M"
      : value >= 1_000
      ? (value / 1_000).toFixed(1).replace(/\.0$/, "") + "k"
      : value;
  },
  time_spent: (value, precision = 2) => {
    return value >= 1_000_000
      ? (value / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M"
      : value >= 1_000
      ? (value / 1_000).toFixed(1).replace(/\.0$/, "") + "k"
      : value;
  },
};

export const isMobile = window.innerWidth <= 480;
export const dataPullFromSheet = true;

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
export const allWeeksPrev = getWeeksBetween(
  prevTimeScale.domain()[0],
  prevTimeScale.domain()[1]
);
export const allWeeksCurrent = getWeeksBetween(
  currentTimeScale.domain()[0],
  currentTimeScale.domain()[1]
);

function addNonExistingDays(dataArray, startDate, endDate) {
  const allDates = getDaysBetween(startDate, endDate);
  const existingDates = dataArray.map((d) => d.date);
  const missingDates = allDates.filter((date) => !existingDates.includes(date));

  const filledData = dataArray.concat(
    missingDates.map((date) => ({
      date,
      cost: null,
      spend: null,
      spend_share: null,
      dau: null,
      cpm: null,
      cpi: null,
      cpftd: null,
      ipm: null,
      i2a: null,
      downloads: null,
      time_spent: null,
      arppu: null,
    }))
  );

  return filledData;
}

// Helper to get all weeks between two dates (returns array of YYYY-MM-DD for each week's Monday)
function getWeeksBetween(startDate, endDate) {
  const weeks = [];
  let current = new Date(startDate);
  // Set to nearest Monday
  current.setDate(current.getDate() - ((current.getDay() + 6) % 7));
  while (current <= endDate) {
    weeks.push(new Date(current).toISOString().split("T")[0]);
    current.setDate(current.getDate() + 7);
  }
  // get next day's date to fix Monday / Sunday problem
  return weeks.map((week_day) => {
    const nextDay = new Date(week_day);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay.toISOString().split("T")[0];
  });
}

function addNonExistingWeeks(dataArray, startDate, endDate) {
  const allWeeks = getWeeksBetween(startDate, endDate);
  const existingWeeks = dataArray.map((d) => d.date);
  const missingWeeks = allWeeks.filter((week) => !existingWeeks.includes(week));

  const filledData = dataArray.concat(
    missingWeeks.map((week) => ({
      date: week,
      cost: null,
      spend: null,
      spend_share: null,
      dau: null,
      cpftd: null,
      cpm: null,
      cpi: null,
      ipm: null,
      i2a: null,
      downloads: null,
      time_spent: null,
      arppu: null,
    }))
  );

  return filledData;
}

export function addMissingDaysPrev(dataArray) {
  const filledData = addNonExistingDays(
    dataArray,
    prevTimeScale.domain()[0],
    prevTimeScale.domain()[1]
  );
  // sort by date
  filledData.sort((a, b) => new Date(a.date) - new Date(b.date));
  return filledData;
}

export function addMissingDaysCurrent(dataArray) {
  const filledData = addNonExistingDays(
    dataArray,
    currentTimeScale.domain()[0],
    currentTimeScale.domain()[1]
  );
  // sort by date
  filledData.sort((a, b) => new Date(a.date) - new Date(b.date));
  return filledData;
}

export function addMissingWeeksPrev(dataArray) {
  const filledData = addNonExistingWeeks(
    dataArray,
    prevTimeScale.domain()[0],
    prevTimeScale.domain()[1]
  );
  // sort by date
  filledData.sort((a, b) => new Date(a.date) - new Date(b.date));
  return filledData;
}

export function addMissingWeeksCurrent(dataArray) {
  const filledData = addNonExistingWeeks(
    dataArray,
    currentTimeScale.domain()[0],
    currentTimeScale.domain()[1]
  );
  // sort by date
  filledData.sort((a, b) => new Date(a.date) - new Date(b.date));
  return filledData;
}

// from YYYY-MM-DD to September 25, 2024
export function formatDate(dateString, type = null) {
  const date = new Date(dateString);
  const month = date.toLocaleString("en-US", {
    month: type === "short-month" ? "short" : "long",
  });
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}

export const getWeek = function (date) {
  var date = new Date(date.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  // January 4 is always in week 1.
  var week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  return (
    1 +
    Math.round(
      ((date.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    )
  );
};
