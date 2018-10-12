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
    },
    'removeUser' : function (userId) {
        return (Meteor.users.remove({ _id: userId })) ? true : false;
    },
    'removeUsersPerCompany' : function (compName) {
        return (Meteor.users.remove({ "profile.companyName": compName })) ? true : false;
    }
});
