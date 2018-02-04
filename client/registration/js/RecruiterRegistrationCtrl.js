import countries from '/public/countries.js';

angular
    .module('skillera')
    .controller('recruiterRegistrationCtrl', function($state, $scope, $reactive,$UserAlerts,ENUM ) {

        let vm = this;
        $reactive(vm).attach($scope);
        vm.dependency = new Deps.Dependency();
        vm.countries = countries;
        vm.ph_numbr = /^(\+?(\d{1}|\d{2}|\d{3})[- ]?)?\d{3}[- ]?\d{3}[- ]?\d{4}$/;
        vm.ENUM = ENUM
        vm.setPassword = false;
        vm.userPasswordNew = '******';
        vm.userPasswordConf = '';

        //** Zvika - Temp untile we'll fix the issue with dropbox upload
        // Meteor.subscribe('logo.files', {
        //     onReady: function () { vm.loadLogo (); vm.dependency.changed();},
        //     onError: function () { console.log("onError", arguments); }
        // });

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
        let companyName = currentUser.profile.companyName;

        //Get user company information
        Meteor.call('getCompanyByName', companyName, function (err, result) {
                if (err) {
                    alert('There is an error while fetching company information');
                } else {
                  currentCompany = result;
                  vm.companyPassword = currentCompany.password;
                  vm.companyKey = currentCompany._id;

                  vm.recruiterRegistration = {
                      username: currentUser.username,
                      email: currentUser.emails[0].address,
                      profile: {
                          type: ENUM.USER.RECRUITER,
                          firstName: currentUser.profile.firstName ? currentUser.profile.firstName : null,
                          lastName: currentUser.profile.lastName ? currentUser.profile.lastName : null,
                          role: currentUser.profile.role ? currentUser.profile.role : null,
                          companyName: currentUser.profile.companyName ? currentUser.profile.companyName : null,
                          companyUserType: currentUser.profile.companyUserType ? currentUser.profile.companyUserType : null,
                          logo: currentCompany.logo  ? currentCompany.logo  : null,
                          address: currentCompany.address ? currentCompany.address : null,
                          phoneNumber: currentUser.profile.phoneNumber ? currentUser.profile.phoneNumber : null,
                          country: currentCompany.country ? currentCompany.country : null,
                          compURL: currentCompany.url ? currentCompany.url : null,
                          linkedInId: currentCompany.linkedInId ? currentCompany.linkedInId : null,
                          category: currentCompany.category ? currentCompany.category : null,
                          subCategory: currentCompany.subCategory ? currentCompany.subCategory : null,
                          size: currentCompany.size ? currentCompany.size : null,
                          contactEmail: currentUser.profile.contactEmail ? currentUser.profile.contactEmail : currentUser.emails[0].address,
                          tcAcknowledge: currentUser.profile.tcAcknowledge ? currentUser.profile.tcAcknowledge : null,
                          companyLogoId: currentCompany.companyLogoId ? currentCompany.companyLogoId : null
                      }
                  };
                  vm.dependency.changed();
                }
        });
        //** Zvika - Temp untile we'll fix the issue with dropbox upload
        // $scope.onFileChange = (function (vm) {
        //     return function (obj) {
        //         let file = obj.files[0];
        //         let progressInterval;
        //         let fs = new FS.File(file);
        //         progressInterval = setInterval(function () {

        //             vm.dependency.changed();
        //         }, 100);
        //         vm.currentUpload.set(fs);
        //         let uploadedFile = LogoFiles.insert(fs, function(err, success) {

        //             clearInterval(progressInterval);
        //             vm.currentUpload.set(false);

        //             if (err) {
        //                 setTimeout(function () {
        //                     $UserAlerts.open("Please check the file size is less then 2Mb and the file is an image", ENUM.ALERT.DANGER, false);
        //                 }, 0);
        //             }
        //             else {
        //                 if (vm.recruiterRegistration.profile.companyLogoId && vm.logoFile) {
        //                     LogoFiles.remove({_id:vm.recruiterRegistration.profile.companyLogoId});
        //                 }
        //                 vm.recruiterRegistration.profile.companyLogoId = uploadedFile._id;

        //                 let i = setInterval(function() {
        //                     if (fs.url()) {
        //                         clearInterval(i);
        //                         setTimeout(vm.loadLogo, 100);
        //                     }
        //                 },100);
        //             }
        //         });
        //     }
        // })(vm);
     

        vm.cancelRecruiter = function () {
            $state.go("recruiter.campaigns");
        };


        vm.updateRecruiter = () => {
            // todo: not working will find how later
            // Meteor.users.allow({
            //     update: function (userId, doc) {
            //         return true;// doc && doc.userId === userId;
            //     }
            // });

            let profileRec = angular.copy(vm.recruiterRegistration.profile);

            if (!vm.recruiterRegistration.profile.firstName ||
                !vm.recruiterRegistration.profile.lastName ||
                !vm.recruiterRegistration.profile.contactEmail ||
                !vm.recruiterRegistration.profile.companyName ||
                !vm.companyPassword ||
                !vm.recruiterRegistration.profile.compURL ||
                ((vm.userPasswordNew && vm.userPasswordNew !== '******') && !vm.userPasswordConf) || 
                ((vm.userPasswordNew && vm.userPasswordNew !== '******') && (vm.userPasswordNew !== vm.userPasswordConf)) ||
                (!vm.userPasswordNew && vm.userPasswordConf)
                ) {
                  showErrorMessage('Please complete the required information')
                    } else {
                                profileRecUser = {
                                      type: ENUM.USER.RECRUITER,
                                      firstName: profileRec.firstName,
                                      lastName: profileRec.lastName,
                                      role: profileRec.role,
                                      companyName: profileRec.companyName,
                                      companyUserType: profileRec.companyUserType,
                                      phoneNumber: profileRec.phoneNumber,
                                      contactEmail: profileRec.contactEmail,
                                      tcAcknowledge: profileRec.tcAcknowledge
                                };
                                Meteor.users.update(Meteor.userId(),
                                    {$set: {
                                        profile: profileRecUser}},
                                    vm.$bindToContext((err) => {
                                        if (err) {
                                            console.log('error');
                                            console.log(err);
                                            vm.error = err;
                                        } else {
                                            if (vm.setPassword && vm.userPasswordNew) {
                                                vm.updateUserPassword (Meteor.userId(),vm.userPasswordNew);
                                            };
                                            vm.updateCompany(vm.recruiterRegistration.profile.companyName,vm.companyPassword);
                                            $state.go("recruiter.campaigns");
                                        }
                                    })
                                );
                            }
                          };


        vm.updateCompany = function (companyName,companyPassword) {
              let companyCountry = angular.copy(vm.recruiterRegistration.profile.country);

              Companies.update({'_id': vm.companyKey},
                       {$set:{'password': companyPassword,
                              'address': vm.recruiterRegistration.profile.address,
                              'country': companyCountry,
                              'url': vm.recruiterRegistration.profile.compURL,
                              'linkedInId': vm.recruiterRegistration.profile.linkedInId,
                              'category': vm.recruiterRegistration.profile.category,
                              'subCategory': vm.recruiterRegistration.profile.subCategory,
                              'size': vm.recruiterRegistration.profile.size,
                              'logo': vm.recruiterRegistration.profile.logo,
                              'companyLogoId': vm.recruiterRegistration.profile.companyLogoId}},
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
            logoFileLink() {
                vm.dependency.depend();
                return vm.logoFile ? vm.logoFile.url() : "";
            },
            loadProgress() {
                vm.dependency.depend();
                let currentUpload = vm.currentUpload.get();
                return currentUpload.uploadProgress ? currentUpload.uploadProgress(): 0;
            }
        });


        vm.loadLogo = function () {
            if (vm.recruiterRegistration.profile.companyLogoId) {

                vm.logoFile = LogoFiles.findOne(vm.recruiterRegistration.profile.companyLogoId);
                vm.dependency.changed();
            }
        };


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
