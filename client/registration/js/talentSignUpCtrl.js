//import countries from '/public/countries.js';

angular
    .module('brgo')
    .controller('talentSignUpCtrl', function($state, $scope, $reactive, $uibModal, dbhService, $UserAlerts,ENUM) {

        let vm = this;

        $reactive(vm).attach($scope);
        vm.dependency = new Deps.Dependency();
        //vm.countries = countries;
        vm.ph_numbr = /^(\+?(\d{1}|\d{2}|\d{3})[- ]?)?\d{3}[- ]?\d{3}[- ]?\d{4}$/;
        vm.newTalentRegister = {};
        vm.newTalentRegister.profile = {};
        vm.company = {};
        vm.userNameInd = false;

        vm.currentUpload = new ReactiveVar(false);

        /**
         * @desc Show a dialog with the error;
         * @param msgArg
         * @param callbackArg
         */
        function showErrorMessage(msgArg, callbackArg) {
            $UserAlerts.open(msgArg, ENUM.ALERT.DANGER, true, callbackArg);
        }

        /**
         * @desc show a dialog with the message;
         * @param msgArg
         * @param callbackArg
         */
        function showInfoMessage(msgArg, callbackArg) {
            $UserAlerts.open(msgArg, ENUM.ALERT.INFO, true, callbackArg);
        }


        // vm.newtalentRegister.profile.country = {
        //     "name": "Israel",
        //     "alpha-2": "IL",
        //     "alpha-3": "ISR",
        //     "country-code": "376",
        //     "iso_3166-2": "ISO 3166-2:IL",
        //     "region": "Asia",
        //     "sub-region": "Western Asia",
        //     "region-code": "142",
        //     "sub-region-code": "145"
        // };


        // set the Contact Email to the Login Email as default
        $scope.onEmailUpdate = function(){
              vm.newTalentRegister.profile.contactEmail = vm.newTalentRegister.email;
        };


        vm.register = () => {

            vm.readyForSave = true;
            vm.userRegistration();
        };

        vm.userRegistration = function (){
          let profileRec = angular.copy(vm.newTalentRegister.profile);


          if (vm.readyForSave) {
              if (!vm.newTalentRegister.name ||
                  !vm.newTalentRegister.email ||
                  !vm.newTalentRegister.pass1 ||
                  !(vm.newTalentRegister.pass1 === vm.newTalentRegister.pass2) ||
                  !vm.newTalentRegister.legal ||
                  !vm.newTalentRegister.profile.firstName ||
                  !vm.newTalentRegister.profile.lastName ||
                  !vm.newTalentRegister.profile.contactEmail
                  ) {
                    showErrorMessage('Please complete all required information')
                    } else {
                            if (vm.userNameInd){
                              showErrorMessage('Username already exist!');
                            } else {
                                    Accounts.createUser({
                                            username: vm.newTalentRegister.name,
                                            email: vm.newTalentRegister.email,
                                            password: vm.newTalentRegister.pass1,
                                            profile: {
                                                type: 'Talent',
                                                tcAcknowledge: vm.newTalentRegister.legal,
                                                firstName: profileRec.firstName,
                                                lastName: profileRec.lastName,
                                                phoneNumber: profileRec.phoneNumber,
                                                contactEmail: profileRec.contactEmail,
                                                expertizeCategory: profileRec.expertizeCategory,
                                                expertizeSubCategory: profileRec.expertizeSubCategory
                                            }
                                        },
                                        vm.$bindToContext((err) => {
                                            if (err) {
                                                vm.error = err;
                                                alert(vm.error);
                                            } else {
                                                $state.go('talent.challenges');
                                            }
                                        })
                                    );
          }}}
        };

        vm.checkUserName = function (userName) {


            Meteor.call('checkIfUserExists', userName, function (err, result) {
                    if (err) {
                        alert('There is an error while checking username');
                    } else {
                        if (result === false) {
                            vm.userNameInd = false;
                        } else {
                            showErrorMessage('Username already exist!');
                            vm.userNameInd = true;
                        }
                        callbackArg(null,result);
                    }
            });

        };

        vm.displayLegal = function (sizeArg) {

            $uibModal.open({
                animation: vm.animationsEnabled,
                templateUrl: 'client/registration/view/TCModal.html',
                controller: 'ModalTcoCtrl',
                size: sizeArg
            });
        };

        // vm.helpers({
        //     logoFileLink() {
        //         vm.dependency.depend();
        //         return vm.logoFile ? vm.logoFile.url() : "";
        //     },
        //     loadProgress() {
        //         vm.dependency.depend();
        //         let currentUpload = vm.currentUpload.get();
        //         return currentUpload.progress ? currentUpload.progress.curValue: 0;
        //     }
        // });


    });
