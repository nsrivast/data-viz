// === GENERIC

var plotDefaults = {
  title: {
    text: ''
  },
	legend: {
		enabled: false
	},
	yAxis: {
		title: {
			text: ""
		}
	}
};

function override(defaults, opts) {
	var newOpts = jQuery.extend({}, defaults);
	for (var key in opts) {
		newOpts[key] = opts[key]
	}
	return newOpts;
};

function plot(id, opts) {
	$('#' + id).highcharts(override(plotDefaults, opts));
};

// === CHART TYPES

// SCATTER

function plotScatter(id, opts) {
	opts.chart = { type: "scatter" }
	opts.plotOptions = { scatter: { dataLabels: { 
		enabled: true,
		formatter: function() { return this.point.name }
	} } };
	plot(id, opts);
};

// LINE/AREA

function plotLine(id, opts) {
	opts.chart = { type: 'line' };
	opts.plotOptions = { line: { marker: { enabled: false } } };
	plot(id, opts);	
};

function plotAreaStacked(id, opts) {
	opts.chart = { type: 'area' };
	opts.plotOptions = { area: { stacking: 'percent' } };
	plot(id, opts);
};

// BAR

function barSetup(barSeries, barCategories) {
	var opts = override(plotDefaults, {});
	opts.chart = { type: 'bar' };
	opts.series = barSeries;
	opts.xAxis = { categories: barCategories };	
	return opts;
}

function plotBar(id, barSeries, barCategories) {
	var opts = barSetup(barSeries, barCategories);
	plot(id, opts);
};

function plotBarStacked(id, barSeries, barCategories) {
	var opts = barSetup(barSeries, barCategories);
	opts.plotOptions = { series: { stacking: 'percent' } };
	plot(id, opts);	
};

// PIE

function plotPie(id, opts) {
	opts.chart = { type: 'pie' };
	plot(id, opts);
};
