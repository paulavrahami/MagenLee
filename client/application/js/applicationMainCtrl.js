
angular
    .module('skillera')
    .controller('applicationMain', function($state,$stateParams,$window, $scope,$reactive,dbhService, $UserAlerts, ENUM, MAP, moment, $uibModal) {

        let vm = this;
        // $reactive(vm).attach($scope);
        let reactiveContext = $reactive(vm).attach($scope);

        vm.animationsEnabled = true;
        vm.isViewThumbnails  = true;
        vm.selectedFilter    = 'MIN_SCORE';
        vm.orderBy           = 'grade';
        vm.ENUM = ENUM;
        vm.MAP = MAP;
        vm.campaignId = $stateParams.id;
        vm.oneAtATime = true;

        vm.dependency = new Deps.Dependency();


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

        function doSubscription () {

            if (Meteor.user() && Meteor.user().profile) {
                reactiveContext.subscribe('campaignsRecruiter', () => [Meteor.user().profile.companyName]);
                reactiveContext.subscribe('applicationsCampaign', () => [vm.campaignId]);
                reactiveContext.subscribe('items');
                reactiveContext.subscribe('cv.files');
            }
        }

        /**
         * ReactiveContext;
         */
        vm.helpers({
            campaign: function () {
                doSubscription ();
                return Campaigns.findOne({_id: vm.campaignId});
            },
            applications () {
                vm.dependency.depend();

                return vm.applications;
            }

        });


        /** get user previous selections */

        if (localStorage.getItem('selectedFilter') !== 'undefined') vm.selectedFilter = localStorage.getItem('selectedFilter');

        if (!_.isNull(vm.selectedFilter) && vm.selectedFilter !== 'null') {
            localStorage.setItem('selectedFilter', vm.selectedFilter);
        }
        else {
            vm.selectedFilter = undefined;
        }

        if (!vm.selectedFilter) {
            localStorage.removeItem('selectedFilter');
        }

        vm.getCVLink = function(fileId) {
            let cvFile = CVFiles.findOne(fileId);

            return cvFile ? cvFile : {url(){},original:{name:""}};
        };

        /**
         * @desc Check if the user is a recruiter;
         * @returns {boolean}
         */
        vm.isRecruiter = function () {
            // Calculate number of applicants passing minimum score
            vm.applicantPassMinScore = 0;
            vm.campaign = Campaigns.findOne({_id: vm.campaignId});
            if (vm.campaign.applications.length) {
                for  (let z = 0 ; z < vm.campaign.applications.length ; z++) {
                    if (vm.applications[z].grade >= vm.campaign.minScore){
                        vm.applicantPassMinScore ++;
                    }
                }
            }

            if (Meteor.user() && Meteor.user().profile && Meteor.user().profile.type === 'Recruiter') {
                vm.subscribe('campaignsRecruiter',() => [Meteor.user().profile.companyName]);
                if (Meteor.user().profile.accessMode) {
                  vm.accessMode = Meteor.user().profile.accessMode
                } else {
                  vm.accessMode = 'Admin';
                }
                return true;
            }
            else {
                return false;
            }
        };

        /**
         * @desc Change the selected filter  and announce change;
         * @param statusArg
         */
        vm.changeSelectedFilter = function (statusArg) {
            if (statusArg) {
                vm.selectedFilter = statusArg;
                localStorage.setItem('selectedFilter', vm.selectedFilter);
            }
            else {
                vm.selectedFilter = undefined;
                localStorage.removeItem('selectedFilter');
            }
            (new Promise((resolve, reject) => {
                let applications;
                let conditions = {};

                if (vm.selectedFilter) {

                    switch (vm.selectedFilter) {
                        case 'MIN_SCORE' :
                            conditions = {$and: [
                                {grade: {$gte: vm.campaign.minScore}},
                                {campaignId: vm.campaignId},
                                {"fraudType": ENUM.APPLICATION_FRUAD_TYPE.NONE},
                                {"control.status": ENUM.APPLICATION_STATUS.COMPLETED}
                            ]};
                            break;
                        case 'MIN_SCORE_10' :
                            conditions = {$and: [
                                {grade: {$gte: vm.campaign.minScore - 10}},
                                {campaignId: vm.campaignId},
                                {"fraudType": ENUM.APPLICATION_FRUAD_TYPE.NONE},
                                {"control.status": ENUM.APPLICATION_STATUS.COMPLETED}
                            ]};
                            break;
                        case 'MIN_SCORE_20' :
                            conditions = {$and: [
                                {grade: {$gte: vm.campaign.minScore - 20}},
                                {campaignId: vm.campaignId},
                                {"fraudType": ENUM.APPLICATION_FRUAD_TYPE.NONE},
                                {"control.status": ENUM.APPLICATION_STATUS.COMPLETED}
                            ]};
                            break;
                        default:
                            break;
                    }
                }
                else {
                    conditions = {campaignId: vm.campaignId,"fraudType": ENUM.APPLICATION_FRUAD_TYPE.NONE,"control.status": ENUM.APPLICATION_STATUS.COMPLETED}
                }


                Meteor.call('applications.getApplications', conditions, (err, res) => {
                    if (err) {
                        reject();
                    } else {
                        resolve(res);
                    }
                });
            })).then(function(results){
                vm.applications = results;
                vm.dependency.changed();
            }).catch(function() {
                vm.applications = [];
            });
        };


        /**
         * @desc search (filter) campaigns;
         * @param applicationsArg
         * @returns {boolean}
         */
        vm.search = function(applicationsArg){
            if (!vm.query) {
                return true;
            }
            else {
                let wordsString = '^(?=.*' + vm.query.toLowerCase().split(" ").join(')(?=.*') + ')';
                let testString  = (applicationsArg.number + ' ' + applicationsArg.grade + ' ' + applicationsArg.firstName + ' ' + applicationsArg.lastName).toLowerCase();
                return (new RegExp(wordsString).test(testString));
            }
        };

        /**
         * Sorting list
         */

        /**
         * @desc sort the list ASC/DESC according to selection;
         * @param sortArg
         */
        vm.setSort = function (sortArg) {

            if (vm.orderBy === sortArg) {
                vm.orderBy = '-' + sortArg;
            }
            else if (vm.orderBy === '-' + sortArg) {
                vm.orderBy = sortArg;
            }
            else {
                vm.orderBy = sortArg;
            }
            localStorage.setItem('orderBy', vm.orderBy);
        };
        /**
         * @desc return the sort bootstrap class for sorting;
         * @param sortArg
         */
        vm.getSort = function (sortArg) {

            let returnClass = 'sortingButton ';

            if (vm.orderBy === '-' + sortArg || vm.orderBy === sortArg) {
                returnClass += 'selected ';
            }

            if (vm.orderBy === '-' + sortArg) {
                returnClass += 'glyphicon glyphicon-arrow-up';
            }
            else {
                returnClass += 'glyphicon glyphicon-arrow-down';
            }
            return returnClass;
        };

        /**
         * @desc Reveal an applicant
         * @param applicationRec record
         */

        vm.revealedApplicants = function (applicationRec) {

            vm.reveal = function (applicationRec) {
                if ((!vm.campaign.revealedApplicants) || (vm.campaign.topApplicant > vm.campaign.revealedApplicants)) {
                    applicationRec.revealed = true;
                    vm.applicationId = applicationRec._id;
                    // Delete the temp statistics summary table (see vm.calcAuditionResults function) before
                    // the application is updated into the database
                    delete applicationRec.auditionResults;
                    let copyApplication = angular.copy(applicationRec);
                    
                    delete copyApplication._id;
                    //noinspection JSUnusedLocalSymbols
                    Applications.update({_id: vm.applicationId}, {$set: copyApplication}, function (errorArg, tempIdArg) {
                        if (errorArg) {
                            showErrorMessage(errorArg.message);
                        }
                        else {
                            if (!vm.campaign.revealedApplicants){
                                vm.campaign.revealedApplicants = 1;
                            } else {
                                vm.campaign.revealedApplicants++;
                            }
                            let copyCampaign = angular.copy(vm.campaign);
                            let tempCampId   = copyCampaign._id;

                            delete copyCampaign._id;
                            //noinspection JSUnusedLocalSymbols
                            Campaigns.update({_id: tempCampId},{$set: copyCampaign}, function (errorArg, tempIdArg) {
                                if (errorArg) {
                                    showErrorMessage(errorArg.message);
                                }
                            });
                        }})

                } else {
                    //Nice message - you can not revel more
                    showInfoMessage('All Top Applicants were revealed');
                }
            };

            //Provide a informational message if the related applicant score is less then the minimum score
            if (applicationRec.grade < vm.campaign.minScore){

                let msgArg = "This application has no minimum grade! Please confirm";

                $UserAlerts.prompt(
                    msgArg,
                    ENUM.ALERT.INFO,
                    false,
                    function(){
                        vm.reveal(applicationRec)
                    },
                    function(){
                    }
                );
            } else {
                vm.reveal(applicationRec);
            }
        };


        vm.viewAuditionResults = function(applicationArg) {
            // Invoke the application process in a 'preview' mode to provide the recruiter with the ability
            // to view the actual audition conducted by the Talent

            vm.application = {};
            vm.application = applicationArg;
            vm.howItWorkLang = 'eng';
            vm.application.sessions = [];
            vm.application.sessions.push({
                date: (new Date()),
                states: vm.application.states ? vm.application.states : {}
            });
            vm.application.states.currentItem = 1;
           
            vm.auditionViewMode = ENUM.AUDITION_VIEW_MODE.RESULTS;
            $scope.auditionViewMode = vm.auditionViewMode;

            vm.modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'client/audition/view/auditionExecute.html',
                controller: 'AuditionExecuteCtrl',
                controllerAs: 'vm',
                keyboard: false,
                backdrop: 'static',
                scope: $scope,
                resolve: {
                    auditionId: function () {
                        return vm.campaign.auditionId;
                    },
                    applicationCtrl: function () {
                        return vm;
                    }
                },
                size: 'executeAudition'
            });
        };


        //Round grades for presentation
        vm.round = function(grade) {
            if (grade){
                return Math.round(grade);
            } else {
                return grade;
            }
        };

        vm.calcAuditionResults = function(application) {
            // initialize the statistics summary table
            application.auditionResults = [];
            vm.campaign.skills.every(function (skill) {
                application.auditionResults.push({
                    skill: skill.type,
                    importance: skill.importance,
                    maxScore: 0,
                    score: 0,
                    avgScore: 0, /*for all campaign's applications*/
                    totalItems: 0,
                    totalItemsAnswered: 0,
                    avgApplicationsItemsAnswered: 0 /*for all campaign's applications*/
                    })
                return true;
            });

            // Update the summary table with the max score per skill and the total items defined per skill
            // Zvika - TBD; its better to calculate this from the audition.items array
            let itemsArray = Object.keys(application.states.itemsContent);
            itemsArray.every(function (itemKey) {
                let itemRec = Items.findOne({_id: itemKey});
                // Locate the respective item's skill entry in the summary table
                index = application.auditionResults.findIndex(findResultsPerSkill => findResultsPerSkill.skill == itemRec.skill);
                if (index > -1) {
                    application.auditionResults[index].maxScore += application.states.itemsContent[itemKey].state.maxScore;
                    application.auditionResults[index].totalItems ++;
                } else {
                    // Zvika - TBD; this is "not possible"
                }
                return true;
            });


            // for all campaign's applications:
            vm.campaign.applications.every(function (applicationKey) {
                // get an application
                let applicationRec = Applications.findOne({_id: applicationKey})
                // get the application's audition items
                let itemsArray = Object.keys(applicationRec.states.itemsContent);
                // for each application's audition item:
                itemsArray.every(function (itemKey) {
                    // get an item
                    let itemRec = Items.findOne({_id: itemKey})
                    // update the item's skill respective summary table record
                    index = application.auditionResults.findIndex(findResultsPerSkill => findResultsPerSkill.skill == itemRec.skill);
                    if (index > -1) {
                        applicationRec.states.itemsContent[itemKey].state.clicks > 0 ? application.auditionResults[index].avgApplicationsItemsAnswered ++ : "",
                        application.auditionResults[index].avgScore += applicationRec.states.itemsContent[itemKey].state.score;
                        // get the statistics for the CURRENT application
                        if (applicationKey === application._id) {
                            applicationRec.states.itemsContent[itemKey].state.clicks > 0 ? application.auditionResults[index].totalItemsAnswered ++ : "",
                            application.auditionResults[index].score += applicationRec.states.itemsContent[itemKey].state.score;
                        };
                    } else {
                        // Zvika - TBD; this is "not possible"
                    };
                    return true
                });
                return true
            });
            // Calculate the average per all campaign's applications
            application.auditionResults.forEach(function (resultsPerSkill) {
                resultsPerSkill.avgScore = (resultsPerSkill.avgScore / vm.campaign.applications.length);
                resultsPerSkill.avgApplicationsItemsAnswered = (resultsPerSkill.avgApplicationsItemsAnswered / vm.campaign.applications.length);
            });
        };

        vm.changeSelectedFilter(vm.selectedFilter);

    });