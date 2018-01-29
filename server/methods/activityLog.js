import { Meteor } from 'meteor/meteor';

let ActivityLogAPI = {

    getActivityLogSummery (conditions) {
        return new Promise((resolve, reject) => {

            conditions = conditions || {};
            try {
                let activityLog = ActivityLog.find(conditions);
                let results = [];
                activityLog.forEach(function (activityLog) {        
                    results.push(activityLog);
                });
                resolve(results);
            }
            catch (error) {
                 reject(error);
            }
        });
    },

};

Meteor.methods({
    'activityLog.getActivityLogSummery' (conditions) {
        return ActivityLogAPI.getActivityLogSummery(conditions);
    },
});
