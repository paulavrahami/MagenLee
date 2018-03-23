if (Meteor.isServer) {

  Meteor.publish('items', function(){
    return Items.find({});
  });
  Meteor.publish('itemsByAuthorId', function(authorId){
    return Items.find({"authorId": authorId});
  });
}
