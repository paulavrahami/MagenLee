angular.module('brgo')
    .component('campaignTabsHeader', {
            templateUrl: 'client/components/campaign/campaignTabsHeader/campaignTabsHeader.html',
            bindings: {
                campaign: '<'
            },
            controller: 'campaignTabsHeader',
            controllerAs: 'tabsHeader'
    });