if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Sequences.find().count() == 0) {
      var sequences = [
        {
          "_id":"campaign",
          "sequence_value": 99

        },
        {
        "_id":"audition",
        "sequence_value": 199
        },
        {
        "_id":"application",
        "sequence_value": 299
        },
        {
        "_id":"company",
        "sequence_value": 399  
        }
      ];

      for (var i = 0; i < sequences.length; i++) {
        Sequences.insert(sequences[i]);
      }
    }
  });
}
