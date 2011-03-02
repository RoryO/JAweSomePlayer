/*global jsPlayer: true */

if (!jsPlayer) {
  jsPlayer = {};
}

jsPlayer.eventBroker = {
  flashEvents: {}
};

jsPlayer.eventBroker.tellFlashTrue = function () {
  return true;
};

jsPlayer.eventBroker.flashReadyIds = {};

jsPlayer.eventBroker.flashIsReportingReady = function(elementId) {
  if(!elementId) {
    throw new Error("No element ID in flashIsReportingReady");
  } 
  jsPlayer.eventBroker.flashReadyIds[elementId] = true;
};

jsPlayer.eventBroker.flashIsReady = function(elementId) {
  if (!jsPlayer.eventBroker.flashReadyIds[elementId]) {
    setTimeout(jsPlayer.eventBroker.flashIsReady(elementId), 200);
  } else {
    return true;
  }
};

jsPlayer.eventBroker.listenFor = function (eventName, fun, onElement) {
  if (typeof (fun) !== "function") {
    console.log(typeof(fun));
    throw new Error("Must pass a function to bind");
  }
  if(!onElement) {
    throw new Error("Element to bind to not provided");
  }
  if (onElement.tagName.toLowerCase() === "object") {
    if (!onElement.id || onElement.id === "") {
      throw new Error("Flash onElement to attach events must have an ID");
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
