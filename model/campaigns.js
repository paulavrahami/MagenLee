Campaigns = new Mongo.Collection("campaigns");

Campaigns.allow({
  insert(userId, campaign) {
    return userId && campaign.control.owner === userId;
  },
  update(userId, campaign, fields, modifier) {
    return true;
    return userId && campaign.control.owner === userId;
  },
  remove(userId, campaign) {
    return userId && campaign.control.owner === userId;
  }
});
module.exports = Campaigns;
