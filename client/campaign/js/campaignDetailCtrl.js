angular
    .module('skillera')
    .controller('campaignDetail', function($state,$stateParams,$scope,$reactive,fileUpload,utilsService,dbhService,$UserAlerts,ENUM,$uibModal,moment) {

        let vm = this;
        $reactive(vm).attach($scope);

        vm.campaignId = $stateParams.id;
        vm.campaignType = $stateParams.type;

        vm.activityLogUpd = {};
        vm.dependency = new Deps.Dependency();
        vm.now = moment();
        vm.currentDate = new Date();

        /**  Set CV requirements based on campaign type */
        if (vm.campaignType === ENUM.CAMPAIGN_TYPE.RECRUITMENT ) {
            vm.CVRequired = true;
        } else {
            vm.CVRequired = false;
        };

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
        function showSuccessMessage(msgArg, callbackArg) {
            $UserAlerts.open(msgArg, ENUM.ALERT.SUCCESS, true, callbackArg);
        }

        /**
         * @desc show a dialog with the message;
         * @param msgArg
         * @param callbackArg
         */
        function showInfoMessage(msgArg, callbackArg) {
            $UserAlerts.open(msgArg, ENUM.ALERT.INFO, true, callbackArg);
        }

        /**
         * @desc fail the submit event;
         * @param submitEventArg
         * @returns {boolean}
         */
        function failTheSubmitEvent(submitEventArg) {
            submitEventArg.stopImmediatePropagation();
            submitEventArg.preventDefault();

            return false;
        }

        /**
         * @desc Subscribe to desired collections;
         */
        function doSubscription () {
            if (Meteor.user() && Meteor.user().profile) {
                vm.subscribe('campaignsRecruiter', () => [Meteor.user().profile.companyName]);
                vm.subscribe('activityLog');
                vm.subscribe('position');
            }
        }

        /**
         * @desc Update the status of the items associated with the campaign's audition to "In Use";
         */
        function updateCampaignAuditionItems (auditionIdArg) {
            //** Get the audition associated with the campaign
            let campaignAudition = Auditions.findOne({_id:auditionIdArg});
            if (!campaignAudition) {
                alert(`Cannot get Audition. id: ${auditionIdArg}`);
                return false;
            };
            //** do for every item (challenge) included in the audition:
            campaignAudition.items.every(function (singleItem) {
                // Get an audition's item
                let auditionItem = Items.findOne({_id:singleItem.itemId});
                if (!auditionItem) {
                    alert(`Cannot get Item. id: ${singleItem.itemId}`);
                    return false;
                };
                //** Update the status and the status date - for the first time in use
                if ((auditionItem.status === ENUM.ITEM_STATUS.IN_WORK) || (auditionItem.status === ENUM.ITEM_STATUS.AVAILABLE)) {
                    auditionItem.status = ENUM.ITEM_STATUS.IN_USE;
                    auditionItem.statusDate = (new Date());
                    auditionItem.firstDateInUse = (new Date());
                    Items.update({_id: auditionItem._id}, {$set: angular.copy(auditionItem)}, function (errorArg, tempIdArg) {
                        if (errorArg) {
                            showErrorMessage(errorArg.message);
                        };
                    });
                };
                return true;
            });
        };
             
        /**
         * ReactiveContext;
         */
        vm.helpers({
            /**
             * @desc return requested campaign *OR* new one;
             * @returns {campaign}
             */
            campaign: function () {

                vm.dependency.depend();

                doSubscription ();

                if (vm.campaignId && vm.campaignId !== '') {
                    vm.currentCampaign = Campaigns.findOne({_id: vm.campaignId});
                }

                /**
                 * No campaign found. Init a new one;
                 */
                if (!vm.currentCampaign) {
                    vm.currentCampaign = {
                        cv : vm.CVRequired,
                        duration : 30,
                        minScore : 80,
                        topApplicant : 10,
                        revealedApplicants: 0,
                        emailList : [],
                        salaryExpCurrency : '',
                        salaryExpactations: [
                          {from: 0,
                           to: 0}
                        ],
                        skills : [
                            {
                                type : '',
                                experience : '',
                                importance : ''
                            }
                        ],
                        positionName : '',
                        positionType : ENUM.POSITION_TYPE.PERMANENT,
                        num : '',
                        status : ENUM.CAMPAIGN_STATUS.IN_WORK,
                        type : vm.campaignType,
                        targetExternalTalents : false,
                        targetPoolTalents : false,
                        targetSocialNetworks : false,
                        targetJobBoards : false,
                    };
                }
                return vm.currentCampaign;
            },
            /**
             * @desc returns the activity log of the current campaign;
             * @returns {Mongo.Cursor|[]}
             */
            activityLog: function () {

                vm.dependency.depend();

                doSubscription ();

                return ActivityLog.find({collectionId: vm.currentCampaign._id});
            }
        });

        /**
         * @desc Verify the campaign and return empty or error message;
         */
        vm.silentCampaignVerification = function () {

            if ((!vm.currentCampaign.positionName || vm.currentCampaign.positionName === '') && (vm.currentCampaign.type === ENUM.CAMPAIGN_TYPE.RECRUITMENT)) {
                return 'The position name must have value';
            }
            if ((!vm.currentCampaign.positionName || vm.currentCampaign.positionName === '') && (vm.currentCampaign.type === ENUM.CAMPAIGN_TYPE.LEISURE)) {
                return 'The campaign name must have value';
            }
            if ((!vm.currentCampaign.description || vm.currentCampaign.description === '') && (vm.currentCampaign.type === ENUM.CAMPAIGN_TYPE.RECRUITMENT)) {
                return 'The position description and responsibilities must have value';
            }
            if ((!vm.currentCampaign.description || vm.currentCampaign.description === '') && (vm.currentCampaign.type === ENUM.CAMPAIGN_TYPE.LEISURE)) {
                return 'The description must have value';
            }
            if ((!vm.currentCampaign.location || vm.currentCampaign.location === '') && (vm.currentCampaign.type === ENUM.CAMPAIGN_TYPE.RECRUITMENT)) {
                return 'The position location must have value';
            }
            if ((!vm.currentCampaign.positionType || vm.currentCampaign.positiontype === '') && (vm.currentCampaign.type === ENUM.CAMPAIGN_TYPE.RECRUITMENT)) {
                return 'The position type must have value';
            }
            if (vm.currentCampaign.topApplicant <= 0) {
              return 'The number of Top Applicant must be grater then 0'
            }

            //check if there is an audition assigned to the campaign
            if (!vm.currentCampaign.auditionId){
              return 'An audition has to be defined'
            }

            //check if the campaign's audition has been verified
            vm.audition = Auditions.findOne({_id: vm.currentCampaign.auditionId});
            if (vm.audition.status !== ENUM.AUDITION_STATUS.VERIFIED) {
              return 'The audition has to be verified'
            }

            /** Each skill must have type / experience / weight / auditionId / auditionName and value over 0 */
            for (let index = 0; index < vm.currentCampaign.skills.length; index++) {

                if (vm.currentCampaign.skills[index].type ==  '') {
                    return "The skill's name has to be defined";
                }
                if (vm.currentCampaign.skills[index].experience ==  '') {
                    return "The skill's experience has to be defined";
                }
                if (vm.currentCampaign.skills[index].importance ==  '') {
                    return "The skill's importance has to be defined";
                }
            }
            return '';
        };

        /**
         * @desc Saves the current campaign;
         * @param submitEventArg {Event}
         * @returns {boolean}
         */
        vm.saveCampaign = function (submitEventArg) {

            if (!vm.currentCampaign.positionName || vm.currentCampaign.positionName === '') {
                showErrorMessage('Position name is mandatory!');
            }
            else {
                /** Make sure the campaign has generated id; */
                if (!vm.currentCampaign.num || vm.currentCampaign.num === '') {
                    vm.currentCampaign.num = 'CMP' + dbhService.getNextSequenceValue('campaign');
                }

                /** Make sure it has control object; */
                if (!vm.currentCampaign.control) {
                    vm.currentCampaign.control = {
                        owner: Meteor.user()._id,
                        companyOwner: Meteor.user().profile.companyName,
                        createDate: new Date()
                    };
                    vm.currentCampaign.statusDate = (new Date());
                }

                /** Copy the campaign to prevent angular's hashing; */
                let campaign = angular.copy(vm.currentCampaign);

                if (campaign.status !== ENUM.CAMPAIGN_STATUS.IN_WORK) {
                    let verificationMessage = vm.silentCampaignVerification();

                    if (verificationMessage !== '') {
                        showErrorMessage('Because the campaign is already verified the' + verificationMessage);
                        if (submitEventArg)
                            return failTheSubmitEvent(submitEventArg);
                    }
                }

                /** New campaign; */
                if (!campaign._id) {
                    campaign._id = Campaigns.insert(campaign, function (errorArg, tempIdArg) {
                        if (errorArg) {
                            showErrorMessage(errorArg.message);
                        } else {
                            vm.currentCampaign._id = vm.campaignId = tempIdArg;

                            dbhService.insertActivityLog('Campaign', vm.currentCampaign._id, 'Create', 'Campaign [' + vm.currentCampaign.num + '] was created successfully' );
                            showSuccessMessage('Campaign [' + vm.currentCampaign.num + '] was created successfully');
                            vm.dependency.changed();
                        }
                    });
                }
                /** Update campaign; */
                else {
                    let tempId = campaign._id;
                    delete campaign._id;

                    //noinspection JSUnusedLocalSymbols
                    Campaigns.update({_id: tempId}, {$set: campaign}, function (errorArg, tempIdArg) {
                        if (errorArg) {
                            showErrorMessage(errorArg.message);
                        }
                        else {
                            dbhService.insertActivityLog('Campaign', vm.currentCampaign._id, 'Update', 'Campaign [' + vm.currentCampaign.num + '] was saved successfully');
                            showSuccessMessage('Campaign [' + vm.currentCampaign.num + '] was saved successfully');
                            vm.dependency.changed();
                        }
                    });
                }
            }
            if (submitEventArg)
                return failTheSubmitEvent(submitEventArg);
        };
        /**
         * @desc Saves the current campaign;
         * @param submitEventArg {Event}
         * @returns {boolean}
         */
        vm.silentCampaignSave = function (submitEventArg, callbackArg) {


                /** Make sure the campaign has generated id; */
                if (!vm.currentCampaign.num || vm.currentCampaign.num === '') {
                    vm.currentCampaign.num = 'CMP' + dbhService.getNextSequenceValue('campaign');
                }

                /** Make sure it has control object; */
                if (!vm.currentCampaign.control) {
                    vm.currentCampaign.control = {
                        owner: Meteor.user()._id,
                        companyOwner: Meteor.user().profile.companyName,
                        createDate: new Date()
                    };
                    vm.currentCampaign.statusDate = (new Date());
                }

                /** Copy the campaign to prevent angular's hashing; */
                let campaign = angular.copy(vm.currentCampaign);

                /** New campaign; */
                if (!campaign._id) {
                    campaign._id = Campaigns.insert(campaign, function (errorArg, tempIdArg) {
                        if (errorArg) {
                            showErrorMessage(errorArg.message);
                            if (callbackArg) {
                                callbackArg(errorArg, null);
                            }
                        } else {
                            vm.currentCampaign._id = vm.campaignId = tempIdArg
                            vm.dependency.changed();
                            if (callbackArg) {
                                callbackArg(null, true);
                            }
                        }
                    });
                }
                /** Update campaign; */
                else {
                    let tempId = campaign._id;
                    delete campaign._id;

                    //noinspection JSUnusedLocalSymbols
                    Campaigns.update({_id: tempId}, {$set: campaign}, function (errorArg, tempIdArg) {
                        if (errorArg) {
                            showErrorMessage(errorArg.message);
                            if (callbackArg) {
                                callbackArg(errorArg, null);
                            }
                        }
                        else {
                            vm.dependency.changed();
                            if (callbackArg) {
                                callbackArg(null, true);
                            }
                        }
                    });
                }
            if (submitEventArg)
                return failTheSubmitEvent(submitEventArg);
        };

        /**
         * @desc Verify the campaign;
         */
        vm.verifyCampaign = function () {

            let verificationMessage = vm.silentCampaignVerification();

            /** Make sure the campaign is saved; */
            if (!vm.currentCampaign._id || !vm.currentCampaign.num || vm.currentCampaign.num === '' || !vm.currentCampaign.control) {
                showErrorMessage('Unsaved campaigns cannot be verified!');
            }
            else if (verificationMessage !== '') {
                showErrorMessage(verificationMessage);
            }
            else {
                /** Copy the campaign to prevent angular's hashing; */
                let campaign = angular.copy(vm.currentCampaign);

                if (campaign.status !== ENUM.CAMPAIGN_STATUS.PUBLISHED) {
                    campaign.status = vm.currentCampaign.status = ENUM.CAMPAIGN_STATUS.VERIFIED;
                    campaign.statusDate = vm.currentCampaign.statusDate = (new Date());
                }

                /** Update campaign; */
                let tempId = campaign._id;
                delete campaign._id;

                //noinspection JSUnusedLocalSymbols
                Campaigns.update({_id: tempId}, {$set: campaign}, function (errorArg, tempIdArg) {
                    if (errorArg) {
                        showErrorMessage(errorArg.message);
                    } else {
                        dbhService.insertActivityLog('Campaign', vm.currentCampaign._id, 'Verify', 'Campaign [' + vm.currentCampaign.num + '] was verified successfully');
                        showSuccessMessage('Campaign [' + vm.currentCampaign.num + '] was verified successfully');
                        vm.dependency.changed();
                    }
                });
            }
        };

        /**
         * @desc publish the campaign;
         */
        vm.dispatchCampaign = function () {

          if  (vm.currentCampaign.status === ENUM.CAMPAIGN_STATUS.PUBLISHED) {
              showErrorMessage('Campaign is already On Air');
          }
          else {
                  let verificationMessage = vm.silentCampaignVerification();

                  /** Make sure the campaign is saved; */
                  if (!vm.currentCampaign._id || !vm.currentCampaign.num || vm.currentCampaign.num === '' || !vm.currentCampaign.control) {
                      showErrorMessage('Campaigns must be verified before it is published');
                  }
                  else if (verificationMessage !== '') {
                      showErrorMessage(verificationMessage);
                      }
                  else {
                      /** Copy the campaign to prevent angular's hashing; */
                      let campaign = angular.copy(vm.currentCampaign);

                      campaign.status = vm.currentCampaign.status = ENUM.CAMPAIGN_STATUS.PUBLISHED;
                      campaign.statusDate = (new Date());
                      campaign.startDate = vm.currentCampaign.startDate = vm.currentDate;

                      var result  = campaign.startDate;
                      var endDate = moment(result).add(campaign.duration, 'd');

                      campaign.endDate = vm.currentCampaign.endDate = new Date(endDate);
                      
                      var campaignURL = location.protocol +'//' + location.host + '/campaignApply/' + vm.currentCampaign._id +'/';
                      campaign.applicationURL = campaignURL;

                      /** Update campaign; */
                      let tempId = campaign._id;
                      delete campaign._id;

                      //noinspection JSUnusedLocalSymbols
                      Campaigns.update({_id: tempId}, {$set: campaign}, function (errorArg, tempIdArg) {
                          if (errorArg) {
                              showErrorMessage(errorArg.message);
                          } else {
                              // Update the audition status to "Published"                     
                              let auditionRec = Auditions.findOne({_id:campaign.auditionId});
                              auditionRec.status = ENUM.AUDITION_STATUS.PUBLISHED;
                              auditionRec.statusDate = new Date();
                              Auditions.update({_id: auditionRec._id}, {$set: angular.copy(auditionRec)});

                              // Update the items (challenges) status to "In Use"
                              updateCampaignAuditionItems(campaign.auditionId);

                              dbhService.insertActivityLog('Campaign', vm.currentCampaign._id, 'Published', 'Campaign [' + vm.currentCampaign.num + '] was published successfully');
                              dbhService.insertActivityLog('Campaign', vm.currentCampaign._id, 'Published', 'Campaign [' + vm.currentCampaign.num + '] url:' + campaignURL);
                              showInfoMessage('Campaign [' + vm.currentCampaign.num + '] was published successfully', function () {
                                  $state.go('recruiter.campaigns');
                                  $uibModal.open({
                                      animation: vm.animationsEnabled,
                                      templateUrl: 'client/campaign/view/URLModal.html',
                                      controller: 'ModalURLCtrl',
                                      // resolve: {
                                      //     msg: function () {
                                      //         return campaignURL
                                      //     }
                                      // },
                                      size: 'lg'
                                  });
                              });
                          }
                      });
                  }
          }
        };

        /**
         * @desc Close the campaign;
         */
        vm.closeCampaign = function () {

            if  (vm.currentCampaign.status !== ENUM.CAMPAIGN_STATUS.PUBLISHED) {
                showErrorMessage('The campaign was not published yet');
                return;
            };

            let msgArg = "The campaign will be closed and could not be updated. Please confirm";
            $UserAlerts.prompt(
                msgArg,
                ENUM.ALERT.INFO,
                false,
                function(){
                    updateCampaign ()    
                },
                function(){
                    return;
                }
            );

            function updateCampaign () {
                /** Copy the campaign to prevent angular's hashing; */
                let campaign = angular.copy(vm.currentCampaign);

                campaign.status = vm.currentCampaign.status = ENUM.CAMPAIGN_STATUS.CLOSED;
                campaign.statusDate = vm.currentDate;
                campaign.actualEndDate = vm.currentDate;

                let timeDiff = Math.abs(campaign.actualEndDate.getTime() - campaign.startDate.getTime());
                campaign.actualDuration = Math.ceil(timeDiff / (1000 * 3600 * 24)); 

                /** Update campaign; */
                let tempId = campaign._id;
                delete campaign._id;

                //noinspection JSUnusedLocalSymbols
                Campaigns.update({_id: tempId}, {$set: campaign}, function (errorArg, tempIdArg) {
                    if (errorArg) {
                        showErrorMessage(errorArg.message);
                    } else {
                        dbhService.insertActivityLog('Campaign', vm.currentCampaign._id, 'Close', 'Campaign [' + vm.currentCampaign.num + '] was closed successfully');

                        showInfoMessage('Campaign [' + vm.currentCampaign.num + '] was closed successfully', function () {
                            $state.go('recruiter.campaigns');
                        });
                    }
                });
            };
        };

        vm.afterCloseDate = function () {
            if  (vm.currentCampaign.status === ENUM.CAMPAIGN_STATUS.PUBLISHED) {
                if (vm.currentDate > vm.currentCampaign.endDate) {
                    return (true);
                } else {
                    return (false);
                };
            };
        };

        if  (vm.currentCampaign.status === ENUM.CAMPAIGN_STATUS.PUBLISHED) {
            if (vm.currentDate > vm.currentCampaign.endDate) {
                showInfoMessage("The campaign's end date has already over. Please close the campaign")
            };
        };


    });
