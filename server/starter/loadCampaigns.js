if (Meteor.isServer) {
  Meteor.startup(function () {

      let campaigns = Campaigns.find();

      campaigns.forEach(function (campaign) {

          if (!campaign.statusDate) {
              campaign.statusDate = (new Date);
              Campaigns.update({_id: campaign._id}, {$set: campaign});
          }
      });
  });
}
