angular.module('skillera')
    .component('chosenSelect', {
        templateUrl: 'client/components/chosen/chosen.html',
        bindings: {
            property: '@',
            data: '<',
            ngModel : '=',
            ngChange : '<',
            ngDisabled: '<'
        },
        controller: 'chosenCtrl',
        controllerAs: 'chosenCtrl'
    });
