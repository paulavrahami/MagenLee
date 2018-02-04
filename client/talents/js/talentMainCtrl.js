angular
    .module('skillera')
    .controller('talentMainCtrl', function($state,$scope,$reactive,dbhService, $UserAlerts, ENUM, MAP) {

        let vm = this;
        $reactive(vm).attach($scope);

        vm.animationsEnabled = true;
        vm.selectedStatus    = undefined;
        vm.orderBy           = 'lastName';
        vm.ENUM = ENUM;
        vm.MAP = MAP;

        vm.dependency = new Deps.Dependency();

        vm.subscribe('talents');
        vm.helpers({
            talents () {
                vm.dependency.depend();
                return vm.talents;
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
                let talents;
                let conditions = {};

                if (vm.selectedStatus) {
                    conditions = {status: vm.ENUM.TALENT_STATUS[vm.selectedStatus]};
                }
                else {
                    conditions = {status: {$ne: ENUM.TALENT_STATUS.CANCELED}}
                }

                Meteor.call('talents.getTalentsSummery', conditions, (err, res) => {
                    if (err) {
                        reject();
                    } else {
                        resolve(res);
                    }
                });

            })).then(function(results){
                vm.talents = results;
                vm.dependency.changed();
            }).catch(function(error) {
                vm.talents = [];
            });
        };

        
        /**
         * @desc display talent status filtering values
         * @returns {string}
         */
        vm.statusFilter = function (statusArg) {
              return statusArg
            };
        
        /**
         * @desc search (filter) Talents;
         * @param talentArg
         * @returns {boolean}
         */
        vm.search = function(talentArg){
            if (!vm.query) {
                return true;
            }
            else {
                let wordsString = '^(?=.*' + vm.query.toLowerCase().split(" ").join(')(?=.*') + ')';
                let testString  = (talentArg.firstName + ' ' + talentArg.lastName + ' ' + talentArg.email).toLowerCase();
                return (new RegExp(wordsString).test(testString));
            }
        };

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
         * By vm.changeSelectedStatus() we bring the Talents
         */
        vm.changeSelectedStatus(vm.selectedStatus);
    });