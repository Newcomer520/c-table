itDrtv.directive('itCell', itCellFactory);

itCellFactory.$inject = ['ItDomService'];
function itCellFactory(ItDomService) {
	return {
		restrict: 'EA',
		scope: true,
		require: '^ips2Table',
		templateUrl: 'grid-cell.html',
		//transclude: true,
		compile: function(tElement, tAttrs, transcludeFn) {
			return {
				pre: function(scope, ele, attrs, ctrl) {
					//if (angular.isDefined(attrs.text))
					//	ele.text(attrs.text);
					//scope.columnIndex = scope.cell.columnIndex;
					//scope.rowIndex = scope.cell.rowIndex;										
				},
				post: function(scope, ele, attrs, ctrl) {
					ele.on('click', function() {
						scope.$broadcast('cell-enter');
					});
					scope.ngg = function() {
						scope.$broadcast('cell-blur');
					}

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