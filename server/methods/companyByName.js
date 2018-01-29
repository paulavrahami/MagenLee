import { Meteor } from 'meteor/meteor';


Meteor.methods({
    'getCompanyByName': function (companyname) {
      return Companies.findOne({name: companyname});
    }
});
