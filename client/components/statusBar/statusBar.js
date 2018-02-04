angular.module('skillera')
    .component('statusBar', {
        templateUrl: 'client/components/statusBar/statusBar.html',
        controller: 'statusBarCtrl',
        controllerAs: 'statusBar',
        bindings: {
            ngModel: '='
        },
    });
