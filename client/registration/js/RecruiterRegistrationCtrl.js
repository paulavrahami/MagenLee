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

     
        function showErrorMessage(msgArg, callbackArg) {
            $UserAlerts.open(msgArg, ENUM.ALERT.DANGER, true, callbackArg);
        };


        // get the recruiter information (i.e., company, admin, users, etc.)
        let currentUser = Accounts.user();
        let companyName = currentUser.profile.companyName;
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
              if (vm.recruiterRegistration.profile.companyLogoId) {
                var dbx = new Dropbox.Dropbox({accessToken: ENUM.DROPBOX_API.TOKEN});
                dbx.filesGetThumbnail({
                    path: '/img/logo/' + vm.recruiterRegistration.profile.companyLogoId,
                    format: 'png',
                    size: 'w64h64'
                    })
                    .then(function(response) {
                        document.getElementById('viewLogo').setAttribute("src", window.URL.createObjectURL(response.fileBlob));
                    })
                    .catch(function(error) {
                        console.log(error);
                });
              };
              vm.dependency.changed();
            };
        });


        // Store the recruiter's logo 
        loadLogo = function (event) {
            var files = event.target.files;
            file = files[0];

            if (file.name) {
                document.getElementById('uploadProgress').setAttribute("class", 'fa fa-refresh fa-spin uploadProgress');
            };

            var dbx = new Dropbox.Dropbox({accessToken: ENUM.DROPBOX_API.TOKEN});
            dbx.filesUpload({
                path: '/img/logo/' + file.name,
                contents: file
                })
                .then(function(response) {
                    vm.recruiterRegistration.profile.companyLogoId = file.name;
                    dbx.filesGetThumbnail({
                        path: '/img/logo/' + file.name,
                        format: 'png',
                        size: 'w64h64'
                        })
                        .then(function(response) {
                            document.getElementById('viewLogo').setAttribute("src", window.URL.createObjectURL(response.fileBlob));
                            document.getElementById('uploadProgress').setAttribute("class", '');
                        })
                        .catch(function(error) {
                            console.log(error);
                    });
                })
                .catch(function(error) {
                     console.log(error);
            });
        };
      

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
                              'companyLogoId': vm.recruiterRegistration.profile.companyLogoId}},
                              function (errorArg, tempIdArg) {
                  if (errorArg) {
                      showErrorMessage(errorArg.message);
                  }
                  else {
                  }
              });
              
        };

        vm.removeUser = function () {

            $UserAlerts.prompt(
                'Rmoving your user will delete all you personal information with no recovery, Are you sure?',
                ENUM.ALERT.INFO,
                true,
                function () {

                    Meteor.call('removeUser', currentUser._id, function (err, result) {
                        if (err) {
                            alert('There is an error to delete your user information, please contact Skillera');
                        } else {
                            $state.go('app');
                        }
                    }
                    )
                }
            );

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
            recruiterUpload () {
                vm.dependency.depend();
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
