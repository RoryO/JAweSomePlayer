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

});
