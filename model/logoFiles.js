// LogoFiles = new FilesCollection({
//     debug: false,
//     collectionName: 'files_logo',
//     // storagePath : '/public/files/logo',
//     allowClientCode: true,
//     onBeforeUpload: function (file) {
//         // Allow upload files under 10MB
//         if (!(file.size <= 10485760)) {
//             return 'Please upload file, with size equal or less than 10MB';
//         }
//         // Allow only images format
//         if (!/gif|bmp|png|jpg|jpeg|bmp/i.test(file.extension)) {
//             return 'Please upload an image file one of "gif|bmp|png|jpg|jpeg|bmp"';
//         }
//         return true;
//     }
// });
// old token jNRAKI6EZHAAAAAAAAAACVAM9oJsrM9SqbrAZN9076EKANelnunpcVFegpU7sBdM

var dropboxStore = new FS.Store.Dropbox("files", {
    key: "fepduzg8ev8ujzo",
    secret: "ybdc9i2y2ibi9bf",
    token: "jNRAKI6EZHAAAAAAAAABwW4i43maELjSCJF9KIVNMls84NpmqCMUK16genVTwUK5",
    folder: "logos",
    maxTries: 1 //optional, default 5
});

LogoFiles = new FS.Collection("images", {
    stores: [dropboxStore]
});

function checkLogoFileType (eventEmitterArg) {

    return (eventEmitterArg.size() < (2097152 + 1)) && eventEmitterArg.isImage();
}
LogoFiles.allow({
    'insert': function (userId, eventEmitter, fields, modifier) {
        return checkLogoFileType(eventEmitter);
    },
    update(userId, eventEmitter, fields, modifier) {
        return checkLogoFileType(eventEmitter);
    },
    remove(userId, eventEmitter) {
        //return userId && audition.control.owner === userId;
        return true;
    },
    download(userId,eventEmitter) {
        return true;
    }
});
module.exports = LogoFiles;

