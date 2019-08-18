var debug = require("debug")("st:geomutil:utils");
var Point = require("./vector");

// Use Pythagoras to find the distance between two points
function findDistanceBetweenTwoPoints(point1, point2) {
    return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
}

// Takes a, b, and c to be lengths of legs of a triangle. Uses the law
// of cosines to return the angle C, i.e. the corner across from leg c
function solveAngle(a, b, c) {
    var temp = (a * a + b * b - c * c) / (2 * a * b);
    if (temp >= -1 && temp <= 1) {
        return radToDeg(Math.acos(temp));
    }
    else {
        throw new Error("No angle solution for points " + a + " " + b + " " + c);
    }
}

// Radians to degrees, 'nuff said
function radToDeg(x) {
    return x / Math.PI * 180;
}

function degToRad(x) {
    return x * (Math.PI / 180);
}

function translateDistanceAtAngle(angle, distance, point) {
    var angleInRadians = degToRad(angle);
    var translateX = Math.cos(angleInRadians) * distance;
    var translateY = Math.sin(angleInRadians) * distance;
    var newPoint = new Point(
        point.x + translateX,
        point.y + translateY
    );
    return newPoint;
}

// Translation
function translatePoint(point, offset) {
    point.x = point.x + offset.x;
    point.y = point.y + offset.y;
    return point;
}

// Group translation
function translatePoints(points, offset) {
    return points.map(function(point){
        return translatePoint(point, offset);
    }, this);
}

// Rotation: rotate a point about another point by some number of degrees
function rotatePoint(point, degrees) {
    // TODO use existing function
    var angle = Math.PI / 180 * degrees;
    point.x = point.x * Math.cos(angle) - point.y * Math.sin(angle);
    point.y = point.x * Math.sin(angle) + point.y * Math.cos(angle);
    return point;
}

// Group rotation
function rotatePoints(points, degrees) {
    return points.map(function(point) {
        return rotatePoint(point, degrees);
    }, this);
}

/**
 *
 * @param poly
 * @returns {{minX: *, maxX: *, minY: *, maxY: *, width: number, height: number, center: {x: *, y: *}}}
 */
function getBoundingBox(poly) {
    var minX = poly[0].x;
    var maxX = poly[0].x;
    var minY = poly[0].y;
    var maxY = poly[0].y;

    poly.forEach(function(p) {
        if (p.x < minX) {
            minX = p.x;
        }
        if (p.x > maxX) {
            maxX = p.x;
        }
        if (p.y < minY) {
            minY = p.y;
        }
        if (p.y > maxY) {
            maxY = p.y;
        }
    });

    var width = Math.abs(maxX - minX);
    var height = Math.abs(maxY - minY);
    var center = {x: minX + width/2, y: minY + height/2};

    return {
        "minX": minX,
        "maxX": maxX,
        "minY": minY,
        "maxY": maxY,
        "width": width,
        "height": height,
        "center": center
    }
}

/**
 *
 * @param p
 * @param poly
 * @returns {boolean}
 */
function pointInPoly (p, poly) {
    var a, b, c, i, n;
    i = -1;
    n = poly.length;
    b = poly[n - 1];
    c = 0;
    while (++i < n) {
        a = b;
        b = poly[i];
        if (rayIntersectsSegment(p, a, b)) {
            c++;
        }
    }
    return c % 2 !== 0;
};

/**
 *
 * @param p
 * @param p1
 * @param p2
 * @returns {boolean}
 */
function rayIntersectsSegment(p, p1, p2) {
    var a, b, mAB, mAP, ref;
    ref = (p1.y < p2.y) ? [p1, p2] : [p2, p1];
    a = ref[0];
    b = ref[1];
    if (p.y === b.y || p.y === a.y) {
        p.y += Number.MIN_VALUE;
    }
    if (p.y > b.y || p.y < a.y) {
        return false;
    } else if (p.x > a.x && p.x > b.x) {
        return false;
    } else if (p.x < a.x && p.x < b.x) {
        return true;
    } else {
        mAB = (b.y - a.y) / (b.x - a.x);
        mAP = (p.y - a.y) / (p.x - a.x);
        return mAP > mAB;
    }
};

/**
 *
 * @param poly
 * @param k
 * @returns {Object}
 */
function centroid(poly, k) {
    var i = -1,
        n = poly.length,
        x = 0,
        y = 0,
        a,
        b = poly[n - 1],
        c;

    if (!arguments.length) k = -1 / (6 * area(poly));

    while (++i < n) {
        a = b;
        b = poly[i];
        c = a.x * b.y - b.x * a.y;
        x += (a.x + b.x) * c;
        y += (a.y + b.y) * c;
    }

    return {x: (x * k), y: (y * k)};
};


/**
 * Calculates area of a polygon.  Ported from d3.js
 * @param poly Object
 * @returns {number} square units inside the polygon
 */
function area(poly) {
    var i = -1,
        n = poly.length,
        a,
        b = poly[n - 1],
        area = 0;

    while (++i < n) {
        a = b;
        b = poly[i];
        area += a.y * b.x - a.x * b.y;
    }

    return Math.abs(area * 0.5);
}

var lineIntersection = function(p1, q1, p2, q2) {
    var cross1, cross2, denom, dx1, dx2, dy1, dy2, eps, px, py;
    eps = 1e-9;
    dx1 = p1.x - q1.x;
    dy1 = p1.y - q1.y;
    dx2 = p2.x - q2.x;
    dy2 = p2.y - q2.y;
    denom = dx1 * dy2 - dy1 * dx2;
    if (Math.abs(denom) < eps) {
        return null;
    }
    cross1 = p1.x * q1.y - p1.y * q1.x;
    cross2 = p2.x * q2.y - p2.y * q2.x;
    px = (cross1 * dx2 - cross2 * dx1) / denom;
    py = (cross1 * dy2 - cross2 * dy1) / denom;
    return {x: px, y: py};
};

function filterUniquePts(poly) {
    var unique = poly.filter(function(pt) {
        var x = pt.x;
        var y = pt.y;
        var count = 0;
        for (var i=0; i < poly.length; i++) {
            if (poly[i].x == x && poly[i].y == y) {
                count++;
            }
        }
        return (count >= 2);
    });
    return poly;
}

// center rectangle a inside rectangle b
// assumption: rectangles have the form {x1: 0, y1: 0, x2: 0, y2: 0}
// assumption: b is larger than a such that a fits completely inside b
function positionRectangleInsideAnother(pos, a, b) {
    var aWidth = a.x2 - a.x1;
    var aHeight = a.y2 - a.y1;

    var bWidth = b.x2 - b.x1;
    var bHeight = b.y2 - b.y1;

    if (bHeight <= aHeight || bWidth <= aWidth) {
        return a;
    }

    var adjusted;
    switch (pos) {
        case "center":
            return {
                x1: a.x1 + (bWidth - aWidth)/2,
                x2: a.x2 + (bWidth - aWidth)/2,
                y1: a.y1 + (bHeight - aHeight)/2,
                y2: a.y2 + (bHeight - aHeight)/2
            };
        case "ne":
            return {
                x1: a.x1 + (bWidth - aWidth),
                x2: a.x2 + (bWidth - aWidth),
                y1: a.y1,
                y2: a.y2
            };
        case "se":
            return {
                x1: a.x1 + (bWidth - aWidth),
                x2: a.x2 + (bWidth - aWidth),
                y1: a.y1 + (bHeight - aHeight),
                y2: a.y2 + (bHeight - aHeight)
            };
        case "sw":
            return {
                x1: a.x1,
                x2: a.x2,
                y1: a.y1 + (bHeight - aHeight),
                y2: a.y2 + (bHeight - aHeight)
            };
        case "nw":
        default:
            return a;
    }

    return {}
}

module.exports = {
    findDistanceBetweenTwoPoints: findDistanceBetweenTwoPoints,
    solveAngle: solveAngle,
    radToDeg: radToDeg,
    degToRad: degToRad,
    translateDistanceAtAngle: translateDistanceAtAngle,
    translatePoint: translatePoint,
    translatePoints: translatePoints,
    rotatePoint: rotatePoint,
    rotatePoints: rotatePoints,
    getBoundingBox: getBoundingBox,
    pointInPoly: pointInPoly,
    lineIntersection: lineIntersection,
    //area: area,  [NEED TO FIX BEFORE USING]
    pointInPoly: pointInPoly,
    filterUnique: filterUniquePts,
    positionRectangleInsideAnother: positionRectangleInsideAnother
};
