angular
  .module('brgo')
  .config(routerConfig);


/** @ngInject */
/* Domain Expert routing */
function routerConfig($stateProvider) {
  $stateProvider
  .state('talent.challenges', {
    url:'/challenges',
    templateUrl: 'client/talent/view/challengeMain.html',
    controller: 'ChallengeMainCtrl',
    controllerAs: 'vm'
  })
  .state('talent', {
    url:'/talent',
    templateUrl: 'client/talent/view/talent.html',
    controller: 'TalentCtrl',
    controllerAs: 'vm'
  });
}
