function groupByField(data, fieldName, fieldToGroupFunc) {
// Groups objects by selected field column

	var groups = {};
	
	for (var i = 0; i < data.length; i++) {
		var field = data[i][fieldName];
		var group = fieldToGroupFunc(field);
		
		if (!(group in groups)) {
			groups[group] = [data[i]];
		} else {
			groups[group].push(data[i]);
		}
	}
	
	return groups;
};

