
angular
    .module('skillera')
    .controller('AuditionsMainCtrl', function($state,$scope,$reactive,dbhService, $UserAlerts, ENUM, MAP) {

        var vm = this;
        $reactive(vm).attach($scope);

        vm.animationsEnabled = true;
        vm.isViewThumbnails  = true;
        vm.recruiterSubscriptionOk = false;
        vm.selectedStatus    = undefined;
        vm.orderBy           = 'title';
        vm.ENUM = ENUM;
        vm.MAP = MAP;

        vm.dependency = new Deps.Dependency();

        /** get user previous selections */
        if (localStorage.getItem('isViewThumbnails')) vm.isViewThumbnails = localStorage.getItem('isViewThumbnails') === 'true';
        if (localStorage.getItem('selectedStatus') !== 'undefined') vm.selectedStatus = localStorage.getItem('selectedStatus');
        if (localStorage.getItem('orderBy')) vm.orderBy = localStorage.getItem('orderBy');
        /* set user/default selections */
        localStorage.setItem('isViewThumbnails', vm.isViewThumbnails);
        localStorage.setItem('selectedStatus', vm.selectedStatus);
        localStorage.setItem('orderBy', vm.orderBy);

        /**
         * ReactiveContext;
         */
        vm.helpers({
            /**
             * @desc Retrieve users campaigns by status;
             * @returns {*}
             */
            auditions () {
                vm.dependency.depend();

                return Auditions.find({});
            },
            // campaigns () {
            //     vm.dependency.depend();
            //
            //     let campaigns;
            //
            //     if (vm.selectedStatus) {
            //         campaigns = Campaigns.find(
            //             {$and: [
            //                 {type: ENUM.CAMPAIGN_TYPE.RECRUITMENT},
            //                 {status: vm.ENUM.CAMPAIGN_STATUS[vm.selectedStatus]}
            //             ]}
            //         );
            //     }
            //     else {
            //         campaigns = Campaigns.find(
            //             {$and: [
            //                 {type: ENUM.CAMPAIGN_TYPE.RECRUITMENT},
            //                 {status: {$ne: ENUM.CAMPAIGN_STATUS.DELETE}}
            //             ]}
            //         );
            //     }
            //     return campaigns;
            // },
            /**
             * @desc retrieve Meteor.user;
             * @returns {Meteor.user}
             */
            currentUser() {
                return Meteor.user();
            }
        });

        /**
         * @desc Check if the user is a recruiter;
         * @returns {boolean}
         */
        vm.isRecruiter = function () {

            if (Meteor.user() && Meteor.user().profile && Meteor.user().profile.type === 'Recruiter') {

                if (!vm.recruiterSubscriptionOk) {
                    vm.subscribe('allAuditions', () => [Meteor.user().profile.companyName], {
                        onReady: function () {
                            vm.recruiterSubscriptionOk = true;
                            vm.dependency.changed();
                        },
                        onError: function () {
                            console.log("onError", arguments);
                        }
                    });
                }
                return true;
            }
            else {
                return false;
            }
        };

        /**
         * User nav-bar selections & search:
         */

        /**
         * @desc Change the selected status and announce change;
         * @param statusArg
         */
        vm.changeSelectedStatus = function (statusArg) {
            vm.selectedStatus = statusArg;
            localStorage.setItem('selectedStatus', vm.selectedStatus);
            vm.dependency.changed();
        };

        /**
         * @desc Set Thumbnails view;
         */
        vm.setViewThumbnails = function () {
            vm.isViewThumbnails = true;
            localStorage.setItem('isViewThumbnails', vm.isViewThumbnails);
        };

        /**
         * @desc Set View list view;
         */
        vm.setViewList = function () {
            vm.isViewThumbnails = false;
            localStorage.setItem('isViewThumbnails', vm.isViewThumbnails);
        };

        /**
         * @desc search (filter) campaigns;
         * @param campaignArg
         * @returns {boolean}
         */
        vm.search = function(campaignArg){
            if (!vm.query) {
                return true;
            }
            else {
                var wordsString = '^(?=.*' + vm.query.toLowerCase().split(" ").join(')(?=.*') + ')';
                var testString  = (campaignArg.num + ' ' + campaignArg.title + ' ' + campaignArg.positionName + ' ' + campaignArg.status).toLowerCase();
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
         * User nav-bar selections:
         */

        /**
         * @desc delete the campaign by changing its status;
         * @param campaignArg
         */
        vm.deleteCampaign = function (campaignArg){

            $UserAlerts.prompt(
                'Are you sure?',
                ENUM.ALERT.INFO,
                true,
                function () {
                    let campaign = angular.copy(campaignArg);
                    let tempId   = campaign._id;

                    campaign.status     = ENUM.CAMPAIGN_STATUS.DELETE;
                    campaign.skills     = angular.copy(campaign.skills);
                    campaign.emailList  = angular.copy(campaign.emailList);

                    delete campaign._id;
                    Campaigns.update({_id: tempId},{$set: campaign});

                    dbhService.insertActivityLog('Campaign', tempId, ENUM.CAMPAIGN_STATUS.DELETE, 'Campaign [' + campaign.num + '] Deleted');
                });
        };

        /**
         * @desc undelete the campaign by changing its status;
         * @param campaignArg
         */
        vm.undeleteCampaign = function (campaignArg) {
            $UserAlerts.prompt(
                'Are you sure?',
                ENUM.ALERT.INFO,
                true,
                function () {
                    let campaign = angular.copy(campaignArg);
                    let tempId   = campaign._id;

                    campaign.status     = ENUM.CAMPAIGN_STATUS.IN_WORK;
                    campaign.skills     = angular.copy(campaign.skills);
                    campaign.emailList  = angular.copy(campaign.emailList);

                    delete campaign._id;
                    Campaigns.update({_id: tempId},{$set: campaign});

                    dbhService.insertActivityLog('Campaign', tempId, ENUM.CAMPAIGN_STATUS.DELETE, 'Campaign [' + campaign.num + '] Deleted');
                });
        };

        /**
         * @desc test the campaign;
         * @param campaignArg
         */
        vm.applyCampaign = function(campaignArg){
            $state.go("campaignApply",{id:campaignArg._id});
        };
    });
