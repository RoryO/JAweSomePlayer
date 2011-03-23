package awesome {
  import flash.external.ExternalInterface;
  import flash.events.*;

  public class EventEmitter {
    private static var _eventList:Object = new Object();
    public static var _externalInterfaceIsAvailable:Boolean = false;

    public static function get externalInterfaceIsAvailable():Boolean {
      return _externalInterfaceIsAvailable;
    }

    public static function set externalInterfaceIsAvailable(p:Boolean):void {
      _externalInterfaceIsAvailable = p;
    }

    public static function registerExternal(eventName:String, functionPath:String):void {
      if (!_eventList[eventName]) {
        _eventList[eventName] = new Array();
      }
      _eventList[eventName].push(functionPath);
    }

    public static function loadedDataFromMedia(e:Event):void {
      fireEvent('loadeddata');
    }

    public static function fireEventsFor(eventName:String, ... params):void {
      if (_eventList[eventName]) {
        _eventList[eventName].forEach(fireEvent);
      }
    }

    private static function fireEvent(eventPath:String, ... params):void {
      ExternalInterface.call(eventPath);
    }
  }
}
