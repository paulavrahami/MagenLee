angular
    .module('skillera')
    .controller('skilleraHeader', function($state,$scope,$reactive,$uibModal, ENUM) {

        var vm = this;
        $reactive(vm).attach($scope);

        vm.animationsEnabled = true;
        vm.emailuser = '';
        vm.password = '';

        vm.helpers({
            isLoggedIn() {
                return !!Meteor.userId();
            },
            currentUser() {
                return Meteor.user();
            }
        });

        /**
         * @desc Meteor sign-in
         */
        vm.signIn = function () {

            Meteor.loginWithPassword(vm.emailuser, vm.password,
                vm.$bindToContext((err) => {
                    if (err) {
                        vm.error = err;
                        alert(vm.error);
                    }
                    else {
                        switch (Meteor.user().profile.type) {
                            case ENUM.USER.RECRUITER :
                                $state.go(ENUM.PROFILE_STATES.RECRUITER);
                                break;
                            case ENUM.USER.APPLICANT :
                                $state.go(ENUM.PROFILE_STATES.APPLICANT);
                                break;
                            case ENUM.USER.DOMAIN_EXPERT :
                                $state.go(ENUM.PROFILE_STATES.DOMAIN_EXPERT);
                                break;
                            case ENUM.USER.TALENT :
                                $state.go(ENUM.PROFILE_STATES.TALENT);
                                break;
                            default:
                                $state.go('app');
                        }
                    }
                })
            );
        };

        /**
         * @desc goto new registration;
         */
        vm.registration = function () {

            $state.go("newRegistration");
        };

        vm.update = function () {

            //noinspection JSUnresolvedFunction
            var currentUser = Accounts.user();

            switch (currentUser.profile.type) {
                case 'Applicant' :
                    $state.go('applicantRegistration');
                    break;
                case 'Talent'   :
                    $state.go('talentRegistration');
                    break;
                case 'Recruiter' :
                    $state.go('recruiterRegistration');
                    break;
                case 'Temp-Recruiter' :
                    $state.go('recruiterRegistration');
                    break;
                case "DomainExpert" :
                    $state.go('domainExpertRegistration');
                    break;
            }
        };

        vm.changePassword = function () {

            //noinspection JSUnresolvedFunction
            var currentUser = Accounts.user();

            switch (currentUser.profile.type) {
                case 'Applicant' :
                    $state.go('applicantRegistration');
                    break;
                case 'Recruiter' :
                    $state.go('passwordChange');
                    break;
                case 'Temp-Recruiter' :
                    $state.go('passwordChange');
                    break;
                case "DomainExpert" :
                    $state.go('domainExpertRegistration');
                    break;
                case 'Talent' :
                    $state.go('passwordChange');
                    break;
            }
        };

        vm.logout = function () {
            Meteor.logout(function () {
            $state.go('app');
            // vm.close();
            });
        }

    });
