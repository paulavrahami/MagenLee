angular
    .module('brgo')
    .controller('ModalURLCtrl', function($state, $scope, $uibModalInstance,msg) {

    	$scope.urlSelected = false;

        $scope.ok = function () {
        	$uibModalInstance.close();
        };

        $scope.copy = function () {
        	$scope.urlSelected = true;
        };

        $scope.campaignURL = msg;

    });
