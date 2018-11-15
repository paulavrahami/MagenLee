db = connect("ds119078.mlab.com:19078/heroku_zgtvhxbk");
db.auth( {user: "skillera-dev", pwd: "Mlab0099"});

db.items.find().forEach(function(item){
	db.items.update({_id: item._id}, {$set: {usageClass: 'Recruitment'}});
});