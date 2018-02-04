angular
  .module('skillera')
  .config(routerConfig);

/** @ngInject */
/* Domain Expert routing */
function routerConfig($stateProvider) {
  $stateProvider
    .state('campaignApply', {
      url:'/campaignApply/:id',
      templateUrl: 'client/apply/view/campaignApplyMain.html',
      resolve:{
        campaignrecord: function ($promiser) {
                      "use strict";
                    //  return $promiser.subscribe ('auditions');
                    //subscribe('auditions');
                    },
         },
      controller: 'CampaignApplyMainCtrl',
      params: {
        id: null,
        aid: null,
        mode: null
      },
      controllerAs: 'vm'
    })
    // .state('campaignApplyInformation', {
    //   url:'/CampaignApplyInformation/:id',
    //   templateUrl: 'client/apply/campaignApplyInformation.html',
    //   controller: 'CampaignApplyInformationCtrl',
    //   params: {
    //     id: null,
    //     aid: null
    //   },
    //   controllerAs: 'vm'
    // })
    // .state('campaignApplyThankYou', {
    //   url:'/CampaignThankYou/',
    //   templateUrl: 'client/apply/campaignApplyThankYou.html',
    //   controller: 'CampaignApplyThankYouCtrl',
    //   params: {
    //     applicant: null,
    //     position: null,
    //     number: null,
    //     company: null
    //   },
    //   controllerAs: 'vm'
    // })
    // .state('campaignAuditionExec', {
    //   url:'/CampaignAuditionExec/:id/:cid/:aid',
    //   templateUrl: 'client/apply/campaignApplyAudExec.html',
    //   controller: 'CampaignApplyAudExecCtrlCtrl',
    //   controllerAs: 'vm'
    // })
}
