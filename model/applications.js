Applications = new Mongo.Collection("applications");

Applications.allow({
  insert(userId, applications) {
    return true;
  },
  update(userId, applications, fields, modifier) {
    return true;
  },
  remove(userId, applications) {
    return true;
  }
});
module.exports = Applications;
