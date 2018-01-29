if (Meteor.isServer) {
    Meteor.publish('cv.files', function () {
        return CVFiles.find({});
    });
}