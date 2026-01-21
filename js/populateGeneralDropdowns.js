import {
  html,
  renderComponent,
  useState,
  useEffect,
} from "./utils/preact-htm.js";
import { ASSETS_URL } from "./helpers.js";

function showHideUsOnlySections(show = true) {
  const sections = document.getElementsByClassName("us-only-section");
  for (let i = 0; i < sections.length; i++) {
    sections[i].style.display = show ? "block" : "none";
  }
}

const containerId = "vis-general-filters";
export function renderGeneralFilter() {
  let containerElement = document.querySelector(`#${containerId}`);

  if (containerElement) {
    renderComponent(html`<${GeneralFilter} />`, containerElement);
  } else {
    console.error(
      `Could not find container element for general filter with id ${containerId}`,
    );
  }
}

export function prepPageForFilterAndAdvertiserTableChange() {
  // hide old filter element
  const oldFilterElement = document.querySelector(
    ".rmg-insider_filters--grid.centred-filter",
  );
  if (oldFilterElement) {
    oldFilterElement.style.display = "none";
  }

  // create new div for new filters and put directly after old filter element
  const newFilterContainer = document.createElement("div");
  newFilterContainer.id = "vis-general-filters";
  if (oldFilterElement) {
    oldFilterElement.parentNode.insertBefore(
      newFilterContainer,
      oldFilterElement.nextSibling,
    );
  }

  const advertiserElement = document.querySelector("#vis-advertiser-trends");
  if (advertiserElement) {
    // create new div after element
    const newTableContainer = document.createElement("div");
    newTableContainer.id = "vis-advertiser-table";
    newTableContainer.className = "rmg-viz";
    advertiserElement.parentNode.insertBefore(
      newTableContainer,
      advertiserElement.nextSibling,
    );
  }

  const filterSection = document.querySelector(".rmg-insider_filters");
  if (filterSection) {
    // get sibling of filter section and add id to it
    const filterSibling = filterSection.nextElementSibling;
    if (filterSibling) {
      filterSibling.id = "vis-floating-filter-start";
    }
  }
}

function GeneralFilter() {
  const [country, setCountry] = useState("USA");
  const [system, setSystem] = useState("IOS");
  const [field, setField] = useState("Sportsbetting");
  const [isFieldDisabled, setIsFieldDisabled] = useState(false);
  const [isSystemDisabled, setIsSystemDisabled] = useState(false);
  const [fixedMenuOpen, setFixedMenuOpen] = useState(true);

  const [pageOverlayOpen, setPageOverlayOpen] = useState(false);
  const [onCorrectPagePart, setOnCorrectPagePart] = useState(true);

  const [svgCache, setSvgCache] = useState({});

  // Fetch and cache SVG content
  const fetchSvgContent = async (iconPath) => {
    if (svgCache[iconPath]) {
      return svgCache[iconPath];
    }
    try {
      const response = await fetch(ASSETS_URL + iconPath);
      const svgText = await response.text();
      setSvgCache((prev) => ({ ...prev, [iconPath]: svgText }));
      return svgText;
    } catch (error) {
      console.error("Error fetching SVG:", error);
      return null;
    }
  };

  // get icons on mount
  useEffect(async () => {
    // Pre-fetch category SVG icons first
    const iconPathsCategories = icons.map((d) => d.icon);
    for (const iconPath of iconPathsCategories) {
      await fetchSvgContent(iconPath);
    }
  }, []);

  // listen to scroll of page
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const container = document.querySelector("#vis-floating-filter-start");
      if (container) {
        if (scrollY >= window.scrollY + container.getBoundingClientRect().top) {
          setOnCorrectPagePart(true);
        } else {
          setOnCorrectPagePart(false);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const getFilterItems = (position) => {
    // get URL query parameters to determine if new countries should be shown
    const urlParams = new URLSearchParams(window.location.search);
    const showNewCountries = urlParams.get("showNewCountries") === "true";

    const countryFilterExisting = {
      filterLabel: "Select country",
      value: "country",
      options: [
        { label: "U.S.", value: "USA" },
        { label: "U.K.", value: "GBR" },
      ],
    };
    const countryFilterNew = {
      filterLabel: "Select country",
      value: "country",
      options: [
        { label: "U.S.", value: "USA" },
        { label: "U.K.", value: "GBR" },
        { label: "Canada", value: "CAN" },
        { label: "Europe", value: "Europe" },
      ],
    };

    let countryFilter;
    if (showNewCountries) {
      countryFilter = countryFilterNew;
    } else {
      countryFilter = countryFilterExisting;
    }

    const filterSet = [
      countryFilter,
      {
        filterLabel: "Select vertical",
        value: "field",
        options: [
          {
            label: "Sportsbetting",
            value: "Sportsbetting",
          },
          {
            label: "Gambling & Casino",
            value: "RMG",
          },
        ],
      },
      {
        filterLabel: "Select OS",
        value: "system",
        options: [
          { label: "iOS", value: "IOS" },
          { label: "Android", value: "ANDROID" },
        ],
      },
    ];
    function getStateItem(input) {
      if (input === "country") {
        return [country, setCountry];
      } else if (input === "field") {
        return [field, setField];
      } else if (input === "system") {
        return [system, setSystem];
      }
    }
    return filterSet.map((item) => {
      // console.log("Rendering filter item:", item);
      return html`<div
        class="filter-item-container ${(item.value === "field" &&
          isFieldDisabled) ||
        (item.value === "system" && isSystemDisabled)
          ? "disabled"
          : ""}"
      >
        <p>${item.filterLabel}</p>
        ${item.options && item.options.length > 0
          ? html`<ul>
              ${item.options.map(
                (option) =>
                  html`<li
                    class="filter-item ${getStateItem(item.value)[0] ===
                    option.value
                      ? "active"
                      : "inactive"}"
                    onClick="${() => {
                      getStateItem(item.value)[1](option.value);

                      // add small delay to allow user to see selection before menu closes
                      setTimeout(() => {
                        if (position === "fixed") {
                          setFixedMenuOpen(false);
                          setPageOverlayOpen(false);
                        }
                      }, 500);

                      // Dispatch custom event to notify other components
                      const customEventName = `${containerId}-${item.value}-changed`;
                      document.dispatchEvent(
                        new CustomEvent(customEventName, {
                          detail: { selected: option.value },
                        }),
                      );

                      /**
                       * Allow the following filter combinations
                       * USA - Sportsbetting - IOS
                       * USA - Sportsbetting - Android
                       * USA - RMG - IOS
                       * USA - RMG - Android
                       * UK - RMG - IOS
                       * new: UK - Sportsbetting - IOS
                       * new: CAN - Sportsbetting - IOS
                       * new: CAN - RMG - IOS
                       * new: Europe - Sportsbetting - IOS
                       * new: Europe - Sportsbetting - Android
                       * new: Europe - RMG - IOS
                       */
                      // COUNTRY CHANGE LOGIC
                      if (
                        customEventName === `${containerId}-country-changed`
                      ) {
                        if (option.value === "USA") {
                          showHideUsOnlySections(true);
                          setIsFieldDisabled(false);
                          setIsSystemDisabled(false);
                          document.dispatchEvent(
                            new CustomEvent(`${containerId}-field-changed`, {
                              detail: { selected: "Sportsbetting" },
                            }),
                          );
                          setField("Sportsbetting");
                        } else if (option.value === "GBR") {
                          // Country is GBR, setting system to IOS and default field to Sportsbetting but do allow change
                          showHideUsOnlySections(false);

                          document.dispatchEvent(
                            new CustomEvent(`${containerId}-system-changed`, {
                              detail: { selected: "IOS" },
                            }),
                          );
                          setSystem("IOS");
                          setIsSystemDisabled(true);

                          document.dispatchEvent(
                            new CustomEvent(`${containerId}-field-changed`, {
                              detail: { selected: "Sportsbetting" },
                            }),
                          );
                          setField("Sportsbetting");
                          setIsFieldDisabled(false);
                        } else if (option.value === "CAN") {
                          // Country is CAN, setting system to IOS and default field to Sportsbetting but do allow change (same as UK)
                          showHideUsOnlySections(false);

                          document.dispatchEvent(
                            new CustomEvent(`${containerId}-system-changed`, {
                              detail: { selected: "IOS" },
                            }),
                          );
                          setSystem("IOS");
                          setIsSystemDisabled(true);

                          document.dispatchEvent(
                            new CustomEvent(`${containerId}-field-changed`, {
                              detail: { selected: "Sportsbetting" },
                            }),
                          );
                          setField("Sportsbetting");
                          setIsFieldDisabled(false);
                        } else if (option.value === "Europe") {
                          // Country is Europe, setting system to IOS and default field to Sportsbetting but do allow change both
                          showHideUsOnlySections(false);
                          document.dispatchEvent(
                            new CustomEvent(`${containerId}-system-changed`, {
                              detail: { selected: "IOS" },
                            }),
                          );
                          setSystem("IOS");
                          setIsSystemDisabled(false);

                          document.dispatchEvent(
                            new CustomEvent(`${containerId}-field-changed`, {
                              detail: { selected: "Sportsbetting" },
                            }),
                          );
                          setField("Sportsbetting");
                          setIsFieldDisabled(false);
                        }
                      }

                      // FIELD CHANGE LOGIC
                      if (customEventName === `${containerId}-field-changed`) {
                        // allow Europe Sportsbetting and RMG with IOS only
                        if (country === "Europe" && option.value === "RMG") {
                          document.dispatchEvent(
                            new CustomEvent(`${containerId}-system-changed`, {
                              detail: { selected: "IOS" },
                            }),
                          );
                          setSystem("IOS");
                          setIsSystemDisabled(true);
                        } else if (
                          country === "Europe" &&
                          option.value === "Sportsbetting"
                        ) {
                          document.dispatchEvent(
                            new CustomEvent(`${containerId}-system-changed`, {
                              detail: { selected: "IOS" },
                            }),
                          );
                          setSystem("IOS");
                          setIsSystemDisabled(false);
                        }
                      }
                    }}"
                  >
                    <div
                      class="filter-icon"
                      dangerouslySetInnerHTML=${{
                        __html:
                          // TODO: remove CAN and Europe mapping to GBR svg when those svgs are added
                          svgCache[
                            option.value.toLowerCase() === "can" ||
                            option.value.toLowerCase() === "europe"
                              ? "gbr.svg"
                              : option.value.toLowerCase() + ".svg"
                          ] || "",
                      }}
                    ></div>
                    <span>${option.label}</span>
                  </li>`,
              )}
            </ul>`
          : ""}
      </div>`;
    });
  };

  console.log(
    "Rendering general filters with country:",
    country,
    "and field:",
    field,
    "and system:",
    system,
  );

  function getFilterSet(position) {
    const isMenuOpen = position === "inline" ? true : fixedMenuOpen;

    return html`<div class="vis-filter-category-container ${position}">
      ${isMenuOpen &&
      html`<div class="vis-filter-menu-container ${position}">
        <ul class="filter-list">
          ${getFilterItems(position)}
        </ul>
      </div>`}
    </div> `;
  }

  return html`<div class="vis-filter-container">
    ${getFilterSet("inline")}
    ${onCorrectPagePart &&
    html` <div class="vis-filter-floating-container">
      <div
        class="vis-filter-floating-trigger"
        onclick=${() => {
          setPageOverlayOpen(!pageOverlayOpen);
          setFixedMenuOpen(true);
        }}
      >
        <span>Select parameters</span
        ><img
          src="${ASSETS_URL}/double_arrow.svg"
          alt="double arrow icon"
          style="transform: rotate(${pageOverlayOpen ? 180 : 0}deg)"
        />
      </div>

      <div
        class="vis-filter-floating-content ${pageOverlayOpen
          ? "open"
          : "closed"}"
      >
        <div class="vis-filter-floating-content-inner">
          ${getFilterSet("fixed")}
        </div>
      </div>
    </div>`}
  </div>`;
}

const icons = [
  {
    icon: "usa.svg",
  },
  {
    icon: "gbr.svg",
  },
  {
    icon: "can.svg",
  },
  {
    icon: "sportsbetting.svg",
  },
  {
    icon: "rmg.svg",
  },
  {
    icon: "ios.svg",
  },
  {
    icon: "android.svg",
  },
  {
    icon: "double_arrow.svg",
  },
];
