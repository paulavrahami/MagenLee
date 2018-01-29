angular
  .module('brgo')
  .controller('RecruiterCtrl', function($state,$scope,$reactive) {

    var vm = this;
    $reactive(vm).attach($scope);

    vm.helpers({
     isLoggedIn() {
       return !!Meteor.userId();
     },
     currentUser() {
       return Meteor.user();
     }
    });

});
