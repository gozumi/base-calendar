var width = 960,
	height = 180,
	xSteps = d3.range(10, width, 16),
	ySteps = d3.range(10, height, 16);

var xFisheye = d3.fisheye.scale(d3.scale.identity).domain([0, width]).focus(360),
	yFisheye = d3.fisheye.scale(d3.scale.identity).domain([0, height]).focus(90);

var svg = d3.select("#chart3").append("svg").attr("width", width).attr("height", height).append("g").attr("transform", "translate(-.5,-.5)");

svg.append("rect").attr("class", "background").attr("width", width).attr("height", height);

var xLine = svg.selectAll(".x").data(xSteps).enter().append("line").attr("class", "x").attr("y2", height);

var yLine = svg.selectAll(".y").data(ySteps).enter().append("line").attr("class", "y").attr("x2", width);

var pathRect = svg.selectAll(".rect").data(d3.range(0,2)).enter().append("path").attr('fill', '#CCC').attr("d", drawPathRect(0, 0, 100, 50));
// <path d="M150 0 L75 200 L225 200 Z" />

redraw();

svg.on("mousemove", function() {
	var mouse = d3.mouse(this);
	xFisheye.focus(mouse[0]);
	yFisheye.focus(mouse[1]);
	redraw();
});

function redraw() {
	xLine.attr("x1", xFisheye).attr("x2", xFisheye);
	yLine.attr("y1", yFisheye).attr("y2", yFisheye);
	pathRect.attr('d', drawPathRect(0, 0, 100, 50));
}


function drawPathRect(startX, startY, w, h) {
	startX = xFisheye(startX);
	startY = yFisheye(startY);
	w = xFisheye(w);
	h = yFisheye(h);

	var d = 'M' + startX + ' ' + startY + ' ';
	d = d + 'L' + (startX + w) + ' ' + startY + ' ';
	d = d + 'L' + (startX + w) + ' ' + (startY + h) + ' ';
	d = d + 'L' + startX + ' ' + (startY + h) + ' Z';

	return d;
}







