var lib = require("../index");

function drawShape(hDC, shape, color, fcolor) {
	console.log(shape);
	hDC.save();
	hDC.translate(200, 800);
	hDC.scale(1, -1);
	hDC.strokeStyle = color;
	hDC.fillStyle = fcolor;
	hDC.beginPath();
	for (var c = 0; c < shape.length; c++) {
		var contour = shape[c];
		hDC.moveTo(contour[0].x, contour[0].y);
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
		hDC.lineTo(contour[0].x, contour[0].y);
	}
	hDC.stroke();
	hDC.fill();
	hDC.closePath();
	for (var c = 0; c < shape.length; c++) {
		var contour = shape[c];
		for (var j = 0; j < contour.length; j++) {
			var z1 = contour[j % contour.length];
			if (z1.on) {
				hDC.fillStyle = color;
				hDC.strokeRect(z1.x - 1, z1.y - 1, 2, 2);
			} else {
				hDC.fillStyle = "white";
				hDC.strokeRect(z1.x - 1, z1.y - 1, 2, 2);
				hDC.fillRect(z1.x - 1, z1.y - 1, 2, 2);
			}
		}
	}
	hDC.restore();
}

var hDC = document.getElementById("out").getContext("2d");

function randcoord(c) {
	return Math.round(Math.random() * 100 - 50 + c);
}
function randshape(n, m) {
	var out = [];
	for (var c = 0; c < n; c++) {
		var cx = randcoord(0) * 5;
		var cy = randcoord(0) * 5;
		var contour = [{
			x: randcoord(cx),
			y: randcoord(cy),
			on: true
		}];
		for (var j = 0; j < m; j++) {
			var curve = Math.random() < 0.5;
			if (curve) {
				contour.push(
					{
						x: randcoord(cx),
						y: randcoord(cy),
						on: false,
						cubic: true
					},
					{
						x: randcoord(cx),
						y: randcoord(cy),
						on: false,
						cubic: true
					},
					{
						x: randcoord(cx),
						y: randcoord(cy),
						on: true
					}
				);
			} else {
				contour.push(
					{
						x: randcoord(cx),
						y: randcoord(cy),
						on: true
					}
				);
			}
		}
		contour.push(contour[0]);
		out.push(contour);
	}
	return out;
}

var in1 = [[
	{ "x": 818, "y": 928, "on": true },
	{ "x": 490.58167701305132, "y": 928, "on": false },
	{ "x": 119.36605542567935, "y": 789.56922252138634, "on": false },
	{ "x": -43.128428624165792, "y": 598.83193769835407, "on": true },
],
[
	{ "x": -264.0, "y": -98.0, "on": true },
	{ "x": -264.0, "y": 211.28227904194409, "on": false },
	{ "x": -142.41574982367075, "y": 518.24809985172965, "on": false },
	{ "x": 56.865397392878748, "y": 700.49092773837606, "on": true },
],
];;
var in2 = randshape(3, 15);
//drawShape(hDC, in1, "blue", "rgba(255, 0, 0, 0.05)");
//drawShape(hDC, in2, "transparent", "rgba(0, 255, 0, 0.05)");
//debugger;
var result = lib.removeOverlap(in1, 1, 100000);
console.log(JSON.stringify(result));
// var result = lib.boole(1, in1, in2, 1, 1);
drawShape(hDC, result, "black", "transparent");
