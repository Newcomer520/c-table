itDrtv.directive('onFinishRender', onFinishRenderFactory);

onFinishRenderFactory.$inject = ['$timeout'];
function onFinishRenderFactory($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            //if (scope.$last === true) {
            if (scope.lastRowId == scope.row.id) {
                if (scope.row.isAggregated === true) {
                    $timeout(function () {
                        scope.$emit('ngRepeatWithAggregationFinished');
                    });
                }
                else {
                    $timeout(function () {
                        scope.$emit('ngRepeatFinished');
                    });
                }                
            }
        }
    }
};