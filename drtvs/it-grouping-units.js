/*
some pseudo units for grouping
*/
'use strict';

drtvUnit.directive('itRow', itRowFactory);
drtvUnit.directive('itSubBlock', itSubBlockFactory);
drtvUnit.directive('itTh', itThFactory);

//useless, could be removed.
itRowFactory.$inject = ['ItDomService'];
function itRowFactory(ItDomService) {
	return {
		restrict: 'EA',
		replace: false,
		scope: true,
		require: '^itSubBlock',
		controller: ['$scope', 'ItDomService', function($scope, ItDomService) {

		}],
		compile: function(tElement, tAttrs, transcludeFn) {
			return {
				
			}
		}
	}
}

itSubBlockFactory.$inject = ['ItDomService', '$compile'];
function itSubBlockFactory(ItDomService, $compile) {
	return {
		restrict: 'EA',
		replace: false,
		scope: true,
		require: '^itGroup',
		controller: ['$scope', function($scope) {
			var ctrl = this;
			ctrl.getType = function() {
				return $scope.groupCtrl.getType();
			}
			//return column index of the cell
			ctrl.getColumnIndex = function() {
				return $scope.columnIndex;
			}
			ctrl.getRowIndex = function() {
				return $scope.rowIndex;
			}

			//new cell should be registered by th, not sub-block,
			//the reason: the initial sub-block may contain no th but a row.
			ctrl.registerNewCell = function(value) {
				var groupType = ctrl.getType();				
				$scope.columnIndex = $scope.groupCtrl.registerNewCell($scope.rowIndex, $scope.baseWidth, $scope.baseHeight, $scope.base);
				return $scope.columnIndex;
			}
			//rowIndex and columnIndex here mean the mapping index of raw rows.
			ctrl.registerSubtotal = function(columnIndex, eleWidth, eleHeight) {
				$scope.groupCtrl.registerSubtotal($scope.rowIndex, columnIndex, eleWidth, eleHeight);
			}
			ctrl.isPaging = function() {
				return $scope.groupCtrl.isPaging();
			}

		}],
		compile: function(tElement, tAttrs, transcludeFn) {
			return {
				pre: function(scope, ele, attrs, ctrl) {
					var $div
					,	subtotalObj;
					//declare all auguments in this scope.
					scope.key = attrs['key'];					
					scope.base = scope.$eval(attrs['base']);
					scope.rowIndex = scope.$eval(attrs['rowIndex']);
					if (angular.isDefined(attrs['expression']))
						scope.expression = scope.$eval(attrs['expression']);
					else
						scope.expression = undefined;					
					scope.groupCtrl = ctrl;					
					scope.baseWidth = ele.width();
					scope.baseHeight = ele.height();
					scope.hidden = undefined;
					scope.scaling = undefined;
					scope.raws = [];

					scope.$on('paginate', function() {
						scope.hidden = undefined;
						scope.scaling = undefined;
					});
				},
				post: function(scope, ele, attrs, ctrl) {
					var i;
					scope.text = scope.value;
					if (scope.base === true) {
						scope.$on(ItDomService.EventNameofHeaderRawData(ctrl.getType(), scope.columnIndex), function(event, raws) {
							for (i = 0; i < raws.length; i++)
								scope.raws.push(raws[i]);
							draw(scope.value, scope.raws); //will draw either here or on the event of rawComing.
							scope.$emit('rawComing', raws, scope.rowIndex, scope.columnIndex);
						});
					}
					else if (angular.isDefined(scope.key)) {
						scope.$on('rawComing', function(event, raws, rowIndex, columnIndex) {
							for (i = 0; i < raws.length; i++)
								scope.raws.push(raws[i]);
							if (!angular.isDefined(scope.raws.firstRowIndex)) {
								scope.raws.firstRowIndex = rowIndex;
								scope.raws.firstColumnIndex = columnIndex;
							}
							scope.raws.lastRowIndex = rowIndex;
							scope.raws.lastColumnIndex = columnIndex;
							draw(scope.value, scope.raws);
						});
					}


					//check if every child of this element is hidden. all children being hidden causes this sub-block hidden.					
					scope.$on('hiddenCheck', function(event, hidden) {
						if (hidden === false) { //no hidden! this priority is the highest.
							scope.hidden = false;
						}
						else if (scope.hidden === false) {
							
						}
						else {
							scope.hidden = scope.hidden || hidden;
						}
					});

					scope.subBlockStyle = function() {
						//var ret = {};
						//return _.extend(ret, sizeFn());
						return sizeFn();
					}

					scope.isHidden = function() {
						if (ctrl.getType() == 'column')
							return false;
						if (scope.base == true) {
							scope.hidden = (scope.scaling == 0);
							scope.$emit('hiddenCheck', scope.hidden);
						}
						return scope.hidden;
					}

					function sizeFn() {
						scope.scaling = ctrl.headerScaling(scope.rowIndex, scope.columnIndex);						

						if (!angular.isDefined(scope.scaling) || scope.scaling <= 1) {
							return {};
						}
						else {
							switch (ctrl.getType()) {
								case 'column':
									return { width: scope.scaling * scope.baseWidth };
								case 'row':
									return { height: scope.scaling * scope.baseHeight };
							}
						}
					}
					
					function draw(value, raws) {						
						if (angular.isDefined(scope.expression)) {
							scope.text = scope.expression(value, raws)
						}
						else {
							scope.text = value;
						}						
					}
				}
			}
		}
	}
}

//generate a th in a sub-block
itThFactory.$inject = ['ItDomService', '$compile', '$templateCache'];
function itThFactory(ItDomService, $compile, $templateCache) {
	return {
		restrict: 'EA',
		replace: false,
		require: '^itSubBlock',
		scope: false,
		//templateUrl: 'it-header-th.html',
		compile: function(tElement, tAttrs, transcludeFn) {
			return {				
				post: function(scope, ele, attrs, ctrl) {
					var grBorder
					,	grRelativeBorder
					,	orientation
					,	relativeOrientation
					,	rowIndex = ctrl.getRowIndex()
					,	$centerized;

					scope.value = attrs.value;					
					//scope.text = scope.value;
					//if th with non-value (sub-total), the columnIndex will depend on the current sub-block.
					

					$centerized = $($templateCache.get('it-header-th.html'));
					$compile($centerized)(scope);
					$(ele).append($centerized);
					
					if (angular.isDefined(scope.value))
						ctrl.registerNewCell(scope.value);

					if (angular.isDefined(attrs.isHidden) && scope.$eval(attrs.isHidden) == true)
						return;


					

					switch (ctrl.getType()) {
						case 'column':
							orientation = 'horizontal';
							break;
						case 'row':
							orientation = 'vertical';
							break;
					}
					relativeOrientation = orientation == 'horizontal' ? 'vertical': 'horizontal';
					grBorder = ItDomService.getRelativeBorder(orientation);
					grRelativeBorder = ItDomService.getRelativeBorder(relativeOrientation);

					$(ele).append(grBorder.nextBorder());
					$(ele).append(grRelativeBorder.nextBorder());				
				}
			}				
		}
	}
}