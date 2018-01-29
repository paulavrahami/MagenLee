TemplatesCollection = new Mongo.Collection("templates");

TemplatesCollection.allow({
  insert(userId, audition) {
    //return userId && audition.control.owner === userId;
    return true;
  },
  update(userId, audition, fields, modifier) {
    //return userId && audition.control.owner === userId;
    return true;
  },
  remove(userId, audition) {
    //return userId && audition.control.owner === userId;
    return true;
  }
});
module.exports = TemplatesCollection;