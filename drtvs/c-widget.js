itDrtv.directive('cWidget', cWidgetFactory);

function cWidgetFactory() {
	return {
		require: '^ips2Table',
		scope: false,
		templateUrl: 'c-widget.html',
		compile: function(tEle, tAttr, transcludeFn) {
			return {
				pre: function(scope, ele, attrs, ctrl) {
					
				}
			}
		}
	}
}