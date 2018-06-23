Professions = new Mongo.Collection("professions");

Professions.allow({
  insert(userId, skills) {
    return true;
  },
  update(userId, professions, fields, modifier) {
    return true;
  },
  remove(userId, professions) {
    return true;
  }
});
module.exports = Professions;