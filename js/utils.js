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

if (!window.Element.prototype.classArray) {
  window.Element.prototype.classArray = function () {
    return this.className.split(" ");
  };
}

if (!window.Element.prototype.hasClass) {
  window.Element.prototype.hasClass = function (klass) {
    if (this.classArray().indexOf(klass) === -1) {
      return false;
    } else {
      return true;
    }
  };
}

if (!window.Element.prototype.addClass) {
  window.Element.prototype.addClass = function (klass) {
    if (this.hasClass(klass)) {
      return;
    }

    this.className = this.className + " " + klass;
  };
}

if (!window.Element.prototype.removeClass) {
  window.Element.prototype.removeClass = function (klass) {
    if (!this.hasClass(klass)) {
      return;
    }
    var classList;
    classList = this.classArray().filter(function (member, i, a) {
      if (member !== klass) {
        return member;
      }
    });
    this.className = classList.join(" ");
  };
}

//if (!Object.merge) {
  //Object.merge = function (objA, objB, deepCopy) {
    //var ele, retval;
    //for (ele in objA) {

    //}
  //}
//}
