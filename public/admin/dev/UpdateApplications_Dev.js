db = connect("ds119078.mlab.com:19078/heroku_zgtvhxbk");
db.auth( {user: "skillera-dev", pwd: "Mlab0099"});
db.applications.updateMany({}, {$set: {fraudType : "No Fraud"}});
