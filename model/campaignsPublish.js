if (Meteor.isServer) {
  Meteor.publish('campaigns', function() {
    return Campaigns.find({"control.owner": this.userId});
  });
  Meteor.publish('campaignsRecruiter', function(companyName) {
    return Campaigns.find({"control.companyOwner": companyName});
  });
  Meteor.publish('campaignsTalent', function(talentId) {
    return Campaigns.find({"control.owner": talentId});
  });
  Meteor.publish('allCampaigns', function() {
    return Campaigns.find({});
  });
    Meteor.publish('campaignsSummery', function(companyName) {
        return Meteor.Campaigns.find({"control.companyOwner": companyName},
            {
                'fields': {
                    "_id" : true,
                    "cv" : true,
                    "duration" : true,
                    "minScore" : true,
                    "topApplicant" : true,
                    "revealedApplicants"  : true,
                    "emailList" : true,
                    "auditionId" : "true",
                    "salaryExpactations" : true,
                    "skills" : true,
                    "positionName" : true,
                    "positionType" : true,
                    "num" : true,
                    "status" : true,
                    "type" : true,
                    "description" : true,
                    "reportingTo" : true,
                    "department" : true,
                    "location" : true,
                    "goNoGo1" : true,
                    "goNoGo2" : true,
                    "control.owner" : true,
                    "control.companyOwner" : true,
                    "control.createDate" : true,
                    "startDate" : true,
                    "endDate" : true,
                    "statusDate" : true,
                    "applications" : true
                }
            });
    });
}
