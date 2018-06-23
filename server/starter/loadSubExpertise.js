if (Meteor.isServer) {
  Meteor.startup(function () {
    if (SubExpertise.find().count() == 0) {
      statusDate = new Date();
      var subExpertiseTopics = [
        {
          "status":"Active",
          "name": "Mobile",
          "description" : "Mobile",
          "verificationStatus" : "Approved",
          "origin" : "Skillera",
          "control" : {
              "createDate" : statusDate
          }
        },
        {
            "status":"Active",
            "name": "Fixed line",
            "description" : "Fixed line",
            "verificationStatus" : "Approved",
            "origin" : "Skillera",
            "control" : {
                "createDate" : statusDate
            }
        },
        {
            "status":"Active",
            "name": "Life",
            "description" : "Life Insurance",
            "verificationStatus" : "Approved",
            "origin" : "Skillera",
            "control" : {
                "createDate" : statusDate
            }
        },
        {
            "status":"Active",
            "name": "Actuar",
            "description" : "Actuar Insurance",
            "verificationStatus" : "Approved",
            "origin" : "Skillera",
            "control" : {
                "createDate" : statusDate
            } 
        },
        {
            "status":"Active",
            "name": "Loans",
            "description" : "Loans",
            "verificationStatus" : "Approved",
            "origin" : "Skillera",
            "control" : {
                "createDate" : statusDate
            } 
        },
        {
            "status":"Active",
            "name": "Investment",
            "description" : "Investment",
            "verificationStatus" : "Approved",
            "origin" : "Skillera",
            "control" : {
                "createDate" : statusDate
            } 
        },
        {
            "status":"Active",
            "name": "Municipal",
            "description" : "Municipal",
            "verificationStatus" : "Approved",
            "origin" : "Skillera",
            "control" : {
                "createDate" : statusDate
            }  
          }
      ];

      for (var i = 0; i < subExpertiseTopics.length; i++) {
        SubExpertise.insert(subExpertiseTopics[i]);
      }
    }
  });
}