angular
  .module('brgo')
  .config(routerConfig);

/** @ngInject */
/* Domain Expert routing */
function routerConfig($stateProvider) {
  $stateProvider
  .state('recruiter.campaigns', {
    url:'/campaigns',
    templateUrl: 'client/campaigns/view/campaignMain.html',
    controller: 'CampaignMain',
    controllerAs: 'vm'
  })
  .state('recruiter.recruiterDemand', {
    url:'/CampaignDetail/:id',
    templateUrl: 'client/campaigns/view/campaignDetail.html',
    controller: 'campaignDetail',
    controllerAs: 'vm'
  })
}
