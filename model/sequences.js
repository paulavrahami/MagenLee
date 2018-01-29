Sequences = new Mongo.Collection("sequences");

Sequences.allow({
  insert(userId, sequences) {
    return true;
  },
  update(userId, sequences, fields, modifier) {
    return true;
  },
  remove(userId, sequences) {
    return true;
  }
});
module.exports = Sequences;