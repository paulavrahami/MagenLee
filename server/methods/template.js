import { Meteor } from 'meteor/meteor';

Meteor.methods({
    'getTemplate': function (templateId) {
        return TemplatesCollection.findOne({_id: templateId});
    }
});
