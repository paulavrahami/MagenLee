if (Meteor.isServer) {

  Meteor.publish('auditions', function() {
    return Auditions.find({"control.owner": this.userId}); //todo:isn't it should be company name
  });
  Meteor.publish('allAuditions', function(){
    return Auditions.find({});
  });
  Meteor.publish('RecruiterAuditions', function(companyName) {
    return Auditions.find({"control.companyOwner": companyName});
  });
}
