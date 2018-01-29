angular.module('brgo')
    .component('statusBar', {
        templateUrl: 'client/components/statusBar/statusBar.html',
        controller: 'statusBarCtrl',
        controllerAs: 'statusBar',
        bindings: {
            ngModel: '='
        },
    });
