package {
  import flash.display.Sprite;

  public class JAwesomePlayer extends Sprite {
    import flash.external.ExternalInterface;
    import awesome.SoundManager;
    private var _sm:SoundManager = new SoundManager();
    public function JAwesomePlayer() {
      if(ExternalInterface.available) {
        ExternalInterface.addCallback('volume', _sm.volume);
      }
    }
  }
}
