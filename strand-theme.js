// CareerFit strand colour theme. Load this file in the <head> of EVERY page so the saved colour
// is applied before the page paints (no flash of the default purple).
(function () {
  var KEY = "careerfit_strand_color";
  // main = --strand-color, on = text/icon colour that stays readable on top of it
  var THEMES = {
    default:          { main: "#b7a7e8", on: "#2a1f4d" }, // Light Purple (homepage / no strand yet)
    STEM:             { main: "#2f9e5f", on: "#ffffff" }, // Green
    ABM:              { main: "#d64545", on: "#ffffff" }, // Red
    HUMSS:            { main: "#7e57c2", on: "#ffffff" }, // Violet
    "Home Economics": { main: "#f2c230", on: "#3a2e00" }, // Yellow (HE)
    ICT:              { main: "#2f7fd0", on: "#ffffff" }  // Blue
  };
  var ALIASES = { HE: "Home Economics" };

  function normalize(strand) {
    strand = ALIASES[strand] || strand;
    return THEMES[strand] ? strand : "default";
  }

  // Sets --strand-color on <html> right away and remembers it for every other page.
  window.applyStrandColor = function (strand) {
    var key = normalize(strand);
    var t = THEMES[key];
    var root = document.documentElement;
    root.style.setProperty("--strand-color", t.main);
    root.style.setProperty("--on-strand", t.on);
    root.setAttribute("data-strand", key);
    try {
      if (key === "default") localStorage.removeItem(KEY); else localStorage.setItem(KEY, key);
    } catch (e) {}
  };

  // Re-apply whatever was saved (runs immediately, and again after the DOM is ready).
  window.loadStrandColor = function () {
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    window.applyStrandColor(saved);
  };
  window.loadStrandColor();

  // Keep other open tabs/pages in sync.
  window.addEventListener("storage", function (e) { if (e.key === KEY) window.loadStrandColor(); });
})();
