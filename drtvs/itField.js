itDrtv.directive('itField', itFieldFactory);
/*
*	For every key-block, assign the suitable fields
*
*
*
***/
function itFieldFactory() {
	return {
		restric: 'EA',
		replace: false,
		require: '^itKey',
		scope: {
			'field': '@',
			'name': '@'
		},
		link: function(scope, ele, attrs, ctrl) {
			//if (angular.isDefined(scope.field)) 
			{
				var field = scope.field
				,	name = angular.isDefined(scope['name']) ? scope['name'] : field
				,	fieldStyle = attrs['style']
				,	fieldClass = attrs['class'];
				ctrl.addField(field, name, fieldStyle, fieldClass);
			}
		}
	}
}