var test = require("tape").test;
var SplitArc = require("../lib/split-arc");

test('splitarc should be a function', (t) => {
    t.ok(SplitArc, "We are exporting the SplitArc function.");
    t.end();
});

//TODO: More tests needed obviously