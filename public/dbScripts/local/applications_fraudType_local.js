db = connect("localhost:3001/meteor");
db.applications.updateMany({}, {$set: {fraudType : "No Fraud"}});
