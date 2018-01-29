Talents = new Mongo.Collection("talents");

Talents.allow({
  insert(userId, talents) {
    return true;
  },
  update(userId, talents, fields, modifier) {
    return true;
  },
  remove(userId, talents) {
    return true;
  }
});
module.exports = Talents;