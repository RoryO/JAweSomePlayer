package {
  import flash.display.Sprite;

  public class JAwesomePlayer extends Sprite {
    import flash.external.ExternalInterface;
    import awesome.SoundManager;
    import awesome.EventEmitter;
    import flash.events.*;

    private var _sm:SoundManager;
    private var _jsReady:Boolean = false;

    public function JAwesomePlayer() {
      //Sometimes one or the other is fired and we don't know why
      //So we'll handle both and remove the events when one finishes
      if (!root.loaderInfo.parameters.url) {
        throw new Error("Need a url of a media file to play");
      }
      _sm = new SoundManager(root.loaderInfo.parameters.url);
      loaderInfo.addEventListener(Event.INIT, waitForExternalAvail);
      loaderInfo.addEventListener(Event.COMPLETE, waitForExternalAvail);
      CONFIG::debug {
        import ominds.Firebug;
        Firebug.connect(root);
      }
    }

    private function waitForExternalAvail(... params):void {
      import flash.utils.Timer;
      var t:Timer = new Timer(100, 1);
      t.addEventListener("timer", waitForExternalAvail);
      if(!ExternalInterface.available) {
        t.start();
        return;
      }
      if (!loaderInfo.parameters.checkready) {
        throw new Error("must pass a checkready javascript function reference");
      }
      _jsReady = ExternalInterface.call(loaderInfo.parameters.checkready);
      if(!_jsReady) {
        t.start();
        return;
      } else {
        loaderInfo.removeEventListener(Event.INIT, waitForExternalAvail);
        loaderInfo.removeEventListener(Event.COMPLETE, waitForExternalAvail);
        ExternalInterface.marshallExceptions = true;
        EventEmitter.externalInterfaceReady = true;
        loadExternalCallbacks();
      }
    }

    private function loadExternalCallbacks():void {
      ExternalInterface.addCallback('volume', _sm.volume);
      ExternalInterface.addCallback('play', _sm.play);
      ExternalInterface.addCallback('pause', _sm.pause);
      ExternalInterface.addCallback('isPlaying', _sm.isPlaying);
      ExternalInterface.addCallback('addEventlistener', EventEmitter.registerExternal);
      ExternalInterface.call(loaderInfo.parameters.onready);
    }

  }
}
