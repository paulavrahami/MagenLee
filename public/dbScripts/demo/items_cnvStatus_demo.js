db = connect("ds153869.mlab.com:53869/heroku_m45dr6l0");
db.auth( {user: "skillera-demo", pwd: "Mlab0099"});

db.items.find().forEach(function(item){
	if (item.status === 'Assigned') {
		db.items.update({_id: item._id}, {$set: {status: 'In Use'}});
	};
});