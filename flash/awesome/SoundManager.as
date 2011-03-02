package awesome {
  public class SoundManager {
    import flash.media.Sound;
    import flash.media.SoundChannel;
    import flash.media.SoundTransform;
    import flash.net.URLRequest;
    import flash.events.*;

    private var _volume:Number = 1;
    private var _sound:Sound = new Sound();
    private var _transform:SoundTransform = new SoundTransform();
    private var _channel:SoundChannel;
    private var _soundPosition:Number = 0;
    private var _isPlaying:Boolean = false;

    public function SoundManager(locationUrl:String, autostart:Boolean = false) {
      _sound.load(new URLRequest(locationUrl));
      _sound.addEventListener(Event.OPEN,
          EventEmitter.captureFlashEvent);
      //_sound.addEventListener(Event.PROGRESS,
          //EventEmitter.captureFlashEvent);
      _sound.addEventListener(Event.COMPLETE,
          EventEmitter.captureFlashEvent);
    }

    public function play():void {
      _channel = _sound.play(_soundPosition);
      _isPlaying = true;
      EventEmitter.fireEventsFor("play");
    }

    public function pause():void {
      _soundPosition = _channel.position;
      _channel.stop();
      _isPlaying = false;
      EventEmitter.fireEventsFor("pause");
    }

    public function isPlaying():Boolean {
      return _isPlaying;
    }

    public function isPaused():Boolean {
      return !_isPlaying;
    }

    public function volume(n:Number = undefined):* {
      if (n) {
        if (n > 1.0 || n < 0.0) {
          throw new Error("Volume must be between 0 and 1.0")
        } else {
          _transform.volume = n;
          if (_channel) {
            _channel.soundTransform = _transform;
          }
          EventEmitter.fireEventsFor("volumechange");
        }
      } else { return _transform.volume; }
    }

  }
}
