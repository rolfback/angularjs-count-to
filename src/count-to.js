/**
 * @see http://docs.angularjs.org/guide/concepts
 * @see http://docs.angularjs.org/api/ng.directive:ngModel.NgModelController
 * @see https://github.com/angular/angular.js/issues/528#issuecomment-7573166
 */
(function(window, angular, undefined) {
    'use strict';

    angular.module('countTo', [])
        .directive('countTo', ['$filter', '$timeout', function ($filter, $timeout) {
            return {
                replace: false,
                scope: true,
                link: function (scope, element, attrs) {

                    var e = element[0],
                        num,
                        refreshInterval,
                        duration,
                        steps,
                        step,
                        countTo,
                        increment,
                        percentCompleted,
                        slowCount,
                        slowFrom,
                        slowDelay,
                        slowerFrom,
                        slowerDelay;

                    var calculate = function () {
                        step = 0;
                        percentCompleted = 0;
                        scope.timoutId = null;
                        scope.filter = attrs.filter;
                        scope.fractionSize = attrs.fractionSize ? attrs.fractionSize : 0;
                        scope.params = attrs.params ? attrs.params : scope.fractionSize;
                        refreshInterval = attrs.refreshInterval ? parseInt(attrs.refreshInterval, 10) || 30 : 30;
                        slowCount = attrs.slowCount ? parseInt(attrs.slowCount, 10) : 0;
                        slowFrom = attrs.slowFrom ? parseInt(attrs.slowFrom, 10) || 75 : 75;
                        slowDelay = attrs.slowDelay ? parseInt(attrs.slowDelay, 10) || 15 : 15;
                        slowerFrom = attrs.slowerFrom ? parseInt(attrs.slowerFrom, 10) || 90 : 90;
                        slowerDelay = attrs.slowerDelay ? parseInt(attrs.slowerDelay, 10) || 50 : 50;
                        countTo = parseFloat(attrs.countTo) || 0;
                        if (slowCount && countTo > slowCount) {
                            countTo = countTo - slowCount;
                        }
                        scope.value = parseFloat(attrs.value) || 0;
                        duration = (parseFloat(attrs.duration) * 1000) || 0;

                        steps = Math.ceil(duration / refreshInterval);
                        increment = ((countTo - scope.value) / steps);
                        num = scope.value;
                    };

                    var tick = function () {
                        scope.timoutId = $timeout(function () {
                            num += increment;
                            if (slowCount) {
                                percentCompleted = Math.round((num / countTo) * 100);
                                if (percentCompleted > slowFrom && percentCompleted < slowerFrom) {
                                    refreshInterval += slowDelay;
                                } else if (percentCompleted > slowerFrom) {
                                    refreshInterval += slowerDelay;
                                }
                            }
                            step++;
                            if (step >= steps) {
                                $timeout.cancel(scope.timoutId);
                                num = countTo;
                                e.textContent = scope.filter ? $filter(scope.filter)(countTo, scope.params, scope.fractionSize) : Math.round(countTo);
                                if(num > slowCount){
                                    slowTick();
                                }
                            } else {
                                e.textContent = scope.filter ?  $filter(scope.filter)(num, scope.params, scope.fractionSize) : Math.round(num);
                                tick();
                            }
                        }, refreshInterval);
                    };

                    var slowTick = function () {
                        scope.timoutId = $timeout(function () {
                            slowCount--;
                            if(slowCount < 0){
                                $timeout.cancel(scope.timoutId);
                            } else {
                                countTo++;
                                e.textContent = scope.filter ? $filter(scope.filter)(countTo, scope.params, scope.fractionSize) : Math.round(countTo);
                                slowTick();
                            }
                        }, refreshInterval);
                    };

                    var start = function () {
                        if (scope.timoutId) {
                            $timeout.cancel(scope.timoutId);
                        }
                        calculate();
                        tick();
                    };

                    attrs.$observe('countTo', function (val) {
                        if (val) {
                            start();
                        }
                    });

                    attrs.$observe('value', function () {
                        start();
                    });

                    return true;
                }
            }
        }]);

}(window, window.angular));
