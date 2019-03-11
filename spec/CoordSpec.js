describe("Coord", function() {
  var coord;

  beforeEach(function() {
    coord = new Coord(1, 2);
  });

  it("should have an x property", function() {
    expect(coord.x).toEqual(1);
  });

  it("should have a y property", function() {
    expect(coord.y).toEqual(2);
  });


});

describe("Line", function() {
  var line;

  beforeEach(function() {
    line = new Line(new Coord(1, 2), new Coord(5, 4));
  });

  it("the line should have an x2 of 5", function() {
    expect(line.x2).toEqual(5);
  });

  it("getEquation method returns object with coeff of 0.5 and offset of 1.5", function() {
    expect(line.getEquation().coefficient).toEqual(0.5);
    expect(line.getEquation().offset).toEqual(1.5);
  });

});

describe("getCoordLineYDiff", function() {

  beforeEach(function() {
    line = new Line(new Coord(1, 2), new Coord(5, 4));
  });

  it("it should return -1", function() {
    coord = new Coord(1, 1)
    expect(getCoordLineYDiff(coord, line)).toEqual(-1);
  });

  it("it should return 2", function() {
    coord = new Coord(1, 4)
    expect(getCoordLineYDiff(coord, line)).toEqual(2);
  });

  it("it should return 0", function() {
    coord = new Coord(1, 2)
    expect(getCoordLineYDiff(coord, line)).toEqual(0);
  });

});

describe("getParallelLineEquations", function() {

  it("it should have a coefficient of 0.5 and an offset of 2", function() {
    line = new Line(new Coord(2, 1), new Coord(3, 1.5));
    lineEquation = line.getEquation();
    parallelEquation = getParallelLineEquations(line, 2 / Math.sqrt(1.25));

    expect(parallelEquation[0].coefficient).toEqual(0.5);
    expect(parallelEquation[0].offset).toEqual(2);
    expect(parallelEquation[1].coefficient).toEqual(0.5);
    expect(parallelEquation[1].offset).toEqual(-2);
  });

  it("it should have a coefficient of -0.5 and an offset of 2", function() {
    line = new Line(new Coord(2, -1), new Coord(3, -1.5));
    lineEquation = line.getEquation();
    parallelEquation = getParallelLineEquations(line, 2 / Math.sqrt(1.25));

    expect(parallelEquation[0].coefficient).toEqual(-0.5);
    expect(parallelEquation[0].offset).toEqual(2);
  });

});

describe("getPerpendicularLineEquations", function() {

  it("it should have a coefficient of -2 and offsets of 0 and 5", function() {
    line = new Line(new Coord(0, 0), new Coord(2, 1));
    perpEquations = getPerpendicularLineEquations(line);

    expect(perpEquations[0].coefficient).toEqual(-2);
    expect(perpEquations[0].offset).toEqual(0);
    expect(perpEquations[1].coefficient).toEqual(-2);
    expect(perpEquations[1].offset).toEqual(5);
  });

});

describe("isBetween", function() {

  it("it should return true for 1, 5, 3", function() {
    expect(isBetween(1, 5, 3)).toBe(true);
  });

  it("it should return false for 1, 3, 5", function() {
    expect(isBetween(1, 3, 5)).toBe(false);
  });

  it("it should return true for 1, 3, 3", function() {
    expect(isBetween(1, 3, 3)).toBe(true);
  });

  it("it should return true for 1, 1, 1", function() {
    expect(isBetween(1, 1, 1)).toBe(true);
  });

  it("it should return false for 1, 1, 5", function() {
    expect(isBetween(1, 1, 5)).toBe(false);
  });

  it("it should return true for 5, 1, 3", function() {
    expect(isBetween(5, 1, 3)).toBe(true);
  });

  it("it should return false for 3, 1, 5", function() {
    expect(isBetween(3, 1, 5)).toBe(false);
  });

  it("it should return true for 3, 1, 3", function() {
    expect(isBetween(3, 1, 3)).toBe(true);
  });

});

describe("coordInRhombus", function() {

  it("it should be false", function() {
    line = new Line(new Coord(0, 0), new Coord(4, 4));
    coord = new Coord(0, 1.42);
    expect(coordInRhombus(line, 1, coord)).toBe(false);
  });

  it("it should be true", function() {
    line = new Line(new Coord(0, 0), new Coord(4, 4));
    coord = new Coord(0, 0.5);
    expect(coordInRhombus(line, 1, coord)).toBe(true);
  });

});

describe("getEquation", function() {

  it("it should be 1", function() {
    coefficient = 2;
    coord = new Coord(1, 3);
    expect(getEquation(coord, coefficient).offset).toBe(1);
  });

  it("it should be 3", function() {
    coefficient = -0.5;
    coord = new Coord(4, 1);
    expect(getEquation(coord, coefficient).offset).toBe(3);
  });

});







