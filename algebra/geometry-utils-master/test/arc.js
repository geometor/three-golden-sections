var test = require("tape").test;
var Arc = require("../lib/arc");

test('arc should be a function', (t) => {
    t.ok(Arc, "We are exporting the Arc function.");
    t.end();
});

//TODO: More tests needed obviously