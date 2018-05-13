if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Professions.find().count() == 0) {
      statusDate = new Date();
      var professions = [
        {
          "status":"Active",
          "name": "Programmer",
          "description" : "Computer Software programmer",
          "verificationStatus" : "Approved",
          "origin" : "Skillera",
          "control" : {
              "createDate" : statusDate
          }
        },
        {
            "status":"Active",
            "name": "Tester",
            "description" : "Computer software tester",
            "verificationStatus" : "Approved",
            "origin" : "Skillera",
            "control" : {
                "createDate" : statusDate
            }
        },
        {
            "status":"Active",
            "name": "Business Analyst",
            "description" : "Computer systems business analyst",
            "verificationStatus" : "Approved",
            "origin" : "Skillera",
            "control" : {
                "createDate" : statusDate
            }
        },
        {
            "status":"Active",
            "name": "Project Manager",
            "description" : "Computer systems project manager",
            "verificationStatus" : "Approved",
            "origin" : "Skillera",
            "control" : {
                "createDate" : statusDate
            } 
        },
        {
            "status":"Active",
            "name": "Sales",
            "description" : "Sales",
            "verificationStatus" : "Approved",
            "origin" : "Skillera",
            "control" : {
                "createDate" : statusDate
            } 
        },
        {
            "status":"Active",
            "name": "Marketing",
            "description" : "Marketing",
            "verificationStatus" : "Approved",
            "origin" : "Skillera",
            "control" : {
                "createDate" : statusDate
            } 
        },
        {
            "status":"Active",
            "name": "Implementation",
            "description" : "Software systems implementation",
            "verificationStatus" : "Approved",
            "origin" : "Skillera",
            "control" : {
                "createDate" : statusDate
            }  
          }
      ];

      for (var i = 0; i < professions.length; i++) {
        Professions.insert(professions[i]);
      }
    }
  });
}