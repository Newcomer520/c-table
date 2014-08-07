itDrtv.directive('itCellContent', itCellContentFactory);

function itCellContentFactory() {
	return {
		scope: false,
		restrict: 'EA',
		transclude: 'element',
		//require: '^itCell',
		templateUrl: 'itCellContent.html',
		compile: function(tElement, tAttrs, transcludeFn) {
			return {
				pre: function(scope, ele, attrs, ctrl) {
					scope.isEntered = false;
				},
				post: function(scope, ele, attrs, ctrl) {
					var childElement
					,	childScope
					,	off;
					reset();
					//ele.on('click', enterCell);					
					off = scope.$on('cell-enter', enterCell);
					scope.$on('cell-blur', leaveCell);
					
					function enterCell() {
						scope.isEntered = true;
						reset();						
						scope.$digest();						
						$('input', childElement).select();
					}
					function leaveCell() {
						scope.isEntered = false;
						reset();
						scope.$digest();
					}
					function reset() {
						var canCellMake = scope.$eval(attrs['itCellContent']);						
						if (childElement) {
							childElement.remove();
						}
						if (childScope) {
							childScope.$destroy();
							childScope = undefined;
						}
						if (canCellMake !== true)
							return;
						childScope = scope.$new();
						transcludeFn(childScope, function(clone) {
							childElement = clone;							
							ele.after(clone);

							if (!(scope.cell.editable && scope.isEntered))
								return;
							$('input', childElement).focus();
							$('input', childElement).on('click', function(e) {
								e.preventDefault();
								return false;
							});
							$('input', childElement).on('blur', function(e) {
								scope.$broadcast('cell-blur');
							});
							$('input', childElement).on('keydown', inputKeyDown);
						});
					}

					function inputKeyDown(e) {
						switch(e.which) {
							case 13:
								$('input', childElement).blur();
								break;
						}
					}
				}
			}
		}
	}
}