var jsPlayer = jsPlayer || {};

jsPlayer.engine = function (engineElement, elementType, argp) {
  "use strict";
  var outObject = {},
      params = argp || {},
      outer = this,
      fireCallbacksFor,
      engineReady,
      timeChanged,
      events = {},
      getProperty, setProperty;

  if (!engineElement) {
    jsPlayer.exception("ArgumentError", "Engine element not provided");
  }

  if (!elementType) {
    jsPlayer.exception("ArgumentError", "Element type not provided");
  }


  //privacy, yo


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

  events.callbacks = {};
  //more dumb shit.  flash doesn't have an external addEventListener, the best 
  //we can hope for is a a custom event handler class interal in flash.  problem is, 
  //flash can't find external functions by reference, only by string name
  events.register = function (eventName, callbackName) {
    if (elementType === 'flash') {
      engineElement.addEventListener(eventName, callbackName);
    } else {
      jsPlayer.domExt.bindEvent(engineElement, eventName, events[callbackName]);
    }
  };

  events.fireCallbacksFor = function (name, data) {
    if (events.callbacks[name]) {
      (function (context) {
        for (var i = 0; i < callbacks[name].length; i += 1) {
          callbacks[name][i].call(context, data);
        }
      }(this));
    }
  };

  //internal callbacks
  events.timeChanged = function () {
    events.fireCallbacksFor('timeChange', engineElement.currentTime);
  };

  events.engineReady = function () {
    events.fireCallbacksFor('engineReady');
  };

  //binding events from playback element to engine methods
  events.register('timeupdate', "timeChanged");
  events.register('loadeddata', "engineReady");

  return {
    engineElement: engineElement,

    bind: function (name, fun) {
      if (typeof(fun) !== 'function') {
        jsPlayer.exception("TypeError", "Must provide a function as a callback");
      }
      callbacks[name] = callbacks[name] || [];
      callbacks[name].push(fun);
      return this;
    },

    play: function () {
      engineElement.play();
      fireCallbacksFor('onPlay');
      return this;
    },

    pause: function () {
      engineElement.pause();
      fireCallbacksFor('onPause');
      return this;
    },

    isPlaying: function () {
      return !engineElement.paused;
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
      fireCallbacksFor('volumeChange', getProperty('volume'));
      return this;
    },

    seekTo: function (n) {
      setProperty('currentPosition', n);
    },

    length: function () {
      return engineElement.duration;
    }
  };
};
