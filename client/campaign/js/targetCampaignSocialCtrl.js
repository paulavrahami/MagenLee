angular
   .module('skillera')
   .controller('targetCampaignSocial', function($state, $scope, $reactive, $UserAlerts, ENUM, dbhService, $uibModal, $uibModalInstance) {
      var vm = this;
      $reactive(vm).attach($scope);
      vm.displayLinkedInActivityLog = false;
      vm.dependency = new Deps.Dependency();
      vm.campaign = $scope.campaign;
      vm.campaign.published = vm.campaign.status == ENUM.CAMPAIGN_STATUS.PUBLISHED;
      // Default LinkedIn post data
      var linkedInPostComment = "e.g., We are hiring!";
      var linkedInPostTitle = vm.campaign.positionName;
      var linkedInPostDescription = vm.campaign.description;
      vm.linkedInPostComment = linkedInPostComment;
      vm.linkedInPostTitle = linkedInPostTitle;
      vm.linkedInPostDescription = linkedInPostDescription;
      vm.linkedInPostSubmittedUrl = vm.campaign.applicationURL;
      vm.linkedInPostSubmittedImageUrl = '';
      vm.linkedInId = $scope.linkedInId;
    
      function showErrorMessage(msgArg) {
          $UserAlerts.open(msgArg, ENUM.ALERT.DANGER, true);
      };

      vm.resetLinkedInPost = function() {
        vm.linkedInPostComment = linkedInPostComment;
        vm.linkedInPostTitle = linkedInPostTitle;
        vm.linkedInPostDescription = linkedInPostDescription;
        vm.linkedInPostSubmittedImageUrl = '';
        vm.linkedInId = $scope.linkedInId;
      };

      vm.clearLinkedInPost = function() {
        vm.linkedInPostComment = '';
        vm.linkedInPostTitle = '';
        vm.linkedInPostDescription = '';
        vm.linkedInPostSubmittedImageUrl = '';
        vm.linkedInId = '';
      };
      
      vm.linkedInDispatch = function() {
        if (vm.campaign.status !== ENUM.CAMPAIGN_STATUS.PUBLISHED) {
          showErrorMessage('LinkedIn posts can be shared only during the campaign period');
          vm.displayCheckMsg = false;
          return;
        };
        if (vm.linkedInPostComment === '' || vm.linkedInPostComment === null || vm.linkedInPostComment === undefined) {
          showErrorMessage("Comment should be defined");
          return;
        };
        if (vm.linkedInPostTitle === '' || vm.linkedInPostTitle === null || vm.linkedInPostTitle === undefined) {
          showErrorMessage("Title should be defined");
          return;
        };
        if (vm.linkedInId === '' || vm.linkedInId === null || vm.linkedInId === undefined) {
          showErrorMessage("LinkedIn Company ID should be defined");
          return;
        };

        let msgArg = 'The campaign will be posted on the company LinkedIn page';
        $UserAlerts.prompt(
            msgArg,
            ENUM.ALERT.INFO,
            false,
            function(){
              $scope.linkedInPostComment = vm.linkedInPostComment;
              $scope.linkedInPostTitle = vm.linkedInPostTitle;
              $scope.linkedInPostDescription = vm.linkedInPostDescription;
              $scope.linkedInPostSubmittedUrl = vm.linkedInPostSubmittedUrl;
              $scope.linkedInPostSubmittedImageUrl = vm.linkedInPostSubmittedImageUrl;
              $scope.linkedInId = vm.linkedInId;
              $uibModal.open({
                  animation: vm.animationsEnabled,
                  templateUrl: 'client/campaign/view/targetCampaignSocialIN.html',
                  controller: 'targetCampaignSocialIN',
                  controllerAs: 'vm',
                  scope: $scope,
                  size: 'sm'
              })
            },
            function(){ 
              return;
            }
        );
      };
      
      vm.helpers({
        activityLog() {
          vm.dependency.depend();
          return vm.activityLog;
        }
      });

      vm.linkedInActivityLog = function () {
        if (vm.displayLinkedInActivityLog) {
          vm.displayLinkedInActivityLog = false;
          return;
        };
        vm.displayLinkedInActivityLog = true;
        (new Promise((resolve, reject) => {
            let activityLog;
            let conditions = {};
            conditions = {$and:[
                          {collectionType: 'Campaign'},
                          {collectionId: vm.campaign._id},
                          {activity: ENUM.ACTIVITY_LOG.DISPATCH_SOCIAL_LINKEDIN}
                          ]};
            Meteor.call('activityLog.getActivityLogSummery', conditions, (err, res) => {
                if (err) {
                    reject();
                } else {
                    resolve(res);
                }
            });    
        })).then(function(results){
              vm.activityLog = results;
              vm.dependency.changed();
            }).catch(function(error) {
              vm.activityLog = [];
            });
      };
    
      vm.closeLinkedInActivityLog = function () {
        vm.displayLinkedInActivityLog = false;
      };

      vm.cancel = function () {
        $uibModalInstance.dismiss('cancel');
      };

      // Store the challenge image 
      loadImage = function (event) {
          var files = event.target.files;
          file = files[0];

          if (file.name) {
              document.getElementById('uploadProgress').setAttribute("class", 'fa fa-refresh fa-spin uploadProgress');
          };

          var dbx = new Dropbox.Dropbox({accessToken: ENUM.DROPBOX_API.TOKEN});
          dbx.filesUpload({
              path: '/img/linkedIn/' + file.name,
              contents: file
              })
              .then(function(response) {
                  vm.linkedInPostSubmittedImage = file.name;
                  // display the image
                  dbx.filesGetThumbnail({
                      path: '/img/linkedIn/' + file.name,
                      format: 'png',
                      size: 'w640h480'
                      })
                      .then(function(response) {
                          document.getElementById('viewImage').setAttribute("src", window.URL.createObjectURL(response.fileBlob));
                          document.getElementById('uploadProgress').setAttribute("class", '');
                          // get the uploaded image url
                          dbx.sharingCreateSharedLinkWithSettings ({
                              path: '/img/linkedIn/' + file.name
                              })
                              .then(function(response) {
                                  vm.linkedInPostSubmittedImageUrl = response.url;
                              })
                              .catch(function(error) {
                                  console.log(error);
                          });
                      })
                      .catch(function(error) {
                          console.log(error);
                  });
              })
              .catch(function(error) {
                   console.log(error);
          });
      };
      
      
    });