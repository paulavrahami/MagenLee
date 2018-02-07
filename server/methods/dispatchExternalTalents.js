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
                             
                                // Create an empty application for the talent
                                emptyApplication = {};
                                var applicationSequence = Sequences.findAndModify({query:{_id: 'application'},update: {$inc:{'sequence_value':1}}}); /*[Zviks] Need to use the dbgservice; I didnt know how to include it*/
                                emptyApplication.number = 'APL' + applicationSequence.sequence_value;
                                emptyApplication.firstName = dispatchArguments.externalTalents[i][dispatchArguments.headerFirstName];
                                emptyApplication.lastName = dispatchArguments.externalTalents[i][dispatchArguments.headerLastName];
                                emptyApplication.email = dispatchArguments.externalTalents[i][dispatchArguments.headerEmail];
                                emptyApplication.campaignId = dispatchArguments.campaign;
                                emptyApplication.sessions = [];
                                emptyApplication.control = {
                                    origin: 'Proactive Campaign', /*[Zviks] Need to use the ENUM; I didnt know how to include it*/
                                    createDate: new Date(),
                                    status: 'Sent to Talent', /*[Zviks] Need to use the ENUM; I didnt know how to include it*/
                                    statusDate: new Date(),
                                    companyOwner : dispatchArguments.company
                                };
                                var emptyApplicationId = Applications.insert(emptyApplication, function (errorArg, applicationIdArg) {
                                    if (errorArg) {
                                        showErrorMessage(errorArg.message);
                                        console.log("Error - insert empty application: ",errorArg.message);
                                    }
                                });
                                // Build the application (campaign) URL
                                var applicationURL = dispatchArguments.shortURL +
                                                     emptyApplication.campaignId +
                                                     '/' +
                                                     emptyApplicationId;
                                // Send an invite
                                Meteor.call('email.sendAuditionURL',
                                    {   firstName:dispatchArguments.externalTalents[i][dispatchArguments.headerFirstName],
                                        lastName:dispatchArguments.externalTalents[i][dispatchArguments.headerLastName],
                                        email:dispatchArguments.externalTalents[i][dispatchArguments.headerEmail],
                                        position:dispatchArguments.position,
                                        company:dispatchArguments.company,
                                        applicationURL:applicationURL
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