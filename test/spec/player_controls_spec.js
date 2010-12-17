describe("Player UI", function () {
  var playerElement;
  beforeEach(function () {
    playerElement = document.createElement("div");
    playerElement.setAttribute("id", "testElement");
    playerElement.style.display = "none;";
    document.getElementsByTagName("body")[0].appendChild(playerElement);
  });

  afterEach(function () {
    document.getElementsByTagName("body")[0].removeChild(playerElement);
  })

  describe("Start and stop button", function () {
    it("should default to stopped", function () {
      var p = jsPlayer("nothing.mp3", {elementId: "testElement"});
      expect(p.engine.isPlaying()).toBeFalsy();
      expect(p.controls.startStop.className).toEqual("startStop playerStopped");
    });

    it("should be playing when passed autostart", function () {
      var p = jsPlayer("nothing.mp3", {elementId: "testElement", autostart: true});
      expect(p.engine.isPlaying()).toBeTruthy();
      expect(p.controls.startStop.className).toEqual("startStop playerStarted");
    });
  });
});
