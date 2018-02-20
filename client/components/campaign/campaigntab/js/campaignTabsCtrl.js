// import countries from './countries.js';
import countries from '/public/countries.js';
import ActivityLog from '/model/activityLog';
import Positions from '/model/positions';
import Skills from '/model/skills';
import Auditions from '/model/auditions';

angular
    .module('skillera')
    .controller('campaignTabs', function($state, $scope, $rootScope, $reactive, $uibModal, moment, utilsService,$UserAlerts,dbhService, ENUM) {

        let vm = this;
        $reactive(vm).attach($scope);

        vm.ENUM = ENUM;
        vm.animationsEnabled = true;
        vm.now = moment();

        vm.$scope = $scope;

        vm.dependency = new Deps.Dependency();

        vm.countries = countries;
        vm.positions = [];
        vm.skills = [];
        vm.auditions = [];
        vm.complexityArray = [ENUM.EXPERIENCE.up1, ENUM.EXPERIENCE.up2, ENUM.EXPERIENCE.up3, ENUM.EXPERIENCE.up4];
        vm.positionTypes   = [ENUM.POSITION_TYPE.CONTRACTOR, ENUM.POSITION_TYPE.PART_TIME, ENUM.POSITION_TYPE.PERMANENT];
        vm.skillsExperience = [ENUM.EXPERIENCE.up1, ENUM.EXPERIENCE.up2, ENUM.EXPERIENCE.up3, ENUM.EXPERIENCE.up4];
        vm.skillsImportance = [ENUM.SKILL_IMPORTANCE.NICE, ENUM.SKILL_IMPORTANCE.LOW, ENUM.SKILL_IMPORTANCE.NORMAL, ENUM.SKILL_IMPORTANCE.HIGH, ENUM.SKILL_IMPORTANCE.MUST];
        vm.campaignActivityLog = vm.activity;
        vm.timeOffset = 0;//(new Date()).getTimezoneOffset() * 60000;
        //----
        vm.uploadfile = 'test';
        vm.fileload = false;
        vm.campaign.salaryExpCurrency = 'NIS';
        // temp fix; until the issue with CV upload will be fixed
        vm.campaign.cv = false;


        vm.targetCampaignManuallyURL = function () {
            campaignURL = vm.campaign.applicationURL;
            $uibModal.open({
                animation: vm.animationsEnabled,
                templateUrl: 'client/campaign/view/URLModal.html',
                controller: 'ModalURLCtrl',
                resolve: {
                    msg: function () {
                        return campaignURL
                    }
                },
                size: 'lg'
            });
        };

        vm.targetCampaignSpecificTalent = function () {
            $scope.campaign = vm.campaign;
            $uibModal.open({
                animation: vm.animationsEnabled,
                templateUrl: 'client/campaign/view/targetCampaignSpecificTalent.html',
                controller: 'targetCampaignSpecificTalent',
                controllerAs: 'vm',
                scope: $scope,
                size: 'lg'
            });
        };

        vm.targetCampaignExternalTalents = function () {
            $scope.campaign = vm.campaign;
            $uibModal.open({
                animation: vm.animationsEnabled,
                templateUrl: 'client/campaign/view/targetCampaignExternalTalents.html',
                controller: 'targetCampaignExternalTalents',
                controllerAs: 'vm',
                scope: $scope,
                size: 'lg'
            });
        };

        vm.targetCampaignPoolTalents = function () {
            $scope.campaign = vm.campaign;
            $uibModal.open({
                animation: vm.animationsEnabled,
                templateUrl: 'client/campaign/view/targetCampaignPoolTalents.html',
                controller: 'targetCampaignPoolTalents',
                controllerAs: 'vm',
                scope: $scope,
                size: 'lg'
            });
        };
               
        vm.targetCampaignSocialNetworks = function() {
            $scope.campaign = vm.campaign;
            $scope.linkedInId = vm.linkedInId;
            $uibModal.open({
                animation: vm.animationsEnabled,
                templateUrl: 'client/campaign/view/targetCampaignSocial.html',
                controller: 'targetCampaignSocial',
                controllerAs: 'vm',
                scope: $scope,
                size: 'lg'
            });
        };

        vm.targetCampaignJobBoards = function() {
            showInfoMessage('Feature will be available soon…', function () {});
        };

        /**
         * @desc show a dialog with the message;
         * @param msgArg
         * @param callbackArg
         */
        function showInfoMessage(msgArg, callbackArg) {
            $UserAlerts.open(msgArg, ENUM.ALERT.INFO, true, callbackArg);
        }

        function showErrorMessage(msgArg, callbackArg) {
            $UserAlerts.open(msgArg, ENUM.ALERT.DANGER, true, callbackArg);
        }

        $scope.$watch("vm.campaign.skills", function() {
           vm.createSummery();
        }, true);

        vm.$onChanges  = function () {
            /**
             * If campaign details is null then it's a new campaign;
             */
            if (vm.campaign) {
                vm.campaignPublished = vm.campaign.status === 'Dispatched';
                vm.campaignActivityLog = vm.activity;
                
                vm.targetExternalTalents = vm.campaign.targetExternalTalents;
                vm.targetPoolTalents = vm.campaign.targetPoolTalents;
                vm.targetSocialNetworks = vm.campaign.targetSocialNetworks;
                vm.targetJobBoardsTalents = vm.campaign.targetJobBoards;

                if ((vm.campaign.status == ENUM.CAMPAIGN_STATUS.IN_WORK) || 
                    (vm.campaign.status == ENUM.CAMPAIGN_STATUS.VERIFIED)) {
                    vm.targetManuallyURLDisabled = true;
                    vm.targetSpecificTalentDisabled = true;
                    vm.targetExternalTalentsDisabled = true;
                    vm.targetPoolTalentsDisabled = false;
                    vm.targetSocialNetworksDisabled = true;
                    vm.targetJobBoardsDisabled = true;
                };
                if (vm.campaign.status == ENUM.CAMPAIGN_STATUS.DISPATCHED) {
                    vm.targetManuallyURLDisabled = false;
                    vm.targetSpecificTalentDisabled = false;
                    vm.targetExternalTalentsDisabled = false;
                    vm.targetPoolTalentsDisabled = false;
                    vm.targetSocialNetworksDisabled = false;
                    vm.targetJobBoardsDisabled = false;
                };

                if (vm.campaign.skills.length > 0) {
                    vm.editSkill = vm.campaign.skills[0];
                }
                if (!vm.campaign.positionType) vm.campaign.positionType='';
            }
            else {
                vm.campaignActivityLog = {};
                vm.campaignPublished = false;

                /**
                 * init a new campaign;
                 */
                vm.campaign = {
                    cv: true,
                    duration: 30,
                    minScore: 80,
                    topApplicant: 10,
                    revealedApplicants: 0,
                    emailList: [],
                    positionType:'Permanent',
                    targetExternalTalents: false,
                    targetPoolTalents: false,
                    targetSocialNetworks: false,
                    targetJobBoards: false,
                    salaryExpactations: [
                        {from: 0,
                            to: 0}
                    ],
                    skills: [{
                        type: '',
                        experience: '',
                        Importance: ''
                        // auditionId: '',
                        // auditionName: ''
                    }]
                };
            }

            /**
             * @desc Callbacks to async subscriptions
             */
            vm.onSubscription = {
                onReady: function () { vm.dependency.changed(); },
                onError: function () { console.log("onError", arguments); }
            };

            Meteor.subscribe('items', vm.onSubscription);
            Meteor.subscribe('activityLog', vm.onSubscription);
            // Meteor.subscribe('position', vm.onSubscription);
            Meteor.subscribe('skills', vm.onSubscription);
            Meteor.subscribe('allAuditions', {
                onReady: function () {

                    if (vm.campaign.auditionId) {
                        vm.audition = Auditions.findOne({_id: vm.campaign.auditionId});
                    }
                    else {
                        /* init temp audition */
                        vm.audition = {
                            "name": vm.campaign.positionName,
                            "description": "",
                            "instructions": "",
                            "type": ENUM.AUDITION_TYPE.RECRUITMENT,
                            "status": ENUM.AUDITION_STATUS.IN_WORK,
                            "statusDate": new Date(),
                            "durationMethod": ENUM.AUDITION_DURATION.AUDITION,
                            "auditionDuration": 900000,// (new Date(0 + (new Date()).getTimezoneOffset() * 60000 + 1800000)),
                            "itemsOrder": ENUM.AUDITION_ORDER.SEQUEL,
                            "items": [],
                            "retries": "0",
                            "nextMethod": ENUM.AUDITION_FLOW.MANUAL,
                            "tags": [],
                            "control": {
                                "author": Meteor.user()._id,
                                "companyOwner": Meteor.user().profile.companyName,
                                "createDate": new Date()
                            }
                        };
                    }
                    vm.createSummery();
                },
                onError: function () { console.log("onError", arguments); }
            });
        };

        vm.createSummery = () => {
            vm.dependency.depend();

            /** Calculate Item Max Score */
            let allWeight = 0;

            vm.summery = {
                skills:{},
                score:0,
                total:0,
                time: vm.timeOffset
            };

            if (vm.audition) {
                vm.campaign.skills.every(function (skill) {
                    vm.summery.skills[skill.type] = {
                        time: 0,
                    };
                    vm.skillsExperience.every(function (complexity) {
                        vm.summery.skills[skill.type][complexity] = 0;
                        vm.summery[complexity] = 0;
                        vm.summery.skills[skill.type].score = 0;
                        vm.summery.skills[skill.type].total = 0;
                        vm.summery.skills[skill.type].time = vm.timeOffset;
                        return true;
                    });
                    return true;
                });

                vm.audition.items.every(function (singleItem) {

                    let item = Items.findOne({_id:singleItem.itemId});

                    if (!item) {
                        alert(`Cannot get item id: ${singleItem.itemId}`);
                        return false;
                    }
                    if (!item.skill) {
                        item.skill = "";
                    }

                    if ((!item.skill) && !vm.summery.skills["Unclassified"]) {
                        vm.summery.skills["Unclassified"] = {};
                        vm.complexityArray.every(function (complexity) {
                            vm.summery.skills["Unclassified"][complexity] = 0;
                            vm.summery.skills["Unclassified"].score = 0;
                            vm.summery.skills["Unclassified"].total = 0;
                            vm.summery.skills["Unclassified"].time = vm.timeOffset;
                            return true;
                        });
                    };
                  
                    let skillType = item.skill || 'Unclassified';
                    try {
                        if (item.complexity === ENUM.EXPERIENCE.up1) {
                            vm.summery.skills[skillType][ENUM.EXPERIENCE.up1]++;
                            vm.summery[ENUM.EXPERIENCE.up1]++;
                        }
                        if (item.complexity === ENUM.EXPERIENCE.up2) {
                            vm.summery.skills[skillType][ENUM.EXPERIENCE.up2]++;
                            vm.summery[ENUM.EXPERIENCE.up2]++;
                        }
                        if (item.complexity === ENUM.EXPERIENCE.up3) {
                            vm.summery.skills[skillType][ENUM.EXPERIENCE.up3]++;
                            vm.summery[ENUM.EXPERIENCE.up3]++;
                        }
                        if (item.complexity === ENUM.EXPERIENCE.up4) {
                            vm.summery.skills[skillType][ENUM.EXPERIENCE.up4]++;
                            vm.summery[ENUM.EXPERIENCE.up4]++;
                        }
                        vm.summery.skills[skillType].time += item.itemDuration.valueOf() - vm.timeOffset;
                        vm.summery.time += item.itemDuration.valueOf() - vm.timeOffset;
                        vm.summery.skills[skillType].score += singleItem.maxScore;
                        vm.summery.skills[skillType].total++;
                        vm.summery.score += singleItem.maxScore;
                        vm.summery.total++;

                        if ((vm.summery.skills[skillType].score + "").indexOf("999") > -1) {
                            vm.summery.skills[skillType].score = Math.ceil(vm.summery.skills[skillType].score);
                        }
                        if ((vm.summery.score + "").indexOf("999") > -1) {
                            vm.summery.score = Math.ceil(vm.summery.score);
                        }
                    }
                    catch (e) {
                    }

                    if (item.skill.importance === ENUM.SKILL_IMPORTANCE.NICE) {
                        allWeight += 1;
                    }
                    else if (item.skill.importance === ENUM.SKILL_IMPORTANCE.LOW) {
                        allWeight += 2;
                    }
                    else if (item.skill.importance === ENUM.SKILL_IMPORTANCE.NORMAL) {
                        allWeight += 3;
                    }
                    else if (item.skill.importance === ENUM.SKILL_IMPORTANCE.HIGH) {
                        allWeight += 4;
                    }
                    else if (item.skill.importance === ENUM.SKILL_IMPORTANCE.MUST) {
                        allWeight += 5;
                    }
                    
                    vm.summery.timeLeft = vm.audition.auditionDuration - vm.summery.time;
                    return true;
                });

                allWeight = Math.max(allWeight, 1);
                let singleWeight = 100 / allWeight;
                let allTime = vm.timeOffset;

                vm.audition.items.every(function (singleItem) {

                    let item = Items.findOne({_id:singleItem.itemId});

                    allTime += item.itemDuration.valueOf() - vm.timeOffset;

                    return true;
                });
            }
            vm.dependency.changed();
        };

        /**
         * ReactiveContext;
         */
        vm.helpers({

            updateNonHelpers () {
                /**
                 * @desc If working with chosen, two things to consider:
                 * 1st: Chosen cannot work with helpers (reactive context);
                 *      Chosen just don't get along with it. Create crazy bugs.
                 * 2nd: Chosen cannot work with mongodb cursor nor mongoose query.
                 *      Chosen is confusing indices and make a mess.
                 *
                 * So the solution is to convert cursors/queries into simple array,
                 * and to update controller variables from a helper by settings
                 * "is..." helpers to let angular know when the data is ready.
                 */
                vm.dependency.depend();

                let isDependencyChanged = function() {};

                if (!vm.positions.length > 0) {

                    let positions = Positions.find({});

                    if (positions.count() > 0) {

                        positions.forEach(function (position) {
                            vm.positions.push(position.title);
                        });
                        isDependencyChanged = vm.dependency.changed;
                    }
                }
                if (!vm.skills.length > 0) {

                    let skills = Skills.find({});

                    if (skills.count() > 0) {

                        skills.forEach(function (skill) {
                            vm.skills.push(skill.title);
                        });
                        isDependencyChanged = vm.dependency.changed;
                    }
                }
                if (!vm.auditions.length > 0 && Meteor.user() && Meteor.user().profile) {

                    //todo:Hadar what is needed in the Auditions collection to support this:
                    //Meteor.subscribe('auditions',() => [Meteor.user().profile.companyName]);

                    let auditions = Auditions.find({});

                    if (auditions.count() > 0) {

                        auditions.forEach(function (audition) {
                            vm.auditions.push(audition.title);
                        });
                        isDependencyChanged = vm.dependency.changed;
                    }
                }
                if (Meteor.user() && Meteor.user().profile && Meteor.user().profile.companyName) {

                  //Get user company information
                  Meteor.call('getCompanyByName', Meteor.user().profile.companyName, function (err, result) {
                          if (err) {
                              alert('There is an error while fetching company information');
                          } else {
                            currentCompany = result;
                            if (!vm.campaign.location) {
                                vm.campaign.location = currentCompany.country
                            };
                            vm.linkedInId = currentCompany.linkedInId;
                          };
                  });
                };

                isDependencyChanged();
            },
            isPositions () {
                vm.dependency.depend();
                return !!vm.positions && vm.positions.length > 0;
            },
            isSkills () {
                vm.dependency.depend();
                return !!vm.skills && vm.skills.length > 0;
            },
            isAuditions () {
                vm.dependency.depend();
                return !!vm.auditions && vm.auditions.length > 0;
            },

            activityLog () {
                vm.dependency.depend();

                if (Meteor.user() && Meteor.user().profile) {
                    let activityLog;

                    if (!vm.campaign) {
                        activityLog = [];
                    }
                    else if (!vm.campaign._id) {
                        activityLog = [];
                    }
                    else {
                        activityLog = ActivityLog.find({collectionId: vm.campaign._id});
                    }
                    return activityLog;
                }
            }
        });

        vm.editAudition = function () {

            function openTheEditAudition(error, success) {
                if (success === true) {
                    setTimeout(function() {
                        $state.go('auditions.edit', {auditionId: vm.campaign.auditionId});
                    },250);
                }
            }

            function editTheAudition (error, success) {

                if (success === true) {
                    let campaignAudition = Auditions.findOne({_id: vm.campaign.auditionId});

                    /** New Audition; */
                    if (!campaignAudition) {
                        vm.audition.campaignId = vm.campaign._id;
                        vm.audition.friendlyId = 'AUD' + dbhService.getNextSequenceValue('audition'),
                        vm.campaign.auditionId = Auditions.insert(vm.audition);
                        vm.$scope.$parent.vm.silentCampaignSave(null, openTheEditAudition);
                    }
                    else {
                        openTheEditAudition(null, true);
                    }


                }
            }
            vm.$scope.$parent.vm.silentCampaignSave(null, editTheAudition);
        };

        /**
         * @desc Save the chosen audition name together with it's ID
         * @param num
         */
        // vm.saveAuditionName = function(num){

        //     if (vm.campaign.skills[num].auditionId){
        //         vm.campaign.skills[num].auditionName = utilsService.getAuditionName(vm.campaign.skills[num].auditionId).name;
        //     }
        // };

        /**
         * @desc Save the chosen audition name together with it's ID
         *
         */
        // vm.getAuditionId = function(){

        //     let audition = utilsService.getAuditionById(vm.editSkill.auditionName);

        //     vm.editSkill.auditionId = null;

        //     if (audition) {
        //         vm.editSkill.auditionId = audition._id;
        //         vm.editSkill.auditionName = audition.name;
        //     }
        // };

        /**
         * @desc Calculate campaign end date based in duration;
         * @param campaign
         */
        vm.calculateEndDate = function (campaign){

            if (campaign.duration > 0){

                if (campaign.startDate) {

                    var result  = campaign.startDate;
                    var endDate = moment(result).add(campaign.duration, 'd');

                    campaign.endDate = new Date(endDate);
                }
            }
        };

        /**
         * @desc When updating end date, clear the duration;
         * @param campaign
         */
        vm.clearDuration = function (campaign){
            campaign.duration = 0;
            //todo: the check should be else where
            if (campaign.status === ENUM.CAMPAIGN_STATUS.DISPATCHED){
                if (campaign.endDate < vm.now){
                    //todo: change to Modal
                    alert('Campaign can not end before today');
                }
            }
        };

        vm.topApplicantRange = function() {

            if (vm.campaign.topApplicant === undefined) {
                vm.campaign.topApplicant = parseInt(document.getElementById('topApplicant').value);
            }

            if (isNaN(vm.campaign.topApplicant)) {
                vm.campaign.topApplicant = 1;
            }

            if (vm.campaign.topApplicant < 1) {
                vm.campaign.topApplicant = 1;
                showInfoMessage('Top Applicant can not be less then 1, value was set to 1', function () {});
            }
            if (vm.campaign.topApplicant > 10) {
                vm.campaign.topApplicant = 10;
                showInfoMessage('Top Applicant can not be more then 10, value was set to 10', function () {});
            }
        };

        vm.minScoreRange = function() {


            if (vm.campaign.minScore === undefined) {
                vm.campaign.minScore = parseInt(document.getElementById('minScore').value);
            }
            if (isNaN(vm.campaign.minScore)) {
                vm.campaign.minScore = 40;
            }

            if (vm.campaign.minScore < 40) {
                vm.campaign.minScore = 40;
                showInfoMessage('Minimum Score can not be less then 40, value was set to 40', function () {});
            }
            if (vm.campaign.minScore > 100) {
                vm.campaign.minScore = 100;
                showInfoMessage('Minimum Score can not be more then 100, value was set to 100', function () {});
            }

            // @desc In case minimum score is less the 80, add a warning message;
            if (vm.campaign.minScore < 80) {

                showInfoMessage('Notice, you defined minimum score less then 80', function () {});
            }


        };

        /**
         * @desc When update duration, clear end date
         * @param campaign
         */
        vm.clearEndDate = function (campaign) {

            campaign.endDate = 0;
        };

        /**
         * @desc In case minimum score is less the 80, add a warning message;
         * @param score
         */
        vm.scoreWarning = function (score){

            if (score < 80) {
                alert ('Notice, you defined minimum score less then 80');
            }
        };


        /**
         * @desc Clear a campaign date;
         */
        vm.emptyDate = function (){
            vm.campaign.startDate = 0;
        };

        vm.isSelectedCountry = function (countryNameArg) {
            return (!!vm.campaign.location && (vm.campaign.location === countryNameArg));
        };

        /** Skills management area */


        /**
         * @desc Add a new empty skill.
         */
        vm.addSkill = function () {

            if (vm.audition.status === ENUM.AUDITION_STATUS.AVAILABLE) {
                showErrorMessage('Skill cannot be added as the audition has already been approved. Please change its state to "In-Work" in order to proceed');
                return;
            };

            // if the add skill button was clicked with no skill exist at all then do nothing
            if (vm.campaign.skills[0].type === '') {
                return
            };

            vm.editSkill = {
                type: '',
                experience: '',
                importance: ''
                // auditionId: '',
                // auditionName: ''
            };
            if (vm.campaign.skills instanceof Array) {
                vm.campaign.skills.push(vm.editSkill);
            }
            else {
                vm.campaign.skills = [vm.editSkill];
            }
            vm.dependency.changed();
        };

        /**
         * @desc remove a skill from campaign
         * @param {Object} skillArg
         *
        */

        function deleteItemsPerSkill (skillArg) {
            for (let i = 0; i < vm.audition.items.length; i++) {
                let item = Items.findOne({_id:vm.audition.items[i].itemId});
                if (item.skill === skillArg.type) {
                    vm.audition.items.splice(i,1);
                    i--;
                };
            };
        };


        function deleteSkill (skillArg){
            let index = vm.campaign.skills.indexOf(skillArg);

            if (index > -1) {

                if (vm.editSkill === skillArg) {
                    vm.editSkill = {
                        type: '',
                        experience: '',
                        importance: ''
                    };
                }
                vm.campaign.skills.splice(index, 1);

                if (vm.campaign.skills.length === 0) {
                    vm.campaign.skills[0] = {
                        type: '',
                        experience: '',
                        importance: ''};
                };

                if (index > vm.campaign.skills.length - 1) {
                    index = vm.campaign.skills.length - 1;
                }

                /**
                * No skills, so create an empty one;
                */
                if (index < 0) {
                    vm.addSkill();
                }
                else {
                    vm.editSkill = vm.campaign.skills[index];
                }
            }
        };


        vm.removeSkill = function(skillArg) {

            let foundItemForSkill = false;
            // scan all audition's items until one is found for the skill
            for (let i=0; (i<vm.audition.items.length) && !foundItemForSkill; i++) {
                let item = Items.findOne({_id:vm.audition.items[i].itemId});
                if (!item) {
                    alert(`Cannot get item id: ${vm.audition.items[i].itemId}`);
                    return;
                };
                if (item.skill === skillArg.type) {
                    // item has been found for the skill
                    foundItemForSkill = true;
                    if (vm.audition.status === ENUM.AUDITION_STATUS.AVAILABLE) {
                        showErrorMessage('The skill cannot be removed as the audition has already been approved. Please change its state to "In-Work" in order to proceed');
                        return;
                    } else {
                        if (vm.audition.status === ENUM.AUDITION_STATUS.IN_WORK) {
                            showErrorMessage('The skill cannot be removed as related challenges have already been defined. Please remove these challenges in order to proceed');
                            return;
                            // *** Zvika - TBD/ Need to invoke the "auditionEdit.saveEditItem" function from the "auditionEditCtrl"
                            // let msgArg = "Challenges already defined for this skill and should be removed from the audition. Please confirm";
                            // $UserAlerts.prompt(
                            //     msgArg,
                            //     ENUM.ALERT.INFO,
                            //     false,
                            //     function(){
                            //         deleteItemsPerSkill (skillArg);
                            //         deleteSkill (skillArg);
                            //     },
                            //     function(){
                            //     }
                            // );
                        };
                    };
                };
            };
            // if no item has been found for the skill, the skill can be removed
            if (!foundItemForSkill) {
                deleteSkill (skillArg);
            };
        };


        vm.modifySkill = function(skillArg) {
            let foundItemForSkill = false;
            // scan all audition's items until one is found for the skill
            for (let i=0; (i<vm.audition.items.length) && !foundItemForSkill; i++) {
                let item = Items.findOne({_id:vm.audition.items[i].itemId});
                if (!item) {
                    alert(`Cannot get item id: ${vm.audition.items[i].itemId}`);
                    return;
                };
                if (item.skill === skillArg.type) {
                    // item has been found for the skill
                    foundItemForSkill = true;
                    if (vm.audition.status === ENUM.AUDITION_STATUS.AVAILABLE) {
                        showErrorMessage('The skill cannot be modified as the audition has already been approved. Please change its state to "In-Work" in order to proceed');
                        return;
                    } else {
                        if (vm.audition.status === ENUM.AUDITION_STATUS.IN_WORK) {
                            showErrorMessage('The skill cannot be modified as related challenges have already been defined. Please remove these challenges in order to proceed');
                            return;
                            // *** Zvika - TBD/ Need to invoke the "auditionEdit.saveEditItem" function from the "auditionEditCtrl"
                            // let msgArg = "Challenges already defined for this skill and should be removed from the audition. Please confirm";
                            // $UserAlerts.prompt(
                            //     msgArg,
                            //     ENUM.ALERT.INFO,
                            //     false,
                            //     function(){
                            //         deleteItemsPerSkill (skillArg);
                            //         deleteSkill (skillArg);
                            //     },
                            //     function(){
                            //     }
                            // );
                        };
                    };
                };
            };
        };


        /**
         * @desc Add a new frm/t salary expectations.
         */
        vm.addFromToSalaryExp = function () {

            vm.editSalary = {
                from: 0,
                to: 0
            };
            if (vm.campaign.salaryExpactations instanceof Array) {
                vm.campaign.salaryExpactations.push(vm.editSalary);
            }
            else {
                vm.campaign.salaryExpactations = [vm.editSalary];
            }
            vm.dependency.changed();
        };

        /**
         * @desc remove a from/to salary exectation from campaign
         * @param {Object} salaryArg
         *
         */
        vm.removeFromToSalaryExp = function(salaryArg) {

            let index = vm.campaign.salaryExpactations.indexOf(salaryArg);

            if (index > -1) {

                if (vm.editSalary === salaryArg) {
                    vm.editSalary = {
                        from: 0,
                        to: 0
                    };
                }
                vm.campaign.salaryExpactations.splice(index, 1);

                if (index > vm.campaign.salaryExpactations.length - 1) {
                    index = vm.campaign.salaryExpactations.length - 1;
                }

                /**
                 * No skills, so create an empty one;
                 */
                if (index < 0) {
                    vm.addFromToSalaryExp();
                }
                else {
                    vm.editSalary = vm.campaign.addFromToSalaryExp[index];
                }
            }
        }

    }).filter('filterAuditions', function() {
    return function(auditionsArg, filterByArg) {

        let auditions = [];

        if (!filterByArg) {
            return auditionsArg;
        }
        $.each(auditionsArg, function() {

            var wordsString = '^(?=.*' + filterByArg.toLowerCase().split(" ").join(')(?=.*') + ')';
            var testString  = (this.name).toLowerCase();
            if  (new RegExp(wordsString).test(testString)) {
                auditions.push(this);
            }
        });
        return auditions;
    }
});


/**
 * File Upload Controller
 */
angular
    .module('skillera')
    .service('fileUpload', ['$http', function ($http) {
        //noinspection JSUnusedGlobalSymbols
        this.uploadFileToUrl = function(file, uploadUrl){
            var fd = new FormData();
            fd.append('file', file);
            $http.post(uploadUrl, fd, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            })
                .success(function(){
                })
                .error(function(){
                });
        }
    }]);
