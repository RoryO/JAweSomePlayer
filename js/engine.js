var jsPlayer = jsPlayer || {};

jsPlayer.createEngine = function (engineElement, elementType, argp) {
  "use strict";

  var outObject = {},
      params = argp || {},
      outer = this,
      getProperty, setProperty,
      isFlashElement;

  if (!engineElement) {
    throw new Error("Engine element not provided");
  }

  if (!elementType) {
    throw new Error("Element type not provided");
  } else {
    if (elementType.toLowerCase() === "flash") {
      isFlashElement = true
    }
  }

  //the reason for this nonsense is because flash ExternalInterface does not
  //allow for exposing properties, only functions.  what a fucking mess.
  getProperty = function (p) {
    if (isFlashElement) {
      return engineElement[p]();
    } else {
      return engineElement[p];
    }
  };

  setProperty = function (p, n) {
    if (isFlashElement) {
      engineElement[p](n);
    } else {
      engineElement[p] = n;
    }
  };

  return {
    engineElement: engineElement,

    bind: function (name, fun) {
      jsPlayer.eventBroker.listenFor(name, fun, engineElement);
    },

    play: function () {
      //Thanks a bunch IE!
      if(isFlashElement) {
        engineElement._play();
      } else {
        engineElement.play();
      }
    },

    pause: function () {
      engineElement.pause();
    },

    isPlaying: function () {
      return !getProperty('paused');
    },

    volume: function (n) {
      n = Number(n);
      if (isNaN(n)) {
        return getProperty('volume');
      } else {
        if (n < 0 || n > 1) {
          throw new Error("Volume input must be between 0 and 1.0");
        }
        setProperty('volume', n);
        return this;
      }
    },

    seekTo: function (n) {
      setProperty('currentPosition', n);
    },

    length: function () {
      return getProperty('duration');
    }
  };
};
