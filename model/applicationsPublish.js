if (Meteor.isServer) {

  Meteor.publish('applications', function() {
    return Applications.find({});
  });
  Meteor.publish('applicationsCampaign', function(campaignid) {
    return Applications.find({"campaignId": campaignid});
  });
}
