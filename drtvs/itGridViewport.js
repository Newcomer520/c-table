itDrtv.directive('itGridViewport', itGridViewportFactory);

itGridViewportFactory.$inject = ['ItDomService', '$compile'];
function itGridViewportFactory(ItDomService, $compile) {
	return {
		restrict: 'EA',
		scope: true,
		require: '^ips2Table',
		compile: function(tElement, tAttrs, transclude) {
			return {
				pre: function(scope, element, attrs, ctrl) {
					
				}
			}
		}

	}

}