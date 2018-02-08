db = connect("localhost:3001/meteor");
db.items.createIndex({"skill.type":"text"});
