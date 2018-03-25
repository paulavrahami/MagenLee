db = connect("ds229458.mlab.com:29458/heroku_h5ztbh0x");
db.auth( {user: "skillera-prd", pwd: "Mlab0099"});

db.applications.updateMany({}, {$set: {resolutionStatus : ""}});
db.applications.updateMany({}, {$set: {feedbackEmployed : ""}});
db.applications.updateMany({}, {$set: {feedbackProfessional : ""}});
db.applications.updateMany({}, {$set: {feedbackPersonal : ""}});
db.applications.updateMany({}, {$set: {feedbackOrganization : ""}});