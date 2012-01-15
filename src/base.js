/*global fdSlider: false, swfobject: false */
var jsPlayer = jsPlayer || {};
/**
 * @module JAwesomePlayer
 * @class detection
 */

jsPlayer.detection = {};
/**
 * Guesses if the browser can play the file based upon mime type
 * It is a guess because the browser itself is guessing as defined by W3C
 * Also returns false if the browser doesn't even support the audio tag
 * @method audio
 * @param {String} mimeType
 * @return {Boolean}
 */

jsPlayer.detection.audio = function (mimeType) {
  "use strict";
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

/**
 * @class constructors
 */
jsPlayer.constructors = {

  /**
  * 
  * @method startStop
  * @param {String} rootElementId
  * @param {jsPlayer.engine} engine
  */

  startStop: function (rootElementId, engine) {
    "use strict";
    var startStopElement = document.createElement("div");

    jsPlayer.domExt.addClass(startStopElement, "startStop");
    jsPlayer.domExt.addClass(startStopElement, "startStopLoading");
    document.getElementById(rootElementId).appendChild(startStopElement);
    engine.bind('loadeddata', function () {
      jsPlayer.domExt.removeClass(startStopElement, "startStopLoading");
      jsPlayer.domExt.addClass(startStopElement, "playerStopped");
    });
    engine.bind('play', function () {
      jsPlayer.domExt.removeClass(startStopElement, "playerStopped");
      jsPlayer.domExt.addClass(startStopElement, "playerStarted");
    });
    engine.bind('pause', function () {
      jsPlayer.domExt.removeClass(startStopElement, "playerStarted");
      jsPlayer.domExt.addClass(startStopElement, "playerStopped");
    });
    jsPlayer.domExt.bindEvent(startStopElement, 'click', function () {
      if (engine.isPlaying()) {
        engine.pause();
      } else {
        engine.play();
      }
    });
    return startStopElement;
  }
};
/** The create function is the core function of JAwesomePlayer.
 * Here we take the source URL and a params object to automatically detect and construct
 * the appropriate HTML element, playback engine and optional HTML controls.
 * @method create
 * @param {String} sourceURL
 * @param {Object} params
 */
jsPlayer.create = function (sourceURL, params) {
  "use strict";
  var controls = {},
    playbackReady,
    mimeType,
    engine,
    elementId,
    buildHTMLAudio,
    buildFlash,
    outObject = {},
    defaultParams = { elementId: "jsPlayer",
                      autostart: false,
                      flashLocation: "jsplayer.swf",
                      preload: 'auto',
                      controls: { startStop: jsPlayer.constructors.startStop }
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
  /**
 * @method buildHTMLAudio
 * @return {HTMLElement}
 * @private
 */
  buildHTMLAudio = function (preloadstatus) {
    var p,
      node = document.getElementById(elementId),
      el = document.createElement("audio"),
      defaults = {preload: 'auto'};
    el.setAttribute("src", sourceURL);
    el.setAttribute('preload', preloadstatus);
    node.appendChild(el);
    return el;
  };

  /**
 * @method buildFlash
 * @return {HTMLElement}
 * @private
 */

  buildFlash = function (preloadstatus) {
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
      flashParams,
      flashElement,
      flashTargetDiv,
      flashElementId;

    if (swfobject.hasFlashPlayerVersion("9.0.0")) {
      flashTargetDiv = document.createElement('div');
      flashElementId = elementId + "_" + new Date().getTime();
      attrs.id = flashElementId;
      attrs.name = flashElementId;
      flashTargetDiv.setAttribute('id', flashElementId);
      document.getElementById(elementId).appendChild(flashTargetDiv);
      flashParams = { flashvars: Object.toQueryString(flashVarsObject) };
      flashElement = swfobject.createSWF(attrs, flashParams, flashElementId);
      flashElement.setAttribute('preload', preloadstatus);
      return flashElement;
    } else {
      elementId.innerHTML("<p>Flash player required</p>");
      throw new Error("Flash player >9 not detected");
    }
  };

  // detect audio engine
  if (params.useNative) {
    engine = jsPlayer.createEngine(buildHTMLAudio(params.preload), "Native");
  } else if (params.useFlash) {
    engine = jsPlayer.createEngine(buildFlash(params.preload), "Flash");
  } else {
    if (jsPlayer.detection.audio(mimeType)) {
      engine = jsPlayer.createEngine(buildHTMLAudio(params.preload), "Native");
    } else {
      engine = jsPlayer.createEngine(buildFlash(params.preload), "Flash");
    }
  }

  // construct player controls
  if (params.controls.startStop && typeof (params.controls.startStop) === "function") {
    params.controls.startStop.apply(this, [elementId, engine]);
  }

  if (params.autostart) {
    engine.play();
  }

  outObject.engine = engine;
  return outObject;
};
