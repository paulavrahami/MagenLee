angular
  .module('brgo')
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
}
