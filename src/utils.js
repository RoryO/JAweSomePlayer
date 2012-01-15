/*global window: false */

if (!Array.prototype.last) {
  Array.prototype.last = function () {
    "use strict";
    return this[this.length - 1];
  };
}

if (!Array.prototype.cycle) {
  Array.prototype.cycle = function () {
    "use strict";
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
    "use strict";
    return el.className.split(" ");
  };
}

if (!jsPlayer.domExt.hasClass) {
  jsPlayer.domExt.hasClass = function (el, klass) {
    "use strict";
    if (jsPlayer.domExt.classArray(el).indexOf(klass) === -1) {
      return false;
    } else {
      return true;
    }
  };
}

if (!jsPlayer.domExt.addClass) {
  jsPlayer.domExt.addClass = function (el, klass) {
    "use strict";
    if (jsPlayer.domExt.hasClass(el, klass)) {
      return;
    }
    el.className = el.className + " " + klass;
  };
}

if (!jsPlayer.domExt.removeClass) {
  jsPlayer.domExt.removeClass = function (el, klass) {
    "use strict";
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
    "use strict";
    if (typeof (fun) !== 'function') {
      throw new TypeError("Must pass in a function to be bound");
    }
    if (document.addEventListener) {
      el.addEventListener(eventName, fun, false);
    } else {
      //hi IE
      el.attachEvent(eventName, fun);
    }
  };
}
if (!Object.merge) {
  Object.merge = function (obj) {
    "use strict";
    var retval = obj,
      ele,
      i;
    for (i = 1; i <= arguments.length; i++) {
      if (arguments[i] !== undefined) {
        for (ele in arguments[i]) {
          if (arguments[i].hasOwnProperty(ele)) {
            if (!retval[ele]) {
              retval[ele] = arguments[i][ele];
            }
          }
        }
      }
    }
    return retval;
  };
}

if (!Object.toQueryString) {
  Object.toQueryString = function (o) {
    "use strict";
    var retval = "",
      name;
    for (name in o) {
      if (o.hasOwnProperty(name)) {
        if (retval !== "") {
          retval += "&";
        }
        retval += encodeURI(name) + "=" + encodeURI(o[name].toString());
      }
    }
    return retval;
  };
}
