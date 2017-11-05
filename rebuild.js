const Bezier = require("bezier-js");
const keyofz = require("./toPoly").keyofz;

function rebuildShape(polys, seghash, termhash, RESOLUTION) {
	let ans = [];
	for (let c = 0; c < polys.length; c++) {
		let cx = rebuildContour(polys[c], seghash, termhash, RESOLUTION);
		if (cx.length) {
			ans.push(cx);
		}
	}
	return ans;
}
function split(s, t1, t2) {
	if (t1 > t2) {
		let b = s.split(t2, t1);
		return new Bezier(...b.points.reverse());
	} else {
		return s.split(t1, t2);
	}
}
function bezpt(Z, RESOLUTION) {
	return { x: Z.X / RESOLUTION, y: Z.Y / RESOLUTION };
}
function rebuildContour(_poly, seghash, termhash, RESOLUTION) {
	let j0 = 0;
	for (; j0 < _poly.length && !termhash.has(keyofz(_poly[j0])); j0++);
	const poly = _poly.slice(j0).concat(_poly.slice(0, j0 + 1));
	let primSegments = [];
	for (let j = 0; j < poly.length - 1; j++) {
		const segkey = keyofz(poly[j]) + "-" + keyofz(poly[j + 1]);
		if (seghash.has(segkey)) {
			primSegments.push(seghash.get(segkey));
		} else {
			primSegments.push([
				new Bezier(
					bezpt(poly[j], RESOLUTION),
					bezpt(poly[j], RESOLUTION),
					bezpt(poly[j + 1], RESOLUTION),
					bezpt(poly[j + 1], RESOLUTION)
				),
				0,
				1
			]);
		}
	}
	let ans = [primSegments[0]];
	for (let j = 1; j < primSegments.length; j++) {
		const last = ans[ans.length - 1];
		if (primSegments[j][0] === last[0]) {
			// annex
			if (last[1] < last[2]) {
				last[1] = Math.min(last[1], primSegments[j][1]);
				last[2] = Math.max(last[2], primSegments[j][2]);
			} else {
				last[1] = Math.max(last[1], primSegments[j][1]);
				last[2] = Math.min(last[2], primSegments[j][2]);
			}
		} else {
			// push
			ans.push(primSegments[j]);
		}
	}
	return ans.map(([s, t1, t2]) => split(s, t1, t2));
}

exports.rebuildShape = rebuildShape;
