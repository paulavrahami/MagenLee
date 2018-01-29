if (Meteor.isServer) {

  Meteor.publish('companies', function() {
    return Companies.find({});
  });
}
