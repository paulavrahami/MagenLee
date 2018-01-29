import { Meteor } from 'meteor/meteor';

let DispatchAPI = {

    emailDispatch (dispatchArguments) {
        return new Promise((resolve, reject) => {

            let conditions = {};
            var professionSkills = dispatchArguments.profession+" "+dispatchArguments.skill1+" "+dispatchArguments.skill2+" "+dispatchArguments.skill3;
            conditions = {$and:[{"$text": {"$search": professionSkills}},
                                {$or:[{country: dispatchArguments.country},{city: dispatchArguments.city}]},
                                {status: 'Active'},
                                {shareContact: true}]};
            try {
                let talents = Talents.find(conditions);
                let results = 0;

                talents.forEach(function (talent) {
                    Meteor.call('email.sendAuditionURL',
                        {
                            firstName:talent.firstName,
                            lastName:talent.lastName,
                            email:talent.email,
                            position:dispatchArguments.position,
                            company:dispatchArguments.company,
                            applicationURL:dispatchArguments.applicationURL
                        }, (err, res) => {
                          if (err) {
                          } else {
                          }
                        }
                    );
                    results++;
                });
                resolve(results);
            }
            catch (error) {
                 reject(error);
            }
        });
    },

    smsDispatch (dispatchArguments) {
        return new Promise((resolve, reject) => {
            
        });
    },

    whatsAppDispatch (dispatchArguments) {
        return new Promise((resolve, reject) => {
            
        });
    },

    linkedInDispatch (dispatchArguments) {
        return new Promise((resolve, reject) => {
            
        });
    },

    facebookDispatch (dispatchArguments) {
        return new Promise((resolve, reject) => {
            
        });
    }
};


Meteor.methods({
    'dispatch.email' (dispatchArguments) {
        return DispatchAPI.emailDispatch(dispatchArguments);
    },

    'dispatch.sms' (dispatchArguments) {
        return DispatchAPI.smsDispatch(dispatchArguments);
    },

    'dispatch.whatsApp' (dispatchArguments) {
        return DispatchAPI.whatsAppDispatch(dispatchArguments);
    },

    'dispatch.linkedIn' (dispatchArguments) {
        return DispatchAPI.LinkInDispatch(dispatchArguments);
    },

    'dispatch.facebook' (dispatchArguments) {
        return DispatchAPI.facebookDispatch(dispatchArguments);
    }
});
