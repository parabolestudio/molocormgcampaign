export function populateGeneralDropdowns() {
  console.log("Populating general dropdowns");

  let fieldDropdown = document.querySelector("#vis-general-dropdown-field");
  let countryDropdown = document.querySelector("#vis-general-dropdown-country");
  let systemDropdown = document.querySelector("#vis-general-dropdown-system");

  const countries = [
    {
      text: "U.S.",
      value: "USA",
    },
    {
      text: "U.K.",
      value: "GBR",
    },
  ];
  const countryParam = new URLSearchParams(window.location.search).get(
    "testCountry"
  );
  console.log("testCountry param:", countryParam);
  const countryDefault =
    countryParam && countryParam === "GBR" ? countries[1] : countries[0];

  const fields = [
    {
      text: "Sportsbetting",
      value: "Sportsbetting",
    },
    {
      text: "Gambling & Casino",
      value: "RMG",
    },
  ];
  const fieldsGBR = [
    {
      text: "Gambling & Casino",
      value: "RMG",
    },
  ];

  function getFieldsSet() {
    if (countryParam === "GBR") {
      return fieldsGBR;
    }
    const fieldsSet =
      getDropdownValue("country") === "GBR" ? fieldsGBR : fields;
    return fieldsSet;
  }

  function getFieldDefault() {
    return getFieldsSet()[0];
  }

  const systems = [
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

  populateFieldDropdown();
  populateSystemDropdown();
  showHideUsOnlySections();

  function populateFieldDropdown() {
    const fieldsSet = getFieldsSet();
    if (fieldDropdown) {
      if (fieldDropdown) fieldDropdown.innerHTML = "";
      fieldsSet.forEach((field) => {
        let option = document.createElement("option");
        option.value = field.value;
        option.text = field.text;
        fieldDropdown.add(option);
      });
      fieldDropdown.value = getFieldDefault().value;
      fieldDropdown.disabled = fieldsSet.length === 1;
      fieldDropdown.addEventListener("change", (e) => {
        // Dispatch custom event to notify other components
        document.dispatchEvent(
          new CustomEvent("vis-general-dropdown-field-changed", {
            detail: { selectedField: e.target.value },
          })
        );
      });
    }
  }

  if (countryDropdown) {
    if (countryDropdown) countryDropdown.innerHTML = "";
    countries
      .sort((a, b) => a.text.localeCompare(b.text))
      .forEach((country) => {
        let option = document.createElement("option");
        option.value = country.value;
        option.text = country.text;
        countryDropdown.add(option);
      });
    countryDropdown.value = countryDefault.value;
    countryDropdown.addEventListener("change", (e) => {
      // Dispatch custom event to notify other components
      document.dispatchEvent(
        new CustomEvent("vis-general-dropdown-country-changed", {
          detail: { selectedCountry: e.target.value },
        })
      );
      populateFieldDropdown();
      populateSystemDropdown();

      showHideUsOnlySections(
        getDropdownValue("country") === "GBR" ? false : true
      );
    });
  }

  function populateSystemDropdown() {
    if (systemDropdown) {
      if (systemDropdown) systemDropdown.innerHTML = "";
      systems.forEach((system) => {
        let option = document.createElement("option");
        option.text = system.text;
        option.value = system.value;
        systemDropdown.add(option);
      });
      systemDropdown.value = systemDefault.value;
      systemDropdown.disabled = getDropdownValue("country") === "GBR";
      systemDropdown.addEventListener("change", (e) => {
        // Dispatch custom event to notify other components
        document.dispatchEvent(
          new CustomEvent("vis-general-dropdown-system-changed", {
            detail: { selectedSystem: e.target.value },
          })
        );
      });
    }
  }
}

export function getDropdownValue(setting = "system") {
  // find out selected value of dropdown with id vis-general-dropdown-system
  const dropdown = document.querySelector(`#vis-general-dropdown-${setting}`);
  return dropdown ? dropdown.value : null;
}

function showHideUsOnlySections(show = true) {
  const sections = document.getElementsByClassName("us-only-section");
  for (let i = 0; i < sections.length; i++) {
    sections[i].style.display = show ? "block" : "none";
  }
}
