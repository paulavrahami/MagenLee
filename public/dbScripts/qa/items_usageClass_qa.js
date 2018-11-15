db = connect("ds229468.mlab.com:29468/heroku_dwwt61r2");
db.auth( {user: "skillera-qa", pwd: "Mlab0099"});

db.items.find().forEach(function(item){
		db.items.update({_id: item._id}, {$set: {usageClass: 'Recruitment'}});
});