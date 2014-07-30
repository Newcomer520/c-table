(function() {
var templates = angular.module("templates", []);
var services = angular.module('ips2.table.services', []);
var drtvUnit = angular.module('ips2.table.grouping.units', ['templates', 'ips2.table.services']);

var itDrtv = angular.module('ips2.table', ['templates', 'ips2.table.services', 'ips2.table.grouping.units']);
angular.module("templates").run(["$templateCache", function($templateCache) {$templateCache.put("grid-cell.html","<div class=\"centerized-block\">\r\n</div>");
$templateCache.put("it-header-th.html","<div class=\"centerized\">\r\n	{{text}}\r\n</div>");
$templateCache.put("it-pager.html","<div class=\"it-pager\">\r\n	<div class=\"pager-inner\">	\r\n		<div class=\"icon icon-first\" ng-click=\"pager.first()\"></div>\r\n		<div class=\"icon icon-previous\" ng-click=\"pager.previous()\"></div>\r\n		<div class=\"icon\" style=\"width:100px\">\r\n			<input ng-model=\"currentPage\" ng-change=\"currentPageChanged()\"/>\r\n			<span>/{{pager.totalPages()}}</span>\r\n		</div>\r\n		<div class=\"icon icon-next\" ng-click=\"pager.next()\"></div>\r\n		<div class=\"icon icon-last\" ng-click=\"pager.last()\" ng-style=\"isLast()\"></div>\r\n		<div class=\"icon\" style=\"width:130px;\">\r\n			<span>per page:</span>\r\n			<input ng-model=\"pager.paginateNumber\" ng-change=\"currentPageChanged()\" style=\"width:50px;\"/>\r\n		</div>\r\n	</div>\r\n</div>");
$templateCache.put("it-subtotal.html","<div class=\"it-header-sub-block it-header-subtotal\">	\r\n	<div it-th class=\"it-header-cell\">\r\n	</div>\r\n</div>");
$templateCache.put("it-table.html","<div class=\"ips2-table\">\r\n	<div class=\"it-main-container\">\r\n		<div it-scroll-container=\"horizontal\"></div>\r\n		<div it-scroll-container=\"vertical\"></div>\r\n		<div class=\"inner-container\">\r\n			<div ng-transclude></div>			\r\n			<div it-grid-viewport class=\"it-grid\" ng-style=\"gridStyle()\">				\r\n				<div class=\"grid-container\">\r\n					<div class=\"it-vertical-border left-border\"></div>\r\n					<div ng-repeat=\"row in renderedRows track by row.id\" on-finish-render>\r\n						<div class=\"it-grid-cell\" ng-repeat=\"cell in row track by cell.id\">\r\n							<div class=\"centerized-block default-cell\" ng-style=\"cellStyle(cell.rowIndex, cell.columnIndex, row.isAggregated)\">\r\n								{{cell.value}}\r\n								<div class=\"it-vertical-border right-border\"></div>\r\n								<div class=\"it-horizontal-border bottom-border\"></div>\r\n							</div>\r\n						</div>\r\n					</div>\r\n				</div>\r\n			</div>		\r\n		</div>\r\n	</div>\r\n</div>");
$templateCache.put("itScrollContainer.html","\r\n<div class=\"scrollbar-area\">\r\n	<div class=\"scrollbar-area-inner\">\r\n		<div it-scrollbar class=\"scrollbar\">\r\n		</div>\r\n	</div>\r\n</div>");
$templateCache.put("sub-block.html","");}]);
/*
depend: angular, jquery
*/

services.service('ItDomService', itDomServiceFactory);

itDomServiceFactory.$inject = ['$compile'];
function itDomServiceFactory($compile) {
	var classNames= {
		headerRow: 'it-header-row'
	};
	return {
		//get the specified class selector(with prefix '.')
		getClassBy: function(what, isSelector) {
			isSelector = isSelector || false;
			var classSelector = isSelector ? '.' : ''
			,	ret;
			if (typeof what !== 'string')
				throw 'the argument of getClassSelectorBy must be a string.'
			switch (what) {
				default:
					throw 'Cannot find the class selector of \'' + what + '\'';
				case 'header':
					ret = 'it-header';
					break;
				case 'header-block':
					ret = 'it-header-key-block';
					break;
				case 'header-sub-block':
					ret = 'it-header-sub-block';
					break;
				case 'header-row':
					ret = 'it-header-row';
					break;
				case 'header-row-last':
					ret = 'it-header-row-last';
					break;
				case 'header-cell':
					ret = 'it-header-cell';
					break;
				case 'field':
					ret = 'it-field';
					break;
				case 'group-column':
					ret = 'it-group-column';
					break;
				case 'group-row':
					ret = 'it-group-row';
					break;
				case 'main-container':
					ret = 'it-main-container'
					break;
				case 'grid-viewport':
					ret = 'it-grid';
					break;
				case 'inner-container':
					ret = 'inner-container'
					break;
				case 'grid-container':
					ret = 'grid-container';
					break;
				case 'subtotal':
					ret = 'it-subtotal';
					break;
			}				
			return classSelector + ret;
		},
		//generate a block for per key			
		grKeyBlock: function(pElement, repeat) {
			//ie8 will be unvertical-align, so we need one more dive to centerialize it.
			var $divKey = $('<div class="it-header-key-block"/>')
			,	$centerizedDiv = $('<div it-block/>');
			$divKey.append($centerizedDiv);
			$centerizedDiv.attr('repeat', repeat);
			$(pElement).append($divKey);

			return $centerizedDiv;
		},
		//generate a sub block in a row for some key
		//repeat: should be generated n times
		//baseRow: if the block is at baseRow, the size of the block will determine the size of cells in the grids
		grSubBlock: function(key, parentRow, rowIndex, isBaseRow, expression) {
			var $div = $('<div></div>')
			,	itDomService = this;
			$div.attr('ng-class', "{hidden: isHidden()}");
			$div.attr('ng-style', "subBlockStyle()");
			$div.attr('it-sub-block', '');
			$div.attr('key', key);
			$div.attr('row-index', rowIndex);
			$div.attr('expression', expression);
			if (isBaseRow === true)
				$div.attr('base', true);
			$div.addClass(itDomService.getClassBy('header-sub-block'));
			$(parentRow).append($div);
			return $div;
		},
		//modify the size of a block
		modifySubBlockingSize: function(subBlock, size) {
			$(subBlock).attr('size', size);
		},
		//generate a row in the block for a key
		grHeaderRow: function() {				
			var itDomService = this
			,	$divRow = $('<div></div>');

			$divRow.addClass(itDomService.getClassBy('header-row'));
			return $divRow;
		},	
		//generate th
		grHeaderTh: function(text, thStyle, thClass, isHidden) {
			var domService = this
			,	$th = $('<div></div>') // class="centerized-block" it-th 
			,	$centerized;
			$th.addClass('centerized-block');			
			$th.addClass(domService.getClassBy('header-cell'));
			$th.attr('it-th', '');
			if (angular.isDefined(thStyle)) {
				if (typeof thStyle == 'string') {
					$th.attr('style', thStyle);
				}
			}
			$th.attr('value', text);
			$th.addClass(thClass);
			/*
			if (angular.isDefined(thClass)) {
				if (typeof thClass == 'string')
					$th.addClass(thClass);
			}*/

			//$centerized = $('<div></div>');
			//$centerized.addClass('centerized');
			//$centerized.text(text);

			/*if (angular.isDefined(text) && typeof text == 'string' && text !== '') {
				
			}
			if (angular.isDefined(isHidden) && isHidden == true) {
				$th.attr('is-hidden', true);
				$centerized.text('');
			}*/
			$th.append($centerized);

			return $th;
		},
		//generate fields.
		grFields: function(ptrKey, ele, rowIndex, isHidden) {
			var $fieldBlock
			,	itDomService = this
			,	ret = []
			,	$th;
			isHidden = isHidden || false;

			while (angular.isDefined(ptrKey)) {
				if (angular.isDefined(ptrKey.fields)) {						
					_.each(ptrKey.fields, function(field) {						
						ret.push(field);
						$fieldBlock = itDomService.grSubBlock(field.id, ele, rowIndex, true);
						$th = itDomService.grHeaderTh(field['name'], field['style'], field['class'], rowIndex, isHidden);
						$th.addClass(itDomService.getClassBy('field'));
						if (isHidden == true) {
							$th.addClass('hidden-field');
						}
						//ele.append($fieldBlock);							
						$fieldBlock.append($th);
						//ele.append($th);
					});						
					break;
				}
				ptrKey = ptrKey.parentKeyInfo;
			}
			return ret;
		},
		//generate the border of a specified direction.
		grBorder: function(direction) {			
			switch(direction) {
				case 'left':
					return function() {
						var $div = $('<div></div>'); 
						$div.addClass('it-vertical-border');
						$div.addClass('left-border');
						return $div;
					}
				case 'right':
					return function() { 
						var $div = $('<div></div>'); 
						$div.addClass('it-vertical-border');
						$div.addClass('right-border');
						return $div;
					}
				case 'top':
					return function() { 
						var $div = $('<div></div>'); 
						$div.addClass('it-horizontal-border');
						$div.addClass('top-border');
						return $div;
					}
				case 'bottom':
					return function() { 
						var $div = $('<div></div>'); 
						$div.addClass('it-horizontal-border');
						$div.addClass('bottom-border');
						return $div;
					}
				default:
					throw 'incorrect direction for generating border, direction: ' + direction;
			}
		},
		//according to the orientation(horizontal or vertical), assigin the suitable border to the 'next' or 'previous' border
		getRelativeBorder: function(orientataion) {
			var grBorderNextFn
			,	grBorderPreviousFn
			,	ItDomService = this;
			orientataion = orientataion || 'horizontal';
			switch (orientataion) {
				default:
					throw 'no such orientataion: ' + orientataion;
				case 'horizontal':
					grBorderNextFn = ItDomService.grBorder('right');
					grBorderPreviousFn = ItDomService.grBorder('left');
					break;
				case 'vertical':
					grBorderNextFn = ItDomService.grBorder('bottom');
					grBorderPreviousFn = ItDomService.grBorder('top');
					break;
			}

			return {
				nextBorder: grBorderNextFn,
				previousBorder: grBorderPreviousFn
			}
		},
		getRealWidth: function (obj) {
			var width = 0;
			var props = { visibility: "hidden", display: "block" };
			var hiddenParents = obj.parents().andSelf().not(':visible');
			$.swap(hiddenParents[0], props, function () {
			    width = obj.outerWidth();
			});
			return width;
		},
		//add a class of equalized percentage size
		addEqSizeClass: function(ele, size) {
			$(ele).addClass('it-header-' + size);
		},		
		EventNameofSubGroupResizing: function(type, rowIndex, columnIndex) {
			if (!angular.isDefined(rowIndex) || !angular.isDefined(columnIndex))
				throw 'index of row and index of column must be specified.'
			return type + '_subGroupResizeing_' + rowIndex + '_' + columnIndex;
		},
		EventNameofHeaderRawData: function(groupType, columnIndex) {
			return groupType + '_localRaws_' + columnIndex;
		},
		EventNameofSubtotal: function() {
			return 'sub-total-aggregate';
		},
		grGridCell: function(text) {
			var $div = $('<div></div>')
			, $centerizedDiv = $('<div></div>');
			$centerizedDiv.addClass('centerized-block');
			$centerizedDiv.text(text);
			$div.attr('it-cell', '');
			$div.addClass('it-grid-cell');
			$div.append($centerizedDiv);
			return $div;
		}
	}

}	;
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
};
/*
some pseudo units for grouping
*/


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
					scope.expression = scope.$eval(attrs['expression']);					
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
					//if th with non-value (sub-total), the columnIndex will depend on the current sub-block.
					if (angular.isDefined(scope.value))
						ctrl.registerNewCell(scope.value);

					$centerized = $($templateCache.get('it-header-th.html'));
					$compile($centerized)(scope);
					$(ele).append($centerized);

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
};
itDrtv.directive('itGroup', itGroupFactory);

itGroupFactory.$inject = ['$compile', 'ItDomService'];
function itGroupFactory($compile, ItDomService) {
	return {
		restrict: 'EA',
		replace: false,
		require: '^ips2Table',
		controller: ips2GroupController,
		scope: true,
		compile: function(tElement, tAttr, transclude) {
			return {
				pre: function(scope, ele, attrs, ctrl) {
					ctrl.type = scope.type = attrs.type || 'column';
					scope.tblCtrl = ctrl;
					if (angular.isDefined(attrs.fieldRepeat)) {
						scope.fieldRepeat = scope.$eval(attrs.fieldRepeat);
					}
					else {
						scope.fieldRepeat = 1;	
					}
					if (angular.isDefined(attrs.fieldHidden)) {
						scope.fieldHidden = !!scope.$eval(attrs.fieldHidden);
					}
					else {
						scope.fieldHidden = false;
					}
				},
				post: link
			}
		}
	}
	function link(scope, ele, attrs, ctrl) {
		var headerName;		
		scope.ctrl = ctrl;
		switch(scope.type) {
			case 'column':
				headerName = 'columnHeaders';						
				ele.addClass('it-group it-group-column');
				break;
			case 'row':
				headerName = 'rowHeaders';
				ele.addClass('it-group it-group-row');
				break;
		}

		ctrl[headerName] = scope.headers = scope.tblCtrl.setKeys(scope.type, scope.keys);

		scope.$on('refreshData', function(newVal) {
			if(!angular.isDefined(newVal)) {
				return;
			}
			var t1 = new Date();
			if (scope.headers.length <= 0)
				return;
			var $headerEle
			,	$headerContainer
			,	conditions
			,	grBorder
			,	grRelativeBorder;

			$headerEle = $('<div />');
			$headerEle.addClass(ItDomService.getClassBy('header'));
			switch(scope.type) {
				case 'column':
					grBorder = ItDomService.getRelativeBorder('horizontal');
					grRelativeBorder = ItDomService.getRelativeBorder('vertical');
					break;
				case 'row':
					grBorder = ItDomService.getRelativeBorder('vertical');
					grRelativeBorder = ItDomService.getRelativeBorder('horizontal');
					break;
			}
			$headerContainer = $('<div style="position:relative;left:0px;top:0px;" />');			
			$headerEle.append($headerContainer);

						
			//condtions will be used to generate the data grid
			conditions = recursiveGrDivs(scope, $headerContainer, ctrl, scope.keys);
			$headerContainer.append(grBorder.previousBorder());
			$headerContainer.append(grRelativeBorder.previousBorder());
			conditions.fieldRepeat = scope.fieldRepeat;
			ele.append($headerEle);
			$compile($headerEle)(scope);			
			//alert(new Date() - t1);
			
			//emit to the parent.
			scope.$emit('groupDone', 
				scope.type,
				{
					left: $headerEle.css('left'), 
				 	top: $headerEle.css('top'),
				 	width: $headerEle.width(),
				 	height: $headerEle.height()
				},
				scope.keys,
				conditions
			);

			//ctrl.renderRows(conditions, scope.type);
		});

		//ret: the total conditions of the result.
		function recursiveGrDivs(scope, ele, ctrl, currentKey, idx, conditions, ret) {
			var	$th
			,	i
			,	data
			,	values
			,	newCondition //newCondition: should be the "current" condition, conditions should be generated before.
			,	subBlock
			,	$fieldBlock
			,	$currentRow
			,	$newRow
			,	tmp
			,	loop
			,	isLastRow
			,	newScope;

			ret = ret || { conditions: [], fields: undefined };

			idx = idx || 0;
			conditions = conditions || [];


			if (angular.isDefined(currentKey.key)) {
				if (angular.isDefined(currentKey.values)) {
					currentKey.values = values = ctrl.getHierarchicalValues(currentKey, conditions);														
					$currentRow = ItDomService.grHeaderRow();
					isLastRow = !angular.isDefined(currentKey.childKeys) || currentKey.childKeys.length == 0;
					ele.append($currentRow);
					_.each(values, function(value, tIdx) {
						newCondition = _.clone(conditions);
						newCondition.push({key: currentKey.key, value: value, aggregation: currentKey.aggObject});								
						$th = ItDomService.grHeaderTh(value, currentKey['style'], currentKey['class']);
						subBlock = ItDomService.grSubBlock(currentKey.key, $currentRow, idx, undefined, currentKey['expression']);													
						subBlock.append($th);
						_.each(currentKey.childKeys, function(ck) {
							recursiveGrDivs(scope, subBlock, ctrl, ck, idx + 1, newCondition, ret);
						});

						if (angular.isDefined(currentKey['subtotal'])) {
							tmp = $('<div></div>');
							tmp.addClass(ItDomService.getClassBy('subtotal'));
							tmp.attr('it-subtotal', currentKey['subtotal'].bind);
							if (currentKey['subtotal'].position == 'front') {
								$(ItDomService.getClassBy('header-row', true), subBlock).first().prepend(tmp);
							}
							else if (currentKey['subtotal'].position == 'rear') {
								$(ItDomService.getClassBy('header-row', true), subBlock).first().append(tmp);
							}
							else {
								throw 'eerrrrrr! position of subtotal could be either front or rear.';
							}
						}
							

						//no more childKeys. try to generate fields if necessary
						if (isLastRow) {
							ret.conditions.push(_.clone(newCondition));
							$newRow =ItDomService.grHeaderRow();
							subBlock.append($newRow);
							for (i = 0; i < scope.fieldRepeat; i++) {
								tmp = ItDomService.grFields(currentKey, $newRow, idx + 1, scope.fieldHidden, ret);
							}
							if (tmp.length == 0) {
								subBlock.attr('base', true);								
							}
							
							if (!angular.isDefined(ret.fields)) {//will define only one time								
								ret.fields = tmp;
							}
						}						
					});
				}
			}
			else if (angular.isDefined(currentKey.childKeys) && currentKey.childKeys.length > 0) { //first key is null, but it contains children.
				_.each(currentKey.childKeys, function(childKey) {
					subBlock = ItDomService.grSubBlock(undefined, ele);
					recursiveGrDivs(scope, subBlock, ctrl, childKey, idx, conditions, ret);
				});
			}
			else { //no any hierarchical structure, check if contains fields.
				$newRow =ItDomService.grHeaderRow();
				ele.append($newRow);
				for (i = 0; i < scope.fieldRepeat; i++) {
					tmp = ItDomService.grFields(currentKey, $newRow, idx, scope.fieldHidden, ret);
				}
				if (tmp.length == 0) {
					subBlock.attr('base', true);								
				}
				ret = ret || {};
				if (!angular.isDefined(ret.fields)) {//will define only one time								
					ret.fields = tmp;
				}
			}

			return ret;
		}

		scope.$on('refreshGroup', function(event, gridPosition) {
			var header = $(ItDomService.getClassBy('header', true), ele);
			switch(scope.type) {
				case 'column':
					header.css('left', gridPosition.left);					
					break;
				case 'row': 
					header.css('top', gridPosition.top);
					break;
			}
		});

		switch (scope.type) {
			case 'column':
				scope.$on('scroll_horizontal', function(event, shift) {
					var header = $(ItDomService.getClassBy('header', true), ele)
					,   headerContainer = $('div', header).first()
					,	ori = parseInt(headerContainer.css('left'));
					headerContainer.css('left', (ori - shift) + 'px');									
				});
				scope.$on('scrollTo_horizontal', function(event, pos) {
					var header = $(ItDomService.getClassBy('header', true), ele)
					,   headerContainer = $('div', header).first();
					headerContainer.css('left', pos);
				});
				break;
			case 'row':
				scope.$on('scroll_vertical', function(event, shift) {
					var header = $(ItDomService.getClassBy('header', true), ele)
					,   headerContainer = $('div', header).first()
					,	ori = parseInt(headerContainer.css('top'));
					headerContainer.css('top', (ori - shift) + 'px');									
				});
				scope.$on('scrollTo_vertical', function(event, pos) {
					var header = $(ItDomService.getClassBy('header', true), ele)
					,   headerContainer = $('div', header).first();
					headerContainer.css('top', pos);
				});
				break;
		}
	}
}


/*
controller of ips2-group, for communicating with it-row
*/
ips2GroupController.$inject = ['$scope'];
function ips2GroupController($scope) {
	var ctrl = this;
	$scope.keyInfo = undefined;
	$scope.cells = [];

	//return the responsive column index.
	ctrl.registerNewCell = function(rowIndex, width, height, isBase) {
		var cells =$scope.cells
		,	columnIndex;
		if (rowIndex > cells.length - 1) {
			cells[rowIndex] = [];
		}
		cells[rowIndex].push({
			width: width,
			height: height
		});
		columnIndex = cells[rowIndex].length - 1;
		if (isBase === true)
			$scope.tblCtrl.setCellSize($scope.type, rowIndex, columnIndex, width, height);
		return columnIndex;
	}
	ctrl.registerSubtotal = function(rowIndex, columnIndex, width, height) {
		$scope.tblCtrl.setCellSize($scope.type, rowIndex, columnIndex, width, height, true);
	}
	ctrl.getType = function() {
		return $scope.type;
	}

	ctrl.isPaging = function() {
		return $scope.tblCtrl.isPaging();
	}

	ctrl.isRowHeaderHidden = function(key, value) {
		return $scope.tblCtrl.isRowHeaderHidden(key, value);
	}
	ctrl.headerScaling = function(rowIndex, columnIndex) {
		return $scope.tblCtrl.headerScaling($scope.type, rowIndex, columnIndex);
	}

	$scope.$on('keyInfo', function(event, keyInfo) {
		$scope.keys = keyInfo;
	});
};
itDrtv.directive('itKey', itKeyFactory);
function itKeyFactory() {
	return {
		restrict: 'EA',
		replace: false,
		require: '^itGroup',
		controller: ['$scope', function($scope) {
			var ctrl = this;

			ctrl.addField = function(id, displayName, fieldStyle, fieldClass) {
				var field = {};
				displayName = displayName || id;
				if (!angular.isDefined($scope.fields)) 
					$scope.fields = [];

				field['id'] = id;
				field['name'] = displayName;

				if (angular.isDefined(fieldStyle)) {
					field['style'] = fieldStyle;
				}
				if (angular.isDefined(fieldClass)) {
					field['class'] = fieldClass;
				}

				$scope.fields.push(field);
			}
		}],
		scope: true,
		link: function(scope, ele, attrs, ctrl) {
			var property;
			ele.addClass('it-key');
			scope.keyInfo = { key: attrs.key, childKeys: [] };
			if (angular.isDefined(attrs['class'])) {
				scope.keyInfo['class'] = attrs['class'];
			}
			if (angular.isDefined(attrs['style'])) {
				scope.keyInfo['style'] = attrs['style'];
			}
			if (angular.isDefined(scope['fields'])) {
				scope.keyInfo['fields'] = scope['fields'];
			}
			if (angular.isDefined(attrs['sort'])) {
				scope.keyInfo.sort = scope.sort = scope.$eval(attrs['sort']);
			}
			if (angular.isDefined(attrs['expression'])) {
				scope.keyInfo.expression = attrs['expression']; //$eval in the constructor of sub-block 
			}
			if (angular.isDefined(attrs['subtotal'])) {
				scope.keyInfo.subtotal = scope.$eval(attrs['subtotal']);
				scope.keyInfo.subtotal = _.extend({bind: attrs['subtotal'], position: 'rear', aggFn: function(raws) { return raws.length; }}, scope.keyInfo.subtotal);
			}


			if (angular.isDefined(scope.aggObject)) { //aggragation object.
				scope.keyInfo.aggObject = scope.aggObject;
			}
			var itChild
			,	i;
				itChild = scope.$$childHead;
			while (angular.isDefined(itChild) && itChild != null) {
				if (angular.isDefined(itChild.keyInfo)) {
					if (itChild.keyInfo != scope.keyInfo) {
						itChild.keyInfo.parentKeyInfo = scope.keyInfo;
					}
					
						scope.keyInfo.childKeys.push(itChild.keyInfo);
				}					
				itChild = itChild.$$nextSibling;
			}
			ctrl.keys = scope.keyInfo;
			scope.$emit('keyInfo', scope.keyInfo);
		}
	}
};
itDrtv.directive('itField', itFieldFactory);
/*
*	For every key-block, assign the suitable fields
*
*
*
***/
function itFieldFactory() {
	return {
		restric: 'EA',
		replace: false,
		require: '^itKey',
		scope: {
			'field': '@',
			'name': '@'
		},
		link: function(scope, ele, attrs, ctrl) {
			//if (angular.isDefined(scope.field)) 
			{
				var field = scope.field
				,	name = angular.isDefined(scope['name']) ? scope['name'] : field
				,	fieldStyle = attrs['style']
				,	fieldClass = attrs['class'];
				ctrl.addField(field, name, fieldStyle, fieldClass);
			}
		}
	}
};
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
					if (angular.isDefined(attrs.text))
						ele.text(attrs.text);
					//scope.columnIndex = scope.cell.columnIndex;
					//scope.rowIndex = scope.cell.rowIndex;					
				},
				post: function(scope, ele, attrs, ctrl) {
					var grBorder
					,	grRelativeBorder;
					grBorder = ItDomService.getRelativeBorder('horizontal');
					grRelativeBorder = ItDomService.getRelativeBorder('vertical');
					ele.append(grBorder.nextBorder());
					ele.append(grRelativeBorder.nextBorder());
				}
			}
		}
	}
};
itDrtv.directive('itCellSubtotal', itCellSubtotalFactory);

function itCellSubtotalFactory() {
	return {
		restrict: 'EA',
		replace: false,
		require: '^ips2Table',
		scope: {
			subTotalOptions: '=itCellSubtotal'
		},
		compile: function(tEle, tAttr, transcludeFn) {
			return {
				pre: function(scope, ele, attrs, ctrl) {
					if (!angular.isDefined(scope.subTotalOptions))
						return;

				},
				post: function(scope, ele, attrs, ctrl) {
					if (!angular.isDefined(scope.subTotalOptions))
						return;

				}
			}
		}
	}
};
function gridRow(scope, renderedRow, ItDomService, $compile) {
	var element = $('<div/>')
	,	cells = []
	,	cellElement
	,	centerized
	,	raw = renderedRow
	,	cellStyle
	,	divBorder;
	element.addClass('it-grid-row');
	_.each(renderedRow, function(cell, cIdx) {		

		cellElement = ItDomService.grGridCell();
		
		/*divBorder = $('<div></div>');
		divBorder.addClass('it-vertical-border right-border');
		cellElement.append(divBorder);
		divBorder = $('<div></div>');
		divBorder.addClass('it-horizontal-border bottom-border');
		centerized = $("<div></div");*/
		centerized = document.createElement('div');
		centerized.innerHTML = cell.value;
		//centerized.addClass('centerized');
		//centerized.width(80);
		//centerized.height(30);
		//centerized.text(cell.value);
		cellElement.append(centerized);
		cellElement.append(divBorder);
		//<div class="it-horizontal-border bottom-border"></div>
		element.append(cellElement);
		//cells.push(cellElement);
	});

	return {
		rowElement: element,
		cells: cells
	};
};
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

};
itDrtv.directive('itPager', itPagerFactory);

function itPagerFactory() {
	return {
		restrict: 'EA',
		replace: true,
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
};
itDrtv.directive('itScrollbar', itScrollbarFactory);

itScrollbarFactory.$inject = ['$document', 'ItDomService', '$window']
function itScrollbarFactory($document, ItDomService, $window) {
	return {
		scope: true,
		compile: function(tEle, tAttrs, transcludeFn) {
			return {
				pre: function(scope, ele, attrs, ctrl) {
					switch (scope.scrollType) {
						case 'horizontal':
							scope.scroller = {								
								axe: 'clientX',
								offset: 'offsetX',
								cssSetting: 'left',
								sizeFn: 'width'
							}
							break;
						case 'vertical':
							scope.scroller = {
								axe: 'clientY',
								offset: 'offsetY',
								cssSetting: 'top',
								sizeFn: 'height'
							}
							break;
					}
					scope.scroller = _.extend(scope.scroller, {
						isMousedown: false,
						minSize: undefined,
						maxBoundary: undefined,
						startAt: undefined,
						previousMouse: undefined,
						step: undefined
					});
					scope.reset = function() {
						ele.css(scope.getScrollbarStyle(scope.scrollType));
						scope.scroller.startAt = undefined;
						scope.scroller.previousMouse = undefined;
						scope.scroller.stepSize = scope.scrollInfo(scope.scrollType);
						ele.css('left', '0px');
						ele.css('top', '0px');
						scope.scroller.maxBoundary = parseInt(ele.parent()[scope.scroller.sizeFn]()) -  ele[scope.scroller.sizeFn]();
					}
					scope.$on('rowsRendered', function() {
						scope.reset();
						scope.$emit('scrollTo', scope.scrollType, '0px');						
					});

					angular.element($window).bind('resize', function() {						
						scope.$apply(scope.reset);
					});
				},
				post: function(scope, ele, attrs, ctrl) {					

					ele.on('mousedown', function(event) {
						$(document.body).toggleSelection();
						scope.$apply(function() {							
							scope.scroller.isMousedown = true;
							scope.scroller.startAt = parseInt(ele.css(scope.scroller.cssSetting));
							scope.scroller.previousMouse = parseInt(event[scope.scroller.axe]);
							if (!angular.isDefined(scope.scroller.step)) {
								scope.scroller.stepSize = scope.scrollInfo(scope.scrollType);
							}
						});
						//event.stopPropagation();
						return false;
					});
					if (scope.scrollType == 'vertical') {
						scope.$on('mousewheel', function(event, mousewheelEvent) {
							if (mousewheelEvent.originalEvent.wheelDelta > 0 || mousewheelEvent.originalEvent.detail < 0) {
								//scroll up
								scope.tick(false);
							}
							else {
								//scroll down
								scope.tick(true);
							}
							//console.log('inscrool');
						});
					}					
					$document.on('mousemove', function(event) {
						var loc
						,	shift
						,	origin
						,	currentMouse;
						if (scope.scroller.isMousedown == false)
							return;
						origin = parseInt(ele.css(scope.scroller.cssSetting));
						currentMouse = parseInt(event[scope.scroller.axe]); 
						shift = parseInt(currentMouse - scope.scroller.previousMouse);						
						loc = origin + shift;
						loc = Math.min(loc + shift, scope.scroller.maxBoundary);
						loc = Math.max(loc, 0);
						shift = loc - origin;

						if (loc == origin)
							return;
						ele.css(scope.scroller.cssSetting, loc + 'px');
						scope.scroller.previousMouse = currentMouse;
						scope.$emit('scroller', scope.scrollType, shift * scope.scroller.stepSize, determineMouseWheel(loc));
					});
					$document.on('mouseup', function(event) {
						
						if (scope.scroller.isMousedown == false)
							return;
						$(document.body).toggleSelection();
						scope.scroller.isMousedown = false;
					});
					scope.$on('mousedownHere', function(e, mEvent) {
						var pos = mEvent[scope.scroller.offset] - parseInt(ele.css(scope.scroller.sizeFn)) * 0.5;
						scope.moveTo(parseInt(pos));
					});
					scope.moveTo = function(pos) {
						var origin = parseInt(ele.css(scope.scroller.cssSetting));
						pos = Math.min(pos, scope.scroller.maxBoundary);
						pos = Math.max(pos, 0);
						if (pos == origin)
							return;
						ele.css(scope.scroller.cssSetting, pos + 'px');
						scope.$emit('scroller', scope.scrollType, (pos - origin) * scope.scroller.stepSize, determineMouseWheel(pos));
					}
					scope.tick = function(isForward) {
						var baseMovement = (isForward === true) ? 20 : -20
						,	origin = parseInt(ele.css(scope.scroller.cssSetting))
						,	pos;
						pos = origin + baseMovement;
						scope.moveTo(pos);
						
					}

					function determineMouseWheel(pos) {
						if (scope.scrollType != 'vertical')
							return undefined;
						var ret = {};
						ret.canWheelUpGlobally = (pos == 0);
						ret.canWheelDownGlobally = (pos == scope.scroller.maxBoundary);
						return ret;
					}
				}
			}
		}
	}
}

$.fn.toggleSelection = function() {	
	var unselectable = this.attr('unselectable') || 'off',
		userSelect,
		selectstart;
	if (unselectable == 'off') {
		unselectable = 'on';
		userSelect = 'none';
		selectstart = false;
	}
	else {
		unselectable = 'off';
		userSelect = 'all';
		selectstart = true;
	}

	if (selectstart == true) {
		this.off('selectstart', false);
	}
	else {
		this.on('selectstart', false);
	}
    return this
             .attr('unselectable', unselectable)
             .css('user-select', userSelect);
             //.on('selectstart', selectstart);
};
itDrtv.directive('itScrollContainer', itScrollContainerFactory);

itScrollContainerFactory.$inject = ['$window'];
function itScrollContainerFactory($window) {
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
					angular.element($window).on('resize', scope.reset);
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
};
itDrtv.directive('onFinishRender', onFinishRenderFactory);

onFinishRenderFactory.$inject = ['$timeout'];
function onFinishRenderFactory($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit('ngRepeatFinished');
                });
            }
        }
    }
};
function itProperty(index, condition, field) {
	var index = index
	,	condition = condition
	,	field = field;


	return {
		getIndex: function() { return index; },
		getCondition: function() { return condition; },
		getProperty: function() { 
			if (angular.isDefined(field)) {
				return field.id;
			}
			else {
				return condition;
			}
		}
	}
};
/*
	keys: the hierarchical structure of keys
	conditions: conditions are for each rendered row.
*/
function group(type, keys, conditions) {
	var self = this;
	self.type = type;
	self.keys =keys;
	self.conditions = conditions;
}
group.prototype.hasFields = function() {
	var self = this;
	return angular.isDefined(self.conditions.fields) && self.conditions.fields.length > 0
};

/*
	handle what should be done as page changed.
*/
function pager(scope, paginateNumber, ItDomService) {
	var self = this;

	return {		
		getCurrentPage: function() {
			return this.currentPage;
		},
		currentPage: 1,
		paginateNumber: angular.isDefined(paginateNumber) ? parseInt(paginateNumber): 1,
		next: function() {
			var pager = this;

			if (pager.currentPage + 1 > pager.totalPages())
				return false;
			var pager = this;
			pager.currentPage++;
			pager.paginate();
		},
		previous: function() {
			var pager = this;
			
			if (pager.currentPage - 1 < 1)
				return false;
			var pager = this;
			pager.currentPage--;
			pager.paginate();
		},
		last: function() {
			var pager = this;
			
			pager.currentPage = pager.totalPages();
			pager.paginate();
		},
		first: function() {
			var pager = this;
			
			pager.currentPage = 1;
			pager.paginate();
		},
		paginate: function(cp) {
			var pager = this
			,	i
			,	currentPage;
			
			cp = cp || pager.currentPage;

			currentPage = pager.currentPage = parseInt(cp);
			//if (scope.groups.row.disabled === true)
				//return;						
			scope.renderedRows = [];
			for (i = (currentPage - 1) * pager.paginateNumber; i < currentPage * pager.paginateNumber && i < scope.rawRows.length; i++) {
				scope.renderedRows.push(scope.rawRows[i]);		
			}
			//scope.$parent.tmpDate = new Date();
			//scope.$parent.$broadcast('paginate', currentPage);
			scope.$$nextSibling.tmpDate = new Date();
			scope.broadcast('paginate', currentPage);
		},
		totalPages: getTotalPages
	}

	function getTotalPages() {
		var pager = this;
		if (!angular.isDefined(scope.rawRows))
			return 0;
		return parseInt(scope.rawRows.length / pager.paginateNumber) + (scope.rawRows.length % pager.paginateNumber == 0 ? 0 : 1);
	}
}


;
itDrtv.directive('ips2Table', ips2TableFactory);


ips2TableFactory.$inject = ['ItDomService', '$compile', '$document', '$window'];
function ips2TableFactory(ItDomService, $compile, $document, $window) {
	return {
		restrict: 'EA',
		replace: true,
		transclude: true,
		controller: ips2TableController,
		templateUrl: 'it-table.html',
		scope: {
			data: '=',
			entity: '@',
			paginate: '@'
		},
		compile: function(tElement, tAttrs, transclude) {
			return {
				pre: function(scope, ele, attrs, ctrl) {						
					var minHeightRequired = 70
					,	paddingVertical = 20;
					

					if (ele.height() < minHeightRequired) {
						ele.height(minHeightRequired);
					}
					
					$(ItDomService.getClassBy('main-container', true), ele).height(
						$(ItDomService.getClassBy('main-container', true), ele).height() - paddingVertical
					);

					scope.baseWidth = ele.width();
					scope.baseHeight = ele.height();
					$($window).on('resize', function() {
						var $mainContainer = $(ItDomService.getClassBy('main-container', true), ele)
						,	pagerHeight = 50;
						scope.baseWidth = ele.width();
						scope.baseHeight = ele.height();
						$mainContainer.height(scope.baseHeight - pagerHeight - paddingVertical);
					});
					//with pager.
					scope.equipPager = function() {
						var $mainContainer = $(ItDomService.getClassBy('main-container', true), ele)
						,	$itPager = $('<div></div>')
						,	pagerHeight = 50;
						$mainContainer.height(scope.baseHeight - pagerHeight - paddingVertical);
						$itPager.attr('it-pager', '');
						ele.append($itPager);
						$compile($itPager)(scope);
					}

					if (angular.isDefined(scope.paginate)) {
						scope.pager = new pager(scope, attrs.paginateNumber, ItDomService);					
						scope.equipPager();
					}
					scope.gridLeft = function()	{
						return {
							'left': scope.gridPosition.left

						}
					}
					scope.gridTop = function()	{
						return {
							'top': scope.gridPosition.top
						}
					}

					scope.broadcast = function(arg) {
						scope.$$nextSibling.$broadcast.apply(scope.$$nextSibling, arguments);
						scope.$broadcast.apply(scope, arguments);
					}

					scope.isScrollbarHidden = function(scrollType) {
						var overflow;
						switch (scrollType) {
							case 'vertical':
								if (!angular.isDefined(scope.gridPosition.top))
									return false;
								overflow = 
									(parseInt(scope.gridPosition.top) + $(ItDomService.getClassBy('grid-container', true), ele).height()) > $(ItDomService.getClassBy('main-container', true), ele).height();
								return !overflow;
							case 'horizontal':
								if (!angular.isDefined(scope.gridPosition.left))
									return false;
								overflow = 
									(parseInt(scope.gridPosition.left) + $(ItDomService.getClassBy('grid-container', true), ele).width()) > $(ItDomService.getClassBy('main-container', true), ele).width();
								return !overflow;
						}
					}										

					scope.getScrollbarStyle = function(scrollType) {
						var $inner = $(ItDomService.getClassBy('inner-container', true), ele)
						,	perFrame
						,	w
						,	h
						,	minSize = 50;
						switch (scrollType) {
							case 'horizontal':
								perFrame = $inner.width() - parseInt(scope.gridPosition.left);
								if ((perFrame - minSize) < parseInt($(ItDomService.getClassBy('grid-container', true), ele).width()))
									w = minSize;
								else
									w = perFrame - parseInt($(ItDomService.getClassBy('grid-container', true), ele).width())
								return {
									'width': w 
								}
								break;
							case 'vertical':
								perFrame = $inner.height() - parseInt(scope.gridPosition.top);
								if ((perFrame - minSize) < parseInt($(ItDomService.getClassBy('grid-container', true), ele).height()))
									h = minSize;
								else
									h = perFrame - parseInt($(ItDomService.getClassBy('grid-container', true), ele).height())
								return {
									'height': h
								}
						}
					}
					scope.scrollInfo = function(scrollType) {
						var $innerContainer = $(ItDomService.getClassBy('inner-container', true), ele.parent())
						,	perFrame
						,	s
						,	minSize = 50
						,	sizeFn
						,	posFn
						,	step;
						switch(scrollType) {
							case 'horizontal':
								sizeFn = 'width';
								posFn = 'left';
								break;					
							case 'vertical':
								sizeFn = 'height';
								posFn = 'top';
								break;
						}
						perFrame = $innerContainer[sizeFn]() - parseInt(scope.gridPosition[posFn]);
						if ((perFrame - minSize) < parseInt($(ItDomService.getClassBy('grid-viewport', true), ele)[sizeFn]()))
						{
							s = minSize;
						}
						else
							s = perFrame - parseInt($(ItDomService.getClassBy('grid-viewport', true), ele)[sizeFn]());
						if (s == minSize) {
							step = parseInt(
								($(ItDomService.getClassBy('grid-viewport', true), ele)[sizeFn]() - perFrame) / (perFrame - s)
							) + 1;
						}
						else
							step = 1;
						return step;
					}

					scope.$on('scroller', function(event, scrollType, shift, mousewheelInfo) {
						var $inner = $(ItDomService.getClassBy('inner-container', true), ele)
						,	perFrame
						,	$grid = $(ItDomService.getClassBy('grid-container', true), ele)
						,	posFn;
						switch (scrollType) {
							case 'horizontal':
								posFn = 'left';								
								break;
							case 'vertical':
								if (angular.isDefined(mousewheelInfo)) {
									scope.mousewheelInfo.canWheelUp = mousewheelInfo.canWheelUpGlobally;
									scope.mousewheelInfo.canWheelDown = mousewheelInfo.canWheelDownGlobally;
								}
								posFn = 'top';
								break;
						}
						$grid.css(posFn, (parseInt($grid.css(posFn)) - shift) + 'px');
						scope.$$nextSibling.$broadcast('scroll_' + scrollType, shift);
					});
					scope.$on('scrollTo', function(event, scrollType, pos, mousewheelInfo) {
						var posFn
						,	$grid = $(ItDomService.getClassBy('grid-container', true), ele);
						switch(scrollType) {
							case 'horizontal':
								posFn = 'left';
								break;
							case 'vertical':
								if (angular.isDefined(mousewheelInfo)) {
									scope.mousewheelInfo.canWheelUp = mousewheelInfo.canWheelUpGlobally;
									scope.mousewheelInfo.canWheelDown = mousewheelInfo.canWheelDownGlobally;	
								}
								posFn = 'top';
								break;
						}
						$grid.css(posFn, pos);
						scope.$$nextSibling.$broadcast('scrollTo_' + scrollType, pos);
					});
					scope.$on('ngRepeatFinished', function(event) {
						scope.broadcast('rowsRendered');
						//alert(new Date() - scope.$$nextSibling.tmpDate);
					});

					ele.on('mousewheel', function(e) {						
						if (scope.isScrollbarHidden('vertical') == false) {
							scope.$apply(function() {
								//scope.$parent.$broadcast('mousewheel', e);
								scope.$broadcast('mousewheel', e);
							});
							if (e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0) {
								//scroll up
								if (scope.mousewheelInfo.canWheelUp === true)
									return;
							}
							else {
								//scroll down
								if (scope.mousewheelInfo.canWheelDown === true)
									return;								
							}
							e.stopPropagation();
							return false;
						}
					});
					
				},
				post: function(scope, ele, attrs, ctrl) {
					var $groupColumn = $(ItDomService.getClassBy('group-column', true), ele)
					,	$groupRow = $(ItDomService.getClassBy('group-row', true), ele);
					if ($groupColumn.length == 0)
						scope.groups.column.disabled = true;
					if ($groupRow.length == 0)
						scope.groups.row.disabled = true;

					scope._rowId = 0;
					scope.ctrl = ctrl;
					scope.$watch('data', function(newVal) {
						if(!angular.isDefined(scope.data))
							return;
						//scope.$parent.$broadcast('refreshData');
						scope.$$nextSibling.$broadcast('refreshData');
					});

					function renderRows() {
						var c
						,	setAllConditions = true
						,	tmpData
						,	subData
						,	mainConditions
						,	subConditions
						,	hasFields
						,	datumFound
						,	foundDatum
						,	mainType//depends on where fields existed
						,	subType
						,	mainProperties
						,	subProperties
						,	renderedRow
						,	i = 0
						,	gotData
						,	currentRow
						,	rowIndex
						,	columnIndex
						,	tmpObj
						,	scaling
						,	tmpRawsIn = { row: [], column: [] };

						if (angular.isDefined(scope.groups['column']) 
							&& scope.groups['column'].disabled !== true
							&& scope.groups['column'].hasFields()) {
							i++;
							mainType = 'column';
						}
							
						if (angular.isDefined(scope.groups['row']) 
							&& scope.groups['row'].disabled !== true
							&& scope.groups['row'].hasFields()) {
							i++;
							mainType = 'row';
						}
							
						if (i > 1) //i==0: cannt find fields, i != 1: fields more than 1
							throw 'fields can only be in either column or row';

						subType = (mainType == 'column') ? 'row': 'column';

						tmpData = _.clone(scope.data);
						scope.groupMainType = mainType;
						//scope.groupSubType = subType;
						scope.reset();
						
						subRendered = [];
						mainConditions = scope.groups[mainType].conditions;
						
						subConditions = scope.groups[subType].conditions;
						if (mainConditions.conditions.length < 1) {
							mainConditions.conditions = [ {dummy: true} ];
						}
						if (!angular.isDefined(subConditions)) {
							subConditions = {
								conditions: [ { nonCondition: true} ]
							}
						}

						//if (scope.groups.row.disabled !== true && scope.groups.column.disabled != true) {
						if (mainType == 'column') {
							_.each(subConditions.conditions, function(sCondition, scIdx) { //loop each entity
								//the length of rows should be the same with sub conditions, if the space of sub rendered rows is not enough, generate one more row in the same entity.
								//therefore we need an array of entity.
								//subRendered[scIdx].rows = angular.isDefined(subRendered[scIdx].rows) ? subRendered[scIdx].rows: [];

								//for each condition in a repeated row, get its data all first.

								//non-condition=== true, means there are no sub conditions.
								if (sCondition.nonCondition === true) {
									subData = tmpData;
								}
								else {
									subData = _.filter(tmpData, function(datum, dIdx) {
										var gotData = true;
										_.each(sCondition, function(c) { 
											if (gotData == false)
												return;
											gotData = (datum[c.key] == c.value);
										});
										return gotData;
									});
									tmpData = _.without(tmpData, subData);
								}
								
								//need to consume all data
								scaling = 0; //if loop while >=1 need to resize the sub block in the subgroup.
								while (angular.isDefined(subData) && subData.length > 0) {
									scaling++;
									_.each(mainConditions.conditions, function(mainCondition, mIdx) {//loop each entity
										// get the suitable row to insert data
										if (mIdx == 0) {
											currentRow = [];
										}
										for (i = 0; i < mainConditions.fieldRepeat; i++) {
											//this if condition is for the case not grouping, but only fields.
											if ( i == 0 || mainCondition.dummy !== true) {
												foundDatum = _.find(subData, function(datum) {
													gotData = true;																				
													_.each(mainCondition, function(mCondition) {
														if (gotData == false)
															return;
														if (datum[mCondition.key] != mCondition.value) {
															gotData = false;
														}
													});
													return gotData;
												});	
											}
											

											//filled with field value
											_.each(mainConditions.fields, function(field, fIdx) {
												//set columnIndex & rowIndex
												if (mainType == 'column') {
													columnIndex = mIdx * mainConditions.fieldRepeat * mainConditions.fields.length + i *  mainConditions.fields.length + fIdx;
													rowIndex = scIdx;
												}
												else {//row
													rowIndex = mIdx * mainConditions.fieldRepeat * mainConditions.fields.length + i *  mainConditions.fields.length + fIdx;
													columnIndex = scIdx;
												}

												tmpObj = {id: 'cell_'  + scope.$id + '_' + rowIndex + '_' + columnIndex + '_' + fIdx, rowIndex: rowIndex, columnIndex: columnIndex };
												if (angular.isDefined(foundDatum)) {
													currentRow.push(_.extend({raw: foundDatum, value: foundDatum[field.id]}, tmpObj));
													subData = _.without(subData, foundDatum);
													if (!angular.isDefined(tmpRawsIn.row[rowIndex])) {
														tmpRawsIn.row[rowIndex] = [];
													}
													if (!angular.isDefined(tmpRawsIn.column[columnIndex])) {
														tmpRawsIn.column[columnIndex] = [];
													}
													tmpRawsIn.row[rowIndex].push(foundDatum);
													tmpRawsIn.column[columnIndex].push(foundDatum);
												}
												else {
													currentRow.push(_.extend({raw: undefined, isEmptty: true, value: undefined}, tmpObj));
												}								
											});
										}
									});
									
									currentRow.headerInfo = {
										rowIndex: sCondition.length - 1,
										columnIndex: scIdx
									};
									//currentRow.rowIndex = sCondition.length - 1;
									//currentRow.columnIndex = scIdx;
									currentRow.subCondition = sCondition;
									currentRow.id = scope.$id + '_' + (++scope._rowId);
									scope.rawRows.push(currentRow);
								}
							});
						}
						//broadcast to all headers, tell them what data belong to them.
						for (var key in tmpRawsIn) {
							for (i = 0; i < tmpRawsIn[key].length; i++) {
								if (!angular.isDefined(tmpRawsIn[key][i]))
									continue;
								//scope.$parent.$broadcast(ItDomService.EventNameofHeaderRawData(key, i), tmpRawsIn[key][i]);
								scope.$$nextSibling.$broadcast(ItDomService.EventNameofHeaderRawData(key, i), tmpRawsIn[key][i]);
							}
						}
						ctrl.draw();
					}

					//scope.$parent.$on('groupDone', function(event, groupType, groupStyle, keys, conditions) {
					scope.$$nextSibling.$on('groupDone', function(event, groupType, groupStyle, keys, conditions) {
						scope.gridPosition.width = scope.gridPosition.width || 0;
						scope.gridPosition.height = scope.gridPosition.height || 0;

						switch (groupType) {
							case 'column':
								scope.gridPosition.top = Math.max(groupStyle.height - 1, 0) + 'px';
								scope.gridPosition.width += groupStyle.width;
								scope.gridPosition.height += groupStyle.height;
								break;
							case 'row':
								scope.gridPosition.left = Math.max(groupStyle.width - 1, 0) + 'px';
								scope.gridPosition.width += groupStyle.width;
								scope.gridPosition.height += groupStyle.height;
								break;
						}
						
						scope.groups[groupType] = new group(groupType, keys, conditions);

						//if there are groups of column and row, broadcasting event after having bothe of them.
						if (scope.groups.row.disabled !== true && scope.groups.column.disabled !== true) {
							if (!angular.isDefined(scope.groups['row'].conditions) || !angular.isDefined(scope.groups['column'].conditions))
								return;
						}
						//render rows if we got both groups
						renderRows();
						scope.$$nextSibling.$broadcast('refreshGroup', scope.gridPosition);
					});
					
					scope.$$nextSibling.$on(ItDomService.EventNameofSubtotal(), function(event, rowId, rowIndex, firstColumnIndex, lastColumnIndex, position, joinedBy, nullValue, eleWidth, eleHeight, aggregations) {
					//scope.$parent.$on(ItDomService.EventNameofSubtotal(), function(event, rowId, rowIndex, firstColumnIndex, lastColumnIndex, position, joinedBy, nullValue, eleWidth, eleHeight, aggregations) {
						var localRows
						,	aggRow = []
						,	atIndex
						,	columnIndex
						,	totalJoineds
						,	currentAgg
						,	i
						,	tmpAgg
						,	rowIndexForSubtotal
						,	cellId;
						//watch the rowIndex of a row by row[0]
						localRows = _.filter(scope.renderedRows, function(row) { 
							if (row.isAggregated == true)
								return false;
							return row[0].rowIndex <= lastColumnIndex && row[0].rowIndex >= firstColumnIndex;
						});
						i = 0;

						if (localRows.length <= 0)
							return;
						if (position == 'front') {
							atIndex = _.indexOf(scope.renderedRows, localRows[0]);							
							columnIndex = firstColumnIndex;
						}
						else {//rear
							atIndex = _.indexOf(scope.renderedRows, localRows[localRows.length - 1]) + 1;
							columnIndex = lastColumnIndex;
						}
						rowIndexForSubtotal = {
							rowIndex: rowIndex,
							columnIndex: columnIndex
						};
						if (angular.isDefined(joinedBy)) {
							tmpAgg = _.clone(aggregations);
							_.each(scope.groups.column.conditions.conditions, function(condition, cIdx) {
								currentAgg = undefined;
								_.each(condition, function(cond, c2Idx) {
									if (cond.key != joinedBy)
										return false;
									for (i = 0; i < tmpAgg.length; i++) {
										if (tmpAgg[i].by == cond.value) {
											currentAgg = tmpAgg[i];
											tmpAgg.splice(i, 1);
											break;
										}
									}
								});
								cellId = 'subtotal_' + rowIndex + '_' + columnIndex + '_' + cIdx;
								if (angular.isDefined(currentAgg)) {
									//aggRow.push({value: currentAgg.aggregation, rowIndex: atIndex, columnIndex: cIdx});
									aggRow.push({id: cellId, value: currentAgg.aggregation, rowIndex: rowIndexForSubtotal, columnIndex: cIdx});
								}
								else {
									//aggRow.push({value: nullValue, rowIndex: atIndex, columnIndex: cIdx});
									aggRow.push({id: cellId, value: nullValue, rowIndex: rowIndexForSubtotal, columnIndex: cIdx});
								}
							});
						}
						else {
							_.each(aggregations, function(agg, idx) {
								//aggRow.push({value: agg.aggregation, rowIndex: atIndex, columnIndex: idx});
								aggRow.push({value: agg.aggregation, rowIndex: rowIndexForSubtotal, columnIndex: idx});
							});	
						}
						aggRow.id = scope.$id + '_' + rowId;//++scope._rowId;
						aggRow.isAggregated = true;
						
						ctrl.setCellSize('row', rowIndex, columnIndex, eleWidth, eleHeight, true);
						scope.renderedRows.splice(atIndex, 0, aggRow);
					});
				}
			}
		}
	}
}




ips2TableController.$inject = ['$scope'];
function ips2TableController($scope) {
	var ctrl = this;

	//scope variable
	$scope.gridPosition = {left: 0, top: 0};
	$scope.groups = {
		row: {},
		column: {}
	};
	$scope.rawRows;
	$scope.renderedRows;
	$scope.scrollbarWidth = 15;
	$scope.groupMainType;
	$scope.groupSubType;

	$scope.headers = { //get all headers
		column: [],
		row: []
	};
	$scope.headers.column.subtotal = [];
	$scope.headers.row.subtotal = [];

	//initial setting of mouse wheel.
	$scope.mousewheelInfo = {
		canWheelUp: true,
		canWheelDown: false
	};

	$scope.gridStyle = function() {
		return {
			left: $scope.gridPosition.left,
			top: $scope.gridPosition.top			
		};
	}
	$scope.tableStyle = function() {
		return {
			width: $scope.baseWidth - $scope.scrollbarWidth,
			height: $scope.baseHeight - $scope.scrollbarHeight
		}
	}
	$scope.cellStyle = function(rowIndex, columnIndex, isAggregated) {
		var w
		,	h
		,	subtotalRowObj;
		//if (rowIndex >= $scope.headers.row.length || columnIndex >= $scope.headers.column.length)
			//return undefined;
			//throw 'got something error internally';
		if (!angular.isDefined(rowIndex) || !angular.isDefined(columnIndex))
			return undefined;
		if (!isAggregated) {
			w = columnIndex < $scope.headers.column.length ? $scope.headers.column[columnIndex].width : undefined;
			h = rowIndex < $scope.headers.row.length ? $scope.headers.row[rowIndex].height : undefined;
			return {
				width: w,
				height: h,
			}
		}
		else {//aggregated row
			switch ($scope.groupMainType) {
				case 'column':
					subtotalRowObj = rowIndex;
					w = angular.isDefined($scope.headers.column[columnIndex * $scope.groups.column.conditions.fieldRepeat]) ?
						($scope.headers.column[columnIndex * $scope.groups.column.conditions.fieldRepeat].width) * $scope.groups.column.conditions.fieldRepeat
						: undefined;
					h = angular.isDefined($scope.headers.row.subtotal[subtotalRowObj.rowIndex]) ? 
						$scope.headers.row.subtotal[subtotalRowObj.rowIndex][subtotalRowObj.columnIndex].height
						: undefined;
					return {
						width: w,
						height: h
					}					
				case 'row':
					break;
			}
		}

	}

	$scope.reset = function() {		
		$scope.rawRows = [];
		$scope.renderedRows = [];
	}


	//values under the hierarchical structure
	//condtions: array object, record all hierarchical conditions
	ctrl.getHierarchicalValues = function(keyInfo, conditions) {
		var values
		,	data = $scope.data
		,	sortFn
		,	desc;			
		if (angular.isDefined(keyInfo.sort)) {
			sortFn = angular.isDefined(keyInfo.sort.fn)? keyInfo.sort.fn: function (item) {return item;};
			desc = !!keyInfo.sort.desc;
		}
		else {
			sortFn = function (item) {return item;}
			desc = false;
		}
		if (!angular.isDefined(conditions)) {
			values = _.pluck(data, keyInfo.key);
			return _.uniq(values);
		}

		_.each(conditions, function(condition) {
			data = _.filter(data, function(datum) {
				return datum[condition.key] == condition.value;
			});
		});

		data = _.sortBy(data, sortFn);
		values = _.pluck(data, keyInfo.key);
		values = _.uniq(values);
	
		if (desc == true)
			values = values.reverse();
		return values;

	}
	/*
	set values of each key.
	*/
	ctrl.setKeys = function(type, keyInfo) {			
		var headers;
		
		if (type == 'row') {
			headers = 'rowHeaders';
		}
		else if (type == 'column') {
			headers = 'columnHeaders';
		}
		else {
			return;
		}

		recursiveSolveKeys(keyInfo);
		$scope[headers] = keyInfo;
		return keyInfo;

		function recursiveSolveKeys(k, idx) {
			if (!angular.isDefined(k))
				return;
			idx = idx || 0;
			if (angular.isDefined(k.key)) {
				var	values = _.pluck(ctrl.rawdata, k.key);					
				k.values = _.uniq(values);
			}
			if (angular.isDefined(k.childKeys)) {
				if (angular.isDefined(k.values)) {
					idx = idx + 1;
				}
				_.each(k.childKeys, function(childKey) { 
					recursiveSolveKeys(childKey, idx); 
				});
			}
		}
	}	

	/*
	the size of cells in the grid should depends on the relative row/column headers.
	*/
	ctrl.setCellSize = function(groupType, rowIndex, columnIndex, width, height, isSubTotal) {
		if (groupType != 'column' && groupType != 'row') 
			throw 'the type of group is restricted by column or row only.';

		if (isSubTotal !== true) { //regular cell.
			$scope.headers[groupType][columnIndex] = {
				rowIndex: rowIndex,
				columnIndex: columnIndex,
				width: width,
				height: height
			};	
		}
		else {
			if (!angular.isDefined($scope.headers[groupType].subtotal[rowIndex]))
				$scope.headers[groupType].subtotal[rowIndex] = [];
			$scope.headers[groupType].subtotal[rowIndex][columnIndex] = {
				rowIndex: rowIndex,
				columnIndex: columnIndex,
				width: width,
				height: height
			};
		}
	}
	ctrl.headerScaling = function(groupType, rowIndex, columnIndex) {
		if (groupType == $scope.groupMainType)
			return undefined;
		var rows = _.filter($scope.renderedRows, function(row) {
			if (row.isAggregated === true) //aggregation row could not be couted as within the sub-group.
				return false;
			return row.headerInfo.rowIndex == rowIndex && row.headerInfo.columnIndex == columnIndex;
		});

		return rows.length;
	}

	ctrl.isPaging = function() {
		return angular.isDefined($scope.pager);
	}

	ctrl.isRowHeaderHidden = function(key, value) {
		if ($scope.groups.row.disabled == true || !ctrl.isPaging())
			return false;

		return $scope.pager.isRowHeaderHidden(key, value);
	}

	ctrl.draw = function() {
		if (!angular.isDefined($scope.pager)) {
			$scope.renderedRows = $scope.rawRows;
			return;
		}
		//need to decide hiding row headers or not		
		$scope.pager.paginate();
		
	}	
};
if (typeof define === 'function' && define.amd) {
	define('ips2Table', [], function() {
		return itDrtv;
	});
}
}())