const nodemailer = require('nodemailer')
require('dotenv').config()

module.exports = async function mailer(s, b, h) {
  
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL, // generated ethereal user
        pass: process.env.EMAIL_PASSWORD, // generated ethereal password
      },
    });
  
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"oz-crawler" <vuong.patrick@outlook.com>', // sender address
      to: "vuong.patrick@gmail.com", // list of receivers
      subject: s, // Subject line
      text: b, // plain text body
      html: h, // html body
    });
  
    console.log("Message sent: %s", info.messageId);
  

  }



  