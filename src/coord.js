module.exports.getIntersectingElements = function(svg, coordinates) {
    var irect = svg.createSVGRect();
    irect.x = coordinates[0];
    irect.y = coordinates[1];
    irect.width = irect.height = 1;

    const intersectingLines = [].slice.call(svg.getIntersectionList(irect, null))
        .filter(element => element.nodeName === 'line')
        .filter(element => {
            const coord = new Coord(irect.x, irect.y);
            const line = new Line(
                new Coord(element.x1.baseVal.value, element.y1.baseVal.value),
                new Coord(element.x2.baseVal.value, element.y2.baseVal.value));
            return coordInRhombus(line, parseInt(element.style.strokeWidth), coord);
        });

    return intersectingLines;
};

const Coord = function(x, y) {
    this.x = x;
    this.y = y;
};

function Equation(coefficient, offset) {
    this.coefficient = coefficient;
    this.offset = offset;
}

class Line {
    constructor(start, end) {
        this.x1 = start.x;
        this.x2 = end.x;
        this.y1 = start.y;
        this.y2 = end.y;
    }

    getEquation() {
        const coefficient = (this.y2 - this.y1) / (this.x2 - this.x1);
        const offset = this.y1 - coefficient * this.x1;

        return new Equation(coefficient, offset);
    }
}

function getPerpendicularLineEquations(line) {
	const normalCoefficient = -1 / line.getEquation().coefficient;
	const offset1 = line.y1 - normalCoefficient * line.x1;
	const offset2 = line.y2 - normalCoefficient * line.x2;

	const equationOne = new Equation(normalCoefficient, offset1);
	const equationTwo = new Equation(normalCoefficient, offset2);
	return [equationOne, equationTwo];
}

// returns a new equation also with a positive offset, you can simpy negate this for the other side
function getParallelLineEquations(line, perpDistance) {
	const equation = line.getEquation();
	const coefficient = equation.coefficient;
    const offset = equation.offset;

	const verticalDistance = perpDistance * Math.sqrt(coefficient * coefficient + 1);
	const equationOne = new Equation(coefficient, offset + verticalDistance);
	const equationTwo = new Equation(coefficient, offset - verticalDistance);
	return [equationOne, equationTwo];
}

function isBetween(boundary1, boundary2, value) {
	if (boundary1 < boundary2) {
		return boundary1 <= value && value <= boundary2;
	}
	else if (boundary1 > boundary2) {
		return boundary1 >= value && value >= boundary2;
	} else {
		return boundary1 === value;
	}
}

function getEquation(coord, coefficient) {
	const offset = coord.y - coefficient * coord.x;
	return new Equation(coefficient, offset);
}

function coordInRhombus(line, perpDistance, coord) {
	const parallelLineEquations = getParallelLineEquations(line, perpDistance);

	const perpendicularLineEquations = getPerpendicularLineEquations(line);

    return isBetween(
        perpendicularLineEquations[0].offset,
        perpendicularLineEquations[1].offset,
        getEquation(coord, perpendicularLineEquations[0].coefficient).offset
    ) && isBetween(
        parallelLineEquations[0].offset,
        parallelLineEquations[1].offset,
        getEquation(coord, parallelLineEquations[0].coefficient).offset
    );
}
