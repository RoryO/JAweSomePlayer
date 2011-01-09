/*global jsPlayer: true */

if (!jsPlayer) {
  jsPlayer = {};
}

jsPlayer.eventBroker = {
  flashEvents: {}
};

jsPlayer.eventBroker.listenFor = function (eventName, element, fun) {
  if (typeof (fun) !== "function") {
    jsPlayer.exception("TypeError", "Must pass a function to bind");
  }
  if (element.nodeType.toLowerCase() === "object") {
    if (!element.id || element.id === "") {
      jsPlayer.exception("TypeError", "Flash element to attach events must have an ID");
    }
    jsPlayer.eventBroker.flashEvents[element.id] = jsPlayer.eventBroker.flashEvents[element.id] || {};
    jsPlayer.eventBroker.flashEvents[element.id][eventName] = fun;
    element.addEventListener(eventName,
      "jsPlayer.eventBroker.flashEvents." + element.id + "." + eventName);
  } else {
    if (element.addEventListener) {
      element.addEventListener(eventName, fun, false);
    } else {
      //Hi IE
      element.attachEvent(eventName, fun);
    }
  }
};
