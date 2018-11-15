db = connect("localhost:3001/meteor");

db.items.find().forEach(function(item){
	db.items.update({_id: item._id}, {$set: {usageClass: 'Recruitment'}});
});