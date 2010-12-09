if (!Array.prototype.last) {
  Array.prototype.last = function () { 
    return this[this.length - 1]; 
  };
}

var jsPlayerUtils = {
  exception: function (type, m) {
    var ex = new Error();
    ex.name = type;
    //for Firefox
    ex.value = type;
    ex.message = m;
    throw (ex);
  }
};

var jsPlayerEngine = function (engineElement, params) {

  var outObject = {};
  params = params || {};

  if (!engineElement) {
    jsPlayerUtils.exception("ArgumentError", "Engine element not provided");
  } else {
    outObject.engineElement = engineElement;
  }

  outObject.status = function () {
    return outObject.engineElement.paused;
  };

  outObject.play = function () {
    outObject.engineElement.play();
  };

  outObject.pause = function () {
    outObject.engineElement.pause();
  };

  outObject.isPlaying = function () {
    return outObject.engineElement.paused;
  };

  return outObject;
};

var jsPlayer = function (sourceURL, params) {
  var outObject = {},
      helpers = {};

  if (!sourceURL) {
    jsPlayerUtils.exception("ArgumentError", "URL of audio not provided");
  }

  params = params || {};
  outObject.source = sourceURL;
  outObject.elementID = params.elementID || "jsPlayer";
  outObject.controls = {};
  outObject.mimeType = (function () {
    var audioTypes = { mp3: "audio/mpeg", mpeg: "audio/mpeg", mpeg3: "audio/mpeg",
                         ogg: "audio/ogg" },
        retval, match;
    console.log(outObject.source.split(".").last());
    match = outObject.source.split(".").last();
    if (match && audioTypes[match]) {
      retval = audioTypes[match];
    } else if (params.format && audioTypes[params.format]) {
      retval = audioTypes[params.format];
    } else {
      jsPlayerUtils.exception("ArgumentError",
        "Can not find audio type.  Provide a format member in the parameters object");
    }
    return retval;
  }());

  // detect audio engine
  (function () {
    var node = document.getElementById(outObject.elementID),
        el = document.createElement("audio");
    if (!node) {
      jsPlayerUtils.exception("RuntimeError", 
        "Unable to find player element " + outObject.elementID);
    }
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
  }());

  // construct player controls
  (function () {
    var node = document.getElementById(outObject.elementID),
        e = document.createElement("div");
    e.setAttribute("class", "startStop");
    node.appendChild(e);
    console.log("adding controls");
    outObject.controls.startStop = e;
  }());

  helpers.playPause = function () {
    console.log(outObject.engine.isPlaying());
    if (outObject.engine.isPlaying()) {
      outObject.engine.play();
      outObject.controls.startStop.className = outObject.controls.startStop.className.replace(/\splayerStopped\s/, '');
      outObject.controls.startStop.className = outObject.controls.startStop.className + " playerStarted ";
    } else {
      outObject.engine.pause();
      outObject.controls.startStop.className = outObject.controls.startStop.className.replace(/\splayerStarted\s/, '');
      outObject.controls.startStop.className = outObject.controls.startStop.className  + " playerStopped ";
    }
  };

  //event binding should be absolute last thing
  outObject.controls.startStop.addEventListener("click", 
    function () { 
      helpers.playPause(); 
    },
    false);
  //Hello IE.  We meet again.
  return outObject;
};
