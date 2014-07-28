function itProperty(index, condition, field) {
	var index = index
	,	condition = condition
	,	field = field;


	return {
		getIndex: function() { return index; },
		getCondition: function() { return condition; },
		getProperty: function() { 
			if (angular.isDefined(field)) {
				return field.id;
			}
			else {
				return condition;
			}
		}
	}
}