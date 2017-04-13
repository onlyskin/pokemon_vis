function Coord (x, y) {
	this.x = x;
	this.y = y;
}

function Equation (coefficient, offset) {
	this.coefficient = coefficient;
	this.offset = offset;
}

function Line (point1, point2) {
	this.x1 = point1.x;
	this.x2 = point2.x;
	this.y1 = point1.y;
	this.y2 = point2.y;
}

Line.prototype.getEquation = function () {
	coefficient = (this.y2 - this.y1) / (this.x2 - this.x1);
	offset = this.y1 - coefficient * this.x1
	return new Equation(coefficient, offset)
}

function getCoordLineYDiff (Coord, Line) {
	e = Line.getEquation();
	coordY = Coord.y
	lineYAtCoordX = e.coefficient * Coord.x + e.offset;
	return coordY - lineYAtCoordX;
}

function getPerpendicularLineEquations (Line) {
	mainLineEquation = Line.getEquation();
	perpCoefficient = -1 / mainLineEquation.coefficient;
	offset1 = line.y1 - perpCoefficient * line.x1;
	offset2 = line.y2 - perpCoefficient * line.x2;
	e1 = new Equation(perpCoefficient, offset1);
	e2 = new Equation(perpCoefficient, offset2);
	return [e1, e2];
}

// returns a new equation also with a positive offset, you can simpy negate this for the other side
function getParallelLineEquations (Line, perpDistance) {
	equation = Line.getEquation()
	coefficient = equation.coefficient;
	verticalDistance = perpDistance * Math.sqrt(coefficient * coefficient + 1)
	e1 = new Equation(coefficient, equation.offset + verticalDistance)
	e2 = new Equation(coefficient, equation.offset - verticalDistance)
	return [e1, e2]
}

function isBetween (boundary1, boundary2, value) {
	if (boundary1 < boundary2) {
		return boundary1 <= value && value <= boundary2;
	}
	else if (boundary1 > boundary2) {
		return boundary1 >= value && value >= boundary2;
	} else {
		return boundary1 == value;
	}
}

function getEquation (Coord, coefficient) {
	offset = Coord.y - coefficient * Coord.x;
	return new Equation(coefficient, offset)
}

function coordInRhombus (Line, perpDistance, Coord) {
	paraLines = getParallelLineEquations(Line, perpDistance);
	perpLines = getPerpendicularLineEquations(Line);
	if (isBetween(perpLines[0].offset, perpLines[1].offset, getEquation(Coord, perpLines[0].coefficient).offset) &&
		isBetween(paraLines[0].offset, paraLines[1].offset, getEquation(Coord, paraLines[0].coefficient).offset)) {
		return true;
	}
	else {
		return false;
	}
}


