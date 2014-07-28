/*
	for the performance of IE8, I cannot use ng-repeat dynamically.
*/

itDrtv.directive('gridRow', gridRowFactory);

gridRowFactory.$inject = ['ItDomService', '$compile'];
function gridRowFactory(ItDomService, $compile) {
	return {
		restrict: 'EA',
		scope: true,
		require: '^ips2Table',
		compile: function(tElement, tAttrs, transcludeFn) {
			return {
				pre: function(scope, ele, attrs, ctrl) {
					var cell;
					if (!angular.isDefined(scope.row))
						return;
					scope.rowIndex = scope.row.rowIndex;
					angular.forEach(scope.row, function(datum, cIdx) {
						cell = ItDomService.grGridCell(datum.value);
						cell.attr('row', 'row');
						cell.attr('column-index', cIdx);
						//cell.attr('text',datum.value);						
						ele.append(cell);						
					});
				},
				post: function(scope, ele, attrs, ctrl) {
					//$compile(ele.contents())(scope);
				}
			}
		}
	}
}