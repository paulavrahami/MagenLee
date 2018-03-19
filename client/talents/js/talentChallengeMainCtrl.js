angular
    .module('skillera')
    .controller('ChallengeMainCtrl', function($state,$stateParams,$scope,$reactive,$window, dbhService, $uibModal, $UserAlerts, ENUM, MAP,$promiser, $http,$sce,moment) {
        $scope.trust = $sce.trustAsHtml;

        let vm = this;
        let reactiveContext = $reactive(vm).attach($scope);

        $window.auditionExecuteCtrl = vm;

        //$reactive(vm).attach($scope);

        vm.animationsEnabled = true;
        vm.isViewThumbnails  = true;
        vm.selectedStatus    = undefined;
        vm.orderBy           = 'positionName';
        vm.createChallengeInd = false;
        vm.ENUM = ENUM;
        vm.MAP = MAP;
        vm.complexity = "";
        vm.complexityArray = [ENUM.EXPERIENCE.up1, ENUM.EXPERIENCE.up2, ENUM.EXPERIENCE.up3, ENUM.EXPERIENCE.up4];
        vm.itemsOrderArray = [ENUM.AUDITION_ORDER.SEQUEL]; //ENUM.AUDITION_ORDER.RANDOM,
        vm.timeOffset = 0;


        vm.dependency = new Deps.Dependency();

        vm.auditionGenerationOption = false;
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
            
                        if (Meteor.user() && Meteor.user().profile) {
                            // reactiveContext.subscribe('itemsByAuthorId', () => [Meteor.user()._id]);
                            vm.subscribe('itemsByAuthorId',() => [Meteor.user()._id]);
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
         * Items dynamic edit area:
         */

        /**
         * @desc Add an element to the content of an item build dynamically;
         * @param keyArg
         */
        vm.addToContentArray = function(keyArg) {

            if (!vm.editItem.content[keyArg]) {
                vm.editItem.content[keyArg] = [];
            }
            vm.editItem.content[keyArg].push('');
            vm.saveEditItem();
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
            
            // Challenge content's checks according to the different templates
            switch (vm.editTemplate._id) {
                case "57f7a8406f903fc2b6aae39a" :
                    if (!vm.editItem.content.question) {
                        showErrorMessage("The challenge's question should be defined");
                        return
                    };
                    if ((!vm.editItem.content["1st Answer"] || vm.editItem.content["1st Answer"] && !vm.editItem.content["1st Answer"].answer) ||
                        (!vm.editItem.content["2nd Answer"] || vm.editItem.content["2nd Answer"] && !vm.editItem.content["2nd Answer"].answer) ||
                        (!vm.editItem.content["3rd Answer"] || vm.editItem.content["3rd Answer"] && !vm.editItem.content["3rd Answer"].answer) ||
                        (!vm.editItem.content["4th Answer"] || vm.editItem.content["4th Answer"] && !vm.editItem.content["4th Answer"].answer)) {
                        showErrorMessage("All answers should be defined");
                        return
                    };
                    let i=0;
                    vm.editItem.content["1st Answer"].correct ? i++ : i=i;
                    vm.editItem.content["2nd Answer"].correct ? i++ : i=i;
                    vm.editItem.content["3rd Answer"].correct ? i++ : i=i;
                    vm.editItem.content["4th Answer"].correct ? i++ : i=i;
                    if (i===0) {
                        showErrorMessage("The Challenge's correct answer should be defined");
                        return;
                    };
                    if (i>1) {
                        showErrorMessage("Only one correct answer can be defined for the challenge");
                        return;  
                    };
                    break;

                case "57f7a8406f903fc2b6aae49a" :
                    if (!vm.editItem.content.question) {
                        showErrorMessage("The challenge's question should be defined");
                        return
                    };
                    if (!vm.editItem.content.answers || !vm.editItem.content.results) {
                        showErrorMessage("The challenge's answers and results should be defined");
                        return;
                    };
                    if (
                        vm.editItem.content.answers.length !== vm.editItem.content.results.length) {
                        showErrorMessage("The challenge's number of answers and results should match");
                        return;
                    };
                    for (i=0; i < vm.editItem.content.results.length; i++) {
                        if (vm.editItem.content.results[i] > 100) {
                            showErrorMessage("Answer's result can not be greater than 100");
                            return;
                        };
                    };
                    break;

                case "5814b536e288e1a685c7a451" :
                    if (!vm.editItem.content.question) {
                        showErrorMessage("The challenge's question should be defined");
                        return
                    };
                    if ((!vm.editItem.content['1st Button Text']) ||
                        (!vm.editItem.content['2nd Button Text']) ||
                        (vm.editItem.content['1st Button Score'] === null) ||
                        (vm.editItem.content['1st Button Score'] === undefined) ||
                        (vm.editItem.content['2nd Button Score'] === null) ||
                        (vm.editItem.content['2nd Button Score'] === undefined)) {
                        showErrorMessage("All challenge's buttons should be defined");
                        return;
                    };
                    if (((vm.editItem.content['1st Button Score']) && (vm.editItem.content['1st Button Score'] > 100)) ||
                        ((vm.editItem.content['2nd Button Score']) && (vm.editItem.content['2nd Button Score'] > 100))) {
                        showErrorMessage("Button's score can not be greater than 100");
                        return;
                    };
                    if ((vm.editItem.content['1st Button Score'] !== 100) &&
                        (vm.editItem.content['2nd Button Score'] !== 100)) {
                        showErrorMessage("At leaset one button's score should be equal to 100");
                        return;
                    };
                    break;
            };

            if (vm.editItem.status == ENUM.ITEM_STATUS.NEW) {
                vm.editItem.status = ENUM.ITEM_STATUS.IN_WORK;
                vm.saveEditItem();
            }
            vm.editItem = null;
            if (vm.modalInstance) {
                vm.modalInstance.close();
                vm.dependency.changed();
                $state.go('mainChallenges');
            };
        };
        
        vm.cancelEditItem = function () {
        
            // if (vm.editItem.status == ENUM.ITEM_STATUS.NEW) {
            //     vm.removeItem(vm.editItem._id);
            // }
            // else {
            //     vm.editItem = vm.editItemForCancel;
                 vm.saveEditItem();
            //};
        vm.editItem = null;
        if (vm.modalInstance) {
            vm.modalInstance.close();
            vm.dependency.changed();
            $state.go('mainChallenges');
            };
        };

        /**
         * @desc Remove the last element from the content of an item build dynamically;
         * @param keyArg
         */
        vm.removeFromContentArray = function(keyArg) {

            if (vm.editItem.content[keyArg]) {
                vm.editItem.content[keyArg].splice(-1);
                vm.saveEditItem();
            }
        };

        vm.closeEditItem = function () {
            if (vm.modalInstance) {
                vm.modalInstance.close();
                $state.go('mainChallenges');
            };
        };

        /**
         * @desc is array fn for UI;
         * @param value
         */
        vm.isArray = function (value) {
            return angular.isArray(value);
        };
        /**
         * @desc is string fn for UI;
         * @param value
         */
        vm.isString = function (value) {
            return typeof(value) !== "object" && String(value).toLowerCase() === "string";
        };
        /**
         * @desc is number fn for UI;
         * @param value
         */
        vm.isNumber = function (value) {
            return typeof(value) !== "object" && String(value).toLowerCase() === "number";
        };
        /**
         * @desc is boolean fn for UI;
         * @param value
         */
        vm.isBoolean = function (value) {
            return typeof(value) !== "object" && String(value).toLowerCase() === "boolean";
        };
        /**
         * @desc is object fn for UI;
         * @param value
         */
        vm.isObject = function (value) {
            return typeof(value) === "object" && String(value).toLowerCase() !== "string" && String(value).toLowerCase() !== "number" && String(value).toLowerCase() !== "boolean";
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
                "authorId" : Meteor.user()._id, /*Zvika - This should be changed in the future to be the Subscriber ID*/
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
            // vm.audition.items.push(angular.copy(auditionItemArrayEntry));
            // vm.saveAudition();
            vm.openEditItem(angular.copy(auditionItemArrayEntry));
            //** close the cts area for the "create challenge" option
            // auditionEdit.showCtsAreaCreateChallenge = false;
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
                        console.log('in open edit item');
            
                        vm.selectEditItem(itemIdArg);
            
                        function loadModal () {
            
                            vm.modalInstance = $uibModal.open({
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
