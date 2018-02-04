angular
  .module('skillera')
  .controller('MainRouterCtrl', function($state,$scope,$reactive,$uibModal, ENUM) {

      let mainRouter = this;
      $reactive(mainRouter).attach($scope);

      mainRouter.dependency = new Deps.Dependency();

      mainRouter.currentState = {
          name: ''
      };
      /**
       * ReactiveContext;
       */
      mainRouter.helpers({
      });

      $scope.$on('$stateChangeStart',
          function(event, toState, toParams, fromState, fromParams, options){
              if (toState.name !== mainRouter.currentState.name) {

                  let dependencyChanged = function() {};

                  mainRouter.notOnlyUiView = true;

                  if (toState.name === 'app' && mainRouter.notOnlyUiView === true) {

                      mainRouter.notOnlyUiView = false;
                      dependencyChanged = mainRouter.dependency.changed;
                  }
                  else if (toState.name === 'auditions.execute' && mainRouter.notOnlyUiView === true) {

                      mainRouter.notOnlyUiView = false;
                      dependencyChanged = mainRouter.dependency.changed;
                  }
                  else if (toState.name === 'comingSoon' && mainRouter.notOnlyUiView === true) {

                      mainRouter.notOnlyUiView = false;
                      dependencyChanged = mainRouter.dependency.changed;
                  }
                  else if (toState.name === 'recruiter.dashboard' && mainRouter.notOnlyUiView === true) {

                      mainRouter.notOnlyUiView = false;
                      dependencyChanged = mainRouter.dependency.changed;
                  }
                  else if (toState.name === 'auditions.main' && mainRouter.notOnlyUiView === true) {

                      mainRouter.notOnlyUiView = false;
                      dependencyChanged = mainRouter.dependency.changed;
                  }
                  else if (toState.name === 'iframeTemplate' && mainRouter.notOnlyUiView === true) {

                      mainRouter.notOnlyUiView = false;
                      dependencyChanged = mainRouter.dependency.changed;
                  }
                  else if (toState.name === 'auditions.edit' && mainRouter.notOnlyUiView === true) {

                      mainRouter.notOnlyUiView = false;
                      dependencyChanged = mainRouter.dependency.changed;
                  }

                  else if (toState.name === 'campaignApply') {
                      mainRouter.notOnlyUiView = false;
                      dependencyChanged = mainRouter.dependency.changed;
                  }
                  else if (toState.name === 'campaignApplyInformation') {
                      mainRouter.notOnlyUiView = false;
                      dependencyChanged = mainRouter.dependency.changed;
                  }
                  else if (toState.name === 'campaignApplyThankYou') {
                    mainRouter.notOnlyUiView = false;
                    dependencyChanged = mainRouter.dependency.changed;
                  }
                  //console.log(((new Date()).valueOf() / 1000).toFixed(3), toState.name, mainRouter.notOnlyUiView);
                  ////console.log(((new Date()).valueOf() / 1000).toFixed(3),"start templateProvider");
                  mainRouter.currentState = toState;
                  dependencyChanged();
              }
          })
});
