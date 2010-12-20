describe("Player engine", function () {
  var playerElement = document.createElement("div");
  
  (function () {
    playerElement.setAttribute("id", "testElement");
    playerElement.style.display = "none";
    document.body.appendChild(playerElement);
  }());

  var removePlayer = function () {
    playerElement.innerHTML = "";
  }

  describe("Engine access methods", function () {
    var p;
    beforeEach(function () {
      p = jsPlayer("blank.mp3", {elementId: "testElement"});
    });

    afterEach(function () {
      removePlayer()
    });

    it("should properly start playback", function () {
      p.engine.play();
      expect(p.engine.isPlaying()).toBeTruthy();
    });
  });

  describe("Engine callbacks", function () {
    var p;
    beforeEach(function () {
      p = jsPlayer("blank.mp3", {elementId: "testElement"});
    });

    afterEach(function () {
      removePlayer();
    });

    it("should fire callbacks when the volume is set" , function () {
      var e, cb;

      cb = function (volume) {
        e = "Volume is now: " + volume;
      }
      p.engine.bind('volumeChange', cb);
      p.engine.volume(0.5);
      expect(e).toBe("Volume is now: 0.5");
    });

  })
})
