if (Meteor.isServer) {

  Meteor.publish('expertise', function() {
    return Expertise.find({});
  });
}