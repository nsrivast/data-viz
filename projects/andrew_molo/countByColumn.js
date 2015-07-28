function countByColumn(data, fieldName) {
// Counts occurrences of values of selected field column in JSON object

	var counts = {};
	
	for (var i = 0; i < data.length; i++) {
		var val = data[i][fieldName];
		
		if (!(val in counts)) {
			counts[val] = 1;
		} else {
			counts[val] += 1;
		}
	}
	
	return counts;
};
	
function countsToSeriesData(counts) {
	var data = [];
	var keys = Object.keys(counts);
	
	for (var i = 0; i < keys.length; i++ ) {
		var val = keys[i];
		data.push({
			name: val,
			y: counts[val]
		})
	}
	
	return data;
}
