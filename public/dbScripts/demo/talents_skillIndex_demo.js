db = connect("ds153869.mlab.com:53869/heroku_m45dr6l0");
db.auth( {user: "skillera-demo", pwd: "Mlab0099"});
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
