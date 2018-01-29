ActivityLog = new Mongo.Collection("activityLog");

ActivityLog.allow({
  insert(userId, activityLog) {
    return true;
  },
  update(userId, activityLog, fields, modifier) {
    return true;
  },
  remove(userId, activityLog) {
    return true;
  }
});
module.exports = ActivityLog;
