angular
  .module('skillera')
  .controller('AuditionCtrl', function($state,$scope,$window, $reactive) {

    var vm = this;

    $reactive(vm).attach($scope);
    $window._noAudition = true;
    vm.helpers({
     isLoggedIn() {
       return !!Meteor.userId();
     },
     currentUser() {
       return Meteor.user();
     }
    });

});
