package {
  import flash.display.Sprite;

  public class JAwesomePlayer extends Sprite {
    import flash.external.ExternalInterface;
    import awesome.SoundManager;
    import flash.events.*;

    private var _sm:SoundManager = new SoundManager();
    private var _jsReady:Boolean = false;

    public function JAwesomePlayer() {
      //Sometimes one or the other is fired and we don't know why
      //So we'll handle both and remove the events when one finishes
      loaderInfo.addEventListener(Event.INIT, waitForExternalAvail);
      loaderInfo.addEventListener(Event.COMPLETE, waitForExternalAvail);
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
      _jsReady = ExternalInterface.call(root.loaderInfo.parameters.checkready);
      if(!_jsReady) {
        t.start();
        return;
      } else {
        loaderInfo.removeEventListener(Event.INIT, waitForExternalAvail);
        loaderInfo.removeEventListener(Event.COMPLETE, waitForExternalAvail);
        loadExternalCallbacks();
      }
    }

    private function loadExternalCallbacks():void {
      ExternalInterface.addCallback('volume', _sm.volume);
      ExternalInterface.call(root.loaderInfo.parameters.onready);
    }
  }
}
