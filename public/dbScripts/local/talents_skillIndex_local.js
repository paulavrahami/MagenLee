db = connect("localhost:3001/meteor");
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
