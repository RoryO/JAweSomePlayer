describe("ECMAScript 5 new methods", function () {

  describe("Array methods", function () {
    var arr;

    beforeEach(function () {
      arr = ["zero", 1, "two", 3, "four", 5];
    });

    describe("filter", function () {
      it("should filter an array correctly", function () {
        var fil = function (e) {
          if (typeof(e) === "string") {
            return e;
          }
        };
        expect(arr.filter(fil)).toEqual(["zero", "two", "four"]);
      });
    });

    describe("indexOf", function() {

      it("should return the correct index properly", function () {
        expect(arr.indexOf("four")).toEqual(4);
      });

      it("should return -1 if the element does not exist", function () {
        expect(arr.indexOf("nothing")).toEqual(-1);
      });

    });
  });
});
