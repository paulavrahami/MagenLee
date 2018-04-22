angular
    .module('skillera')
    .controller('statusBarCtrl', function($state,$scope,$reactive,$uibModal, ENUM) {

        let statusBar = this;
        $reactive(statusBar).attach($scope);

        statusBar.dependency = new Deps.Dependency();

        statusBar.subscribe('applications', () => [], {
            onReady: function () {
                statusBar.dependency.changed();
            },
            onError: function () {
                console.log("onError", arguments);
            }
        });

        statusBar.getProgress = function () {

            if (statusBar.ngModel.status === ENUM.CAMPAIGN_STATUS.PUBLISHED) {

                let pastDate = (new Date(statusBar.ngModel.statusDate)).valueOf();
                let nowDate = (new Date()).valueOf();

                let pastTime = nowDate - pastDate;

                return parseFloat(Math.min(pastTime / ((statusBar.ngModel.duration * 86400000) / 100), 100).toFixed(4));
            }
            else {
                return 0;
            }
        };
        /**
         * ReactiveContext;
         */
        statusBar.helpers({
            getClass () {
                statusBar.dependency.depend();
                let campaign = statusBar.ngModel;

                let progress = statusBar.getProgress();

                let progressTopApplicants = 0;

                if (campaign.applicationsSuccess > campaign.topApplicant) {
                    progressTopApplicants = campaign.topApplicant;
                }
                else {
                    progressTopApplicants = campaign.applicationsSuccess
                }

                if (campaign.status === ENUM.CAMPAIGN_STATUS.PUBLISHED && progress < 100) {

                    if (progress > 60 && (progressTopApplicants / campaign.topApplicant < progress / 100)) {
                        return 'progress-bar-warning';
                    }

                    return 'progress-bar-info';
                }
                else if (campaign.status === ENUM.CAMPAIGN_STATUS.PUBLISHED && progress === 100) {

                    if (campaign.applicationsSuccess < campaign.topApplicant) {
                        return 'progress-bar-danger';
                    }
                    else {
                        return 'progress-bar-success';
                    }
                }
                else {
                    return '';
                }
            },
            getText () {
                statusBar.dependency.depend();

                let text = '';
                let campaign = statusBar.ngModel;
                let currentTopApplicants = 0;
                if (campaign.applicationsSuccess > campaign.topApplicant) {
                    currentTopApplicants = campaign.topApplicant;
                }
                else {
                    currentTopApplicants = campaign.applicationsSuccess
                }

                let infoString = `${currentTopApplicants}/${campaign.topApplicant} Top Applicants - ${campaign.applicationsSuccess} Passed`;
                let progress = statusBar.getProgress();

                if (progress > 0 && progress < 100) {
                    text += `Running... ${infoString}`;
                }
                else if (progress === 0) {
                    text += '';
                }
                else {
                    text += `(Completed) ${infoString}`;
                }
                return text;
            },
            isRunning () {
                statusBar.dependency.depend();
                let progress = statusBar.getProgress();

                return (statusBar.ngModel.status === ENUM.CAMPAIGN_STATUS.PUBLISHED && progress > 0 && progress < 100);
            }
        });

        $scope.$onChanges = function (event, toState, toParams, fromState, fromParams, options){
        };



    });
