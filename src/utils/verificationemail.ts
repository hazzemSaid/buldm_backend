import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';
import { MailtrapTransport } from 'mailtrap';
import dotenv from 'dotenv';

dotenv.config();

const TOKEN: string | undefined = process.env.MAILTRAP_TOKEN;

if (!TOKEN) {
  throw new Error("MAILTRAP_TOKEN is not defined in environment variables.");
}

// Create a transporter with Mailtrap
const transport: Transporter = nodemailer.createTransport(
  MailtrapTransport({
    token: TOKEN,
  })
);

// Sender information
const sender = {
  address: "buldm@gmail.com",
  name: "buldm",
};

// Define the function to send a verification email
async function sendVerificationEmail(toEmail: string, code: string): Promise<void> {
  const mailOptions: SendMailOptions = {
    from: sender,
    to: toEmail,
    subject: "Verify your account",
    text: `Your verification code is: ${code}`,
  };

  try {
    const info = await transport.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

// Export the function
export { sendVerificationEmail };
