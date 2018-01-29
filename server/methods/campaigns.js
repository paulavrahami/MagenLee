import { Meteor } from 'meteor/meteor';

let CampaignsAPI = {
    /**
     * Create a collection of Campaigns WITHOUT the applications array.
     * Because the applications array might be very big and the client
     * has no interest in it.
     */
    getCampaignsSummery (conditions) {
        return new Promise((resolve, reject) => {

            conditions = conditions || {};

            if (Meteor.user().profile.type != "SystemAdmin") {
                conditions["control.companyOwner"] = Meteor.user().profile.companyName;
            }

            try {
                //noinspection JSUnresolvedVariable
                let campaigns = Campaigns.find(conditions);
                let results = [];
                campaigns.forEach(function (campaign) {

                    if (campaign.applications) {
                        campaign.applicationsCount = campaign.applications.length;
                        //noinspection JSUnresolvedVariable
                        campaign.applicationsSuccess = Applications.find({grade:{$gte:campaign.minScore}, _id:{$in:campaign.applications}}).count();
                        delete campaign.applications;
                    }
                    else {
                        campaign.applicationsCount = 0;
                        campaign.applicationsSuccess = 0;
                    }
                    results.push(campaign);
                });
                resolve(results);
            }
            catch (error) {
                reject(error);
            }
        });
    },
    /**
     * @desc Retrieve a collection of Campaigns WITHOUT the applications array;
     * @param {String} campaignId.
     */
    getCampaign (campaignId) {
        return new Promise((resolve, reject) => {

            let conditions = {_id: campaignId};

            try {
                //noinspection JSUnresolvedVariable
                let campaign = Campaigns.findOne(conditions);
                delete campaign.applications;

                resolve(campaign);
            }
            catch (error) {
                reject(error);
            }
        });
    },
    /**
     * @desc Saves a campaign WITHOUT the applications array;
     * @param {object} campaignArg
     */
    saveCampaign (campaignArg) {

        return new Promise((resolve, reject) => {

            try {
                /** New campaign; */
                if (!campaignArg._id) {
                    //noinspection JSUnresolvedVariable
                    Campaigns.insert(campaignArg, function (errorArg, tempIdArg) {
                        if (errorArg) {
                            reject(errorArg);
                        }
                        else {
                            campaignArg._id = tempIdArg;
                            resolve(campaignArg);
                        }
                    });
                }
                /** Update campaign; */
                else {
                    CampaignsAPI.getCampaign(campaignArg._id).then(function (originalCampaignArg) {

                        /* Copy applications array */
                        if (originalCampaignArg.applications) {
                            campaignArg.applications = originalCampaignArg.applications;
                        }
                        let tempId = campaignArg._id;
                        delete campaignArg._id;

                        //noinspection JSUnusedLocalSymbols,JSUnresolvedVariable
                        Campaigns.update({_id: tempId}, {$set: campaignArg}, function (errorArg, tempIdArg) {
                            if (errorArg) {
                                reject(errorArg);
                            }
                            else {
                                campaignArg._id = tempIdArg;
                                delete campaignArg.applications;
                                resolve(campaignArg);
                            }
                        });
                    }).catch (function (errorArg) {
                        reject(errorArg);
                    });
                }
            }
            catch (error) {
                reject(error);
            }
        });
    }
};

Meteor.methods({

    /**
     * @desc Retrieve a collection of Campaigns WITHOUT the applications array;
     * @param {String} campaignId
     * @returns {*}
     */
    'campaigns.getCampaign' (campaignId) {
        return CampaignsAPI.getCampaign(campaignId);
    },
    /**
     * @desc Create a collection of Campaigns WITHOUT the applications array;
     * @param {Object} conditions
     * @returns {*}
     */
    'campaigns.getCampaignsSummery' (conditions) {
        return CampaignsAPI.getCampaignsSummery(conditions);
    },
    /**
     * @desc Saves a campaign WITHOUT the applications array;
     * @param {object} campaignArg
     */
    'campaigns.saveCampaign' (campaignArg) {
        return CampaignsAPI.saveCampaign(campaignArg);
    }
});
