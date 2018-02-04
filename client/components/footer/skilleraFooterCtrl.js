angular
  .module('skillera')
  .controller('skilleraFooter', function($state,$scope,$reactive) {

    var vm = this;
    $reactive(vm).attach($scope);

});
