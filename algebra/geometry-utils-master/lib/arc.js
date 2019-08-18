var debug = require("debug")("st:geomutil:arc");
var geomUtils = require("./utils");
var splitArc = require("./split-arc");

// Define a simple Arc object
function Arc(start, end, height) {
    this.start = start;
    this.end = end;
    this.height = height;
}

// Repeatedly split the arc in half until the remaining
// sub-arcs approximate a line segment closely enough --
// i.e. their arc height is below the given absolute or
// relative arc heights (relative being relative to the
// distance between the start and end points)
// @param opts Object {absolute: Number, relative: Number}
Arc.prototype.interpolatedPoints = function(opts) {
    var closeEnough;
    if (opts.absolute) {
        closeEnough = function(arc) {
            var currentHeight = arc.height;
            var cutoffHeight = opts.absolute;
            return currentHeight < cutoffHeight;
        };
    }
    else if (opts.relative) {
        closeEnough = function(arc) {
            var currentHeight = Math.abs(arc.height);
            var lengthOfChord = geomUtils.findDistanceBetweenTwoPoints(arc.start, arc.end);
            var cutoffHeight = (opts.relative * lengthOfChord);
            return currentHeight < cutoffHeight;
        };
    }

    var done = false;
    var points = [];
    var subArcs = [this];
    while (subArcs.length) { // WARNING: may cause infinite loop, probably want to add another stop condition
        var newArcs = [];
        for (var i = 0; i < subArcs.length; i++) {
            var a = subArcs[i];
            if (closeEnough(a)) {
                debug(" -- flat enough", a.start, a.end, a.height);
                points.push(a.start);
                points.push(a.end);
            }
            else {
                newArcs = newArcs.concat(splitArc(a));
            }
        }
        debug("subArcs:", subArcs, "newArcs:", newArcs);
        subArcs = newArcs;
    }
    debug("split arc:", this.start, this.end, this.height, "into", points, "according to", opts);
    return points;
};

module.exports = Arc;
