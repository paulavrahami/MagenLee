angular
   .module('skillera')
   .controller('targetCampaignSpecificTalent', function($state, $scope, $reactive, dbhService, $UserAlerts, ENUM, $uibModalInstance) {    

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
           
            // Create an empty application for the talent
            emptyApplication = {};
            emptyApplication.firstName = vm.firstName;
            emptyApplication.lastName = vm.lastName;
            emptyApplication.email = vm.email;
            emptyApplication.campaignId = vm.campaign._id;
            emptyApplication.number = 'APL' + dbhService.getNextSequenceValue('application');
            emptyApplication.sessions = [];
            emptyApplication.control = {
                origin: ENUM.APPLICATION_ORIGIN.PROACTIVE_CAMPAIGN,
                createDate: new Date(),
                status: ENUM.APPLICATION_STATUS.SENT_TO_TALENT,
                statusDate: new Date(),
                companyOwner : vm.campaign.control.companyOwner
            };
            var emptyApplicationId = Applications.insert(emptyApplication, function (errorArg, applicationIdArg) {
                if (errorArg) {
                    showErrorMessage(errorArg.message);
                }
            });
            // Build the application (campaign) URL
            var applicationURL =  location.protocol + 
                                '//' +
                                location.host +
                                '/campaignApply/' +
                                vm.campaign._id +
                                '/' +
                                emptyApplicationId;
            // Send an invite      
            Meteor.call('email.sendAuditionURL',
                {
                firstName:vm.firstName,
                lastName:vm.lastName,
                email:vm.email,
                position:vm.campaign.positionName,
                company:vm.campaign.control.companyOwner,
                applicationURL:applicationURL
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