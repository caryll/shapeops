var Bezier = require("bezier-js");

function lerp(l, r, x) { return l + (r - l) * x; }
function contourZsToBeziers(contour, resolution) {
	var ans = [];
	var z0 = contour[0];
	for (var j = 1; j < contour.length; j++) {
		var z1 = contour[j % contour.length];
		if (z1.on) {
			var seg = new Bezier(
				z0,
				{ x: lerp(z0.x, z1.x, 1 / 3), y: lerp(z0.y, z1.y, 1 / 3) },
				{ x: lerp(z0.x, z1.x, 2 / 3), y: lerp(z0.y, z1.y, 2 / 3) },
				z1);
			seg._t1 = ans.length;
			seg._t2 = ans.length + 1;
			ans.push(seg);
			z0 = z1;
		} else {
			var z2 = contour[(j + 1) % contour.length];
			var z3 = contour[(j + 2) % contour.length];
			var seg = new Bezier(z0, z1, z2, z3);
			seg._t1 = ans.length;
			seg._t2 = ans.length + 1;
			ans.push(seg);
			z0 = z3;
			j += 2;
		}
	}
	return ans;
}
function zsToBeziers(shape) {
	return shape.map(contourZsToBeziers);
}
exports.zsToBeziers = zsToBeziers;

function reduceContour(contour) {
	var ans = [];
	for (var j = 0; j < contour.length; j++) {
		var seg = contour[j];
		if (seg._linear) {
			ans.push(seg);
			continue;
		}
		var reducedSeg = seg.reduce();
		if (reducedSeg.length) {
			for (var k = 0; k < reducedSeg.length; k++) {
				var _t1 = reducedSeg[k]._t1;
				var _t2 = reducedSeg[k]._t2;
				reducedSeg[k]._t1 = seg._t1 + (seg._t2 - seg._t1) * _t1;
				reducedSeg[k]._t2 = seg._t1 + (seg._t2 - seg._t1) * _t2;
				ans.push(reducedSeg[k]);
			}
		} else {
			ans.push(seg);
		}
	}
	return ans;
}
function reduceShape(shape) {
	return shape;
	return shape.map(reduceContour);
}
exports.reduceShape = reduceShape;

function beziersToZs(shape) {
	return shape.map(contourBeziersToZs);
}
function onpoint(z) {
	return {
		x: z.x,
		y: z.y,
		on: true
	};
}
function offpoint(z) {
	return {
		x: z.x,
		y: z.y,
		on: false,
		cubic: true
	};
}
function contourBeziersToZs(contour) {
	var ans = [onpoint(contour[0].points[0])];
	for (var j = 0; j < contour.length; j++) {
		if (contour[j]._linear) {
			ans.push(onpoint(contour[j].points[3]));
		} else {
			ans.push(
				offpoint(contour[j].points[1]),
				offpoint(contour[j].points[2]),
				onpoint(contour[j].points[3])
			);
		}
	}
	return ans;
}
exports.beziersToZs = beziersToZs;
