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
    
};

Meteor.methods({

    'skills.getSkills' (conditions) {

        return SkillsAPI.getSkills(conditions);
    },
    'checkSkillAvailable': function (skill) {
        return (Skills.find({$and: [{name: skill},{status: 'Active'},{verificationStatus: 'Approved'}]}, 
        {limit: 1}).count()>0) ? true : false;
    },
    'checkSkillPending': function (skill) {
        return (Skills.find({$and: [{name: skill},{status: 'Active'},{verificationStatus: 'Pending'}]}, 
        {limit: 1}).count()>0) ? true : false;
    }
    
});
