import { Meteor } from 'meteor/meteor';

Meteor.methods({
    'checkIfCompanyExists': function (companyName) {
        return (Companies.findOne({name: companyName})) ? true : false;
    }
});
