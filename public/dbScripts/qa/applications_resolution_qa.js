db = connect("ds229468.mlab.com:29468/heroku_dwwt61r2");
db.auth( {user: "skillera-qa", pwd: "Mlab0099"});

db.applications.updateMany({}, {$set: {resolutionStatus : ""}});
db.applications.updateMany({}, {$set: {feedbackEmployed : ""}});
db.applications.updateMany({}, {$set: {feedbackProfessional : ""}});
db.applications.updateMany({}, {$set: {feedbackPersonal : ""}});
db.applications.updateMany({}, {$set: {feedbackOrganization : ""}});