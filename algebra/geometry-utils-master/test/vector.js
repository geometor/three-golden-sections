var test = require("tape").test;
var Vector = require("../lib/vector");

test('vector should be a function', (t) => {
    t.ok(Vector, "We are exporting the Vector function.");
    t.end();
});

//TODO: More tests needed obviously