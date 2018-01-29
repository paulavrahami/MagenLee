import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  // code to run on server at startup
});

Meteor.methods({
    'client.getIp'({}) {


        return this.connection.clientAddress;
    }
});
