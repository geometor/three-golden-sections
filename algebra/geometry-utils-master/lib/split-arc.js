var debug = require("debug")("st:geomutil:split-arc");
var geomUtils = require("./utils");

// Return number with closest absolute value to maxNumber without
// exceeding it
function closestButNotGreaterThan(numbers, maxNumber) {
    var positiveNumbers = numbers.map(function(number){
        return Math.abs(number);
    });
    var positiveMaxNumber = Math.abs(maxNumber);

    var winner = positiveMaxNumber;
    var winningDifference = positiveMaxNumber;

    for (var i=0; i < positiveNumbers.length; i++) {
        var lessThanMax = positiveNumbers[i] <= positiveMaxNumber;
        var closerToMax = (positiveMaxNumber - positiveNumbers[i]) < winningDifference;
        if (lessThanMax && closerToMax) {
            winner = positiveNumbers[i];
            winningDifference = positiveMaxNumber-positiveNumbers[i];
        }
    }
    return winner;
}

// Return the number that's closest to zero
function closestToZero(numbers, maxNumber) {
    //returns the index of value closest to 0
    var positiveNumbers = numbers.map(function(number) {
        return Math.abs(number);
    });

    var sortedPositiveNumbers = positiveNumbers.sort(function(a, b) {
        return (a - b);
    });

    return sortedPositiveNumbers[0];
}

// Compute the height of a circular arc given `distance` is half the length of the
// chord of the circle, `radius` is the radius of the circle in question
function findArcHeight(distance, radius, maxArcHeight, greaterThan180) {
    var heightOptions = [];
    heightOptions.push(radius + Math.sqrt(Math.pow(radius,2) - Math.pow(distance,2)));
    heightOptions.push(radius - Math.sqrt(Math.pow(radius,2) - Math.pow(distance,2)));

    if(greaterThan180){
        return closestButNotGreaterThan(heightOptions, maxArcHeight);
    }
    else{
        return closestToZero(heightOptions, maxArcHeight);
    }
}

function findMidPoint(arc) {
    var chordLength = geomUtils.findDistanceBetweenTwoPoints(arc.start, arc.end);

    var xLeg, yLeg, maybeMidpoint;
    // Handle the edge cases of Xs or Ys being equal, to get a chord angle out
    if (arc.start.x == arc.end.x) {
        maybeMidpoint = {
            x: arc.start.x + arc.height,
            y: arc.start.y + ((arc.end.y - arc.start.y) / 2)
        };
        xLeg = geomUtils.findDistanceBetweenTwoPoints(arc.start, maybeMidpoint);
        yLeg = geomUtils.findDistanceBetweenTwoPoints(maybeMidpoint, arc.end);
    }
    else if (arc.start.y == arc.end.y) {
        maybeMidpoint = {
            x: arc.start.x + ((arc.end.x - arc.start.x) / 2),
            y: arc.start.y + arc.height
        };
        xLeg = geomUtils.findDistanceBetweenTwoPoints(arc.start, maybeMidpoint);
        yLeg = geomUtils.findDistanceBetweenTwoPoints(maybeMidpoint, arc.end);
    }
    else {
        xLeg = arc.end.x - arc.start.x;
        yLeg = arc.end.y - arc.start.y;
    }

    try {
        var chordAngle = geomUtils.solveAngle(chordLength, xLeg, yLeg);
    } catch(e) {
        debug("No chord angle findable for:", arc);
        throw e;
    }
    if (arc.height < 0) {
        chordAngle = chordAngle * -1;
    }

    var arcMidPointDistance = Math.sqrt(Math.pow(arc.height, 2) + Math.pow(chordLength / 2, 2));
    var additionalAngle = geomUtils.solveAngle(chordLength / 2, arcMidPointDistance, arc.height);
    if (arc.height < 0) {
        additionalAngle = additionalAngle * -1;
    }

    var arcMidPointAngle = chordAngle + additionalAngle;
    var arcMidPointXDiff = Math.cos(geomUtils.degToRad(arcMidPointAngle)) * arcMidPointDistance;
    var arcMidPointYDiff = Math.sin(geomUtils.degToRad(arcMidPointAngle)) * arcMidPointDistance;
    var arcMidPointX = arc.start.x + arcMidPointXDiff;
    var arcMidPointY = arc.start.y + arcMidPointYDiff;
    var midPoint = {x: arcMidPointX, y: arcMidPointY};
    return midPoint;
}

// Splits the given arc into sub-arcs around the given point
// If the point is not given, default to splitting the arc in
// half
// NOTE: This works weirdly with negative-height arcs!!
function splitArc(arc, point) {
    if (!point) {
        point = findMidPoint(arc);
    }

    var subArcs = [];

    var oldDistance = geomUtils.findDistanceBetweenTwoPoints(arc.start, arc.end);
    var halfOldDistance = oldDistance / 2;

    var arcHeight = Math.abs(arc.height);
    var radius = (Math.pow(arcHeight, 2) + Math.pow(halfOldDistance, 2)) / (2 * arcHeight);

    var newDistance1 = geomUtils.findDistanceBetweenTwoPoints(arc.start, point);
    var newDistance2 = geomUtils.findDistanceBetweenTwoPoints(arc.end, point);

    var halfNewDistance1 = newDistance1 / 2;
    var halfNewDistance2 = newDistance2 / 2;

    var angleDistance1 = geomUtils.solveAngle(oldDistance, newDistance2, newDistance1);
    var angleDistance2 = geomUtils.solveAngle(oldDistance, newDistance1, newDistance2);

    var angle1Total = angleDistance1 * 2;
    var angle2Total = angleDistance2 * 2;
    var isAngle1GreaterThan180 = angle1Total > 180;
    var isAngle2GreaterThan180 = angle2Total > 180;

    var newArcHeight1 = findArcHeight(halfNewDistance1, radius, arcHeight, isAngle1GreaterThan180);
    var newArcHeight2 = findArcHeight(halfNewDistance2, radius, arcHeight, isAngle2GreaterThan180);

    if (arc.height < 0) {
        newArcHeight1 = -1 * newArcHeight1;
        newArcHeight2 = -1 * newArcHeight2;
    }

    // Remember an Arc is {start, end, height} -- because requiring arc.js in
    // here would be recursive, we avoid doing that and just hack around it
    subArcs.push({start: arc.start, end: point, height: newArcHeight1 || arc.height});
    subArcs.push({start: point, end: arc.end, height: newArcHeight2 || 0});

    // debug("orig:", arc, "new:", subArcs);
    return subArcs;
}

// We only export one function
module.exports = splitArc;
