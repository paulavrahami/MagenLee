import countries from '/public/countries.js';

angular
    .module('skillera')
    .controller('recruiterSignUpCtrl', function($state, $scope, $reactive, $uibModal, dbhService, $UserAlerts,ENUM) {

        let vm = this;
       
        $reactive(vm).attach($scope);
        vm.dependency = new Deps.Dependency();
        vm.countries = countries;
        vm.ph_numbr = /^(\+?(\d{1}|\d{2}|\d{3})[- ]?)?\d{3}[- ]?\d{3}[- ]?\d{4}$/;
        vm.newRecruiterRegister = {};
        vm.newRecruiterRegister.profile = {};
        vm.company = {};
        vm.companyAdmin = false;
        vm.companyFieldsView = false;
        vm.companyPasswordPass = false;
        vm.companyExist = true;
        vm.companySignUp = 'N/A';

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
        }

        /**
         * @desc show a dialog with the message;
         * @param msgArg
         * @param callbackArg
         */
        function showInfoMessage(msgArg, callbackArg) {
            $UserAlerts.open(msgArg, ENUM.ALERT.INFO, true, callbackArg);
        }

        // Store the recruiter's logo 
        loadLogo = function (event) {
            var files = event.target.files;
            file = files[0];

            var dbx = new Dropbox.Dropbox({accessToken: ENUM.DROPBOX_API.TOKEN});
            dbx.filesUpload({
                path: '/img/logo/' + file.name,
                contents: file
                })
                .then(function(response) {
                    vm.newRecruiterRegister.profile.companyLogoId = file.name;
                    dbx.filesGetThumbnail({
                        path: '/img/logo/' + file.name,
                        format: 'png',
                        size: 'w64h64'
                        })
                        .then(function(response) {
                            document.getElementById('viewLogo').setAttribute("src", window.URL.createObjectURL(response.fileBlob));
                        })
                        .catch(function(error) {
                            console.log(error);
                    });
                })
                .catch(function(error) {
                     console.log(error);
            });
        };
       

        // set the Contact Email to the Login Email as default
        $scope.onEmailUpdate = function(){
              vm.newRecruiterRegister.profile.contactEmail = vm.newRecruiterRegister.email;
        };


        vm.register = function() {
            if (vm.companySignUp === 'New') {
                vm.companyUserType = ENUM.COMPANY_USER_TYPE.ADMIN;
                vm.companyAdmin = true;
            } else {
                vm.companyUserType = ENUM.COMPANY_USER_TYPE.REGULAR;
                vm.companyAdmin = false;
            };
            vm.userRegistration();
        };


        vm.userRegistration = function (){
            let profileRec = angular.copy(vm.newRecruiterRegister.profile);
            
            // ensure that the company code has been confirmed
            if ((vm.companySignUp === 'Join') && (!vm.companyPasswordPass)) {
                 showErrorMessage("Please confirm the company code");
                 return
            };

            // In case the Company information has been completed, inquier the user to enter the admin/user information
            if (vm.newRecruiterRegister.profile.companyName &&
                vm.newRecruiterRegister.profile.companyPassword &&
                vm.newRecruiterRegister.profile.compURL &&
                vm.newRecruiterRegister.profile.country &&
               (!vm.newRecruiterRegister.name ||
                !vm.newRecruiterRegister.email ||
                !vm.newRecruiterRegister.pass1 ||
                !(vm.newRecruiterRegister.pass1 === vm.newRecruiterRegister.pass2) ||
                !vm.newRecruiterRegister.profile.firstName ||
                !vm.newRecruiterRegister.profile.lastName ||
                !vm.newRecruiterRegister.profile.contactEmail)) {

                if (vm.companyAdmin) {
                    showErrorMessage("Please complete the Admin user information")
                } else {
                    showErrorMessage("Please complete the user information")
                };
                return;
            };
   
            if (!vm.newRecruiterRegister.name ||
                !vm.newRecruiterRegister.profile.companyPassword ||
                !vm.newRecruiterRegister.email ||
                !vm.newRecruiterRegister.pass1 ||
                !(vm.newRecruiterRegister.pass1 === vm.newRecruiterRegister.pass2) ||
                !vm.newRecruiterRegister.legal ||
                !vm.newRecruiterRegister.profile.firstName ||
                !vm.newRecruiterRegister.profile.lastName ||
                !vm.newRecruiterRegister.profile.contactEmail ||
                !vm.newRecruiterRegister.profile.companyName ||
                (!vm.newRecruiterRegister.profile.compURL && vm.companyAdmin) ||
                !vm.newRecruiterRegister.profile.country) {

                showErrorMessage('Please complete all required information');
                return;
            };

            Accounts.createUser({
                username: vm.newRecruiterRegister.name,
                email: vm.newRecruiterRegister.email,
                password: vm.newRecruiterRegister.pass1,
                profile: {
                    type: 'Recruiter',
                    tcAcknowledge: vm.newRecruiterRegister.legal,
                    firstName: profileRec.firstName,
                    lastName: profileRec.lastName,
                    role: profileRec.role,
                    accessMode: profileRec.accessMode,
                    companyName: profileRec.companyName,
                    companyUserType: vm.companyUserType,
                    phoneNumber: profileRec.phoneNumber,
                    contactEmail: profileRec.contactEmail}
                },
                vm.$bindToContext((err) => {
                    if (err) {
                        vm.error = err;
                        alert(vm.error);
                    } else {
                        vm.handleCompany(vm.newRecruiterRegister);
                        $state.go('recruiter.campaigns');
                    };
                })
            );    
        };        


        vm.checkUserName = function (userName) {
            Meteor.call('checkIfUserExists', userName, function (err, result) {
              if (err) {
                  alert('Technical error while checking Username');
              } else {
                  if (result === false) {
                  } else {
                      showErrorMessage('A user with username "' + userName + '" already exists');
                      vm.newRecruiterRegister.name = "";
                  }
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
                      vm.newRecruiterRegister.email = "";
                  }
              }
            });
        };


        vm.checkCompany = function (companyName) {
            if (vm.companySignUp === 'New') {
                Meteor.call('checkIfCompanyExists', companyName, function (err, result) {
                    if (err) {
                        alert('Technical error while checking company existance');
                    } else {
                        if (result === false) {
                            // no company found, first company register, user is Admin
                            vm.companyExist = false;
                        } else {
                            vm.companyExist = true;
                            showErrorMessage('Company "' + companyName + '" already exists. You may want to select to join');
                            vm.newRecruiterRegister.profile.companyName = "";
                        };
                    };
                });
            };
            if (vm.companySignUp === 'Join') {
                Meteor.call('checkIfCompanyExists',companyName,function (err, result) {
                    if (err) {
                        alert('Technical error while checking company existance');
                    } else {
                        if (result === false) {
                            showErrorMessage('Company "' + companyName + '" does not exist in the system');
                            vm.newRecruiterRegister.profile.companyName = "";
                            vm.companyExist = false;
                        };
                    };
                });
            };
        };    

        vm.checkUrl = function (companyUrl) {
            Meteor.call('checkIfUrlExists', companyUrl, function (err, result) {
                if (err) {
                  alert('Technical error while checking company existance');
                } else {
                    if (result === true) {
                        showErrorMessage('The "' + companyUrl + '" web site has already been defined for other company');
                        vm.newRecruiterRegister.profile.compURL = "";
                    };
                };
            });
        };

        vm.checkCompanyPassword = function (companyPassword, companyName) {
            if (vm.companySignUp === 'Join'){
                if (companyName === '' || !companyName) {
                    showErrorMessage('Company Name should be defined');
                    return;
                };
                Meteor.call('checkCompanyPassword', companyPassword, companyName, function (err, result) {
                    if (err) {
                        alert('There is an error while getting company by code');
                    } else {
                        if (result === true) {
                            vm.companyPasswordPass = true;
                            showInfoMessage('Company Code has been confirmed. Please define your user profile');
                            // set company info for the joined user
                            Meteor.call('getCompanyByName', companyName, function (err, result) {
                                if (err) {
                                    alert('There is an error while fetching company information');
                                } else {
                                    currentCompany = result;
                                    vm.newRecruiterRegister.profile.compURL = currentCompany.url;
                                    vm.newRecruiterRegister.profile.linkedInId = currentCompany.linkedInId;
                                    vm.newRecruiterRegister.profile.category = currentCompany.category;
                                    vm.newRecruiterRegister.profile.subCategory = currentCompany.subCategory;
                                    vm.newRecruiterRegister.profile.size = currentCompany.size;
                                    vm.newRecruiterRegister.profile.address = currentCompany.address;
                                    vm.newRecruiterRegister.profile.country = currentCompany.country;
                                };
                            })
                        } else {
                            // no company with that password was found
                            vm.companyPasswordPass = false;
                            showErrorMessage('Wrong Company Code');
                        };
                    };
                });
            };    
            if (vm.companySignUp === 'New') {
                if (companyPassword && (companyPassword.trim() !== "")) {
                    // Check company code uniqness
                    Meteor.call('checkCompanyPasswordUnique', companyPassword, function (err, result) {
                        if (err) {
                            alert('There is an error while checking company code uniqueness');
                        } else {
                            if (result === false) {
                                //no company code is unique
                                vm.companyPasswordPass = true;
                            } else {
                                //company code already exist
                                showErrorMessage('Invalid Company Code')
                                vm.companyPasswordPass = false;
                            };
                        };
                    });
                };
            };
        };

        vm.changeRegistrationType = function () {
          vm.newRecruiterRegister.profile.companyName = "";
          vm.newRecruiterRegister.profile.companyPassword = "";
          vm.newRecruiterRegister.profile.compURL = "";
          vm.newRecruiterRegister.profile.linkedInId = "";
          vm.newRecruiterRegister.profile.category = "";
          vm.newRecruiterRegister.profile.subCategory = "";
          vm.newRecruiterRegister.profile.size = "";
          vm.newRecruiterRegister.profile.address = "";
          vm.newRecruiterRegister.profile.country = {};    
        };

        vm.handleCompany = function (record) {

          if (vm.companyAdmin){
                /** Make sure the company has generated id; */
                if (!vm.company.id || vm.company.id === '') {
                    vm.company.number = 'CMPNY' + dbhService.getNextSequenceValue('company');
                }

                /* populate company attributes */
                vm.company.name = record.profile.companyName;
                vm.company.address = record.profile.address;
                vm.company.country = record.profile.country;
                vm.company.url = record.profile.compURL;
                vm.company.linkedInId = record.profile.linkedInId;
                vm.company.category = record.profile.category;
                vm.company.subCategory = record.profile.subCategory;
                vm.company.size = record.profile.size;
                vm.company.companyLogoId = record.profile.companyLogoId;
                vm.company.password = record.profile.companyPassword.trim();
                vm.company.adminUserName = vm.newRecruiterRegister.name;

                /** Make sure it has control object; */
                if (!vm.company.control) {
                    vm.company.control = {
                        createDate: new Date()
                    };
                };

                let companyRec = angular.copy(vm.company);

                Companies.insert(companyRec, function (errorArg, tempIdArg) {
                    if (errorArg) {
                        showErrorMessage(errorArg.message);
                    } else {
                        vm.applicationId = tempIdArg;
                    }
                });

        };

        };

        vm.displayLegal = function (sizeArg) {

            $uibModal.open({
                animation: vm.animationsEnabled,
                templateUrl: 'client/registration/view/TCModal.html',
                controller: 'ModalTcoCtrl',
                size: sizeArg
            });
        };

        vm.helpers({

        });

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
