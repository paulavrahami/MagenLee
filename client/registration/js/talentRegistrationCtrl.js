//import countries from '/public/countries.js';
import countriesCities from '/public/countriesCities.json';
import languages from '/public/languages.json';

angular
    .module('skillera')
    .controller('talentRegistrationCtrl', function($state, $scope, $reactive,$UserAlerts,ENUM ) {

        let vm = this;
        let reactiveContext = $reactive(vm).attach($scope);
        //$reactive(vm).attach($scope);
        vm.dependency = new Deps.Dependency();
        vm.ENUM = ENUM
        vm.setPassword = false;
        vm.userPasswordNew = '******';
        vm.userPasswordConf = '';

        //Load countries and cities
        vm.countriesCities = countriesCities;
        //Load languages
        vm.languages = languages;



        //noinspection JSCheckFunctionSignatures
        vm.currentUpload = new ReactiveVar(false);

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
                  if (currentTalent.country) {
                      vm.selectCities(currentTalent.country)
                  };

                  vm.talentRegistration = {};
                  if (currentTalent.receiveJobOffer){
                    vm.receiveJobOfferView = 'true'    
                  } else {
                    vm.receiveJobOfferView = 'false'
                  };

                  if (currentTalent.shareContact){
                    vm.shareContactView = 'true'    
                  } else {
                    vm.shareContactView = 'false'
                  };

                  if (currentTalent.discreetInd){
                    vm.discreetIndView = 'true'    
                  } else {
                    vm.discreetIndView = 'false'
                  };

                  vm.talentRegistration = {
                    username: currentUser.username,
                    email: currentUser.emails[0].address,
                    type: ENUM.USER.TALENT,
                    firstName: currentTalent.firstName ? currentTalent.firstName : null,
                    lastName: currentTalent.lastName ? currentTalent.lastName : null,
                    city: currentTalent.city ? currentTalent.city : null,
                    country: currentTalent.country ? currentTalent.country : null,
                    contactEmail: currentTalent.contactEmail  ? currentTalent.contactEmail  : null,
                    contactPhone: currentTalent.contactPhone ? currentTalent.contactPhone : null,
                    birthDate: currentTalent.birthDate ? currentTalent.birthDate : null,
                    gender: currentTalent.gender ? currentTalent.gender : null,
                    language: currentTalent.language ? currentTalent.language : null,
                    pictureURL: currentTalent.pictureURL ? currentTalent.pictureURL : null,
                    receiveJobOffer: currentTalent.receiveJobOffer ? currentTalent.receiveJobOffer : null,
                    receiveJobOfferView : vm.receiveJobOfferView,
                    shareContact: currentTalent.shareContact ? currentTalent.shareContact : null,
                    shareContactView : vm.shareContactView,
                    discreetInd: currentTalent.discreetInd ? currentTalent.discreetInd : null,
                    discreetIndView : vm.discreetIndView,
                    linkedin: currentTalent.linkedin ? currentTalent.linkedin : null,
                    proffesion: currentTalent.proffesion ? currentTalent.proffesion : null,
                    expertizeCategory: currentTalent.expertizeCategory ? currentTalent.expertizeCategory : null,
                    expertizeSubCategory: currentTalent.expertizeSubCategory ? currentTalent.expertizeSubCategory : null,
                    skill1: currentTalent.skill1 ? currentTalent.skill1 : null,
                    skill2: currentTalent.skill2 ? currentTalent.skill2 : null,
                    skill3: currentTalent.skill3 ? currentTalent.skill3 : null,
                    skill4: currentTalent.skill4 ? currentTalent.skill4 : null,
                    skill5: currentTalent.skill5 ? currentTalent.skill5 : null,
                    profileTypeTalent: currentTalent.profileTypeTalent ? currentTalent.profileTypeTalent : null,
                    profileTypeDomainExpert: currentTalent.profileTypeDomainExpert ? currentTalent.profileTypeDomainExpert : null,
                    tcAcknowledge: currentTalent.tcAcknowledge ? currentTalent.tcAcknowledge : null
                      }
                  };
                  vm.dependency.changed();
                }
        );

        function doSubscription () {
            reactiveContext.subscribe('skills');
        }

        vm.helpers({
        
            skills () {
              vm.dependency.depend();
              doSubscription ();
    
              (new Promise((resolve, reject) => {
                let skills;
                vm.skillname = [];
                let conditions = {};
                  conditions = {$or: [
                      {$and:[
                      {"status": ENUM.SKILL_STATUS.ACTIVE},
                      {"verificationStatus": "Approved"}
                      ]},
                      {$and: [
                      {"verficationStatus": "Pending"},
                      {"originId": talentId}
                      ]}
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
          }
        });
     

        vm.cancelTalent = function () {
            $state.go("mainChallenges");
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
                                            $state.go("mainChallenges");
                                        }
                                    })
                                );
                            }
                          };


        vm.updateTalentRec = function (talentRec) {

            //Check skills for unidentified values
            
              if (talentRec.skill1 === undefined){               
                talentRec.skill1 = '';
              };
              if (talentRec.skill2 === undefined){               
                talentRec.skill2 = '';
              };
              if (talentRec.skill3 === undefined){               
                talentRec.skill3 = '';
              };
              if (talentRec.skill4 === undefined){               
                talentRec.skill4 = '';
              };
              if (talentRec.skill5 === undefined){               
                talentRec.skill5 = '';
              };


              let talentRecord = angular.copy(talentRec);

              if (talentRec.receiveJobOfferView === 'true') {
                talentRecord.receiveJobOffer = true
              } else {
                talentRecord.receiveJobOffer = false
              };

              if (talentRec.shareContactView === 'true') {
                talentRecord.shareContact = true
              } else {
                talentRecord.shareContact = false
              };

              if (talentRec.discreetIndView === 'true') {
                talentRecord.discreetInd = true
              } else {
                talentRecord.discreetInd = false
              };

              vm.skillsToCheck = [];
              tempIndex = 0;
              if (talentRecord.skill1) {
                    vm.skillsToCheck[tempIndex] = talentRecord.skill1;
                    tempIndex++;
              };
              if (talentRecord.skill2) {
                    vm.skillsToCheck[tempIndex] = talentRecord.skill2;
                    tempIndex++;
              };
              if (talentRecord.skill3) {
                    vm.skillsToCheck[tempIndex] = talentRecord.skill3;
                    tempIndex++;
              };
              if (talentRecord.skill4) {
                    vm.skillsToCheck[tempIndex] = talentRecord.skill4;
                    tempIndex++;
              };
              if (talentRecord.skill5) {
                    vm.skillsToCheck[tempIndex] = talentRecord.skill5;
                    tempIndex++;
              };

              Talents.update({'_id': vm.talentKey},
                       {$set:{'firstName': talentRecord.firstName,
                              'lastName': talentRecord.lastName,
                              'city'    : talentRecord.city,
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
                              'shareContact': talentRecord.shareContact,
                              'discreetInd': talentRecord.discreetInd,
                              'linkedin': talentRecord.linkedin,
                              'profileTypeTalent' : talentRecord.profileTypeTalent,
                              'profile.TypeDomainExpert' : talentRecord.profileTypeDomainExpert,
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
                    vm.checkSkills(vm.skillsToCheck,talentId);
                  }
              });
              vm.dependency.changed();
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


        createNewPendingSkill = function (skill,talentId) {

            vm.skill = {};

            vm.skill.status = ENUM.SKILL_STATUS.ACTIVE;
            vm.skill.name = skill;
            vm.skill.verficationStatus = 'Pending';
            vm.skill.verficationDate = vm.currentDate;
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

        vm.selectCities = function(country) {
            vm.citiesArray = [];;
            index = vm.countriesArray.indexOf(country);
            vm.citiesArray = vm.countryArray[index].cities;
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
