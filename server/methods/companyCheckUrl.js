import { Meteor } from 'meteor/meteor';

Meteor.methods({
    'checkIfUrlExists': function (companyUrl) {
        return (Companies.findOne({url: companyUrl})) ? true : false;
    }
});
