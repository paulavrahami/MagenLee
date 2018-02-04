angular
   .module('skillera')
   .controller('targetCampaignPoolTalents', function($state, $scope, $reactive, $UserAlerts, ENUM, dbhService, $uibModalInstance) {
      var selectSkills = ['','',''];
      var vm = this;
      $reactive(vm).attach($scope);
      vm.numberOfTalents = 0;
      vm.displaySelectionMsg = false;
      vm.displayActivityLog = false;
      vm.dependency = new Deps.Dependency();
      vm.campaign = $scope.campaign;
      vm.campaign.published = vm.campaign.status == ENUM.CAMPAIGN_STATUS.DISPATCHED;
      //** Set the default selection criteria from the Campaign's related fields
      vm.selectProfession = vm.campaign.positionName;
      var length = vm.campaign.skills.length;
      for (var i = 0; i < length; i++) {
        selectSkills[i] = vm.campaign.skills[i].type;
      };
      vm.selectSkill1 = selectSkills[0];
      vm.selectSkill2 = selectSkills[1];
      vm.selectSkill3 = selectSkills[2];
      if (vm.campaign.location === null) {
        vm.selectCountry = ''}
        else {
          vm.selectCountry = vm.campaign.location.name;
        };
      vm.selectCity = '';
      vm.dispatchEmail = true;
      vm.dispatchSMS = false;
      vm.dispatchWhatsApp =false;
      vm.dispatchLinkedIn = false;
      vm.dispatchFacebook = false;


      function showErrorMessage(msgArg) {
          $UserAlerts.open(msgArg, ENUM.ALERT.DANGER, true);
      };


      function sendInvitations () {
        (new Promise((resolve, reject) => {
          Meteor.call('dispatch.email',
            { profession:vm.selectProfession,
              skill1:vm.selectSkill1,
              skill2:vm.selectSkill2,
              skill3:vm.selectSkill3,
              country:vm.selectCountry,
              city:vm.selectCity,
              position:vm.campaign.positionName,
              company:vm.campaign.control.companyOwner,
              applicationURL:vm.campaign.applicationURL
              }, (err, res) => {
                  if (err) {
                    reject();
                  } else {
                    resolve(res);
                  }
                });
              })).then(function(results) {
                    dbhService.insertActivityLog('Campaign', vm.campaign._id, ENUM.ACTIVITY_LOG.DISPATCH_POOL_EMAIL, 'Total Talents: '+results+' , Profession: '+vm.selectProfession+' , Skill1: '+vm.selectSkill1+' , Skill2: '+vm.selectSkill2+' , Skill3: '+vm.selectSkill3+' , Country: '+vm.selectCountry+' , City: '+vm.selectCity);
                    vm.dependency.changed();
                    Campaigns.update({_id: vm.campaign._id}, {$set: {targetPoolTalents: true}}, function (errorArg, tempIdArg) {
                      if (errorArg) {
                        showErrorMessage(errorArg.message);
                      };
                    });
                }).catch(function(error) {
              });
      };              

  
      // vm.helpers({
      //   numberOfTalents () {
      //     vm.dependency.depend();
      //     return vm.numberOfTalents;
      //   }
      // });


      vm.skilleraTalentsReset = function () {
        vm.selectProfession = vm.campaign.positionName;
        var length = vm.campaign.skills.length;
        for (var i = 0; i < length; i++) {
          selectSkills[i] = vm.campaign.skills[i].type;
        };
        vm.selectSkill1 = selectSkills[0];
        vm.selectSkill2 = selectSkills[1];
        vm.selectSkill3 = selectSkills[2];
        vm.selectCountry = vm.campaign.location.name;
        vm.selectCity = '';
        vm.displaySelectionMsg = false;
      };


      vm.skilleraTalentsClear = function () {
        vm.selectProfession = '';
        vm.selectSkill1 = '';
        vm.selectSkill2 = '';
        vm.selectSkill3 = '';
        vm.selectCountry = '';
        vm.selectCity = '';
        vm.displaySelectionMsg = false;
      };


     	vm.skilleraTalentsSelect = function () {
        if ((vm.selectProfession === '') && (vm.selectSkill1 === '') && (vm.selectSkill2 === '') && (vm.selectSkill3 === '')) {
          showErrorMessage('Either Profession or Skills shall be defined');
          vm.displaySelectionMsg = false;
          return;
        };
        if ((vm.selectCountry === '') && (vm.selectCity === '')) {
          showErrorMessage('Either Country or City shall be defined');
          vm.displaySelectionMsg = false;
          return;  
        };

        //** (zvika) Currently, only one text index ($text) is supported per Collection. This should be reevaluated 
        //** with MongoDB 3.4
        //** IMPORTANT !!! Whenever the conditions are changed - do the same in the "dispatch" method
        let conditions = {};
        var professionSkills = vm.selectProfession+" "+vm.selectSkill1+" "+vm.selectSkill2+" "+vm.selectSkill3;
        conditions = {$and:[{"$text": {"$search": professionSkills}},
                            {$or:[{country: vm.selectCountry},{city: vm.selectCity}]},
                            {status: 'Active'},
                            {shareContact: true}]};

        //** Return the number of Talents who met the user defined selection criteria    
        (new Promise((resolve, reject) => {
          Meteor.call('talents.getTalentsCount', conditions, (err, res) => {
            if (err) {
              reject();
            } else {
              resolve(res);
            }
          });
        })).then(function(results) {
              vm.numberOfTalents = results;
              vm.displaySelectionMsg = true;
              vm.dependency.changed();
          }).catch(function(error) {
              vm.numberOfTalents = 0;
        });
      };


      vm.dispatch = function () {
        if (vm.campaign.status !== ENUM.CAMPAIGN_STATUS.DISPATCHED) {
          showErrorMessage('Invitations can be dispatched only during the campaign period');
          return;
        };
        if ((vm.displaySelectionMsg === false) || (vm.numberOfTalents === 0)) {
          showErrorMessage('Talents shall be selected for the campaign');
          return;
        };

        if (!vm.dispatchEmail && !vm.dispatchSMS && !vm.dispatchWhatsApp && !vm.dispatchLinkedIn && !vm.dispatchFacebook) {
            showErrorMessage('No dispatch channel has been selected');
            return;
        };

        let msgArg = "Invitations will be sent to the selected Talents. Please confirm";
        $UserAlerts.prompt(
            msgArg,
            ENUM.ALERT.INFO,
            false,
            function(){ 
              sendInvitations();
               $uibModalInstance.dismiss('cancel');
            },
            function(){ 
              return;
            }
        );
      };


      vm.helpers({
        activityLog() {
          vm.dependency.depend();
          return vm.activityLog;
        }
      });


      vm.activityLogSummary = function () {
        if (vm.displayActivityLog) {
          vm.displayActivityLog = false;
          return;
        };
        vm.displayActivityLog = true;
        (new Promise((resolve, reject) => {
            let activityLog;
            let conditions = {};
            conditions = {$and:[
                          {collectionType: 'Campaign'},
                          {collectionId: vm.campaign._id},
                          {activity: ENUM.ACTIVITY_LOG.DISPATCH_POOL_EMAIL}
                          ]};
            Meteor.call('activityLog.getActivityLogSummery', conditions, (err, res) => {
                if (err) {
                    reject();
                } else {
                    resolve(res);
                }
            });    
            })).then(function(results){
                vm.activityLog = results;
                vm.dependency.changed();
            }).catch(function(error) {
                vm.activityLog = [];
            });
      };


      vm.closeActivityLog = function () {
        vm.displayActivityLog = false;
      };


      vm.cancel = function () {
        vm.displaySelectionMsg = false;
        $uibModalInstance.dismiss('cancel');
      };

    });

