var AddOmmmm =
{

  local_storage_key: "addommmm_enabled",

 /**
  * is AddOmmmmm enabled?
  */
  enabled: true,

 /**
  * Window we created that shows the lasagna
  */
  created_window: null,

  /**
   * Port we need for communication with the content script
   */
  port: null,

  /**
   * Horse whinny sound
   */
  horse_sound: null,

 /**
  * Location of lasagna
  */
  lasagna_location: browser.runtime.getURL("data/Lasagnes.jpg"),

  /**
   * Initialization function
   */
  init: function()
  {
    let self = this;
    /**
     * Audio element we use to play the
     * Tibetan chants in the background
     */
    let audio = document.createElement("audio");

    /**
     * Location of the song we are using for the Tibetan chants
     */
    let audio_location = "http://www.orangefreesounds.com/wp-content/uploads/2015/07/Tibetan-song-om-mani-padme-hum.mp3";

    /**
     * Location of horse whinny sound
     */
    let horse_location = browser.runtime.getURL("data/79084__axiyee__redbarn-horse-whinny.ogg");

    // Set audio settings and append audio to file.
    audio.setAttribute("autoplay", "true");
    audio.setAttribute("loop", "true");
    audio.setAttribute("src", audio_location);
    document.body.appendChild(audio);

    self.horse_sound = document.createElement("audio");
    self.horse_sound.setAttribute("src", horse_location);
    document.body.appendChild(self.horse_sound);

    this.addAlarms();

    // Rotate pages
    this.port.postMessage({reason: "state_change", enabled: true});
  },

  deinit: function()
  {
    // Remove sounds
    while(document.body.firstChild)
    {
      document.body.removeChild(document.body.firstChild);
    }

    // Cancel alarms
    browser.alarms.clear("horse-whinny");
    browser.alarms.clear("close-window");

    // Remove listener
    browser.alarms.onAlarm.removeListener(AddOmmmm.onAlarmListener);

    // Reset page rotation
    this.port.postMessage({reason: "state_change", enabled: false});
  },

  addAlarms: function()
  {
    /**
     * Create alarm for horse whinny sound
     */
    browser.alarms.create("horse-whinny", {
      delayInMinutes: 0.25,
      periodInMinutes: 0.25
    });

    /**
    * Create alarm that closes the window
    * after a few seconds.
    */
    browser.alarms.create("close-window", {
      delayInMinutes: 0.30,
      periodInMinutes: 0.25
    });

    /**
     * Add an onAlarm listener that gets called when an alarm
     * fired successfully. 
     */
    browser.alarms.onAlarm.addListener(AddOmmmm.onAlarmListener);
  },

  /**
   * This listener is executed when an alarm goes off
   */
  onAlarmListener: function(alarm)
  {
    var self = AddOmmmm;
    /**
     * onError routine that gets called during an error and logs
     * it in the console.
     * @param {*} error Error object that contains more details 
     */
    function onError(error) {
      console.error(`Error: ${error}`);
    }

    /**
     * Routine that gets called after the lasagna 
     * window has been created successfully.
     * @param {*} windowInfo The window we created 
     */
    function onCreated(windowInfo) {
      self.created_window = windowInfo;
    }

    if(alarm.name === "horse-whinny")
    {
      self.horse_sound.play();
      browser.windows.create({
        url: self.lasagna_location,
        type: "panel",
        height: 590,
        width: 750
      }).then(onCreated, onError);
    }

    if(alarm.name === "close-window" && self.created_window !== null)
    {
      browser.windows.remove(self.created_window.id);
    }
  },

  notifyTabs: function() {
    browser.tabs.query().then(function(tabs) {
      for(tab in tabs)
      {
        browser.tabs.connect(
          tab.id,
          {name: "tabs-connect-example"}
        ).postMessage({reason: "state_change", enabled: AddOmmmm.enabled});
      }
    });
  }

};


function onStorageGot(setting)
{
  if(setting.addommmm_enabled === undefined)
  {
    browser.storage.local.set({addommmm_enabled: true});
    AddOmmmm.enabled = true;
    AddOmmmm.init();
    return;
  }
  /**
   * Set property in AddOmmmm object
   */
  AddOmmmm.enabled = setting.addommmm_enabled;

  if(AddOmmmm.enabled)
  {
    AddOmmmm.init();
  }
  else
  {
    AddOmmmm.deinit();
  }
}

function onStorageError()
{
  console.log("AddOmmmm: Couldn't find local storage with key \"addommmm_enabled\"");
}

function onInit()
{
  browser.runtime.onConnect.addListener(function(p) {
    AddOmmmm.port = p;
  });
  browser.runtime.onMessage.addListener(function(m) {
    if(m.reason == "request_state")
    {
      
    }
  });
  browser.storage.local.get(AddOmmmm.local_storage_key).then(onStorageGot, onStorageError);
}

browser.browserAction.onClicked.addListener((tab) => {
  let localStorage = browser.storage.local;
  localStorage.get(AddOmmmm.local_storage_key).then(function(setting) {

    var prefValue = setting.addommmm_enabled;

    AddOmmmm.enabled = !prefValue;
    
    // Notify tabs:
    AddOmmmm.port.postMessage({reason: "state_change", enabled: AddOmmmm.enabled});

    if(!prefValue)
    {
      // AddOmmmm was previously disabled, enable it:
      AddOmmmm.init();
    }
    else
    {
      AddOmmmm.deinit();
    }
    localStorage.set({addommmm_enabled : !prefValue});
  }, onStorageError);
});

onInit();