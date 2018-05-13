import { Meteor } from 'meteor/meteor';

let SubExpertiseAPI = {
    /**
     * Create a collection of sub expertise
     */
    getSubExpertise (conditions) {
        return new Promise((resolve, reject) => {

            conditions = conditions || {};

            try {
                let subExpertise = SubExpertise.find(conditions);
                let results = [];
                subExpertise.forEach(function (subExpertiseTopic) {
                    results.push(subExpertiseTopic);
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

    'subExpertise.getSubExpertise' (conditions) {

        return SubExpertiseAPI.getSubExpertise(conditions);
    }
    
});