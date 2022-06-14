require('dotenv').config();
const nodemailer = require('nodemailer');

const accountSID = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceId = process.env.TWILIO_SERVICE_ID;
const user = process.env.NODEMAILER_USER;
const pass = process.env.NODEMAILER_PASS;
const client = require('twilio')(accountSID, authToken);

module.exports = {
  makeOtp: (phone_number) =>
    new Promise(async (resolve, reject) => {
      await client.verify
        .services(serviceId)
        .verifications.create({
          to: `+91${phone_number}`,
          channel: 'sms',
        })
        .then((verifications) => {
          resolve(verifications);
        })
        .catch(() => {
          reject();
        });
    }),
  verifyOtp: (otp, phone_number) =>
    new Promise(async (resolve, reject) => {
      await client.verify
        .services(serviceId)
        .verificationChecks.create({
          to: `+91${phone_number}`,
          code: otp,
        })
        .then((verification_check) => {
          resolve(verification_check);
        })
        .catch(() => {
          reject();
        });
    }),
  // make otp form email address

  makeEmailOtp: (emailAddress) =>
    new Promise(async (resolve, reject) => {
      const otpCode = Math.floor(100000 + Math.random() * 900000);
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user, // generated ethereal user
          pass,
        },
      });

      // send mail with defined transport object
      const clindOtpCode = {
        from: user, // sender address
        to: emailAddress, // list of receivers
        subject: 'LiveDrive Email Varification', // Subject line
        text: `Your verification code is ${otpCode}`, // plain text body
      };
      transporter.sendMail(clindOtpCode, (error, info) => {
        if (error) reject(error);
        resolve({ msg: 'success', otpCode });
      });
    }),

  // verify email otp

  verifyEmailOtp: (userOtp, otpCode) =>
    new Promise(async (resolve, reject) => {
      if (otpCode == userOtp) resolve();
      reject();
    }),

  makeSuccessMessage: (emailAddress, Date, User, Location) =>
    new Promise(async (resolve, reject) => {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user, // generated ethereal user
          pass,
        },
      });

      // send mail with defined transport object
      const clindOtpCode = {
        from: user, // sender address
        to: emailAddress, // list of receivers
        subject: `You’re booked! Pack your bags – see you on ${Date}`, // Subject line
        text: `Hi ${User}`, // plain text body,
        html: `<b>Hi ${User} <br> It’s confirmed, we’ll see you on ${Date}! Thank you for booking Vehicle with us on ${Location}. You’ll find details of your reservation and payment details enclosed below.

      If you need to get in touch, you can email or phone us directly. We look forward to welcoming you soon!
      
      Thanks again,
      
      The team at LiveDrive</b>`, // html body
      };
      transporter.sendMail(clindOtpCode, (error, info) => {
        if (error) reject(error);
        resolve();
      });
    }),
};
