angular.module('skillera')
    .component('chosenSelect', {
        templateUrl: 'client/components/chosen/view/chosen.html',
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
