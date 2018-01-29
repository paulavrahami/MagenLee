if (Meteor.isServer) {
    Meteor.publish('logo.files', function () {
        return LogoFiles.find({});
    });
}