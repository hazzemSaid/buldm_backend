const Nodemailer = require("nodemailer");
const { MailtrapTransport } = require("mailtrap");
const dotenv = require("dotenv");
dotenv.config();
const TOKEN = process.env.MAILTRAP_TOKEN;

const transport = Nodemailer.createTransport(
  MailtrapTransport({
    token: TOKEN,
  })
);

const sender = {
  address: "hello@demomailtrap.co",
  name: "Mailtrap Test",
};

async function sendVerificationEmail(toEmail, code) {
	const mailOptions = {
	  from: {
		 name: "My App",
		 address: "hello@demomailtrap.co",
	  },
	  to: toEmail,
	  subject: "Verify your account",
	  text: `Your verification code is: ${code}`,
	};
 
	try {
		console.log("Sending email to:", toEmail);
	  const info = await transport.sendMail(mailOptions);
	  console.log("Email sent:", info.messageId);
	} catch (error) {
	  console.error("Error sending email:", error);
	}
 }
 module.exports = { sendVerificationEmail };
