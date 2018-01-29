import { Meteor } from 'meteor/meteor';


Meteor.methods({
    'checkIfUserExists': function (username) {
        return (Meteor.users.findOne({username: username})) ? true : false;
    },

    'checkIfEmailExists': function (email) {
        return (Meteor.users.find({"emails.address": email}, {limit: 1}).count()>0) ? true : false;
    },

    'setUserPassword': function (userId, newPassword) {
    	return Accounts.setPassword(userId, newPassword, {logout:false});
    }
});
