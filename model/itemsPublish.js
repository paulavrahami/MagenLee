if (Meteor.isServer) {

  Meteor.publish('items', function(){
    return Items.find({});
  });
}
