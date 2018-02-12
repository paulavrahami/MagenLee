db = connect("ds119078.mlab.com:19078/heroku_zgtvhxbk");
db.auth( {user: "skillera-dev", pwd: "Mlab0099"});

db.items.updateMany({}, {$set: {skillNew: ""}});
db.items.find({}).forEach(function(item){
	db.items.update({skillNew: ""}, {$set: {skillNew: item.skill.type}})
});
db.items.updateMany({}, {$unset: {skill: ""}});
db.items.updateMany({}, {$rename: {'skillNew': 'skill'}});
db.items.createIndex({"skill":"text"});
