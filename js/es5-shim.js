//mozilla's fallback
if (!Array.prototype.filter) {
  Array.prototype.filter = function (fun) {
    "use strict";

    if (this === void 0 || this === null) {
      throw new TypeError();
    }

    var t = Object(this), 
        len = t.length >>> 0,
        res = [],
        thisp = arguments[1];

    if (typeof fun !== "function") {
      throw new TypeError();
    }

    for (var i = 0; i < len; i++) {
      if (i in t) {
        var val = t[i];
        if (fun.call(thisp, val, i, t)) {
          res.push(val);
        }
      }
    }
    return res;
  };
}

if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (obj, fromIndex) {
    if (fromIndex === null) {
      fromIndex = 0;
    } else if (fromIndex < 0) {
      fromIndex = Math.max(0, this.length + fromIndex);
    }
    for (var i = fromIndex, j = this.length; i < j; i++) {
      if (this[i] === obj) {
        return i;
      }
    }
    return -1;
  };
}

//Can't be perfect, but it's as good as we're going to get without ES5
if (!Array.prototype.isArray) {
  Array.prototype.isArray = function(e) {
    return Object.prototype.toString.call(e) === '[Object array]';
  }
}
