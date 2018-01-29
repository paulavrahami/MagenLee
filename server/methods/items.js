import { Meteor } from 'meteor/meteor';

let ItemsAPI = {

    getItemsSummary (conditions) {
        return new Promise((resolve, reject) => {
            conditions = conditions || {};
            try {
                let items = Items.find(conditions);
                let results = [];
                items.forEach(function (item) {        
                    results.push(item);
                });
                resolve(results);
            }
            catch (error) {
                 reject(error);
            }
        });
    },

    // getItemsCount (conditions) {
    //     return new Promise((resolve, reject) => {
            
    //         try {
    //             resolve(Items.find(conditions).count());
    //         }
    //         catch (error) {
    //              reject(error);
    //         }
    //     });
    // }
};

Meteor.methods({
    'items.getItemsSummary' (conditions) {
        return ItemsAPI.getItemsSummary(conditions);
    }

    // 'items.getItemsCount' (conditions) {
    //     return ItemsAPI.getItemsCount(conditions);
    // }
});
