package {
  import flash.display.Sprite;
  public class JAwesomePlayer extends Sprite {
    import flash.external.ExternalInterface;
    import awesome.EventEmitter;

    private var _eventEmitter:EventEmitter = new EventEmitter();
    public function JAwesomePlayer() {
      if(ExternalInterface.available) {
        ExternalInterface.addCallback('addEventListener', _eventEmitter.addEventListener);
      }
    }
  }
}
