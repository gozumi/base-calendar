if(!Array.prototype.last) {
	Array.prototype.last = function() {
		return this[this.length - 1];
	};
}

//---------- CONSTANTS

var ONE_DAY=1000*60*60*24;


//---------- Date formatters

var day = d3.time.format("%w"),
	week = d3.time.format("%U"),
	monthText = d3.time.format('%B'),
	month = d3.time.format('%m'),
	year = d3.time.format('%Y'),
	percent = d3.format(".1%"),
	format = d3.time.format("%Y-%m-%d");

//---------- Private Variables

var _containerWidth = window.innerWidth;
	_containerHeight = 600;
	_calendarWidth = window.innerWidth,
	_calendarHeight = 400,
	dateRange = _getDateRange(new Date());



var	cellWidth = Math.round(_calendarWidth / dateRange.weekCount),
	cellHeight = Math.round(_calendarHeight / 7);
	// originX = 0,
	// shiftSize = cellWidth * 30;
	// fromYear = 2011,
	// toYear = 2013;

var xFisheye = d3.fisheye.scale(d3.scale.identity).domain([0, _calendarWidth]).focus(_calendarWidth/2);
//	yFisheye = d3.fisheye.scale(d3.scale.identity).domain([0, height]).focus(90);
var color = d3.scale.quantize().domain([-0.05, 0.05]).range(d3.range(11).map(function(d) {
	return "q" + d + "-11";
}));



//var focusDate = new Date();

//var startWeek = week(getDateRange(focusDate).days[0]);


var svg = d3.select("body").append("svg").attr("width", _containerWidth).attr("height", _containerHeight).attr("class", "RdYlGn").append("g").attr("transform", "translate(0,60)");

var dayGroup = svg.selectAll(".day").data(dateRange.days, keyFunctionDay).enter().append('g').attr('class', 'day');

dayGroup.append("path").attr("d", dayPath).attr("class", "dayRect").append("title").text(function(d) {
	return format(d);
});
d3.selectAll('g.day').append("path").attr("d", monthPath).attr("class", "monthLine");
// }).datum(format);

// var months = svg.selectAll(".month").data(getDateRange(focusDate).months, keyFunctionMonth).enter().append("g").attr("class", "month").append('path').attr('class', 'monthBound').attr('d', monthPath);

// var monthLabels = svg.selectAll(".month").append('text').attr('y', -10).attr('class', 'monthLabel').text(function(d){
// 	return monthText(d) + ' ' + year(d);
// }).attr('x', function(d){
// 	var xPos,
// 		firstDayOfMonth = Number(day(new Date(d.getFullYear(), Number(month(d))-1, 1)));

// 	if (firstDayOfMonth === 0) {
// 		xPos = xFisheye(( (week(d) - startWeek) * cellWidth ) + weekOffset(d) + 5);
// 	} else {
// 		xPos = xFisheye(( (week(d) - startWeek) * cellWidth ) + weekOffset(d) + cellWidth + 5);
// 	}

// 	return xPos;
// });

function dayPath(d) {
	var startX = dateRange.weekNumber(d) * cellWidth;
	var startY = day(d) * cellHeight;

	var x1 = xFisheye(startX);
	var x2 = xFisheye(startX+cellWidth);
	var x3 = xFisheye(startX+cellWidth);
	var x4 = xFisheye(startX);
	var y1 = startY;
	var y2 = startY;
	var y3 = startY+cellHeight;
	var y4 = startY+cellHeight;

	var pathString = 'M' + x1 + ' ' + y1 + ' ';
	pathString = pathString + 'L' + x2 + ' ' + y2 + ' ';
	pathString = pathString + 'L' + x3 + ' ' + y3 + ' ';
	pathString = pathString + 'L' + x4 + ' ' + y4 + ' Z';

	return pathString;
}

function monthPath(d) {
	var x1 = dateRange.weekNumber(d) * cellWidth;
	var y1 =  (day(d) * cellHeight) + cellHeight;
	var y2 = y1 - cellHeight;
	var x2 = x1 + cellWidth;
	var pathString;

	if (d.getDate() <= 7 ) {
		pathString = 'M' + xFisheye(x1) + ' ' + y1 + ' ' + 'L' + xFisheye(x1) + ' ' + y2;
		if (d.getDate() === 1 && Number(day(d)) > 0) {
			pathString = pathString +  ' ' + 'L' + xFisheye(x2) + ' ' + y2;
		}
	} else {
		pathString = 'M' + xFisheye(x1) + ' ' + y1 + ' ' + 'L' + xFisheye(x1) + ' ' + y1;
		if (d.getDate() === 1 && Number(day(d)) > 0) {
			pathString = pathString +  ' ' + 'L' + xFisheye(x2) + ' ' + y1;
		}
	}

	if (d.getDate() === 1 && Number(day(d)) > 0) {
		pathString = pathString +  ' ' + 'L' + xFisheye(x2) + ' ' + y2;
	}

	return pathString;
}

function weekOffset(d) {
	var dateRange = getDateRange(focusDate);
	var years = d3.range(dateRange.days[0].getFullYear(), Number(year(d)));
	var accumuletedWeekNumber = 0;

	for (var i = 0; i < years.length; i++) {
		if (day(new Date(years[i]+1,0,1)) == "0") {
			accumuletedWeekNumber = accumuletedWeekNumber + 1;
		}
		accumuletedWeekNumber = accumuletedWeekNumber + Number(week(new Date( years[i], 11, 31)));
	}
	return accumuletedWeekNumber * cellWidth;
}

d3.select("div.forward").on("click", function() {
	var focusDate = new Date(dateRange.focusDate.getTime()+(30*ONE_DAY));
	dateRange = _getDateRange(focusDate);

	var days = svg.selectAll(".day").data(dateRange.days, keyFunctionDay);
	days.exit().remove();
	var dayGroups = days.enter().append('g').attr('class', 'day');
	dayGroups.append("path").attr("d", dayPath).attr("class", "dayRect").append("title").text(function(d) {
		return format(d);
	});

	var monthGroups = days.enter().append("path").attr("d", monthPath).attr("class", "monthLine");
	
	svg.selectAll("path.dayRect").transition().duration(400).attr('d', dayPath);
	svg.selectAll("path.monthLine").transition().duration(400).attr('d', monthPath);
});

d3.select("div.backward").on("click", function() {
	var focusDate = new Date(dateRange.focusDate.getTime()-(30*ONE_DAY));
	dateRange = _getDateRange(focusDate);

	var days = svg.selectAll(".day").data(dateRange.days, keyFunctionDay);
	days.exit().remove();
	var dayGroups = days.enter().append('g').attr('class', 'day');
	dayGroups.append("path").attr("d", dayPath).attr("class", "dayRect").append("title").text(function(d) {
		return format(d);
	});

	var monthGroups = days.enter().append("path").attr("d", monthPath).attr("class", "monthLine");
	
	svg.selectAll("path.dayRect").transition().duration(400).attr('d', dayPath);
	svg.selectAll("path.monthLine").transition().duration(400).attr('d', monthPath);
});

// d3.csv("dji.csv", function(error, csv) {
// 	var data = d3.nest().key(function(d) {
// 		return d.Date;
// 	}).rollup(function(d) {
// 		return(d[0].Close - d[0].Open) / d[0].Open;
// 	}).map(csv);

// 	days.filter(function(d) {
// 		return format(d) in data;
// 	}).attr("class", function(d) {
// 		return "day " + color(data[d]);
// 	}).select("title").text(function(d) {
// 		return format(d) + ": " + percent(data[d]);
// 	});
// });


function keyFunctionDay(d) {
	return format(d);
}

function keyFunctionMonth(d) {
	return monthText(d) + ' ' + year(d);
}

function _getDateRange(targetDate) {
	var fromDate = new Date(targetDate.getTime() - (ONE_DAY * 180));
	fromDate = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);
	var toDate = new Date(targetDate.getTime() + (ONE_DAY * 180));
	toDate = new Date(toDate.getFullYear(), toDate.getMonth() + 1, 0);
	toDate = new Date(toDate.getTime() + ONE_DAY);

	var days = d3.time.days(fromDate, toDate);
	var months = d3.time.months(fromDate, toDate);
	var weekCount = Math.floor(days.length/7);
	if ((days.length % 7) > 0) {
		weekCount++;
	}
	if (day(days.last()) < day(days[0])) {
		weekCount++;
	}

	var rangeObject = {
		focusDate: targetDate,
		days: days,
		months: months,
		weekCount: weekCount,
		weekNumber: function(date) {
			var justTheDatePart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
			var weekNumber;
			for(var i = 0; i < this.days.length; i++) {
				if(justTheDatePart.getTime() == this.days[i].getTime()) {
					weekNumber = Math.floor(i / 7);
					if (day(days[i]) < day(days[0])) {
						weekNumber++;
					}
					return weekNumber;
				}
			}
			return weekNumber;
		}
	};

	return rangeObject;
}























