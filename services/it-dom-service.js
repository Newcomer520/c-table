/*
depend: angular, jquery
*/
'use strict';
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

}	