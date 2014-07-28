/*
	keys: the hierarchical structure of keys
	conditions: conditions are for each rendered row.
*/
function group(type, keys, conditions) {
	var self = this;
	self.type = type;
	self.keys =keys;
	self.conditions = conditions;
}
group.prototype.hasFields = function() {
	var self = this;
	return angular.isDefined(self.conditions.fields) && self.conditions.fields.length > 0
}