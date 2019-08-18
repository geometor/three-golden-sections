const test = require("tape").test;
const Index = require("../index");

test('index should export all functions and objects', (t) => {
    t.ok(Index, "We are exporting something from index.");
    t.ok(Index.Arc, "We are exporting arc from index.");
    t.ok(Index.Shape, "We are exporting shape from index.");
    t.ok(Index.Vector, "We are exporting vector from index.");
    t.end();
});

//TODO: More tests needed obviously