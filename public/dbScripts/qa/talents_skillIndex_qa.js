db = connect("ds229468.mlab.com:29468/heroku_dwwt61r2");
db.auth( {user: "skillera-qa", pwd: "Mlab0099"});
db.talents.updateMany({}, {$set: {shareContact : true}});
db.talents.createIndex(
	{
	profession: "text",
	skill1: "text",
	skill2: "text",
	skill3: "text",
	skill4: "text",
	skill5: "text",
	country: "text",
	city: "text"
	});
