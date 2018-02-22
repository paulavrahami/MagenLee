import countries from '/public/countries.js';

angular
    .module('skillera')
    .controller('talentRegistrationCtrl', function($state, $scope, $reactive,$UserAlerts,ENUM ) {

        let vm = this;
        $reactive(vm).attach($scope);
        vm.dependency = new Deps.Dependency();
        vm.ENUM = ENUM
        vm.setPassword = false;
        vm.userPasswordNew = '******';
        vm.userPasswordConf = '';



        //noinspection JSCheckFunctionSignatures
        vm.currentUpload = new ReactiveVar(false);
        /**
         * @desc Show a dialog with the error;
         * @param msgArg
         * @param callbackArg
         */
        function showErrorMessage(msgArg, callbackArg) {
            $UserAlerts.open(msgArg, ENUM.ALERT.DANGER, true, callbackArg);
        };

        //noinspection JSUnresolvedFunction
        let currentUser = Accounts.user();
        let talentId = currentUser.profile.talentId;

        //Get user talent information
        Meteor.call('getTalentById', talentId, function (err, result) {
                if (err) {
                    alert('There is an error while fetching talent information');
                } else {
                  currentTalent = result;
                  vm.talentKey = currentTalent._id;

                  vm.talentRegistration = {
                    username: currentUser.username,
                    email: currentUser.emails[0].address,
                    type: ENUM.USER.TALENT,
                    firstName: currentTalent.firstName ? currentTalent.firstName : null,
                    lastName: currentTalent.lastName ? currentTalent.lastName : null,
                    address: currentTalent.address ? currentTalent.address : null,
                    country: currentTalent.country ? currentTalent.country : null,
                    contactEmail: currentTalent.contactEmail  ? currentTalent.contactEmail  : null,
                    contactPhone: currentTalent.contactPhone ? currentTalent.contactPhone : null,
                    birthDate: currentTalent.birthDate ? currentTalent.birthDate : null,
                    gender: currentTalent.gender ? currentTalent.gender : null,
                    language: currentTalent.language ? currentTalent.language : null,
                    pictureURL: currentTalent.pictureURL ? currentTalent.pictureURL : null,
                    receiveJobOffer: currentTalent.receiveJobOffer ? currentTalent.receiveJobOffer : null,
                    linkedin: currentTalent.linkedin ? currentTalent.linkedin : null,
                    proffesion: currentTalent.proffesion ? currentTalent.proffesion : null,
                    expertizeCategory: currentTalent.expertizeCategory ? currentTalent.expertizeCategory : null,
                    expertizeSubCategory: currentTalent.expertizeSubCategory ? currentTalent.expertizeSubCategory : null,
                    skill1: currentTalent.skill1 ? currentTalent.skill1 : null,
                    skill2: currentTalent.skill2 ? currentTalent.skill2 : null,
                    skill3: currentTalent.skill3 ? currentTalent.skill3 : null,
                    skill4: currentTalent.skill4 ? currentTalent.skill4 : null,
                    skill5: currentTalent.skill5 ? currentTalent.skill5 : null,
                    tcAcknowledge: currentTalent.tcAcknowledge ? currentTalent.tcAcknowledge : null
                      }
                  };
                  vm.dependency.changed();
                }
        );
     

        vm.cancelTalent = function () {
            $state.go("talent.challenges");
        };


        vm.updateTalent = () => {


            let profileRec = angular.copy(vm.talentRegistration);

            if (!vm.talentRegistration.firstName ||
                !vm.talentRegistration.lastName ||
                !vm.talentRegistration.contactEmail ||
                ((vm.userPasswordNew && vm.userPasswordNew !== '******') && !vm.userPasswordConf) || 
                ((vm.userPasswordNew && vm.userPasswordNew !== '******') && (vm.userPasswordNew !== vm.userPasswordConf)) ||
                (!vm.userPasswordNew && vm.userPasswordConf)
                ) {
                  showErrorMessage('Please complete the required information')
                    } else {
                                profileUser = {
                                      type: ENUM.USER.TALENT,
                                      talentId: talentId
                                };
                                Meteor.users.update(Meteor.userId(),
                                    {$set: {
                                        profile: profileUser}},
                                    vm.$bindToContext((err) => {
                                        if (err) {
                                            console.log('error');
                                            console.log(err);
                                            vm.error = err;
                                        } else {
                                            if (vm.setPassword && vm.userPasswordNew) {
                                                vm.updateUserPassword (Meteor.userId(),vm.userPasswordNew);
                                            };
                                            vm.updateTalentRec(vm.talentRegistration);
                                            $state.go("talent.challenges");
                                        }
                                    })
                                );
                            }
                          };


        vm.updateTalentRec = function (talentRec) {
              let talentRecord = angular.copy(talentRec);

              Talents.update({'_id': vm.talentKey},
                       {$set:{'firstName': talentRecord.firstName,
                              'lastName': talentRecord.lastName,
                              'address'    : talentRecord.address,
                              'country': talentRecord.country,
                              'contactPhone': talentRecord.contactPhone,
                              'contactEmail': talentRecord.contactEmail,
                              'proffesion': talentRecord.proffesion,
                              'expertizeCategory': talentRec.expertizeCategory,
                              'expertizeSubCategory': talentRecord.expertizeSubCategory,
                              'birthDate': talentRecord.birthDate,
                              'gender': talentRecord.gender,
                              'language': talentRecord.language,
                              'pictureURL':talentRecord.pictureURL,
                              'receiveJobOffer': talentRecord.receiveJobOffer,
                              'linkedin': talentRecord.linkedin,
                              'skill1': talentRecord.skill1,
                              'skill2': talentRecord.skill2,
                              'skill3': talentRecord.skill3,
                              'skill4': talentRecord.skill4,
                              'skill5': talentRecord.skill5}},
                              function (errorArg, tempIdArg) {
                  if (errorArg) {
                      showErrorMessage(errorArg.message);
                  }
                  else {
                  }
              });
              vm.dependency.changed();
        };


    


        vm.updateUserPassword = function (userId, newPassword) {
            Meteor.call('setUserPassword', userId, newPassword, function (err, result) {
              if (err) {
                  alert('Technical error while setting User Password');
              } else {

              }
            });
        };

       
        vm.helpers({
            loadProgress() {
                vm.dependency.depend();
                let currentUpload = vm.currentUpload.get();
                return currentUpload.uploadProgress ? currentUpload.uploadProgress(): 0;
            }
        });



        vm.setUserPassword = function () {
            vm.setPassword = true;
            vm.userPasswordNew = '';
            vm.userPasswordConf = '';
        };


        // Sign-Up Tabs navigation
        $(function(){
         $('.btn-circle-tab').on('click',function(){
           $('.btn-circle-tab.btn-info').removeClass('btn-info').addClass('btn-default');
           $(this).addClass('btn-info').removeClass('btn-default').blur();
         });

         $('.next-step, .prev-step').on('click', function (e){
           var $activeTab = $('.tab-pane.active');

           $('.btn-circle-tab.btn-info').removeClass('btn-info').addClass('btn-default');

           if ( $(e.target).hasClass('next-step') )
           {
              var nextTab = $activeTab.next('.tab-pane').attr('id');
              $('[href="#'+ nextTab +'"]').addClass('btn-info').removeClass('btn-default');
              $('[href="#'+ nextTab +'"]').tab('show');
           }
           else
           {
              var prevTab = $activeTab.prev('.tab-pane').attr('id');
              $('[href="#'+ prevTab +'"]').addClass('btn-info').removeClass('btn-default');
              $('[href="#'+ prevTab +'"]').tab('show');
           }
         });
        });

    });
