JAweSomePlayer 1.0 * 10\*\*-10

WHAT IS IT
===

JAweSomePlayer is a pure Javascript library to assist in playing media files 
with as little effort as possible to the web developer.  It will utilize HTML5 
media elements and tags if they are available as a playback engine, otherwise 
it will fall back to Flash as the playback engine.  The actual controls are 
done completely in HTML regardless of playback engine.  It does not require any
external dependencies or libraries such as jQuery or Prototype, although using
a library to initialize the player is highly recommended due to these 
libraries taking the pain out of messing with each browser's DOM.

JAweSomePlayer is licensed under the BSD 3-clause license.

Source at [Github]("http://github.com/RoryO/jawesomeplayer"), with a pretty
[homepage]("http://metricgnome.net/awesome/jawesomeplayer") containing latest
version and documentation.

HOW TO USE IT QUICKLY
===
Copy the example CSS, images and javascripts from the respective
directories to your environment.  The CSS provided expects images to
reside in ../images relative to the CSS file.

Create an empty DIV in your document where you want the player and, optionally,
give the DIV an ID.  If you don't need different types of players and only 
have one player per page, you can give the DIV an ID of \#jsPlayer for 
automatic configuration.
    <div id="myPlayer"></div>

Include the player library using the script tag, preferably at 
[the bottom](http://developer.yahoo.com/performance/rules.html#js_bottom) of 
the document.
    <script src="/js/js_player.js"></script>

After the script has been loaded, create a new player object in
Javascript.  This is done with the jsPlayer() function.  The first argument 
is the URL of the media file, the second parameter is an options object for 
controlling how and where the player is built (see [options object](#options))

You can do this with a window.onload event, however this is best done after the
DOM is loaded to ensure JAweSomePlayer can find the ID and construct the elements 
needed.  Utilizing a proven library will take the pain out of this for you.

With [jQuery](http://jquery.org)
    jQuery(document).ready(function() {
      var player = jsPlayer("http://localhost/my_file.mp3", {elementID: "myPlayer"})
    })

[Prototype](http://prototypejs.org)
    Event.observe('dom:loaded', function() {
      var player = jsPlayer("http://localhost/my_file.mp3", {elementID:"myPlayer"})
    })

The library will automatically attempt to determine the MIME type of
the media file and if the browser can play it natively or not.  If
the browser can play it back natively, it will use the native HTML tag
element and place it as the first child of the div ID.  If
the browser cannot play it natively, it will automatically fall back to
an embedded 1x1 Flash player as the first children of the div
ID.  If the automatic detection proves buggy or unreliable, the options
parameters useFlash or useNative will force using the Flash or native
media elements respectively.  The player will also build a set of controls 
as divs underneath as playback controls.


OPTIONS OBJECT
===

elementId: Default: "jsPlayer".

Set this to the element ID that you wish to wrap around.

useFlash: Default: undefined.

Set to something truthy to use only the Flash playback engine.  If combined 
with useNative, will have no effect.

useNative: Default: undefined.

Set to something truthy to use only the native browser playback engine.  If 
combined with useFlash, will have no effect.

useNativeControls: Default: undefined.

Set to something truthy to use the native OS playback controls of the
media element instead of constructing an HTML interface.  Does not work
with Flash.

controls: 

Default: {startStop: true, scrubber: true, volume: true}

Set any of the elements to something falsy if you don't want to build
that set of controls.  You can still use the engine to manipulate the
playback.


CONTROLLING THE MEDIA
===
The jsPlayer function is mostly just a constructor function, deciding what
type of playback element to use and creating the relevant elements,
constructing the HTML controls and initializing the playback engine.
The playback engine is a gateway object that routes external method
calls to the playback element.  It is very strongly recommended not to 
manipulate the playback element itself, as it could cause the engine to 
fall out of sync with the state of the playback element.  Instead, use the 
exposed methods on the engine object.  The engine is accessed through
the engine property of the return object called from the jsPlayer()
constructor, i.e
    var player = jsPlayer("awesome.mp3");
    player.engine.play();

You can also register callbacks for all of the events handled by the
engine.  Register a new event with the .bind method on the engine.
    player.engine.bind('timeChange', function (t) { console.log('Time
changed to ' + t)});


ENGINE CONTROL METHODS
===
play(): Starts playback
pause(): Pauses playback
volume(n): Changes the volume, must be between 0 and 1.0

ENGINE PROPERTIES
===
isPlaying(): Boolean if engine is playing
volume(): Decimal value of the current volume
currentPosition(): Current playback position in seconds


ENGINE CALLBACKS
===
volumeChange: When the volume has changed.  Passes the new value of the
volume in decimal form between 0 and 1 to the callback i.e. 0.34.

timeChange: When the player element reports that the playback position
has changed. Passes the new value of the time reported by the playback
element in seconds.

onPlay: When player state moved from paused to playing.

onPause: When player state is moved from playing to pause.


CONTRIBUTING
===

Bug fixes and code simplifications are very welcome.  Adding features
should be discussed on the Github project page first.  Contributing is
standard Github procedure to make things simpler for everyone

-Fork the project on Github
-Perform the work on your own branch
-Create a working test for the work you did if anything changed
-Ensure all the tests pass
-Rebuild the javascript files by running 'rake javascripts' or the flash
component by running 'rake compile'
-Push back to Github
-If it does not already exist, open a bug or feature ticket report on the 
Github page describing the work
-Submit a pull request with your branch

QUESTIONS
===
Q: Why not use jQuery or something similar?

A: jQuery is immensely popular for sure, but not everybody uses it.
Some like Prototype for it's class structure, YUI for the ease of
developing small applets, Dojo for constructing an interface
rapidly, Objective-J for a full stack app framework, and so forth.  
It's not my place to hoist these choices on someone. Furthermore, 
with Javascript being put into a great deal of applications outside the 
browser as of late, I wanted to learn how to wrangle Javascript correctly 
where a browser library is not available.

Q: How do I make unique players?

A: jAweSomePlayer is centered around a DOM id, and each instance only
manipulates the children of that id.  This naturally provides a unique
namespace for CSS.  For example

    .playerStarted {
      background-image: url("/images/player_started.png");
    }

    .playerStopped {
      background-image: url("/images/player_stopped.png");
    }

    #largePlayer {
      font-size: 150%;
      font-weight: 500;
    }

    #largePlayer .playerStarted {
      background-image: url("/images/player_started_large");
    }

    #largePlayer .playerStopped {
      background-image: url("/images/player_stopped_large.png")
    }

The same technique can also be used for providing a class of players,
such as one for video and one for audio and styled appropriately in the
CSS file.

    <div id="videoStream" class="vidPlayer"></div>
    <div id="radioPlayer" class="audioPlayer"></div>

UPCOMING
===
Video support
Media playlists

#### Many many many thanks to the absolutely awesome [Unobtrusive Javascript Slider](http://www.frequency-decoder.com/2010/11/18/unobtrusive-slider-control-html5-input-range-polyfill), without which this would never have gotten as far as it did.
#### Thanks to the [SoundCloud API player](https://github.com/soundcloud/soundcloud-custom-player) for inspiration.

(c) Rory O'Connell
