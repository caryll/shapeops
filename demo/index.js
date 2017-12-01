const lib = require("../index");

function drawShape(hDC, shape, color, fcolor) {
	console.log(shape);
	hDC.save();
	hDC.translate(0, 800);
	hDC.scale(0.75, -0.75);
	hDC.strokeStyle = color;
	hDC.fillStyle = fcolor;
	hDC.beginPath();
	for (let c = 0; c < shape.length; c++) {
		let contour = shape[c];
		hDC.moveTo(contour[0].x, contour[0].y);
		for (let j = 0; j < contour.length; j++) {
			let z1 = contour[j % contour.length];
			if (z1.on) {
				hDC.lineTo(z1.x, z1.y);
			} else {
				let z2 = contour[(j + 1) % contour.length];
				let z3 = contour[(j + 2) % contour.length];
				hDC.bezierCurveTo(z1.x, z1.y, z2.x, z2.y, z3.x, z3.y);
				j += 2;
			}
		}
		hDC.lineTo(contour[0].x, contour[0].y);
	}
	hDC.stroke();
	hDC.fill();
	hDC.closePath();
	for (let c = 0; c < shape.length; c++) {
		let contour = shape[c];
		for (let j = 0; j < contour.length; j++) {
			let z1 = contour[j % contour.length];
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

let hDC = document.getElementById("out").getContext("2d");

function randcoord(c) {
	return Math.round(Math.random() * 300 - 150 + c);
}
function randshape(n, m) {
	let out = [];
	for (let c = 0; c < n; c++) {
		let cx = randcoord(0) * 5;
		let cy = randcoord(0) * 5;
		let contour = [
			{
				x: randcoord(cx),
				y: randcoord(cy),
				on: true
			}
		];
		for (let j = 0; j < m; j++) {
			let curve = Math.random() < 0.5;
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
				contour.push({
					x: randcoord(cx),
					y: randcoord(cy),
					on: true
				});
			}
		}
		contour.push(contour[0]);
		out.push(contour);
	}
	return out;
}

const BASIC_Z_SHAPE = [
	[
		{ on: true, x: 72, y: 56 },
		{ on: true, x: 218, y: 56 },
		{ on: true, x: 218, y: 202 },
		{ on: true, x: 72, y: 202 },
		{ on: true, x: 72, y: 56 }
	],
	[
		{ on: true, x: 163, y: 217 },
		{ on: false, x: 163, y: 176 },
		{ on: false, x: 196, y: 143 },
		{ on: true, x: 237, y: 143 },
		{ on: false, x: 278, y: 143 },
		{ on: false, x: 311, y: 176 },
		{ on: true, x: 311, y: 217 },
		{ on: false, x: 311, y: 258 },
		{ on: false, x: 278, y: 291 },
		{ on: true, x: 237, y: 291 },
		{ on: false, x: 196, y: 291 },
		{ on: false, x: 163, y: 258 },
		{ on: true, x: 163, y: 217 }
	]
];

let in1 = [
	[
		{ x: 125, y: 0, on: true },
		{ x: 125, y: 1085, on: true },
		{ x: 274, y: 1085, on: true },
		{ x: 274, y: 0, on: true }
	],
	[
		{ x: 750, y: 0, on: true },
		{ x: 750, y: 635, on: true },
		{ x: 749.3333282470703, y: 725, on: false },
		{ x: 732, y: 798, on: false },
		{ x: 698, y: 854, on: true },
		{ x: 677.3333282470703, y: 892, on: false },
		{ x: 650, y: 921, on: false },
		{ x: 616, y: 941, on: true },
		{ x: 586, y: 958.3333282470703, on: false },
		{ x: 551.3333282470703, y: 967, on: false },
		{ x: 512, y: 967, on: true },
		{ x: 472.6666717529297, y: 967, on: false },
		{ x: 438, y: 958.3333282470703, on: false },
		{ x: 408, y: 941, on: true },
		{ x: 374, y: 921, on: false },
		{ x: 346.6666717529297, y: 892, on: false },
		{ x: 326, y: 854, on: true },
		{ x: 292, y: 798, on: false },
		{ x: 274.6666717529297, y: 725, on: false },
		{ x: 274, y: 635, on: true },
		{ x: 274, y: 631, on: true },
		{ x: 213, y: 631, on: true },
		{ x: 213, y: 635, on: true },
		{ x: 213.6666717529297, y: 758.3333282470703, on: false },
		{ x: 237, y: 860, on: false },
		{ x: 283, y: 940, on: true },
		{ x: 315, y: 994.6666717529297, on: false },
		{ x: 355, y: 1036, on: false },
		{ x: 403, y: 1064, on: true },
		{ x: 447, y: 1089.3333282470703, on: false },
		{ x: 498.3333282470703, y: 1102, on: false },
		{ x: 557, y: 1102, on: true },
		{ x: 615, y: 1102, on: false },
		{ x: 666.3333282470703, y: 1089.3333282470703, on: false },
		{ x: 711, y: 1064, on: true },
		{ x: 759, y: 1035.3333282470703, on: false },
		{ x: 798.3333282470703, y: 994, on: false },
		{ x: 829, y: 940, on: true },
		{ x: 875.6666717529297, y: 860, on: false },
		{ x: 899, y: 758.3333282470703, on: false },
		{ x: 899, y: 635, on: true },
		{ x: 899, y: 0, on: true }
	]
];
let in2 = randshape(1, 10);
//drawShape(hDC, in1, "blue", "rgba(255, 0, 0, 0.05)");
//drawShape(hDC, in2, "green", "transparent");
//debugger;
let result = lib.removeOverlap(in2, 1, 100);
//console.log(JSON.stringify(result));
//let result = lib.boole(1, in1, in2, 1, 1);
drawShape(hDC, result, "black", "rgba(0, 255, 0, 0.05)");
