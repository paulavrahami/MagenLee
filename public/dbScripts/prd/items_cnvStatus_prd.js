db = connect("ds229458.mlab.com:29458/heroku_h5ztbh0x");
db.auth( {user: "skillera-prd", pwd: "Mlab0099"});

db.items.find().forEach(function(item){
	if (item.status === 'Assigned') {
		db.items.update({_id: item._id}, {$set: {status: 'In Use'}});
	};
});