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
    controller: 'ChallengeMainCtrl',
    controllerAs: 'vm'
  })
  .state('talentCreateChallenge',{
    url:'/talentChallengesCreate',
    templateUrl: 'client/talents/view/talentCreateChallenge.html',
    controller: 'createChallengeCtrl',
    controllerAs: 'vm'
  })
  .state('mainApplications', {
    url:'/talentApplications',
    templateUrl: 'client/talents/view/talentApplicationMain.html',
    controller: 'applicationMainCtrl',
    controllerAs: 'vm'
  })
}
