db = connect("ds229458.mlab.com:29458/heroku_h5ztbh0x");
db.auth( {user: "skillera-prd", pwd: "Mlab0099"});
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
