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
			var field = scope.field
			,	name = angular.isDefined(scope['name']) ? scope['name'] : field
			,	fieldStyle = attrs['style']
			,	fieldClass = attrs['class']
			,	editable = scope.$eval(attrs['editable'])
			,	cellStyle = evalStyle(attrs['cellStyle']);

			ctrl.addField(field, name, fieldStyle, fieldClass, editable, cellStyle);
			
			//convert the style to a object
			function evalStyle(styleString) {
				var cellStyle = {}
				,	props
				,	single
				,	i
				,	j;
				if (typeof styleString !== 'string')
					return styleString;
				props = styleString.split(';');
				for (i = 0; i < props.length; i++) {
					single = props[i].split(':');
					if (single.length != 2)
						continue;
					cellStyle[single[0]] = single[1];
				}
				return cellStyle;
			}

		}
	}
}