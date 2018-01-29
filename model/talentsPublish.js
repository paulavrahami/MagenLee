if (Meteor.isServer) {

  Meteor.publish('talents', function() {
    return Talents.find({});
  });
}
