angular
  .module('skillera')
  .controller('security', function($state,$scope,$reactive) {
  var vm = this;
  $reactive(vm).attach($scope);

  vm.password = '';
});
