import { Meteor } from 'meteor/meteor';


Meteor.methods({
    'removeCompany': function (company) {
        return Companies.remove({name : company}) ? true : false;
    }
});
