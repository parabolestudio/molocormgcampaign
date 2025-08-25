export function populateGeneralDropdowns() {
  console.log("Populating general dropdowns");

  let fieldDropdown = document.querySelector("#vis-general-dropdown-field");
  let countryDropdown = document.querySelector("#vis-general-dropdown-country");
  let systemDropdown = document.querySelector("#vis-general-dropdown-system");

  const fields = ["field A", "field B", "field C"];
  const countries = ["country A", "country B", "country C"];
  const systems = ["system A", "system B", "system C"];

  if (fieldDropdown) {
    if (fieldDropdown) fieldDropdown.innerHTML = "";
    fields.forEach((field) => {
      let option = document.createElement("option");
      option.text = field;
      fieldDropdown.add(option);
    });
    fieldDropdown.value = fields[0];
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
      option.text = country;
      countryDropdown.add(option);
    });
    countryDropdown.value = countries[0];
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
      option.text = system;
      systemDropdown.add(option);
    });
    systemDropdown.value = systems[0];
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
