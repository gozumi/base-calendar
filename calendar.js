//----------- Array enhancement
if(!Array.prototype.last) {
	Array.prototype.last = function() {
		return this[this.length - 1];
	};
}

//---------- CONSTANTS
var ONE_DAY = 1000 * 60 * 60 * 24;


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
_calendarWidth = window.innerWidth, _calendarHeight = 400, dateRange = _getDateRange(new Date());



var cellWidth = Math.round(_calendarWidth / dateRange.weekCount),
	cellHeight = Math.round(_calendarHeight / 7);

var xFisheye = d3.fisheye.scale(d3.scale.identity).domain([0, _calendarWidth]).focus(_calendarWidth / 2);

var color = d3.scale.quantize().domain([-0.05, 0.05]).range(d3.range(11).map(function(d) {
	return "q" + d + "-11";
}));

var svg = d3.select("body").append("svg").attr('id', 'gozumi-calendar').attr("width", _containerWidth).attr("height", _containerHeight).attr("class", "RdYlGn").append("g").attr("transform", "translate(0,60)");


//------------ Initialisation funtion
(function init() {
	svg.selectAll(".day").data(dateRange.days, keyFunctionDay).enter().append('g').attr('class', 'day').append("path").attr("d", dayPath).attr("class", "dayRect").append("title").text(function(d) {
		return format(d);
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

	var x1 = xFisheye(startX  + 2);
	var x2 = xFisheye(startX + cellWidth  - 2);
	var x3 = xFisheye(startX + cellWidth  - 2);
	var x4 = xFisheye(startX + 2);
	var y1 = startY + 2;
	var y2 = startY + 2;
	var y3 = startY + cellHeight - 2;
	var y4 = startY + cellHeight - 2;

	var pathString = 'M' + x1 + ' ' + y1 + ' ';
	pathString = pathString + 'L' + x2 + ' ' + y2 + ' ';
	pathString = pathString + 'L' + x3 + ' ' + y3 + ' ';
	pathString = pathString + 'L' + x4 + ' ' + y4 + ' Z';

	return pathString;
}

function monthPath(d) {
	var x1 = dateRange.weekNumber(d) * cellWidth;
	var y1 = (day(d) * cellHeight) + cellHeight;
	var y2 = y1 - cellHeight;
	var x2 = x1 + cellWidth;
	var pathString;

	if(d.getDate() <= 7) {
		pathString = 'M' + xFisheye(x1) + ' ' + y1 + ' ' + 'L' + xFisheye(x1) + ' ' + y2;
		if(d.getDate() === 1 && Number(day(d)) > 0) {
			pathString = pathString + ' ' + 'L' + xFisheye(x2) + ' ' + y2;
		}
	} else {
		pathString = 'M' + xFisheye(x1) + ' ' + y1 + ' ' + 'L' + xFisheye(x1) + ' ' + y1;
		if(d.getDate() === 1 && Number(day(d)) > 0) {
			pathString = pathString + ' ' + 'L' + xFisheye(x2) + ' ' + y1;
		}
	}

	if(d.getDate() === 1 && Number(day(d)) > 0) {
		pathString = pathString + ' ' + 'L' + xFisheye(x2) + ' ' + y2;
	}

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
	var interimDays = [].concat(dateRange.days, d3.time.days(firstOfNewDays, lastOfNewDays));
	var interimMonths = [].concat(dateRange.months, d3.time.months(firstOfNewDays, lastOfNewDays));

	// Draw new days and months out of view so that they slide in nicely
	svg.selectAll(".day").data(interimDays, keyFunctionDay).enter().append('g').attr('class', 'day').append("path").attr("d", dayPath).attr("class", "dayRect").append("title").text(function(d) {
		return format(d);
	});
	svg.selectAll('text.monthLabel').data(interimMonths, keyFunctionMonth).enter().append('text').attr('class', 'monthLabel').attr('y', -10).text(function(d){
		return monthText(d) + ' ' + d.getFullYear();
	}).attr('x', function(d){
		return xFisheye((dateRange.weekNumber(d) * cellWidth) + cellWidth + (cellWidth/2));
	});


	// Re-focus the date range
	var focusDate = new Date(dateRange.focusDate.getTime() + (30 * ONE_DAY));
	dateRange = _getDateRange(focusDate);

	// Draw the newly calculated days
	svg.selectAll(".dayRect").data(dateRange.days, keyFunctionDay).transition().duration(400).attr("d", dayPath).attr("class", "dayRect");
	svg.selectAll('text.monthLabel').data(dateRange.months, keyFunctionMonth).transition().duration(400).attr('x', function(d){
		return xFisheye((dateRange.weekNumber(d) * cellWidth) + cellWidth + (cellWidth/2));
	});
	svg.selectAll('.day').data(dateRange.days, keyFunctionDay).exit().remove();
	svg.selectAll('text.monthLabel').data(dateRange.months, keyFunctionMonth).exit.remove();
});


//---------------------- Backward event handler
d3.select("div.backward").on("click", function() {
	var lastOfNewDays = new Date(dateRange.days[0].getTime());
	var firstOfNewDays = new Date(lastOfNewDays.getTime() - (ONE_DAY * 40));
	var interimDays = [].concat(d3.time.days(firstOfNewDays, lastOfNewDays), dateRange.days);
	var interimMonths = [].concat(d3.time.months(firstOfNewDays, lastOfNewDays), dateRange.months);

	// Draw new days and months out of view so that they slide in nicely
	svg.selectAll(".day").data(interimDays, keyFunctionDay).enter().append('g').attr('class', 'day').append("path").attr("d", dayPath).attr("class", "dayRect").append("title").text(function(d) {
		return format(d);
	});
	svg.selectAll('text.monthLabel').data(interimMonths, keyFunctionMonth).enter().append('text').attr('class', 'monthLabel').attr('y', -10).text(function(d){
		return monthText(d) + ' ' + d.getFullYear();
	}).attr('x', function(d){
		return xFisheye((dateRange.weekNumber(d) * cellWidth) + cellWidth + (cellWidth/2));
	});

	// Re-focus the date range
	var focusDate = new Date(dateRange.focusDate.getTime() - (30 * ONE_DAY));
	dateRange = _getDateRange(focusDate);

	// Draw the newly calculated days
	svg.selectAll(".dayRect").data(dateRange.days, keyFunctionDay).transition().duration(400).attr("d", dayPath).attr("class", "dayRect");
	svg.selectAll('text.monthLabel').data(dateRange.months, keyFunctionMonth).transition().duration(400).attr('x', function(d){
		return xFisheye((dateRange.weekNumber(d) * cellWidth) + cellWidth + (cellWidth/2));
	});
	svg.selectAll('.day').data(dateRange.days, keyFunctionDay).exit().remove();
	svg.selectAll('text.monthLabel').data(dateRange.months, keyFunctionMonth).exit.remove();
});

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