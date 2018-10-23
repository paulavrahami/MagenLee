angular
  .module('skillera')
  .config(routerConfig);

/** @ngInject */
/* Domain Expert routing */
function routerConfig($stateProvider) {
  $stateProvider
  .state('recruiter.campaigns', {
    url:'/campaigns',
    templateUrl: 'client/campaign/view/campaignMain.html',
    controller: 'CampaignMain',
    controllerAs: 'vm'
  })
  .state('recruiter.recruiterDemand', {
    url:'/CampaignDetail/:type/:id',
    templateUrl: 'client/campaign/view/campaignDetail.html',
    controller: 'campaignDetail',
    controllerAs: 'vm'
  })
}
