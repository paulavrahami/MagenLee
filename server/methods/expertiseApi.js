import { Meteor } from 'meteor/meteor';

let ExpertiseAPI = {
    /**
     * Create a collection of expertise
     */
    getExpertise (conditions) {
        return new Promise((resolve, reject) => {

            conditions = conditions || {};

            try {
                let expertise = Expertise.find(conditions);
                let results = [];
                expertise.forEach(function (expertiseTopic) {
                    results.push(expertiseTopic);
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

    'expertise.getExpertise' (conditions) {

        return ExpertiseAPI.getExpertise(conditions);
    }
    
});