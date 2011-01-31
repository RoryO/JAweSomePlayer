/*global jsPlayer: true */

if (!jsPlayer) {
  jsPlayer = {};
}

jsPlayer.eventBroker = {
  flashEvents: {}
};

jsPlayer.eventBroker.listenFor = function (eventName, fun, onElement) {
  if (typeof (fun) !== "function") {
    console.log(typeof(fun));
    jsPlayer.exception("TypeError", "Must pass a function to bind");
  }
  if(!onElement) {
    jsPlayer.exception("ArgumentError", "Element to bind to not provided");
  }
  if (onElement.tagName.toLowerCase() === "object") {
    if (!onElement.id || onElement.id === "") {
      jsPlayer.exception("TypeError", "Flash onElement to attach events must have an ID");
    }
    jsPlayer.eventBroker.flashEvents[onElement.id] = jsPlayer.eventBroker.flashEvents[onElement.id] || {};
    jsPlayer.eventBroker.flashEvents[onElement.id][eventName] = fun;
    onElement.addEventListener(eventName,
      "jsPlayer.eventBroker.flashEvents." + onElement.id + "." + eventName);
  } else {
    if (onElement.addEventListener) {
      onElement.addEventListener(eventName, fun, false);
    } else {
      //Hi IE
      onElement.attachEvent(eventName, fun);
    }
  }
};
