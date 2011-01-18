package awesome {
  public class SoundManager {
    import flash.media.Sound;
    import flash.media.SoundChannel;
    import flash.media.SoundTransform;
    import flash.net.URLRequest;

    private var _volume:Number = 1;
    private var _sound:Sound = new Sound();
    private var _transform:SoundTransform = new SoundTransform();
    private var _channel:SoundChannel;
    private var _soundPosition:Number = 0;
    private var _isPlaying:Boolean = false;

    public function SoundManager(locationUrl:String, autostart:Boolean = false) {
      _sound.load(new URLRequest(locationUrl));
      if(autostart) {
        this.play();
      }
    }

    public function play():void {
      _channel = _sound.play(_soundPosition);
      _isPlaying = true;
    }

    public function pause():void {
      _soundPosition = _channel.position;
      _channel.stop();
      _isPlaying = false;
    }

    public function isPlaying():Boolean {
      return _isPlaying;
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
        }
      } else { return _transform.volume; }
    }

  }
}
