//----------- Array enhancement
if(!Array.prototype.last) {
	Array.prototype.last = function() {
		return this[this.length - 1];
	};
}

//---------- CONSTANTS
var ONE_DAY = 1000 * 60 * 60 * 24,
	SHIFT_DAYS = 30,
	DURATION = 500;


//---------- Date formatters
var day = d3.time.format("%w"),
	week = d3.time.format("%U"),
	monthText = d3.time.format('%B'),
	month = d3.time.format('%m'),
	year = d3.time.format('%Y'),
	percent = d3.format(".1%"),
	format = d3.time.format("%Y-%m-%d");

//---------- Private Variables
var _containerWidth = window.innerWidth,
	_containerHeight = 600,
	_calendarWidth = window.innerWidth,
	_calendarHeight = 400,
	dateRange = _getDateRange(new Date());


var cellWidth = Math.round(_calendarWidth / dateRange.weekCount),
	cellHeight = Math.round(_calendarHeight / 7);

var xFisheye = d3.fisheye.scale(d3.scale.identity).domain([0, _calendarWidth]).focus(_calendarWidth / 2);

var color = d3.scale.quantize().domain([-0.05, 0.05]).range(d3.range(11).map(function(d) {
	return "q" + d + "-11";
}));

var svg = d3.select("body").append("svg").attr('id', 'gozumi-calendar').attr("width", _containerWidth).attr("height", _containerHeight).attr("class", "RdYlGn").append("g").attr("transform", "translate(0,60)");


//------------ Initialisation funtion
(function init() {
	svg.selectAll('g.day').data(dateRange.days, keyFunctionDay).enter().append('g').attr('class', 'day').append("path").attr("d", dayPath).attr("class", function(d){
		if ((d.getMonth() % 2)) {
			return "dayRect odd";

		} else {
			return "dayRect even";
		}
	}).append("title").text(function(d) {
		return format(d);
	});
	svg.selectAll("g.day").append('text').attr('class', function(d){
		if ((d.getMonth() % 2)) {
			return "date odd";

		} else {
			return "date even";
		}
	}).text(function(d){
		return d.getDate();
	}).attr('x', function(d){
		return xFisheye((dateRange.weekNumber(d) * cellWidth) + 4);
	}).attr('y', function(d){
		return (day(d) * cellHeight) + 14;
	});

	svg.selectAll('text.monthLabel').data(dateRange.months, keyFunctionMonth).enter().append('text').attr('class', 'monthLabel').attr('y', -10).text(function(d){
		return monthText(d) + ' ' + d.getFullYear();
	}).attr('x', function(d){
		return xFisheye((dateRange.weekNumber(d) * cellWidth) + cellWidth + (cellWidth/2));
	});
})();


function dayPath(d) {
	var startX = dateRange.weekNumber(d) * cellWidth;
	var startY = day(d) * cellHeight;

	var x1 = xFisheye(startX) + 1;
	var x2 = xFisheye(startX + cellWidth) - 1;
	var x3 = xFisheye(startX + cellWidth) - 1;
	var x4 = xFisheye(startX) + 1;
	var y1 = startY + 1;
	var y2 = startY + 1;
	var y3 = startY + cellHeight - 1;
	var y4 = startY + cellHeight - 1;

	var pathString = 'M' + x1 + ' ' + y1 + ' ';
	pathString = pathString + 'L' + x2 + ' ' + y2 + ' ';
	pathString = pathString + 'L' + x3 + ' ' + y3 + ' ';
	pathString = pathString + 'L' + x4 + ' ' + y4 + ' Z';

	return pathString;
}

function weekOffset(d) {
	var dateRange = getDateRange(focusDate);
	var years = d3.range(dateRange.days[0].getFullYear(), Number(year(d)));
	var accumuletedWeekNumber = 0;

	for(var i = 0; i < years.length; i++) {
		if(day(new Date(years[i] + 1, 0, 1)) == "0") {
			accumuletedWeekNumber = accumuletedWeekNumber + 1;
		}
		accumuletedWeekNumber = accumuletedWeekNumber + Number(week(new Date(years[i], 11, 31)));
	}
	return accumuletedWeekNumber * cellWidth;
}


//---------------------- Forward event handler
d3.select("div.forward").on("click", function() {
	var firstOfNewDays = new Date(dateRange.days.last().getTime() + ONE_DAY);
	var lastOfNewDays = new Date(firstOfNewDays.getTime() + (ONE_DAY * 40));
	dateRange.days = [].concat(dateRange.days, d3.time.days(firstOfNewDays, lastOfNewDays));
	dateRange.months = [].concat(dateRange.months, d3.time.months(firstOfNewDays, lastOfNewDays));

	// Draw new days and months out of view so that they slide in nicely
	var days = svg.selectAll('g.day').data(dateRange.days, keyFunctionDay).enter().append('g');
	days.attr('class', 'day').append("path").attr("d", dayPath).attr("class", function(d){
		if ((d.getMonth() % 2)) {
			return "dayRect odd";

		} else {
			return "dayRect even";
		}
	}).append("title").text(function(d) {
		return format(d);
	});
	days.append('text').attr('class', function(d){
		if ((d.getMonth() % 2)) {
			return "date odd";

		} else {
			return "date even";
		}
	}).text(function(d){
		return d.getDate();
	}).attr('x', function(d){
		return xFisheye((dateRange.weekNumber(d) * cellWidth) + 4);
	}).attr('y', function(d){
		return (day(d) * cellHeight) + 14;
	});

	svg.selectAll('text.monthLabel').data(dateRange.months, keyFunctionMonth).enter().append('text').attr('class', 'monthLabel').attr('y', -10).text(function(d){
		return monthText(d) + ' ' + d.getFullYear();
	}).attr('x', function(d){
		return xFisheye((dateRange.weekNumber(d) * cellWidth) + cellWidth + (cellWidth/2));
	});

	// Re-focus the date range
	var focusDate = new Date(dateRange.focusDate.getTime() + (SHIFT_DAYS * ONE_DAY));
	dateRange = _getDateRange(focusDate);

	// Shift the DOM elements based on the re-focused range
	svg.selectAll('path.dayRect').transition().duration(DURATION).attr("d", dayPath);
	svg.selectAll('text.date').transition().duration(DURATION).attr('x', function(d){
		return xFisheye((dateRange.weekNumber(d) * cellWidth) + 4);
	});
	svg.selectAll('text.monthLabel').transition().duration(DURATION).attr('x', function(d){
		return xFisheye((dateRange.weekNumber(d) * cellWidth) + cellWidth + (cellWidth/2));
	});

	// Remove DOM elements that are out of range
	svg.selectAll('g.day').data(dateRange.days, keyFunctionDay).exit().transition().duration(DURATION).remove();
	svg.selectAll('text.monthLabel').data(dateRange.months, keyFunctionMonth).exit().transition().duration(DURATION).remove();
});


//---------------------- Backward event handler
d3.select("div.backward").on("click", function() {
	var lastOfNewDays = new Date(dateRange.days[0].getTime());
	var firstOfNewDays = new Date(lastOfNewDays.getTime() - (ONE_DAY * 40));
	var interimDays = [].concat(d3.time.days(firstOfNewDays, lastOfNewDays), dateRange.days);
	var interimMonths = [].concat(d3.time.months(firstOfNewDays, lastOfNewDays), dateRange.months);

	// Draw new days and months out of view so that they slide in nicely
	var days = svg.selectAll('g.day').data(interimDays, keyFunctionDay).enter().append('g');
	days.attr('class', 'day').append("path").attr("d", dayPath).attr("class", function(d){
		if ((d.getMonth() % 2)) {
			return "dayRect odd";

		} else {
			return "dayRect even";
		}
	}).append("title").text(function(d) {
		return format(d);
	});
	days.append('text').attr('class', function(d){
		if ((d.getMonth() % 2)) {
			return "date odd";

		} else {
			return "date even";
		}
	}).text(function(d){
		return d.getDate();
	}).attr('x', function(d){
		return xFisheye((dateRange.weekNumber(d) * cellWidth) + 4);
	}).attr('y', function(d){
		return (day(d) * cellHeight) + 14;
	});

	svg.selectAll('text.monthLabel').data(interimMonths, keyFunctionMonth).enter().append('text').attr('class', 'monthLabel').attr('y', -10).text(function(d){
		return monthText(d) + ' ' + d.getFullYear();
	}).attr('x', function(d){
		return xFisheye((dateRange.weekNumber(d) * cellWidth) + cellWidth + (cellWidth/2));
	});

	// Re-focus the date range
	var focusDate = new Date(dateRange.focusDate.getTime() - (SHIFT_DAYS * ONE_DAY));
	dateRange = _getDateRange(focusDate);

	// Shift the DOM elements based on the re-focused range
	svg.selectAll(".dayRect").data(dateRange.days, keyFunctionDay).transition().duration(DURATION).attr("d", dayPath);
	svg.selectAll('text.date').data(dateRange.days, keyFunctionDay).transition().duration(DURATION).attr('x', function(d){
		return xFisheye((dateRange.weekNumber(d) * cellWidth) + 4);
	});
	svg.selectAll('text.monthLabel').data(dateRange.months, keyFunctionMonth).transition().duration(DURATION).attr('x', function(d){
		return xFisheye((dateRange.weekNumber(d) * cellWidth) + cellWidth + (cellWidth/2));
	});

	// Remove DOM elements that are out of range
	svg.selectAll('g.day').data(dateRange.days, keyFunctionDay).exit().remove();
	svg.selectAll('text.date').data(dateRange.days, keyFunctionDay).exit().remove();
	svg.selectAll('text.monthLabel').data(dateRange.months, keyFunctionMonth).exit().remove();
});

function keyFunctionDay(d) {
	return format(d);
}

function keyFunctionMonth(d) {
	return monthText(d) + ' ' + year(d);
}

function _getDateRange(targetDate) {
	var newTargetDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 14);
	var fromDate = new Date(newTargetDate.getTime() - (ONE_DAY * SHIFT_DAYS));
	fromDate = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);
	var toDate = new Date(newTargetDate.getTime() + (ONE_DAY * SHIFT_DAYS));
	toDate = new Date(toDate.getFullYear(), toDate.getMonth() + 1, 0);
	toDate = new Date(toDate.getTime() + ONE_DAY);

	var days = d3.time.days(fromDate, toDate);
	var months = d3.time.months(fromDate, toDate);
	var weekCount = Math.floor(days.length / 7);
	if((days.length % 7) > 0) {
		weekCount++;
	}
	if(day(days.last()) < day(days[0])) {
		weekCount++;
	}

	var rangeObject = {
		focusDate: targetDate,
		days: days,
		months: months,
		weekCount: weekCount,
		weekNumber: function(date) {
			var justTheDatePart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
			var dayNumber = 0;
			var weekNumber;
			if (date.getTime() > this.days[[0]]) {
				dayNumber = d3.time.days(this.days[0], date).length;
				weekNumber = Math.floor(dayNumber / 7);
				if(day(days[0]) > day(date)) {
					weekNumber++;
				}
			} else {
				dayNumber = d3.time.days(date, this.days[0]).length * -1;
				weekNumber = Math.floor(dayNumber / 7);
				if(day(days[0]) < day(date)) {
					weekNumber++;
				}
			}
			return weekNumber;
		}
	};

	return rangeObject;
}