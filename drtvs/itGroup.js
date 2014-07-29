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
}