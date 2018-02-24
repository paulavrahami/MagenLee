//import countries from '/public/countries.js';

angular
    .module('skillera')
    .controller('talentSignUpCtrl', function($state,$stateParams, $scope, $reactive, $uibModal, dbhService, $UserAlerts,ENUM) {

        let vm = this;

        $reactive(vm).attach($scope);
        vm.talentType = $stateParams.type;
        vm.dependency = new Deps.Dependency();
        vm.newTalentRegister = {};
        vm.newTalentRegister.profile = {};
        vm.newTalentRegister.profile.receiveJobOffer = 'Yes';
        vm.newTalentRegister.profile.shareContact = 'Yes';
        vm.newTalentRegister.profile.discreteInd = 'No';
        vm.talent = {};
        vm.userNameInd = false;
        vm.currentDate = new Date();

        // Always load the web page with no need to scroll up
        $(document).ready(function(){
            $(this).scrollTop(0);
        });

        vm.currentUpload = new ReactiveVar(false);

        /**
         * @desc Show a dialog with the error;
         * @param msgArg
         * @param callbackArg
         */
        function showErrorMessage(msgArg, callbackArg) {
            $UserAlerts.open(msgArg, ENUM.ALERT.DANGER, true, callbackArg);
        };

        /**
         * @desc show a dialog with the message;
         * @param msgArg
         * @param callbackArg
         */
        function showInfoMessage(msgArg, callbackArg) {
            $UserAlerts.open(msgArg, ENUM.ALERT.INFO, true, callbackArg);
        };


        // set the Contact Email to the Login Email as default
        $scope.onEmailUpdate = function(){
              vm.newTalentRegister.profile.contactEmail = vm.newTalentRegister.email;
        };


        vm.register = () => {

            vm.readyForSave = true;
            vm.newTalentRegister.status = 'Active';
            vm.newTalentRegister.origin = 'Registration';
            vm.newTalentRegister.registrationStatus = 'Registered';
            vm.userRegistration();
        };

        vm.userRegistration = function (){
          let profileRec = angular.copy(vm.newTalentRegister.profile);

        // Create Talent applicative ID
        vm.newTalentRegister.talentId = 'TLNT' + dbhService.getNextSequenceValue('talent');

          if (vm.readyForSave) {
              if (!vm.newTalentRegister.name ||
                  !vm.newTalentRegister.email ||
                  !vm.newTalentRegister.pass1 ||
                  !(vm.newTalentRegister.pass1 === vm.newTalentRegister.pass2) ||
                  !vm.newTalentRegister.legal ||
                  !vm.newTalentRegister.profile.firstName ||
                  !vm.newTalentRegister.profile.lastName
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
                                                talentId: vm.newTalentRegister.talentId
                                            }
                                        },
                                        vm.$bindToContext((err) => {
                                            if (err) {
                                                vm.error = err;
                                                alert(vm.error);
                                            } else {
                                                vm.handleTalent(vm.newTalentRegister);
                                                if (vm.talentType === 'TALENT'){
                                                    $state.go('mainApplications');
                                                } else {
                                                    $state.go('mainChallenges');
                                                }
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

        vm.checkEmail = function (email) {
            Meteor.call('checkIfEmailExists', email, function (err, result) {
              if (err) {
                  alert('Technical error while checking Username');
              } else {
                  if (result === false) {
                  } else {
                      showErrorMessage('A user with email "' + email + '" already exists');
                      vm.newTalentRegister.email = "";
                  }
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

        vm.handleTalent = function (record) {
                            
                            /* populate talent attributes */
                            vm.talent.status = record.status;
                            vm.talent.tcAcknowledge =  record.legal,
                            vm.talent.statusDate = vm.currentDate;
                            vm.talent.origin = record.origin;
                            vm.talent.originDate = vm.currentDate;
                            vm.talent.registrationStatus = record.registrationStatus;
                            vm.talent.registrationStatusDate = vm.currentDate;
                            vm.talent.firstName = record.profile.firstName;
                            vm.talent.lastName = record.profile.lastName
                            vm.talent.address = record.profile.address;
                            vm.talent.country = record.profile.country;
                            vm.talent.contactPhone = record.profile.contactPhone;
                            vm.talent.contactEmail = record.profile.contactEmail;
                            vm.talent.birthDate = record.profile.birthDate;
                            vm.talent.gender = record.profile.gender;
                            vm.talent.language = record.profile.language;
                            vm.talent.pictureURL = record.profile.pictureURL;
                            vm.talent.receiveJobOffer = record.profile.receiveJobOffer;
                            vm.talent.shareContact = record.profile.shareContact;
                            vm.talent.discreteInd = record.profile.discreteInd;
                            vm.talent.linkedin = record.profile.linkedin;
                            vm.talent.talentId = record.talentId;
                            vm.talent.proffesion = record.profile.proffesion;
                            vm.talent.expertizeCategory = record.profile.expertizeCategory;
                            vm.talent.expertizeSubCategory = record.profile.expertizeSubCategory;
                            vm.talent.skill1 = record.profile.skill1;
                            vm.talent.skill2 = record.profile.skill2;
                            vm.talent.skill3 = record.profile.skill3;
                            vm.talent.skill4 = record.profile.skill4;
                            vm.talent.skill5 = record.profile.skill5;
            
                            /** Make sure it has control object; */
                            if (!vm.talent.control) {
                                vm.talent.control = {
                                    createDate: vm.currentDate
                                };
                            };
            
                            let talentRec = angular.copy(vm.talent);
            
                            Talents.insert(talentRec, function (errorArg, tempIdArg) {
                                if (errorArg) {
                                    showErrorMessage(errorArg.message);
                                } else {
                                    vm.applicationId = tempIdArg;
                                }
                            });
            
            
                    };


    });
