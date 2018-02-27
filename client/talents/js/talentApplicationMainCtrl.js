angular
  .module('skillera')
  .controller('TalentCtrl', function($state,$scope,$reactive,dbhService, $UserAlerts, ENUM, MAP) {

    var vm = this;
    let reactiveContext = $reactive(vm).attach($scope);

    vm.animationsEnabled = true;
    vm.isViewThumbnails  = true;
    vm.selectedStatus    = undefined;
    vm.orderBy           = 'positionName';
    vm.ENUM = ENUM;
    vm.MAP = MAP;
    vm.numOfApplications = 0;
    vm.campaignTemp = {};

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


    function doSubscription () {
      
                  if (Meteor.user() && Meteor.user().profile) {
                      reactiveContext.subscribe('applicationsByEmail', () => [Meteor.user().emails[0].address]);
                  }
              }
    /**
     * ReactiveContext;
     */
    vm.helpers({
        
        campaigns () {
            vm.dependency.depend();
            doSubscription ();
            return vm.campaigns;
        },
        /**
         * @desc retrieve Meteor.user;
         * @returns {Meteor.user}
         */
        currentUser() {
            return Meteor.user();
        },
        applications () {
          vm.dependency.depend();

          (new Promise((resolve, reject) => {
            let applications;
            let conditions = {};
            conditions = {"email": Meteor.user().emails[0].address,"fraudType": ENUM.APPLICATION_FRUAD_TYPE.NONE,"control.status": ENUM.APPLICATION_STATUS.COMPLETED};

            Meteor.call('applications.getApplicationsSummary', conditions, (err, res) => {
                if (err) {
                    reject();
                } else {
                    resolve(res);
                }
            });
        })).then(function(results){
            vm.applications = results;
            
            vm.dependency.changed();
        }).catch(function() {
            vm.applications = [];
        });
                              
          return vm.applications;
      }
    });

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

});
