package awesome {
  import flash.external.ExternalInterface;
  import flash.events.*;

  public class EventEmitter {
    private static var _eventList:Object = new Object();
    public static var externalInterfaceAvabilabe:Boolean = false;

    public static function registerExternal(eventName:String, functionPath:Function):void {
      if (!_eventList[eventName]) {
        _eventList[eventName] = new Array();
      }
      _eventList[eventName].push(functionPath);
    }

    public static function captureInternalEvent(from:*, ev:Event,
        using:String, ... params):void {
      from.addEventListener(ev, fireEventsFor(using), params);
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
