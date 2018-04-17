angular
    .module('skillera')
    .controller('AuditionEditCtrl', function($state,$stateParams,$scope,$filter,$window,$reactive,dbhService, $UserAlerts, $uibModal, ENUM, MAP, $promiser, $http,$sce,moment) {
        $scope.trust = $sce.trustAsHtml;
        let auditionEdit = this;
        $reactive(auditionEdit).attach($scope);
        $window.auditionExecuteCtrl = auditionEdit; /* Zvika ???*/

        auditionEdit.dependency = new Deps.Dependency();

        auditionEdit.ENUM = ENUM;
        auditionEdit.complexityArray = [ENUM.EXPERIENCE.up1, ENUM.EXPERIENCE.up2, ENUM.EXPERIENCE.up3, ENUM.EXPERIENCE.up4];

        auditionEdit.itemsOrderArray = [ENUM.AUDITION_ORDER.SEQUEL];
        auditionEdit.timeOffset = 0; //(new Date()).getTimezoneOffset() * 60000;

        auditionEdit.auditionGenerationOption = false;
        auditionEdit.addChallengeOption = false;
        auditionEdit.createChallengeOption = false;

        auditionEdit.showCtsAreaAddChallenge = false;
        auditionEdit.showCtsAreaCreateChallenge = false;

        auditionEdit.states = {};
        
        auditionEdit.setConfiguration = function (itemIdArg, configuratonArg) {
            /*Zvika ???*/
        };

        function showInfoMessage(msgArg, callbackArg) {
            $UserAlerts.open(msgArg, ENUM.ALERT.INFO, true, callbackArg);
        };

        function showErrorMessage(msgArg) {
            $UserAlerts.open(msgArg, ENUM.ALERT.DANGER, true);
        };

        /* Get the Audition Id from the campaign */
        if ($stateParams && $stateParams.auditionId) {
            auditionEdit.auditionId = $stateParams.auditionId;
        };

        // Make sure all subscriptions are done.
        function verifySubscribe() {
            if (
                auditionEdit.templatesReady &&
                auditionEdit.auditionsReady &&
                auditionEdit.campaignsReady &&
                auditionEdit.itemsReady
            ) {
                if (auditionEdit.audition.items.length > 0) {
                    auditionEdit.selectCurrentItem(auditionEdit.audition.items[0].itemId);
                }
                auditionEdit.subsciptionOk = true;

                /**
                 * @desc get challenges types
                 */
                (function() {
                    let t = TemplatesCollection.find({});
                    auditionEdit.challengesTypes = {};
                    auditionEdit.templateNames = [];
                    if (t.count()) {
                        t.forEach(function (template) {
                            auditionEdit.challengesTypes[template.type] = {
                                type:template.type,
                                selected:false
                            };
                            auditionEdit.templateNames.push(template.name);
                        });
                    }
                })();

                (function () {
                    auditionEdit.campaign = Campaigns.findOne({_id:auditionEdit.audition.campaignId});
                    auditionEdit.campaignStatus = auditionEdit.campaign.status;
                    auditionEdit.skills = auditionEdit.campaign.skills;
                    auditionEdit.audition.name = auditionEdit.campaign.positionName;
                    auditionEdit.audition.description = auditionEdit.campaign.description;
                })();

                (function () {
                    window.onpopstate = function(event) {
                        if (document.location.href.indexOf(auditionEdit.campaign._id) === -1) {
                            document.location.href = document.location + auditionEdit.campaign._id;
                        }
                    };
                })();

                let keysArray = Object.keys(auditionEdit.challengesTypes);
                auditionEdit.selectedChallengesTypes = auditionEdit.challengesTypes[keysArray[0]];
                auditionEdit.selectedChallengesTypes.selected = true;

                calculateAuditionSummary();

                auditionEdit.dependency.changed();
            };
        };

        // Subscribe to necessary publishers
        Meteor.subscribe('templates', () => [], {
            onReady: function () {
                createPseudoAudition();
                auditionEdit.templatesReady = true;
                verifySubscribe();
            },
            onError: function () {
                console.log("onError", arguments);
            }
        });

        Meteor.subscribe('allAuditions', () => [], {
            onReady: function () {
                auditionEdit.audition = Auditions.findOne({_id:auditionEdit.auditionId});
                auditionEdit.auditionsReady = true;
                verifySubscribe();
            },
            onError: function () {
                console.log("onError", arguments);
            }
        });

        Meteor.subscribe('items', () => [], {
            onReady: function () {
                auditionEdit.itemsReady = true;
                verifySubscribe();
            },
            onError: function () {
                console.log("onError", arguments);
            }
        });

        function subscribeCampaign () {
            if (Meteor.user() && Meteor.user().profile && Meteor.user().profile.companyName) {
                auditionEdit.subscribe('campaignsRecruiter', () => [Meteor.user().profile.companyName]);
                function waitForSubscribeCampaign() {
                    setTimeout(function () {
                        try {
                            auditionEdit.skills = Campaigns.findOne({}).skills;
                            auditionEdit.campaignsReady = true;
                            verifySubscribe();
                        }
                        catch (e) {
                            setTimeout(waitForSubscribeCampaign, 100);
                        }
                    }, 250);
                }
                waitForSubscribeCampaign();
            }
            else {
                setTimeout(subscribeCampaign, 100);
            }
        };
        subscribeCampaign();

        auditionEdit.helpers({
            /**
             * @desc Retrieve users campaigns by status;
             * @returns {*}
             */
            auditions () {
                auditionEdit.dependency.depend();

                return Auditions.find({});
            },
            templates () {
                auditionEdit.dependency.depend();
                if (auditionEdit.selectedChallengesTypes)
                    return TemplatesCollection.find({type:auditionEdit.selectedChallengesTypes.type});
            },

            /**
             * @desc retrieve Meteor.user;
             * @returns {Meteor.user}
             */
            currentUser() {
                return Meteor.user();
            }
        });

        auditionEdit.clearAudition = function () {
            let msgArg = "All challenges will be removed from the audition. Please confirm";
            $UserAlerts.prompt(
                msgArg,
                ENUM.ALERT.INFO,
                false,
                function(){
                    auditionEdit.audition.items = [];
                    auditionEdit.saveAudition();
                    calculateAuditionSummary();
            });
        };

        function checkItemsForSkill () {
            let campaign = Campaigns.findOne({_id: auditionEdit.audition.campaignId});
            let noChallenges = false;
            // check for each campaign's skill if items are associated with
            for (let i = 0; (i < campaign.skills.length) && !noChallenges; i++) {
                if (!Items.findOne({skill: campaign.skills[i].type})) {
                    noChallenges = true;
                    showErrorMessage('No challenges have been defined for the "' + campaign.skills[i].type + '" skill');
                    return false;
                };
            };
            return true;
        };

        auditionEdit.auditionDone = function () {
            if (!auditionEdit.audition.items[0].itemId){
                  showInfoMessage('At least one challenge have to be defined for the audition', function () {});
            } else {
                  let msgArg = "The audition will be finalized. Please confirm";
                  $UserAlerts.prompt(
                      msgArg,
                      ENUM.ALERT.INFO,
                      false,
                      function(){
                          let itemsExist = checkItemsForSkill();
                          if (!itemsExist) {
                            return;
                          };                   
                          auditionEdit.audition.status = ENUM.AUDITION_STATUS.AVAILABLE;
                          auditionEdit.saveAudition();
                          $state.go("recruiter.recruiterDemand",{id:auditionEdit.audition.campaignId,'#':'panel-3'});
                      });
            };
        };

        auditionEdit.auditionRework = function () {
            let msgArg = "The audition status will be changed back to 'In Work'. Please confirm";
            $UserAlerts.prompt(
                msgArg,
                ENUM.ALERT.INFO,
                false,
                function(){
                    auditionEdit.audition.status = ENUM.AUDITION_STATUS.IN_WORK;
                    auditionEdit.saveAudition();
                });
        };
       
        // Returns the templates url to load them in the UI
        auditionEdit.getAuditionItemSrc = function (auditionItemIdArg, templateIdArg) {
            return '/iframeTemplate/' + auditionItemIdArg + '/' + templateIdArg;
        };

        auditionEdit.getAuditionHtml = function (auditionItemIdArg, templateIdArg) {
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
        
        // The pseudo audition is used to display all current templates
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
            //$window.loadAudition();
        };

        function calculateAuditionSummary () {
            // Initialize the audition summary table
            auditionEdit.summery = {
                skills:{},
                score:0,
                total:0,
                time: auditionEdit.timeOffset
            };
            auditionEdit.skills.every(function (skill) {
                auditionEdit.summery.skills[skill.type.toLowerCase()] = {
                    time: 0,
                };
                auditionEdit.complexityArray.every(function (complexity) {
                    auditionEdit.summery.skills[skill.type.toLowerCase()][complexity] = 0;
                    auditionEdit.summery[complexity] = 0;
                    auditionEdit.summery.skills[skill.type.toLowerCase()].score = 0;
                    auditionEdit.summery.skills[skill.type.toLowerCase()].total = 0;
                    auditionEdit.summery.skills[skill.type.toLowerCase()].time = auditionEdit.timeOffset;
                    return true;
                });
                return true;
            });

            //** Calculate the audition's summary table
            auditionEdit.audition.items.every(function (singleItem) {

                let item = auditionEdit.getItem(singleItem.itemId);
                if (!item) {
                    alert(`Cannot get item id: ${singleItem.itemId}`);
                    return false;
                }
                if (!item.skill) {
                    item.skill = "";
                }

                //** Sum the unclassified audition items
                if (item.skill === "" && !auditionEdit.summery.skills["Unclassified"]) {
                    auditionEdit.summery.skills["Unclassified"] = {};
                    auditionEdit.complexityArray.every(function (complexity) {
                        auditionEdit.summery.skills["Unclassified"][complexity] = 0;
                        auditionEdit.summery.skills["Unclassified"].score = 0;
                        auditionEdit.summery.skills["Unclassified"].total = 0;
                        auditionEdit.summery.skills["Unclassified"].time = auditionEdit.timeOffset;
                        return true;
                    });
                }

                //** Sum audition items per skills
                let skillName = item.skill || 'Unclassified';
                try {
                    if (item.complexity === ENUM.EXPERIENCE.up1) {
                        auditionEdit.summery.skills[skillName.toLowerCase()][ENUM.EXPERIENCE.up1]++;
                        auditionEdit.summery[ENUM.EXPERIENCE.up1]++;
                    }
                    if (item.complexity === ENUM.EXPERIENCE.up2) {
                        auditionEdit.summery.skills[skillName.toLowerCase()][ENUM.EXPERIENCE.up2]++;
                        auditionEdit.summery[ENUM.EXPERIENCE.up2]++;
                    }
                    if (item.complexity === ENUM.EXPERIENCE.up3) {
                        auditionEdit.summery.skills[skillName.toLowerCase()][ENUM.EXPERIENCE.up3]++;
                        auditionEdit.summery[ENUM.EXPERIENCE.up3]++;
                    }
                    if (item.complexity === ENUM.EXPERIENCE.up4) {
                        auditionEdit.summery.skills[skillName.toLowerCase()][ENUM.EXPERIENCE.up4]++;
                        auditionEdit.summery[ENUM.EXPERIENCE.up4]++;
                    }
                    auditionEdit.summery.skills[skillName.toLowerCase()].time += item.itemDuration.valueOf() - auditionEdit.timeOffset;
                    auditionEdit.summery.time += item.itemDuration.valueOf() - auditionEdit.timeOffset;
                    auditionEdit.summery.skills[skillName.toLowerCase()].score += singleItem.maxScore;
                    auditionEdit.summery.skills[skillName.toLowerCase()].total++;
                    auditionEdit.summery.score += singleItem.maxScore;
                    auditionEdit.summery.total++;

                    if ((auditionEdit.summery.skills[skillName.toLowerCase()].score + "").indexOf("999") > -1) {
                        auditionEdit.summery.skills[skillName.toLowerCase()].score = Math.ceil(auditionEdit.summery.skills[skillName.toLowerCase()].score);
                    }
                    if ((auditionEdit.summery.score + "").indexOf("999") > -1) {
                        auditionEdit.summery.score = Math.ceil(auditionEdit.summery.score);
                    }
                }
                catch (e) {}

                auditionEdit.summery.timeLeft = auditionEdit.audition.auditionDuration - auditionEdit.summery.time;
                return true;
            });
        };

        function calculateItemsMaxScore () {
            //** Calculate the items scoring weight based on the campaign's skills they are associated with
            let allWeight = 0;
            // for all items associated with the audition do:
            auditionEdit.audition.items.every(function (singleItem) {
                // Get the item
                let item = auditionEdit.getItem(singleItem.itemId);
                if (!item) {
                    alert(`Cannot get item id: ${singleItem.itemId}`);
                    return false;
                };
                if (!item.skill) {
                    item.skill = "";
                };
                // The "auditionEdit.skills" is an array of skill objects taken from the campaign.
                // Each object's instance consists of: skill type, importance and proficiency.
                // The following line of code tries to find the related object the item has been assigned to.
                index = auditionEdit.skills.findIndex(findItem => findItem.type.toLowerCase() == item.skill.toLowerCase());
                if (index === -1) {
                    alert(`The skill associated with the item is not defined for the campaign - ${item.skill}`);
                    return false;
                };
                // calculate the weight by adding the related skill factor. This is the skill the item is linked to.
                if (auditionEdit.skills[index].importance === ENUM.SKILL_IMPORTANCE.NICE) {
                    allWeight += 1;
                }
                else if (auditionEdit.skills[index].importance === ENUM.SKILL_IMPORTANCE.LOW) {
                    allWeight += 2;
                }
                else if (auditionEdit.skills[index].importance === ENUM.SKILL_IMPORTANCE.NORMAL) {
                    allWeight += 3;
                }
                else if (auditionEdit.skills[index].importance === ENUM.SKILL_IMPORTANCE.HIGH) {
                    allWeight += 4;
                }
                else if (auditionEdit.skills[index].importance === ENUM.SKILL_IMPORTANCE.MUST) {
                    allWeight += 5;
                }

                return true;
            });

            //** Calculate the weighted max score per each item
            allWeight = Math.max(allWeight, 1);
            let singleWeight = 100 / allWeight;
            let allTime = auditionEdit.timeOffset;

            auditionEdit.audition.items.every(function (singleItem) {

                let item = auditionEdit.getItem(singleItem.itemId);

                allTime += item.itemDuration.valueOf() - auditionEdit.timeOffset;

                index = auditionEdit.skills.findIndex(findItem => findItem.type.toLowerCase() == item.skill.toLowerCase());
                if (index === -1) {
                     alert(`The skill associated with the item is not defined for the campaign - ${item.skill}`);
                    return false;
                };

                if (auditionEdit.skills[index].importance === ENUM.SKILL_IMPORTANCE.NICE) {
                    singleItem.maxScore = singleWeight;
                }
                else if (auditionEdit.skills[index].importance === ENUM.SKILL_IMPORTANCE.LOW) {
                    singleItem.maxScore = 2 * singleWeight;
                }
                else if (auditionEdit.skills[index].importance === ENUM.SKILL_IMPORTANCE.NORMAL) {
                    singleItem.maxScore = 3 * singleWeight;
                }
                else if (auditionEdit.skills[index].importance === ENUM.SKILL_IMPORTANCE.HIGH) {
                    singleItem.maxScore = 4 * singleWeight;
                }
                else if (auditionEdit.skills[index].importance === ENUM.SKILL_IMPORTANCE.MUST) {
                    singleItem.maxScore = 5 * singleWeight;
                }
                else {
                    singleItem.maxScore = 0;
                }

                return true;
            });
        };

        // Move an item up
        auditionEdit.moveItemUp = function (itemIdArg) {

            let indexOf = auditionEdit.audition.items.indexOf(itemIdArg);

            if (indexOf < auditionEdit.audition.items.length - 1) {
                let tempItem = auditionEdit.audition.items[indexOf + 1];
                auditionEdit.audition.items[indexOf + 1] = angular.copy(itemIdArg);
                auditionEdit.audition.items[indexOf] = angular.copy(tempItem);
            }
        };

        // Move an item down
        auditionEdit.moveItemDown = function (itemIdArg) {

            let indexOf = auditionEdit.audition.items.indexOf(itemIdArg);

            if (indexOf > 0) {
                let tempItem = auditionEdit.audition.items[indexOf - 1];
                auditionEdit.audition.items[indexOf - 1] = angular.copy(itemIdArg);
                auditionEdit.audition.items[indexOf] = angular.copy(tempItem);
            }
        };

        // Remove an item from the audition
        auditionEdit.removeItem = function (itemIdArg) {
            if (auditionEdit.audition.status !== auditionEdit.ENUM.AUDITION_STATUS.AVAILABLE) {
                removeItemFromAudition(itemIdArg);
                calculateItemsMaxScore();
                auditionEdit.saveAudition();
                calculateAuditionSummary();
            };
        };

        function removeItemFromAudition (itemIdArg) {
            let indexOf = auditionEdit.audition.items.indexOf(itemIdArg);
            auditionEdit.audition.items.splice(indexOf, 1);
            indexOf--;
            if (indexOf < 0) {
                indexOf = 0;
            }
            if (indexOf < auditionEdit.audition.items.length) {
                auditionEdit.selectCurrentItem(auditionEdit.audition.items[indexOf].itemId);
            };
        };

        auditionEdit.getItem = function (itemIdArg) {
            return auditionEdit.getItem(itemIdArg);
        };
        
        // Get the item from the collection unless it is the edit item
        auditionEdit.getItem = function (itemIdArg) {
            return (function () {
                if (auditionEdit.editItem && itemIdArg === auditionEdit.editItem._id) {
                    return auditionEdit.editItem;
                }
                else {
                    return Items.findOne({_id:itemIdArg});
                }
            })();
        };
       
        // Creat an empty item as prep for the create item modal
        auditionEdit.createNewItem = function (templateIdArg) {
            auditionEdit.editTemplate = TemplatesCollection.findOne({_id:templateIdArg});

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
                "authorType" : ENUM.ITEM_AUTHOR_TYPE.RECRUITER,
                "authorId" : Meteor.user()._id, /*Zvika - This should be changed in the future to be the Subscriber ID*/
                "shareInd" : true, /*Zvika - Currently this is the default and cannot be changed. In the future it should be taken from the Recruiter profile*/
                "control" : {
                    "createdBy" : Meteor.user()._id,
                    "createDate" : new Date(),
                    "updatedBy" : Meteor.user()._id,
                    "updateDate" : new Date()
                }
            };
            if (auditionEdit.audition.status !== auditionEdit.ENUM.AUDITION_STATUS.AVAILABLE) {
                editItem._id = Items.insert(angular.copy(editItem));
            };
            // Update the audition.item array with the new item
            auditionItemArrayEntry = {itemId:editItem._id, maxScore:0};
            auditionEdit.audition.items.push(angular.copy(auditionItemArrayEntry));
            auditionEdit.saveAudition();
            // Invoke the create/edit item modal
            auditionEdit.openEditItem(angular.copy(auditionItemArrayEntry));
        };
    
        // Edit item modal
        auditionEdit.openEditItem = function (itemIdArg) {
            auditionEdit.selectEditItem(itemIdArg);
            // Invoke the item modal in create audition mode
            $scope.challengeCreateMode = ENUM.CHALLENGE_CREATE_MODE.AUDITION;

            auditionEdit.modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'client/challenge/view/challengeEdit.html',
                controller: 'challengeEditCtrl',
                controllerAs: 'challengeEdit',
                keyboard: false,
                backdrop  : 'static',
                scope: $scope,
                resolve: {
                    auditionEditCtrl : function () {
                        return auditionEdit;
                    }
                },
                size: 'xl'
            });
            // handle the modal promise
            auditionEdit.modalInstance.result.then(function (results) {
                switch (results) {
                    case ENUM.MODAL_RESULT.SAVE: {
                        calculateItemsMaxScore();
                        auditionEdit.saveAudition();
                        calculateAuditionSummary();
                        break;
                    };
                    case ENUM.MODAL_RESULT.CANCEL: {
                        if (auditionEdit.editItem.status === ENUM.ITEM_STATUS.NEW) {
                            removeItemFromAudition(itemIdArg);
                        } else if (auditionEdit.editItem.status === ENUM.ITEM_STATUS.IN_WORK) {
                            auditionEdit.editItem = null;
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

        // Select the current edit item
        auditionEdit.selectCurrentItem = function (itemIdArg) {
            auditionEdit.currentItem = auditionEdit.getItem(itemIdArg);
        };
        
        // prep before calling the create/edit item modal 
        auditionEdit.selectEditItem = function (itemIdArg) {
            if (itemIdArg instanceof Object) {
                getItemId = itemIdArg.itemId;
                auditionEdit.maxScore = itemIdArg.maxScore;
            } else {
                getItemId = itemIdArg;
            };
            auditionEdit.editItem = auditionEdit.getItem(getItemId);
            auditionEdit.editTemplate = TemplatesCollection.findOne({_id:auditionEdit.editItem.templateId});
            auditionEdit.editItemForCancel = angular.copy(auditionEdit.editItem);
        };
       
        // Return the title of specific item (the question)
        auditionEdit.itemToString = function (itemIdArg) {
            let item = auditionEdit.getItem(itemIdArg);
            return item.content.question; //_.upperFirst(JSON.stringify(item.content).replace(/([.*+?^$|{}\[\]"])/mg, "").replace(/,/mg, ", ").replace(/:/mg, ": "));
        };

        // Return the template name of specific item
        auditionEdit.templateName = function (itemIdArg) {
            let item = auditionEdit.getItem(itemIdArg);
            return TemplatesCollection.findOne({_id:item.templateId}).name;
        };

        auditionEdit.getContent = function (itemIdArg) {
            return Contents.findOne({_id:itemIdArg})
        };
       
        auditionEdit.saveAudition = function () {
            let tempId = auditionEdit.audition._id;
            delete auditionEdit.audition._id;

            //noinspection JSUnusedLocalSymbols
            Auditions.update({_id: tempId}, {$set: angular.copy(auditionEdit.audition)});
            auditionEdit.audition._id = tempId;
        };
    
        auditionEdit.setSelected = function (challengeTypeArg) {
            challengeTypeArg.selected = true;
            auditionEdit.selectedChallengesTypes = challengeTypeArg;

            $.each(auditionEdit.challengesTypes, function () {
                if (challengeTypeArg !== this) {
                    this.selected = false;
                }
            });
            auditionEdit.dependency.changed();
        };

        auditionEdit.createChallenge = function () {
            auditionEdit.createChallengeOption = true;
            auditionEdit.showCtsAreaCreateChallenge = true;
        };

        auditionEdit.createChallengeClose = function () {
            auditionEdit.createChallengeOption = false;
            auditionEdit.showCtsAreaCreateChallenge = false;
        };

        function generateAudition() {
            auditionEdit.dependency.depend();
            // Remove the current items defined for the audition
            auditionEdit.audition.items = [];
            // The following code will be executed for each skill:
            auditionEdit.skills.every(function (skill) {
                // Get all relevant skill's items (per the conditions) from the repository
                let auditionItemArrayEntry = {};
                let itemsPerSkill = [];
                let conditions = {};
                
                conditions = {$and:[{$text: {$search: skill.type}},
                                    {$or:[{status: ENUM.ITEM_STATUS.ASSIGNED},{status: ENUM.ITEM_STATUS.AVAILABLE}]},
                                    {shareInd: true}]};

                (new Promise((resolve, reject) => {
                    Meteor.call('items.getItemsSummary', conditions, (err, res) => {
                        if (err) {
                            reject();
                        } else {
                            resolve(res);
                        }      
                    });
                })).then(function(results){
                    // All the items found as per the conditions
                    itemsPerSkill = results;
                    // If no items have been found
                    if ((itemsPerSkill.length === 0) || (itemsPerSkill.length === undefined)) {
                        showInfoMessage('No relevant challenges have been found for the ' + skill.type + ' skill');
                        return;
                    };
                    // Calculate the importance weight for each audition's skill. This will be used to prorate the the audition's duration
                    let skillsImportnceWeight = 0;
                    auditionEdit.skills.every(function (skill) {
                        if (skill.importance === ENUM.SKILL_IMPORTANCE.NICE) {
                            skillsImportnceWeight += 1;
                        }
                        else if (skill.importance === ENUM.SKILL_IMPORTANCE.LOW) {
                            skillsImportnceWeight += 2;
                        }
                        else if (skill.importance === ENUM.SKILL_IMPORTANCE.NORMAL) {
                            skillsImportnceWeight += 3;
                        }
                        else if (skill.importance === ENUM.SKILL_IMPORTANCE.HIGH) {
                            skillsImportnceWeight += 4;
                        }
                        else if (skill.importance === ENUM.SKILL_IMPORTANCE.MUST) {
                            skillsImportnceWeight += 5;
                        }
                        return true;
                    });
                    // Calculate the weighed duration to be allocated for the current skill
                    let totalDurationPerSkill = 0;
                    switch (skill.importance) {
                        case ENUM.SKILL_IMPORTANCE.NICE:
                            totalDurationPerSkill = (1 / skillsImportnceWeight) * auditionEdit.audition.auditionDuration;
                            break;
                        case ENUM.SKILL_IMPORTANCE.LOW:
                            totalDurationPerSkill = (2 / skillsImportnceWeight) * auditionEdit.audition.auditionDuration;
                            break;
                        case ENUM.SKILL_IMPORTANCE.NORMAL:
                            totalDurationPerSkill = (3 / skillsImportnceWeight) * auditionEdit.audition.auditionDuration;
                            break;
                        case ENUM.SKILL_IMPORTANCE.HIGH:
                            totalDurationPerSkill = (4 / skillsImportnceWeight) * auditionEdit.audition.auditionDuration;
                            break;
                        case ENUM.SKILL_IMPORTANCE.MUST:
                            totalDurationPerSkill = (5 / skillsImportnceWeight) * auditionEdit.audition.auditionDuration;
                            break;
                        default:
                            totalDurationPerSkill = 0;
                    };
                    // Get items randomly as long their total duration is less/equal from the weighted duration calculated
                    // for the current skill AND they were not already selected
                    let tempSelectedItems = [];
                    let actualDurationPerSkill = 0;
                    let foundRetry = 0;
                    let itemsFoundCount = 0;
                    let foundItemPerSkill = false;
                    let noMoreRelevantItems = false;
                    while ((actualDurationPerSkill < totalDurationPerSkill) && (!noMoreRelevantItems)) {
                        randomItem = itemsPerSkill[Math.floor(Math.random() * itemsPerSkill.length)];
                        let itemAlreadySelected = tempSelectedItems.indexOf(randomItem._id);
                        if (((randomItem.itemDuration + actualDurationPerSkill) <= totalDurationPerSkill) &&
                         (itemAlreadySelected === -1)) {
                            foundItemPerSkill = true;
                        } else {
                            // If the item doesn't satisfy the criteria, retry for x times to find proper item
                            while ((!foundItemPerSkill && (foundRetry <= 50)) && (itemsFoundCount < itemsPerSkill.length)) {
                                randomItem = itemsPerSkill[Math.floor(Math.random() * itemsPerSkill.length)];
                                let itemAlreadySelected = tempSelectedItems.indexOf(randomItem._id);
                                if (((randomItem.itemDuration + actualDurationPerSkill) <= totalDurationPerSkill) &&
                                 (itemAlreadySelected === -1)) {
                                    foundItemPerSkill = true;
                                } else {
                                    foundRetry++;
                                };
                            };
                        };
                        if (foundItemPerSkill) {
                            auditionItemArrayEntry = {itemId:randomItem._id, maxScore:0};
                            auditionEdit.audition.items.push(angular.copy(auditionItemArrayEntry));
                            actualDurationPerSkill += randomItem.itemDuration;
                            tempSelectedItems.push(randomItem._id);
                            // reset search indicators
                            itemsFoundCount++;
                            foundItemPerSkill = false;
                            foundRetry = 0;
                        };
                        if ((foundRetry > 50) || (itemsFoundCount >= itemsPerSkill.length)) {
                            noMoreRelevantItems = true;
                        }
                    };
                    // Calculate the items max-score and update the items summary panel accordingly
                    calculateItemsMaxScore();
                    auditionEdit.saveAudition();
                    calculateAuditionSummary();
                    auditionEdit.currentItem = {};
                }).catch(function(error) {
                    itemsPerSkill = [];
                });
                auditionEdit.dependency.changed();
                return true;
            });
        };

        auditionEdit.generateAudition = function () {
            auditionEdit.auditionGenerationOption = true;
            // Check that at least one skill has been defined for the campaign
            if (((auditionEdit.skills.length === 1) && (auditionEdit.skills[0].type === '')) || (auditionEdit.skills.length === undefined)) {
                showErrorMessage("The audition cannot be automatically generated. No skills have been defined for the campaign");
                return;
            };
            // Check that the audition's duration has been defined
            if (auditionEdit.audition.auditionDuration === 0) {
                showErrorMessage("The audition's duration must be defined");
                return;
            }
            // Alert that all existing challenges will be removed
            if (auditionEdit.audition.items.length > 0) {
                $UserAlerts.prompt(
                    "The current Audition’s version will be discard. Do you wish to proceed?",
                    ENUM.ALERT.INFO,
                    false,
                    function () {
                        generateAudition();                        
                    },
                    function () { 
                      return;
                    }
                )
            } else {
                generateAudition();
            };
        };

        auditionEdit.addChallenge = function () {
            auditionEdit.itemsAdded = false;
            auditionEdit.itemsFound = false;
            auditionEdit.addChallengeOption = true;
            auditionEdit.showCtsAreaAddChallenge = true;
            auditionEdit.searchItems = [];
            auditionEdit.addItems = [];
            addChallengeResetSelection ();
            clearAddBufferSummary();
        };

        auditionEdit.addChallengeClose = function () {
            auditionEdit.addChallengeOption = false;
            auditionEdit.showCtsAreaAddChallenge = false;
            clearAddBufferSummary();
        };

        auditionEdit.addChallengeSearch = function () {
            auditionEdit.itemsFound = false;
            auditionEdit.dependency.depend();
            // An author type has to be defined
            if (!auditionEdit.myChallenges &&
                !auditionEdit.communityChallenges &&
                !auditionEdit.domainExpertsChallenges) {
                showErrorMessage("Challenge author has to be defined");
                return;
            };
            // Skill has to be defined
            if (!auditionEdit.addChallengeSkills) {
                showErrorMessage("Challenge skill has to be defined");
                return;
            };
            // Set the Author Type selection criteria
            currentUser = Meteor.user()._id;
            if (auditionEdit.myChallenges) {
                authorTypeMyChallenges = currentUser;
            } else {
                authorTypeMyChallenges = {$ne: currentUser};
            };
            // Set the Comuunity Type (other recruiters) selection criteria
            if (auditionEdit.communityChallenges || auditionEdit.myChallenges) {
                authorTypeCommunityChallenges = ENUM.ITEM_AUTHOR_TYPE.RECRUITER;
            } else {
                authorTypeCommunityChallenges = {$ne: ENUM.ITEM_AUTHOR_TYPE.RECRUITER};
            };
            // Set the Complexity Type selection criteria
            if ((auditionEdit.addChallengeComplexity === '') || (auditionEdit.addChallengeComplexity === null) || (auditionEdit.addChallengeComplexity === undefined)) {
                complexityParam = {$ne: ""};
            } else {
                complexityParam = auditionEdit.addChallengeComplexity;
            };
            // Set the Template selection criteria
            if ((auditionEdit.addChallengeTemplate === '') || (auditionEdit.addChallengeTemplate === null) || (auditionEdit.addChallengeTemplate === undefined)) {
                templateIdParam = {$ne: ""};
            } else {
                let template = TemplatesCollection.findOne({name: auditionEdit.addChallengeTemplate});
                templateIdParam = template._id;
            };

            conditions = {$and:[{$and:[{authorId: authorTypeMyChallenges},{authorType: authorTypeCommunityChallenges}]},
                                {$or:[{status: ENUM.ITEM_STATUS.ASSIGNED},{status: ENUM.ITEM_STATUS.AVAILABLE}]},
                                {$text: {$search: auditionEdit.addChallengeSkills}},
                                {complexity: complexityParam},
                                {templateId: templateIdParam},
                                {shareInd: true}]};

            itemsPerAddChallenges = [];
            auditionEdit.searchItems = [];
            (new Promise((resolve, reject) => {
                Meteor.call('items.getItemsSummary', conditions, (err, res) => {
                    if (err) {
                        reject();
                    } else {
                        resolve(res);
                    }      
                });
            })).then(function(results){
                // All the items found as per the conditions
                itemsPerAddChallenges = results;
                // If no items have been found
                if ((itemsPerAddChallenges.length === 0) || (itemsPerAddChallenges.length === undefined)) {
                    showInfoMessage('No relevant challenges have been found');
                    return;
                };
                itemAlreadyInAudition = false;
                auditionItemArrayEntry = {};
                auditionEdit.itemsFound = true;
                auditionEdit.currentItem = {};
                itemsPerAddChallenges.every(function (singleItem) {
                    if (($filter('filter')(auditionEdit.audition.items, {itemId: singleItem._id}, true)[0]) ||
                        ($filter('filter')(auditionEdit.addItems, {itemId: singleItem._id}, true)[0])) {
                        itemAlreadyInAudition = true;
                    } else {
                        itemAlreadyInAudition = false;
                    };
                    auditionItemArrayEntry = {itemId:singleItem._id, itemAlreadyInAudition:itemAlreadyInAudition};
                    auditionEdit.searchItems.push(angular.copy(auditionItemArrayEntry));
                    return true;
                });
                auditionEdit.dependency.changed();
            }).catch(function(error) {
                itemsPerAddChallenges = [];
            });
        };

        function addChallengeResetSelection () {
            auditionEdit.myChallenges = true;
            auditionEdit.communityChallenges = true;
            auditionEdit.addChallengeSkills = "";
            auditionEdit.addChallengeComplexity = "";
            auditionEdit.addChallengeTemplate = "";
            auditionEdit.addChallengeContent = "";
        };

        auditionEdit.addChallengeReset = function () {
            addChallengeResetSelection ();
        };

        auditionEdit.addChallengeClear = function () {
            auditionEdit.addItems.every (function (itemToClear) {
                // Reset the selected item in the searchItems buffer
                index = auditionEdit.searchItems.findIndex(findItem => findItem.itemId == itemToClear);
                auditionEdit.searchItems[index].itemAlreadyInAudition = false;
                return true;
            });
            auditionEdit.addItems = [];
            auditionEdit.itemsAdded = false;
            clearAddBufferSummary();
        };

        auditionEdit.addChallengeAdd = function () {
            let auditionItemArrayEntry = {};
            auditionEdit.addItems.every (function (itemToAdd) {
                auditionItemArrayEntry = {itemId:itemToAdd, maxScore:0};
                auditionEdit.audition.items.push(angular.copy(auditionItemArrayEntry));
                return true;
            });
            calculateItemsMaxScore();
            auditionEdit.saveAudition();
            calculateAuditionSummary();

            if (auditionEdit.addItems.length === 1) {
                showInfoMessage(auditionEdit.addItems.length + ' challenge has been added to the audition');
            } else {
                showInfoMessage(auditionEdit.addItems.length + ' challenges were added to the audition');
            };

            auditionEdit.addChallengeClear();
        };

        function clearAddBufferSummary() {
            auditionEdit.addBufferSummery = {
                skills:[],
                total:0,
                time: auditionEdit.timeOffset
            };
            auditionEdit.skills.every(function (skill) {
                auditionEdit.addBufferSummery.skills[skill.type.toLowerCase()] = {
                    time: 0,
                };
                auditionEdit.complexityArray.every(function (complexity) {
                    auditionEdit.addBufferSummery.skills[skill.type.toLowerCase()][complexity] = 0;
                    auditionEdit.addBufferSummery[complexity] = 0;
                    auditionEdit.addBufferSummery.skills[skill.type.toLowerCase()].total = 0;
                    auditionEdit.addBufferSummery.skills[skill.type.toLowerCase()].time = auditionEdit.timeOffset;
                    return true;
                });
                return true;
            });
        };

        function calculateAddBufferSummary () {
            // Initialize the audition's summary table
            clearAddBufferSummary();

            auditionEdit.addItems.every(function (singleItem) {
                let item = auditionEdit.getItem(singleItem);

                let skillName = item.skill;
                try {
                    if (item.complexity === ENUM.EXPERIENCE.up1) {
                        auditionEdit.addBufferSummery.skills[skillName.toLowerCase()][ENUM.EXPERIENCE.up1]++;
                        auditionEdit.addBufferSummery[ENUM.EXPERIENCE.up1]++;
                    }
                    if (item.complexity === ENUM.EXPERIENCE.up2) {
                        auditionEdit.addBufferSummery.skills[skillName.toLowerCase()][ENUM.EXPERIENCE.up2]++;
                        auditionEdit.addBufferSummery[ENUM.EXPERIENCE.up2]++;
                    }
                    if (item.complexity === ENUM.EXPERIENCE.up3) {
                        auditionEdit.addBufferSummery.skills[skillName.toLowerCase()][ENUM.EXPERIENCE.up3]++;
                        auditionEdit.addBufferSummery[ENUM.EXPERIENCE.up3]++;
                    }
                    if (item.complexity === ENUM.EXPERIENCE.up4) {
                        auditionEdit.addBufferSummery.skills[skillName.toLowerCase()][ENUM.EXPERIENCE.up4]++;
                        auditionEdit.addBufferSummery[ENUM.EXPERIENCE.up4]++;
                    }
                    auditionEdit.addBufferSummery.skills[skillName.toLowerCase()].time += item.itemDuration.valueOf() - auditionEdit.timeOffset;
                    auditionEdit.addBufferSummery.time += item.itemDuration.valueOf() - auditionEdit.timeOffset;
                    auditionEdit.addBufferSummery.skills[skillName.toLowerCase()].total++;
                    auditionEdit.addBufferSummery.total++;
                }
                catch (e) {}

                auditionEdit.addBufferSummery.timeLeft = auditionEdit.audition.auditionDuration - auditionEdit.summery.time;
                return true;
            });
        };

        auditionEdit.addItemToBuffer = function (itemIdArg, indexArg) {
            // Check if the item is not already in the addItem buffer => meaning, that it has already been selected
            if (auditionEdit.addItems.indexOf(itemIdArg) !== -1) {
                showErrorMessage("The challenge has already been selected");
                return;
            };
            // Check if the item is not already part of the audition (already in the audition.items buffer)
            if ($filter('filter')(auditionEdit.audition.items, {itemId: itemIdArg}, true)[0]) {
                showErrorMessage("The challenge is already defined for the audition");
                return;
            };
            // Add the item to the selected items buffer
            auditionEdit.addItems.push(angular.copy(itemIdArg));
            auditionEdit.itemsAdded = true;
            // Indicate the selected item in the searchItems buffer
            auditionEdit.searchItems[indexArg].itemAlreadyInAudition = true;

            calculateAddBufferSummary();
        };

        auditionEdit.removeItemFromBuffer = function (itemIdArg) {
            // Remove the item from the selected items buffer
            let indexOfaddItems = auditionEdit.addItems.indexOf(itemIdArg);
            auditionEdit.addItems.splice(indexOfaddItems, 1);
            if (auditionEdit.addItems.length === 0) {
                auditionEdit.itemsAdded = false;
            };
            // Reset the selected item in the searchItems buffer
            index = auditionEdit.searchItems.findIndex(findItem => findItem.itemId == itemIdArg);
            auditionEdit.searchItems[index].itemAlreadyInAudition = false;

            calculateAddBufferSummary();
        };

        auditionEdit.previewAudition = function () {
            // Invoke the application process in a 'preview' mode to provide the recruiter with the ability
            // to preview the audition
            var vm = this;
            vm.howItWorkLang = 'eng';

            // Prepare an application. This is essential in order to have the Preview function
            // built on top of the application process.
            // (NOTE!!! - Keep this in-sync with the vm.applicationSave in campaignApplyMailCtrl.js)
            vm.application = {};
            vm.application.campaignId = vm.campaignId;
            vm.application.number = 'APL' + dbhService.getNextSequenceValue('application');
            vm.application.sessions = [];
            vm.application.control = {
                createDate: new Date(),
                status: ENUM.APPLICATION_STATUS.IN_WORK,
                companyOwner : 'DummyForPreview'
                // companyOwner : vm.audition.control.companyOwner /*zvika*/
            };
            // Invoke the Audition Execution process - this is done via the auditionExecute modal
            // NOTE!!! - Keep this in-sync with the vm.auditionExecute in campaignApplyMailCtrl.js
            vm.application.sessions = [];
            vm.application.sessions.push({
                date: (new Date()),
                states: vm.application.states ? vm.application.states : {}
            });

            $scope.auditionViewMode = ENUM.AUDITION_VIEW_MODE.PREVIEW;

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
                size: 'executeChallenge'
            });
        };
       
       
    });