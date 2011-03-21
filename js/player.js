/*!	SWFObject v2.2 <http://code.google.com/p/swfobject/> 
	is released under the MIT License <http://www.opensource.org/licenses/mit-license.php> 
*/
if (!swfobject) {
  var swfobject = function() {
    
    var UNDEF = "undefined",
      OBJECT = "object",
      SHOCKWAVE_FLASH = "Shockwave Flash",
      SHOCKWAVE_FLASH_AX = "ShockwaveFlash.ShockwaveFlash",
      FLASH_MIME_TYPE = "application/x-shockwave-flash",
      EXPRESS_INSTALL_ID = "SWFObjectExprInst",
      ON_READY_STATE_CHANGE = "onreadystatechange",
      
      win = window,
      doc = document,
      nav = navigator,
      
      plugin = false,
      domLoadFnArr = [main],
      regObjArr = [],
      objIdArr = [],
      listenersArr = [],
      storedAltContent,
      storedAltContentId,
      storedCallbackFn,
      storedCallbackObj,
      isDomLoaded = false,
      isExpressInstallActive = false,
      dynamicStylesheet,
      dynamicStylesheetMedia,
      autoHideShow = true,
    
    /* Centralized function for browser feature detection
      - User agent string detection is only used when no good alternative is possible
      - Is executed directly for optimal performance
    */	
    ua = function() {
      var w3cdom = typeof doc.getElementById != UNDEF && typeof doc.getElementsByTagName != UNDEF && typeof doc.createElement != UNDEF,
        u = nav.userAgent.toLowerCase(),
        p = nav.platform.toLowerCase(),
        windows = p ? /win/.test(p) : /win/.test(u),
        mac = p ? /mac/.test(p) : /mac/.test(u),
        webkit = /webkit/.test(u) ? parseFloat(u.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : false, // returns either the webkit version or false if not webkit
        ie = !+"\v1", // feature detection based on Andrea Giammarchi's solution: http://webreflection.blogspot.com/2009/01/32-bytes-to-know-if-your-browser-is-ie.html
        playerVersion = [0,0,0],
        d = null;
      if (typeof nav.plugins != UNDEF && typeof nav.plugins[SHOCKWAVE_FLASH] == OBJECT) {
        d = nav.plugins[SHOCKWAVE_FLASH].description;
        if (d && !(typeof nav.mimeTypes != UNDEF && nav.mimeTypes[FLASH_MIME_TYPE] && !nav.mimeTypes[FLASH_MIME_TYPE].enabledPlugin)) { // navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin indicates whether plug-ins are enabled or disabled in Safari 3+
          plugin = true;
          ie = false; // cascaded feature detection for Internet Explorer
          d = d.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
          playerVersion[0] = parseInt(d.replace(/^(.*)\..*$/, "$1"), 10);
          playerVersion[1] = parseInt(d.replace(/^.*\.(.*)\s.*$/, "$1"), 10);
          playerVersion[2] = /[a-zA-Z]/.test(d) ? parseInt(d.replace(/^.*[a-zA-Z]+(.*)$/, "$1"), 10) : 0;
        }
      }
      else if (typeof win.ActiveXObject != UNDEF) {
        try {
          var a = new ActiveXObject(SHOCKWAVE_FLASH_AX);
          if (a) { // a will return null when ActiveX is disabled
            d = a.GetVariable("$version");
            if (d) {
              ie = true; // cascaded feature detection for Internet Explorer
              d = d.split(" ")[1].split(",");
              playerVersion = [parseInt(d[0], 10), parseInt(d[1], 10), parseInt(d[2], 10)];
            }
          }
        }
        catch(e) {}
      }
      return { w3:w3cdom, pv:playerVersion, wk:webkit, ie:ie, win:windows, mac:mac };
    }(),
    
    /* Cross-browser onDomLoad
      - Will fire an event as soon as the DOM of a web page is loaded
      - Internet Explorer workaround based on Diego Perini's solution: http://javascript.nwbox.com/IEContentLoaded/
      - Regular onload serves as fallback
    */ 
    onDomLoad = function() {
      if (!ua.w3) { return; }
      if ((typeof doc.readyState != UNDEF && doc.readyState == "complete") || (typeof doc.readyState == UNDEF && (doc.getElementsByTagName("body")[0] || doc.body))) { // function is fired after onload, e.g. when script is inserted dynamically 
        callDomLoadFunctions();
      }
      if (!isDomLoaded) {
        if (typeof doc.addEventListener != UNDEF) {
          doc.addEventListener("DOMContentLoaded", callDomLoadFunctions, false);
        }		
        if (ua.ie && ua.win) {
          doc.attachEvent(ON_READY_STATE_CHANGE, function() {
            if (doc.readyState == "complete") {
              doc.detachEvent(ON_READY_STATE_CHANGE, arguments.callee);
              callDomLoadFunctions();
            }
          });
          if (win == top) { // if not inside an iframe
            (function(){
              if (isDomLoaded) { return; }
              try {
                doc.documentElement.doScroll("left");
              }
              catch(e) {
                setTimeout(arguments.callee, 0);
                return;
              }
              callDomLoadFunctions();
            })();
          }
        }
        if (ua.wk) {
          (function(){
            if (isDomLoaded) { return; }
            if (!/loaded|complete/.test(doc.readyState)) {
              setTimeout(arguments.callee, 0);
              return;
            }
            callDomLoadFunctions();
          })();
        }
        addLoadEvent(callDomLoadFunctions);
      }
    }();
    
    function callDomLoadFunctions() {
      if (isDomLoaded) { return; }
      try { // test if we can really add/remove elements to/from the DOM; we don't want to fire it too early
        var t = doc.getElementsByTagName("body")[0].appendChild(createElement("span"));
        t.parentNode.removeChild(t);
      }
      catch (e) { return; }
      isDomLoaded = true;
      var dl = domLoadFnArr.length;
      for (var i = 0; i < dl; i++) {
        domLoadFnArr[i]();
      }
    }
    
    function addDomLoadEvent(fn) {
      if (isDomLoaded) {
        fn();
      }
      else { 
        domLoadFnArr[domLoadFnArr.length] = fn; // Array.push() is only available in IE5.5+
      }
    }
    
    /* Cross-browser onload
      - Based on James Edwards' solution: http://brothercake.com/site/resources/scripts/onload/
      - Will fire an event as soon as a web page including all of its assets are loaded 
     */
    function addLoadEvent(fn) {
      if (typeof win.addEventListener != UNDEF) {
        win.addEventListener("load", fn, false);
      }
      else if (typeof doc.addEventListener != UNDEF) {
        doc.addEventListener("load", fn, false);
      }
      else if (typeof win.attachEvent != UNDEF) {
        addListener(win, "onload", fn);
      }
      else if (typeof win.onload == "function") {
        var fnOld = win.onload;
        win.onload = function() {
          fnOld();
          fn();
        };
      }
      else {
        win.onload = fn;
      }
    }
    
    /* Main function
      - Will preferably execute onDomLoad, otherwise onload (as a fallback)
    */
    function main() { 
      if (plugin) {
        testPlayerVersion();
      }
      else {
        matchVersions();
      }
    }
    
    /* Detect the Flash Player version for non-Internet Explorer browsers
      - Detecting the plug-in version via the object element is more precise than using the plugins collection item's description:
        a. Both release and build numbers can be detected
        b. Avoid wrong descriptions by corrupt installers provided by Adobe
        c. Avoid wrong descriptions by multiple Flash Player entries in the plugin Array, caused by incorrect browser imports
      - Disadvantage of this method is that it depends on the availability of the DOM, while the plugins collection is immediately available
    */
    function testPlayerVersion() {
      var b = doc.getElementsByTagName("body")[0];
      var o = createElement(OBJECT);
      o.setAttribute("type", FLASH_MIME_TYPE);
      var t = b.appendChild(o);
      if (t) {
        var counter = 0;
        (function(){
          if (typeof t.GetVariable != UNDEF) {
            var d = t.GetVariable("$version");
            if (d) {
              d = d.split(" ")[1].split(",");
              ua.pv = [parseInt(d[0], 10), parseInt(d[1], 10), parseInt(d[2], 10)];
            }
          }
          else if (counter < 10) {
            counter++;
            setTimeout(arguments.callee, 10);
            return;
          }
          b.removeChild(o);
          t = null;
          matchVersions();
        })();
      }
      else {
        matchVersions();
      }
    }
    
    /* Perform Flash Player and SWF version matching; static publishing only
    */
    function matchVersions() {
      var rl = regObjArr.length;
      if (rl > 0) {
        for (var i = 0; i < rl; i++) { // for each registered object element
          var id = regObjArr[i].id;
          var cb = regObjArr[i].callbackFn;
          var cbObj = {success:false, id:id};
          if (ua.pv[0] > 0) {
            var obj = getElementById(id);
            if (obj) {
              if (hasPlayerVersion(regObjArr[i].swfVersion) && !(ua.wk && ua.wk < 312)) { // Flash Player version >= published SWF version: Houston, we have a match!
                setVisibility(id, true);
                if (cb) {
                  cbObj.success = true;
                  cbObj.ref = getObjectById(id);
                  cb(cbObj);
                }
              }
              else if (regObjArr[i].expressInstall && canExpressInstall()) { // show the Adobe Express Install dialog if set by the web page author and if supported
                var att = {};
                att.data = regObjArr[i].expressInstall;
                att.width = obj.getAttribute("width") || "0";
                att.height = obj.getAttribute("height") || "0";
                if (obj.getAttribute("class")) { att.styleclass = obj.getAttribute("class"); }
                if (obj.getAttribute("align")) { att.align = obj.getAttribute("align"); }
                // parse HTML object param element's name-value pairs
                var par = {};
                var p = obj.getElementsByTagName("param");
                var pl = p.length;
                for (var j = 0; j < pl; j++) {
                  if (p[j].getAttribute("name").toLowerCase() != "movie") {
                    par[p[j].getAttribute("name")] = p[j].getAttribute("value");
                  }
                }
                showExpressInstall(att, par, id, cb);
              }
              else { // Flash Player and SWF version mismatch or an older Webkit engine that ignores the HTML object element's nested param elements: display alternative content instead of SWF
                displayAltContent(obj);
                if (cb) { cb(cbObj); }
              }
            }
          }
          else {	// if no Flash Player is installed or the fp version cannot be detected we let the HTML object element do its job (either show a SWF or alternative content)
            setVisibility(id, true);
            if (cb) {
              var o = getObjectById(id); // test whether there is an HTML object element or not
              if (o && typeof o.SetVariable != UNDEF) { 
                cbObj.success = true;
                cbObj.ref = o;
              }
              cb(cbObj);
            }
          }
        }
      }
    }
    
    function getObjectById(objectIdStr) {
      var r = null;
      var o = getElementById(objectIdStr);
      if (o && o.nodeName == "OBJECT") {
        if (typeof o.SetVariable != UNDEF) {
          r = o;
        }
        else {
          var n = o.getElementsByTagName(OBJECT)[0];
          if (n) {
            r = n;
          }
        }
      }
      return r;
    }
    
    /* Requirements for Adobe Express Install
      - only one instance can be active at a time
      - fp 6.0.65 or higher
      - Win/Mac OS only
      - no Webkit engines older than version 312
    */
    function canExpressInstall() {
      return !isExpressInstallActive && hasPlayerVersion("6.0.65") && (ua.win || ua.mac) && !(ua.wk && ua.wk < 312);
    }
    
    /* Show the Adobe Express Install dialog
      - Reference: http://www.adobe.com/cfusion/knowledgebase/index.cfm?id=6a253b75
    */
    function showExpressInstall(att, par, replaceElemIdStr, callbackFn) {
      isExpressInstallActive = true;
      storedCallbackFn = callbackFn || null;
      storedCallbackObj = {success:false, id:replaceElemIdStr};
      var obj = getElementById(replaceElemIdStr);
      if (obj) {
        if (obj.nodeName == "OBJECT") { // static publishing
          storedAltContent = abstractAltContent(obj);
          storedAltContentId = null;
        }
        else { // dynamic publishing
          storedAltContent = obj;
          storedAltContentId = replaceElemIdStr;
        }
        att.id = EXPRESS_INSTALL_ID;
        if (typeof att.width == UNDEF || (!/%$/.test(att.width) && parseInt(att.width, 10) < 310)) { att.width = "310"; }
        if (typeof att.height == UNDEF || (!/%$/.test(att.height) && parseInt(att.height, 10) < 137)) { att.height = "137"; }
        doc.title = doc.title.slice(0, 47) + " - Flash Player Installation";
        var pt = ua.ie && ua.win ? "ActiveX" : "PlugIn",
          fv = "MMredirectURL=" + win.location.toString().replace(/&/g,"%26") + "&MMplayerType=" + pt + "&MMdoctitle=" + doc.title;
        if (typeof par.flashvars != UNDEF) {
          par.flashvars += "&" + fv;
        }
        else {
          par.flashvars = fv;
        }
        // IE only: when a SWF is loading (AND: not available in cache) wait for the readyState of the object element to become 4 before removing it,
        // because you cannot properly cancel a loading SWF file without breaking browser load references, also obj.onreadystatechange doesn't work
        if (ua.ie && ua.win && obj.readyState != 4) {
          var newObj = createElement("div");
          replaceElemIdStr += "SWFObjectNew";
          newObj.setAttribute("id", replaceElemIdStr);
          obj.parentNode.insertBefore(newObj, obj); // insert placeholder div that will be replaced by the object element that loads expressinstall.swf
          obj.style.display = "none";
          (function(){
            if (obj.readyState == 4) {
              obj.parentNode.removeChild(obj);
            }
            else {
              setTimeout(arguments.callee, 10);
            }
          })();
        }
        createSWF(att, par, replaceElemIdStr);
      }
    }
    
    /* Functions to abstract and display alternative content
    */
    function displayAltContent(obj) {
      if (ua.ie && ua.win && obj.readyState != 4) {
        // IE only: when a SWF is loading (AND: not available in cache) wait for the readyState of the object element to become 4 before removing it,
        // because you cannot properly cancel a loading SWF file without breaking browser load references, also obj.onreadystatechange doesn't work
        var el = createElement("div");
        obj.parentNode.insertBefore(el, obj); // insert placeholder div that will be replaced by the alternative content
        el.parentNode.replaceChild(abstractAltContent(obj), el);
        obj.style.display = "none";
        (function(){
          if (obj.readyState == 4) {
            obj.parentNode.removeChild(obj);
          }
          else {
            setTimeout(arguments.callee, 10);
          }
        })();
      }
      else {
        obj.parentNode.replaceChild(abstractAltContent(obj), obj);
      }
    } 

    function abstractAltContent(obj) {
      var ac = createElement("div");
      if (ua.win && ua.ie) {
        ac.innerHTML = obj.innerHTML;
      }
      else {
        var nestedObj = obj.getElementsByTagName(OBJECT)[0];
        if (nestedObj) {
          var c = nestedObj.childNodes;
          if (c) {
            var cl = c.length;
            for (var i = 0; i < cl; i++) {
              if (!(c[i].nodeType == 1 && c[i].nodeName == "PARAM") && !(c[i].nodeType == 8)) {
                ac.appendChild(c[i].cloneNode(true));
              }
            }
          }
        }
      }
      return ac;
    }
    
    /* Cross-browser dynamic SWF creation
    */
    function createSWF(attObj, parObj, id) {
      var r, el = getElementById(id);
      if (ua.wk && ua.wk < 312) { return r; }
      if (el) {
        if (typeof attObj.id == UNDEF) { // if no 'id' is defined for the object element, it will inherit the 'id' from the alternative content
          attObj.id = id;
        }
        if (ua.ie && ua.win) { // Internet Explorer + the HTML object element + W3C DOM methods do not combine: fall back to outerHTML
          var att = "";
          for (var i in attObj) {
            if (attObj[i] != Object.prototype[i]) { // filter out prototype additions from other potential libraries
              if (i.toLowerCase() == "data") {
                parObj.movie = attObj[i];
              }
              else if (i.toLowerCase() == "styleclass") { // 'class' is an ECMA4 reserved keyword
                att += ' class="' + attObj[i] + '"';
              }
              else if (i.toLowerCase() != "classid") {
                att += ' ' + i + '="' + attObj[i] + '"';
              }
            }
          }
          var par = "";
          for (var j in parObj) {
            if (parObj[j] != Object.prototype[j]) { // filter out prototype additions from other potential libraries
              par += '<param name="' + j + '" value="' + parObj[j] + '" />';
            }
          }
          el.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + att + '>' + par + '</object>';
          objIdArr[objIdArr.length] = attObj.id; // stored to fix object 'leaks' on unload (dynamic publishing only)
          r = getElementById(attObj.id);	
        }
        else { // well-behaving browsers
          var o = createElement(OBJECT);
          o.setAttribute("type", FLASH_MIME_TYPE);
          for (var m in attObj) {
            if (attObj[m] != Object.prototype[m]) { // filter out prototype additions from other potential libraries
              if (m.toLowerCase() == "styleclass") { // 'class' is an ECMA4 reserved keyword
                o.setAttribute("class", attObj[m]);
              }
              else if (m.toLowerCase() != "classid") { // filter out IE specific attribute
                o.setAttribute(m, attObj[m]);
              }
            }
          }
          for (var n in parObj) {
            if (parObj[n] != Object.prototype[n] && n.toLowerCase() != "movie") { // filter out prototype additions from other potential libraries and IE specific param element
              createObjParam(o, n, parObj[n]);
            }
          }
          el.parentNode.replaceChild(o, el);
          r = o;
        }
      }
      return r;
    }
    
    function createObjParam(el, pName, pValue) {
      var p = createElement("param");
      p.setAttribute("name", pName);	
      p.setAttribute("value", pValue);
      el.appendChild(p);
    }
    
    /* Cross-browser SWF removal
      - Especially needed to safely and completely remove a SWF in Internet Explorer
    */
    function removeSWF(id) {
      var obj = getElementById(id);
      if (obj && obj.nodeName == "OBJECT") {
        if (ua.ie && ua.win) {
          obj.style.display = "none";
          (function(){
            if (obj.readyState == 4) {
              removeObjectInIE(id);
            }
            else {
              setTimeout(arguments.callee, 10);
            }
          })();
        }
        else {
          obj.parentNode.removeChild(obj);
        }
      }
    }
    
    function removeObjectInIE(id) {
      var obj = getElementById(id);
      if (obj) {
        for (var i in obj) {
          if (typeof obj[i] == "function") {
            obj[i] = null;
          }
        }
        obj.parentNode.removeChild(obj);
      }
    }
    
    /* Functions to optimize JavaScript compression
    */
    function getElementById(id) {
      var el = null;
      try {
        el = doc.getElementById(id);
      }
      catch (e) {}
      return el;
    }
    
    function createElement(el) {
      return doc.createElement(el);
    }
    
    /* Updated attachEvent function for Internet Explorer
      - Stores attachEvent information in an Array, so on unload the detachEvent functions can be called to avoid memory leaks
    */	
    function addListener(target, eventType, fn) {
      target.attachEvent(eventType, fn);
      listenersArr[listenersArr.length] = [target, eventType, fn];
    }
    
    /* Flash Player and SWF content version matching
    */
    function hasPlayerVersion(rv) {
      var pv = ua.pv, v = rv.split(".");
      v[0] = parseInt(v[0], 10);
      v[1] = parseInt(v[1], 10) || 0; // supports short notation, e.g. "9" instead of "9.0.0"
      v[2] = parseInt(v[2], 10) || 0;
      return (pv[0] > v[0] || (pv[0] == v[0] && pv[1] > v[1]) || (pv[0] == v[0] && pv[1] == v[1] && pv[2] >= v[2])) ? true : false;
    }
    
    /* Cross-browser dynamic CSS creation
      - Based on Bobby van der Sluis' solution: http://www.bobbyvandersluis.com/articles/dynamicCSS.php
    */	
    function createCSS(sel, decl, media, newStyle) {
      if (ua.ie && ua.mac) { return; }
      var h = doc.getElementsByTagName("head")[0];
      if (!h) { return; } // to also support badly authored HTML pages that lack a head element
      var m = (media && typeof media == "string") ? media : "screen";
      if (newStyle) {
        dynamicStylesheet = null;
        dynamicStylesheetMedia = null;
      }
      if (!dynamicStylesheet || dynamicStylesheetMedia != m) { 
        // create dynamic stylesheet + get a global reference to it
        var s = createElement("style");
        s.setAttribute("type", "text/css");
        s.setAttribute("media", m);
        dynamicStylesheet = h.appendChild(s);
        if (ua.ie && ua.win && typeof doc.styleSheets != UNDEF && doc.styleSheets.length > 0) {
          dynamicStylesheet = doc.styleSheets[doc.styleSheets.length - 1];
        }
        dynamicStylesheetMedia = m;
      }
      // add style rule
      if (ua.ie && ua.win) {
        if (dynamicStylesheet && typeof dynamicStylesheet.addRule == OBJECT) {
          dynamicStylesheet.addRule(sel, decl);
        }
      }
      else {
        if (dynamicStylesheet && typeof doc.createTextNode != UNDEF) {
          dynamicStylesheet.appendChild(doc.createTextNode(sel + " {" + decl + "}"));
        }
      }
    }
    
    function setVisibility(id, isVisible) {
      if (!autoHideShow) { return; }
      var v = isVisible ? "visible" : "hidden";
      if (isDomLoaded && getElementById(id)) {
        getElementById(id).style.visibility = v;
      }
      else {
        createCSS("#" + id, "visibility:" + v);
      }
    }

    /* Filter to avoid XSS attacks
    */
    function urlEncodeIfNecessary(s) {
      var regex = /[\\\"<>\.;]/;
      var hasBadChars = regex.exec(s) != null;
      return hasBadChars && typeof encodeURIComponent != UNDEF ? encodeURIComponent(s) : s;
    }
    
    /* Release memory to avoid memory leaks caused by closures, fix hanging audio/video threads and force open sockets/NetConnections to disconnect (Internet Explorer only)
    */
    var cleanup = function() {
      if (ua.ie && ua.win) {
        window.attachEvent("onunload", function() {
          // remove listeners to avoid memory leaks
          var ll = listenersArr.length;
          for (var i = 0; i < ll; i++) {
            listenersArr[i][0].detachEvent(listenersArr[i][1], listenersArr[i][2]);
          }
          // cleanup dynamically embedded objects to fix audio/video threads and force open sockets and NetConnections to disconnect
          var il = objIdArr.length;
          for (var j = 0; j < il; j++) {
            removeSWF(objIdArr[j]);
          }
          // cleanup library's main closures to avoid memory leaks
          for (var k in ua) {
            ua[k] = null;
          }
          ua = null;
          for (var l in swfobject) {
            swfobject[l] = null;
          }
          swfobject = null;
        });
      }
    }();
    
    return {
      /* Public API
        - Reference: http://code.google.com/p/swfobject/wiki/documentation
      */ 
      registerObject: function(objectIdStr, swfVersionStr, xiSwfUrlStr, callbackFn) {
        if (ua.w3 && objectIdStr && swfVersionStr) {
          var regObj = {};
          regObj.id = objectIdStr;
          regObj.swfVersion = swfVersionStr;
          regObj.expressInstall = xiSwfUrlStr;
          regObj.callbackFn = callbackFn;
          regObjArr[regObjArr.length] = regObj;
          setVisibility(objectIdStr, false);
        }
        else if (callbackFn) {
          callbackFn({success:false, id:objectIdStr});
        }
      },
      
      getObjectById: function(objectIdStr) {
        if (ua.w3) {
          return getObjectById(objectIdStr);
        }
      },
      
      embedSWF: function(swfUrlStr, replaceElemIdStr, widthStr, heightStr, swfVersionStr, xiSwfUrlStr, flashvarsObj, parObj, attObj, callbackFn) {
        var callbackObj = {success:false, id:replaceElemIdStr};
        if (ua.w3 && !(ua.wk && ua.wk < 312) && swfUrlStr && replaceElemIdStr && widthStr && heightStr && swfVersionStr) {
          setVisibility(replaceElemIdStr, false);
          addDomLoadEvent(function() {
            widthStr += ""; // auto-convert to string
            heightStr += "";
            var att = {};
            if (attObj && typeof attObj === OBJECT) {
              for (var i in attObj) { // copy object to avoid the use of references, because web authors often reuse attObj for multiple SWFs
                att[i] = attObj[i];
              }
            }
            att.data = swfUrlStr;
            att.width = widthStr;
            att.height = heightStr;
            var par = {}; 
            if (parObj && typeof parObj === OBJECT) {
              for (var j in parObj) { // copy object to avoid the use of references, because web authors often reuse parObj for multiple SWFs
                par[j] = parObj[j];
              }
            }
            if (flashvarsObj && typeof flashvarsObj === OBJECT) {
              for (var k in flashvarsObj) { // copy object to avoid the use of references, because web authors often reuse flashvarsObj for multiple SWFs
                if (typeof par.flashvars != UNDEF) {
                  par.flashvars += "&" + k + "=" + flashvarsObj[k];
                }
                else {
                  par.flashvars = k + "=" + flashvarsObj[k];
                }
              }
            }
            if (hasPlayerVersion(swfVersionStr)) { // create SWF
              var obj = createSWF(att, par, replaceElemIdStr);
              if (att.id == replaceElemIdStr) {
                setVisibility(replaceElemIdStr, true);
              }
              callbackObj.success = true;
              callbackObj.ref = obj;
            }
            else if (xiSwfUrlStr && canExpressInstall()) { // show Adobe Express Install
              att.data = xiSwfUrlStr;
              showExpressInstall(att, par, replaceElemIdStr, callbackFn);
              return;
            }
            else { // show alternative content
              setVisibility(replaceElemIdStr, true);
            }
            if (callbackFn) { callbackFn(callbackObj); }
          });
        }
        else if (callbackFn) { callbackFn(callbackObj);	}
      },
      
      switchOffAutoHideShow: function() {
        autoHideShow = false;
      },
      
      ua: ua,
      
      getFlashPlayerVersion: function() {
        return { major:ua.pv[0], minor:ua.pv[1], release:ua.pv[2] };
      },
      
      hasFlashPlayerVersion: hasPlayerVersion,
      
      createSWF: function(attObj, parObj, replaceElemIdStr) {
        if (ua.w3) {
          return createSWF(attObj, parObj, replaceElemIdStr);
        }
        else {
          return undefined;
        }
      },
      
      showExpressInstall: function(att, par, replaceElemIdStr, callbackFn) {
        if (ua.w3 && canExpressInstall()) {
          showExpressInstall(att, par, replaceElemIdStr, callbackFn);
        }
      },
      
      removeSWF: function(objElemIdStr) {
        if (ua.w3) {
          removeSWF(objElemIdStr);
        }
      },
      
      createCSS: function(selStr, declStr, mediaStr, newStyleBoolean) {
        if (ua.w3) {
          createCSS(selStr, declStr, mediaStr, newStyleBoolean);
        }
      },
      
      addDomLoadEvent: addDomLoadEvent,
      
      addLoadEvent: addLoadEvent,
      
      getQueryParamValue: function(param) {
        var q = doc.location.search || doc.location.hash;
        if (q) {
          if (/\?/.test(q)) { q = q.split("?")[1]; } // strip question mark
          if (param == null) {
            return urlEncodeIfNecessary(q);
          }
          var pairs = q.split("&");
          for (var i = 0; i < pairs.length; i++) {
            if (pairs[i].substring(0, pairs[i].indexOf("=")) == param) {
              return urlEncodeIfNecessary(pairs[i].substring((pairs[i].indexOf("=") + 1)));
            }
          }
        }
        return "";
      },
      
      // For internal usage only
      expressInstallCallback: function() {
        if (isExpressInstallActive) {
          var obj = getElementById(EXPRESS_INSTALL_ID);
          if (obj && storedAltContent) {
            obj.parentNode.replaceChild(storedAltContent, obj);
            if (storedAltContentId) {
              setVisibility(storedAltContentId, true);
              if (ua.ie && ua.win) { storedAltContent.style.display = "block"; }
            }
            if (storedCallbackFn) { storedCallbackFn(storedCallbackObj); }
          }
          isExpressInstallActive = false;
        } 
      }
    };
  }();
}
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
  Array.prototype.indexOf = function(searchElement /*, fromIndex */) {
    "use strict";

    if (this === void 0 || this === null) {
      throw new TypeError();
    }

    var t = Object(this);
    var len = t.length >>> 0;
    if (len === 0) {
      return -1;
    }

    var n = 0;
    if (arguments.length > 0) {
      n = Number(arguments[1]);
      if (n !== n){ // shortcut for verifying if it's NaN
        n = 0;
      } else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0)) {
        n = (n > 0 || -1) * Math.floor(Math.abs(n));
      }
    }

    if (n >= len) {
      return -1;
    }

    var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);

    for (; k < len; k++) {
      if (k in t && t[k] === searchElement) {
        return k;
      }
    }
    return -1;
  };
}

//Can't be perfect, but it's as good as we're going to get without ES5
if (!Array.isArray) {
  Array.isArray = function(e) {
    return Object.prototype.toString.call(e).toLowerCase() === '[object array]';
  }
}
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

if (!Object.toQueryString) {
  Object.toQueryString = function (o) {
    var retval = "";
    "use strict";
    for (var name in o) {
      if (o.hasOwnProperty(name)) {
        if (retval !== "") {
          retval += "&";
        }
        retval += encodeURI(name) + "=" + encodeURI(new String(this[name]));
      }
    }
    return retval;
  }
}
/*
* Unobtrusive Slider Control 
* http://www.frequency-decoder.com/
*
* Copyright 2010, Brian McAllister
* Dual licensed under the MIT or GPL Version 2 licenses.
*
*/
var fdSlider = (function() {
  var sliders           = {},     
  uniqueid          = 0,
  mouseWheelEnabled = true,            
  fullARIA          = true,
  describedBy       = "fd-slider-describedby",
  varSetRules       = {
    onfocus:true,
    onvalue:true
  }, 
  noRangeBar        = false,           
  html5Animation    = "jump",               
  isOpera           = Object.prototype.toString.call(window.opera) === "[object Opera]",
  fpRegExp          = /^([-]{0,1}[0-9]+(\.[0-9]+){0,1})$/,
  stepRegExp        = /^([0-9]+(\.[0-9]+){0,1})$/;

  var parseJSON = function(str) {
    // Check we have a String
    if(typeof str !== 'string' || str == "") { return {}; };                 
    try {
      // Does a JSON (native or not) Object exist                              
      if(typeof JSON === "object" && JSON.parse) {                                              
        return window.JSON.parse(str);  
        // Genious code taken from: http://kentbrewster.com/badges/                                                      
      } else if(/mousewheelenabled|fullaria|describedby|norangebar|html5animation|varsetrules/.test(str.toLowerCase())) {                                               
        var f = Function(['var document,top,self,window,parent,Number,Date,Object,Function,',
                         'Array,String,Math,RegExp,Image,ActiveXObject;',
                         'return (' , str.replace(/<\!--.+-->/gim,'').replace(/\bfunction\b/g,'functionÂ­') , ');'].join(''));
                         return f();                          
      };
    } catch (e) { };                              

    return {"err":"Could not parse the JSON object"};                                            
  };

  var affectJSON = function(json) {
    if(typeof json !== "object") { return; };
    for(key in json) {
      value = json[key];                                                                
      switch(key.toLowerCase()) { 
        case "mousewheelenabled":
          mouseWheelEnabled = !!value;
        break;                                                               
        case "fullaria":
          fullARIA = !!value;
        break;
        case "describedby":
          describedBy = String(value);
        break; 
        case "norangebar":
          noRangeBar = !!value;
        break;                                    
        case "html5animation":
          html5Animation = String(value).search(/^(jump|tween|timed)$/i) != -1 ? String(value).toLowerCase() : "jump";
        break;                                
        case "varsetrules":
          if("onfocus" in value) {
          varSetRules.onfocus = !!value.onfocus;
        };
        if("onvalue" in value) {
          varSetRules.onvalue = !!value.onvalue;
        };
        break;                                                                                                                                                                                                 
      };          
    };        
  };

  // Classic event functions                 
  var addEvent = function(obj, type, fn) {                
    if( obj.attachEvent ) {
      obj["e"+type+fn] = fn;
      obj[type+fn] = function(){obj["e"+type+fn]( window.event );};
      obj.attachEvent( "on"+type, obj[type+fn] );
    } else { obj.addEventListener( type, fn, true ); }
  };
  var removeEvent = function(obj, type, fn) {
    try {
      if( obj.detachEvent ) {
        obj.detachEvent( "on"+type, obj[type+fn] );
        obj[type+fn] = null;                        
      } else { obj.removeEventListener( type, fn, true ); }
    } catch(err) {};
  };
  var stopEvent = function(e) {
    e = e || window.event;
    if(e.stopPropagation) {
      e.stopPropagation();
      e.preventDefault();
    };

    /*@cc_on@*/
    /*@if(@_win32)
    e.cancelBubble = true;
    e.returnValue = false;
    /*@end@*/

    return false;
  };        
  var preventDefault = function(e) {
    e = e || window.event;
    if(e.preventDefault) {
      e.preventDefault();
      return;
    };
    e.returnValue = false;
  };

  // Add/Remove classname utility functions
  var addClass = function(e,c) {
    if(new RegExp("(^|\\s)" + c + "(\\s|$)").test(e.className)) { return; };
    e.className += ( e.className ? " " : "" ) + c;
  };

  var removeClass = function(e,c) {
    e.className = !c ? "" : e.className.replace(new RegExp("(^|\\s)" + c + "(\\s|$)"), " ").replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  };

  // Returns an Object of key value pairs indicating which sliders have values
  // that have been "set/chosen" by the user
  var getValueSet = function() {
    var obj = {};
    for(id in sliders) {
      obj[id] = sliders[id].getValueSet();
    };
    return obj;
  };

  // Sets the valueSet variable for a specific slider
  var setValueSet = function(sliderId, tf) {                 
    if(!(sliderId in sliders)) return;
    sliders[sliderId].setValueSet(!!tf);             
  };

  // Javascript instantiation of a slider (input type="text" or select list)       
  var createSlider = function(options) {
    if(!options || !options.inp || !options.inp.tagName || options.inp.tagName.search(/^input|select/i) == -1) { return false; };                

    options.html5Shim = false;                

    if(options.inp.tagName.toLowerCase() == "select") {  
      if(options.inp.options.length < 2) {
        return false;
      };
      options.min             = 0;                                                                                      
      options.max             = options.inp.options.length - 1;                                                              
      options.step            = 1;    
      options.precision       = 0;   
      options.scale           = false;                                                                     
    } else {  
      if(String(options.inp.type).search(/^text$/i) == -1) {
        return false;
      };                      
      options.min       = options.min && String(options.min).search(fpRegExp) != -1 ? +options.min : 0;
      options.max       = options.max && String(options.max).search(fpRegExp) != -1 ? +options.max : 100;                        
      options.step      = options.step && String(options.step).search(stepRegExp) != -1 ? options.step : 1;
      options.precision = options.precision && String(options.precision).search(/^[0-9]+$/) != -1 ? options.precision : (String(options.step).search(/\.([0-9]+)$/) != -1 ? String(options.step).match(/\.([0-9]+)$/)[1].length : 0);                              
      options.scale     = options.scale || false;
    };

    options.maxStep    = options.maxStep && String(options.maxStep).search(stepRegExp) != -1 ? +options.maxStep : +options.step * 2;
    options.classNames = options.classNames || "";
    options.callbacks  = options.callbacks || false;

    destroySingleSlider(options.inp.id);
    sliders[options.inp.id] = new fdRange(options);
    return true;
  };  

  var getAttribute = function(elem, att) {
    return elem.getAttribute(att) || "";
  };

  // HTML5 input type="range" shim - called onload or onDomReady
  var init = function() {
    var inputs = document.getElementsByTagName("input"),
    options;    

    for(var i = 0, inp; inp = inputs[i]; i++) {                         

      if(inp.tagName.toLowerCase() == "input" 
         && 
         inp.type.toLowerCase() == "text" 
       && 
         (getAttribute(inp, "min") && getAttribute(inp, "min").search(fpRegExp) != -1 
          || 
            getAttribute(inp, "max") && getAttribute(inp, "max").search(fpRegExp) != -1
          || 
            getAttribute(inp, "step") && getAttribute(inp, "step").search(/^(any|([0-9]+(\.[0-9]+){0,1}))$/i) != -1
         )) {

           // Skip elements that have already been created are are resident in the DOM
           if(inp.id && document.getElementById("fd-slider-"+inp.id)) { 
             continue;                                                                
             // Destroy elements that have already been created but not resident in the DOM
           } else if(inp.id && !document.getElementById("fd-slider-"+inp.id)) {
             destroySingleSlider(inp.id);
           };

           // Create an id for the form element if necessary
           if(!inp.id) { inp.id = "fd-slider-form-elem-" + uniqueid++; };                      

           // Basic option Object        
           options = {
             inp:            inp,                                                               
             callbacks:      [],                                         
             animation:      html5Animation,                                        
             vertical:       !!getAttribute(inp, "data-fd-slider-vertical"),
             classNames:     getAttribute(inp, "data-fd-slider-vertical"),
             html5Shim:      true
           };

           options.min             = getAttribute(inp, "min") || 0;
           options.max             = getAttribute(inp, "max") || 100;
           options.step            = getAttribute(inp, "step").search(/^any$/i) != -1 ? options.max - options.min : getAttribute(inp, "step").search(stepRegExp) != -1 ? inp.getAttribute("step") : 1;
           options.precision       = String(options.step).search(/\.([0-9]+)$/) != -1 ? String(options.step).match(/\.([0-9]+)$/)[1].length : 0;        
           options.maxStep         = options.step * 2; 

           destroySingleSlider(options.inp.id);
           sliders[options.inp.id] = new fdRange(options);
         };                       
    };

    return true;
  };             
  var destroySingleSlider = function(id) {
    if(id in sliders) { 
      sliders[id].destroy(); 
      delete sliders[id]; 
      return true;
    };
    return false;
  };
  var destroyAllsliders = function(e) {
    for(slider in sliders) { sliders[slider].destroy(); };
    sliders = [];                        
  };
  var unload = function(e) {
    destroyAllsliders();
    sliders = null;                         
  };                  
  var resize = function(e) {
    for(slider in sliders) { sliders[slider].onResize(); };        
  };    
  // HTML5 polyfill use only          
  var onDomReady = function() {
    removeEvent(window, "load",   init);
    init();
  };    
  var removeOnLoadEvent = function() {                      
    removeEvent(window, "load",   init);                 
  };              
  function fdRange(options) {
    var inp         = options.inp,
    disabled    = false,
    tagName     = inp.tagName.toLowerCase(),                      
    min         = +options.min,
    max         = +options.max,
    rMin        = +options.min,
    rMax        = +options.max, 
    range       = Math.abs(max - min),
    step        = tagName == "select" ? 1 : +options.step,
    maxStep     = options.maxStep ? +options.maxStep : step * 2,
    precision   = options.precision || 0,
    steps       = Math.ceil(range / step),
    scale       = options.scale || false,                
    hideInput   = !!options.hideInput,                                                 
    animation   = options.animation || "",                                        
    vertical    = !!options.vertical,
    callbacks   = options.callbacks || {},
    classNames  = options.classNames || "",                    
    html5Shim   = !!options.html5Shim,                  
    defaultVal  = inp.value && checkInputValue(inp.value) ? inp.value : (max < min ? min : min + ((max - min) / 2)),                    
    timer       = null,
    kbEnabled   = true,                  
    sliderH     = 0,
    sliderW     = 0, 
    tweenX      = 0,
    tweenB      = 0,
    tweenC      = 0,
    tweenD      = 0,
    frame       = 0,
    x           = 0,                    
    y           = 0,                                       
    rMaxPx      = 0,
    rMinPx      = 0,
    handlePos   = 0,                    
    destPos     = 0,                    
    mousePos    = 0,
    stepPx      = 0,
    userSet     = false, 
    touchEvents = false,
    outerWrapper,
    wrapper,
    handle,
    rangeBar,
    bar;                                 

    // Make sure we have a negative step if the max < min  
    if(max < min) {                           
      step    = -Math.abs(step);
      maxStep = -Math.abs(maxStep);
    };

    // Add the 100% scale mark if needs be
    if(scale) {
      scale[100] = max;
    };

    // Set he "userSet" variable programmatically for this slider
    function valueSet(tf) {
      tf = !!tf;
      if(tf != userSet) {
        userSet = tf;
        valueToPixels();
      };
    };

    function disableSlider(noCallback) {                         
      if(disabled && !noCallback) { return; };

      try {   

        removeEvent(handle, "focus",     onFocus);
        removeEvent(handle, "blur",      onBlur);  

        if(!isOpera) {
          removeEvent(handle, "keydown",   onKeyDown);  
          removeEvent(handle, "keypress",  onKeyPress); 
        } else {
          removeEvent(handle, "keypress",  onKeyDown);
        };                                            

        removeEvent(outerWrapper, "mouseover",  onMouseOver);
        removeEvent(outerWrapper, "mouseout",   onMouseOut);
        removeEvent(outerWrapper, "mousedown",  onMouseDown);
        removeEvent(outerWrapper, "touchstart", onMouseDown);

        if(mouseWheelEnabled) {
          if (window.addEventListener && !window.devicePixelRatio) window.removeEventListener('DOMMouseScroll', trackMouseWheel, false);
          else {
            removeEvent(document, "mousewheel", trackMouseWheel);
            removeEvent(window,   "mousewheel", trackMouseWheel);
          };
        };
      } catch(err) {};

      clearTimeout(timer);
      removeClass(outerWrapper, "fd-slider-focused");
      removeClass(outerWrapper, "fd-slider-active");

      addClass(outerWrapper, "fd-slider-disabled");
      outerWrapper.setAttribute("aria-disabled", true);                        
      inp.disabled = disabled = true;

      if(!noCallback) {
        callback("disable");
      };                        
    };

    function enableSlider(noCallback) {                         
      if(!disabled && !noCallback) return;                        

      addEvent(handle, "focus",      onFocus);
      addEvent(handle, "blur",       onBlur);   

      if(!isOpera) {
        addEvent(handle, "keydown",   onKeyDown);  
        addEvent(handle, "keypress",  onKeyPress); 
      } else {
        addEvent(handle, "keypress",  onKeyDown);
      };

      addEvent(outerWrapper, "touchstart", onMouseDown);
      addEvent(outerWrapper, "mousedown",  onMouseDown); 
      addEvent(outerWrapper, "mouseover",  onMouseOver);
      addEvent(outerWrapper, "mouseout",   onMouseOut);

      removeClass(outerWrapper, "fd-slider-disabled");
      outerWrapper.setAttribute("aria-disabled", false);                         
      inp.disabled = disabled = touchEvents = false;                          

      if(!noCallback) {
        callback("enable");
      };
    };

    // Destroys a slider - hopefully releases all memory, even in IE
    function destroySlider() {                        
      // Clear any timeouts
      clearTimeout(timer);

      // Remove pointers to DOM nodes
      wrapper = bar = handle = outerWrapper = timer = null;

      // Call the "destroy" callback
      callback("destroy");

      // Delete the callback functions
      callbacks = null;
    };

    // Calculates the pixel increment etc
    function redraw() {
      locate();
      // Internet Explorer requires the try catch
      try {
        var sW  = outerWrapper.offsetWidth,
        sH  = outerWrapper.offsetHeight,
        hW  = handle.offsetWidth,
        hH  = handle.offsetHeight,
        bH  = bar.offsetHeight,
        bW  = bar.offsetWidth, 
        mPx = vertical ? sH - hH : sW - hW;                                

        stepPx = mPx / steps;                                
        rMinPx = Math.max(scale ? percentToPixels(valueToPercent(rMin)) : Math.abs((rMin - min) / step) * stepPx, 0);    
        rMaxPx = Math.min(scale ? percentToPixels(valueToPercent(rMax)) : Math.abs((rMax - min) / step) * stepPx, Math.floor(vertical ? sH - hH : sW - hW));    

        sliderW = sW;
        sliderH = sH;                                

        valueToPixels();

      } catch(err) {};
      callback("redraw");
    };

    // Calls a callback function
    function callback(type) {                                              
      var cbObj = {"disabled":disabled, "userSet":userSet, "elem":inp, "value":tagName == "select" ? inp.options[inp.selectedIndex].value : inp.value};
      if(type in callbacks) {                                                                             
        if(callbacks.hasOwnProperty(type)) {                                                                                  
          // Call all functions in sequence 
          for(var i = 0, func; func = callbacks[type][i]; i++) {
            func(cbObj);
          };
        };
      }; 
    };

    // FOCUS & BLUR events
    function onFocus(e) {
      addClass(outerWrapper, 'fd-slider-focused');

      // Is the value said to have been set by the user onfocus
      if(varSetRules.onfocus) { 
        userSet = true;
        valueToPixels(); 
      };

      // If mousewhell events required then add them
      if(mouseWheelEnabled) {
        addEvent(window, 'DOMMouseScroll', trackMouseWheel);
        addEvent(document, 'mousewheel', trackMouseWheel);
        if(!isOpera) addEvent(window,   'mousewheel', trackMouseWheel); 
      }; 

      // Callback...
      callback("focus");                        
      return true;                      
    };

    function onBlur(e) {                          
      removeClass(outerWrapper, 'fd-slider-focused');

      // Remove mousewheel events if necessary
      if(mouseWheelEnabled) {
        removeEvent(document, 'mousewheel', trackMouseWheel);
        removeEvent(window, 'DOMMouseScroll', trackMouseWheel);
        if(!isOpera) removeEvent(window,   'mousewheel', trackMouseWheel);
      };

      kbEnabled = true;

      // Callback...
      callback("blur");
    };

    // MOUSEWHEEL events
    function trackMouseWheel(e) {
      if(!kbEnabled) return;
      e = e || window.event;
      var delta = 0;

      if (e.wheelDelta) {
        delta = e.wheelDelta/120;
        // Older versions of Opera require a small hack to inverse the delta
        if (isOpera && window.opera.version() < 9.2) delta = -delta;
      } else if(e.detail) {
        delta = -e.detail/3;
      };

      if(vertical) { delta = -delta; };

      if(delta) {                                
        var value = tagName == "input" ? parseFloat(inp.value) : inp.selectedIndex;

        if(isNaN(value) || value === "") value = Math.min(rMin,rMax);

        value += (delta < 0) ? -step : step;

        userSet = true;
        valueToPixels(getValidValue(value));                        
      };

      return stopEvent(e);
    };                  

    // KEYBOARD events
    function onKeyPress(e) {                        
      e = e || window.event;  
      // Let all non-hijacked keyboard events pass                       
      if((e.keyCode >= 33 && e.keyCode <= 40) || !kbEnabled || e.keyCode == 45 || e.keyCode == 46) {                                 
        return stopEvent(e);
      };
      return true;
    };               

    function onKeyDown(e) {
      if(!kbEnabled) return true;

      e = e || window.event;
      var kc = e.keyCode != null ? e.keyCode : e.charCode;

      if ( kc < 33 || (kc > 40 && (kc != 45 && kc != 46))) return true;

      var value = getValidValue(tagName == "input" ? parseFloat(inp.value) : inp.selectedIndex);

      if( kc == 37 || kc == 40 || kc == 46 || kc == 34) {
        // left, down, ins, page down                                                              
        value -= (e.ctrlKey || kc == 34 ? +maxStep : +step);                                   
      } else if( kc == 39 || kc == 38 || kc == 45 || kc == 33) {
        // right, up, del, page up                                                                  
        value += (e.ctrlKey || kc == 33 ? +maxStep : +step);                                
      } else if( kc == 35 ) {
        // max                                
        value = rMax;                                
      } else if( kc == 36 ) {
        // min                                
        value = rMin;
      };  

      userSet = true;
      valueToPixels(getValidValue(value));

      callback("update");                          

      // Opera doesn't let us cancel key events so the up/down arrows and home/end buttons will scroll the screen - which sucks                        
      preventDefault(e);
    };                                                

    // MOUSE & TOUCH events  

    // Mouseover the slider          
    function onMouseOver(e) {                        
      addClass(outerWrapper, 'fd-slider-hover');
    };  

    // Mouseout of the slider              
    function onMouseOut(e) {
      // Should really check we are not still in the slider
      removeClass(outerWrapper, 'fd-slider-hover');
    };

    // Mousedown on the slider 
    function onMouseDown(e) {
      e = e || window.event;

      // Stop page scrolling
      preventDefault(e);

      // Grab the event target                        
      var targ;                          
      if (e.target) targ = e.target;
      else if (e.srcElement) targ = e.srcElement;
      if(targ.nodeType == 3) targ = targ.parentNode;

      // Are we using touchEvents
      if(e.touches) {                                            
        // Skip gestures                                
        if(e.targetTouches && e.targetTouches.length != 1) {                                        
          return false;
        };

        e = e.touches[0];                                
        touchEvents = true;                                
      };

      // Stop any animation timers
      clearTimeout(timer);
      timer = null;

      // Not keyboard enabled
      kbEnabled = false;

      // User has set a valid value
      userSet   = true;                                      

      // Handle mousedown - initiate drag
      if(targ.className.search("fd-slider-handle") != -1) {                                
        mousePos  = vertical ? e.clientY : e.clientX;
        handlePos = parseInt(vertical ? handle.offsetTop : handle.offsetLeft)||0;                        

        // Set a value on first click even if no movement 
        trackMouse(e);

        if(!touchEvents) {                                    
          addEvent(document, 'mousemove', trackMouse);
          addEvent(document, 'mouseup', stopDrag);
        } else {
          addEvent(document, 'touchmove', trackMouse);
          addEvent(document, 'touchend', stopDrag);  
          // Remove mouseEvents to stop them firing after the touch event
          removeEvent(outerWrapper, "mousedown", onMouseDown);                     
        };                                

        addClass(outerWrapper, 'fd-slider-active');                        
        addClass(document.body, "fd-slider-drag-" + (vertical ? "vertical" : "horizontal"));

        // Wrapper mousedown - initiate animation to click point
      } else {                        
        locate();                                                  

        var posx        = 0,
        sLft        = 0,
        sTop        = 0;

        // Internet Explorer doctype woes
        if (document.documentElement && document.documentElement.scrollTop) {
          sTop = document.documentElement.scrollTop;
          sLft = document.documentElement.scrollLeft;
        } else if (document.body) {
          sTop = document.body.scrollTop;
          sLft = document.body.scrollLeft;
        };

        if (e.pageX)            posx = vertical ? e.pageY : e.pageX;
        else if (e.clientX)     posx = vertical ? e.clientY + sTop : e.clientX + sLft;

        posx -= vertical ? y + Math.round(handle.offsetHeight / 2) : x + Math.round(handle.offsetWidth / 2);                         
        posx = snapToPxValue(posx);                                                        

        // Tween animation to click point
        if(animation == "tween") {
          addClass(outerWrapper, 'fd-slider-active');
          tweenTo(posx);                                                                                     
          // Progressive increment to click point    
        } else if(animation == "timed") {  
          addClass(outerWrapper, 'fd-slider-active');     
          addEvent(document, touchEvents ? 'touchend' : 'mouseup', onDocMouseUp);                                                                                 
          destPos = posx;
          onTimer();
          // Immediate jump to click point 
        } else {
          pixelsToValue(posx);
          //addEvent(document, touchEvents ? 'touchend' : 'mouseup', onMouseUp);                                                      
        };                                                                                   
      };

      return stopEvent(e);                                                      
    };

    // Progressive increment to click point - clear the animation timer and remove the mouseup/touchend event
    function onDocMouseUp( e ) {                
      e = e || window.event;

      preventDefault(e);                        
      removeEvent(document, touchEvents ? 'touchend' : 'mouseup', onDocMouseUp);
      removeClass(outerWrapper, "fd-slider-active");

      clearTimeout(timer);
      timer     = null;
      kbEnabled = true;                             

      return stopEvent(e);
    }; 

    // Mouseup or touchend event on the document to stop drag
    function stopDrag(e) {                                              
      e = e || window.event;

      preventDefault(e);

      if(touchEvents) {                                 
        removeEvent(document, 'touchmove', trackMouse);
        removeEvent(document, 'touchend',   stopDrag);                                  
      } else {
        removeEvent(document, 'mousemove', trackMouse);
        removeEvent(document, 'mouseup',   stopDrag);
      };

      kbEnabled   = true;                        
      removeClass(document.body, "fd-slider-drag-" + (vertical ? "vertical" : "horizontal"));                        
      removeClass(outerWrapper, "fd-slider-active");

      return stopEvent(e);
    }; 

    // Mousemove or touchmove event on the drag handle
    function trackMouse(e) {                                                                      
      e = e || window.event; 

      preventDefault(e);

      if(e.touches) {
        // Skip gestures
        if(e.targetTouches && e.targetTouches.length != 1) {                                        
          return false;
        };                                
        e = e.touches[0];
      };

      pixelsToValue(snapToPxValue(handlePos + (vertical ? e.clientY - mousePos : e.clientX - mousePos))); 

      return false;                                         
    };

    // Returns a value within range
    function getValidValue(value) {
      if(isNaN(value) || value === "") return defaultVal;                        
      else if(value < Math.min(rMin,rMax)) return Math.min(rMin,rMax);
      else if(value > Math.max(rMin,rMax)) return Math.max(rMin,rMax);                         
      return value;                       
    };

    // Increments the slider by "inc" steps
    function increment(inc) {                                       
      var value = getValidValue(tagName == "input" ? parseFloat(inp.value) : inp.selectedIndex);                                              
      userSet   = true;                                                  
      value += inc * step;
      valueToPixels(getValidValue(value));  
    };

    // Attempts to locate the on-screen position of the slider
    function locate(){
      var curleft = 0,
      curtop  = 0,
      obj     = outerWrapper;

      // Try catch for IE's benefit
      try {
        while (obj.offsetParent) {
          curleft += obj.offsetLeft;
          curtop  += obj.offsetTop;
          obj      = obj.offsetParent;
        };
      } catch(err) {};
      x = curleft;
      y = curtop;
    };

    // Used during the progressive animation to click point
    function onTimer() {
      var xtmp = parseInt(vertical ? handle.offsetTop : handle.offsetLeft, 10);
      xtmp = Math.round((destPos < xtmp) ? Math.max(destPos, Math.floor(xtmp - stepPx)) : Math.min(destPos, Math.ceil(xtmp + stepPx)));                  

      pixelsToValue(snapToPxValue(xtmp));
      if(xtmp != destPos) timer = setTimeout(onTimer, steps > 20 ? 50 : 100);
      else {
        kbEnabled = true;
        removeClass(outerWrapper, "fd-slider-active");  

        callback("finalise");
      };
    };

    var tween = function(){
      frame++;
      var c = tweenC,
      d = 20,
      t = frame,
      b = tweenB,
      x = Math.ceil((t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b);

      pixelsToValue(t == d ? tweenX : x);

      if(t!=d) {
        // Call the "move" callback on each animation increment
        callback("move");
        timer = setTimeout(tween, 20);
      } else {
        clearTimeout(timer);
        timer     = null;
        kbEnabled = true;

        removeClass(outerWrapper, "fd-slider-focused"); 
        removeClass(outerWrapper, "fd-slider-active");  

        // Call the "finalise" callback whenever the animation is complete
        callback("finalise");
      };
    };

    function tweenTo(tx){
      kbEnabled = false;
      tweenX    = parseInt(tx, 10);
      tweenB    = parseInt(vertical ? handle.offsetTop : handle.offsetLeft, 10);
      tweenC    = tweenX - tweenB;
      tweenD    = 20;
      frame     = 0;

      if(!timer) { timer = setTimeout(tween, 20); };
    };

    // Is the value passed in valid?
    function checkValue(value) {
      if(isNaN(value) || value === "") {                                                                                          
        userSet = false;
        return defaultVal;                                                
      } else if(value < Math.min(rMin,rMax)) {                                                              
        userSet = false; 
        return Math.min(rMin,rMax);                                 
      } else if(value > Math.max(rMin,rMax)) {                                
        userSet = false;  
        return Math.max(rMin,rMax);                                
      };
      userSet = true;
      return value;
    }

    // Calculates value accoriding to pixel position of slider handle
    function pixelsToValue(px) {                                                                     
      handle.style[vertical ? "top" : "left"] = (px || 0) + "px";
      redrawRange();                 
      var val = getValidValue(scale ? percentToValue(pixelsToPercent(px)) : vertical ? max - (Math.round(px / stepPx) * step) : min + (Math.round(px / stepPx) * step));                                                                                                                                                                         

      setInputValue((tagName == "select" || step == 1) ? Math.round(val) : val);                         
    };

    // Calculates pixel position according to form element value
    function valueToPixels(val) {  
      var value = checkValue(isNaN(val) || val === "" ? (tagName == "input" ? parseFloat(inp.value) : inp.selectedIndex) : val);                                                                                                
      handle.style[vertical ? "top" : "left"] = (scale ? percentToPixels(valueToPercent(value)) : vertical ? Math.round(((max - value) / step) * stepPx) : Math.round(((value - min) / step) * stepPx)) + "px"; 
      redrawRange();                          
      setInputValue(value);                                                                                                                                                                       
    };

    // Rounds a pixel value to the nearest "snap" point on the slider scale
    function snapToPxValue(px) {                             
      if(scale) {                                
        return Math.max(Math.min(rMaxPx, px), rMinPx);                        
      } else {                
        var rem = px % stepPx;
        if(rem && rem >= (stepPx / 2)) { px += (stepPx - rem); } 
        else { px -= rem;  };     

        if(px < Math.min(Math.abs(rMinPx), Math.abs(rMaxPx))) px = Math.min(Math.abs(rMinPx), Math.abs(rMaxPx));
        else if(px > Math.max(Math.abs(rMinPx), Math.abs(rMaxPx))) px = Math.max(Math.abs(rMinPx), Math.abs(rMaxPx));

        return Math.min(Math.max(px, 0), rMaxPx); 
      };       
    };     

    // Calculates a value according to percentage of distance handle has travelled
    function percentToValue(pct) {
      var st = 0, 
      fr = min,
      value;

      for(var s in scale) {                                 
        if(!scale.hasOwnProperty(s)) {
          continue;
        };

        if(pct >= st && pct <= +s ) {
          value = fr + ((pct - st) * (+scale[s] - fr) ) / (+s - st);
        };

        st = +s;
        fr = +scale[s];
      };

      return value;   
    };

    // Calculates the percentage handle position according to form element value
    function valueToPercent(value) {  	  
      var st  = 0, 
      fr  = min, 
      pct = 0;

      for(var s in scale) {
        if(!scale.hasOwnProperty(s)) {
          continue;
        };

        if(value >= fr && value <= +scale[s]){
          pct = st + (value - fr) * (+s - st) / (+scale[s] - fr);
        };

        st = +s; 
        fr = +scale[s];
      };  

      return pct;           
    };

    function percentToPixels(percent) {
      return ((outerWrapper[vertical ? "offsetHeight" : "offsetWidth"] - handle[vertical ? "offsetHeight" : "offsetWidth"]) / 100) * percent;                
    };

    function pixelsToPercent(pixels) {
      return pixels / ((outerWrapper[vertical ? "offsetHeight" : "offsetWidth"] - outerWrapper[handle ? "offsetHeight" : "offsetWidth"]) / 100);
    };

    // Sets the form element with a valid value
    function setInputValue(val) {
      callback("update");

      // If the user has not set this value or has entered an incorrect value then set a class
      // to enable styling of the slider
      if(!userSet) {                                
        addClass(outerWrapper, "fd-slider-no-value");
      } else {
        removeClass(outerWrapper, "fd-slider-no-value");
      };

      if(tagName == "select") {
        try {                                                                          
          val = parseInt(val, 10);                                        
          if(inp.selectedIndex == val) return;
          inp.options[val].selected = true;                                                                             
        } catch (err) {};
      } else {                                                                                                                                                                                                                                                                                                                                   
        val = (min + (Math.round((val - min) / step) * step)).toFixed(precision);                                  
        if(inp.value == val) return;
        inp.value = val;                                 
      };

      updateAriaValues();                        
      callback("change");
    };

    function checkInputValue(value) {                        
      return !(isNaN(value) || value === "" || value < Math.min(rMin,rMax) || value > Math.max(rMin,rMax));                
    };

    function setSliderRange(newMin, newMax) {
      if(rMin > rMax) {
        newMin = Math.min(min, Math.max(newMin, newMax));
        newMax = Math.max(max, Math.min(newMin, newMax));                                
        rMin   = Math.max(newMin, newMax);
        rMax   = Math.min(newMin, newMax);
      } else {
        newMin = Math.max(min, Math.min(newMin, newMax));
        newMax = Math.min(max, Math.max(newMin, newMax));                                
        rMin   = Math.min(newMin, newMax);
        rMax   = Math.max(newMin, newMax);
      };         

      if(defaultVal < Math.min(rMin, rMax)) defaultVal = Math.min(rMin, rMax);
      else if(defaultVal > Math.max(rMin, rMax)) defaultVal = Math.max(rMin, rMax);                        

      handle.setAttribute("aria-valuemin",  rMin);
      handle.setAttribute("aria-valuemax",  rMax);

      checkValue(tagName == "input" ? parseFloat(inp.value) : inp.selectedIndex);                        		
      redraw();
    };

    function redrawRange() {
      if(noRangeBar) {
        return;
      };
      if(vertical) {                       
        rangeBar.style["height"] = (bar.offsetHeight - handle.offsetTop) + "px";
      } else {                                
        rangeBar.style["width"] = handle.offsetLeft + "px"; 
      };			
    };

    function findLabel() {
      var label = false,
      labelList = document.getElementsByTagName('label');
      // loop through label array attempting to match each 'for' attribute to the id of the current element
      for(var i = 0, lbl; lbl = labelList[i]; i++) {
        // Internet Explorer requires the htmlFor test
        if((lbl['htmlFor'] && lbl['htmlFor'] == inp.id) || (lbl.getAttribute('for') == inp.id)) {
          label = lbl;
          break;
        };
      };

      if(label && !label.id) { label.id = inp.id + "_label"; };
      return label;
    };

    function updateAriaValues() {
      handle.setAttribute("aria-valuenow",  tagName == "select" ? inp.options[inp.selectedIndex].value : inp.value);
      handle.setAttribute("aria-valuetext", tagName == "select" ? (inp.options[inp.selectedIndex].text ? inp.options[inp.selectedIndex].text : inp.options[inp.selectedIndex].value) : inp.value);
    };

    function onInputChange(e) {
      userSet = true;
      valueToPixels();
      updateAriaValues();                                                 
    };                  

    function valueSet(tf) {
      userSet = !!tf;
    };

    (function() {                         
      addEvent(inp, 'change', onInputChange);                         
      if(html5Shim || hideInput) { 
        addClass(inp, "fd-form-element-hidden");                                
      };

      // Add stepUp & stepDown methods to input element if using the html5Shim
      if(html5Shim) {
        inp.stepUp   = function(n) { increment(n||1); };
        inp.stepDown = function(n) { increment(n||-1); };
      };

      outerWrapper              = document.createElement('span');
      outerWrapper.className    = "fd-slider" + (vertical ? "-vertical " : " ") + (!html5Shim ? " fd-slider-no-value " : "") + classNames;
      outerWrapper.id           = "fd-slider-" + inp.id;

      wrapper                   = document.createElement('span');
      wrapper.className         = "fd-slider-inner";

      bar                       = document.createElement('span');
      bar.className             = "fd-slider-bar";

      if(!noRangeBar) {
        rangeBar                  = document.createElement('span');
        rangeBar.className        = "fd-slider-range";
      };

      if(fullARIA) {
        handle            = document.createElement('span');                                
        handle.tabIndex = 0;
      } else {
        handle            = document.createElement('a');                                 
        handle.setAttribute("href", "#");
      };

      handle.className          = "fd-slider-handle";                        
      handle.appendChild(document.createTextNode(String.fromCharCode(160)));                         

      outerWrapper.appendChild(wrapper);
      if(!noRangeBar) {
        outerWrapper.appendChild(rangeBar);
      };
      outerWrapper.appendChild(bar);
      outerWrapper.appendChild(handle);

      inp.parentNode.insertBefore(outerWrapper, inp);

      /*@cc_on@*/
      /*@if(@_win32)
      handle.unselectable       = "on";
      if(!noRangeBar) rangeBar.unselectable     = "on";
      bar.unselectable          = "on";
      wrapper.unselectable      = "on";
      outerWrapper.unselectable = "on";
      /*@end@*/                             

      // Add ARIA accessibility info programmatically 
      outerWrapper.setAttribute("role",           "application"); 

      handle.setAttribute("role",           "slider");
      handle.setAttribute("aria-valuemin",  tagName == "select" ? inp.options[0].value : min);
      handle.setAttribute("aria-valuemax",  tagName == "select" ? inp.options[inp.options.length - 1].value : max);                     

      var lbl = findLabel();
      if(lbl) {                                 
        handle.setAttribute("aria-labelledby", lbl.id);
        handle.id = "fd-slider-handle-" + inp.id;
        /*@cc_on
        /*@if(@_win32)
        lbl.setAttribute("htmlFor", handle.id);
        @else @*/
        lbl.setAttribute("for", handle.id);
        /*@end
        @*/
      };

      // Are there page instructions 
      if(document.getElementById(describedBy)) {                                  
        handle.setAttribute("aria-describedby", describedBy);  
      };                                               

      // Is the form element initially disabled
      if(inp.getAttribute("disabled") == true) {                         
        disableSlider(true);
      } else {                                  
        enableSlider(true);
      };                            

      // Does an initial form element value mean the user has set a valid value?
      // Note: This only works onload on IE                         
      if(varSetRules.onvalue) {                                   
        userSet = true;                                  
        checkValue(tagName == "input" ? parseFloat(inp.value) : inp.selectedIndex);
      };

      updateAriaValues();                        
      callback("create");                            
      redraw();                                                                                  
    })();

    return {
      onResize:       function(e) { if(outerWrapper.offsetHeight != sliderH || outerWrapper.offsetWidth != sliderW) { redraw(); }; },
      destroy:        function()  { destroySlider(); },
      reset:          function()  { valueToPixels(); },
      stepUp:         function(n) { increment(Math.abs(n)||1); },
      stepDown:       function(n) { increment(-Math.abs(n)||-1); },
      increment:      function(n) { increment(n); },
      disable:        function()  { disableSlider(); },
      enable:         function()  { enableSlider(); },
      setRange:       function(mi, mx) { setSliderRange(mi, mx); },
      getValueSet:    function() { return !!userSet; },
      setValueSet:    function(tf) { valueSet(tf); },
      ieCheckValue:   function() { if(varSetRules.onvalue) { userSet = true; checkValue(tagName == "input" ? parseFloat(inp.value) : inp.selectedIndex); updateAriaValues(); redraw(); }; }
    };
  }; 

  addEvent(window, "load",   init);
  addEvent(window, "resize", resize);        
  addEvent(window, "unload", unload);

  // Have we been passed JSON within the including script tag
  (function() {
    var scriptFiles       = document.getElementsByTagName('script'),                    
    scriptInner       = String(scriptFiles[scriptFiles.length - 1].innerHTML).replace(/[\n\r\s\t]+/g, " ").replace(/^\s+/, "").replace(/\s+$/, ""),                    
    json              = parseJSON(scriptInner); 

    if(typeof json === "object" && !("err" in json)) {                          
      affectJSON(json);
    };  
  })();

  return {                                           
    createSlider:           function(opts) { createSlider(opts); },                    
    destroyAll:             function() { destroyAllsliders(); },
    destroySlider:          function(id) { return destroySingleSlider(id); },
    redrawAll:              function() { resize(); },
    increment:              function(id, numSteps) { if(!(id in sliders)) { return false; }; sliders[id].increment(numSteps); },
    stepUp:                 function(id, n) { if(!(id in sliders)) { return false; }; sliders[id].stepUp(Math.abs(n)||1); },
    stepDown:               function(id, n) { if(!(id in sliders)) { return false; }; sliders[id].stepDown(-Math.abs(n)||-1); },
    setRange:               function(id, newMin, newMax) { if(!(id in sliders)) { return false; }; sliders[id].setRange(newMin, newMax); },
    addEvent:               addEvent,
    removeEvent:            removeEvent,
    stopEvent:              stopEvent,
    updateSlider:           function(id) { if(!(id in sliders)) { return false; }; sliders[id].reset(); },        
    onDomReady:             function() { onDomReady(); },
    disable:                function(id) { if(!(id in sliders)) { return false; }; sliders[id].disable(); }, 
    enable:                 function(id) { if(!(id in sliders)) { return false; }; sliders[id].enable(); },
    getValueSet:            function() { return getValueSet(); },
    setValueSet:            function(a, tf) { setValueSet(a, tf); },
    setGlobalVariables:     function(json) { affectJSON(json); },
    removeOnload:           function() { removeOnLoadEvent(); }                      
  }
})();             
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
    throw new Error("Must pass a function to bind");
  }
  if(!onElement) {
    throw new Error("Element to bind to not provided");
  }
  if (onElement.tagName.toLowerCase() === "object") {
    if (!onElement.id || onElement.id === "") {
      throw new Error("Flash element must have an ID");
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
  if (!jsPlayer.eventBroker.flashReadyIds[elementId]) {
    window.setTimeout(function () {
      jsPlayer.eventBroker.addFlashEvent(eventName, fun, elementId)
    }, 100);
  } else {
    if (!jsPlayer.eventBroker.flashEvents[elementId]) {
      jsPlayer.eventBroker.flashEvents[elementId] = {};
    }
    document.getElementById(elementId)._addEventListener(eventName, 
                  jsPlayer.eventBroker.flashEvents[elementId][eventName = fun]); 
  }
};
var jsPlayer = jsPlayer || {};

jsPlayer.createEngine = function (engineElement, elementType, argp) {
  "use strict";

  var outObject = {},
      params = argp || {},
      outer = this,
      getProperty, setProperty,
      isFlashElement;

  if (!engineElement) {
    throw new Error("Engine element not provided");
  }

  if (!elementType) {
    throw new Error("Element type not provided");
  } else {
    if (elementType.toLowerCase() === "flash") {
      isFlashElement = true
    }
  }

  //the reason for this nonsense is because flash ExternalInterface does not
  //allow for exposing properties, only functions.  what a fucking mess.
  getProperty = function (p) {
    if (isFlashElement) {
      return engineElement["_" + p]();
    } else {
      return engineElement[p];
    }
  };

  setProperty = function (p, n) {
    if (isFlashElement) {
      engineElement["_" + p](n);
    } else {
      engineElement[p] = n;
    }
  };

  return {
    engineElement: engineElement,

    bind: function (name, fun) {
      jsPlayer.eventBroker.listenFor(name, fun, engineElement);
    },

    play: function () {
      //Thanks a bunch IE!
      if(isFlashElement) {
        engineElement._play();
      } else {
        engineElement.play();
      }
    },

    pause: function () {
      if(isFlashElement) {
        engineElement._pause();
      } else {
        engineElement.pause();
      }
    },

    isPlaying: function () {
      return !getProperty('paused');
    },

    volume: function (n) {
      n = Number(n);
      if (isNaN(n)) {
        return getProperty('volume');
      } else {
        if (n < 0 || n > 1) {
          throw new Error("Volume input must be between 0 and 1.0");
        }
        setProperty('volume', n);
        return this;
      }
    },

    seekTo: function (n) {
      setProperty('currentPosition', n);
    },

    length: function () {
      return getProperty('duration');
    }
  };
};
/*global fdSlider: false, swfObject: false */
var jsPlayer = jsPlayer || {};

jsPlayer.detection = {};

jsPlayer.detection.audio = function(mimeType) {
  var el = document.createElement("audio");
  if (!el.canPlayType) {
    return false;
  }
  if (el.canPlayType(mimeType) === "maybe" || el.canPlayType(mimeType) === "probably") {
    return true;
  } else {
    return false;
  }
};

//jsPlayer.buildHTMLAudio = function(rootElement, url, mimeType) {
  //var el = document.createElement("audio");
  //el.setAttribute("src", url);
  //rootElement.appendChild(el);
  //return el;
//};

jsPlayer.create = function (sourceURL, params) {
  "use strict";
  var controls = {},
      playbackReady,
      mimeType,
      engine,
      elementId,
      outObject = {},
      buildHTMLAudio,
      buildFlash,
      defaultParams = { elementId: "jsPlayer",
                        autostart: false,
                        flashLocation: "jsplayer.swf",
                        controls: { startStop: true, 
                                    scrubber: true, 
                                    volume: true }
      };

  if (!sourceURL) {
    throw new Error("URL of media not provided");
  }

  params = Object.merge(params, defaultParams);
  elementId = params.elementId;

  if (params.mimeType) {
    mimeType = params.mimeType;
  } else {
    mimeType = (function () {
    var audioTypes, retval, match;
    audioTypes = { mp3: "audio/mpeg", mpeg: "audio/mpeg", mpeg3: "audio/mpeg",
                   ogg: "audio/ogg" };

    match = sourceURL.split(".").last();
    if (match && audioTypes[match]) {
      retval = audioTypes[match];
    } else if (params.format && audioTypes[params.format]) {
      retval = audioTypes[params.format];
    } else {
      throw new Error("Can not find media type.  Provide a format member in the parameters object");
    }
      return retval;
    }());
  }

  buildHTMLAudio = function () {
    var node = document.getElementById(elementId),
        el = document.createElement("audio");
    el.setAttribute("src", sourceURL);
    node.appendChild(el);
    return el;
  };

  buildFlash = function () {
    var attrs = {
          width: 1,
          height: 1,
          data: params.flashLocation
        },
        flashVarsObject = {
          checkready: 'jsPlayer.eventBroker.tellFlashTrue',
          onready: 'jsPlayer.eventBroker.flashIsReportingReady',
          allowscriptaccess: 'always',
          url: sourceURL
        },
        flashParams, flashElement;

    if (swfobject.hasFlashPlayerVersion("9.0.0")) {
      flashParams = { flashvars: Object.toQueryString(flashVarsObject) };
      flashElement = swfobject.createSWF(attrs, flashParams, elementId);
      flashElement.setAttribute('name', elementId);
    }
    return flashElement;
  };

  // detect audio engine
  if(params.useNative) {
    engine = jsPlayer.createEngine(buildHTMLAudio(), "Native");
  } else if (params.useFlash) {
    engine = jsPlayer.createEngine(buildFlash(), "Flash");
  } else {
    if (jsPlayer.detection.audio(mimeType)) {
      engine = jsPlayer.createEngine(buildHTMLAudio(), "Native");
    } else {
      engine = jsPlayer.createEngine(buildFlash(), "Flash");
    }
  }

  // construct player controls
  (function () {
    var node = document.getElementById(elementId),
        startStopElement, 
        volumeElement, 
        scrubElement;

    if (outObject.engineType === "Native" && params.useNativeControls) {
      engine.engineElement.setAttribute("controls", "controls");
    } else {
      if (params.controls.startStop) {
        startStopElement = document.createElement("div");
        jsPlayer.domExt.addClass(startStopElement, "startStop");
        jsPlayer.domExt.addClass(startStopElement, "startStopLoading");
        node.appendChild(startStopElement);
        controls.startStop = startStopElement;
      }
      //forego this for now
      //if (params.controls.volume) {
        //volumeElement = document.createElement("input");
        //volumeElement.setAttribute("type", "text");
        //volumeElement.style.display = "none";
        //volumeElement.setAttribute("value", 1);
        //volumeElement.setAttribute("class", "volumeSlider");
        //node.appendChild(volumeElement);
        //controls.volume = volumeElement;
        //fdSlider.createSlider({
          //inp: volumeElement,
          //step: 0.01,
          //maxStep: 0.1,
          //min: 0,
          //max: 1,
          //vertical: true,
          //callbacks: {change: [
            //function (e) {
              //outObject.engine.volume(e.value);
            //}
          //]}
        //});
      //}
      //if (params.controls.scrubber) {
        //scrubElement = document.createElement("input");
        //scrubElement.setAttribute("type", "text");
        //scrubElement.style.display = "none";
        //scrubElement.setAttribute("value", 0);
        //scrubElement.setAttribute("class", "scrubber");
        //node.appendChild(scrubElement);
        //controls.scrubber = scrubElement;
      //}
    }
  }());

  playbackReady = function () {
    if (controls.startStop) {
      jsPlayer.domExt.removeClass(controls.startStop, "startStopLoading");
      jsPlayer.domExt.addClass(controls.startStop, "playerStopped");
      engine.bind('play', function () {
        jsPlayer.domExt.removeClass(controls.startStop, "playerStopped");
        jsPlayer.domExt.addClass(controls.startStop, "playerStarted");
      });
      engine.bind('pause', function () {
        jsPlayer.domExt.removeClass(controls.startStop, "playerStarted");
        jsPlayer.domExt.addClass(controls.startStop, "playerStopped");
      });
      jsPlayer.domExt.bindEvent(controls.startStop, 'click', function () {
        if (engine.isPlaying()) {
          engine.pause();
        } else {
          engine.play();
        }
      });
    }

    //if (controls.scrubber) {
      //fdSlider.destroySlider(controls.scrubber);
      //fdSlider.createSlider({
        //inp: controls.scrubber,
        //step: 1,
        //maxStep: 1,
        //min: 0,
        //max: engine.length()
      //});
    //}

    if (params.autostart) {
      engine.play();
    }
  };

  //event bindings
  engine.bind('loadeddata', playbackReady);

  outObject.engine = engine;
  if (controls) {
    outObject.controls = controls;
  }
  return outObject;
};

