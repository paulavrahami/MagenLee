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
    },
    getApplicationsSummary (conditions) {
        return new Promise((resolve, reject) => {

            conditions = conditions || {};

            try {
                let applications = Applications.find(conditions);
                let results = [];
                let applicationRec = {};
                applications.forEach(function (application) {
                    applicationRec = Campaigns.findOne({_id: application.campaignId});
                    application.positionName = applicationRec.positionName;
                    application.companyName = applicationRec.control.companyOwner;
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
    },
    'applications.getApplicationsSummary' (conditions) {
        
        return ApplicationsAPI.getApplicationsSummary(conditions);
    }
});
