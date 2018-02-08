angular.module('skillera')
    .component('statusBar', {
        templateUrl: 'client/components/statusBar/view/statusBar.html',
        controller: 'statusBarCtrl',
        controllerAs: 'statusBar',
        bindings: {
            ngModel: '='
        },
    });
