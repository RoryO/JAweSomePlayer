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
jsPlayer.eventBroker.flashEventQueue = {};

jsPlayer.eventBroker.flashIsReportingReady = function(elementId) {
  var rootId;
  console.log("flash is reporting ready " + elementId);
  if(!elementId) {
    throw new Error("No element ID in flashIsReportingReady");
  }
  rootId = elementId.split("_")[0];

  //move all events in the queue in place before loading (to catch onload events etc)
  if (jsPlayer.eventBroker.flashEventQueue[elementId]){
    console.log('flash ready, moving events from queue');
    for(var n in jsPlayer.eventBroker.flashEventQueue[elementId]) {
      if (jsPlayer.eventBroker.flashEventQueue[elementId].hasOwnProperty(n)) {
        jsPlayer.eventBroker.addFlashEvent(n, 
          jsPlayer.eventBroker.flashEventQueue[elementId][n], elementId);
      }
    }
  }
  jsPlayer.eventBroker.flashReadyIds[rootId] = true;
  //tell Flash to start loading data
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
  var timestamp, eventPathName;

  if (!jsPlayer.eventBroker.flashReadyIds[elementId.split("_")[0]]) {
    console.log("flash isn't ready to accept an event!  adding to queue");
    if (!jsPlayer.eventBroker.flashEventQueue[elementId]) {
      jsPlayer.eventBroker.flashEventQueue[elementId] = {}
    }
    jsPlayer.eventBroker.flashEventQueue[elementId][eventName] = fun;
  } else {
    console.log("flash is ready to accept " + eventName);
    if (!jsPlayer.eventBroker.flashEvents[elementId]) {
      jsPlayer.eventBroker.flashEvents[elementId] = {};
    }
    if (!jsPlayer.eventBroker.flashEvents[elementId][eventName]) {
      jsPlayer.eventBroker.flashEvents[elementId][eventName] = {}
    }
    timestamp = new Date().getTime();
    eventPathName = 'jsPlayer.eventBroker.flashEvents[' + elementId + ']' +
                    '[' + eventName + ']' +
                    '[' + timestamp + ']';
    jsPlayer.eventBroker.flashEvents[elementId][eventName][timestamp] = fun;
    document.getElementById(elementId)._addEventListener(eventName, eventPathName);
  }
};
