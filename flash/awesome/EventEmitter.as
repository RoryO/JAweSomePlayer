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
      CONFIG::debug {
        trace("adding " + eventName + " with " + functionPath);
      }
      _eventList[eventName].push(functionPath);
    }

    public static function loadedDataFromMedia(e:Event):void {
      fireEventsFor('loadeddata');
    }

    public static function fireEventsFor(eventName:String, ... params):void {
      CONFIG::debug {
        trace("firing " + eventName);
      }
      if (_eventList[eventName]) {
        _eventList[eventName].forEach(fireEvent);
      }
    }

    public static function dumpEventList():String {
      var retval:String = "";
      for(var n:String in _eventList) {
        retval += n + ": \n";
        retval += "Number of events is: " + _eventList[n].length + "\n";
        retval += _eventList[n].toString();
        retval += "\n";
      }
      return retval;
    }

    private static function fireEvent(eventPath:String, ... params):void {
      ExternalInterface.call(eventPath);
    }
  }
}
