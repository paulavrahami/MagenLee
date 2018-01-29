import { Meteor } from 'meteor/meteor';

let ApplicationsAPI = {
    /**
     * Create a collection of applicatios
     */
    getApplications (conditions) {
        return new Promise((resolve, reject) => {

            conditions = conditions || {};

            try {
                let applications = Applications.find(conditions);
                let results = [];
                applications.forEach(function (application) {
                    results.push(application);
                });

                resolve(results);
            }
            catch (error) {
                reject(error);
            }
        });
    }
};

Meteor.methods({

    'applications.getApplications' (conditions) {

        return ApplicationsAPI.getApplications(conditions);
    }
});
