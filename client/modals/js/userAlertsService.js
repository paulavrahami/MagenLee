/**
 * Created by itaym on 07/09/2016.
 */

/**
 * @method [open]
 *          @param msgArg, typeArg, isAnimationArg, okCallbackArg
 * @method [prompt]
 *          @param msgArg, typeArg, isAnimationArg, okCallbackArg, cancelCallbackArg
 *
 * msgArg   :           The message to show the user;
 * typeArg  :           ENUM.ALERT.SUCCESS | ENUM.ALERT.INFO | ENUM.ALERT.WARNING | ENUM.ALERT.DANGER;
 * isAnimationArg       Enable or disable animation;
 * okCallbackArg?       function to be executed when the user clicks the OK button.
 * cancelCallbackArg?   function to be executed when the user clicks the CANCEL button or press ESC;
 */

/**
 * @constructor
 * @param $uibModal
 * @param ENUM
 */
function $UserAlerts ($uibModal, ENUM) {

    this.uibModal = $uibModal;
    this.ENUM = ENUM;
}

//noinspection JSUnusedGlobalSymbols
$UserAlerts.prototype = {

    /**
     *
     * @param msgArg
     * @param typeArg
     * @param isAnimationArg
     * @param okCallbackArg
     * @param cancelCallbackArg
     * @param templateArg
     * @private
     */
    _show : function (msgArg, typeArg, isAnimationArg, okCallbackArg, cancelCallbackArg, templateArg) {

        let alertClassName = null;

        switch (typeArg) {

            case this.ENUM.ALERT.SUCCESS : alertClassName = 'alert-success'; break;
            case this.ENUM.ALERT.INFO    : alertClassName = 'alert-info';    break;
            case this.ENUM.ALERT.WARNING : alertClassName = 'alert-warning'; break;
            case this.ENUM.ALERT.DANGER  : alertClassName = 'alert-danger';  break;

            default:
                alertClassName = 'alert-info';
        }

        let modalInstance = this.uibModal.open({
            animation: !!isAnimationArg,
            templateUrl: templateArg,
            controller: 'MessageModalCtrl',
            keyboard: false,
            backdrop: 'static',
            resolve: {
                message: function (){
                    return msgArg;
                },
                alertClassName: function () {
                    return alertClassName;
                },
                ok: function () {
                    return function($state,$scope,$uibModalInstance) {
                        $uibModalInstance.close();
                    };
                },
                cancel: function () {
                    return function($state,$scope,$uibModalInstance) {
                        $uibModalInstance.dismiss('cancel');
                    };
                }
            },
            size: 'md'
        });

        /**
         * bootstrap ui promise;
         */
        modalInstance.result.then(
            /** success */
            function () {
                if (okCallbackArg instanceof Function) {
                    okCallbackArg();
                }
            },
            /** cancel */
            function () {
                if (cancelCallbackArg instanceof Function) {
                    cancelCallbackArg();
                }
            }
        );
    },
    /**
     *
     * @param msgArg
     * @param typeArg
     * @param isAnimationArg
     * @param okCallbackArg
     * @param cancelCallbackArg
     */
    open : function (msgArg, typeArg, isAnimationArg, okCallbackArg, cancelCallbackArg) {
        this._show(msgArg, typeArg, isAnimationArg, okCallbackArg, cancelCallbackArg, 'client/modals/view/alert.html');
    },
    /**
     *
     * @param msgArg
     * @param typeArg
     * @param isAnimationArg
     * @param okCallbackArg
     * @param cancelCallbackArg
     */
    prompt : function (msgArg, typeArg, isAnimationArg, okCallbackArg, cancelCallbackArg) {
        this._show(msgArg, typeArg, isAnimationArg, okCallbackArg, cancelCallbackArg, 'client/modals/view/prompt.html');
    }
};

/**
 * @desc create the service;
 */
angular
    .module('brgo')
    .service('$UserAlerts', ['$uibModal', 'ENUM', function ($uibModal, ENUM) {

        return new $UserAlerts($uibModal, ENUM);
    }]);