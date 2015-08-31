var hiddenFrames = require("hidden-frame");
var self = require("self");
var prefs = require("simple-prefs").prefs;
let hiddenFrame, hiddenContentWindow;
let isEnabled = true;
(function () {
  let _hiddenFrameOnReady = function() {
    let window = this.element.contentWindow;
    window.location = self.data.url("playmusic.html");
  };
  let _hiddenFrame = hiddenFrames.HiddenFrame({ onReady: _hiddenFrameOnReady });
  hiddenFrame = hiddenFrames.add(_hiddenFrame);
})();

var pageMod = require("page-mod");
var data = require("self").data;
var timers = require("timers");

let pagemod;
(function setPageMod() {
    pagemod = pageMod.PageMod({
      include: "*",
      contentStyleFile: data.url("styles.css"),
    });
})();

var panel = require("panel").Panel({
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

var tbb = require("./toolbarbutton").ToolbarButton({
  id: "addommmm-toggle",
  image: data.url("icon.png"),
  tooltiptext: "Toggle AddOmmm",
  label: "AddOmmmm",
  onCommand: function () {
    isEnabled = !isEnabled;
    if(isEnabled) {
        hiddenFrames.add(hiddenFrame);
        interval = timers.setInterval(panelShowAndPlay, 15000);
        pagemod = pageMod.PageMod({
            include: "*",
            contentStyleFile: data.url("styles.css"),
        });
    }
    else {
        hiddenFrames.remove(hiddenFrame);
        timers.clearInterval(interval);
        pagemod.destroy();
    };
  }
});

if (self.loadReason == "install") {
  tbb.moveTo({
    toolbarID: "nav-bar",
    forceMove: true
  });
}