import { Meteor } from 'meteor/meteor';

let DispatchExternalTalentsAPI = {

    dispatchExternalTalents (dispatchArguments) {
        return new Promise((resolve, reject) => {
            try {
                let dispatchEmail = 0;

                if (dispatchArguments.dispatchEmail) {
                    for (i = 0; i < dispatchArguments.externalTalents.length; i++) {
                        if  ((dispatchArguments.externalTalents[i][dispatchArguments.headerEmail] !== undefined) &&
                            (dispatchArguments.externalTalents[i][dispatchArguments.headerEmail] !== null) &&
                            (dispatchArguments.externalTalents[i][dispatchArguments.headerEmail] !== '')) {
                            if (dispatchArguments.externalTalents[i][dispatchArguments.headerEmail].indexOf("@") !== -1) {
                                Meteor.call('email.sendAuditionURL',
                                    {   firstName:dispatchArguments.externalTalents[i][dispatchArguments.headerFirstName],
                                        lastName:dispatchArguments.externalTalents[i][dispatchArguments.headerLastName],
                                        email:dispatchArguments.externalTalents[i][dispatchArguments.headerEmail],
                                        position:dispatchArguments.position,
                                        company:dispatchArguments.company,
                                        applicationURL:dispatchArguments.applicationURL
                                    }, (err, res) => {
                                        if (err) {
                                        } else {
                                        }
                                    }
                                );
                                dispatchEmail++;
                            };
                        };  
                    };
                    resolve(dispatchEmail);
                };

                if (dispatchArguments.dispatchSMS) {
                    // TBD
                };

                if (dispatchArguments.dispatchSMS) {
                    // TBD
                };

                if (dispatchArguments.dispatchWhatsApp) {
                    // TBD
                };

                if (dispatchArguments.dispatchLinkedIn) {
                    // TBD
                };

                if (dispatchArguments.dispatchFacebook) {
                    // TBD
                };

                resolve();
            }
            catch (error) {
                 reject(error);
            }
        });
    },
};


Meteor.methods({
    'dispatchExternalTalents' (dispatchArguments) {
        return DispatchExternalTalentsAPI.dispatchExternalTalents(dispatchArguments);
    }
});