describe("Flash full stack", function () {
  var p;

  it("should embed correctly", function () {
    //we don't preload so we have time to bind a load event before loading

    p = jsPlayer.create("blank.mp3", 
                        {useFlash: true, elementId: "testSWF", 
                          flashLocation: "../flash/jsplayer_debug.swf", preload:'none'});
    waitsFor(function () {
      return jsPlayer.eventBroker.flashReadyIds.testSWF;
    }, "flash reporting ready", 10000);
  });

  it("should fire callbacks when loading", function () {
    p.engine.bind('loadeddata', function () {
      testHelpers.expectedOutput = "loadeddata called";
    });
    p.engine.load();
    //we have to wait around a bit because it takes some time to load data
    waitsFor(function () {
      return testHelpers.expectedOutput === "loadeddata called";
    }, "loadeddata was never called", 10000);
  });

  it("should have created default controls", function () {
    var nodes = document.getElementById("testSWF");
  });

  describe("methods and properties", function () {
    it("should have a default starting volume", function () {
      expect(p.engine.volume()).toBe(1.0);
    });

    it("should set the volume properly", function () {
      p.engine.volume(0.5);
      expect(p.engine.volume()).toBe(0.5);
    });

    it("should properly start playback", function () {
      p.engine.play();
      expect(p.engine.isPlaying()).toBeTruthy();
    });

    it("should properly pause playback", function () {
      p.engine.pause();
      expect(p.engine.isPlaying()).toBeFalsy();
    });
  });

  describe("callbacks", function () {
    beforeEach(function () {
      testHelpers.expectedOutput = "";
    });

    it("should fire callbacks on playback", function () {
      p.engine.pause();
      p.engine.bind('play', function () { 
        testHelpers.expectedOutput = "Playback fired";
      });
      p.engine.play();
      expect(testHelpers.expectedOutput).toBe("Playback fired");
      p.engine.pause();
    });

    it("should fire callbacks on pause", function () {
      p.engine.bind('pause', function () {
        testHelpers.expectedOutput = "Playback paused";
      });
      p.engine.pause();
      expect(testHelpers.expectedOutput).toBe("Playback paused");
    });

    it("should fire callbacks on volume change", function () {
      p.engine.bind('volumechange', function () {
        testHelpers.expectedOutput = 'Volume changed';
      });
      p.engine.volume(1.0);
      expect(testHelpers.expectedOutput).toBe("Volume changed");
    });
  });
});
