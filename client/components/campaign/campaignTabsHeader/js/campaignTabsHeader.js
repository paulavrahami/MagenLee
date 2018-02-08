angular.module('skillera')
    .component('campaignTabsHeader', {
            templateUrl: 'client/components/campaign/campaignTabsHeader/view/campaignTabsHeader.html',
            bindings: {
                campaign: '<'
            },
            controller: 'campaignTabsHeader',
            controllerAs: 'tabsHeader'
    });