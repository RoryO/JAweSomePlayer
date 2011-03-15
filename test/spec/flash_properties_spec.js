describe("Flash external properties", function () {
  
  describe("exposed controls", function () {

    it("should have a default volume of 1", function () {
      var flash = document.getElementById("testSWF");
      expect(flash._volume()).toBe(1);
    });

    it("should set the volume properly", function () {
      var flash = document.getElementById("testSWF");
      flash._volume(0.5);
      expect(flash._volume()).toBe(0.5);
    });

    it("should start playback properly", function () {
      var flash = document.getElementById("testSWF");
      flash._play();
      expect(flash._paused()).toBeFalsy();
    });

    it("should properly pause playback", function () {
      var flash = document.getElementById("testSWF");
      flash._pause();
      expect(flash._paused()).toBeTruthy();
    });
  });

  describe("external callbacks", function () {
    it("should fire a callback on volume change", function () {
      var flash = document.getElementById("testSWF");
      testHelpers.volumeChange = function () {
        testHelpers.expectedOutput = "Volume has changed";
      };
      flash._addEventListener('volumechange', 'testHelpers.volumeChange');
      flash._volume(1.0);
      expect(testHelpers.expectedOutput).toBe("Volume has changed");
    });

    xit("should fire a callback when the data has loaded", function () {
      var flash = document.getElementById("testSWF");
      testHelpers.loadDataCallback = function () {
        testHelpers.expectedOutput = "Flash has loaded data";
      };
      flash._addEventListener('loadeddata', 'testHelpers.loadDataCallback');
      flash._load();
      expect(testHelpers.expectedOutput).toBe("Flash has loaded data");
    });
  });
});
