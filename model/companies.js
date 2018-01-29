Companies = new Mongo.Collection("companies");

Companies.allow({
  insert(userId, companies) {
    return true;
  },
  update(userId, companies, fields, modifier) {
    return true;
  },
  remove(userId, companies) {
    return true;
  }
});
module.exports = Companies;
