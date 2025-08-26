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
