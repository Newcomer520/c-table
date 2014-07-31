itDrtv.directive('itCell', itCellFactory);

itCellFactory.$inject = ['ItDomService'];
function itCellFactory(ItDomService) {
	return {
		restrict: 'EA',
		scope: false,
		require: '^ips2Table',
		templateUrl: 'grid-cell.html',
		compile: function(tElement, tAttrs, transcludeFn) {
			return {
				pre: function(scope, ele, attrs, ctrl) {
					//if (angular.isDefined(attrs.text))
					//	ele.text(attrs.text);
					//scope.columnIndex = scope.cell.columnIndex;
					//scope.rowIndex = scope.cell.rowIndex;					
				},
				post: function(scope, ele, attrs, ctrl) {
					/*var grBorder
					,	grRelativeBorder;
					grBorder = ItDomService.getRelativeBorder('horizontal');
					grRelativeBorder = ItDomService.getRelativeBorder('vertical');
					ele.append(grBorder.nextBorder());
					ele.append(grRelativeBorder.nextBorder());*/
				}
			}
		}
	}
}