angular.module('skillera')
    .component('skilleraHeaderMenu', {
        templateUrl: 'client/components/headerMenu/view/skilleraHeaderMenu.html',
        controller: 'skilleraHeaderMenu',
        controllerAs: 'headerMenu',
        bindings: {
            user: '<'
        }
    });
