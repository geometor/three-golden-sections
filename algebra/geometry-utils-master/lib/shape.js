// Define a region type with useful methods
var debug = require("debug")("st:geomutil:shape");
var pointInPolygon = require("point-in-polygon");
var Point = require("./vector");
var Arc = require("./arc");

// Ensure that the array is one of Point objects. If
// they're already `Point`s, simply return a copy;
// if not, create the `Point`s, interpolate the `Arc`s,
// etc
function createPointObjects(array) {
    if (!array) {
        array = [];
    }

    var acc = array.reduce(function(accumulator, current) {
        if (current.x && current.y) { // Point
            accumulator.push(current);
        }
        else if (current.start && current.end && current.height) { // Arc
            // Consider an arc "flat enough" if its height is < the value times its length
            if (!current.interpolatedPoints) {
                current = new Arc(current.start, current.end, current.height);
            }
            var newPoints = current.interpolatedPoints({relative: 0.1});
            accumulator = accumulator.concat(newPoints);
        }
        else if (current[0] && current[1]) { // x, y pair
            var pt = new Point(current[0], current[1]);
            accumulator.push(pt);
        }
        else {
            debug("don't know how to accommodate", current);
        }
        return accumulator;
    }, []);
    return acc;
}

function Shape(points) {
    this.points = createPointObjects(points);
    this.length = this.points.length;
}

Shape.prototype.area = function () {
    var area = 0;
    var i;
    var j;
    var point1;
    var point2;

    // For each line in the polygon (i.e. each pair of adjacent
    // points) compute the area "under" it. Then sum to find the
    // total area. Complete explanation of the method:
    // https://www.mathsisfun.com/geometry/area-irregular-polygons.html
    for (i = 0, j = this.length - 1; i < this.length; j = i, i++) {
        point1 = this.points[i];
        point2 = this.points[j];
        area += point1.x * point2.y;
        area -= point1.y * point2.x;
    }
    area /= 2;

    return area;
};

// The centroid of a shape is the average value of its
// points -- it's the best approximation for a center point
// for an irregular shape.
// More details at: http://en.wikipedia.org/wiki/Centroid
Shape.prototype.centroid = function () {
    var x = 0;
    var y = 0;
    var i;
    var j;
    var f;
    var point1;
    var point2;

    for (i = 0, j = this.length - 1; i < this.length; j = i, i++) {
        point1 = this.points[i];
        point2 = this.points[j];
        f = point1.x * point2.y - point2.x * point1.y;
        x += (point1.x + point2.x) * f;
        y += (point1.y + point2.y) * f;
    }

    f = this.area() * 6;

    return new Point(x / f, y / f);
};

Shape.prototype.contains = function(point) {
    // TODO: There's got to be a way to memoize the polygon calculation here
    var polygon = this.points.map(function(p) {
        return [p.x, p.y];
    });
    return pointInPolygon([point.x, point.y], polygon);
};

Shape.prototype.boundingBox = function() {
    // Find minimum and maximum x and y -- not using higher-order functions
    // in favor of manually unrolling the loop for maximum comprehensibility
    var minX = 999999;
    var minY = 999999;
    var maxX = -1;
    var maxY = -1;
    for (var i = 0; i < this.points.length; i++) {
        var point = this.points[i];
        if (point.x < minX) {
            minX = point.x;
        }
        if (point.y < minY) {
            minY = point.y;
        }
        if (point.x > maxX) {
            maxX = point.x;
        }
        if (point.y > maxY) {
            maxY = point.y;
        }
    }

    // Check that some data has been passed, otherwise don't return our arbitrary
    // sentinel values but rather all 0s
    if ((maxY === -1) && (maxX === -1)) {
        return {x: 0, y: 0, width: 0, height: 0};
    }

    return {
        x: minX,
        y: minY,
        width: (maxX - minX),
        height: (maxY - minY)
    };
};

Shape.prototype.centerOfBoundingBox = function() {
    var bbox = this.boundingBox();
    return {
        x: bbox.x + (bbox.width / 2),
        y: bbox.y + (bbox.height / 2)
    };
};

Shape.prototype.toGeoJson = function() {
    var coords = [];
    for (var i = 0; i < this.points.length; i++) {
        coords.push([this.points[i].x, this.points[i].y]);
    }
    var poly = {
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": [coords],
        },
        "properties": {
            "bookable_room_id": 1
        }
    };

    return poly;
}

module.exports = Shape;
