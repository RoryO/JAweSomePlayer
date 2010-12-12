describe("Non-standard Array functions", function () {
  var arr;

  beforeEach(function () {
    arr = ["zero", 1, "two", 3, "four"];
  });

  it("last", function () {
    expect(arr.last()).toEqual("four");
  });

  it("cycle", function () {
    expect(arr.cycle()).toEqual("zero");
    expect(arr).toEqual([1, "two", 3, "four", "zero"]);
  });
});

describe("DOM element additions", function () {
  var el;
  beforeEach(function () {
    el = document.createElement("div");
    el.className = "one two three four five";
  });

  it("should return a array of element classes", function () {
    expect(el.classArray()).toEqual(["one", "two", "three", "four", "five"]);
  })

  it("should properly find a class name", function () {
    expect(el.hasClass("three")).toBeTruthy();
    expect(el.hasClass("nothing")).toBeFalsy();
  })

  it("should be able to add classes", function () {
    el.addClass("newClass");
    expect(el.className).toEqual("one two three four five newClass");
  })

  it("should be able to remove classes", function () {
    el.removeClass("three");
    expect(el.className).toEqual("one two four five");
  })


});
