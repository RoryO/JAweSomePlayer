describe("HTML engine callbacks", function () {
  var p;
  beforeEach(function () {
    p = jsPlayer.create("blank.mp3", {elementId: "testElement"});
  });

  afterEach(function () {
    removePlayer();
  });

  it("should fire callbacks when the volume is set" , function () {
    var e, cb;

    cb = function (volume) {
      e = "Volume is now: " + volume;
    };
    //p.engine.bind('volumeChange', cb);
    p.engine.volume(0.5);
    expect(e).toBe("Volume is now: 0.5");
  });

  it("should fire callbacks when paused", function () {
    var e, cb;
    cb = function () {
      e = "Playback paused!";
    }
    //p.engine.bind('onPause', cb);
    p.engine.play().pause();
    expect(e).toBe("Playback paused!");
  });

  it("should fire callbacks when playing", function () {
    //p.engine.bind('play', function() { testHelpers.expectedOutput = "Playback started!"; });
    p.engine.play();
    expect(testHelpers.expectedOutput).toBe('Playback started!');
  });

  it("should fire callbacks when the time position changes", function () {
    var e, cb;
    cb = function(time) {
      console.log('In callback');
      console.log(time);
      e = "Position is now " + time;
    };
    //p.engine.bind('timeChange', cb);
    p.engine.seekTo(1);
    expect(e).toBe('Position is now 1');
  });

});
