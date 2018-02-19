/**
 * Declare the Login / Registration routes
 */

angular
  .module('skillera')
  .config(routerConfig);


/** @ngInject */
/* Domain Expert routing */
function routerConfig($stateProvider) {
  $stateProvider
    .state('newRegistration', {
      url:'/newRegistration',
      templateUrl: 'client/registration/view/RegistrationModal.html',
      controller: 'ModalInstanceCtrl',
      controllerAs: 'vm'
    })
    .state('recruiterSigningUp', {
      url:'/recruiterSignUp',
      templateUrl: 'client/registration/view/recruiterSignUp.html',
      controller: 'recruiterSignUpCtrl',
      controllerAs: 'vm'
    })
    .state('talentSigningUp', {
      url:'/talentSignUp',
      templateUrl: 'client/registration/view/talentSignUp.html',
      controller: 'talentSignUpCtrl',
      controllerAs: 'vm'
    })
    .state('recruiterRegistration', {
      url:'/updRecruiter',
      templateUrl: 'client/registration/view/recriuterRegistration.html',
      controller: 'recruiterRegistrationCtrl',
      controllerAs: 'vm',
      resolve: {
        "currentUser": ["$meteor", function($meteor){
          return $meteor.waitForUser();
        }]
      }
    })
    .state('talentRegistration', {
      url:'/updTalent',
      templateUrl: 'client/registration/view/talentRegistration.html',
      controller: 'talentRegistrationCtrl',
      controllerAs: 'vm',
      resolve: {
        "currentUser": ["$meteor", function($meteor){
          return $meteor.waitForUser();
        }]
      }
    })
    .state('applicantRegistration', {
      url:'/newApplicant',
      templateUrl: 'client/registration/view/applicantRegistration.html',
      controller: 'ApplicantRegistrationCtrl',
      controllerAs: 'vm',
      resolve: {
        "currentUser": ["$meteor", function($meteor){
          return $meteor.waitForUser();
        }]
      }
    })
    .state('domainExpertRegistration', {
      url:'/newDomainExpert',
      templateUrl: 'client/registration/view/domainExpertRegistration.html',
      controller: 'DomainExpertRegistrationCtrl',
      controllerAs: 'vm',
      resolve: {
        "currentUser": ["$meteor", function($meteor){
          return $meteor.waitForUser();
        }]
      }
    })

}
