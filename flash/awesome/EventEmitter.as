package awesome {
  import flash.external.ExternalInterface;
  import flash.events.*;

  public class EventEmitter {
    private static var _eventList:Object = new Object();
    private static var _eventTranslators:Object = {
      OPEN: 'loadeddata',
      PROGRESS: '',
      COMPLETE: ''
    };

    public static var _externalInterfaceIsAvabilabe:Boolean = false;

    public static function get externalInterfaceIsAvabilabe():Boolean {
      return _externalInterfaceIsAvabilabe;
    }

    public static function set externalInterfaceIsAvabilabe(n:Boolean):void {
      _externalInterfaceIsAvabilabe = n;
    }

    public static function registerExternal(eventName:String, functionPath:Function):void {
      if (!_eventList[eventName]) {
        _eventList[eventName] = new Array();
      }
      _eventList[eventName].push(functionPath);
    }

    public static function captureFlashEvent(e:Event):void {
      EventEmitter.fireEventsFor(e.type);
    }

    public static function fireEventsFor(eventName:String, ... params):void {
      if (_eventList[eventName]) {
        for (var eventPath:String in _eventList[eventName]) {
          ExternalInterface.call(eventPath, params);
        }
      }
    }
  }
}
