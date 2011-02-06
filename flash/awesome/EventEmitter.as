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

    public static function registerExternal(eventName:String, functionPath:String):void {
      if (!_eventList[eventName]) {
        _eventList[eventName] = new Array();
      }
      _eventList[eventName].push(functionPath);
      CONFIG::debug {
        ExternalInterface.call('console.log', 'Added a new function:');
        ExternalInterface.call('console.log', _eventList);
      }
    }

    public static function captureFlashEvent(e:Event):void {
      EventEmitter.fireEventsFor(e.type);
    }

    public static function fireEventsFor(eventName:String, ... params):void {
      CONFIG::debug {
        ExternalInterface.call('console.log', 'Firing events for ' + eventName);
        ExternalInterface.call('console.log', _eventList[eventName]);
      }
      if (_eventList[eventName]) {
        _eventList[eventName].forEach(fireEvent);
      }
    }

    private static function fireEvent(eventPath:String, ... params):void {
      CONFIG::debug {
        ExternalInterface.call('console.log', 'Should be firing ' + eventPath);
      }
      ExternalInterface.call(eventPath);
    }
  }
}
