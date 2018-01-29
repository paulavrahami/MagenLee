if (Meteor.isServer) {

  Meteor.publish('contents', function() {
    return Contents.find({});
  });
}
