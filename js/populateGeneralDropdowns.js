export function populateGeneralDropdowns() {
  console.log("Populating general dropdowns");

  let fieldDropdown = document.querySelector("#vis-general-dropdown-field");
  let countryDropdown = document.querySelector("#vis-general-dropdown-country");
  let systemDropdown = document.querySelector("#vis-general-dropdown-system");

  const fields = [
    {
      text: "Sportsbetting",
      value: "Sportsbetting",
    },
    {
      text: "RMG",
      value: "RMG",
    },
  ];
  const fieldDefault = fields[0];
  const countries = [
    {
      text: "U.S.",
      value: "U.S.",
    },
    {
      text: "Country B",
      value: "Country B",
    },
  ];
  const countryDefault = countries[0];
  const systems = [
    // {
    //   text: "All systems",
    //   value: "ALL",
    // },
    {
      text: "iOS",
      value: "IOS",
    },
    {
      text: "Android",
      value: "ANDROID",
    },
  ];
  const systemDefault = systems[0];

  if (fieldDropdown) {
    if (fieldDropdown) fieldDropdown.innerHTML = "";
    fields.forEach((field) => {
      let option = document.createElement("option");
      option.value = field.value;
      option.text = field.text;
      fieldDropdown.add(option);
    });
    fieldDropdown.value = fieldDefault.value;
    fieldDropdown.addEventListener("change", (e) => {
      console.log("Selected field:", e.target.value);
      // Dispatch custom event to notify other components
      document.dispatchEvent(
        new CustomEvent("vis-general-dropdown-field-changed", {
          detail: { selectedField: e.target.value },
        })
      );
    });
  }

  if (countryDropdown) {
    if (countryDropdown) countryDropdown.innerHTML = "";
    countries.forEach((country) => {
      let option = document.createElement("option");
      option.value = country.value;
      option.text = country.text;
      countryDropdown.add(option);
    });
    countryDropdown.value = countryDefault.value;
    countryDropdown.addEventListener("change", (e) => {
      console.log("Selected country:", e.target.value);
      // Dispatch custom event to notify other components
      document.dispatchEvent(
        new CustomEvent("vis-general-dropdown-country-changed", {
          detail: { selectedCountry: e.target.value },
        })
      );
    });
  }

  if (systemDropdown) {
    if (systemDropdown) systemDropdown.innerHTML = "";
    systems.forEach((system) => {
      let option = document.createElement("option");
      option.text = system.text;
      option.value = system.value;
      systemDropdown.add(option);
    });
    systemDropdown.value = systemDefault.value;
    systemDropdown.addEventListener("change", (e) => {
      console.log("Selected system:", e.target.value);
      // Dispatch custom event to notify other components
      document.dispatchEvent(
        new CustomEvent("vis-general-dropdown-system-changed", {
          detail: { selectedSystem: e.target.value },
        })
      );
    });
  }
}

export function getDropdownValue(setting = "system") {
  // find out selected value of dropdown with id vis-general-dropdown-system
  const dropdown = document.querySelector(`#vis-general-dropdown-${setting}`);
  return dropdown ? dropdown.value : null;
}
