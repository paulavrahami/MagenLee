angular.module('skillera')
    .component('timeSelect', {
        templateUrl: 'client/components/timeSelect/timeSelect.html',
        bindings: {
            ngChange : '<',
            ngDisabled : '<',
            property : '@',
            ngModel : '='
        },
        controller: 'timeSelect',
        controllerAs: 'timeSelect'
    });
