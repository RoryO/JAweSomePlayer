/*global fdSlider: false, swfObject: false */
var jsPlayer = jsPlayer || {};

jsPlayer.detection = {};

jsPlayer.detection.audio = function(mimeType) {
  var el = document.createElement("audio");
  if (!el.canPlayType) {
    return false;
  }
  if (el.canPlayType(mimeType) === "maybe" || el.canPlayType(mimeType) === "probably") {
    return true;
  } else {
    return false;
  }
};

//jsPlayer.buildHTMLAudio = function(rootElement, url, mimeType) {
  //var el = document.createElement("audio");
  //el.setAttribute("src", url);
  //rootElement.appendChild(el);
  //return el;
//};

jsPlayer.create = function (sourceURL, params) {
  "use strict";
  var controls = {},
      playbackReady,
      mimeType,
      engine,
      elementId,
      outObject = {},
      buildHTMLAudio,
      buildFlash,
      defaultParams = { elementId: "jsPlayer",
                        autostart: false,
                        flashLocation: "jsplayer.swf",
                        controls: { startStop: true, 
                                    scrubber: true, 
                                    volume: true }
      };

  if (!sourceURL) {
    throw new Error("URL of media not provided");
  }

  params = Object.merge(params, defaultParams);
  elementId = params.elementId;

  if (params.mimeType) {
    mimeType = params.mimeType;
  } else {
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
      throw new Error("Can not find media type.  Provide a format member in the parameters object");
    }
      return retval;
    }());
  }

  buildHTMLAudio = function () {
    var node = document.getElementById(elementId),
        el = document.createElement("audio");
    el.setAttribute("src", sourceURL);
    node.appendChild(el);
    return el;
  };

  buildFlash = function () {
    var attrs = {
          width: 1,
          height: 1,
          data: params.flashLocation
        },
        flashVarsObject = {
          checkready: 'jsPlayer.eventBroker.tellFlashTrue',
          onready: 'jsPlayer.eventBroker.flashIsReportingReady',
          allowscriptaccess: 'always',
          url: sourceURL
        },
        flashParams, flashElement, flashTargetDiv, flashElementId;

    if (swfobject.hasFlashPlayerVersion("9.0.0")) {
      flashTargetDiv = document.createElement('div');
      flashElementId = elementId + "_" + new Date().getTime();
      attrs.id = flashElementId;
      attrs.name = flashElementId;
      flashTargetDiv.setAttribute('id', flashElementId);
      document.getElementById(elementId).appendChild(flashTargetDiv);
      flashParams = { flashvars: Object.toQueryString(flashVarsObject) };
      flashElement = swfobject.createSWF(attrs, flashParams, flashElementId);
      return flashElement;
    } else {
      elementId.innerHTML("<p>Flash player required</p>");
      throw new Error("Flash player >9 no detected");
      return;
    }
  };

  // detect audio engine
  if(params.useNative) {
    engine = jsPlayer.createEngine(buildHTMLAudio(), "Native");
  } else if (params.useFlash) {
    engine = jsPlayer.createEngine(buildFlash(), "Flash");
  } else {
    if (jsPlayer.detection.audio(mimeType)) {
      engine = jsPlayer.createEngine(buildHTMLAudio(), "Native");
    } else {
      engine = jsPlayer.createEngine(buildFlash(), "Flash");
    }
  }

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
    }
  }());

  playbackReady = function () {
    if (controls.startStop) {
      jsPlayer.domExt.removeClass(controls.startStop, "startStopLoading");
      jsPlayer.domExt.addClass(controls.startStop, "playerStopped");
      engine.bind('play', function () {
        jsPlayer.domExt.removeClass(controls.startStop, "playerStopped");
        jsPlayer.domExt.addClass(controls.startStop, "playerStarted");
      });
      engine.bind('pause', function () {
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

    if (params.autostart) {
      engine.play();
    }
  };

  //event bindings
  engine.bind('loadeddata', playbackReady);

  outObject.engine = engine;
  if (controls) {
    outObject.controls = controls;
  }
  return outObject;
};

