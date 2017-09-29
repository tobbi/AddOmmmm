var myPort = browser.runtime.connect({name:"port-from-cs"});
var last_transform = document.body.style.transform;
var last_transform_origin = document.body.style.transformOrigin;

browser.runtime.sendMessage({reason: "request_state"});

myPort.onMessage.addListener(function(m) {
  if(m.reason == "state_change")
  {
    if(m.enabled)
    {
        // Rotate every page
        document.body.style.transform = "rotate(180deg)";
        document.body.style.transformOrigin = "center";
    }
    else
    {
        // Reset rotation
        document.body.style.transform = last_transform;
        document.body.style.transformOrigin = last_transform_origin;
    }
  }
});