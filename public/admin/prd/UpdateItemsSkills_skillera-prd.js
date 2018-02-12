db = connect("ds229458.mlab.com:29458/heroku_h5ztbh0x");
db.auth( {user: "skillera-prd", pwd: "Mlab0099"});

db.items.updateMany({}, {$set: {skillNew: ""}});
db.items.find({}).forEach(function(item){
	db.items.update({skillNew: ""}, {$set: {skillNew: item.skill.type}})
});
db.items.updateMany({}, {$unset: {skill: ""}});
db.items.updateMany({}, {$rename: {'skillNew': 'skill'}});
db.items.createIndex({"skill":"text"});
