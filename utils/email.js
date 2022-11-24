const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //   define options
  const mailOptions = {
    from: 'Chigozie Okeke <bertinchigozie@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  //   send the mail
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
