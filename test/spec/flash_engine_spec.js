describe("Flash engine", function () {
  var body = document.getElementsByTagName('body')[0],
      engine;

  engineElement.setAttribute('id', 'testSWF');
  body.appendChild(engineElement);
  swfobject.embedSWF("../flash/jsplayer_debug.swf", 'testSWF', "1", "1", "9.0.0", "", 
      { checkready: testHelpers.tellFlashTrue,
        onready: testHelpers.flashIsReady,
        allowscriptaccess: 'always',
        url: 'blank.mp3'}, {}, {id: 'testSWF'} );
  engine = jsPlayer.engine.create(engineElement, "flash");

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

  //body.removeChild(engineElement);
});
