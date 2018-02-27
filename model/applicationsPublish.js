if (Meteor.isServer) {

  Meteor.publish('applications', function() {
    return Applications.find({});
  });
  Meteor.publish('applicationsCampaign', function(campaignid) {
    return Applications.find({"campaignId": campaignid});
  });
  Meteor.publish('applicationsByEmail', function(emailid) {
    return Applications.find({"email": emailid});
  });
}
