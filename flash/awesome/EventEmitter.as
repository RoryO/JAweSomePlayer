package awesome {
  import flash.external.ExternalInterface;
  public class EventEmitter {
    private var _eventList:Object;

    public function EventEmitter() {
      _eventList = new Object();
    }

    public function addEventListener(eventName:String, functionPath:Function):void {
      if (!_eventList[eventName]) {
        _eventList[eventName] = new Array();
      }
      _eventList[eventName].push(functionPath);
    }

    public function fireEventsFor(eventName:String):void {
      if (_eventList[eventName]) {
        for (var eventPath:String in _eventList[eventName]) {
          ExternalInterface.call(eventPath);
        }
      }
    }
  }
}
