package awesome {
  public class SoundManager {
    private var _volume:Number = 1;
    public function SoundManager() {
    }

    public function volume(n:Number = undefined):* {
      if (n) {
        _volume = n;
      } else {
        return _volume;
      }
    }
    
  }
}
