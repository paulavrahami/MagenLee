if (Meteor.isServer) {

  Meteor.publish('positions', function() {
    return Positions.find({});
  });
}
