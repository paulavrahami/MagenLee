SubExpertise = new Mongo.Collection("subExpertise");

SubExpertise.allow({
  insert(userId, subExpertise) {
    return true;
  },
  update(userId, subExpertise, fields, modifier) {
    return true;
  },
  remove(userId, subExpertise) {
    return true;
  }
});
module.exports = SubExpertise;