db = connect("localhost:3001/meteor");
db.applications.updateMany({}, {$set: {resolutionStatus : ""}});
db.applications.updateMany({}, {$set: {feedbackEmployed : ""}});
db.applications.updateMany({}, {$set: {feedbackProfessional : ""}});
db.applications.updateMany({}, {$set: {feedbackPersonal : ""}});
db.applications.updateMany({}, {$set: {feedbackOrganization : ""}});
