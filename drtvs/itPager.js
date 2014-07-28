itDrtv.directive('itPager', itPagerFactory);

function itPagerFactory() {
	return {
		restrict: 'EA',
		replace: false,
		require: '^ips2Table',
		scope: true,
		templateUrl: 'it-pager.html',
		compile: function(tEle, tAttrs, transcludeFn) {
			return {
				pre: function(scope, ele, attrs, ctrl) {
					
					scope.$on('paginate', function(event) {
						scope.currentPage = scope.pager.getCurrentPage();	
					});
					scope.currentPageChanged = function() {
						scope.pager.paginate(scope.currentPage);
					}
					/*scope.$watch('currentPage', function(newVal, oldVal) {
						if (!angular.isDefined(newVal))
							return false;
						if (newVal == scope.pager.getCurrentPage())
							return false;
						scope.pager.paginate(newVal);
					});*/
					scope.isLast = function() {
						if (scope.currentPage == scope.pager.totalPages()) {
							return {
								'background-color': 'red'
							}
						}
					}
				},
				post: function(scope, ele, attrs, ctrl) {

				}
			}
		}
	}
}