describe("Flash callbacks", function () { 
  afterEach(function() {
    testHelpers.expectedOutput = "";
  });

  it("should fire callback when playing has started", function () {
    var e = document.getElementById("testSWF");
    testHelpers.playCallback = function () {
      testHelpers.expectedOutput = "Playing has started";
    };
    e._addEventListener('play', 'testHelpers.playCallback'); 
    e._play();
    expect(testHelpers.expectedOutput).toBe("Playing has started");
  });

  it("should fire callback when playing has paused", function () {
    var e = document.getElementById("testSWF");
    testHelpers.pauseCallback = function () {
      testHelpers.expectedOutput = "Playing has paused";
    };
    e._addEventListener('pause', 'testHelpers.pauseCallback');
    e._play();
    e._pause();
    expect(testHelpers.expectedOutput).toBe("Playing has paused");
  });

  it("should fire callback when volume has changed", function () {
    var e = document.getElementById("testSWF");
    testHelpers.volumeChangeCallback = function () {
      testHelpers.expectedOutput = "Volume has changed";
    };
    e._addEventListener('volumechange', 'testHelpers.volumeChangeCallback');
    e._volume(0.5);
    expect(testHelpers.expectedOutput).toBe("Volume has changed");
  });

});
