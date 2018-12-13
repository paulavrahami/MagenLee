import { Meteor } from 'meteor/meteor';
let nodemailer = require('nodemailer');
let smtpTransport = require('nodemailer-smtp-transport');

//*** NOTE - Temp Solution: qualifitsocial@gmai.com is an old Gmail account we used. When the company name
//*** has been changed from qualiFit to Skillera additional email address has been added to the qualifit
//*** account in gmail for the "send mail as" option to show -> skillera.contact@gmail.com
let transporter = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    auth: {
        user: 'qualifitsocial@gmail.com',
        pass: 'mnzgjodlsnkhdiwl'
    }

}));

let SendEmailAPI = {

    sendThankYouForApply (emailArguments) {
        return new Promise((resolve, reject) => {

            let dateTime = (new Date()).toDateString();
            let template = '';
            template    += `<div>${dateTime}</div>`;
            template    += `<div>&nbsp;</div>`;
            template    += `<div><strong>Dear ${emailArguments.firstName} ${emailArguments.lastName}</strong></div>`;
            template    += `<div><hr></div>`;

            if (emailArguments.campaignType === 'Recruitment'){
               
               
                template    += `<div>Thank you for applying for the ${emailArguments.position} position with us</div>`;
                template    += `<div>We wish you success!</div>`;
                template    += `<div>${emailArguments.company} recruiting team</div>`;
                template    += `<div>&nbsp;</div>`;
                template    += `<div>(Your Skillera reference number is <strong>${emailArguments.applicationNumber}</strong>)</div>`;
                template    += `<div><hr></div>`;
                template    += `<div><strong>Powered by Skillera</strong></div>`;
                template    += `<div><strong>Powered by <a href="www.skillera.pro" target="_blank">skillera</a></strong> </div>`;
                template    += `<div><br></div>`;
                template    += `<div>Please do not reply to this email</div>`;

            }  else {
                               
                template    += `<div>Thank you for answering the ${emailArguments.position} quiz</div>`;
                template    += `<div>We wish you success!</div>`;
                template    += `<div>&nbsp;</div>`;
                template    += `<div>(Your Skillera reference number is <strong>${emailArguments.applicationNumber}</strong>)</div>`;
                template    += `<div><hr></div>`;
                template    += `<div><strong>Powered by Skillera</strong></div>`;
                template    += `<div><strong>Powered by <a href="www.skillera.pro" target="_blank">skillera</a></strong> </div>`;
                template    += `<div><br></div>`;
                template    += `<div>Please do not reply to this email</div>`;
            };

            // let dateTime = (new Date()).toDateString();
            // let template = '';
            // template    += `<div>${dateTime}</div>`;
            // template    += `<div>&nbsp;</div>`;
            // template    += `<div><strong>Dear ${emailArguments.firstName} ${emailArguments.lastName}</strong></div>`;
            // template    += `<div><hr></div>`;
            // template    += `<div>Thank you for applying for the ${emailArguments.position} position with us</div>`;
            // template    += `<div>We wish you success!</div>`;
            // template    += `<div>${emailArguments.company} recruiting team</div>`;
            // template    += `<div>&nbsp;</div>`;
            // template    += `<div>(Your Skillera reference number is <strong>${emailArguments.applicationNumber}</strong>)</div>`;
            // template    += `<div><hr></div>`;
            // template    += `<div><strong>Powered by Skillera</strong></div>`;
            // // template    += `<div><strong>Powered by <a href="https://skillera.herokuapp.com/" target="_blank">skillera</a></strong> </div>`;
            // template    += `<div><br></div>`;
            // template    += `<div>Please do not reply to this email</div>`;

            transporter.sendMail({
                from: 'skillera.contact@gmail.com',
                to: emailArguments.email,
                subject: `Skillera Application ${emailArguments.applicationNumber}`,
                html: template
            }, function(error, response) {
                if (error) {
                    reject(error);
                } else {
                    resolve(response);
                }
            });
        });
    },

    sendAuditionURL (emailArguments) {
        return new Promise((resolve, reject) => {

            let dateTime = (new Date()).toDateString();
            let template = '';
            template    += `<div>${dateTime}</div>`;
            template    += `<div>&nbsp;</div>`;
            template    += `<div><strong>Dear ${emailArguments.firstName} ${emailArguments.lastName}</strong></div>`;
            template    += `<div>&nbsp;</div>`;
            template    += `<div>We are pleased to provide you with the opportunity to join ${emailArguments.company} for a ${emailArguments.position} position.</div>`;
            template    += `<div>Please use the following link to complete your application form on Skillera’s platform where you will be given the opportunity to demonstrate your relevant skills.</div>`;
            template    += `<div>&nbsp;</div>`;
            template    += `<div>We wish you success!</div>`;
            template    += `<div>${emailArguments.company} Recruiting Team</div>`;
            template    += `<div>&nbsp;</div>`;
            template    += `<div><strong>Please click to proceed: <a href="${emailArguments.applicationURL}" target="_blank">${emailArguments.position}</a></strong></div>`;
            template    += `<div>&nbsp;</div>`;
            template    += `<div><hr></div>`;
            template    += `<div><strong>Powered by Skillera</strong></div>`;
            // template    += `<div><strong>Powered by <a href="https://skillera.herokuapp.com/" target="_blank">skillera</a></strong></div>`;
            template    += `<div><br></div>`;
            template    += `<div>Please do not reply to this email</div>`;

            transporter.sendMail({
                from: 'skillera.contact@gmail.com',
                to: emailArguments.email,
                subject: `Job Opportunity - ${emailArguments.position}`,
                html: template
            }, function(error, response) {
                if (error) {
                    reject(error);
                } else {
                    resolve(response);
                }
            });
        });
    }
};

Meteor.methods({

    'email.sendThankYouForApply' (emailArguments) {
        return SendEmailAPI.sendThankYouForApply(emailArguments);
    },

    'email.sendAuditionURL' (emailArguments) {
        return SendEmailAPI.sendAuditionURL(emailArguments);
    }
});
