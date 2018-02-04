angular.module('skillera')
    .component('newCampaigntabs', {
        templateUrl: 'client/components/campaign/campaigntab/campaignTabs.html',
        bindings: {
            onUpdate: '&',
            campaign: '<',
            activity: '<'
        },
        controller: 'campaignTabs',
        controllerAs: 'vm'
    });
