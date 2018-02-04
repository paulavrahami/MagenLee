  angular
    .module('skillera')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider,$locationProvider) {
    $locationProvider.html5Mode(true);
    $stateProvider
      .state('comingSoon', {
        url:'/comingsoon',
        templateUrl: 'client/home/view/comingSoon.html'
      })
      .state('app', {
        url:'/app',
        templateUrl: 'client/home/view/mainHome.html',
        controller: 'MainHomeCtrl',
        controllerAs: 'vm'
      });

    $urlRouterProvider.otherwise('/app');
  }
