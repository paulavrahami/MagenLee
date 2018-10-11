import { Meteor } from 'meteor/meteor';

let TalentsAPI = {

    getTalentsSummery (conditions) {
        return new Promise((resolve, reject) => {

            conditions = conditions || {};
            try {
                let talents = Talents.find(conditions);
                let results = [];
                talents.forEach(function (talent) {        
                    results.push(talent);
                });
                resolve(results);
            }
            catch (error) {
                 reject(error);
            }
        });
    },

    getTalentsCount (conditions) {
        return new Promise((resolve, reject) => {
            
            try {
                resolve(Talents.find(conditions).count());
            }
            catch (error) {
                 reject(error);
            }
        });
    }
};

Meteor.methods({
    'talents.getTalentsSummery' (conditions) {
        return TalentsAPI.getTalentsSummery(conditions);
    },

    'talents.getTalentsCount' (conditions) {
        return TalentsAPI.getTalentsCount(conditions);
    },

    'getTalentById': function (condition) {
          return Talents.findOne({talentId: condition});
    },
    'removeTalentCollection' (talentIdToRemove) {
          return Talents.remove({talentId : talentIdToRemove});
    }
});
