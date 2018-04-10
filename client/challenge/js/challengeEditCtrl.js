angular
    .module('skillera')
    .controller('challengeEditCtrl', function($state,$stateParams,$scope,$window,$reactive,dbhService, $UserAlerts, $uibModal, ENUM, MAP) {

        var challengeEdit = this;
        $reactive(challengeEdit).attach($scope);
        $scope._ = _;

        challengeEdit.ENUM = ENUM;
        challengeEdit.complexityArray = [ENUM.EXPERIENCE.up1, ENUM.EXPERIENCE.up2, ENUM.EXPERIENCE.up3, ENUM.EXPERIENCE.up4];
        challengeEdit.automaticGeneration = false;
        challengeEdit.tbdFeature = true;

        if ($scope.challengeCreateMode === ENUM.CHALLENGE_CREATE_MODE.AUDITION) {
            // Get the auditonEdit controller
            var auditionEditCtrl = $scope.$resolve.auditionEditCtrl;
            challengeEdit.subsciptionOk = auditionEditCtrl.subsciptionOk;
            challengeEdit.modalInstance = auditionEditCtrl.modalInstance;

            challengeEdit.editItem = auditionEditCtrl.editItem;
            challengeEdit.editItemForCancel = auditionEditCtrl.editItemForCancel;
            challengeEdit.editTemplate = auditionEditCtrl.editTemplate;
         
            challengeEdit.skills = auditionEditCtrl.skills;
            challengeEdit.maxScore = auditionEditCtrl.maxScore;

            if (auditionEditCtrl.audition.status == ENUM.AUDITION_STATUS.AVAILABLE) {
                challengeEdit.externalDisabledTriger = true;
            };
        };
                   
        if ($scope.challengeCreateMode === ENUM.CHALLENGE_CREATE_MODE.POOL) {
            // Get the talent??? controller
        };


        function showInfoMessage(msgArg, callbackArg) {
            $UserAlerts.open(msgArg, ENUM.ALERT.INFO, true, callbackArg);
        };

        function showErrorMessage(msgArg) {
            $UserAlerts.open(msgArg, ENUM.ALERT.DANGER, true);
        };

        challengeEdit.isArray = function (value) {
            return angular.isArray(value);
        };

        challengeEdit.isString = function (value) {
            return typeof(value) !== "object" && String(value).toLowerCase() === "string";
        };

        challengeEdit.isNumber = function (value) {
            return typeof(value) !== "object" && String(value).toLowerCase() === "number";
        };

        challengeEdit.isBoolean = function (value) {
            return typeof(value) !== "object" && String(value).toLowerCase() === "boolean";
        };

        challengeEdit.isObject = function (value) {
            return typeof(value) === "object" && String(value).toLowerCase() !== "string" && String(value).toLowerCase() !== "number" && String(value).toLowerCase() !== "boolean";
        };

        challengeEdit.addToContentArray = function(keyArg1, keyArg2) {
            if (!challengeEdit.editItem.content[keyArg1]) {
                challengeEdit.editItem.content[keyArg1] = [];
                challengeEdit.editItem.content[keyArg2] = [];
            }
            challengeEdit.editItem.content[keyArg1].push('');
            challengeEdit.editItem.content[keyArg2].push('');
        };

        challengeEdit.removeFromContentArray = function(keyArg1, keyArg2) {
            if (challengeEdit.editItem.content[keyArg1]) {
                challengeEdit.editItem.content[keyArg1].splice(-1);
            }
            if (challengeEdit.editItem.content[keyArg2]) {
                challengeEdit.editItem.content[keyArg2].splice(-1);
            }
        };
     
        challengeEdit.getItem = function (itemIdArg) {
            return (function () {
                if (challengeEdit.editItem && itemIdArg === challengeEdit.editItem._id) {
                    return challengeEdit.editItem;
                }
                else {
                    return Items.findOne({_id:itemIdArg});
                }
            })();
        };
      
        challengeEdit.saveEditItem = function () {
            let tempId = challengeEdit.editItem._id;
            delete challengeEdit.editItem._id;
            Items.update({_id: tempId}, {$set: angular.copy(challengeEdit.editItem)});
            challengeEdit.editItem._id = tempId;
        };

        challengeEdit.registerEditItem = function () {
            console.log("Step into -> challengeEdit.registerEditItem function")
            if (!challengeEdit.editItem.skill) {
                showErrorMessage("The challenge's skill should be defined");
                return
            };
            if (!challengeEdit.editItem.complexity) {
                showErrorMessage("The challenge's complexity should be defined");
                return
            };
            if (challengeEdit.editItem.itemDuration === 0) {
                showErrorMessage("The challenge's duration should be defined");
                return
            };
            
            // Challenge content's checks according to the different templates
            switch (challengeEdit.editTemplate._id) {
                case "57f7a8406f903fc2b6aae39a" :
                    if (!challengeEdit.editItem.content.question) {
                        showErrorMessage("The challenge's question should be defined");
                        return
                    };
                    if ((!challengeEdit.editItem.content["1st Answer"] || challengeEdit.editItem.content["1st Answer"] && !challengeEdit.editItem.content["1st Answer"].answer) ||
                        (!challengeEdit.editItem.content["2nd Answer"] || challengeEdit.editItem.content["2nd Answer"] && !challengeEdit.editItem.content["2nd Answer"].answer) ||
                        (!challengeEdit.editItem.content["3rd Answer"] || challengeEdit.editItem.content["3rd Answer"] && !challengeEdit.editItem.content["3rd Answer"].answer) ||
                        (!challengeEdit.editItem.content["4th Answer"] || challengeEdit.editItem.content["4th Answer"] && !challengeEdit.editItem.content["4th Answer"].answer)) {
                        showErrorMessage("All answers should be defined");
                        return
                    };
                    let i=0;
                    challengeEdit.editItem.content["1st Answer"].correct ? i++ : i=i;
                    challengeEdit.editItem.content["2nd Answer"].correct ? i++ : i=i;
                    challengeEdit.editItem.content["3rd Answer"].correct ? i++ : i=i;
                    challengeEdit.editItem.content["4th Answer"].correct ? i++ : i=i;
                    if (i===0) {
                        showErrorMessage("The Challenge's correct answer should be defined");
                        return;
                    };
                    if (i>1) {
                        showErrorMessage("Only one correct answer can be defined for the challenge");
                        return;  
                    };
                    if (challengeEdit.editItem.content['image']) {
                        if ((!challengeEdit.editItem.content['image Width'] || challengeEdit.editItem.content['image Width'] === "" || challengeEdit.editItem.content['image Width'] === "0") ||
                            (!challengeEdit.editItem.content['image Height'] || challengeEdit.editItem.content['image Height'] === "" || challengeEdit.editItem.content['image Height'] === "0")) {
                            showErrorMessage("Please define a valid image size");
                            return;
                        };
                    };
                    break;

                case "57f7a8406f903fc2b6aae49a" :
                    if (!challengeEdit.editItem.content.question) {
                        showErrorMessage("The challenge's question should be defined");
                        return
                    };
                    if (!challengeEdit.editItem.content.answers || !challengeEdit.editItem.content.results) {
                        showErrorMessage("The challenge's answers and scores should be defined");
                        return;
                    };
                    if (challengeEdit.editItem.content.answers.length !== challengeEdit.editItem.content.results.length) {
                        showErrorMessage("The challenge's number of answers and scores should match");
                        return;
                    };
                    for (i=0; i < challengeEdit.editItem.content.results.length; i++) {
                        if ((challengeEdit.editItem.content.answers[i] === "") && (challengeEdit.editItem.content.results[i] === "")) {
                            showErrorMessage("The challenge can not have an empty answer");
                            return;
                        };
                        if ((challengeEdit.editItem.content.answers[i] === "") && (challengeEdit.editItem.content.results[i] !== "")) {
                            showErrorMessage("The challenge can not have an empty answer");
                            return;
                        };
                        if ((challengeEdit.editItem.content.answers[i] !== "") && (challengeEdit.editItem.content.results[i] === "")) {
                            showErrorMessage("All answers should be defined with score");
                            return;
                        };
                        if (challengeEdit.editItem.content.results[i] > 100) {
                            showErrorMessage("Answer's score can not be greater than 100");
                            return;
                        };
                        if (challengeEdit.editItem.content.results[i] < 0) {
                            showErrorMessage("Answer's score can not be less than 0");
                            return;
                        };
                    };
                    let answer100 = 0;
                    for (i=0; i < challengeEdit.editItem.content.results.length; i++) {
                        if (challengeEdit.editItem.content.results[i] === 100) {
                            answer100++;
                        };
                    };
                    if (answer100 === 0) {
                        showErrorMessage("An answer with a 100 score should be defined");
                        return;
                    };
                    if (answer100 > 1) {
                        showErrorMessage("Only one answer should have a 100 score");
                        return;
                    };
                    break;

                case "5814b536e288e1a685c7a451" :
                    if (!challengeEdit.editItem.content.question) {
                        showErrorMessage("The challenge's question should be defined");
                        return
                    };
                    if ((!challengeEdit.editItem.content['1st Button Text']) ||
                        (!challengeEdit.editItem.content['2nd Button Text']) ||
                        (challengeEdit.editItem.content['1st Button Score'] === null) ||
                        (challengeEdit.editItem.content['1st Button Score'] === undefined) ||
                        (challengeEdit.editItem.content['2nd Button Score'] === null) ||
                        (challengeEdit.editItem.content['2nd Button Score'] === undefined)) {
                        showErrorMessage("All challenge's buttons should be defined");
                        return;
                    };
                    if (((challengeEdit.editItem.content['1st Button Score']) && (challengeEdit.editItem.content['1st Button Score'] > 100)) ||
                        ((challengeEdit.editItem.content['2nd Button Score']) && (challengeEdit.editItem.content['2nd Button Score'] > 100))) {
                        showErrorMessage("Button's score can not be greater than 100");
                        return;
                    };
                    if ((challengeEdit.editItem.content['1st Button Score'] === 100) && (challengeEdit.editItem.content['2nd Button Score'] === 100)) {
                        showErrorMessage("Only one button's score should be equal to 100");
                        return;
                    };
                    if ((challengeEdit.editItem.content['1st Button Score'] !== 100) && (challengeEdit.editItem.content['2nd Button Score'] !== 100)) {
                        showErrorMessage("At least one button's score should be equal to 100");
                        return;
                    };
                    break;
            };

            if (challengeEdit.editItem.status === ENUM.ITEM_STATUS.NEW) {
                challengeEdit.editItem.status = ENUM.ITEM_STATUS.IN_WORK;
            };
            challengeEdit.saveEditItem();

            if (challengeEdit.modalInstance) {
                challengeEdit.modalInstance.close(ENUM.MODAL_RESULT.SAVE);
            };
        };

        challengeEdit.closeEditItem = function () {
            if (challengeEdit.modalInstance) {
                challengeEdit.modalInstance.close(ENUM.MODAL_RESULT.CLOSE);
            };
        };

        challengeEdit.cancelEditItem = function () {
            if (challengeEdit.editItem.status === ENUM.ITEM_STATUS.NEW) {
                Items.remove({_id:challengeEdit.editItem._id});
            }
            else {
                challengeEdit.editItem = challengeEdit.editItemForCancel;
                challengeEdit.saveEditItem();
            };

            if (challengeEdit.modalInstance) {
                challengeEdit.modalInstance.close(ENUM.MODAL_RESULT.CANCEL);
            };
        };

        challengeEdit.previewChallenge = function () {
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

            vm.auditionViewMode = ENUM.AUDITION_VIEW_MODE.PREVIEW;
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

        challengeEdit.correctAnswer = function (answerArg) {
            // Clear previous defined correct answer
            if (challengeEdit.editItem.content['1st Answer'] && challengeEdit.editItem.content['1st Answer'].correct) {
                challengeEdit.editItem.content['1st Answer'].correct = false;
            };
            if (challengeEdit.editItem.content['2nd Answer'] && challengeEdit.editItem.content['2nd Answer'].correct) {
                challengeEdit.editItem.content['2nd Answer'].correct = false;
            };
            if (challengeEdit.editItem.content['3rd Answer'] && challengeEdit.editItem.content['3rd Answer'].correct) {
                challengeEdit.editItem.content['3rd Answer'].correct = false;
            };
            if (challengeEdit.editItem.content['4th Answer'] && challengeEdit.editItem.content['4th Answer'].correct) {
                challengeEdit.editItem.content['4th Answer'].correct = false;
            };
            // Set the correct answer
            switch (answerArg) {
                case 1:
                    challengeEdit.editItem.content['1st Answer'].correct = true;
                    break;
                case 2:
                    challengeEdit.editItem.content['2nd Answer'].correct = true;
                    break;
                case 3:
                    challengeEdit.editItem.content['3rd Answer'].correct = true;
                    break;
                case 4:
                    challengeEdit.editItem.content['4th Answer'].correct = true;
                    break;
                default:
                    break;
            };
            // challengeEdit.saveEditItem();
        };

        // Store the recruiter's logo 
        loadImage = function (event) {
            var files = event.target.files;
            file = files[0];

            var dbx = new Dropbox.Dropbox({accessToken: ENUM.DROPBOX_API.TOKEN});
            dbx.filesUpload({
                path: '/img/challenge/' + file.name,
                contents: file
                })
                .then(function(response) {
                    challengeEdit.editItem.content['image'] = file.name;
                    dbx.filesGetThumbnail({
                        path: '/img/Challenge/' + file.name,
                        format: 'png',
                        size: 'w640h480'
                        })
                        .then(function(response) {
                            document.getElementById('viewImage').setAttribute("src", window.URL.createObjectURL(response.fileBlob));
                        })
                        .catch(function(error) {
                            console.log(error);
                    });
                })
                .catch(function(error) {
                     console.log(error);
            });
        };
        
        challengeEdit.viewImage = function () {
            console.log("image: ", challengeEdit.editItem.content['image'])
            if (challengeEdit.editItem.content['image']) {
              var dbx = new Dropbox.Dropbox({accessToken: ENUM.DROPBOX_API.TOKEN});
              dbx.filesGetThumbnail({
                  path: '/img/Challenge/' + challengeEdit.editItem.content['image'],
                  format: 'png',
                  size: 'w640h480'
                  })
                  .then(function(response) {
                      document.getElementById('viewImage').setAttribute("src", window.URL.createObjectURL(response.fileBlob));
                  })
                  .catch(function(error) {
                      console.log(error);
              });
            }; 
        };

        challengeEdit.removeImage = function () {
            challengeEdit.editItem.content['image'] = "";
            challengeEdit.editItem.content['image Width'] = "";
            challengeEdit.editItem.content['image Height'] = "";
            challengeEdit.editItem.content['image Float Right'] = "";
            document.getElementById('viewImage').setAttribute("src", "");
        };

     
    });
