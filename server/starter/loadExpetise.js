if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Expertise.find().count() == 0) {
      statusDate = new Date();
      var expertiseTopics = [
        {
          "status":"Active",
          "name": "Telecom",
          "description" : "Telecom",
          "verificationStatus" : "Approved",
          "origin" : "Skillera",
          "control" : {
              "createDate" : statusDate
          }
        },
        {
            "status":"Active",
            "name": "Recruiting",
            "description" : "General recruiting",
            "verificationStatus" : "Approved",
            "origin" : "Skillera",
            "control" : {
                "createDate" : statusDate
            }
        },
        {
            "status":"Active",
            "name": "Automobile",
            "description" : "Automobile industry",
            "verificationStatus" : "Approved",
            "origin" : "Skillera",
            "control" : {
                "createDate" : statusDate
            }
        },
        {
            "status":"Active",
            "name": "Insurance",
            "description" : "Insurance",
            "verificationStatus" : "Approved",
            "origin" : "Skillera",
            "control" : {
                "createDate" : statusDate
            } 
        },
        {
            "status":"Active",
            "name": "Finance",
            "description" : "Finance",
            "verificationStatus" : "Approved",
            "origin" : "Skillera",
            "control" : {
                "createDate" : statusDate
            } 
        },
        {
            "status":"Active",
            "name": "Medical",
            "description" : "Medical",
            "verificationStatus" : "Approved",
            "origin" : "Skillera",
            "control" : {
                "createDate" : statusDate
            } 
        },
        {
            "status":"Active",
            "name": "Public sector",
            "description" : "Public sector",
            "verificationStatus" : "Approved",
            "origin" : "Skillera",
            "control" : {
                "createDate" : statusDate
            }  
          }
      ];

      for (var i = 0; i < expertiseTopics.length; i++) {
        Expertise.insert(expertiseTopics[i]);
      }
    }
  });
}