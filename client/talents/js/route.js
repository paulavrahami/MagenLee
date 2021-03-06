angular
  .module('skillera')
  .config(routerConfig);


/** @ngInject */
/* Talent routing */
function routerConfig($stateProvider) {
  $stateProvider
  .state('systemAdminTalents', {
    url:'/talents',
    templateUrl: 'client/talents/view/talentMain.html',
    controller: 'talentMainCtrl',
    controllerAs: 'vm'
  })
  .state('mainChallenges',{
    url:'/talentChallenges',
    templateUrl: 'client/talents/view/talentChallengeMain.html',
    controller: 'talentChallengeMainCtrl',
    controllerAs: 'vm'
  })
  .state('mainTalentCampaigns', {
    url:'/talentCampaigns',
    templateUrl: 'client/campaign/view/campaignMain.html',
    controller: 'CampaignMain',
    controllerAs: 'vm'
  })
  .state('mainApplications', {
    url:'/talentApplications',
    templateUrl: 'client/talents/view/talentApplicationMain.html',
    controller: 'talentApplicationMainCtrl',
    controllerAs: 'vm'
  })
}
