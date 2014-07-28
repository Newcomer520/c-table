itDrtv.directive('itScrollContainer', itScrollContainerFactory);

function itScrollContainerFactory() {
	return {
		replace: 'false',
		require: '^ips2Table',
		scope: true,
		templateUrl: 'itScrollContainer.html',
		compile: function(tEle, tAttrs, transcludeFn) {
			return {
				pre: function(scope, ele, attrs, ctrl) {
					scope.scrollType = attrs.itScrollContainer;
					scope.reset = function() {
						var scrollType = scope.scrollType;
						switch (scrollType) {
							case 'horizontal':
								ele.addClass(scope.scrollType);
								ele.css(scope.gridLeft());
								break;
							case 'vertical':
								ele.addClass(scope.scrollType);
								ele.css(scope.gridTop());
								break;
						}
						if (scope.isScrollbarHidden(scrollType)) {
							ele.addClass('hidden');
						}
						else {
							ele.removeClass('hidden');
						}
					}

					scope.reset();
					scope.$on('rowsRendered', scope.reset);
					ele.on('mousedown', function(event) {
						scope.$apply(function() {
							scope.$broadcast('mousedownHere', event);
						});
						//console.log('scroll container mousedown');
					});
				}
			}
			
		}
	}
}