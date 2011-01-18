Communicating with the container (Browser)
===

Flash uses a static class [ExternalInterface]:(http://www.adobe.com/livedocs/flash/9.0/ActionScriptLangRefV3/flash/external/ExternalInterface.html) for basic in-out with the browser. Two methods are appropriate: call and addCallback.  Call is a string that is the full object name of the javascript function to call, with additional arguments to pass to the JS function.  addCallback exposes an internal Flash method to the browser.  
Caveat-- get/set methods are NOT supported, so you can't expose properties.  Need to expose a method where if zero arguments are passed, return property, otherwise set property.  Dumb.

Ensuring Flash is ready
===

This is dumb as fucking hell.  Flash should do this for you, but nope!
This came about because I was running into issues where Jasmine would
mysteriously fail all tests regarding Flash.  Digging deeper, we notice that the entire
Jasmine suite is loaded, ready, and running tests before Flash is done
setting up and exposing the ExternalInterface calls, particularly in
newer browsers with really fast JS engines.  What we need to do is not
run Jasmine tests until Flash is done doing whatever.  This is harder
than it should be.

Eventually I figured out working like this:

Flash has two events on any loaded object, INIT and COMPLETE.  Some
discussion found a flaw in Flash in some browsers where one event would
fire and not the other, so we should hook both of them.  In Flash
everything about the current state of the loaded top object is in
root.loaderInfo, so we hook root.loaderInfo.INIT and root.loaderInfo.COMPLETE.

Because one or the other can fire, we need to ensure later that they
aren't fired again if Flash works correctly, so we'll unhook them with
removeEventListener.

The actual testing of Flash communicating is clever if a bit
clumsy.  We hook the loading events to a method that checks to see if 1)
the exeternalinterface is available and 2) if calling an external
javascript function is successful.  If neither of these are true, delay
100ms and call itself again until they both are true.  We check 1) by
simply querying ExternalInterface.available.  We check 2) by
requiring a 'checkready' function reference passed in flashvars.  This
contains the full string path of a function object that does nothing but
return something truthy.  We set that return value to a variable in
ActionScript, so when that's true we'll continue setting up
ExternalInterface.

The last bit of setting up ExternalInterface removes the INIT and
COMPLETE handlers, exposing any registered events through
addEventListener, and finally calls an onready function passed through
flashvars if there is one.

Phew.  What a shitload of fuck.


