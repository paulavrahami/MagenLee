if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Skills.find().count() == 0) {
       statusDate = new Date();
      var skills = [
        {
          "status":"Active",
          "name": "C",
          "description" : "Computer language C",
          "verificationStatus" : "Approved",
          "origin" : "Skillera",
          "control" : {
              "createDate" : statusDate
          }
        },
        {
            "status":"Active",
            "name": "JavaScript",
            "description" : "Computer language JavaScript",
            "verificationStatus" : "Approved",
            "origin" : "Skillera",
            "control" : {
                "createDate" : statusDate
            }
        },
        {
            "status":"Active",
            "name": "HTML",
            "description" : "Computer language HTML",
            "verificationStatus" : "Approved",
            "origin" : "Skillera",
            "control" : {
                "createDate" : statusDate
            }
        },
        {
            "status":"Active",
            "name": "CSS",
            "description" : "Computer language CSS",
            "verificationStatus" : "Approved",
            "origin" : "Skillera",
            "control" : {
                "createDate" : statusDate
            } 
        },
        {
            "status":"Active",
            "name": "Modern Design DSP",
            "description" : "Modern Design DSP",
            "verificationStatus" : "Approved",
            "origin" : "Skillera",
            "control" : {
                "createDate" : statusDate
            } 
        },
        {
            "status":"Active",
            "name": "Embedded Programming",
            "description" : "Embedded Programming",
            "verificationStatus" : "Approved",
            "origin" : "Skillera",
            "control" : {
                "createDate" : statusDate
            } 
        },
        {
            "status":"Active",
            "name": "Multi Threading",
            "description" : "Multi Threading",
            "verificationStatus" : "Approved",
            "origin" : "Skillera",
            "control" : {
                "createDate" : statusDate
            } 
        },
        {
            "status":"Active",
            "name": "Software Testing",
            "description" : "Software Testing",
            "verificationStatus" : "Approved",
            "origin" : "Skillera",
            "control" : {
                "createDate" : statusDate
            }  
          }
      ];

      for (var i = 0; i < skills.length; i++) {
        Skills.insert(skills[i]);
      }
    }
  });
}
