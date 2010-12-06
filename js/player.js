var jsPlayerEngine = function(engineElement, params) {
  if(!engineElement) {
    var e = new Error();
    e.name = "ArgumentError";
    e.message = "Root player element not provided";
  }

  var outObject = {};
  params = params || {};
  outObject.engineElement = engineElement;

  outObject.status = function() {
    if (outObject.engineElement.paused) { return "paused"; }
    else { return "playing"; }
  }

  outObject.play = function() {
    outObject.engineElement.play();
  }

  outObject.pause = function () {
    outObject.engineElement.pause();
  }

  outObject.paused = function () {
    return outObject.engineElement.paused;
  }

  return outObject;
}

var jsPlayer = function(sourceURL, params) {
  if(!sourceURL) {
    var e = new Error();
    e.name = "ArgumentError";
    e.message = "URL of audio not provided";
    throw(e);
  }

  var outObject = {};
  params = params || {};
  outObject.source = sourceURL;
  outObject.elementID = params.elementID || "jsPlayer";
  outObject.mimeType = function() {
    var audioTypes = { mp3: "audio/mpeg", mpeg: "audio/mpeg", mpeg3: "audio/mpeg",
                         ogg: "audio/ogg" };
    var regex = /\.(.+)$/;
    var match = regex.exec(outObject.source);
    var retval;
    if (match && audioTypes[match[1]]) {
      retval = audioTypes[match[1]];
    } else if (params.format && audioTypes[params.format]) {
      retval = audioTypes[params.format];
    } else {
      var e = new Error();
      e.name = "ArgumentError";
      e.message = "Can not find audio type.  Provide a format member in the parameters object";
      throw(e);
    }
    return retval;
  }();

  // detect audio engine
  (function() {
    var node = document.getElementById(outObject.elementID);
    if (!node) {
      var ex = new Error();
      ex.name = "RuntimeError";
      ex.message = "Unable to find player element " + outObject.elementID;
      throw(ex);
    }
    var el = document.createElement("audio");
    if (!el.canPlayType || !el.canPlayType(outObject.mimeType)) {
      // build flash elements
      outObject.engineType = "Flash";
    } else {
      el.setAttribute("src", outObject.source);
      el.setAttribute("controls", "controls");
      node.appendChild(el);
      outObject.engineType =  "Native";
      outObject.engine = jsPlayerEngine(el);
    }
  })();

  // construct player controls
  (function() {
    var node = document.getElementById(outObject.elementID);
    var e = document.createElement("div");
    e.setAttribute("class", "startStop");
    // hello IE old friend
    if (e.addEventListener) {
      e.addEventListener("click", function() {
        if (outObject.engine.paused) {
          outObject.engine.play();
          e.className = e.className.replace(/\splayerStopped\s/, '');
          e.className = e.className + " playerStarted"
        } else {
          outObject.engine.pause();
          e.className = e.className.replace(/\splayerStarted\s/, '');
          e.className = e.className + " playerStopped";
        }
      }, false);
    } else {

    }
    node.appendChild(e);
  })();

  return outObject;
};
