angular
   .module('brgo')
   .controller('targetCampaignExternalTalents', function($state, $scope, $reactive, $UserAlerts, ENUM, dbhService, $uibModalInstance) {
      var vm = this;
      $reactive(vm).attach($scope);
      vm.displayCheckMsg = false;
      vm.displayActivityLog = false;
      vm.dependency = new Deps.Dependency();
      vm.campaign = $scope.campaign;
      vm.campaign.published = vm.campaign.status == ENUM.CAMPAIGN_STATUS.DISPATCHED;
      vm.fileName = "";
      vm.dispatchEmail = true; /*Default dispatch channel*/
      vm.dispatchSMS = false;
      vm.dispatchWhatsApp =false;
      vm.dispatchLinkedIn = false;
      vm.dispatchFacebook = false;

    
      function showErrorMessage(msgArg) {
          $UserAlerts.open(msgArg, ENUM.ALERT.DANGER, true);
      };


      function showInfoMessage(msgArg, callbackArg) {
          $UserAlerts.open(msgArg, ENUM.ALERT.INFO, true, callbackArg);
      }


      function sendInvitations () {
        (new Promise((resolve, reject) => {
          Meteor.call('dispatchExternalTalents',
            { externalTalents:vm.externalTalents,
              headerFirstName:vm.headerFirstName,
              headerLastName:vm.headerLastName,
              headerEmail:vm.headerEmail,
              position:vm.campaign.positionName,
              company:vm.campaign.control.companyOwner,
              applicationURL:vm.campaign.applicationURL,
              dispatchEmail:vm.dispatchEmail,
              dispatchSMS:vm.dispatchSMS,
              dispatchWhatsApp:vm.dispatchWhatsApp,
              dispatchLinkedIn:vm.dispatchLinkedIn,
              dispatchFacebook:vm.dispatchFacebook
              }, (err, res) => {
                  if (err) {
                    reject();
                  } else {
                    resolve(res);
                  }
                });
              })).then(function(results) {
                    dbhService.insertActivityLog('Campaign', vm.campaign._id, ENUM.ACTIVITY_LOG.DISPATCH_EXTERNAL_FILE, 'Total Talents: '+results+' / File: '+vm.fileName);
                    vm.dependency.changed();
                    Campaigns.update({_id: vm.campaign._id}, {$set: {targetExternalTalents: true}}, function (errorArg, tempIdArg) {
                      if (errorArg) {
                        showErrorMessage(errorArg.message);
                      };
                    });
              }).catch(function(error) {
              });
      };     


      loadFile = function (event) {
        vm.fileCheckDone = false;
        vm.displayCheckMsg = false;
        var files = event.target.files;
        file = files[0];
        vm.fileName = file.name;
        var reader = new FileReader();

        reader.onload = function(event) {
          //** Get the workbook
          var data = event.target.result;
          var workbook = XLSX.read(data, {type: true ? 'binary' : 'array'});
          //** Get the header
          var headerNames = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[workbook.SheetNames[0]],{header: 1})[0];
          vm.headerFirstName = headerNames[0] || '';
          vm.headerLastName = headerNames[1] || '';
          vm.headerEmail = headerNames[2] || '';
          //** Get the data
          var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[workbook.SheetNames[0]]);
          vm.externalTalents = XL_row_object;
         };

        reader.readAsBinaryString(file);
      };
      

      vm.changeFile = function() {
        vm.displayCheckMsg = false;
        vm.viewExternalTalents = false;
        vm.fileName  = '';
      };


      vm.externalFileCheck = function() {
        //** Check that a file has been selected
        if (vm.fileName === '' || vm.fileName == null || vm.fileName === undefined) {
          showErrorMessage("No file has been selected");
          vm.displayCheckMsg = false;
          return;  
        };

        //** Check that the file type is 'xlsx'
        var fileExtension = vm.fileName.substr(vm.fileName.lastIndexOf('.') + 1);
        if (fileExtension !== 'xlsx') {
          showErrorMessage("Invalid file type. Please use Excel 2007 and later (.xlsx)");
          vm.displayCheckMsg = false;
          return;
        };

        //** Check the header line
        let headerFirstName = vm.headerFirstName.toLowerCase().trim().replace(/\s/g,'');
        let headerLastName = vm.headerLastName.toLowerCase().trim().replace(/\s/g,'');
        let headerEmail = vm.headerEmail.toLowerCase().trim().replace(/\s/g,'');
        if (headerFirstName !== 'firstname' || headerLastName !== 'lastname' || headerEmail !== 'email') {
          showErrorMessage("The file must include a header line consist of 'First Name', 'Last Name', and 'Email' in this order");
          vm.displayCheckMsg = false;
          return;
        };

        //** Check for missing information
        vm.missingInfoCount = 0;
        vm.validTalentsCount = 0;

        for (i = 0; i < vm.externalTalents.length; i++) {
          if (vm.externalTalents[i][vm.headerFirstName] === '' || vm.externalTalents[i][vm.headerFirstName] === null || vm.externalTalents[i][vm.headerFirstName] === undefined ||
              vm.externalTalents[i][vm.headerLastName] === '' || vm.externalTalents[i][vm.headerLastName] === null || vm.externalTalents[i][vm.headerLastName] === undefined ||
              vm.externalTalents[i][vm.headerEmail] === '' || vm.externalTalents[i][vm.headerEmail] === null || vm.externalTalents[i][vm.headerEmail] === undefined ||
              vm.externalTalents[i][vm.headerEmail].indexOf('@') === -1) 
          {
            vm.missingInfoCount++;
          } else {
            vm.validTalentsCount++;
          }
        };
        vm.displayCheckMsg = true;
        vm.fileCheckDone = true;
      };
     

      vm.externalFileView = function() {
        if (vm.viewExternalTalents == true) {
          vm.viewExternalTalents = false;
          return;
        };

        if (vm.fileName === "" || vm.fileName === null || vm.fileName === undefined) {
          showErrorMessage('No file has been selected');
          vm.displayCheckMsg = false;
          return;
        };

        //** Check that the file type is 'xlsx'
        var fileExtension = vm.fileName.substr(vm.fileName.lastIndexOf('.') + 1);
        if (fileExtension !== 'xlsx') {
          showErrorMessage("Invalid file type. Please use Excel 2007 and later (.xlsx)");
          vm.displayCheckMsg = false;
          return;
        };

        vm.viewExternalTalents = true;
      };


      vm.closeExternalFileView = function() {
        vm.viewExternalTalents = false;
      };


      vm.dispatch = function() {
        if (vm.campaign.status !== ENUM.CAMPAIGN_STATUS.DISPATCHED) {
          showErrorMessage('Invitations can be dispatched only during the campaign period');
          vm.displayCheckMsg = false;
          return;
        };
        if (vm.fileName === "" || vm.fileName === null || vm.fileName === undefined) {
          showErrorMessage('No file has been selected');
          vm.displayCheckMsg = false;
          return;
        };

        if (!vm.fileCheckDone) {
          showErrorMessage('The file has to be validated before dispatching. Please select the Check button');
          vm.displayCheckMsg = false;
          return;
        };

        if (vm.validTalentsCount === 0) {
          showErrorMessage('No valid talent records have been found');
          vm.displayCheckMsg = false;
          return;
        }

        if (!vm.dispatchEmail && !vm.dispatchSMS && !vm.dispatchWhatsApp && !vm.dispatchLinkedIn && !vm.dispatchFacebook) {
            showErrorMessage('No dispatch channel has been selected');
            vm.displayCheckMsg = false;
            return;
        };

        let msgArg = 'Invitations will be sent to ' + vm.validTalentsCount +' talents. Please confirm';
        $UserAlerts.prompt(
            msgArg,
            ENUM.ALERT.INFO,
            false,
            function(){ 
              sendInvitations();
               $uibModalInstance.dismiss('cancel');
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


      vm.activityLogSummary = function () {
        if (vm.displayActivityLog) {
          vm.displayActivityLog = false;
          return;
        };
        vm.displayActivityLog = true;
        (new Promise((resolve, reject) => {
            let activityLog;
            let conditions = {};
            conditions = {$and:[
                          {collectionType: 'Campaign'},
                          {collectionId: vm.campaign._id},
                          {activity: ENUM.ACTIVITY_LOG.DISPATCH_EXTERNAL_FILE}
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


      vm.closeActivityLog = function () {
        vm.displayActivityLog = false;
      };


      vm.cancel = function () {
        vm.displayCheckMsg = false;
        $uibModalInstance.dismiss('cancel');
      };

    });
