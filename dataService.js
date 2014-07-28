(function() {
	'use strict';

	var drtv = angular.module('category.service', []);
	drtv.provider('categoryService', categoryServiceProvider);

	function categoryServiceProvider()
	{
		var _url;

		this.setWebApiUrl = function(url) {
			_url = url;
		}

		this.$get = categoryServiceFactory;		

		categoryServiceFactory.$inject = ['$http'];
		function categoryServiceFactory($http)
		{
			if (!angular.isDefined(_url))
				throw 'the url of web api must be set.';

			return {
				alistCategory: function(callback) {
					$http.get(_url)
						.success(function(data, status) {
							callback(undefined, data, status);
						})
						.error(function(data, status) {
							callback(data, undefined, status);
						});
				}
			};
		}
	}	
}());