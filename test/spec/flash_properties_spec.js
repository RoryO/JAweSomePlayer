describe("Flash external properties", function () {
  
  describe("exposed controls", function () {

    it("should have a default volume of 1", function () {
      var flash = document.getElementById("testSWF");
      expect(flash.volume()).toBe(1);
    });

    it("should set the volume properly", function () {
      var flash = document.getElementById("testSWF");
      flash.volume(0.5);
      expect(flash.volume()).toBe(0.5);
    });

    it("should start playback properly", function () {
      var flash = document.getElementById("testSWF");
      flash.play();
      expect(flash.paused()).toBeFalsy();
    });

    it("should properly pause playback", function () {
      var flash = document.getElementById("testSWF");
      flash.pause();
      expect(flash.paused()).toBeTruthy();
    });
  });

  describe("external callbacks", function () {
    it("should fire a callback on volume change", function () {
      var flash = document.getElementById("testSWF");
      testHelpers.volumeChange = function () {
        testHelpers.expectedOutput = "Volume has changed";
      };
      flash.addEventListener('volumechange', 'testHelpers.volumeChange');
      flash.volume(1.0);
      expect(testHelpers.expectedOutput).toBe("Volume has changed");
    });

    xit("should fire a callback when the data has loaded", function () {
      var flash = document.getElementById("testSWF");
      testHelpers.loadDataCallback = function () {
        testHelpers.expectedOutput = "Flash has loaded data";
      };
      flash.addEventListener('loadeddata', 'testHelpers.loadDataCallback');
      flash.load();
      expect(testHelpers.expectedOutput).toBe("Flash has loaded data");
    });
  });
});
