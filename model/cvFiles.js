// CVFiles = new FilesCollection({
//     debug: false,
//     collectionName: 'files_cv',
//     // storagePath : '/public/files/cv',
//     allowClientCode: true,
//     onBeforeUpload: function (file) {
//         // Allow upload files under 10MB
//         if (file.size <= 10485760) {
//             return true;
//         } else {
//             return 'Please upload file, with size equal or less than 10MB';
//         }
//     }
// });

var dropboxStoreCv = new FS.Store.Dropbox("cvFiles", {
    key: "fepduzg8ev8ujzo",
    secret: "ybdc9i2y2ibi9bf",
    token: "jNRAKI6EZHAAAAAAAAABwW4i43maELjSCJF9KIVNMls84NpmqCMUK16genVTwUK5", // Don’t share your access token with anyone.
    folder: "cv", //optional, which folder (key prefix) to use
    // The rest are generic store options supported by all storage adapters
    //transformWrite: myTransformWriteFunction, //optional
    //transformRead: myTransformReadFunction, //optional
    maxTries: 1 //optional, default 5
});

CVFiles = new FS.Collection("cvFiles", {
    stores: [dropboxStoreCv]
});

function checkCvFileType (eventEmitterArg) {
    var a = 1;
    return (eventEmitterArg.size() < (2097152 + 1));
}

CVFiles.allow({
    'insert': function (userId, eventEmitter, fields, modifier) {
        return checkCvFileType(eventEmitter);
    },
    update(userId, eventEmitter, fields, modifier) {
        return checkCvFileType(eventEmitter);
    },
    remove(userId, eventEmitter) {
        //return userId && audition.control.owner === userId;
        return true;
    },
    download(userId,eventEmitter) {
        return true;
    }
});
module.exports = CVFiles;
