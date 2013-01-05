//----------- Array enhancement
if(!Array.prototype.last) {
	Array.prototype.last = function() {
		return this[this.length - 1];
	};
}

//---------- CONSTANTS
var ONE_DAY = 1000 * 60 * 60 * 24,
	DURATION = 500,
	WEEKS_TO_DISPLAY = 14;
	SHIFT_DAYS = Math.floor(WEEKS_TO_DISPLAY / 2) * 7,
	TODAY = new Date(); TODAY.setHours(0,0,0,0);

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


var cellWidth = Math.round(_calendarWidth / WEEKS_TO_DISPLAY),
	cellHeight = Math.round(_calendarHeight / 7);

var xFisheye = d3.fisheye.scale(d3.scale.identity).domain([0, _calendarWidth]).focus(_calendarWidth / 2);

var color = d3.scale.quantize().domain([-0.05, 0.05]).range(d3.range(11).map(function(d) {
	return "q" + d + "-11";
}));

var svg = d3.select("body").append("svg").attr('id', 'gozumi-calendar').attr("width", _containerWidth).attr("height", _containerHeight).attr("class", "RdYlGn").append("g").attr("transform", "translate(0,60)");


//------------ Initialisation funtion
(function init() {
	svg.selectAll('g.day').data(dateRange.days, keyFunctionDay).enter().append('g').attr('class', 'day').append("path").attr("d", dayPath).attr("class", dayRectClass).append("title").text(function(d) {
		return format(d);
	});
	svg.selectAll("g.day").append('text').attr('class', dayTextClass).text(function(d){
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

function dayRectClass(d) {
	var classString;
	if ((d.getMonth() % 2)) {
		classString = "dayRect odd";

	} else {
		classString = "dayRect even";
	}
	if (d.getTime() == TODAY.getTime()) {
		classString = 'dayRect today';
	}
	return classString;
}

function dayTextClass(d) {
	var classString;
	if ((d.getMonth() % 2)) {
		classString = "date odd";

	} else {
		classString = "date even";
	}
	if (d.getTime() == TODAY.getTime()) {
		classString = 'date today';
	}
	return classString;
}

//---------------------- Forward event handler
d3.select("div.forward").on("click", function() {
	var firstOfNewDays = new Date(dateRange.days.last().getTime() + ONE_DAY);
	var lastOfNewDays = new Date(firstOfNewDays.getTime() + (ONE_DAY * SHIFT_DAYS));
	var interimDays = [].concat(dateRange.days, d3.time.days(firstOfNewDays, lastOfNewDays));
	var interimMonths = [].concat(dateRange.months, d3.time.months(firstOfNewDays, lastOfNewDays));

	// Draw new days and months out of view so that they slide in nicely
	var days = svg.selectAll('g.day').data(interimDays, keyFunctionDay).enter().append('g');
	days.attr('class', 'day').append("path").attr("d", dayPath).attr("class", dayRectClass).append("title").text(function(d) {
		return format(d);
	});
	days.append('text').attr('class', dayTextClass).text(function(d){
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
	var firstOfNewDays = new Date(lastOfNewDays.getTime() - (ONE_DAY * SHIFT_DAYS) - ONE_DAY);
	var interimDays = [].concat(d3.time.days(firstOfNewDays, lastOfNewDays), dateRange.days);
	var interimMonths = [].concat(d3.time.months(firstOfNewDays, lastOfNewDays), dateRange.months);

	// Draw new days and months out of view so that they slide in nicely
	var days = svg.selectAll('g.day').data(interimDays, keyFunctionDay).enter().append('g');
	days.attr('class', 'day').append("path").attr("d", dayPath).attr("class", dayRectClass).append("title").text(function(d) {
		return format(d);
	});
	days.append('text').attr('class', dayTextClass).text(function(d){
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

function keyFunctionDay(d) {
	return format(d);
}

function keyFunctionMonth(d) {
	return monthText(d) + ' ' + year(d);
}

function _getDateRange(targetDate) {
	var plusDays = Math.floor(WEEKS_TO_DISPLAY / 2) * 7;
	var minusDays;

	if ((WEEKS_TO_DISPLAY % 2) === 0) {
		minusDays  = (Math.floor(WEEKS_TO_DISPLAY / 2) - 1) * 7;
	} else {
		minusDays  = Math.floor(WEEKS_TO_DISPLAY / 2) * 7;
	}

	var fromDate = new Date(targetDate.getTime() - (ONE_DAY * minusDays));
	var fromDayOfWeek = day(fromDate);
	fromDate = new Date(fromDate.getTime() - (ONE_DAY * fromDayOfWeek) - ONE_DAY);

	var toDate = new Date(targetDate.getTime() + (ONE_DAY * plusDays));
	var toDayOfWeek = day(toDate);
	var endOfWeekDays = 6 - toDayOfWeek;
	toDate = new Date(toDate.getTime() + (ONE_DAY * endOfWeekDays));

	var days = d3.time.days(fromDate, toDate);
	var months = d3.time.months(fromDate, toDate);

	if (months[0].getMonth() !== fromDate.getMonth()) {
		fromDate.setDate(1);
		months.unshift(fromDate);
	}

	var rangeObject = {
		focusDate: targetDate,
		days: days,
		months: months,
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
			}
			return weekNumber;
		}
	};

	return rangeObject;
}
















