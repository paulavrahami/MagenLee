//import angular from 'angular';
//import angularMeteor from 'angular-meteor';
//import uiRouter from 'angular-ui-router';
//import 'bootstrap/dist/css/bootstrap.css';

//import { Meteor } from 'meteor/meteor';

//angular.module('brgo', ['angularMeteor','ui.router','ui.bootstrap']);
//angular.module('brgo', ['angularMeteor','uiRouter','ui.bootstrap']);

//function onReady() {
//  angular.bootstrap(document, ['brgo'], {
//    strictDi: true
//  });

//}

//if (Meteor.isCordova)
//  angular.element(document).on("deviceready", onReady);
//else
//  angular.element(document).ready(onReady);

import angular from 'angular';
import angularMeteor from 'angular-meteor';
import angularBootstrap from 'angular-ui-bootstrap';
import angularUiRouter from 'angular-ui-router';
import angularPromiser from 'angular-meteor-promiser';
import 'angular-filter';
//import date manipuation packages
import 'angular-moment';
import 'angular-chosen-localytics';
import 'ngclipboard';
import uiMask from 'angular-ui-mask';

//import uiRouter from 'angular-ui-router';
//import 'bootstrap/dist/css/bootstrap.css';

//import { Meteor } from 'meteor/meteor';

//angular.module('brgo', ['angularMeteor','ui.router','ui.bootstrap']);
//angular.module('brgo', [angularMeteor, 'ui.router','accounts.ui','ui.bootstrap']);
function inIframe () {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}
if (!inIframe()) {
    angular.module(
        'brgo',
        [angularMeteor, angularUiRouter, 'ngclipboard', 'angularMoment', 'accounts.ui', 'angular.filter', uiMask, angularBootstrap, angularPromiser, 'localytics.directives']);
}
else {
    angular.module(
        'brgo',
        [angularMeteor, angularUiRouter, angularBootstrap, angularPromiser]);
}

    function onReady() {
        angular.bootstrap(document, ['brgo'], {
            strictDi: true
        });

    }

    Accounts.ui.config({
        passwordSignupFields: "USERNAME_AND_EMAIL"
    });

    if (Meteor.isCordova)
        angular.element(document).on("deviceready", onReady);
    else
        angular.element(document).ready(onReady);

