import { Meteor } from 'meteor/meteor';


Meteor.methods({
    'getCompanyByPassword': function (companypassword) {
      // let a = Companies.findOne({name: companyname});
      // console.log(a.password);
      //   return a.password;
      return Companies.findOne({password: companypassword});
    }
});
