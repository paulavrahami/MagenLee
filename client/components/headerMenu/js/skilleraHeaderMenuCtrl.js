angular
  .module('skillera')
  .controller('skilleraHeaderMenu', function($state,$scope,$reactive,$uibModal, ENUM) {

      let vm = this;
      $reactive(vm).attach($scope);

      /**
       * ReactiveContext;
       */
      vm.helpers({
          isLoggedIn() {
              return !!Meteor.userId();
          },
          currentUser() {
              return Meteor.user();
          },
          entitiesMenu() {

              let menu = {
                  prefix : '',
                  items: []
              };
              let type = (Meteor.user() && Meteor.user().profile) ? Meteor.user().profile.type : '';

              switch (type) {
                  case ENUM.USER.RECRUITER :
                      menu.items.push({
                          caption: 'My Campaigns',
                          link: 'recruiter.campaigns'
                      });
                      menu.items.push({
                          caption: 'My Auditions',
                          link: 'comingSoon'
                      });
                      menu.items.push({
                          caption: 'Marketplace',
                          link: 'comingSoon'
                      });
                      menu.items.push({
                          caption: 'Dashboard',
                          link: 'comingSoon'
                      });
                      break;
                  case ENUM.USER.TALENT :
                      menu.items.push({
                          caption: 'My Applications',
                          link: 'mainApplications'
                      });
                      menu.items.push({
                        caption: 'My Campaigns',
                        link: 'mainTalentCampaigns'
                      });
                      menu.items.push({
                          caption: 'Marketplace',
                          link: 'mainChallenges'
                      });
                      break;
                  case ENUM.USER.SYSTEM_ADMIN :
                      menu.items.push({
                          caption: 'Campaigns',
                          link: 'recruiter.campaigns'
                      });
                      menu.items.push({
                          caption: 'Recruiters',
                          link: 'systemAdmin.recruiter'
                      });
                      menu.items.push({
                          caption: 'Talents',
                          link: 'systemAdminTalents'
                      });
                      menu.items.push({
                          caption: 'Admin',
                          link: 'systemAdminUtilities'
                      });
                      break;
                  default :
                      menu.prefix = '';

              }
              return menu;
          }
      });
});
