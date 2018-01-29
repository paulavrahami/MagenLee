
angular
    .module('brgo')
    .controller('CampaignMain', function($state,$scope,$reactive,dbhService, $UserAlerts, ENUM, MAP) {

        let vm = this;
        $reactive(vm).attach($scope);

        vm.animationsEnabled = true;
        vm.isViewThumbnails  = true;
        vm.selectedStatus    = undefined;
        vm.orderBy           = 'positionName';
        vm.ENUM = ENUM;
        vm.MAP = MAP;

        if (Meteor.user() && Meteor.user().profile && Meteor.user().profile.type === 'SystemAdmin'){
          vm.isViewThumbnails  = false
        }

        vm.dependency = new Deps.Dependency();

        /** get user previous selections */
        if (localStorage.getItem('isViewThumbnails')) vm.isViewThumbnails = localStorage.getItem('isViewThumbnails') === 'true';
        if (localStorage.getItem('selectedStatus') !== 'undefined') vm.selectedStatus = localStorage.getItem('selectedStatus');
        if (localStorage.getItem('orderBy')) vm.orderBy = localStorage.getItem('orderBy');
        /* set user/default selections */
        localStorage.setItem('isViewThumbnails', vm.isViewThumbnails);
        if (!_.isNull(vm.selectedStatus) && vm.selectedStatus !== 'null') {
            localStorage.setItem('selectedStatus', vm.selectedStatus);
        }
        else {
            vm.selectedStatus = undefined;
        }
        localStorage.setItem('orderBy', vm.orderBy);

        if (!vm.selectedStatus) {
            localStorage.removeItem('selectedStatus');
        }

        /**
         * ReactiveContext;
         */
        vm.helpers({
            /**
             * @desc Retrieve users campaigns by status;
             * @returns {*}
             */
            campaigns () {
                vm.dependency.depend();

                return vm.campaigns;
            },
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

        vm.isSystemAdmin = function () {
            if (Meteor.user() && Meteor.user().profile && Meteor.user().profile.type === 'SystemAdmin') {
                vm.subscribe('allCampaigns',() => [Meteor.user().profile.companyName]);

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
            if (statusArg) {
                vm.selectedStatus = statusArg;
                localStorage.setItem('selectedStatus', vm.selectedStatus);
            }
            else {
                vm.selectedStatus = undefined;
                localStorage.removeItem('selectedStatus');
            }
            (new Promise((resolve, reject) => {
                let campaigns;
                let conditions = {};

                if (vm.selectedStatus) {
                    conditions = {$and: [
                        {type: ENUM.CAMPAIGN_TYPE.RECRUITMENT},
                        {status: vm.ENUM.CAMPAIGN_STATUS[vm.selectedStatus]}
                    ]}
                }
                else {
                    conditions = {$and: [
                        {type: ENUM.CAMPAIGN_TYPE.RECRUITMENT},
                        {status: {$ne: ENUM.CAMPAIGN_STATUS.DELETE}}
                    ]}
                }
                Meteor.call('campaigns.getCampaignsSummery', conditions, (err, res) => {
                    if (err) {
                        reject();
                    } else {
                        resolve(res);
                    }
                });
            })).then(function(results){
                vm.campaigns = results;
                vm.dependency.changed();
            }).catch(function(error) {
                vm.campaigns = [];
            });
        };

        /**
         * @desc Set Thumbnails view;
         */
        vm.setViewThumbnails = function () {
            vm.isViewThumbnails = true;
            localStorage.setItem('isViewThumbnails', vm.isViewThumbnails);
        };

        /**
         * @Set database status of Dispatch to On Air;
         */
        vm.statusFilter = function (statusArg) {
            if (statusArg === 'Dispatched'){
              return 'On Air'
            } else {
              return statusArg
            };
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
                let wordsString = '^(?=.*' + vm.query.toLowerCase().split(" ").join(')(?=.*') + ')';
                let testString  = (campaignArg.num + ' ' + campaignArg.title + ' ' + campaignArg.positionName + ' ' + campaignArg.status).toLowerCase();
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

                    vm.changeSelectedStatus(vm.selectedStatus);
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
                    vm.changeSelectedStatus(vm.selectedStatus);
                });
        };

        /**
         * @desc test the campaign;
         * @param campaignArg
         */
        vm.applyCampaign = function(campaignArg){
            $state.go("campaignApply",{id:campaignArg._id});
        };

        /**
         * By vm.changeSelectedStatus() we bring the campaigns
         */
        vm.changeSelectedStatus(vm.selectedStatus);
    });
