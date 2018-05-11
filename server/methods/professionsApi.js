import { Meteor } from 'meteor/meteor';

let ProfessionsAPI = {
    /**
     * Create a collection of professions
     */
    getProfessions (conditions) {
        return new Promise((resolve, reject) => {

            conditions = conditions || {};

            try {
                let professions = Professions.find(conditions);
                let results = [];
                professions.forEach(function (profession) {
                    results.push(profession);
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

    'professions.getProfessions' (conditions) {

        return ProfessionsAPI.getProfessions(conditions);
    }
    
});