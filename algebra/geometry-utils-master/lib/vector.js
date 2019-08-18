var debug = require("debug")("st:geomutil:vector");

// from https://github.com/geidav/ombb-rotating-calipers
function Vector(x, y) {
    this.x = x;
    this.y = y;
}

Vector.prototype.min = function(vec) {
    this.x = Math.min(this.x, vec.x);
    this.y = Math.min(this.y, vec.y);
};

Vector.prototype.max = function(vec) {
    this.x = Math.max(this.x, vec.x);
    this.y = Math.max(this.y, vec.y);
};

Vector.prototype.midpoint = function(vec) {
    return new Vector(
        (this.x + vec.x) * 0.5,
        (this.y + vec.y) * 0.5);
};

Vector.prototype.clone = function() {
    return new Vector(this.x, this.y);
};

Vector.prototype.normalize = function() {
    var len = this.length();
    this.x /= len;
    this.y /= len;
};

Vector.prototype.normalized = function() {
    var vec = new Vector(this.x, this.y);
    vec.normalize();
    return vec;
};

Vector.prototype.negate = function() {
    this.x = -this.x;
    this.y = -this.y;
};

Vector.prototype.sqrLength = function() {
    return this.x * this.x + this.y * this.y;
};

Vector.prototype.length = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
};

Vector.prototype.scale = function(len) {
    this.x *= len;
    this.y *= len;
};

Vector.prototype.add = function(vec) {
    this.x += vec.x;
    this.y += vec.y;
};

Vector.prototype.sub = function(vec) {
    this.x -= vec.x;
    this.y -= vec.y;
};

Vector.prototype.diff = function(vec) {
    return new Vector(this.x-vec.x, this.y-vec.y);
};

Vector.prototype.distance = function(vec) {
    var x = this.x-vec.x;
    var y = this.y-vec.y;
    return Math.sqrt(x*x+y*y);
};

Vector.prototype.dot = function(vec) {
    return this.x*vec.x+this.y*vec.y;
};

Vector.prototype.equals = function(vec) {
    return this.x == vec.x && this.y == vec.y;
};

Vector.prototype.orthogonal = function() {
    return new Vector(this.y, -this.x);
};

Vector.prototype.distanceToLine = function(v0, v1) {
    var sqrLen = v1.diff(v0).sqrLength();
    var u = ((this.x-v0.x)*(v1.x-v0.x)+(this.y-v0.y)*(v1.y-v0.y))/sqrLen;
    var v1c = v1.diff(v0);
    v1c.scale(u);
    var pl = v0.clone();
    pl.add(v1c);
    return this.distance(pl);
};

module.exports = Vector;