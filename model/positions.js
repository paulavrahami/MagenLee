Positions = new Mongo.Collection("positions");

Positions.allow({
  insert(userId, positions) {
    return true;
  },
  update(userId, positions, fields, modifier) {
    return true;
  },
  remove(userId, positions) {
    return true;
  }
});
module.exports = Positions;