import { Meteor } from 'meteor/meteor';


Meteor.methods({
    'checkCompanyPassword': function (companypassword,companyname) {
        return (Companies.findOne({name: companyname, password: companypassword})) ? true : false;
    }
});
