Skills = new Mongo.Collection("skills");

Skills.allow({
  insert(userId, skills) {
    return true;
  },
  update(userId, skills, fields, modifier) {
    return true;
  },
  remove(userId, skills) {
    return true;
  }
});
module.exports = Skills;
