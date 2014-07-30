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