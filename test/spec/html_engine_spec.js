describe("HTML engine", function () {
  var engineElement = document.createElement("audio"),
      engine = jsPlayer.createEngine(engineElement, "native"),
      body = document.getElementsByTagName('body')[0];

  engineElement.setAttribute('src', 'blank.mp3');

  body.appendChild(engineElement);
  it("should properly start playback", function () {
    engine.play();
    expect(engine.isPlaying()).toBeTruthy();
  });

  it("should properly pause playback", function () {
    engine.play().pause();
    expect(engine.isPlaying()).toBeFalsy();
  });

  it("should properly set the volume", function () {
    engine.volume(0.5);
    expect(engine.volume()).toBe(0.5);
  });

  body.removeChild(engineElement);
});
