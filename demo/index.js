var lib = require('../index');

function drawShape(hDC, shape, color, fcolor) {
	hDC.save();
	hDC.translate(500, 500);
	hDC.scale(2, -2);
	hDC.strokeStyle = color;
	hDC.fillStyle = fcolor;
	hDC.beginPath();
	for (var c = 0; c < shape.length; c++) {
		var contour = shape[c];
		hDC.moveTo(contour[0].x, contour[0].y)
		for (var j = 0; j < contour.length; j++) {
			var z1 = contour[j % contour.length];
			if (z1.on) {
				hDC.lineTo(z1.x, z1.y);
			} else {
				var z2 = contour[(j + 1) % contour.length];
				var z3 = contour[(j + 2) % contour.length];
				hDC.bezierCurveTo(z1.x, z1.y, z2.x, z2.y, z3.x, z3.y);
				j += 2;
			}
		}
		hDC.lineTo(contour[0].x, contour[0].y)
	}
	hDC.stroke();
	hDC.fill();
	hDC.closePath();
	for (var c = 0; c < shape.length; c++) {
		var contour = shape[c];
		for (var j = 0; j < contour.length; j++) {
			var z1 = contour[j % contour.length];
			hDC.fillStyle = j === 0 ? color : "white";
			if (z1.on) {
				hDC.strokeRect(z1.x - 1, z1.y - 1, 2, 2);
				hDC.fillRect(z1.x - 1, z1.y - 1, 2, 2);
			}
		}
	}
	hDC.restore();
}

var hDC = document.getElementById('out').getContext('2d');

function randcoord(c) {
	return Math.round(Math.random() * 100 - 50 + c);
}
function randshape(n, m) {
	var out = [];
	for (var c = 0; c < n; c++) {
		var cx = randcoord(0) * 5;
		var cy = randcoord(0) * 5;
		var contour = [{ x: randcoord(cx), y: randcoord(cy), on: true }];
		for (var j = 0; j < m; j++) {
			var curve = Math.random() < 0.5;
			if (curve) {
				contour.push(
					{ x: randcoord(cx), y: randcoord(cy), on: false, cubic: true },
					{ x: randcoord(cx), y: randcoord(cy), on: false, cubic: true },
					{ x: randcoord(cx), y: randcoord(cy), on: true }
				)
			} else {
				contour.push(
					{ x: randcoord(cx), y: randcoord(cy), on: true }
				)
			}
		}
		contour.push(contour[0]);
		out.push(contour);
	}
	return out;
}

var in1 = randshape(3, 15);
var in2 = randshape(3, 15);
drawShape(hDC, in1, 'transparent', 'rgba(255, 0, 0, 0.05)');
drawShape(hDC, in2, 'transparent', 'rgba(0, 255, 0, 0.05)');
//var result = lib.removeOverlap(in1, 1);
var result = lib.boolop(1, in1, in2, 1, 1);
drawShape(hDC, result, 'black', 'transparent');