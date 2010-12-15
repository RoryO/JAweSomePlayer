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
/*global window: false */

if (!Array.prototype.last) {
  Array.prototype.last = function () { 
    return this[this.length - 1]; 
  };
}

if (!Array.prototype.cycle) {
  Array.prototype.cycle = function () {
    var retval;
    retval = this.shift();
    this.push(retval);
    return retval;
  };
}

if(!domExt) {
  var domExt = {};
}

if (!domExt.classArray) {
  domExt.classArray = function (el) {
    return el.className.split(" ");
  };
}

if (!domExt.hasClass) {
  domExt.hasClass = function (el, klass) {
    if (el.classArray().indexOf(klass) === -1) {
      return false;
    } else {
      return true;
    }
  };
}

if (!domExt.addClass) {
  domExt.addClass = function (el, klass) {
    if (el.hasClass(klass)) {
      return;
    }
    el.className = el.className + " " + klass;
  };
}

if (!domExt.removeClass) {
  domExt.removeClass = function (el, klass) {
    if (!domExt.hasClass(el, klass)) {
      return;
    }
    var classList;
    classList = domExt.classArray(el).filter(function (member, i, a) {
      if (member !== klass) {
        return member;
      }
    });
    el.className = classList.join(" ");
  };
}

if (!Object.merge) {
  Object.merge = function () {
    "use strict";
    console.log("in merge");
    var retval = arguments[0];
    for (var i = 1; i <= arguments.length; i++) {
      if (arguments[i] !== undefined) {
        for(var ele in arguments[i]) {
          if(!retval[ele]) {
            retval[ele] = arguments[i][ele];
          }
        }
      }
    }
    console.log("returning from merge " + retval);
    return retval;
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

  params = params || { controls: {startStop: true, scrubber: true, volume: true}};
  outObject.source = sourceURL;
  outObject.elementID = params.elementID || "jsPlayer";

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
        startStopElement,
        volumeElement, 
        scrubElement;
    if (outObject.engineType === "Native" && params.useNativeControls){
      outObject.engine.engineElement.setAttribute("controls", "controls");
    } else {
      if (params.controls && params.controls.startStop) {
        startStopElement = document.createElement("div");
        startStopElement.setAttribute("class", "startStop");
        node.appendChild(e);
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
        outObject.controls.scrubber = seekElement;
      }
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
   // outObject.controls.startStop.addClass("playerStopped");
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
