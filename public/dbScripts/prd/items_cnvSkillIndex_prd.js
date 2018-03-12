db = connect("ds229458.mlab.com:29458/heroku_h5ztbh0x");
db.auth( {user: "skillera-prd", pwd: "Mlab0099"});

db.items.updateMany({}, {$set: {skillNew: ""}});
db.items.find().forEach(function(item){
	db.items.update({_id: item._id}, {$set: {skillNew: item.skill.type}})
});
db.items.updateMany({}, {$unset: {skill: ""}});
db.items.updateMany({}, {$rename: {'skillNew': 'skill'}});
db.items.dropIndex("skill.type_text");
db.items.createIndex({"skill":"text"});
