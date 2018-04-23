db = connect("localhost:3001/meteor");

db.items.find().forEach(function(item){
	if (item.status === 'Assigned') {
		db.items.update({_id: item._id}, {$set: {status: 'In Use'}});
	};
});