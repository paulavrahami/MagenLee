if (Meteor.isServer) {

  Meteor.publish('templates', function(){
    return TemplatesCollection.find({});
  });
}
