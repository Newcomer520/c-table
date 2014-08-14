itDrtv.directive('itKey', itKeyFactory);
function itKeyFactory() {
	return {
		restrict: 'EA',
		replace: false,
		require: '^itGroup',
		controller: ['$scope', function($scope) {
			var ctrl = this;

			ctrl.addField = function(id, displayName, fieldStyle, fieldClass, editable, cellStyle) {
				var field = {};
				displayName = displayName || id;
				if (!angular.isDefined($scope.fields)) 
					$scope.fields = [];

				field['id'] = id;
				field['name'] = displayName;
				field['editable'] = editable || false;
				
				if (angular.isDefined(fieldStyle)) {
					field['style'] = fieldStyle;
				}
				if (angular.isDefined(fieldClass)) {
					field['class'] = fieldClass;
				}
				if (angular.isDefined(cellStyle)) {
					field['cellStyle'] = cellStyle;
				}

				$scope.fields.push(field);
			}
		}],
		scope: true,
		link: function(scope, ele, attrs, ctrl) {
			var property;
			ele.addClass('it-key');
			scope.keyInfo = { key: attrs.key, childKeys: [] };
			if (angular.isDefined(attrs['class'])) {
				scope.keyInfo['class'] = attrs['class'];
			}
			if (angular.isDefined(attrs['style'])) {
				scope.keyInfo['style'] = attrs['style'];
			}
			if (angular.isDefined(scope['fields'])) {
				scope.keyInfo['fields'] = scope['fields'];
			}
			if (angular.isDefined(attrs['sort'])) {
				scope.keyInfo.sort = scope.sort = scope.$eval(attrs['sort']);
			}
			if (angular.isDefined(attrs['expression'])) {
				scope.keyInfo.expression = attrs['expression']; //$eval in the constructor of sub-block 
			}
			if (angular.isDefined(attrs['subtotal'])) {
				scope.keyInfo.subtotal = scope.$eval(attrs['subtotal']);
				scope.keyInfo.subtotal = _.extend({bind: attrs['subtotal'], position: 'rear', aggFn: function(raws) { return raws.length; }}, scope.keyInfo.subtotal);
			}


			if (angular.isDefined(scope.aggObject)) { //aggragation object.
				scope.keyInfo.aggObject = scope.aggObject;
			}
			var itChild
			,	i;
				itChild = scope.$$childHead;
			while (angular.isDefined(itChild) && itChild != null) {
				if (angular.isDefined(itChild.keyInfo)) {
					if (itChild.keyInfo != scope.keyInfo) {
						itChild.keyInfo.parentKeyInfo = scope.keyInfo;
					}
					
						scope.keyInfo.childKeys.push(itChild.keyInfo);
				}					
				itChild = itChild.$$nextSibling;
			}
			ctrl.keys = scope.keyInfo;
			scope.$emit('keyInfo', scope.keyInfo);
		}
	}
}