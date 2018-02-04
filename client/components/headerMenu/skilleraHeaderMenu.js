angular.module('skillera')
    .component('skilleraHeaderMenu', {
        templateUrl: 'client/components/headerMenu/skilleraHeaderMenu.html',
        controller: 'skilleraHeaderMenu',
        controllerAs: 'headerMenu',
        bindings: {
            user: '<'
        }
    });
