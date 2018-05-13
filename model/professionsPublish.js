if (Meteor.isServer) {

  Meteor.publish('professions', function() {
    return Professions.find({});
  });
}