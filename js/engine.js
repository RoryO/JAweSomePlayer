/*global exception: false */
var jsPlayerEngine = function (engineElement, params) {

  var outObject = {},
      params = params || {},
      callbacks = {},
      fireCallbacksFor,
      engineReady,
      timeChanged;

  if (!engineElement) {
    exception("ArgumentError", "Engine element not provided");
  } else {
    outObject.engineElement = engineElement;
  }

  outObject.bind = function (name, fun) {
    if (typeof(fun) !== 'function') {
      exception("TypeError", "Must provide a function as a callback");
    }
    callbacks[name] = callbacks[name] || [];
    callbacks[name].push(fun);
    return this;
  };

  outObject.play = function () {
    outObject.engineElement.play();
    fireCallbacksFor('onPlay');
    return this;
  };

  outObject.pause = function () {
    outObject.engineElement.pause();
    fireCallbacksFor('onPause');
    return this;
  };

  outObject.isPlaying = function () {
    return !outObject.engineElement.paused;
  };

  outObject.volume = function (n) {
    n = Number(n);
    if (isNaN(n)) {
      return outObject.engineElement.volume;
    }
    if (n < 0 || n > 1) {
      exception("ArgumentError", "Volume input must be between 0 and 1.0");
    }
    outObject.engineElement.volume = n;
    fireCallbacksFor('volumeChange', outObject.engineElement.volume);
    return this;
  };

  outObject.seekTo = function (n) {
    outObject.engineElement.currentPosition = n;
  };

  //privacy, yo
  fireCallbacksFor = function (name, data) {
    if (callbacks[name]) {
      (function (context) {
        for (var i = 0; i < callbacks[name].length; i += 1) {
          callbacks[name][i].call(context, data);
        }
      }(this));
    }
  };

  timeChanged = function () {
    fireCallbacksFor('timeChange', outObject.engineElement.currentTime);
  };

  engineReady = function () {
    fireCallbacksFor('engineReady');
  };

  //binding events from playback element to engine methods
  outObject.engineElement.addEventListener('timeupdate', timeChanged, false);
  outObject.engineElement.addEventListener('loadeddata', engineReady, false);
  return outObject;
};
