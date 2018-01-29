angular
  .module('brgo')
  .config(routerConfig);


/** @ngInject */
/* Domain Expert routing */
function routerConfig($stateProvider) {

  $stateProvider
    .state('recruiter', {
      url:'/recruiter',
      templateUrl: 'client/recruiter/view/recruiter.html',
      controller: 'RecruiterCtrl',
      controllerAs: 'main'
    });

}
