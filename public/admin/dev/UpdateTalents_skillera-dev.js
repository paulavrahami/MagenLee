db = connect("ds119078.mlab.com:19078/heroku_zgtvhxbk");
db.auth( {user: "skillera-dev", pwd: "Mlab0099"});
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
