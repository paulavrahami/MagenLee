import { Meteor } from 'meteor/meteor';


Meteor.methods({
    'checkCompanyPasswordUnique': function (companypassword) {
        return (Companies.findOne({password: companypassword})) ? true : false;
    }
});
