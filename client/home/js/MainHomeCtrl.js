angular
    .module('skillera')
    .controller('MainHomeCtrl', function($state,$stateParams, $scope,$reactive,$uibModal, ENUM) {

        let vm = this;
        $reactive(vm).attach($scope);

        vm.talentType = $stateParams.type;

        vm.signup = {};

        vm.talentSignUpType = '';

        vm.helpers({
            isLoggedIn() {
                return !!Meteor.userId();
            },
            currentUser() {
                return Meteor.user();
            },
            isSignedUp () {
                setTimeout(function () {
                    if (Meteor.userId() && Meteor.user() && Meteor.user().profile) {
                        switch (Meteor.user().profile.type) {
                            case ENUM.USER.RECRUITER :
                                //$state.go(ENUM.PROFILE_STATES.RECRUITER);
                                $state.transitionTo(ENUM.PROFILE_STATES.RECRUITER, null, {location:"replace"});
                                //window.location = "/campaigns";
                                break;
                            case ENUM.USER.APPLICANT :
                                $state.go(ENUM.PROFILE_STATES.APPLICANT);
                                break;
                            case ENUM.USER.DOMAIN_EXPERT :
                                $state.go(ENUM.PROFILE_STATES.DOMAIN_EXPERT);
                                break;
                            default:
                                $state.go('app');
                        }
                    }
                },500);
            }
        });

        /**
         * @desc In case of doing Talent signin up, based on the option clicked on the home page
         * Talent or Domain Expert) route to the appropriate page after registration
         */

        vm.talentTypeRoute = function(type) {
            vm.talentType = type;
        };


        /**
         * @desc When going to Recruiter Main, decide to which page to route the user
         */
        vm.recruiterRoute = function() {

            if (Meteor.userId()=== null) {
                $state.go("recruiter.commcandidates");
            } else {
                if (Meteor.user().profile.type =='Recruiter'){
                    $state.go("recruiter.campaigns");
                } else {
                    $state.go("recruiter.commcandidates");
                }
            }
        };

        // When going to Domain Expert Main, decide to which page to route the user

        vm.domainExpertRoute = function() {

            if (Meteor.userId()=== null) {
                $state.go("domainExpert.commauditions");
            } else {
                if (Meteor.user().profile.type =='DomainExpert'){
                    $state.go("domainExpert.auditions");
                } else {
                    $state.go("domainExpert.commauditions");
                }
            }
        };

        vm.signIn = function () {

            Meteor.loginWithPassword(vm.emailuser, vm.password,
                vm.$bindToContext((err) => {
                    if (err) {
                        vm.error = err.message;
                        // alert(vm.error);
                    }
                    else {
                        $('#modal-id').modal('toggle'); //Hide the modal dialog
                        $('.modal-backdrop').remove(); //Hide the backdrop
                        $("body").removeClass( "modal-open" ); //Put scroll back on the Body

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
                            case ENUM.USER.SYSTEM_ADMIN :
                                $state.go(ENUM.PROFILE_STATES.RECRUITER);
                                break;
                            default:
                                $state.go('app');
                        }
                    }
                })
            );
        };

        // -- Main landing page navigation --
        // Closes the sidebar menu
        $("#menu-close").click(function(e) {
            e.preventDefault();
            $("#sidebar-wrapper").toggleClass("active");
        });
        // Opens the sidebar menu
        $("#menu-toggle").click(function(e) {
            e.preventDefault();
            $("#sidebar-wrapper").toggleClass("active");
        });
        // Scrolls to the selected menu item on the page
        $(function() {
            $('a[href*=#]:not([href=#],[data-toggle],[data-target],[data-slide])').click(function() {
                if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') || location.hostname == this.hostname) {
                    var target = $(this.hash);
                    target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
                    if (target.length) {
                        $('html,body').animate({
                            scrollTop: target.offset().top
                        }, 100);
                        return false;
                    }
                }
            });
        });
        //#to-top button appears after scrolling
        var fixed = false;
        $(document).scroll(function() {
            if ($(this).scrollTop() > 250) {
                if (!fixed) {
                    fixed = true;
                    // $('#to-top').css({position:'fixed', display:'block'});
                    $('#to-top').show("fast", function() {
                        $('#to-top').css({
                            position: 'fixed',
                            display: 'block'
                        });
                    });
                }
            } else {
                if (fixed) {
                    fixed = false;
                    $('#to-top').hide("fast", function() {
                        $('#to-top').css({
                            display: 'none'
                        });
                    });
                }
            }
        });
    });
