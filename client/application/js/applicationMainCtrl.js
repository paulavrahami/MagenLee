
angular
    .module('brgo')
    .controller('applicationMain', function($state,$stateParams,$window, $scope,$reactive,dbhService, $UserAlerts, ENUM, MAP) {

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

            if (vm.campaign.applications.length) {
                for  (let z = 0 ; z < vm.campaign.applications.length;z++) {
                    if (vm.applications[z].grade >= vm.campaign.minScore){
                        vm.applicantPassMinScore ++;
                    }
                }
            }

            console.log(vm.applicantPassMinScore);


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
                                {"control.status": ENUM.APPLICATION_STATUS.COMPLETED}
                            ]};
                            break;
                        case 'MIN_SCORE_10' :
                            conditions = {$and: [
                                {grade: {$gte: vm.campaign.minScore - 10}},
                                {campaignId: vm.campaignId},
                                {"control.status": ENUM.APPLICATION_STATUS.COMPLETED}
                            ]};
                            break;
                        case 'MIN_SCORE_20' :
                            conditions = {$and: [
                                {grade: {$gte: vm.campaign.minScore - 20}},
                                {campaignId: vm.campaignId},
                                {"control.status": ENUM.APPLICATION_STATUS.COMPLETED}
                            ]};
                            break;
                        default:
                            break;
                    }
                }
                else {
                    conditions = {campaignId: vm.campaignId,"control.status": ENUM.APPLICATION_STATUS.COMPLETED}
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

            //Provide a informational message if the realed applicant score is less then the minimum score
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

        //Round grades for presentation
        vm.round = function(grade) {
            if (grade){
                return Math.round(grade);
            } else {
                return grade;
            }
        };

        vm.calcGrade = function(application) {
            if (!('gradePerSkill' in application)) {
                //Build the table of empty grades per skill based on skills in campaign
                vm.gradePerSkill = [];
                if (vm.campaign.skills.length > 0) {
                    for(let z = 0; z < vm.campaign.skills.length; z++) {
                        vm.gradePerSkill[z] = {
                            skill: vm.campaign.skills[z].type,
                            grade: 0,
                            count: 0,
                            importance: vm.campaign.skills[z].importance
                        }
                    }
                }


                let itemArray = Object.keys(application.states.itemsContent);
                // vm.gradePerSkill = [];

                for (let x = 0; x < itemArray.length; x++) {

                    //Bring the relevant itemArray

                    let itemRec = Items.findOne({_id: itemArray[x]});

                    if (vm.gradePerSkill.length === 0) {
                        vm.gradePerSkill[0] = {
                            skill: itemRec.skill.type,
                            grade: application.states.itemsContent[itemArray[x]].state.validity,
                            importance: itemRec.skill.importance,
                            count: 1
                        }
                    } else {
                        let skillIndex = -1;
                        for (let i = 0; i < vm.gradePerSkill.length; i++) {
                            if (vm.gradePerSkill[i].skill === itemRec.skill.type) {
                                skillIndex = i;
                            }
                        }

                        if (skillIndex > -1) {
                            vm.gradePerSkill[skillIndex].grade += application.states.itemsContent[itemArray[x]].state.validity;
                            vm.gradePerSkill[skillIndex].count++;
                        } else {
                            vm.gradePerSkill.push({
                                skill: itemRec.skill.type,
                                grade: application.states.itemsContent[itemArray[x]].state.validity,
                                importance: itemRec.skill.importance,
                                count: 1
                            })
                        }
                    }
                }
                //For skills with no challenge answered, make sure to total grade will be zero
                if (vm.gradePerSkill.length > 0) {
                    for (let zz = 0; zz < vm.campaign.skills.length; zz++) {
                        if (vm.gradePerSkill[zz].grade === 0) {
                            vm.gradePerSkill[zz].count = 1;
                        }
                    }
                }

                // $.extend(application,vm.gradePerSkill)
                application.gradePerSkill = vm.gradePerSkill
            }

        };
        vm.changeSelectedFilter(vm.selectedFilter);
    });
