var Bezier = require("bezier-js");
var ClipperLib = require("clipper-lib");
var keyofz = require("./toPoly").keyofz;


function rebuildShape(polys, recog, pthash, pvhash, RESOLUTION) {
	var ans = [];
	for (var c = 0; c < polys.length; c++) {
		var cx = rebuildContour(polys[c], recog, pthash, pvhash, RESOLUTION);
		if (cx.length) {
			ans.push(cx);
		}
	}
	return ans;
}
function ordinalSegPts(poly, l, r, pthash, pvhash) {
	if (r - l < 2) return false;
	var pv0 = pvhash[keyofz(poly[l + 1])];
	if (!pv0) return false;
	for (var j = l + 2; j < r; j++) {
		var pv1 = pvhash[keyofz(poly[j])];
		if (!pv1 || pv1[0] !== pv0[0] || pv1[1] !== pv0[1] || pv1[2] !== pv0[2]) {
			return false;
		}
	}
	return pv0;
}
function bezpt(Z, RESOLUTION) {
	return { x: Z.X / RESOLUTION, y: Z.Y / RESOLUTION };
}
function rebuildContour(_poly, recog, pthash, pvhash, RESOLUTION) {
	for (var j0 = 0; j0 < _poly.length && pthash[keyofz(_poly[j0])]; j0++) { }
	var poly = _poly.slice(j0).concat(_poly.slice(0, j0 + 1));
	var j = 0;
	var ans = [];
	while (j < poly.length) {
		var n = j + 1;
		while (n < poly.length && pthash[keyofz(poly[n])]) n++;
		if (n < poly.length) {
			var pv = ordinalSegPts(poly, j, n, pthash, pvhash, RESOLUTION);
			// pv = null;
			if (pv) {
				var seg = recog[pv[0]][pv[1]][pv[2]];
				var z1 = bezpt(poly[j], RESOLUTION);
				var z4 = bezpt(poly[n], RESOLUTION);
				if (Math.hypot(z1.x - seg.points[0].x, z1.y - seg.points[0].y) < 1 / RESOLUTION
					&& Math.hypot(z4.x - seg.points[3].x, z4.y - seg.points[3].y) < 1 / RESOLUTION) {
					ans.push(new Bezier(z1, seg.points[1], seg.points[2], z4));
				} else if (Math.hypot(z1.x - seg.points[3].x, z1.y - seg.points[3].y) < 1 / RESOLUTION
					&& Math.hypot(z4.x - seg.points[0].x, z4.y - seg.points[0].y) < 1 / RESOLUTION) {
					ans.push(new Bezier(z1, seg.points[2], seg.points[1], z4));
				} else {
					var t1 = seg.project(z1).t;
					var t4 = seg.project(z4).t;
					if (t1 < t4) {
						var sseg = seg.split(t1, t4);
						ans.push(new Bezier(z1, sseg.points[1], sseg.points[2], z4));
					} else if (t1 > t4) {
						var sseg = seg.split(t4, t1);
						ans.push(new Bezier(z1, sseg.points[2], sseg.points[1], z4));
					}
				}
			} else {
				for (var m = j; m < n; m++) {
					ans.push(new Bezier(
						bezpt(poly[m], RESOLUTION),
						bezpt(poly[m], RESOLUTION),
						bezpt(poly[m + 1], RESOLUTION),
						bezpt(poly[m + 1], RESOLUTION)
					));
				}
			}
		}
		j = n;
	}
	return ans;
}

exports.rebuildShape = rebuildShape;
