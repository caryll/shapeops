var Bezier = require("bezier-js");

// Cache bounding boxes
function bez3bbox(x0, y0, x1, y1, x2, y2, x3, y3) {
	var tvalues = [], xvalues = [], yvalues = [],
		a, b, c, t, t1, t2, b2ac, sqrtb2ac;
	for (var i = 0; i < 2; ++i) {
		if (i == 0) {
			b = 6 * x0 - 12 * x1 + 6 * x2;
			a = -3 * x0 + 9 * x1 - 9 * x2 + 3 * x3;
			c = 3 * x1 - 3 * x0;
		} else {
			b = 6 * y0 - 12 * y1 + 6 * y2;
			a = -3 * y0 + 9 * y1 - 9 * y2 + 3 * y3;
			c = 3 * y1 - 3 * y0;
		}
		if (Math.abs(a) < 1e-12) {
			if (Math.abs(b) < 1e-12) {
				continue;
			}
			t = -c / b;
			if (0 < t && t < 1) {
				tvalues.push(t);
			}
			continue;
		}
		b2ac = b * b - 4 * c * a;
		if (b2ac < 0) { continue; }
		sqrtb2ac = Math.sqrt(b2ac);
		t1 = (-b + sqrtb2ac) / (2 * a);
		if (0 < t1 && t1 < 1) {
			tvalues.push(t1);
		}
		t2 = (-b - sqrtb2ac) / (2 * a);
		if (0 < t2 && t2 < 1) {
			tvalues.push(t2);
		}
	}

	var j = tvalues.length, mt;
	while (j--) {
		t = tvalues[j];
		mt = 1 - t;
		xvalues[j] = (mt * mt * mt * x0) + (3 * mt * mt * t * x1) + (3 * mt * t * t * x2) + (t * t * t * x3);
		yvalues[j] = (mt * mt * mt * y0) + (3 * mt * mt * t * y1) + (3 * mt * t * t * y2) + (t * t * t * y3);
	}

	xvalues.push(x0, x3);
	yvalues.push(y0, y3);

	var xmin = Math.min.apply(0, xvalues), ymin = Math.min.apply(0, yvalues);
	var xmax = Math.max.apply(0, xvalues), ymax = Math.max.apply(0, yvalues);
	return {
		x: { mid: (xmax + xmin) / 2, size: xmax - xmin },
		y: { mid: (ymax + ymin) / 2, size: ymax - ymin }
	};
}
function bboxof(c) {
	if (c.__caryll_bbox) {
		return c.__caryll_bbox;
	} else {
		c.__caryll_bbox = bez3bbox(
			c.points[0].x, c.points[0].y,
			c.points[1].x, c.points[1].y,
			c.points[2].x, c.points[2].y,
			c.points[3].x, c.points[3].y
		);
		return c.__caryll_bbox;
	}
}
function bboxOverlap(b1, b2) {
	if (b1.x.mid + b1.x.size / 2 < b2.x.mid - b2.x.size / 2) return false;
	if (b1.x.mid - b1.x.size / 2 > b2.x.mid + b2.x.size / 2) return false;
	if (b1.y.mid + b1.y.size / 2 < b2.y.mid - b2.y.size / 2) return false;
	if (b1.y.mid - b1.y.size / 2 > b2.y.mid + b2.y.size / 2) return false;
	return true;
}

var PHI = (Math.sqrt(5) - 1) / 2;
function zcolinear(z1, z2, z3, threshold) {
	return Math.abs(z1.x * z2.y + z2.x * z3.y + z3.x * z1.y - z1.x * z3.y - z2.x * z1.y - z3.x * z2.y) <= threshold;
}
function ccolinear(c1, c2, threshold) {
	return zcolinear(c1.points[0], c1.points[3], c2.points[0], threshold) && zcolinear(c1.points[0], c1.points[3], c2.points[3], threshold);
}

function pairIteration(c1, c2, curveIntersectionThreshold, depth, results) {
	var c1b = bboxof(c1), c2b = bboxof(c2), r = 100000, threshold = curveIntersectionThreshold || 0.5;
	if (!bboxOverlap(c1b, c2b)) return results;
	//	if (c1b.x.size < threshold && c2b.x.size < threshold) return results;
	//	if (c1b.y.size < threshold && c2b.y.size < threshold) return results;
	if (c1._linear && c2._linear) return results;
	if (depth > 20 || c1b.x.size < threshold && c1b.y.size < threshold || c2b.x.size < threshold && c2b.y.size < threshold) {
		results.push([((r * (c1._t1 + c1._t2) / 2) | 0) / r, ((r * (c2._t1 + c2._t2) / 2) | 0) / r]);
		return results;
	}
	var cc1 = c1.split(PHI), cc2 = c2.split(PHI), pairs = [];

	pairIteration(cc1.left, cc2.left, threshold, depth + 1, results);
	pairIteration(cc1.right, cc2.left, threshold, depth + 1, results);
	pairIteration(cc1.left, cc2.right, threshold, depth + 1, results);
	pairIteration(cc1.right, cc2.right, threshold, depth + 1, results);
	return results;
}
function curveIntersects(c1, c2, curveIntersectionThreshold) {
	var pairs = [];
	// step 1: pair off any overlapping segments
	var b1 = [];
	var b2 = [];
	for (var j = 0; j < c1.length; j++) { b1[j] = bboxof(c1[j]); }
	for (var j = 0; j < c2.length; j++) { b2[j] = bboxof(c2[j]); }
	for (var j = 0; j < c1.length; j++) { for (var k = 0; k < c2.length; k++) {
			if (bboxOverlap(b1[j], b2[k])) {
				pairs.push({ left: c1[j], right: c2[k]});
			}
		}
	}
	// step 2: for each pairing, run through the convergence algorithm.
	var intersections = [];
	pairs.forEach(function (pair) {
		var result = pairIteration(pair.left, pair.right, curveIntersectionThreshold, 0, []);
		if (result.length > 0) {
			intersections = intersections.concat(result);
		}
	});
	return intersections;
}
function findAllSelfIntersections(shape, origshape, ERROR) {
	var ans = [];
	for (var c = 0; c < shape.length; c++) {
		var contour = shape[c];
		var i, len = contour.length - 2, results = [], result, left, right;
		// For any close contour, neighbour segments should not have any intersection.
		for (i = 0; i < len; i++) {
			left = contour.slice(i, i + 1);
			right = contour.slice(i + 2);
			result = curveIntersects(left, right, ERROR);
			results = results.concat(result);
		}
		for (var j = 0; j <= origshape[c].length; j++) {
			results.push([j]);
		}
		ans.push(results.reduce(function (a, b) { return a.concat(b); }, []));
	}
	return ans;
}

function FIRST(x) { return x[0]; }
function SECOND(x) { return x[1]; }
function findCrossIntersections(shape1, shape2, i1, i2, notsame, ERROR) {
	for (var c = 0; c < shape1.length; c++) for (var d = 0; d < shape2.length; d++) if (!notsame || c < d) {
				var l = shape1[c], r = shape2[d];
				var intersections = curveIntersects(l, r, ERROR);
				i1[c] = i1[c].concat(intersections.map(FIRST));
				i2[d] = i2[d].concat(intersections.map(SECOND));
	}
}

function splitShape(shape, irecs, ERROR) {
	var ans = [];
	for (var j = 0; j < shape.length; j++) {
		ans.push(splitContour(shape[j], irecs[j], ERROR));
	}
	return ans;
}

function splitContour(contour, irec, ERROR) {
	var z0 = contour[0].get(0);
	var jc = 0;
	var tlast = 0;
	var ans = [];
	for (var j = 0; j < irec.length; j++) {
		var t = irec[j] - jc;
		var pt = contour[jc].get(t);
		if (t >= 1 || Math.hypot(pt.x - z0.x, pt.y - z0.y) >= ERROR * 2) {
			ans.push(contour[jc].split(tlast, t));
			z0 = pt;
			if (t < 1) {
				tlast = t;
			} else {
				tlast = 0;
				jc += 1;
			}
		} else {
			if (tlast >= 1) {
				tlast = 0;
				jc += 1;
			}
		}
	}
	return ans;
}


exports.findAllSelfIntersections = findAllSelfIntersections;
exports.findCrossIntersections = findCrossIntersections;
exports.splitShape = splitShape;
