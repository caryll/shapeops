var Bezier = require("bezier-js");

function keyofz(z) {
	return "X" + z.X + "Y" + z.Y;
}
function toPoly(shape, sindex, pthash, pvhash, RESOLUTION) {
	var ans = [];
	for (var j = 0; j < shape.length; j++) {
		var points = [];
		var contour = shape[j];
		for (var k = 0; k < contour.length; k++) {
			if (contour[k]._linear) {
				var X = Math.round(contour[k].points[0].x * RESOLUTION);
				var Y = Math.round(contour[k].points[0].y * RESOLUTION);
				var z = { X: X, Y: Y };
				var zk = keyofz(z);
				pthash[zk] = 0;
				points.push(z);

				X = Math.round(contour[k].points[3].x * RESOLUTION);
				Y = Math.round(contour[k].points[3].y * RESOLUTION);
				z = { X: X, Y: Y };
				zk = keyofz(z);
				pthash[zk] = 0;
				points.push(z);
				continue;
			}
			var segpts = contour[k].getLUT(Math.max(5, Math.ceil(contour[k].length() / 5))).map(function (z) {
				var X = Math.round(z.x * RESOLUTION);
				var Y = Math.round(z.y * RESOLUTION);
				return { X: X, Y: Y };
			});
			for (var m = 0; m < segpts.length; m++) {
				var zk = keyofz(segpts[m]);
				var isMid = m > 0 && m < segpts.length - 1;
				if (isMid) {
					pthash[zk] = pthash[zk] === 0 ? 0 : 1;
					if (pthash[zk]) pvhash[zk] = [sindex, j, k, m];
				} else {
					pthash[zk] = 0;
				}
			}
			points = points.concat(segpts.slice(k > 0 ? 1 : 0));
		}
		ans.push(points);
	}
	return ans;
}

exports.keyofz = keyofz;
exports.toPoly = toPoly;
