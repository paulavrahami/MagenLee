AuditionExecs = new Mongo.Collection("auditionExec");

AuditionExecs.allow({
  insert(userId, auditionExecs) {
    return true;
  },
  update(userId, auditionExecs, fields, modifier) {
    return true;
  },
  remove(userId, auditionExecs) {
    return true;
  }
});
