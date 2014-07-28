itDrtv.directive('itSubtotal', itSubtotalFactory);

itSubtotalFactory.$inject = ['ItDomService', '$templateCache', '$compile'];
function itSubtotalFactory(ItDomService, $templateCache, $compile) {
	return {
		restrict: 'EA',
		require: '^itSubBlock',
		scope: true,
		//templateUrl: 'it-subtotal.html',
		compile: function(tElement, tAttr, transcludeFn) {
			//tElement.addClass(ItDomService.getClassBy('header-sub-block'));
			return {
				pre: function(scope, ele, attrs, ctrl) {
					//i need to get the size of element immediately.
					//therefore i compile the template manually here					
					var $template;
					scope.subtotal = true;		
					scope.options = scope.$eval(attrs['itSubtotal']);
					if (!angular.isDefined(scope.options))
						return;

					if (angular.isDefined(scope.options.expression)) {
						scope.text = scope.options.expression(scope.value);
					}
					if (angular.isDefined(scope.options.style)) {
						ele.css(scope.options.style);
					}
					$template = $($templateCache.get('it-subtotal.html'));
					ele.append($template);
					$compile(ele.contents())(scope);
					if (ctrl.isPaging()) {
						scope.$on('paginate', buildSubtotal);						
					}
					else {
						scope.$watch('raws', buildSubtotal);
					}
					function buildSubtotal() {
						if (ctrl.getType() == 'column')
							return false;
						var raws = scope.raws
						,	values
						,	localRaws
						,	aggregations = [];
						if (!angular.isDefined(raws))
							return;
						if (scope.isHidden())
							return;
						if (angular.isDefined(scope.options.joinedBy)) {
							values = _.chain(raws).pluck(scope.options.joinedBy).uniq().value();
							_.each(values, function(value) {
								localRaws = _.filter(raws, function(raw) { return raw[scope.options.joinedBy] == value; });
								aggregations.push({									
									aggregation: scope.options.aggFn(localRaws),
									by: value
								});
							});
						}
						else {
							aggregations.push({
								aggregation: scope.options.aggFn(raws)
							});
						}
						scope.$emit(							
							ItDomService.EventNameofSubtotal(),
							scope.$id,
							scope.rowIndex,
							raws.firstColumnIndex,
							raws.lastColumnIndex, 
							scope.options.position, 
							scope.options.joinedBy, 
							scope.options.nullValue,
							ele.width(),
							ele.height(),
							aggregations);
					};					
				},
				post: function(scope, ele, attrs, ctrl) {
					/* performance issue, dont use watch here.
					scope.$watch(
						function() {return ele.height();},
						function() {
							if (!angular.isDefined(scope.raws))
								return;
							var rowIndex, columnIndex;
							if (scope.options.position === 'front') {
								rowIndex = scope.raws.firstRowIndex;
								columnIndex = scope.raws.firstColumnIndex;
							}
							else {
								rowIndex = scope.raws.lastRowIndex;
								columnIndex = scope.raws.lastColumnIndex;
							}
							//ctrl.registerSubtotal(rowIndex, columnIndex, ele.width(), ele.height());
							var w = ele.width()
							,	h = ele.height();
							ctrl.registerSubtotal(columnIndex, w, h);
						}
					);*/
				}
			}
		}
	}
}