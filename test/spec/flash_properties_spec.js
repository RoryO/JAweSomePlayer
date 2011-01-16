describe("Flash external properties", function () {

  describe("exposed controls", function () {
    it("should have a default volume of 1", function () {
      var flash = document.getElementById('testSWF');
      expect(flash.volume()).toBe(1);
    });

    it("should set the volume properly", function () {
      var flash = document.getElementById('testSWF');
      flash.volume(0.5);
      expect(flash.volume()).toBe(0.5);
    });
  });
});
