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

    describe("indexOf", function () {

      it("should return the correct index properly", function () {
        expect(arr.indexOf("four")).toEqual(4);
      });

      it("should return -1 if the element does not exist", function () {
        expect(arr.indexOf("nothing")).toEqual(-1);
      });

    });

    describe("isArray", function () {
      it("should successfully detect an array", function () {
        expect(Array.isArray(arr)).toBeTruthy();
      });

      it("should not successfully detect an object", function () {
        expect(Array.isArray({0: "zero", 1: "one"})).toBeFalsy();
      });

      it("should not successfully detect a string", function () {
        expect(Array.isArray("something")).toBeFalsy();
      });

      it("should not successfully detect a number", function () {
        expect(Array.isArray(0)).toBeFalsy();
      });

      it("should not successfully detect NaN", function () {
        expect(Array.isArray(NaN)).toBeFalsy();
      });

      it("should not successfully detect undefined", function () {
        expect(Array.isArray(undefined)).toBeFalsy();
      });
    })
  });
});
