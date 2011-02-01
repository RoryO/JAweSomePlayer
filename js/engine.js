var jsPlayer = jsPlayer || {};

jsPlayer.createEngine = function (engineElement, elementType, argp) {
  "use strict";
  var outObject = {},
      params = argp || {},
      outer = this,
      getProperty, setProperty;

  if (!engineElement) {
    jsPlayer.exception("ArgumentError", "Engine element not provided");
  }

  if (!elementType) {
    jsPlayer.exception("ArgumentError", "Element type not provided");
  }

  //the reason for this nonsense is because flash ExternalInterface does not
  //allow for exposing properties, only functions.  what a fucking mess.
  getProperty = function (p) {
    if (elementType === 'flash') {
      return engineElement[p]();
    } else {
      return engineElement[p];
    }
  };

  setProperty = function (p, n) {
    if (elementType === 'flash') {
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
      engineElement.play();
      return this;
    },

    pause: function () {
      engineElement.pause();
      return this;
    },

    isPlaying: function () {
      return !getProperty('paused');
    },

    volume: function (n) {
      n = Number(n);
      if (isNaN(n)) {
        return engineElement.volume;
      }
      if (n < 0 || n > 1) {
        jsPlayer.exception("ArgumentError", "Volume input must be between 0 and 1.0");
      }
      setProperty('volume', n);
      return this;
    },

    seekTo: function (n) {
      setProperty('currentPosition', n);
    },

    length: function () {
      return getProperty('duration');
    }
  };
};
