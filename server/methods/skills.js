import { Meteor } from 'meteor/meteor';

let SkillsAPI = {
    /**
     * Create a collection of skills
     */
    getSkills (conditions) {
        return new Promise((resolve, reject) => {

            conditions = conditions || {};

            try {
                let skills = Skills.find(conditions);
                let results = [];
                skills.forEach(function (skill) {
                    results.push(skill);
                });

                resolve(results);
            }
            catch (error) {
                reject(error);
            }
        });
    },
    // getApplicationsSummary (conditions) {
    //     return new Promise((resolve, reject) => {

    //         conditions = conditions || {};

    //         try {
    //             let applications = Applications.find(conditions);
    //             let results = [];
    //             let applicationRec = {};
    //             applications.forEach(function (application) {
    //                 applicationRec = Campaigns.findOne({_id: application.campaignId});
    //                 application.positionName = applicationRec.positionName;
    //                 application.companyName = applicationRec.control.companyOwner;
    //                 results.push(application);
    //             });

    //             resolve(results);
    //         }
    //         catch (error) {
    //             reject(error);
    //         }
    //     });
    // }
};

Meteor.methods({

    'skills.getSkills' (conditions) {

        return SkillsAPI.getSkills(conditions);
    }
    // 'applications.getApplicationsSummary' (conditions) {
        
    //     return ApplicationsAPI.getApplicationsSummary(conditions);
    // }
});
