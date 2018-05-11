//import countries from '/public/countries.js';
import countriesCities from '/public/countriesCities.json';
import languages from '/public/languages.json';

angular
    .module('skillera')
    .controller('talentSignUpCtrl', function($state,$stateParams, $scope, $reactive, $uibModal, dbhService, $UserAlerts,ENUM) {

        let vm = this;

        let reactiveContext = $reactive(vm).attach($scope);
        // $reactive(vm).attach($scope);
        vm.talentType = $stateParams.type;
        vm.dependency = new Deps.Dependency();
        vm.newTalentRegister = {};
        vm.newTalentRegister.profile = {};
        vm.newTalentRegister.profile.receiveJobOfferView = 'true';
        vm.newTalentRegister.profile.receiveJobOffer = true;
        vm.newTalentRegister.profile.shareContactView = 'true';
        vm.newTalentRegister.profile.shareContact = true;
        vm.newTalentRegister.profile.discreetIndView = 'false';
        vm.newTalentRegister.profile.discreetInd = false;
        vm.talent = {};
        vm.userNameInd = false;
        vm.profileTypeTalent = false;
        vm.profileTypeDomainExpert = false;
        vm.currentDate = new Date();
        vm.ENUM = ENUM
        

        //Load countries and cities
        vm.countriesCities = countriesCities;
        //Load languages
        vm.languages = languages;
        
        //Arguments for selecting countries and belonging cities
        vm.country = {
            name: '',
            cities: []
        };
        vm.countryArray = [];
        vm.countriesArray = [];
        vm.citiesArray = [];
        


        //Building 2 arrays
        //1. with all countries (vm.countriesArray)
        //2. with all cities per each country (vm.countryArray)

        Object.keys(vm.countriesCities.countries).forEach(function(key) {
            
            vm.country = {name:key,cities:vm.countriesCities.countries[key]}
            vm.countryArray.push(vm.country);
            vm.countriesArray.push(key);
          
        });

        //Set the profile type based on which option the user click
        if (vm.talentType === 'TALENT'){
            vm.profileTypeTalent = true;
        } else {
            vm.profileTypeDomainExpert = true;
        };

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

                // Store the talent's or DE picture 
                loadPic = function (event) {
                    var files = event.target.files;
                    file = files[0];
        
                    if (file.name) {
                        document.getElementById('uploadProgress').setAttribute("class", 'fa fa-refresh fa-spin uploadProgress');
                    };
        
                    var dbx = new Dropbox.Dropbox({accessToken: ENUM.DROPBOX_API.TOKEN});
                    dbx.filesUpload({
                        path: '/img/pic/' + file.name,
                        contents: file
                        })
                        .then(function(response) {
                            vm.newTalentRegister.profile.picId = file.name;
                            
                            dbx.filesGetThumbnail({
                                path: '/img/pic/' + file.name,
                                format: 'png',
                                size: 'w64h64'
                                })
                                .then(function(response) {
                                    document.getElementById('viewPic').setAttribute("src", window.URL.createObjectURL(response.fileBlob));
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

        function doSubscription () {
                reactiveContext.subscribe('skills');
                reactiveContext.subscribe('professions');
        }

        
        vm.helpers({
        
            skills () {
              vm.dependency.depend();
              doSubscription ();
    
              (new Promise((resolve, reject) => {
                let skills;
                let conditions = {};
                conditions = {$and:[
                    {"status": ENUM.SKILL_STATUS.ACTIVE},
                    {"verificationStatus": "Approved"}
                    ]};
    
                Meteor.call('skills.getSkills', conditions, (err, res) => {
                    if (err) {
                        reject();
                    } else {
                        resolve(res);
                    }
                });
            })).then(function(results){
                vm.temp = results;
                vm.skills = [];
                for  (let z = 0 ; z < vm.temp.length ; z++) {
                         if (vm.temp[z].name){
                             vm.skills[z] = vm.temp[z].name;
                         }
                     };
                
                vm.dependency.changed();
            }).catch(function() {
                vm.skills = [];
            });
                                  
              return vm.skills;
          },
          professions () {
            vm.dependency.depend();
            doSubscription ();
  
            (new Promise((resolve, reject) => {
              let conditions = {};
              conditions = {$and:[
                  {"status": ENUM.SKILL_STATUS.ACTIVE},
                  {"verificationStatus": "Approved"}
                  ]};
  
              Meteor.call('professions.getProfessions', conditions, (err, res) => {
                  if (err) {
                      reject();
                  } else {
                      resolve(res);
                  }
              });
          })).then(function(results){
              vm.temp = results;
              vm.professions = [];
              for  (let z = 0 ; z < vm.temp.length ; z++) {
                       if (vm.temp[z].name){
                           vm.professions[z] = vm.temp[z].name;
                       }
                   };
              
              vm.dependency.changed();
          }).catch(function() {
              vm.professions = [];
          });
                                
            return vm.professions;
        }
        });



        // set the Contact Email to the Login Email as default
        $scope.onEmailUpdate = function(){
              vm.newTalentRegister.profile.contactEmail = vm.newTalentRegister.email;
        };


        vm.register = () => {

            vm.readyForSave = true;
            vm.newTalentRegister.status = 'Active';
            vm.newTalentRegister.origin = 'Registration';
            vm.newTalentRegister.registrationStatus = 'Registered';

            if (vm.newTalentRegister.profile.receiveJobOfferView === 'true') {
                vm.newTalentRegister.profile.receiveJobOffer = true
            } else {
                vm.newTalentRegister.profile.receiveJobOffer = false
            };

            if (vm.newTalentRegister.profile.shareContactView === 'true') {
                vm.newTalentRegister.profile.shareContact = true
            } else {
                vm.newTalentRegister.profile.shareContact = false
            };

            if (vm.newTalentRegister.profile.shareContactView === 'true') {
                vm.newTalentRegister.profile.shareContact = true
            } else {
                vm.newTalentRegister.profile.shareContact = false
            };

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
                        
                    }
            });

        };

        

        vm.checkSkills = function (skillsArray,talentId) {

            for  (let z = 0 ; z < skillsArray.length ; z++) {
                
                 if (vm.skills.indexOf(skillsArray[z]) < 0){
                //Create a pending skill record
                        createNewPendingSkill(skillsArray[z],talentId);
                // Notify the user for the new skill that are not active which is pending Skillera approval
                        showInfoMessage('The skill '+skillsArray[z]+' pending Skillera Admin approval', function () {});
                 };
            };
        };

        vm.checkProfession = function (profession,talentId) {

                
                 if (vm.professions.indexOf(profession) < 0){
                        //Create a pending skill record
                        vm.profession = {};

                        vm.profession.status = ENUM.SKILL_STATUS.ACTIVE;
                        vm.profession.name = profession;
                        vm.profession.verificationStatus = 'Pending';
                        vm.profession.verificationDate = vm.currentDate;
                        vm.profession.origin = 'Talent';
                        vm.profession.originId = talentId;

                        /** Make sure it has control object; */
                        if (!vm.profession.control) {
                            vm.profession.control = {
                                createDate: vm.currentDate
                            };
                        };
                                
                        let professionRec = angular.copy(vm.profession);
                
                        Professions.insert(professionRec, function (errorArg, tempIdArg) {
                            if (errorArg) {
                                showErrorMessage(errorArg.message);
                            } else {
                                vm.applicationId = tempIdArg;
                            }
                        });
                        // Notify the user for the new skill that are not active which is pending Skillera approval
                                showInfoMessage('Profession '+profession+' pending Skillera Admin approval', function () {});
                 };
           
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

      vm.selectCities = function(country) {
            vm.citiesArray = [];;
            index = vm.countriesArray.indexOf(country);
            vm.citiesArray = vm.countryArray[index].cities;
      };
       

        vm.displayLegal = function (sizeArg) {

            $uibModal.open({
                animation: vm.animationsEnabled,
                templateUrl: 'client/registration/view/TCModal.html',
                controller: 'ModalTcoCtrl',
                size: sizeArg
            });
        };

        createNewPendingSkill = function (skill,talentId) {

                vm.skill = {};

                vm.skill.status = ENUM.SKILL_STATUS.ACTIVE;
                vm.skill.name = skill;
                vm.skill.verificationStatus = 'Pending';
                vm.skill.verificationDate = vm.currentDate;
                vm.skill.origin = 'Talent';
                vm.skill.originId = talentId;

                /** Make sure it has control object; */
                if (!vm.skill.control) {
                    vm.skill.control = {
                        createDate: vm.currentDate
                    };
                };
                                
                let skillRec = angular.copy(vm.skill);
        
                Skills.insert(skillRec, function (errorArg, tempIdArg) {
                    if (errorArg) {
                        showErrorMessage(errorArg.message);
                    } else {
                        vm.applicationId = tempIdArg;
                    }
                });

        };

        vm.handleTalent = function (record) {
                            
                            /* populate talent attributes */
                            vm.talent.status = record.status;
                            vm.talent.tcAcknowledge =  record.legal;
                            vm.talent.statusDate = vm.currentDate;
                            vm.talent.origin = record.origin;
                            vm.talent.originDate = vm.currentDate;
                            vm.talent.registrationStatus = record.registrationStatus;
                            vm.talent.registrationStatusDate = vm.currentDate;
                            vm.talent.firstName = record.profile.firstName;
                            vm.talent.lastName = record.profile.lastName;
                            vm.talent.city = record.profile.city;
                            vm.talent.country = record.profile.country;
                            vm.talent.contactPhone = record.profile.contactPhone;
                            vm.talent.contactEmail = record.profile.contactEmail;
                            vm.talent.birthDate = record.profile.birthDate;
                            vm.talent.gender = record.profile.gender;
                            vm.talent.language = record.profile.language;
                            vm.talent.picId = record.profile.picId;
                            vm.talent.receiveJobOffer = record.profile.receiveJobOffer;
                            vm.talent.shareContact = record.profile.shareContact;
                            vm.talent.discreetInd = record.profile.discreetInd;
                            vm.talent.linkedin = record.profile.linkedin;
                            vm.talent.talentId = record.talentId;
                            vm.talent.profession = record.profile.profession;
                            vm.talent.expertizeCategory = record.profile.expertizeCategory;
                            vm.talent.expertizeSubCategory = record.profile.expertizeSubCategory;
                            vm.talent.skill1 = record.profile.skill1;
                            vm.talent.skill2 = record.profile.skill2;
                            vm.talent.skill3 = record.profile.skill3;
                            vm.talent.skill4 = record.profile.skill4;
                            vm.talent.skill5 = record.profile.skill5;
                            vm.talent.profileTypeTalent = vm.profileTypeTalent;
                            vm.talent.profileTypeDomainExpert = vm.profileTypeDomainExpert;
            


                            vm.skillsToCheck = [];
                            tempIndex = 0;
                            if (vm.talent.skill1) {
                                vm.skillsToCheck[tempIndex] = vm.talent.skill1;
                                tempIndex++;
                            };
                            if (vm.talent.skill2) {
                                vm.skillsToCheck[tempIndex] = vm.talent.skill2;
                                tempIndex++;
                            };
                            if (vm.talent.skill3) {
                                vm.skillsToCheck[tempIndex] = vm.talent.skill3;
                                tempIndex++;
                            };
                            if (vm.talent.skill4) {
                                vm.skillsToCheck[tempIndex] = vm.talent.skill4;
                                tempIndex++;
                            };
                            if (vm.talent.skill5) {
                                vm.skillsToCheck[tempIndex] = vm.talent.skill5;
                                tempIndex++;
                            };

                            
            
                            let talentRec = angular.copy(vm.talent);
            
                            Talents.insert(talentRec, function (errorArg, tempIdArg) {
                                if (errorArg) {
                                    showErrorMessage(errorArg.message);
                                } else {
                                    // vm.applicationId = tempIdArg;
                                    vm.applicationId = vm.talent.talentId;
                                    vm.checkSkills(vm.skillsToCheck,vm.applicationId);
                                    if (talentRec.profession) {
                                        vm.checkProfession(talentRec.profession,vm.applicationId)
                                    };
                                }
                            });
            
            
                    };


    });
