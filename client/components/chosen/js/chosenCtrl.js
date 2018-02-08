angular
    .module('skillera')
    .controller('chosenCtrl', function($state, $scope, $reactive) {

        let chosenCtrl = this;
        $reactive(chosenCtrl).attach($scope);
        chosenCtrl.dependency = new Deps.Dependency();
        chosenCtrl.idClass = 'chosen_' + Math.floor(Math.random() * 1073741824);
        chosenCtrl.chosenData=[];

        /**
         * @desc Few words about the ngChange. Because this is a component and
         * ngChange is triggered before the model update for isolate scope. The given ngChange
         * function cannot be set on the chosenCtrl HTML but must be fired manually within the code.
         */
        if (!chosenCtrl.ngChange) chosenCtrl.ngChange = function(){};

        if (!chosenCtrl.property)
            chosenCtrl.property = 'name';

        /**
         * @desc Create a key event to check if to add or not a new object to the data;
         */
        function checkForKeyUpHandler () {
            /** timeout is necessary because chosenCtrl may not complete to build the ui,
             *  250 milliseconds should be enough;
             */
            setTimeout(function() {
                let inputElement = $('.' + chosenCtrl.idClass + '+ div .chosenCtrl-search input');

                if (inputElement.length > 0) {

                    if (!inputElement.attr('eventKeyUpIsSet')) {
                        inputElement.on('keyup', function ($event) {

                            let doNotAdd = false;

                            /** In case the input value exists in the data; mark with doNotAdd; */
                            if (chosenCtrl.dataType === 'object') {
                                for (let index = 1; index < chosenCtrl.chosenData.length; index++) {
                                    if (chosenCtrl.chosenData[index][chosenCtrl.property] === $event.target.value) {
                                        doNotAdd = true;
                                        break;
                                    }
                                }
                            }
                            if (chosenCtrl.dataType === 'string') {
                                for (let index = 1; index < chosenCtrl.chosenData.length; index++) {
                                    if (chosenCtrl.chosenData[index] === $event.target.value) {
                                        doNotAdd = true;
                                        break;
                                    }
                                }
                            }

                            /** If the $$hashKey would not be remove angular will not know the data has changed; */
                            chosenCtrl.chosenData[0] = angular.copy(chosenCtrl.chosenData[0]);

                            if (doNotAdd) {
                                /** In case the input exists in the data; empty the temporary element; */
                                if (chosenCtrl.dataType === 'object')
                                    chosenCtrl.chosenData[0][chosenCtrl.property] = '';
                                if (chosenCtrl.dataType === 'string')
                                    chosenCtrl.chosenData[0] = '';
                            }
                            else {
                                /** In case the input dose not exists in the data; update the temporary element; */
                                if (chosenCtrl.dataType === 'object')
                                    chosenCtrl.chosenData[0][chosenCtrl.property] = $event.target.value;
                                if (chosenCtrl.dataType === 'string')
                                    chosenCtrl.chosenData[0] = $event.target.value;

                                chosenCtrl.ngModel = chosenCtrl.chosenData[0];
                            }

                            chosenCtrl.dependency.changed();
                            chosenCtrl.ngChange();
                        });
                        inputElement.attr('eventKeyUpIsSet', true);
                    }
                }
            }, 250);
        }

        chosenCtrl.$onChanges = function () {

            /** @desc Check of the data data type */
            if (chosenCtrl.data && chosenCtrl.data.length) {
                if (typeof(chosenCtrl.data[0]) === 'string' || chosenCtrl.data[0] instanceof String) {
                    chosenCtrl.dataType = 'string';
                }
                if (typeof(chosenCtrl.data[0]) === 'object' || chosenCtrl.data[0] instanceof Object) {
                    chosenCtrl.dataType = 'object';
                }

                /** Don't mess with the original data */
                chosenCtrl.chosenData = _.clone(chosenCtrl.data);

                /** The first element in the data is 'our' temporary element; */
                if (chosenCtrl.dataType === 'object') {
                    chosenCtrl.chosenData.unshift(
                        JSON.parse('{"' + chosenCtrl.property +'":""}')
                    );
                }
                if (chosenCtrl.dataType === 'string') {
                    chosenCtrl.chosenData.unshift('');
                }

                $('.' + chosenCtrl.idClass).trigger('chosenCtrl:updated');
            }
            checkForKeyUpHandler();
        };

        //noinspection JSUnusedLocalSymbols
        $scope.$watch('chosenCtrl.ngModel', function (newValueArg, oldValueArg) {

            if (chosenCtrl.ngModel || chosenCtrl.ngModel === '' ) {
                /**
                 * @desc In case the model dose not exists in the data, add it!!!;
                 */
                (function() {

                    let addFromModel = true;

                    if (chosenCtrl.dataType === 'object') {
                        for (let index = 0; index < chosenCtrl.chosenData.length; index++) {
                            if (chosenCtrl.chosenData[index][chosenCtrl.property] === chosenCtrl.ngModel[chosenCtrl.property]) {
                                addFromModel = false;
                                break;
                            }
                        }
                    }
                    if (chosenCtrl.dataType === 'string') {
                        for (let index = 0; index < chosenCtrl.chosenData.length; index++) {
                            if (chosenCtrl.chosenData[index] === chosenCtrl.ngModel) {
                                addFromModel = false;
                                break;
                            }
                        }
                    }

                    if (addFromModel) {
                        chosenCtrl.chosenData[0] = chosenCtrl.ngModel;
                    }
                    chosenCtrl.ngChange();
                })();

                /**
                 * @desc Because the ngModel will not come out of the data, chosenCtrl will not find it and
                 * will not show the ngModel. So, if the ngModel[chosenCtrl.property] is found in the data[x][chosenCtrl.property],
                 * make the specific location in the data be the ngModel.
                 */
                (function () {
                    if (chosenCtrl.ngModel && chosenCtrl.dataType === 'object') {
                        for (let index = 0; index < chosenCtrl.chosenData.length; index++) {
                            if (chosenCtrl.chosenData[index][chosenCtrl.property] === chosenCtrl.ngModel[chosenCtrl.property]) {
                                chosenCtrl.chosenData[index] = chosenCtrl.ngModel;
                                break;
                            }
                        }
                    }
                    /**
                     * @desc If the ng-model is a string angular doesn't know it has change
                     * so update the chosenCtrl input with the value
                     */
                    if ((chosenCtrl.ngModel || chosenCtrl.ngModel === '' ) && chosenCtrl.dataType === 'string') {
                        let inputElement = $('.' + chosenCtrl.idClass + ' + div a.chosenCtrl-single span');

                        inputElement.text(chosenCtrl.ngModel);
                    }
                    chosenCtrl.dependency.changed();
                })();
            }
            checkForKeyUpHandler();
        });
    });
