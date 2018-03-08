angular
    .module('skillera')
    .controller('editItemCtrl', function($state,$stateParams,$scope,$window,$reactive,dbhService, $UserAlerts, $uibModal, ENUM, MAP) {

        var editItem = this;
        $reactive(editItem).attach($scope);
        $scope._ = _;

        /**
         * @desc Get the auditon edit controller;
         */
        editItem.createChallengeCtrl = $scope.$resolve.createChallengeCtrl;
    });
