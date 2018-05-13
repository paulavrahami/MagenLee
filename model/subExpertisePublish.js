if (Meteor.isServer) {

  Meteor.publish('subExpertise', function() {
    return SubExpertise.find({});
  });
}