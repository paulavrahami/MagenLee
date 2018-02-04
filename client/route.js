angular
  .module('skillera')
  .config(routerConfig);


/** @ngInject */
/* Domain Expert routing */
function routerConfig($stateProvider) {
  $stateProvider
  .state('recruiter.application', {
    url:'/campaignApplication/:id',
    templateUrl: 'client/application/view/applicationMain.html',
    controller: 'applicationMain',
    controllerAs: 'vm'
  })
}
