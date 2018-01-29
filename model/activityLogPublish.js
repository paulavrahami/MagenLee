if (Meteor.isServer) {

  Meteor.publish('activityLog', function() {
    return ActivityLog.find({});
  });
}
