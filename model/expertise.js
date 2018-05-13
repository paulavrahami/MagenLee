Expertise = new Mongo.Collection("expertise");

Expertise.allow({
  insert(userId, expertise) {
    return true;
  },
  update(userId, expertise, fields, modifier) {
    return true;
  },
  remove(userId, expertise) {
    return true;
  }
});
module.exports = Expertise;