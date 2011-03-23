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
  jsPlayer.eventBroker.flashReadyIds[elementId.split("_")[0]] = true;
  //tell Flash to start loading data
  console.log("telling Flash to start loading");
  document.getElementById(elementId).__beginLoading();
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
    throw new Error("Must pass a function to bind");
  }

  if(!onElement) {
    throw new Error("Element to bind to not provided");
  }

  if (onElement.tagName.toLowerCase() === "object") {
    if (!onElement.id || onElement.id === "") {
      throw new Error("Flash element must have an ID ");
    }
    jsPlayer.eventBroker.addFlashEvent(eventName, fun, onElement.id);
  } else {
    if (onElement.addEventListener) {
      onElement.addEventListener(eventName, fun, false);
    } else {
      //Hi IE
      onElement.attachEvent(eventName, fun);
    }
  }
};

jsPlayer.eventBroker.addFlashEvent = function (eventName, fun, elementId) {
  if (!jsPlayer.eventBroker.flashReadyIds[elementId.split("_")[0]]) {
    console.log("flash isn't ready to accept an event!");
    window.setTimeout(function () {
      jsPlayer.eventBroker.addFlashEvent(eventName, fun, elementId)
    }, 100);
  } else {
    console.log("flash is ready to accept " + eventName);
    if (!jsPlayer.eventBroker.flashEvents[elementId]) {
      jsPlayer.eventBroker.flashEvents[elementId] = {};
    }
    console.log("adding to flash element RIGHT NOW: " + elementId);
    document.getElementById(elementId)._addEventListener(eventName, 
                  jsPlayer.eventBroker.flashEvents[elementId][eventName = fun]); 
  }
};
