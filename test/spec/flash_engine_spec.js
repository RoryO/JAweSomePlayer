describe("Flash full stack", function () {
  var p;
  it("should embed correctly", function () {
    p = jsPlayer.create("blank.mp3", 
          {useFlash: true, elementId: "testSWF", flashLocation: "../flash/jsplayer_debug.swf"});
    waitsFor(function () {
      return jsPlayer.eventBroker.flashReadyIds["testSWF"];
    }, "Flash never reported ready", 10000);
  });

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

  //it("should fire callbacks on playback", function () {
    //p.engine.bind('onplay', function () { 
      //testHelpers.expectedOutput = "Playback fired";
    //});
    //p.engine.play();
    //expect(testHelpers.expectedOutput).toBe("Playback fired");
  //});

  //it("should fire callbacks on pause", function () {
    //p.engine.bind('onpause', function () {
      //testHelpers.expectedOutput = "Playback paused";
    //});
    //p.engine.pause();
    //expect(testHelpers.expectedOutput).toBe("Playback Paused");
  //});

  //it("should fire callbacks on volume change", function () {
    //p.engine.bind('volumechange', function () {
      //testHelpers.expectedOutput = 'Volume changed';
    //});
    //p.engine.volume(1.0);
    //expect(testHelpers.expectedOutput).toBe("Volume changed");
  //});

  
});
