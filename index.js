var hiddenFrames = require("sdk/frame/hidden-frame");
var self = require("sdk/self");
var data = self.data;
var prefs = require("sdk/simple-prefs").prefs;
let hiddenFrame, hiddenContentWindow;
let isEnabled = true;
(function () {
  let _hiddenFrameOnReady = function() {
    let window = this.element.contentWindow;
    window.location = self.data.url("http://www.orangefreesounds.com/wp-content/uploads/2015/07/Tibetan-song-om-mani-padme-hum.mp3");
  };
  let _hiddenFrame = hiddenFrames.HiddenFrame({ onReady: _hiddenFrameOnReady });
  hiddenFrame = hiddenFrames.add(_hiddenFrame);
})();

var pageMod = require("sdk/page-mod");
var timers = require("sdk/timers");
var tabs = require("sdk/tabs");

let pagemod;
(function setPageMod() {
    pagemod = pageMod.PageMod({
      include: "*",
      contentStyleFile: data.url("styles.css"),
    });
})();

var tabs = require('sdk/tabs');
var { attach, detach } = require('sdk/content/mod');
var { Style } = require('sdk/stylesheet/style');
var style = Style({
  uri: data.url("styles.css")
});

for (let tab of tabs)
  attach(style, tab);

var panel = require("sdk/panel").Panel({
  width: 750,
  height: 563,
  contentURL: data.url("Lasagnes.html")
});

function panelShowAndPlay() {
    if(!prefs.showLasagna)
        return;
    panel.show();
    panel.port.emit("show");
}

let interval;
(function setPlayInterval() {
    interval = timers.setInterval(panelShowAndPlay, 15000);
})();

var buttons = require("sdk/ui/button/action");
var button = buttons.ActionButton({
  id: "addommmm-toggle",
  label: "Toggle AddOmmmm",
  icon: {
    "16": data.url("icon.png"),
    "32": data.url("icon.png"),
    "64": data.url("icon.png")
  },
  onClick: function() {
    isEnabled = !isEnabled;
    if(isEnabled) {
        hiddenFrames.add(hiddenFrame);
        interval = timers.setInterval(panelShowAndPlay, 15000);
        pagemod = pageMod.PageMod({
            include: "*",
            contentStyleFile: data.url("styles.css"),
        });
        for (let tab of tabs)
          attach(style, tab);
    }
    else {
        hiddenFrames.remove(hiddenFrame);
        timers.clearInterval(interval);
        pagemod.destroy();
        for (let tab of tabs)
          detach(style, tab);
    };
  }
});

if (self.loadReason == "install") {
  tbb.moveTo({
    toolbarID: "nav-bar",
    forceMove: true
  });
}
