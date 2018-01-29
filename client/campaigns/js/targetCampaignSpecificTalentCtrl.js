angular
   .module('brgo')
   .controller('targetCampaignSpecificTalent', function($state, $scope, $reactive, $UserAlerts, ENUM, $uibModalInstance) {    

      var vm = this;
      $reactive(vm).attach($scope);
      vm.campaign = $scope.campaign;
      vm.firstName = '';
      vm.lastName = '';
      vm.email = '';

      function showErrorMessage(msgArg) {
          $UserAlerts.open(msgArg, ENUM.ALERT.DANGER, true);
      }

      vm.customEmailClear = function () {
        vm.firstName = '';
        vm.lastName = '';
        vm.email = '';
      }

     	vm.customEmailSend = function () {

        if ((vm.firstName === '') || (vm.lastName === '') || (vm.email === '')) {
          showErrorMessage('All parameters shall be defined');
          return;  
        };
        
        Meteor.call('email.sendAuditionURL',
          {
              firstName:vm.firstName,
              lastName:vm.lastName,
              email:vm.email,
              position:vm.campaign.positionName,
              company:vm.campaign.control.companyOwner,
              applicationURL:vm.campaign.applicationURL
            }, (err, res) => {
              if (err) {
              } else {
              }
            });
        
        $uibModalInstance.close();
      }; 
    
      vm.cancel = function () {

        $uibModalInstance.dismiss('cancel');
      };

    });