angular
  .module('brgo')
  .controller('qualifitFooter', function($state,$scope,$reactive) {

    var vm = this;
    $reactive(vm).attach($scope);

});
