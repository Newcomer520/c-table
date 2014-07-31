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
						,	pagerHeight = 70;
						scope.baseWidth = ele.width();
						scope.baseHeight = ele.height();
						$mainContainer.height(scope.baseHeight - pagerHeight - paddingVertical);
					});
					//with pager.
					scope.equipPager = function() {
						var $mainContainer = $(ItDomService.getClassBy('main-container', true), ele)
						,	$itPager = $('<div></div>')
						,	pagerHeight = 70;
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
						scope.broadcast('rowsRendered', false);
						//alert(new Date() - scope.$$nextSibling.tmpDate);
					});
					scope.$on('ngRepeatWithAggregationFinished', function(event) {
						scope.broadcast('rowsRendered', true);
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

												tmpObj = {id: 'cell_'  + scope.$id + '_' + rowIndex + '_' + columnIndex + '_' + fIdx, rowIndex: rowIndex, columnIndex: columnIndex, editable: field.editable };
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
									scope.lastRowId = currentRow.id;
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
								if (scope.groups.row.disabled === true) {
									scope.gridPosition.left = (scope.baseWidth -  scope.gridPosition.width) / 2;
								}
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
									aggRow.push({id: cellId, value: currentAgg.aggregation, rowIndex: rowIndexForSubtotal, columnIndex: cIdx});
								}
								else {
									aggRow.push({id: cellId, value: nullValue, rowIndex: rowIndexForSubtotal, columnIndex: cIdx});
								}
							});
						}
						else {
							_.each(aggregations, function(agg, idx) {
								aggRow.push({value: agg.aggregation, rowIndex: rowIndexForSubtotal, columnIndex: idx});
							});	
						}
						aggRow.id = scope.$id + '_' + rowId;//++scope._rowId;
						aggRow.isAggregated = true;
						scope.lastRowId = aggRow.id;
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
		,	i
		,	subtotalRowObj
		,	conditions
		,	tmp;
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
					//w = angular.isDefined($scope.headers.column[columnIndex * $scope.groups.column.conditions.fieldRepeat * $scope.groups.column.conditions.fields.length]) ?
					//	($scope.headers.column[columnIndex * $scope.groups.column.conditions.fieldRepeat].width) * $scope.groups.column.conditions.fieldRepeat
					//	: undefined;
					conditions = $scope.groups.column.conditions;					
					w = 0;
					tmp = conditions.fields.length * conditions.fieldRepeat;
					for (i = columnIndex * tmp; i < (columnIndex + 1) * tmp; i++) {
						w += $scope.headers.column[i].width;
					}

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
		}		
		else {
			$scope.pager.paginate();	
		}
		$scope.renderedRowsLength = $scope.renderedRows.length;
		
	}	
}