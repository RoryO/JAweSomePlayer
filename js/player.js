if (!Array.prototype.last) {
  Array.prototype.last = function () { 
    return this[this.length - 1]; 
  };
}

//mozilla's fallback
if (!Array.prototype.filter) {
  Array.prototype.filter = function (fun) {
    "use strict";

    if (this === void 0 || this === null) {
      throw new TypeError();
    }

    var t = Object(this), 
        len = t.length >>> 0,
        res = [],
        thisp = arguments[1];

    if (typeof fun !== "function") {
      throw new TypeError();
    }

    for (var i = 0; i < len; i++) {
      if (i in t) {
        var val = t[i];         
        if (fun.call(thisp, val, i, t)) {
          res.push(val);
        }
      }
    }
    return res;
  };
}

if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (obj, fromIndex) {
    if (fromIndex === null) {
      fromIndex = 0;
    } else if (fromIndex < 0) {
      fromIndex = Math.max(0, this.length + fromIndex);
    }
    for (var i = fromIndex, j = this.length; i < j; i++) {
      if (this[i] === obj) {
        return i;
      }
    }
    return -1;
  };
}

if (!window.Element.prototype.classArray){
  window.Element.prototype.classArray = function () {
    return this.className.split(" ");
  }
}

if (!window.Element.prototype.hasClass) {
  window.Element.prototype.hasClass = function (klass) {
    if (this.classArray().indexOf(klass) === -1) {
      return false;
    } else {
      return true;
    }
  }
}

if (!window.Element.prototype.addClass) {
  window.Element.prototype.addClass = function (klass) {
    if (this.hasClass(klass)) {
      return;
    }

    this.className = this.className + " " + klass;
  }
}

if (!window.Element.prototype.removeClass) {
  window.Element.prototype.removeClass = function (klass) {
    if (!this.hasClass(klass)) {
      return;
    }
    var classList;
    classList = this.classArray().filter(function (member, i, a) {
      if (!(member === klass)) {
        return member;
      }
    });
    this.className = classList.join(" ");
  }
}

var jsPlayerUtils = {
  exception: function (type, m) {
    var ex = new Error();
    ex.name = type;
    //for Firefox
    ex.value = type;
    ex.message = m;
    throw (ex);
  },
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
      node.appendChild(el);
      outObject.engineType =  "Native";
      outObject.engine = jsPlayerEngine(el);
    }
  }());

  // construct player controls
  (function () {
    var node = document.getElementById(outObject.elementID),
        e;
    if (outObject.engineType === "Native" && params.useNativeControls){
      outObject.engine.engineElement.setAttribute("controls", "controls");
    } else {
      e= document.createElement("div");
      e.setAttribute("class", "startStop");
      node.appendChild(e);
      outObject.controls.startStop = e;
    }
  }());

  helpers.playPause = function () {
    if (outObject.engine.isPlaying()) {
      outObject.engine.play();
      outObject.controls.startStop.removeClass("playerStopped");
      outObject.controls.startStop.addClass("playerStarted");
    } else {
      outObject.engine.pause();
      outObject.controls.startStop.removeClass("playerStarted");
      outObject.controls.startStop.addClass("playerStopped");
    }
  };

  if(params.autoStart) {
    helpers.playPause();
  } else {
    outObject.controls.startStop.addClass("playerStopped");
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
