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

  var outObject = {},
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
    return !outObject.engineElement.paused;
  };

  return outObject;
};

var jsPlayer = function (sourceURL, params) {
  var outObject = {},
      helpers = {},
      defaultParams = {
        elementId: "jsPlayer",
        autostart: false,
        controls: {startStop: true, scrubber: true, volume: true}
      };

  if (!sourceURL) {
    jsPlayerUtils.exception("ArgumentError", "URL of audio not provided");
  }

  params = Object.merge(params, defaultParams);
  outObject.source = sourceURL;
  outObject.elementId = params.elementId;

  outObject.controls = {
    toggleStartClass: function() {
      if (!params.controls && params.controls.startStop) {
        return;
      }
    }
  };

  outObject.mimeType = (function () {
    var audioTypes = { mp3: "audio/mpeg", mpeg: "audio/mpeg", mpeg3: "audio/mpeg",
                         ogg: "audio/ogg" },
        retval, match;
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
    var node = document.getElementById(outObject.elementId),
        el = document.createElement("audio");
    if (!node) {
      jsPlayerUtils.exception("RuntimeError", 
        "Unable to find player element " + outObject.elementId);
    }
    if (!el.canPlayType || !el.canPlayType(outObject.mimeType)) {
      // build flash elements
      outObject.engineType = "Flash";
    } else {
      el.setAttribute("src", outObject.source);
      node.appendChild(el);
      outObject.engineType =  "Native";
      outObject.engine = jsPlayerEngine(el);
    }
  }());

  // construct player controls
  (function () {
    var node = document.getElementById(outObject.elementId),
        startStopElement,
        volumeElement, 
        scrubElement;
    if (outObject.engineType === "Native" && params.useNativeControls){
      outObject.engine.engineElement.setAttribute("controls", "controls");
    } else {
      if (params.controls && params.controls.startStop) {
        startStopElement = document.createElement("div");
        startStopElement.setAttribute("class", "startStop");
        node.appendChild(startStopElement);
        outObject.controls.startStop = startStopElement;
      }
      if (params.controls && params.controls.volume) {
        volumeElement = document.createElement("div");
        volumeElement.setAttribute("class", "volumeSlider");
        node.appendChild(volumeElement);
        outObject.controls.volume = volumeElement;
      }
      if (params.controls && params.controls.scrubber) {
        scrubElement = document.createElement("div");
        scrubElement.setAttribute("class", "scrubber");
        node.appendChild(scrubElement);
        outObject.controls.scrubber = scrubElement;
      }
    }
  }());

  helpers.playPause = function () {
    if (outObject.engine.isPlaying()) {
      outObject.engine.pause();
      domExt.addClass(outObject.controls.startStop, "playerStopped");
      domExt.removeClass(outObject.controls.startStop, "playerStarted");
    } else {
      outObject.engine.play();
      domExt.addClass(outObject.controls.startStop, "playerStarted");
      domExt.removeClass(outObject.controls.startStop, "playerStopped");
    }
  };

  if(params.autostart) {
    helpers.playPause();
  } else {
   domExt.addClass(outObject.controls.startStop, "playerStopped");
  }

  //event binding should be absolute last thing
  if (document.getElementsByTagName("body")[0].addEventListener) {
    outObject.controls.startStop.addEventListener("click",
      function () {
        helpers.playPause();
      }, false);
  } else {
    //Hello IE.  We meet again.
  }
  return outObject;
};
