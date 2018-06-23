// Controler for external execution of an campaign apply main

angular
    .module('skillera')
    .controller('CampaignApplyMainCtrl', function($state,$stateParams,$scope,$filter,$window,$reactive,dbhService,$promiser,$uibModal,campaignrecord,moment,utilsService,$UserAlerts,ENUM) {

        var vm = this;
        $reactive(vm).attach($scope);
        vm.dependency = new Deps.Dependency();
        vm.campaignId = $stateParams.id;
        vm.applicationId = $stateParams.aid;

        vm.now = moment();
        vm.currentDate = new Date();
        vm.howItWorkLang = 'eng';
        vm.hoverEdit = false;

        $window._noAudition = true;
        $window._auditionCompleted = false;

        /**
         * @desc show a dialog with the message;
         * @param msgArg
         * @param callbackArg
         */
        function showErrorMessage(msgArg, callbackArg) {
            $UserAlerts.open(msgArg, ENUM.ALERT.DANGER, true, callbackArg);
        }
        function showInfoMessage(msgArg, callbackArg) {
            $UserAlerts.open(msgArg, ENUM.ALERT.INFO, true, callbackArg);
        }

        vm.onSubscription = function () {

            if (vm.subscriptionCampaignOk &&
                vm.subscriptionApplicationOk &&
                vm.subscriptionAuditionOk &&
                vm.subscriptionItemsOk &&
                vm.subscriptionCompaniesOk &&
                vm.subscriptionUsersOk) {

                vm.subscriptionOk = true;

                vm.audition = Auditions.findOne({_id: vm.campaign.auditionId});

                vm.createApplication();

                Meteor.call('client.getIp', {}, (err, res) => {
                    if (err) {
                        console.log(err);
                    } else {
                        vm.application.clientAddress = res;
                    }
                });

                var logoFile = Companies.findOne({name: vm.audition.control.companyOwner}).companyLogoId;
                var dbx = new Dropbox.Dropbox({accessToken: ENUM.DROPBOX_API.TOKEN});
                dbx.filesGetThumbnail({
                    path: '/img/logo/' + logoFile,
                    format: 'png',
                    size: 'w64h64'
                    })
                    .then(function(response) {
                        document.getElementById('viewCompanyLogo').setAttribute("src", window.URL.createObjectURL(response.fileBlob));
                    })
                    .catch(function(error) {
                        console.log(error);
                });
                
                vm.dependency.changed();
            }
        };

        vm.subscribe('items', () => [], {
            onReady: function () {
                vm.subscriptionItemsOk = true;
                vm.onSubscription();
            },
            onError: function () {
                console.log("onError", arguments);
            }
        });

        vm.subscribe('allCampaigns', () => [], {
            onReady: function () {
                vm.subscriptionCampaignOk = true;

                /** Get the campaign and subscribe Users */
                vm.campaign = Campaigns.findOne({_id: vm.campaignId});
                vm.subscribe('specificUser', () => [vm.campaign.control.owner], {
                    onReady: function () {
                        vm.subscriptionUsersOk = true;
                        vm.onSubscription();
                    },
                    onError: function () {
                        console.log("onError", arguments);
                    }
                });

                vm.onSubscription();
            },
            onError: function () {
                console.log("onError", arguments);
            }
        });
        vm.subscribe('applications', () => [], {
            onReady: function () {
                vm.subscriptionApplicationOk = true;
                vm.onSubscription();
            },
            onError: function () {
                console.log("onError", arguments);
            }
        });
        vm.subscribe('allAuditions', () => [], {
            onReady: function () {
                vm.subscriptionAuditionOk = true;
                vm.onSubscription();
            },
            onError: function () {
                console.log("onError", arguments);
            }
        });
        vm.subscribe('companies', () => [], {
            onReady: function () {
                vm.subscriptionCompaniesOk = true;
                vm.onSubscription();
            },
            onError: function () {
                console.log("onError", arguments);
            }
        });

        vm.createApplication = function () {
            let fromLocalStorage = localStorage.getItem("skillera");

            if (fromLocalStorage) {
                fromLocalStorage = JSON.parse(fromLocalStorage);

                if (fromLocalStorage[vm.audition._id]) {
                    vm.applicationId = fromLocalStorage[vm.audition._id];
                }
            }
            // audition retry (continue from the point the talent has stopped)
            if (vm.applicationId) {
                vm.application = Applications.findOne({_id:vm.applicationId});
                // load an array with all items to be executed. Items will be removed from this array when executed/visited. By the end of the 
                // audition's execution we'll know what items were not touched at all
                vm.itemsNotDone = [];
                for (let i = 0; i < vm.audition.items.length ; i++) {
                    vm.itemsNotDone[i] = vm.audition.items[i].itemId;
                };
                // remove from the 'items not done' table the items which were already executed
                for (let contentIndex in vm.application.states.itemsContent) {
                    if (vm.application.states.itemsContent.hasOwnProperty(contentIndex)) {
                        let indexOf = vm.itemsNotDone.indexOf(contentIndex);
                        if (indexOf !== -1) {
                            vm.itemsNotDone.splice(indexOf, 1);
                        };
                    }
                }
            }
            if (!vm.application) {
                vm.application = {};

                vm.application.campaignId = vm.campaignId;
                vm.application.number = 'APL' + dbhService.getNextSequenceValue('application');
                vm.application.sessions = [];

                vm.application.control = {
                    origin: ENUM.APPLICATION_ORIGIN.TALENT,
                    createDate: new Date(),
                    status: ENUM.APPLICATION_STATUS.IN_WORK,
                    statusDate: new Date(),
                    companyOwner : vm.audition.control.companyOwner
                };

                vm.application.resolutionStatus = "";
                vm.application.feedbackEmployed = "";
                vm.application.feedbackProfessional ="";
                vm.application.feedbackPersonal = "";
                vm.application.feedbackOrganization ="";

                // New application record, no user information yet

                Applications.insert(vm.application, function (errorArg, tempIdArg) {
                    if (errorArg) {
                        showErrorMessage(errorArg.message);
                    } else {
                        vm.applicationId = tempIdArg;

                        // load an array with all items to be executed. Items will be removed from this array when executed/visited. By the end of the 
                        // audition's execution we'll know what items were not touched at all
                        vm.itemsNotDone = [];
                        for (let i = 0; i < vm.audition.items.length ; i++) {
                            vm.itemsNotDone[i] = vm.audition.items[i].itemId;
                        };
                    }
                });
            } else {
                if (vm.application.control.status === ENUM.APPLICATION_STATUS.SENT_TO_TALENT) {
                    vm.application.control.status = ENUM.APPLICATION_STATUS.IN_WORK;
                    vm.application.control.statusDate = vm.currentDate;
                    delete vm.application._id;
                    Applications.update({_id: vm.applicationId}, {$set: vm.application});
                    vm.application._id = vm.applicationId;
                };
            };
        };

        vm.helpers({

        });

        vm.applicationSave = function (itemsContentsArg, numberOfItemsArg) {
            //todo: score should be calculate at server side
            let totScore = 0;
            let currentItem ={};

            vm.application.states.itemsContent = vm.application.states.itemsContent || {};

            for (let contentIndex in vm.application.states.itemsContent) {
                if (vm.application.states.itemsContent.hasOwnProperty(contentIndex)) {
                    
                    let currentItem = $filter('filter')(vm.audition.items, {itemId: contentIndex}, true)[0];

                    let itemScore = 0;
                    itemScore = (currentItem.maxScore / 100) * parseInt(vm.application.states.itemsContent[contentIndex].state.validity ? vm.application.states.itemsContent[contentIndex].state.validity + '' : '0');
                    vm.application.states.itemsContent[contentIndex].state.score = itemScore;
                    vm.application.states.itemsContent[contentIndex].state.maxScore = currentItem.maxScore;
                    totScore += itemScore;

                    // If the item has been executed/visited it should be dropped from the "vm.itemsNotDone" array.
                    // This array will be evaluated at the time the audition is done in order to add to the application
                    // states the unexecuted items. This will make statistics and scoring calculations accurate
                    let indexOf = vm.itemsNotDone.indexOf(contentIndex);
                    if (indexOf !== -1) {
                        vm.itemsNotDone.splice(indexOf, 1);
                    };
                }
            }

            vm.application.grade = totScore;

            delete vm.application._id;
            Applications.update({_id: vm.applicationId},{$set: vm.application});
            vm.application._id = vm.applicationId;

            let fromLocalStorage = JSON.parse(localStorage.getItem("skillera") || '{}');
            fromLocalStorage[vm.audition._id] = vm.applicationId;
            localStorage.setItem('skillera', JSON.stringify(fromLocalStorage));
        };

        vm.auditionDone = function (itemsContentsArg, numberOfItemsArg) {

            vm.applicationSave(itemsContentsArg, numberOfItemsArg);

            // add an empty entry to the application's state for each unexecuted/visited item.
            // See also vm.applicationSave and vm.createApplication
            if (vm.itemsNotDone.length !== 0) {
                for (i = 0 ; i < vm.itemsNotDone.length ; i++) {
                    let emptyState = {clicks: 0, validity: 0, answer: "", score: 0, maxScore: 0};
                    let itemNotDone = {};
                    let emptyItem = {};
                    let currentItem = {};

                    itemNotDone = Items.findOne({_id: vm.itemsNotDone[i]});
                    emptyItem = itemNotDone.content;
                    currentItem = $filter('filter')(vm.audition.items, {itemId: vm.itemsNotDone[i]}, true)[0];
                    emptyState.maxScore = currentItem.maxScore;
                    emptyItem.state = emptyState;
                    vm.application.states.itemsContent[vm.itemsNotDone[i]] = emptyItem;
                };
            };

            delete vm.application._id;
            Applications.update({_id: vm.applicationId},{$set: vm.application});
            vm.application._id = vm.applicationId;

            let fromLocalStorage = JSON.parse(localStorage.getItem("skillera") || '{}');
            fromLocalStorage[vm.audition._id] = vm.applicationId;
            localStorage.setItem('skillera', JSON.stringify(fromLocalStorage));

            $scope.campaignId = vm.campaignId;
            $scope.applicationId = vm.applicationId;

            vm.modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'client/apply/view/campaignApplyInformation.html',
                controller: 'CampaignApplyInformationCtrl',
                controllerAs: 'vm',
                scope: $scope,
                keyboard: false,
                backdrop: 'static',
                size: 'lg'
            });
        };

        vm.english = function () {

            vm.howItWorkLang = 'eng';
        };

        vm.hebrew = function () {

            vm.howItWorkLang = 'heb';
        };

        vm.hoverIn = function(){
          vm.hoverEdit = true;
        };

        vm.hoverOut = function(){
          vm.hoverEdit = false;
        };

        vm.auditionExecute = function () {

            function loadModal () {

                if (!vm.application.sessions) {
                    vm.application.sessions = [];
                }
                vm.application.sessions.push({
                    date: (new Date()),
                    states: vm.application.states ? vm.application.states : {}
                });

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
            }
            //* do not allow an applicant to re-execute the audition in case it has been already
            //* completed. This value is set in the campaignApplyInformationCtrl
            if ($window._auditionCompleted === true) {
                let msg = "Your "+vm.campaign.positionName+" application has already been submitted";
                $UserAlerts.open(
                    msg,
                    ENUM.ALERT.DANGER);
                return;
            };

            if (vm.application && vm.application.states && vm.application.states.itemsContent) {
                $UserAlerts.open(
                    "We have noticed that you already started this audition. The audition will be resumed from the very last spot you left it",
                    ENUM.ALERT.INFO,
                    false,
                    loadModal);
            }
            else {
                loadModal();
            }
        }
        

    });