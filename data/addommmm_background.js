var AddOmmmm =
{
  /**
   * Key for localstorage "enabled" property
   */
  enabled_property_key: "addommmm_enabled",

  /**
   * Key for localstorage "show lasagna" property
   */
  show_lasagna_property_key: "addommmm_lasagna",

 /**
  * is AddOmmmmm enabled?
  */
  enabled: true,

  /**
   * Should we show the lasagna
   */
  show_lasagna: true,

 /**
  * Window we created that shows the lasagna
  */
  created_window: null,

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

    // Add alarms
    this.addAlarms();

    // Rotate pages
    browser.tabs.query({}).then(tabs =>
    {
      for(var i = 0; i < tabs.length; i++)
      {
        browser.tabs.sendMessage(tabs[i].id, {reason: "state_change", enabled: true});
      }
    });
  
    // Set enabled icon
    browser.browserAction.setIcon({path: "data/icon16.png"});
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
    browser.tabs.query({}).then(tabs =>
      {
        for(var i = 0; i < tabs.length; i++)
        {
          browser.tabs.sendMessage(tabs[i].id, {reason: "state_change", enabled: false});
        }
    });

    // Remove lasagna window if existing
    if(this.created_window != null)
    {
      browser.windows.remove(this.created_window.id);
    }

    // Set disabled icon
    browser.browserAction.setIcon({path: "data/icon_disabled.png"});
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

      if(self.show_lasagna)
      {
        browser.windows.create({
          url: self.lasagna_location,
          type: "panel",
          height: 590,
          width: 750
        }).then(onCreated, onError);
      }
    }

    if(alarm.name === "close-window" && self.created_window !== null)
    {
      browser.windows.remove(self.created_window.id);
    }
  },

  onEnabledChanged: function(isEnabled)
  {
    if(AddOmmmm.enabled === isEnabled)
    {
      return;
    }

    // Set enabled property here
    AddOmmmm.enabled = isEnabled;
    
    if(isEnabled)
    {
      AddOmmmm.init();
    }
    else
    {
      AddOmmmm.deinit();
    }
  }
};

function onEnabledPropGot(setting)
{
  if(setting.addommmm_enabled === undefined)
  {
    browser.storage.local.set({addommmm_enabled: true});
    AddOmmmm.init();
    return;
  }
  AddOmmmm.onEnabledChanged(setting.addommmm_enabled);
}

function onShowLasagnaGot(setting)
{
  if(setting.addommmm_lasagna === undefined)
  {
    browser.storage.local.set({addommmm_lasagna: true});
    return;
  }
  AddOmmmm.show_lasagna = setting.addommmm_lasagna;
}

function onStorageError()
{
  console.log("AddOmmmm: Couldn't find local storage with key \"addommmm_enabled\"");
}

function onInit()
{
  browser.runtime.onMessage.addListener(function(m, s) {
    if(m.reason == "request_state")
    {
      browser.tabs.sendMessage(s.tab.id, {reason: "state_change", enabled: AddOmmmm.enabled});
    }
  });
  browser.storage.local.get(AddOmmmm.enabled_property_key).then(onEnabledPropGot, onStorageError);
  browser.storage.local.get(AddOmmmm.show_lasagna_property_key).then(onShowLasagnaGot, onStorageError);
}

browser.browserAction.onClicked.addListener((tab) => {
  let localStorage = browser.storage.local;
  localStorage.get(AddOmmmm.enabled_property_key).then(function(setting) {    
    localStorage.set({addommmm_enabled : !setting.addommmm_enabled});
  }, onStorageError);
});

browser.storage.onChanged.addListener(function(changes) {
  var enabledProp = changes[AddOmmmm.enabled_property_key];
  if(enabledProp !== undefined)
  {
    AddOmmmm.onEnabledChanged(enabledProp.newValue);
  }

  var showLasagnaProp = changes[AddOmmmm.show_lasagna_property_key];
  if(showLasagnaProp !== undefined)
  {
    AddOmmmm.show_lasagna = showLasagnaProp.newValue;
  }
});

onInit();