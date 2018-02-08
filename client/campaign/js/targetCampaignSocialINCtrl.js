angular
    .module('skillera')
    .controller('targetCampaignSocialIN', function($state, $scope, $reactive, $UserAlerts, ENUM, dbhService, $uibModalInstance) {
      var vm = this;
      $reactive(vm).attach($scope);
      vm.dependency = new Deps.Dependency();
      vm.campaign = $scope.campaign;

      console.log("step into targetCampaignSocial_IN");

      function showErrorMessage(msgArg) {
          $UserAlerts.open(msgArg, ENUM.ALERT.DANGER, true);
      };
      
      function showInfoMessage(msgArg, callbackArg) {
          $UserAlerts.open(msgArg, ENUM.ALERT.INFO, true, callbackArg);
      };
    
      // Setup an event listener to make an API call once auth is complete
      onLinkedInLoad = function () {
        console.log("step into onLinkedInLoad");
        IN.Event.on(IN, "auth", shareContent);
      };

      // Handle the successful return from the API call
      function onSuccess(data) {
        console.log("data -",data);
        // Insert Log record
        dbhService.insertActivityLog('Campaign', vm.campaign._id, ENUM.ACTIVITY_LOG.DISPATCH_SOCIAL_LINKEDIN, 'Post to LinkedIn');
        vm.dependency.changed();
        // Indicates that Social Network has been used as one of the campaign's targets
        Campaigns.update({_id: vm.campaign._id}, {$set: {targetSocialNetworks: true}}, function (errorArg, tempIdArg) {
          if (errorArg) {
            showErrorMessage(errorArg.message);
          };
        });
        showInfoMessage("Campaign has been successfully posted");
        $uibModalInstance.dismiss('cancel');
      };

      // Handle an error response from the API call
      function onError(error) {
        console.log("error -",error);
        showErrorMessage(error.message);
        $uibModalInstance.dismiss('cancel');
      };

      // Use the API call wrapper to share content on LinkedIn
      function shareContent() {
        // Build the JSON payload containing the content to be shared
        var payload = {
          "comment": $scope.linkedInPostComment,
          "content": {
            "title": $scope.linkedInPostTitle,
            "description": $scope.linkedInPostDescription,
            "submitted-url": $scope.linkedInPostSubmittedUrl,  
            "submitted-image-url": $scope.linkedInPostSubmittedImageUrl
          },
          "visibility": {
            "code": "anyone"
          }  
        };
        console.log("payload -",payload);
        console.log("$scope.linkedInId - ",$scope.linkedInId);
        IN.API.Raw("/companies/" + $scope.linkedInId + "/shares?format=json")
          .method("POST")
          .body(JSON.stringify(payload))
          .result(onSuccess)
          .error(onError);
      };

      // vm.cancel = function () {
      //   $uibModalInstance.dismiss('cancel');
      // };
            
    });