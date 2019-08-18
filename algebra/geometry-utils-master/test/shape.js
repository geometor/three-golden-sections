const test = require("tape").test;
const Shape = require("../index").Shape;

test('shape should be a function', (t) => {
    t.ok(Shape, "We are exporting the Shape function.");
    t.end();
});

//TODO: More tests needed obviously