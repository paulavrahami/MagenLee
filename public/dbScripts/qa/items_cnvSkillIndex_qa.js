db = connect("ds229468.mlab.com:29468/heroku_dwwt61r2");
db.auth( {user: "skillera-qa", pwd: "Mlab0099"});

db.items.updateMany({}, {$set: {skillNew: ""}});
db.items.find().forEach(function(item){
	db.items.update({_id: item._id}, {$set: {skillNew: item.skill.type}})
});
db.items.updateMany({}, {$unset: {skill: ""}});
db.items.updateMany({}, {$rename: {'skillNew': 'skill'}});
db.items.dropIndex("skill.type_text");
db.items.createIndex({"skill":"text"});
