angular
    .module('skillera')
    .controller('talentChallengeMainCtrl', function($state,$stateParams,$scope,$reactive,$window, dbhService, $uibModal, $UserAlerts, ENUM, MAP,$promiser, $http,$sce,moment) {
        $scope.trust = $sce.trustAsHtml;

        let vm = this;
        let reactiveContext = $reactive(vm).attach($scope);

        $window.auditionExecuteCtrl = vm;

        //$reactive(vm).attach($scope);

        vm.animationsEnabled = true;
        vm.isViewThumbnails  = true;
        vm.selectedStatus    = undefined;
        vm.orderBy           = 'skill';
        vm.createChallengeInd = false;
        vm.ENUM = ENUM;
        vm.MAP = MAP;
        vm.complexity = "";
        vm.complexityArray = [ENUM.EXPERIENCE.up1, ENUM.EXPERIENCE.up2, ENUM.EXPERIENCE.up3, ENUM.EXPERIENCE.up4];
        vm.timeOffset = 0;


        vm.dependency = new Deps.Dependency();

        vm.addChallengeOption = false;
        vm.createChallengeOption = false;

        vm.showCtsAreaAddChallenge = false;
        vm.showCtsAreaCreateChallenge = false;

        vm.states = {};
        vm.skills = [];

        /**
         * @desc show a dialog with the message;
         * @param msgArg
         * @param callbackArg
         */
        function showInfoMessage(msgArg, callbackArg) {
            $UserAlerts.open(msgArg, ENUM.ALERT.INFO, true, callbackArg);
        }

        function showErrorMessage(msgArg) {
            $UserAlerts.open(msgArg, ENUM.ALERT.DANGER, true);
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

        vm.helpers({
            /**
             * @desc Retrieve users campaigns by status;
             * @returns {*}
             */
            items () {
                vm.dependency.depend();
                
               
                return vm.items;
            },
            templates () {
                vm.dependency.depend();
                if (vm.selectedChallengesTypes)
                    return TemplatesCollection.find({type:vm.selectedChallengesTypes.type});
            },

            /**
             * @desc retrieve Meteor.user;
             * @returns {Meteor.user}
             */
            currentUser() {
                return Meteor.user();
            }
        });

        vm.setSelected = function (challengeTypeArg) {
            challengeTypeArg.selected = true;
            vm.selectedChallengesTypes = challengeTypeArg;

            $.each(vm.challengesTypes, function () {
                if (challengeTypeArg !== this) {
                    this.selected = false;
                }
            });
            vm.dependency.changed();
        };

         vm.doSubscription  = function () {
            
                        vm.subscribe('allAuditions', () => []);
                        if (Meteor.user() && Meteor.user().profile) {
                            // vm.subscribe('itemsByAuthorId',() => [Meteor.user()._id]);
                            vm.subscribe('itemsByAuthorId',() => [Meteor.user().profile.talentId]);
                        }
                        return true;

                     };

        vm.setCreateChallenge = function () {
            vm.createChallengeInd = true;
        };

        vm.cancelNewChallenge = function () {
            vm.createChallengeInd = false;
            vm.dependency.changed();
        };

        /**
         * @desc Make sure all subscriptions are done.
         */
        function verifySubscribe() {

            if (vm.templatesReady) {

              
                vm.subsciptionOk = true;

                /**
                 * @desc get challenges types
                 */
                (function() {
                    let t = TemplatesCollection.find({});
                    vm.challengesTypes = {};
                    vm.templateNames = [];
                    if (t.count()) {
                        t.forEach(function (template) {
                            vm.challengesTypes[template.type] = {
                                type:template.type,
                                selected:false
                            };
                            vm.templateNames.push(template.name);
                        });
                    }
                })();


                let keysArray = Object.keys(vm.challengesTypes);
                vm.selectedChallengesTypes = vm.challengesTypes[keysArray[0]];
                vm.selectedChallengesTypes.selected = true;

                vm.saveEditItem();

                vm.dependency.changed();
            }
        };


        /** Subscribe to necessary publishers */
        Meteor.subscribe('templates', () => [], {
            onReady: function () {
                createPseudoAudition();

                vm.templatesReady = true;
                verifySubscribe();
            },
            onError: function () {
                console.log("onError", arguments);
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

            (new Promise((resolve, reject) => {
                let items;
                let conditions = {};

                if (vm.selectedStatus) {
                    conditions = {$and: [
                        {authorId: Meteor.user().profile.talentId},
                        {status: vm.ENUM.ITEM_STATUS[vm.selectedStatus]}
                    ]};
                }
                else {
                    conditions = {$and: [
                        {authorId: Meteor.user().profile.talentId},
                        {status: {$ne: ENUM.ITEM_STATUS.NEW}}
                    ]};
                }
                // conditions = {"authorId": Meteor.user()._id,"status": { '$ne': ENUM.ITEM_STATUS.NEW }};
    
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
            if (statusArg === ENUM.CAMPAIGN_STATUS.PUBLISHED){
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



        vm.registerEditItem = function () {

            if  (!vm.editItem.skill) {
                showErrorMessage("The challenge's skill should be defined");
                return
            };
            if  (!vm.editItem.complexity) {
                showErrorMessage("The challenge's complexity should be defined");
                return
            };
            

            if (vm.editItem.status == ENUM.ITEM_STATUS.NEW) {
                vm.editItem.status = ENUM.ITEM_STATUS.IN_WORK;
                vm.saveEditItem();
            }
            vm.editItem = null;
            if (vm.modalInstance) {
                vm.modalInstance.close();
                vm.changeSelectedStatus(vm.selectedStatus);
                $state.go('mainChallenges');
            };
        };


        /**
         * @desc Add a new item to the audition;
         * @param templateIdArg 
         */
        vm.createNewItem = function (templateIdArg) {
            vm.createChallengeInd = false;
            vm.editTemplate = TemplatesCollection.findOne({_id:templateIdArg});

            let editItem = {
                "status" : ENUM.ITEM_STATUS.NEW,
                "statusDate" : new Date(),
                "skill" : "",
                "complexity" : "",
                "itemDuration" : 30000,
                "title": "",
                "description": "",
                "tags" : [],
                "templateId" : templateIdArg,
                "content" : {},
                "usage" : 0,
                "lastAssignedDate" : "",
                "authorType" : ENUM.ITEM_AUTHOR_TYPE.TALENT,
                "authorId" : Meteor.user().profile.talentId, /*Zvika - This should be changed in the future to be the Subscriber ID*/
                "shareInd" : true, /*Zvika - Currently this is the default and cannot be changed. In the future it should be taken from the Recruiter profile*/
                "control" : {
                    "createdBy" : Meteor.user()._id,
                    "createDate" : new Date(),
                    "updatedBy" : Meteor.user()._id,
                    "updateDate" : new Date()
                }
            };
            
            editItem._id = Items.insert(angular.copy(editItem));

             auditionItemArrayEntry = {itemId:editItem._id, maxScore:0};
            
            vm.openEditItem(angular.copy(auditionItemArrayEntry));
            
        };

       /**
       * @desc return  specific item;
       * @param itemIdArg
       * @returns {*}
       */
      vm.getItem = function (itemIdArg) {
        //  
        return (function () {
            if (vm.editItem && itemIdArg === vm.editItem._id) {
                return vm.editItem;
            }
            else {
                return Items.findOne({_id:itemIdArg});
            }
        })();
      };


        vm.openEditItem = function (itemIdArg) {
                        
            
                        vm.selectEditItem(itemIdArg);
                        // Invoke the item modal in create audition mode
                        $scope.challengeCreateMode = ENUM.CHALLENGE_CREATE_MODE.POOL;
            
                            vm.modalInstance = $uibModal.open({
                                animation: true,
                                templateUrl: 'client/challenge/view/challengeEdit.html',
                                controller: 'challengeEditCtrl',
                                controllerAs: 'challengeEdit',
                                keyboard: false,
                                backdrop  : 'static',
                                scope: $scope,
                                resolve: {
                                    ChallengeMainCtrl : function () {
            
                                        return vm;
                                    }
                                },
                                size: 'xl'
                            });
                                        // handle the modal promise
                            vm.modalInstance.result.then(function (results) {
                                vm.changeSelectedStatus(vm.selectedStatus);
                                vm.dependency.changed();
                                switch (results) {
                                    case ENUM.MODAL_RESULT.SAVE: {
                                        break;
                                    };
                                    case ENUM.MODAL_RESULT.CANCEL: {
                                         if ((vm.editItem.status === ENUM.ITEM_STATUS.IN_WORK) || (vm.editItem.status === ENUM.ITEM_STATUS.AVAILABLE)) {
                                            vm.editItem = null;
                                        };
                                        break;
                                    };
                                    case ENUM.MODAL_RESULT.CLOSE: {
                                        
                                        break;
                                    };
                                    default:
                                        break;
                                };
                            });
                    };

        /**
         * @desc delete the campaign by changing its status;
         * @param campaignArg
         */
        vm.deleteItem = function (itemArg){

            vm.readyToBeDeleted = false;
            itemUsed = '';
            //Check if the available item is already being used in a non published audition
            if (itemArg.status === ENUM.ITEM_STATUS.AVAILABLE) {
                itemUsed = Auditions.findOne({"items.itemId": itemArg._id});
                if (itemUsed) {
                    vm.readyToBeDeleted = false;    
                } else {
                    vm.readyToBeDeleted = true;
                }
            } else {
                vm.readyToBeDeleted = true;
            };

            if (vm.readyToBeDeleted){
                        $UserAlerts.prompt(
                            'Are you sure you want to delete the challenge?',
                            ENUM.ALERT.INFO,
                            true,
                            function () {
                                let item = angular.copy(itemArg);
                                // let tempId   = item._id;

                                // item.status     = ENUM.ITEM_STATUS.CANCELED;

                                // delete item._id;
                                // Items.update({_id: tempId},{$set: item});
                                Items.remove({_id:item._id});

                                vm.changeSelectedStatus(vm.selectedStatus);
                        });
                    } else {
                        showErrorMessage("The challenge is in use, therefore can not be deleted");
                    }
        };

        vm.allowItem = function (itemArg){

            $UserAlerts.prompt(
                'Are you sure you want to publish the Challenge?',
                ENUM.ALERT.INFO,
                true,
                function () {
                    let item = angular.copy(itemArg);
                    let tempId   = item._id;

                    item.status     = ENUM.ITEM_STATUS.AVAILABLE;

                    delete item._id;
                    Items.update({_id: tempId},{$set: item});


                    vm.changeSelectedStatus(vm.selectedStatus);
            });
        };



                /**
         * @desc The pseudo audition is used to display all current templates;
         */
        function createPseudoAudition () {
            $window._audition = {
                "_id" : "1",
                "title" : "This is an audition",
                "description" : "This the description of the audition",
                "auditionId" : "345345343454",
                "campaignId" : "89986698769876",
                "items" : [],
                "templates" : [],
                "tags" : []
            };
            let templates = TemplatesCollection.find();

            templates.forEach(function (template) {
                $window._audition.templates.push(template._id);
                let itemEntryId = $window._audition.items.length + '';
                $window._audition.items.push({itemId:itemEntryId , maxScore:0});
            });
        }

        vm.getAuditionHtml = function (auditionItemIdArg, templateIdArg) {
            let auditionItemId = auditionItemIdArg;
            let auditionChallengeId = templateIdArg;
            let challengeTemplate = TemplatesCollection.findOne({_id:auditionChallengeId});

            let templateHtml = ``;

            switch (templateIdArg) {
                case "57f7a8406f903fc2b6aae39a" :
                    templateHtml += `<link rel="stylesheet" href="{{auditionItemUrl}}/css/MultipleChoiceSimple.css">`;
                    templateHtml += `<script type="text/javascript">`;
                    templateHtml += `let audition1 = new Meteor.AuditionItemApi("${auditionItemId}");`;
                    templateHtml += `let multipleChoiceSimpleCtrl = new Meteor.MultipleChoiceSimpleCtrl("${auditionItemId}");`;
                    templateHtml += `audition1.addEventListener('content', multipleChoiceSimpleCtrl.onRequestContent);`;
                    templateHtml += `audition1.addEventListener('initialize', multipleChoiceSimpleCtrl.onInit);`;
                    templateHtml += `audition1.addEventListener('results', multipleChoiceSimpleCtrl.onRequestResults);`;
                    templateHtml += `audition1.addEventListener('command', multipleChoiceSimpleCtrl.onRequestCommand);`;
                    templateHtml += `audition1.addEventListener('configuration', multipleChoiceSimpleCtrl.onRequestConfiguration);`;
                    templateHtml += `audition1.declareLoaded();`;
                    templateHtml += `</script>`;
                    templateHtml += `<div id="multipleChoiceSimple">{{auditionItemUrl}}</div>`;
                    break;
                case "57f7a8406f903fc2b6aae49a" :
                    templateHtml += `<link rel="stylesheet" href="{{auditionItemUrl}}/css/MultipleChoice.css">`;
                    templateHtml += `<script type="text/javascript">`;
                    templateHtml += `let audition2 = new Meteor.AuditionItemApi("${auditionItemId}");`;
                    templateHtml += `let multipleChoiceCtrl = new Meteor.MultipleChoiceCtrl("${auditionItemId}");`;
                    templateHtml += `audition2.addEventListener('content', multipleChoiceCtrl.onRequestContent);`;
                    templateHtml += `audition2.addEventListener('initialize', multipleChoiceCtrl.onInit);`;
                    templateHtml += `audition2.addEventListener('results', multipleChoiceCtrl.onRequestResults);`;
                    templateHtml += `audition2.addEventListener('command', multipleChoiceCtrl.onRequestCommand);`;
                    templateHtml += `audition2.addEventListener('configuration', multipleChoiceCtrl.onRequestConfiguration);`;
                    templateHtml += `audition2.declareLoaded();`;
                    templateHtml += `</script>`;
                    templateHtml += `<div id="multipleChoice">{{auditionItemUrl}}</div>`;
                    break;
                case "5814b536e288e1a685c7a451" :
                    templateHtml += `<link rel="stylesheet" href="{{auditionItemUrl}}/css/TrueFalse.css">`;
                    templateHtml += `<script type="text/javascript">`;
                    templateHtml += `let audition3 = new Meteor.AuditionItemApi("${auditionItemId}");`;
                    templateHtml += `let trueFalseCtrl = new Meteor.TrueFalseCtrl("${auditionItemId}");`;
                    templateHtml += `audition3.addEventListener('content', trueFalseCtrl.onRequestContent);`;
                    templateHtml += `audition3.addEventListener('initialize', trueFalseCtrl.onInit);`;
                    templateHtml += `audition3.addEventListener('results', trueFalseCtrl.onRequestResults);`;
                    templateHtml += `audition3.addEventListener('command', trueFalseCtrl.onRequestCommand);`;
                    templateHtml += `audition3.addEventListener('configuration', trueFalseCtrl.onRequestConfiguration);`;
                    templateHtml += `audition3.declareLoaded();`;
                    templateHtml += `</script>`;
                    templateHtml += `<div id="trueFalse">{{auditionItemUrl}}</div>`;
                    break;
            }
            let regExpression = new RegExp('{{auditionItemUrl}}','g');
            let auditionItemUrl = `/challengesTemplates/${auditionChallengeId}`;

            let html = `<meta name="auditionId" content="${auditionItemId}">`;

            html += `${templateHtml}`;
            html = html.replace(regExpression, auditionItemUrl);

            return html;
        };

        /**
         * Items management area:
         */

        /**
         * @desc Save the current edit item, calculate it's maxScore
         * and the audition total time and update the audition.
         */
        vm.saveEditItem = () => {
            //** Initialize the audition's summary table
            vm.summery = {
                skills:{},
                score:0,
                total:0,
                time: vm.timeOffset
            };
            vm.skills.every(function (skill) {
                vm.summery.skills[skill.type.toLowerCase()] = {
                    time: 0,
                };
                vm.complexityArray.every(function (complexity) {
                    vm.summery.skills[skill.type.toLowerCase()][complexity] = 0;
                    vm.summery[complexity] = 0;
                    vm.summery.skills[skill.type.toLowerCase()].score = 0;
                    vm.summery.skills[skill.type.toLowerCase()].total = 0;
                    vm.summery.skills[skill.type.toLowerCase()].time = vm.timeOffset;
                    return true;
                });
                return true;
            });
            if (vm.editItem){ 
                vm.saveItem(vm.editItem);
            };
        };

        /**
         * @desc Save an item;
         * @param item
         */
        vm.saveItem = function (item) {

            let tempId = item._id;
            delete item._id;

            //noinspection JSUnusedLocalSymbols
            Items.update({_id: tempId}, {$set: angular.copy(item)});
            item._id = tempId;
            vm.dependency.changed();
    };

        /**
         * By vm.changeSelectedStatus() we bring the challenges
         */
        vm.changeSelectedStatus(vm.selectedStatus);
    });
