/*global jsPlayer: true */

if (!jsPlayer) {
  jsPlayer = {};
}

jsPlayer.eventBroker = {
  flashEvents: {},
  flashReadyIds: {},
  flashEventQueue: {},

  tellFlashTrue: function () {
    return true;
  },

  flashIsReady: function(elementId) {
    if (!jsPlayer.eventBroker.flashReadyIds[elementId]) {
      setTimeout(jsPlayer.eventBroker.flashIsReady(elementId), 200);
    } else {
      return true;
    }
  }
};

jsPlayer.eventBroker.flashIsReportingReady = function(elementId) {
  var rootId, n;
  "use strict";
  if(!elementId) {
    throw new Error("No element ID in flashIsReportingReady");
  }
  rootId = elementId.split("_")[0];

  jsPlayer.eventBroker.flashReadyIds[rootId] = true;
  //move all events in the queue in place before loading (to catch onload events etc)
  if (jsPlayer.eventBroker.flashEventQueue[elementId]){
    for(n in jsPlayer.eventBroker.flashEventQueue[elementId]) {
      if (jsPlayer.eventBroker.flashEventQueue[elementId].hasOwnProperty(n)) {
        jsPlayer.eventBroker.addFlashEvent(n, 
          jsPlayer.eventBroker.flashEventQueue[elementId][n], elementId);
      }
    }
  }
  //tell Flash to start loading data
  if (document.getElementById(elementId).getAttribute('preload') === 'auto') {
    document.getElementById(elementId)._load();
  }
};

jsPlayer.eventBroker.listenFor = function (eventName, fun, onElement) {
  "use strict";
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
  "use strict";
  var timestamp, eventPathName;

  if (!jsPlayer.eventBroker.flashReadyIds[elementId.split("_")[0]]) {
    if (!jsPlayer.eventBroker.flashEventQueue[elementId]) {
      jsPlayer.eventBroker.flashEventQueue[elementId] = {};
    }
    jsPlayer.eventBroker.flashEventQueue[elementId][eventName] = fun;
  } else {
    if (!jsPlayer.eventBroker.flashEvents[elementId]) {
      jsPlayer.eventBroker.flashEvents[elementId] = {};
    }
    if (!jsPlayer.eventBroker.flashEvents[elementId][eventName]) {
      jsPlayer.eventBroker.flashEvents[elementId][eventName] = {};
    }
    timestamp = new Date().getTime();
    eventPathName = 'jsPlayer.eventBroker.flashEvents["' + elementId + '"]' +
                    '["' + eventName + '"]' +
                    '["' + timestamp + '"]';
    jsPlayer.eventBroker.flashEvents[elementId][eventName][timestamp] = fun;
    document.getElementById(elementId)._addEventListener(eventName, eventPathName);
  }
};
