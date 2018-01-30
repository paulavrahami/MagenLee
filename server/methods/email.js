import { Meteor } from 'meteor/meteor';
let nodemailer = require('nodemailer');
let smtpTransport = require('nodemailer-smtp-transport');

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
            template    += `<div>Thank you for applying for ${emailArguments.position} position with us</div>`;
            template    += `<div>We wish you success!</div>`;
            template    += `<div>${emailArguments.company} recruiting team</div>`;
            template    += `<div>&nbsp;</div>`;
            template    += `<div>(Your qualiFit reference number is <strong>${emailArguments.applicationNumber}</strong>)</div>`;
            template    += `<div><hr></div>`;
            template    += `<div><strong>Powered by qualiFit</strong></div>`;
            // template    += `<div><strong>Powered by <a href="https://qualifit.herokuapp.com/" target="_blank">qualiFit</a></strong> </div>`;

            transporter.sendMail({
                from: 'qualifitsocial@gmail.com',
                to: emailArguments.email,
                subject: `Qualifit application ${emailArguments.applicationNumber}`,
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
            template    += `<div>Please use the following link to complete your application form on qualiFit’s platform where you will be given the opportunity to demonstrate your relevant skills.</div>`;
            template    += `<div>&nbsp;</div>`;
            template    += `<div>We wish you success!</div>`;
            template    += `<div>${emailArguments.company} Recruiting Team</div>`;
            template    += `<div>&nbsp;</div>`;
            template    += `<div><strong>Please click to proceed: <a href="${emailArguments.applicationURL}" target="_blank">${emailArguments.position}</a></strong></div>`;
            template    += `<div>&nbsp;</div>`;
            template    += `<div><hr></div>`;
            template    += `<div><strong>Powered by qualiFit</strong></div>`;
            // template    += `<div><strong>Powered by <a href="https://qualifit.herokuapp.com/" target="_blank">qualiFit</a></strong></div>`;

            transporter.sendMail({
                from: 'qualifitsocial@gmail.com',
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
