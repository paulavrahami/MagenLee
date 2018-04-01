
angular
    .module('skillera')
    .controller('AuditionExecuteCtrl', function($state,$stateParams,$window, moment, $scope,$reactive,$UserAlerts,ENUM, $promiser, $http,$sce,$uibModal,$uibModalInstance) {
        $scope.trust = $sce.trustAsHtml;
        let vm = this;
        $reactive(vm).attach($scope);
        $window.auditionExecuteCtrl = vm;
      
        vm.moment = moment;
        vm.itemsKeys = [];
        vm.doneItemsKeys = [];

        vm.auditionViewModeResultsTalent = $scope.auditionViewModeResultsTalent;
        vm.auditionViewMode = $scope.auditionViewMode;
        vm.auditionViewMode === ENUM.AUDITION_VIEW_MODE.RESULTS ? vm.auditionViewDisabled = true : vm.auditionViewDisabled = false;
        vm.auditionViewMode === ENUM.AUDITION_VIEW_MODE.RESULTS ? vm.auditionViewResults = true : vm.auditionViewResults = false;

        //noinspection JSUnresolvedVariable
        vm.dependency = new Deps.Dependency();

        vm.pseudoFunction = function () {
            vm.dependency.changed();
        };
        vm.onContent = vm.pseudoFunction;
        
        if ($scope.$resolve && $scope.$resolve.auditionId) {
            vm.auditionId = $scope.$resolve.auditionId;
            vm.applicationCtrl = $scope.$resolve.applicationCtrl;
            vm.howItWorkLang = vm.applicationCtrl.howItWorkLang;
            // In preview/results view mode do not use previous navigation info and rest the states table
            vm.auditionViewMode === ENUM.AUDITION_VIEW_MODE.PREVIEW ? vm.states = {} : vm.states = vm.applicationCtrl.application.states || {};
            vm.applicationCtrl.application.states = vm.states;

            /**
             * Handle/Save all application process on the application object for
             * audition resume / audition replay etc...
             */

            let timeGap = 0;

            if (vm.states.startTime) {
                timeGap = (new Date()).valueOf() - vm.states.startTime;
            }

            vm.states.itemsContent       = vm.states.itemsContent || {};
            vm.states.startTime          = vm.states.startTime + timeGap || (new Date()).valueOf();
            // vm.states.timerIsOn          = vm.states.timerIsOn || false;
            vm.states.timerIsOn          = false;
            vm.auditionViewMode === ENUM.AUDITION_VIEW_MODE.RESULTS ? vm.states.currentItem = 0 : 
                                                                      (vm.states.currentItem = vm.states.currentItem || 0);
            vm.states.percentageComplete = vm.states.percentageComplete || 0;
            vm.countAnswer = vm.countAnswer || 0;
            vm.states.isRequestBreak     = false; //vm.states.isRequestBreak ||
            vm.states.isOnBreak          = false; //vm.states.isOnBreak ||
            vm.auditionViewMode === ENUM.AUDITION_VIEW_MODE.RESULTS ? vm.states.isExecuteIntro = false : 
                                                                      vm.states.isExecuteIntro = true;
            vm.states.isShowControls     = vm.states.isShowControls || false;
            // vm.states.timeOut            = vm.states.timeOut || false;
            vm.auditionViewMode === ENUM.AUDITION_VIEW_MODE.RESULTS ? vm.states.timeOut = false :
                                                                     (vm.states.timeOut = vm.states.timeOut || false);
            /** counters */
            vm.states.hintCount          = vm.states.hintCount || 2;
            vm.states.fiftyFiftyCount    = vm.states.fiftyFiftyCount || 2;
            vm.states.breakCount         = vm.states.breakCount || 2;
            /**
             * timeTarget and timeLeft will be calculated int loadAudition
            vm.states.timeTarget         = vm.states.timeTarget || 0;
            vm.states.timeLeft           = vm.states.timeLeft || vm.states.startTime;
             */
        }

        /**
         * @desc Each second save the application states;
         * @type {number}
         */
        vm.timerHandler = setInterval(function () {

            if (vm.states.timerIsOn) {
                let currentTime = (new Date()).valueOf();
                vm.states.timeLeft = vm.states.timeLeft - (currentTime - vm.states.startTime);
                vm.states.startTime = currentTime;

                if (vm.onContent === vm.pseudoFunction) {
                    Meteor.skillera.requestContent(vm.executeItem);
                }

                if (vm.states.timeLeft <= vm.states.timeTarget) {
                    vm.states.timeOut = true;
                    clearInterval(vm.timerHandler);
                }
                // if (vm.states.timeLeft <= vm.states.timeTarget - 5000) {
                //     clearInterval(vm.timerHandler);
                //     vm.done();
                // }

                vm.dependency.changed();
            }

            if (vm.auditionViewMode) {
                if (vm.onContent === vm.pseudoFunction) {
                    Meteor.skillera.requestContent(vm.executeItem);
                };
                vm.dependency.changed();
            }

        }, 1000);

        /**
         * @desc Wait for subscriptions;
         */
        vm.onSubscription = function () {

            if (vm.subscriptionAuditionOk &&
                vm.subscriptionItemsOk) {
                vm.subscriptionOk = true;

                vm.loadAudition ();
                vm.dependency.changed();
            }
        };

        vm.subscribe('allAuditions', () => [], {
            onReady: function () {
                vm.subscriptionAuditionOk = true;
                vm.onSubscription();
            },
            onError: function () {
                console.log("onError", arguments);
            }
        });
        vm.subscribe('items', () => [], {
            onReady: function () {
                vm.subscriptionItemsOk = true;
                vm.onSubscription();
            },
            onError: function () {
                console.log("onError", arguments);
            }
        });

        /**
         * Set lagage of text to either Hebrew or English
         */
        vm.english = function () {
            vm.howItWorkLang = 'eng';
          };

        vm.hebrew = function () {
          vm.howItWorkLang = 'heb';
        };


        vm.scrollIntoView = function () {
            if (vm.states.currentItem !== vm.lastScrollIntoView) {
                vm.lastScrollIntoView = vm.states.currentItem;
                let currentExecute = $(".current-execute")[0];
                if (currentExecute) currentExecute.scrollIntoView();
            }
        };

        vm.isItemHasExecuted = function (itemIdArg) {

            return vm.doneItemsKeys.indexOf(itemIdArg) > -1;
        };

        /**
         * @desc Prepare the audition for the auditionExecute.js
         */
        vm.loadAudition = function () {
            $window._audition = Auditions.findOne({_id: vm.auditionId});
            vm.numberOfItems = $window._audition.items.length;
            vm.itemsKeys = $window._audition.items;
            vm.doneItemsKeys = Object.keys(vm.states.itemsContent);
            vm.states.currentItem = vm.states.currentItem > $window._audition.items.length - 1 ?
                $window._audition.items.length - 1 :
                vm.states.currentItem;
            vm.executeItem = $window._audition.items[vm.states.currentItem].itemId;

            //let time = new Date($window._audition.auditionDuration);
            let time = $window._audition.auditionDuration / 1000;

            let H = Math.floor(time / 3600),
                M = Math.floor(((time % 3600) + 60) / 60 - 1),
                S = time % 60;

            // let H = time.getHours(),
            //     M = time.getMinutes(),
            //     S = time.getSeconds();
            //
             if (!vm.states.timeLeft) {
                vm.states.timeLeft = time * 1000;
            }
            if (!vm.states.timeTarget) {
                vm.states.timeTarget = vm.states.timeLeft - (H * 3600 + M * 60 + S * 1) * 1000;
            }

            // build the item's totals table. This info will be presented while the audition is displayed in "Results" mode 
            if (vm.auditionViewMode === ENUM.AUDITION_VIEW_MODE.RESULTS) {
                // initialize the totals table
                vm.totalsPerItem = [];
                for (let i=0 ; i<$window._audition.items.length ; i++) {
                    vm.totalsPerItem.push({itemId: $window._audition.items[i].itemId,
                                           totalCorrect: 0,
                                           totalWrong: 0,
                                           totalNotAnswered: 0
                    });
                };
                // get the campaign the audition has been defined for
                let campaignRec = Campaigns.findOne({_id: $window._audition.campaignId});
                // for all the campaign's applications:
                campaignRec.applications.every(function (applicationKey) {
                    // get an application
                    let applicationRec = Applications.findOne({_id: applicationKey})
                    // for all application's items:
                    for (let contentIndex in applicationRec.states.itemsContent) {
                        // search the item in the totals table
                        index = vm.totalsPerItem.findIndex(itemTotals => itemTotals.itemId === contentIndex);
                        // update the totals table
                        if (applicationRec.states.itemsContent[contentIndex].state.validity === 100) {
                            vm.totalsPerItem[index].totalCorrect++;
                        } else {
                            if ((applicationRec.states.itemsContent[contentIndex].state.validity < 100) && (applicationRec.states.itemsContent[contentIndex].state.clicks !== 0)) {
                            vm.totalsPerItem[index].totalWrong++;
                            } else {
                                if (applicationRec.states.itemsContent[contentIndex].state.clicks === 0) {
                                    vm.totalsPerItem[index].totalNotAnswered++;
                                }
                            }
                        }
                    };
                return true
                });
            };
            $window.loadAudition();
        };

        vm.displayItemTotalsCorrect = function (itemKey) {
            if (vm.auditionViewMode === ENUM.AUDITION_VIEW_MODE.RESULTS) {
                index = vm.totalsPerItem.findIndex(itemTotals => itemTotals.itemId === itemKey);
                return vm.totalsPerItem[index].totalCorrect;
            };
        };

        vm.displayItemTotalsWrong = function (itemKey) {
            if (vm.auditionViewMode === ENUM.AUDITION_VIEW_MODE.RESULTS) {
                index = vm.totalsPerItem.findIndex(itemTotals => itemTotals.itemId === itemKey);
                return vm.totalsPerItem[index].totalWrong;
            };
        };

        vm.displayItemTotalsNotAnswered = function (itemKey) {
            if (vm.auditionViewMode === ENUM.AUDITION_VIEW_MODE.RESULTS) {
                index = vm.totalsPerItem.findIndex(itemTotals => itemTotals.itemId === itemKey);
                return vm.totalsPerItem[index].totalNotAnswered;
            };
        };
        
        vm.correctAnswer = function (itemKey) {
            if (vm.auditionViewModeResultsTalent) {
                if (vm.applicationCtrl.application.states.itemsContent[itemKey].state.validity === 100) {
                    return true;
                } else {
                    if (vm.applicationCtrl.application.states.itemsContent[itemKey].state.validity < 100) {
                        return false;
                    };
                };
            };
        }; 

        /**
         * @desc Go to item;
         */
        vm.goToItem = function (itemIndexArg) {

            if (vm.states.currentItem !== parseInt(itemIndexArg)) {
                vm.states.timerIsOn = false;

                vm.onContent = function () {
                    Meteor.skillera.requestTerminate(vm.executeItem);
                    vm.states.currentItem = parseInt(itemIndexArg);
                    vm.states.currentItem = Math.min(vm.states.currentItem, $window._audition.items.length - 1);
                    vm.executeItem = $window._audition.items[vm.states.currentItem].itemId;

                    if (vm.states.isRequestBreak) {
                        vm.states.breakCount--;
                        vm.startBreak();
                    }
                    vm.states.isShowControls = false;
                    vm.dependency.changed();
                };
                Meteor.skillera.requestContent(vm.executeItem);
            }
        };
        /**
         * @desc Go to next item;
         */
        vm.nextItem = function () {

            if (vm.states.currentItem !== $window._audition.items.length - 1) {
                vm.states.timerIsOn = false;

                vm.onContent = function () {
                    Meteor.skillera.requestTerminate(vm.executeItem);
                    vm.states.currentItem++;
                    vm.states.currentItem = Math.min(vm.states.currentItem, $window._audition.items.length - 1);
                    vm.executeItem = $window._audition.items[vm.states.currentItem].itemId;

                    if (vm.states.isRequestBreak) {
                        vm.states.breakCount--;
                        vm.startBreak();
                    }
                    vm.states.isShowControls = false;
                    vm.dependency.changed();
                };
                Meteor.skillera.requestContent(vm.executeItem);
            }
        };

        /**
         * @desc Go to previous item;
         */
        vm.previousItem = function () {

            if (vm.states.currentItem !== 0) {
                vm.states.timerIsOn = false;

                vm.onContent = function () {
                    Meteor.skillera.requestTerminate(vm.executeItem);
                    vm.states.currentItem--;
                    vm.states.currentItem = Math.max(vm.states.currentItem, 0);
                    vm.executeItem = $window._audition.items[vm.states.currentItem].itemId;

                    if (vm.states.isRequestBreak) {
                        vm.states.breakCount--;
                        vm.startBreak();
                    }
                    vm.states.isShowControls = false;
                    vm.dependency.changed();
                }
            }
            Meteor.skillera.requestContent(vm.executeItem);
        };

        /**
         * @desc Handle hint request;
         */
        vm.requestHint = function () {

            vm.onContent = function () {
                if (vm.states.hintCount > 0 && !vm.states.itemsContent[vm.executeItem].hintCount) {
                    vm.states.hintCount--;
                    Meteor.skillera.requestCommand('hint', vm.executeItem);

                    vm.states.itemsContent[vm.executeItem].hintCount =
                        vm.states.itemsContent[vm.executeItem].hintCount === undefined ? 1 :
                        vm.states.itemsContent[vm.executeItem].hintCount + 1;

                    vm.dependency.changed();
                }
            };
            if (vm.states.hintCount > 0 && vm.executeItemConfig.enabled.hint) {
                Meteor.skillera.requestContent(vm.executeItem);
            }
        };

        /**
         * @desc Start break at the next/previous item;
         */
        vm.requestBreak = function () {

            if (vm.states.breakCount > 0 && !vm.states.isRequestBreak) {
                vm.states.isRequestBreak = true;
            }
        };

        /**
         * @desc Cancel break at the next/previous item;
         */
        vm.unRequestBreak = function () {

            vm.states.isRequestBreak = false;
        };

        /**
         * @desc End break immediately;
         */
        vm.requestEndBreak = function () {
            vm.breakTimeLeft = 0;
        };

        /**
         * @desc Start the Audition after selecting <Start> on the intro page;
         */
        vm.requestStartAudition = function () {
            vm.states.isExecuteIntro = false;
            vm.states.startTime = (new Date()).valueOf();
            vm.auditionViewMode ? vm.states.timerIsOn = false : vm.states.timerIsOn = true;
        };

        /**
         * @desc Start 5 min. break;
         */
        vm.startBreak = function () {

            vm.states.isOnBreak = true;
            vm.states.timerIsOn = false;
            vm.states.isRequestBreak = false;

            vm.breakStartTime = (new Date()).valueOf();
            vm.breakTimeLeft  = 300000;

            Meteor.skillera.requestCommand('pause', vm.executeItem);

            /**
             * Count down the break time and end the break in timeout;
             * @type {number}
             */
            vm.breakHandler = setInterval(function () {
                let currentTime = (new Date()).valueOf();
                vm.breakTimeLeft = vm.breakTimeLeft - (currentTime - vm.breakStartTime);
                vm.breakStartTime = currentTime;

                if (vm.breakTimeLeft <= 0) {
                    clearInterval(vm.breakHandler);

                    vm.states.isOnBreak = false;
                    vm.auditionViewMode ? vm.states.timerIsOn = false : vm.states.timerIsOn = true;

                    vm.states.startTime = (new Date()).valueOf();

                    Meteor.skillera.requestCommand('resume', vm.executeItem);
                }
                vm.dependency.changed();
            }, 1000)
        };

        vm.clickDone = function () {

            if ((vm.numberOfItems !== vm.doneItemsKeys.length) && !vm.auditionViewMode){
                $UserAlerts.prompt(
                    "You haven't complete the audition. Are you sure you want to finish it?",
                    ENUM.ALERT.INFO,
                    false,
                    function(){
                        vm.done();
                    });
            }
            else {
                vm.done();
            }
        };

        /**
         * @desc End the audition and go to application information;
         */
        vm.done = function () {

            clearInterval(vm.timerHandler);
            clearInterval(vm.breakHandler);
         
            vm.onContent = function () {

                if (vm.onContentTimer) {
                    clearTimeout(vm.onContentTimer);
                }
                if (!vm.auditionViewMode) {
                    vm.applicationCtrl.auditionDone(vm.states.itemsContent, $window._audition.items.length);
                };
            };
            vm.onContentTimer = setTimeout(vm.onContent, 3000);
            Meteor.skillera.requestContent(vm.executeItem);

            $uibModalInstance.close();
        };

        /**
         * @desc When content arrives from the item do some calculations,
         *       Update the content and save the application;
         * @param itemIdArg
         * @param contentArg
         */
        vm.setContent = function (itemIdArg, contentArg) {

            let countAnswer = 0;

            if (vm.states.itemsContent[itemIdArg]) {

                if (vm.states.itemsContent[itemIdArg].hintCount)
                    contentArg.hintCount = vm.states.itemsContent[itemIdArg].hintCount;
            }

            vm.states.itemsContent[itemIdArg] = contentArg;
            vm.doneItemsKeys = [];

            for (let index in vm.states.itemsContent) {
                if (vm.states.itemsContent.hasOwnProperty(index)) {
                    if (vm.states.itemsContent[index].state.clicks > 0) {
                        countAnswer++;
                        vm.doneItemsKeys.push(index);
                    }
                }
            }
            if (countAnswer !== 0)
                vm.states.percentageComplete =  (100 / (vm.numberOfItems / countAnswer)).toFixed(2);
                vm.countAnswer = countAnswer;
            vm.states.isShowControls = true;

            if (!vm.auditionViewMode) {
                vm.applicationCtrl.applicationSave(vm.states.itemsContent, $window._audition.items.length);
            };

            vm.onContent();
            vm.onContent = vm.pseudoFunction;
        };

        /**
         * @desc When configuration arrives from the item;
         * @param itemIdArg
         * @param contentArg
         */
        vm.setConfiguration = function (itemIdArg, configuratonArg) {

            vm.executeItemConfig = configuratonArg;
        };

        /**
         * @desc Get an Item content to send to the Item. Ask form the DB if
         *       it's the first time we run this Item, otherwise return what we have;
         * @param itemIdArg
         * @returns {*}
         */
        vm.getContent = function (itemIdArg) {
            vm.scrollIntoView();
            vm.states.timerIsOn = !vm.states.isOnBreak && !vm.states.isExecuteIntro && !vm.auditionViewMode;
            vm.states.startTime = (new Date()).valueOf();

            if (!vm.states.itemsContent[itemIdArg]) {
                vm.states.itemsContent[itemIdArg] = Items.findOne({_id: itemIdArg
                }).content;
            }
            return vm.states.itemsContent[itemIdArg];
        };

        /**
         * @desc Return the Item url to be loaded in the IFrame;
         * @param auditionItemIdArg
         * @param templateIdArg
         * @returns {string}
         */
        vm.getAuditionItemSkillType = function (auditionItemIdArg) {
            return Items.findOne(auditionItemIdArg).skill;
        };
        vm.getAuditionItemSrc = function (auditionItemIdArg, templateIdArg) {
            return '/iframeTemplate/' + auditionItemIdArg + '/' + templateIdArg;
        };
        vm.getAuditionHtml = function (auditionItemIdArg, templateIdArg) {
            let auditionItemId = auditionItemIdArg;
            let auditionChallengeId = templateIdArg;
            let challengeTemplate = TemplatesCollection.findOne({_id:auditionChallengeId});

            let templateHtml = ``;

            switch (templateIdArg) {
                case "57f7a8406f903fc2b6aae39a" :
                    templateHtml += `<link rel="stylesheet" href="{{auditionItemUrl}}/css/MultipleChoiceSimple.css">`;
                    templateHtml += `<script type="text/javascript">`;
                    // templateHtml += `let audition1 = new Meteor.AuditionItemApi("${auditionItemId}");`;
                    templateHtml += `let multipleChoiceSimpleCtrl = new Meteor.MultipleChoiceSimpleCtrl("${auditionItemId}");`;
                    // templateHtml += `audition1.addEventListener('content', multipleChoiceSimpleCtrl.onRequestContent);`;
                    // templateHtml += `audition1.addEventListener('initialize', multipleChoiceSimpleCtrl.onInit);`;
                    // templateHtml += `audition1.addEventListener('results', multipleChoiceSimpleCtrl.onRequestResults);`;
                    // templateHtml += `audition1.addEventListener('command', multipleChoiceSimpleCtrl.onRequestCommand);`;
                    // templateHtml += `audition1.declareLoaded();`;
                    templateHtml += `</script>`;
                    templateHtml += `<div id="multipleChoiceSimple">{{auditionItemUrl}}</div>`;
                    break;
                case "57f7a8406f903fc2b6aae49a" :
                    templateHtml += `<link rel="stylesheet" href="{{auditionItemUrl}}/css/MultipleChoice.css">`;
                    templateHtml += `<script type="text/javascript">`;
                    // templateHtml += `let audition2 = new Meteor.AuditionItemApi("${auditionItemId}");`;
                    templateHtml += `let multipleChoiceCtrl = new Meteor.MultipleChoiceCtrl("${auditionItemId}");`;
                    // templateHtml += `audition2.addEventListener('content', multipleChoiceCtrl.onRequestContent);`;
                    // templateHtml += `audition2.addEventListener('initialize', multipleChoiceCtrl.onInit);`;
                    // templateHtml += `audition2.addEventListener('results', multipleChoiceCtrl.onRequestResults);`;
                    // templateHtml += `audition2.addEventListener('command', multipleChoiceCtrl.onRequestCommand);`;
                    // templateHtml += `audition2.declareLoaded();`;
                    templateHtml += `</script>`;
                    templateHtml += `<div id="multipleChoice">{{auditionItemUrl}}</div>`;
                    break;
                case "5814b536e288e1a685c7a451" :
                    templateHtml += `<link rel="stylesheet" href="{{auditionItemUrl}}/css/TrueFalse.css">`;
                    templateHtml += `<script type="text/javascript">`;
                    // templateHtml += `let audition3 = new Meteor.AuditionItemApi("${auditionItemId}");`;
                    templateHtml += `let trueFalseCtrl = new Meteor.TrueFalseCtrl("${auditionItemId}");`;
                    // templateHtml += `audition3.addEventListener('content', trueFalseCtrl.onRequestContent);`;
                    // templateHtml += `audition3.addEventListener('initialize', trueFalseCtrl.onInit);`;
                    // templateHtml += `audition3.addEventListener('results', trueFalseCtrl.onRequestResults);`;
                    // templateHtml += `audition3.addEventListener('command', trueFalseCtrl.onRequestCommand);`;
                    // templateHtml += `audition3.declareLoaded();`;
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
         * @desc Return the templateId that will build the item;
         * @param ItemIdArg
         */
        vm.getTemplateId = function (ItemIdArg) {
            return Items.findOne({_id:ItemIdArg}).templateId;
        };

        /**
         * ReactiveContext;
         */
        vm.helpers({
            /**
             * @desc Retrieve the audition for some UI;
             * @returns {*}
             */
            audition () {
                vm.dependency.depend();

                if (vm.subscriptionAuditionOk) {
                    $window._audition = Auditions.findOne({_id: vm.auditionId});

                    return $window._audition;
                }
                return false;
            },
            /**
             * @desc retrieve Meteor.user;
             * @returns {Meteor.user}
             */
            currentUser() {
                return Meteor.user();
            }
        });
    }).filter('showTime', function() {
    return function(timeValueArg) {

        let dateTime = new Date(timeValueArg);

        let H = '0' + dateTime.getHours();
        let M = '0' + dateTime.getMinutes();
        let S = '0' + dateTime.getSeconds();

        H = H.substr(H.length % 2, 2);
        M = M.substr(M.length % 2, 2);
        S = S.substr(S.length % 2, 2);

        return H + ':' + M + ':' + S;
    }
}).filter('showBreakTime', function() {
    return function(timeValueArg) {

        let dateTime = new Date(timeValueArg);

        let M = '0' + dateTime.getMinutes();
        let S = '0' + dateTime.getSeconds();

        M = M.substr(M.length % 2, 2);
        S = S.substr(S.length % 2, 2);

        return M + ':' + S;
    }
}).filter('times', function(){
    return function(value){
        return _.times(value || 0);
    }
});
