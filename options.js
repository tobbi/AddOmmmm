function saveOptions(e) {
    e.preventDefault();
    browser.storage.local.set({
      addommmm_enabled: document.querySelector("#enabled").checked,
      addommmm_lasagna: document.querySelector("#show_lasagna").checked
    });
  }

  function restoreOptions() {

    function setCurrentChoice(result) {
      document.querySelector("#enabled").checked = result.addommmm_enabled || false;
    }

    function setLasagnaOption(result) {
      document.querySelector("#show_lasagna").checked = result.addommmm_lasagna || false;
    }

    function onError(error) {
      console.log(`Error: ${error}`);
    }

    var getting = browser.storage.local.get("addommmm_enabled");
    getting.then(setCurrentChoice, onError);

    browser.storage.local.get("addommmm_lasagna").then(setLasagnaOption, onError);
  }
  document.addEventListener("DOMContentLoaded", restoreOptions);
  document.querySelector("form").addEventListener("submit", saveOptions);