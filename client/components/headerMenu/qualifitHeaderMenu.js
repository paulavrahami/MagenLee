angular.module('brgo')
    .component('qualifitHeaderMenu', {
        templateUrl: 'client/components/headerMenu/qualifitHeaderMenu.html',
        controller: 'qualifitHeaderMenu',
        controllerAs: 'headerMenu',
        bindings: {
            user: '<'
        }
    });
