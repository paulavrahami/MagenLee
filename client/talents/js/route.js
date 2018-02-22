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
  .state('talent.challenges', {
    url:'/talentChallenges',
    templateUrl: 'client/talents/view/challengeMain.html',
    controller: 'ChallengeMainCtrl',
    controllerAs: 'vm'
  })
  .state('talent', {
    url:'/talentApplication',
    templateUrl: 'client/talents/view/talent.html',
    controller: 'TalentCtrl',
    controllerAs: 'vm'
  });
}
