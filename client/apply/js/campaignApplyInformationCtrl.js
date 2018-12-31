// Controler for external execution of an campaign apply login

angular
    .module('skillera')
    .controller('CampaignApplyInformationCtrl', function($state,$stateParams,$scope,$window,$reactive,$UserAlerts,$uibModal,$uibModalInstance,ENUM) {
        let vm = this;
        $reactive(vm).attach($scope);
        vm.dependency = new Deps.Dependency();

        vm.campaignId = $scope.campaignId;
        vm.applicationId = $scope.applicationId;
        vm.campaignType = $scope.$resolve.campaignType;

        //Get campaign type
        if (vm.campaignType === ENUM.CAMPAIGN_TYPE.RECRUITMENT){
            vm.recruitmentLayout = true;
        } else {
            vm.recruitmentLayout = false;
        };

        let currentDate = new Date();
        vm.campaignApply ={};
        vm.tempid = 'test';
        vm.applicationRec = '';
        vm.saved = false;

        let campTempSubscription = {ready: function() {return false}}
        let appSubscription = Meteor.subscribe('applications');
        let compSubscription = Meteor.subscribe('companies');
        let campSubscription = campTempSubscription;
        let userSubscription = campTempSubscription;

        function showErrorMessage(msgArg, callbackArg) {
            $UserAlerts.open(msgArg, ENUM.ALERT.DANGER, true, callbackArg);
        }

        function showInfoMessage(msgArg, callbackArg) {
            $UserAlerts.open(msgArg, ENUM.ALERT.INFO, true, callbackArg);
        }

        vm.onSubscription = function () {

            if (appSubscription.ready() && campTempSubscription === campSubscription) {
                vm.application = Applications.findOne({_id:vm.applicationId});
                vm.application.goNoGo4 = {};
                vm.campaignId = vm.application.campaignId;
                campSubscription = Meteor.subscribe('campaignsRecruiter', vm.application.control.companyOwner);
            }

            if (campSubscription.ready() && campTempSubscription === userSubscription) {
                vm.campaign = Campaigns.findOne({_id: vm.campaignId});
                userSubscription = Meteor.subscribe('specificUser', vm.campaign.control.owner);
            }

            if (appSubscription.ready() &&
                userSubscription.ready() &&
                compSubscription.ready() &&
                campSubscription.ready()) {

                clearInterval(vm.subscriptionTime);

                vm.subscriptionOk = true;

                vm.application = Applications.findOne({_id:vm.applicationId});

                vm.dependency.changed();
                delete vm.onSubscription;
            }
        };
        vm.subscriptionTime = setInterval(vm.onSubscription, 100);

        vm.saveApplication = function() {

          if (vm.application.firstName === '' || vm.application.firstName === null || vm.application.firstName === undefined){
                  showErrorMessage('First name must be defined');
              } else {
                if (vm.application.lastName === '' || vm.application.lastName === null || vm.application.lastName === undefined){
                    showErrorMessage('Last name must be defined');
                } else {
                  if (vm.application.email === '' || vm.application.email === null || vm.application.email === undefined){
                      showErrorMessage('Contact Email must be defined');
                  } else {
                    if (vm.recruitmentLayout && (vm.application.phone === '' || vm.application.phone === null || vm.application.phone === undefined)){
                        showErrorMessage('Contact phone must be defined');
                      } else {
                        // Check if the applicant retry to do the audition one more time
                        // by checking id there an application for this current campaign with either :
                        // application email
                        // application phone
                        // application Linked profile url
                        // AND the application number is not the current application number

                            vm.originalApplication = {};


                            if (vm.campaign.type === ENUM.CAMPAIGN_TYPE.RECRUITMENT) {
                                if (vm.application.linkedInURL){
                                    vm.originalApplication = Applications.findOne({
                                      $and: [
                                      { $or: [
                                        {"email": vm.application.email},
                                        {"phone": vm.application.phone},
                                        {"linkedInURL": vm.application.linkedInURL}
                                              ]},
                                     // HG - Comment the retrieve of the original application by application number
                                     // and status date
                                     //   {"number": {$ne:vm.application.number}},
                                        {"campaignId": vm.application.campaignId},
                                        {"control.status": ENUM.APPLICATION_STATUS.COMPLETED}
                                     //   {"control.statusDate": new Date()}
                                      ]});
                                    } else {
                                      vm.originalApplication = Applications.findOne({
                                        $and: [
                                        { $or: [
                                          {"email": vm.application.email},
                                          {"phone": vm.application.phone}
                                                ]},
                                        // HG - Comment the retrieve of the original application by application number
                                        // and status date
                                       //   {"number": {$ne:vm.application.number}},
                                          {"campaignId": vm.application.campaignId},
                                          {"control.status": ENUM.APPLICATION_STATUS.COMPLETED}
                                       //   {"control.statusDate": new Date()}
                                        ]});
                                    }
                            };
                            // if (vm.application.linkedInURL){
                            // vm.originalApplication = Applications.findOne({
                            //   $and: [
                            //   { $or: [
                            //     {"email": vm.application.email},
                            //     {"phone": vm.application.phone},
                            //     {"linkedInURL": vm.application.linkedInURL}
                            //           ]},
                            //  // HG - Comment the retrieve of the original application by application number
                            //  // and status date
                            //  //   {"number": {$ne:vm.application.number}},
                            //     {"campaignId": vm.application.campaignId},
                            //     {"control.status": ENUM.APPLICATION_STATUS.COMPLETED}
                            //  //   {"control.statusDate": new Date()}
                            //   ]});
                            // } else {
                            //   vm.originalApplication = Applications.findOne({
                            //     $and: [
                            //     { $or: [
                            //       {"email": vm.application.email},
                            //       {"phone": vm.application.phone}
                            //             ]},
                            //     // HG - Comment the retrieve of the original application by application number
                            //     // and status date
                            //    //   {"number": {$ne:vm.application.number}},
                            //       {"campaignId": vm.application.campaignId},
                            //       {"control.status": ENUM.APPLICATION_STATUS.COMPLETED}
                            //    //   {"control.statusDate": new Date()}
                            //     ]});
                            // }

                            //HG - Add the fraud type
                            vm.saved = true;
                            if ((vm.campaign.type === ENUM.CAMPAIGN_TYPE.RECRUITMENT && !vm.originalApplication) || (vm.campaign.type === ENUM.CAMPAIGN_TYPE.LEISURE && !vm.originalApplication._id))  {
                                vm.campaignApply.date = currentDate;
                                vm.campaignApply.campaignID = vm.campaignId;
                                vm.application.control.status = ENUM.APPLICATION_STATUS.COMPLETED;
                                vm.application.fraudType = ENUM.APPLICATION_FRUAD_TYPE.NONE;
                                vm.application.control.statusDate = new Date();
                            } else {
                                vm.application.control.status = ENUM.APPLICATION_STATUS.COMPLETED;
                                vm.application.fraudType = ENUM.APPLICATION_FRUAD_TYPE.REPEAT;
                                vm.application.control.statusDate = new Date();
                                vm.application.originalNumber = vm.originalApplication.number;
                            }
                            if (vm.campaign.goNoGo4) {
                                vm.application.goNoGo4Place = vm.campaign.goNoGo4.place;
                            }
                            //HG - For campaigns of type Leisure, update the application to be revealed from the start
                            if (vm.campaign.type == "Leisure") {
                                vm.application.revealed = true;
                            }

                            delete vm.application._id;
                            Applications.update({_id: vm.applicationId}, {$set: vm.application});
                            vm.application._id = vm.applicationId;

                            if (!vm.campaign.applications) {
                                vm.campaign.applications = [];
                            }
                            if ((vm.campaign.type === ENUM.CAMPAIGN_TYPE.RECRUITMENT && !vm.originalApplication) || (vm.campaign.type === ENUM.CAMPAIGN_TYPE.LEISURE && !vm.originalApplication._id)) {
                                if (vm.campaign.applications.indexOf(vm.application._id) === -1) {
                                    vm.campaign.applications.push(vm.application._id);
                                  }
                                      // vm.campaign.applications.push(vm.application._id);
                                let copyCampaign = angular.copy(vm.campaign);
                                delete copyCampaign._id;
                                Campaigns.update({_id:vm.campaign._id},{$set: copyCampaign});
                              }

                            let fromLocalStorage = JSON.parse(localStorage.getItem("skillera") || '{}');
                            delete fromLocalStorage[vm.campaign.auditionId];
                            localStorage.setItem('skillera', JSON.stringify(fromLocalStorage));

                            $window._auditionCompleted = true;
                            
                            Meteor.call('email.sendThankYouForApply',
                              {
                                  firstName:vm.application.firstName,
                                  lastName:vm.application.lastName,
                                  email:vm.application.email,
                                  applicationNumber:vm.application.number,
                                  position:vm.campaign.positionName,
                                  company:vm.campaign.control.companyOwner,
                                  campaignType:vm.campaign.type
                                }, (err, res) => {
                                  if (err) {
                                  } else {
                                  }
                                });
  
                            $uibModalInstance.close();
                                                      
                            // let thankYouMsg = "Good luck with your "+vm.campaign.positionName+" application! (skillera ref: "+vm.application.number+")";
                            let thankYouMsg = "Good luck with your "+vm.campaign.positionName+" application!";
                            showInfoMessage(thankYouMsg);
                      }
                    }}}
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

        vm.auditiondetailexec = function(audition){

            $state.go("campaignAuditionExec",{id:audition.auditionId,cid:vm.campaignId,aid:vm.applicationRec._id});
        };


        // Store the talent's CV 
        loadCV = function (event) {
            var files = event.target.files;
            file = files[0];

            // Only word files are supported by the Dropbox view function
            var ext = file.name.split('.').pop();
            if (ext !=="docx" && ext !== "doc") {
                showErrorMessage("Please load only a word file format ('docx' or 'doc' extension)");
                return;
            };

            if (file.name) {
                document.getElementById('uploadProgress').setAttribute("class", 'fa fa-refresh fa-spin uploadProgress');
            };

            var dbx = new Dropbox.Dropbox({accessToken: ENUM.DROPBOX_API.TOKEN});
            dbx.filesUpload({
                path: '/txt/cv/' + file.name,
                contents: file
                })
                .then(function(response) {
                    vm.application.cv = file.name;
                    document.getElementById('uploadProgress').setAttribute("class", '')
                })
                .catch(function(error) {
                     console.log(error);
            });
        };

        
    });