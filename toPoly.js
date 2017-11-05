"use strict";

function keyofz(z) {
	return "X" + z.X + "Y" + z.Y;
}
function by_t(a, b) {
	return a.t - b.t;
}
function filterKnots(knots) {
	knots = knots.sort(by_t);
	let ans = [knots[0]];
	for (let z of knots) {
		const last = ans[ans.length - 1];
		if (z.X !== last.X || z.Y !== last.Y) {
			ans.push(z);
		} else {
			last.t = z.t < 1 / 2 ? Math.min(z.t, last.t) : Math.max(z.t, last.t);
		}
	}
	return ans;
}
function setSegHash(seghash, key, entry) {
	if (seghash.has(key)) {
		const [seg, t1, t2, sindex, j, k] = entry;
		const [seg1, t11, t21, sindex1, j1, k1] = seghash.get(key);
		if (
			sindex < sindex1 ||
			(sindex === sindex1 && j < j1) ||
			(sindex === sindex1 && j === j1 && k < k1)
		) {
			seghash.set(key, entry);
		}
	} else {
		seghash.set(key, entry);
	}
}
function toPoly(shape, sindex, splats, seghash, termhash, RESOLUTION) {
	let ans = [];
	for (let j = 0; j < shape.length; j++) {
		let points = [];
		const contour = shape[j];
		const splat = splats[j];
		for (let k = 0; k < contour.length; k++) {
			let knots = [];
			const nStaticBreaks = contour[k]._linear
				? 1
				: Math.max(5, Math.ceil(contour[k].length() / 5));
			for (let j = 0; j <= nStaticBreaks; j++) {
				const z = contour[k].compute(j / nStaticBreaks);
				const knot = {
					X: Math.round(z.x * RESOLUTION),
					Y: Math.round(z.y * RESOLUTION),
					t: j / nStaticBreaks
				};
				knots.push(knot);
				if (j === 0 || (j === nStaticBreaks && k === contour.length - 1)) {
					termhash.add(keyofz(knot));
				}
			}

			for (let s of splat) {
				if (s.t <= k || s.t >= k + 1) continue;
				const knot = {
					X: Math.round(s.x * RESOLUTION),
					Y: Math.round(s.y * RESOLUTION),
					t: s.t - k
				};
				knots.push(knot);
				termhash.add(keyofz(knot));
			}
			knots = filterKnots(knots);
			for (let j = 0; j < knots.length - 1; j++) {
				setSegHash(seghash, keyofz(knots[j]) + "-" + keyofz(knots[j + 1]), [
					contour[k],
					knots[j].t,
					knots[j + 1].t,
					sindex,
					j,
					k
				]);
				setSegHash(seghash, keyofz(knots[j + 1]) + "-" + keyofz(knots[j]), [
					contour[k],
					knots[j + 1].t,
					knots[j].t,
					sindex,
					j,
					k
				]);
			}
			points = points.concat(knots.slice(k > 0 ? 1 : 0));
		}
		ans.push(points);
	}
	return ans;
}

exports.keyofz = keyofz;
exports.toPoly = toPoly;
