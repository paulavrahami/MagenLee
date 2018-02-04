angular
    .module('skillera')
    .controller('AuditionEditItemCtrl', function($state,$stateParams,$scope,$window,$reactive,dbhService, $UserAlerts, $uibModal, ENUM, MAP) {

        var auditionEditItem = this;
        $reactive(auditionEditItem).attach($scope);
        $scope._ = _;

        /**
         * @desc Get the auditon edit controller;
         */
        auditionEditItem.auditionEditCtrl = $scope.$resolve.auditionEditCtrl;
    });
