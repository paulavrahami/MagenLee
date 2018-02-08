angular.module('skillera')
    .component('timeSelect', {
        templateUrl: 'client/components/timeSelect/view/timeSelect.html',
        bindings: {
            ngChange : '<',
            ngDisabled : '<',
            property : '@',
            ngModel : '='
        },
        controller: 'timeSelect',
        controllerAs: 'timeSelect'
    });
