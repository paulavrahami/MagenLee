/**
 * Created by itaym on 07/09/2016.
 */
angular
    .module('skillera')
    .controller('MessageModalCtrl', function($state,$scope,$reactive,$uibModalInstance) {

        $reactive(this).attach($scope);

        $.each($scope.$resolve,
            /**
             * @desc Populate 'resolve' params to use in templates and also does a great thing,
             *       it binds as params the $state, $scope, $uibModalInstance in case the param
             *       is function which gives it the ability to act as if it is part of the controller;
             * @param keyArg
             * @param valueArg
             */
            function(keyArg, valueArg) {
                $scope[keyArg] = valueArg;

                if ($scope[keyArg] instanceof Function) {
                    $scope[keyArg] = $scope[keyArg].bind(null, $state,$scope,$uibModalInstance);
                }
            });

        /**
         * @desc close the modal on 'ok';
         */
    });
