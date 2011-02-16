/*global window: false */

if (!Array.prototype.last) {
  Array.prototype.last = function () { 
    return this[this.length - 1]; 
  };
}

if (!Array.prototype.cycle) {
  Array.prototype.cycle = function () {
    var retval;
    retval = this.shift();
    this.push(retval);
    return retval;
  };
}

var jsPlayer = jsPlayer || {};

if (!jsPlayer.domExt) {
  jsPlayer.domExt = {};
}

if (!jsPlayer.domExt.classArray) {
  jsPlayer.domExt.classArray = function (el) {
    return el.className.split(" ");
  };
}

if (!jsPlayer.domExt.hasClass) {
  jsPlayer.domExt.hasClass = function (el, klass) {
    if (jsPlayer.domExt.classArray(el).indexOf(klass) === -1) {
      return false;
    } else {
      return true;
    }
  };
}

if (!jsPlayer.domExt.addClass) {
  jsPlayer.domExt.addClass = function (el, klass) {
    if (jsPlayer.domExt.hasClass(el, klass)) {
      return;
    }
    el.className = el.className + " " + klass;
  };
}

if (!jsPlayer.domExt.removeClass) {
  jsPlayer.domExt.removeClass = function (el, klass) {
    var classList;
    if (!jsPlayer.domExt.hasClass(el, klass)) {
      return;
    }
    classList = jsPlayer.domExt.classArray(el).filter(function (member, i, a) {
      if (member !== klass) {
        return member;
      }
    });
    el.className = classList.join(" ");
  };
}

if (!jsPlayer.domExt.bindEvent) {
  jsPlayer.domExt.bindEvent = function (el, eventName, fun) {
    if (typeof(fun) !== 'function') {
      throw new TypeError("Must pass in a function to be bound");
    }
    if (document.addEventListener) {
      el.addEventListener(eventName, fun, false);
    } else {
      //hi IE
      el.attachEvent(eventName, fun);
    }
  }
}
if (!Object.merge) {
  Object.merge = function () {
    "use strict";
    var retval = arguments[0];
    for (var i = 1; i <= arguments.length; i++) {
      if (arguments[i] !== undefined) {
        for(var ele in arguments[i]) {
          if(!retval[ele]) {
            retval[ele] = arguments[i][ele];
          }
        }
      }
    }
    return retval;
  }
}
