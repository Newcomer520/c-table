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