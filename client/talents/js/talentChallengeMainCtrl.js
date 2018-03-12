angular
    .module('skillera')
    .controller('ChallengeMainCtrl', function($state,$scope,$reactive,dbhService, $UserAlerts, ENUM, MAP) {

        let vm = this;
        let reactiveContext = $reactive(vm).attach($scope);

        vm.animationsEnabled = true;
        vm.isViewThumbnails  = true;
        vm.selectedStatus    = undefined;
        vm.orderBy           = 'positionName';
        vm.ENUM = ENUM;
        vm.MAP = MAP;


        vm.dependency = new Deps.Dependency();

        vm.talentChallenges = [];
        vm.talentChallenge = {
            skill: '',
            challenges:[]
        };


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

        function doSubscription () {
            
                        if (Meteor.user() && Meteor.user().profile) {
                            reactiveContext.subscribe('itemsByAuthorId', () => [Meteor.user()._id]);
                        }

                    }

        vm.helpers({
            /**
             * @desc Retrieve users campaigns by status;
             * @returns {*}
             */
            items () {
                vm.dependency.depend();
                doSubscription ();

                (new Promise((resolve, reject) => {
                    let applications;
                    let conditions = {};
                    conditions = {"authorId": Meteor.user()._id,"status": { '$ne': ENUM.ITEM_STATUS.NEW }};
        
                    Meteor.call('items.getItemsSummary', conditions, (err, res) => {
                        if (err) {
                            reject();
                        } else {
                            resolve(res);
                        }
                    });
                })).then(function(results){
                    vm.items = results;
                    
                    vm.dependency.changed();
                }).catch(function() {
                    vm.items = [];
                });
               
                return vm.items;
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
        * @desc Select the current edit item;
        * @param itemIdArg
        */
       vm.selectEditItem = function (itemIdArg) {

           if (itemIdArg instanceof Object) {
               getItemId = itemIdArg.itemId;
               vm.maxScore = itemIdArg.maxScore;
           } else {
               getItemId = itemIdArg;
           };
           vm.editItem = vm.getItem(getItemId);
           vm.editTemplate = TemplatesCollection.findOne({_id:vm.editItem.templateId});
           vm.editItemForCancel = angular.copy(vm.editItem);
       };

       /**
       * @desc return  specific item;
       * @param itemIdArg
       * @returns {*}
       */
      vm.getItem = function (itemIdArg) {
          return vm.getItem(itemIdArg);
      };

        vm.openEditItem = function (itemIdArg) {
            
                        vm.selectEditItem(itemIdArg);
            
                        function loadModal () {
            
                            auditionEdit.modalInstance = $uibModal.open({
                                animation: true,
                                templateUrl: 'client/talents/view/editItem.html',
                                controller: 'editItemCtrl',
                                controllerAs: 'editItem',
                                keyboard: false,
                                backdrop  : 'static',
                                resolve: {
                                    ChallengeMainCtrl : function () {
            
                                        return vm;
                                    }
                                },
                                size: 'xl'
                            });
                        }
                        loadModal();
                        vm.dependency.changed();
                    };

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
         * By vm.changeSelectedStatus() we bring the challenges
         */
        
        vm.changeSelectedStatus(vm.selectedStatus);
    });
