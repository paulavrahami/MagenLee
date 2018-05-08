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

    getItemLastAssignedDate (getParams) {
        var itemId = getParams.itemId;
        return new Promise((resolve, reject) => {
            try {
                let assignedDate = Auditions.aggregate([
                    {$unwind:'$items'},
                    {$match : { $and: [ {'items.itemId': itemId},
                                        {'status': "Published"}]}},
                    {$group : {_id: null , lastAssignedDate: {$max: '$statusDate'}}}
                ]);
                if (assignedDate.length === 0) {
                    var results = "";
                } else {
                    var results = assignedDate[0].lastAssignedDate;
                };
                resolve(results);
            }
            catch (error) {
                reject(error);
            }
        });
    },

    getItemUsageMyAuditions (getParams) {
        var itemId = getParams.itemId;
        var companyOwner = getParams.companyOwner;
        return new Promise((resolve, reject) => {
            try {
                let itemUsage = Auditions.aggregate([
                    {$unwind:'$items'},
                    {$match : { $and: [ {'control.companyOwner': companyOwner},
                                        {'items.itemId': itemId},
                                        {'status': "Published"}]}},
                    {$group : {_id: null, total: {$sum:1}}}
                ]);
                if (itemUsage.length === 0) {
                    var results = 0;
                } else {
                    var results = itemUsage[0].total;
                };
                resolve(results);
            }
            catch (error) {
                reject(error);
            }
        });
    },

    getItemUsageOtherRecruiters (getParams) {
        var itemId = getParams.itemId;
        var companyOwner = getParams.companyOwner;
        return new Promise((resolve, reject) => {
            try {
                let itemUsage = Auditions.aggregate([
                    {$unwind:'$items'},
                    {$match : { $and: [ {'control.companyOwner': {$ne : companyOwner}}, 
                                        {'items.itemId': itemId},
                                        {'status': "Published"}]}},
                    {$group : {_id: null, total: {$sum:1}}}
                ]);
                if (itemUsage.length === 0) {
                    var results = 0;
                } else {
                    var results = itemUsage[0].total;
                };
                resolve(results);
            }
            catch (error) {
                reject(error);
            }
        });
    },

    getItemUsagePerRecruiter (getParams) {
        var itemId = getParams.itemId;
        return new Promise((resolve, reject) => {
            try {
                let itemUsage = Auditions.aggregate([
                    {$unwind:'$items'},
                    {$match : { $and: [ {'items.itemId': itemId},
                                        {'status': "Published"}]}},
                    {$group : {_id: '$control.companyOwner' , totalUsage: {$sum:1} , lastAssignedDate: {$max: '$statusDate'}}}
                ]);
                var results = itemUsage;
                resolve(results);
            }
            catch (error) {
                reject(error);
            }
        });
    }
};

Meteor.methods({
    'items.getItemsSummary' (conditions) {
        return ItemsAPI.getItemsSummary(conditions);
    },
    'items.getItemUsageMyAuditions' (getParams) {
        return ItemsAPI.getItemUsageMyAuditions(getParams);
    },
    'items.getItemUsageOtherRecruiters' (getParams) {
        return ItemsAPI.getItemUsageOtherRecruiters(getParams);
    },
    'items.getItemUsagePerRecruiter' (getParams) {
        return ItemsAPI.getItemUsagePerRecruiter(getParams);
    },
    'items.getItemLastAssignedDate' (getParams) {
        return ItemsAPI.getItemLastAssignedDate(getParams);
    }
});
