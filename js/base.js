/*global fdSlider: false, swfObject: false */
var jsPlayer = jsPlayer || {};

jsPlayer.create = function (sourceURL, params) {
  "use strict";
  var controls = {},
      playbackReady,
      mimeType,
      engine,
      elementId,
      outObject = {},
      defaultParams = { elementId: "jsPlayer",
                        autostart: false,
                        controls: { startStop: true, 
                                    scrubber: true, 
                                    volume: true }
      };

  if (!sourceURL) {
    jsPlayer.exception("ArgumentError", "URL of audio not provided");
  }

  params = Object.merge(params, defaultParams);
  elementId = params.elementId;

  mimeType = (function () {
    var audioTypes, retval, match;
    audioTypes = { mp3: "audio/mpeg", mpeg: "audio/mpeg", mpeg3: "audio/mpeg",
                   ogg: "audio/ogg" };

    match = sourceURL.split(".").last();
    if (match && audioTypes[match]) {
      retval = audioTypes[match];
    } else if (params.format && audioTypes[params.format]) {
      retval = audioTypes[params.format];
    } else {
      jsPlayer.exception("ArgumentError",
        "Can not find media type.  Provide a format member in the parameters object");
    }
    return retval;
  }());

  // detect audio engine
  (function () {
    var node = document.getElementById(elementId),
        el = document.createElement("audio");
    if (!node) {
      jsPlayer.exception("RuntimeError", 
        "Unable to find player element " + elementId);
    }
    if (!el.canPlayType || !el.canPlayType(mimeType)) {
      swfObject.create();
      // build flash elements
    } else {
      el.setAttribute("src", sourceURL);
      node.appendChild(el);
      engine = jsPlayer.engine(el, "Native");
    }
  }());

  // construct player controls
  (function () {
    var node = document.getElementById(elementId),
        startStopElement, 
        volumeElement, 
        scrubElement;

    if (outObject.engineType === "Native" && params.useNativeControls) {
      engine.engineElement.setAttribute("controls", "controls");
    } else {
      if (params.controls.startStop) {
        startStopElement = document.createElement("div");
        jsPlayer.domExt.addClass(startStopElement, "startStop");
        jsPlayer.domExt.addClass(startStopElement, "startStopLoading");
        node.appendChild(startStopElement);
        controls.startStop = startStopElement;
      }
      if (params.controls.volume) {
        volumeElement = document.createElement("input");
        volumeElement.setAttribute("type", "text");
        volumeElement.style.display = "none";
        volumeElement.setAttribute("value", 1);
        volumeElement.setAttribute("class", "volumeSlider");
        node.appendChild(volumeElement);
        controls.volume = volumeElement;
        fdSlider.createSlider({
          inp: volumeElement,
          step: 0.01,
          maxStep: 0.1,
          min: 0,
          max: 1,
          vertical: true,
          callbacks: {change: [
            function (e) {
              outObject.engine.volume(e.value);
            }
          ]}
        });
      }
      if (params.controls.scrubber) {
        scrubElement = document.createElement("input");
        scrubElement.setAttribute("type", "text");
        scrubElement.style.display = "none";
        scrubElement.setAttribute("value", 0);
        scrubElement.setAttribute("class", "scrubber");
        node.appendChild(scrubElement);
        controls.scrubber = scrubElement;
      }
    }
  }());

  playbackReady = function () {
    if (controls.startStop) {
      jsPlayer.domExt.removeClass(controls.startStop, "startStopLoading");
      jsPlayer.domExt.addClass(controls.startStop, "playerStopped");
      engine.bind('onPlay', function () {
        jsPlayer.domExt.removeClass(controls.startStop, "playerStopped");
        jsPlayer.domExt.addClass(controls.startStop, "playerStarted");
      });
      engine.bind('onPause', function () {
        jsPlayer.domExt.removeClass(controls.startStop, "playerStarted");
        jsPlayer.domExt.addClass(controls.startStop, "playerStopped");
      });
      jsPlayer.domExt.bindEvent(controls.startStop, 'click', function () {
        if (engine.isPlaying()) {
          engine.pause();
        } else {
          engine.play();
        }
      });
    }

    if (controls.scrubber) {
      fdSlider.destroySlider(controls.scrubber);
      fdSlider.createSlider({
        inp: controls.scrubber,
        step: 1,
        maxStep: 1,
        min: 0,
        max: engine.length()
      });
    }

    if (params.autostart) {
      engine.play();
    }
  };

  //event bindings
  engine.bind('engineReady', playbackReady);

  outObject.engine = engine;
  if (controls) {
    outObject.controls = controls;
  }
  return outObject;
};
