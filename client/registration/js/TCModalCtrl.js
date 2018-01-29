angular
    .module('brgo')
    .controller('ModalTcoCtrl', function($state, $scope, $uibModalInstance) {

      $scope.ok = function () {
        $uibModalInstance.close();
      };

      $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
      };

    });
