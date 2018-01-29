if (Meteor.isServer) {

  Meteor.publish('skills', function() {
    return Skills.find({});
  });
}
