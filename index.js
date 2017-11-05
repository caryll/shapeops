const ClipperLib = require("clipper-lib");

const zsToBeziers = require("./shape").zsToBeziers;
const beziersToZs = require("./shape").beziersToZs;
const findAllSelfIntersections = require("./intersections").findAllSelfIntersections;
const findCrossIntersections = require("./intersections").findCrossIntersections;
const toPoly = require("./toPoly").toPoly;
const rebuildShape = require("./rebuild").rebuildShape;

function by_t(a, b) {
	return a.t - b.t;
}
function reduceITP(is) {
	if (!is.length) return is;
	is = is.sort(by_t);
	const ans = [is[0]];
	for (let j = 1; j < is.length; j++) {
		const last = ans[ans.length - 1];
		const current = is[j];
		if (current.t - last.t > 1e-5) {
			ans.push(current);
		}
	}
	return ans;
}

function boolop(op, zs1, zs2, rule1, rule2, resolution) {
	const RESOLUTION = resolution || 100;
	const ERROR = 0.01 / RESOLUTION;

	const s1 = zsToBeziers(zs1);
	const s2 = zsToBeziers(zs2);
	const i1 = findAllSelfIntersections(s1, s1, ERROR);
	const i2 = findAllSelfIntersections(s2, s2, ERROR);
	findCrossIntersections(s1, s1, i1, i1, true, ERROR);
	findCrossIntersections(s2, s2, i2, i2, true, ERROR);
	findCrossIntersections(s1, s2, i1, i2, false, ERROR);
	for (let c = 0; c < i1.length; c++) {
		i1[c] = reduceITP(i1[c]);
	}
	for (let c = 0; c < i2.length; c++) {
		i2[c] = reduceITP(i2[c]);
	}

	const seghash = new Map();
	const termhash = new Set();

	const p1 = toPoly(s1, 1, i1, seghash, termhash, RESOLUTION);
	const p2 = toPoly(s2, 2, i2, seghash, termhash, RESOLUTION);

	const cpr = new ClipperLib.Clipper(ClipperLib.Clipper.ioStrictlySimple);
	cpr.AddPaths(p1, ClipperLib.PolyType.ptSubject, true);
	cpr.AddPaths(p2, ClipperLib.PolyType.ptClip, true);
	const solution_paths = new ClipperLib.Paths();
	cpr.Execute(op || 0, solution_paths, rule1 || 0, rule2 || 0);
	const result = rebuildShape(solution_paths, seghash, termhash, RESOLUTION);
	return beziersToZs(result);
}

function removeOverlap(zs1, rule, resolution) {
	const RESOLUTION = resolution || 100;
	const ERROR = 0.01 / RESOLUTION;

	const s1 = zsToBeziers(zs1);
	const i1 = findAllSelfIntersections(s1, s1, ERROR);
	findCrossIntersections(s1, s1, i1, i1, true, ERROR);
	for (let c = 0; c < i1.length; c++) {
		i1[c] = reduceITP(i1[c]);
	}

	const seghash = new Map();
	const termhash = new Set();

	const p1 = toPoly(s1, 1, i1, seghash, termhash, RESOLUTION);
	const solution_paths = ClipperLib.Clipper.SimplifyPolygons(p1, rule);
	const result = rebuildShape(solution_paths, seghash, termhash, RESOLUTION);
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
