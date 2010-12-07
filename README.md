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
[homepage]("http://metricgnome.net/awesome/jawesomeplayer") with latest
version and documentation.

HOW TO USE IT QUICKLY
===
Copy the example CSS, images and javascripts from the respective
directories to your environment.  The CSS provided expectes images to
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
paramaters useFlash or useNative will force using the Flash or native
media elements respectively.  The player will also build a set of controls 
as divs underneath as playback controls.


OPTIONS OBJECT
===

elementID: Default: "jsPlayer".

Set this to the element ID that you wish to wrap around.

useFlash: Default: undefined.

Set to something truthy to use only the  Flash playback engine.  If combined 
with useNative, will have no effect.

useNative: Default: undefined.

Set to something truthy to use only the native browser playback engine.  If 
combined with useFlash, will have no effect.


UPCOMING
===
Video support

Media playlists

#### Thanks to the [SoundCloud API player](https://github.com/soundcloud/soundcloud-custom-player) for insipiration
(c) Rory O'Connell
