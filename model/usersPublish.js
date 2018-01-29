if (Meteor.isServer) {
  Meteor.publish('specificUser', function(userId) {
    return Meteor.users.find({"_id": userId},
        {
            'fields': {
                'profile.companyName': 1,
                'profile.companyLogoId': 1
            }
        });
  });
}