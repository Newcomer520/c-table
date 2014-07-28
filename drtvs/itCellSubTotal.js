itDrtv.directive('itCellSubtotal', itCellSubtotalFactory);

function itCellSubtotalFactory() {
	return {
		restrict: 'EA',
		replace: false,
		require: '^ips2Table',
		scope: {
			subTotalOptions: '=itCellSubtotal'
		},
		compile: function(tEle, tAttr, transcludeFn) {
			return {
				pre: function(scope, ele, attrs, ctrl) {
					if (!angular.isDefined(scope.subTotalOptions))
						return;

				},
				post: function(scope, ele, attrs, ctrl) {
					if (!angular.isDefined(scope.subTotalOptions))
						return;

				}
			}
		}
	}
}