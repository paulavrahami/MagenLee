if (Meteor.isServer) {

  Meteor.publish('auditionsExec', function() {
    return AuditionExecs.find({});
  });
}
