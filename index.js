var Bezier = require("bezier-js");
var ClipperLib = require("clipper-lib");

var zsToBeziers = require("./shape").zsToBeziers;
var reduceShape = require("./shape").reduceShape;
var beziersToZs = require("./shape").beziersToZs;
var findAllSelfIntersections = require("./intersections").findAllSelfIntersections;
var findCrossIntersections = require("./intersections").findCrossIntersections;
var splitShape = require("./intersections").splitShape;
var keyofz = require("./toPoly").keyofz;
var toPoly = require("./toPoly").toPoly;
var rebuildShape = require("./rebuild").rebuildShape;

function by_t(a, b) { return a - b; }

function boolop(op, zs1, zs2, rule1, rule2, resolution, dontreduce) {
	var RESOLUTION = resolution || 100;
	var ERROR = 0.5 / RESOLUTION;

	var ss1 = zsToBeziers(zs1);
	var ss2 = zsToBeziers(zs2);
	var s1 = dontreduce ? ss1 : reduceShape(ss1);
	var s2 = dontreduce ? ss2 : reduceShape(ss2);
	var i1 = findAllSelfIntersections(s1, ss1, ERROR);
	var i2 = findAllSelfIntersections(s2, ss2, ERROR);
	findCrossIntersections(s1, s1, i1, i1, true, ERROR);
	findCrossIntersections(s2, s2, i2, i2, true, ERROR);
	findCrossIntersections(s1, s2, i1, i2, false, ERROR);
	for (var c = 0; c < i1.length; c++) { i1[c] = i1[c].sort(by_t); }
	for (var c = 0; c < i2.length; c++) { i2[c] = i2[c].sort(by_t); }

	var xs1 = splitShape(ss1, i1, ERROR);
	var xs2 = splitShape(ss2, i2, ERROR);

	var pthash = {};
	var pvhash = {};

	var p1 = toPoly(xs1, 1, pthash, pvhash, RESOLUTION);
	var p2 = toPoly(xs2, 2, pthash, pvhash, RESOLUTION);

	var cpr = new ClipperLib.Clipper(ClipperLib.Clipper.ioStrictlySimple);
	cpr.AddPaths(p1, ClipperLib.PolyType.ptSubject, true);
	cpr.AddPaths(p2, ClipperLib.PolyType.ptClip, true);
	var solution_paths = new ClipperLib.Paths();
	var succeeded = cpr.Execute(op || 0, solution_paths, rule1 || 0, rule2 || 0);
	var result = rebuildShape(solution_paths, [null, xs1, xs2], pthash, pvhash, RESOLUTION);
	return beziersToZs(result);
}

function removeOverlap(zs1, rule, resolution, dontreduce) {
	var RESOLUTION = resolution || 100;
	var ERROR = 0.5 / RESOLUTION;

	var ss1 = zsToBeziers(zs1);
	var s1 = dontreduce ? ss1 : reduceShape(ss1);
	var i1 = findAllSelfIntersections(s1, ss1, ERROR);
	findCrossIntersections(s1, s1, i1, i1, true, ERROR);
	for (var c = 0; c < i1.length; c++) { i1[c] = i1[c].sort(by_t); }
	var xs1 = splitShape(ss1, i1, ERROR);
	var pthash = {};
	var pvhash = {};

	var p1 = toPoly(xs1, 1, pthash, pvhash, RESOLUTION);
	var solution_paths = ClipperLib.Clipper.SimplifyPolygons(p1, rule);

	var result = rebuildShape(solution_paths, [null, xs1], pthash, pvhash, RESOLUTION);
	return beziersToZs(result);
}

exports.boole = boolop;
exports.removeOverlap = removeOverlap;
exports.ops = {
	intersection: 0,
	union: 1,
	difference: 2
};
exports.fillRules = {
	evenodd: 0,
	nonzero: 1
};
