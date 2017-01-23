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
			hDC.fillStyle = j === 0 ? color : "white";
			//	if (z1.on) {
			hDC.strokeRect(z1.x - 1, z1.y - 1, 2, 2);
			hDC.fillRect(z1.x - 1, z1.y - 1, 2, 2);
		//	}
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

var in1 = [[{"x": 54.440652041410274,"y": 0,"on": true}, {"x": 54.44065204141029,"y": 735,"on": true}, {"x": 74.68792686522303,"y": 735,"on": true}, {"x": 74.68792686522303,"y": 0,"on": true}, {"x": 54.440652041410274,"y": 0,"on": true}], [{"x": 62.44065204141029,"y": 735,"on": true}, {"x": 356.4406520414102,"y": 735,"on": true}, {"x": 356.4406520414102,"y": 717,"on": true}, {"x": 62.4406520414103,"y": 717,"on": true}, {"x": 62.44065204141029,"y": 735,"on": true}], [{"x": 62.440652041410274,"y": 391.2,"on": true}, {"x": 300.7006520414102,"y": 391.2,"on": true}, {"x": 300.7006520414102,"y": 373.2,"on": true}, {"x": 62.4406520414103,"y": 373.2,"on": true}, {"x": 62.440652041410274,"y": 391.2,"on": true}], [{"x": 64.56428945331668,"y": 717,"on": true}, {"x": -19.166156285582375,"y": 717,"on": true}, {"x": -22.340041938334736,"y": 735,"on": true}, {"x": 64.56428945331666,"y": 735,"on": true}, {"x": 64.56428945331668,"y": 717,"on": true}], [{"x": 151.4686208449681,"y": 0,"on": true}, {"x": -18.531379155031914,"y": 0,"on": true}, {"x": -21.705264807784282,"y": 18,"on": true}, {"x": 148.2947351922157,"y": 18,"on": true}, {"x": 151.4686208449681,"y": 0,"on": true}], [{"x": 356.4406520414103,"y": 735,"on": true}, {"x": 356.4406520414102,"y": 590,"on": true}, {"x": 336.19337721759746,"y": 590,"on": true}, {"x": 336.1933772175976,"y": 735,"on": true}, {"x": 356.4406520414103,"y": 735,"on": true}], [{"x": 62.44065204141027,"y": 18,"on": true}, {"x": 356.4406520414102,"y": 18,"on": true}, {"x": 356.4406520414102,"y": 0,"on": true}, {"x": 62.440652041410274,"y": 0,"on": true}, {"x": 62.44065204141027,"y": 18,"on": true}], [{"x": 64.56428945331666,"y": 0,"on": true}, {"x": -18.5313791550319,"y": 0,"on": true}, {"x": -21.705264807784268,"y": 18,"on": true}, {"x": 64.56428945331666,"y": 18,"on": true}, {"x": 64.56428945331666,"y": 0,"on": true}], [{"x": 336.1933772175976,"y": 0,"on": true}, {"x": 336.1933772175975,"y": 145,"on": true}, {"x": 356.44065204141026,"y": 145,"on": true}, {"x": 356.4406520414103,"y": 0,"on": true}, {"x": 336.1933772175976,"y": 0,"on": true}]];
var in2 = randshape(3, 15);
drawShape(hDC, in1, "blue", "rgba(255, 0, 0, 0.05)");
drawShape(hDC, in2, "transparent", "rgba(0, 255, 0, 0.05)");
debugger;
var result = lib.removeOverlap(in1, 1, 1000);
// var result = lib.boole(1, in1, in2, 1, 1);
drawShape(hDC, result, "black", "transparent");
