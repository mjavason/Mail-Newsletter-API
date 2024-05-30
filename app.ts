import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors';
import cors from 'cors';
import axios, { all } from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import handlebars from 'handlebars';
import nodeMailer from 'nodemailer';

//#region app setup
const app = express();
app.use(express.json()); // Middleware to parse JSON or URL-encoded data
app.use(express.urlencoded({ extended: true })); // For complex form data
app.use(cors());
dotenv.config({ path: './.env' });
//#endregion

//keys and configs
const PORT = process.env.PORT || 3000;
const baseURL = 'https://httpbin.org';
const SITE_LINK = process.env.SITE_LINK || 'localhost:3000';
const MAIL_ADDRESS = process.env.MAIL_ADDRESS || 'michaelorji@mail.com';
const MAIL_PASSWORD = process.env.MAIL_PASSWORD || 'xxxx';
let allUsers: string[] = [
  'orjimichael4886@gmail.com',
  'orjimichael2240@gmail.com',
  'penxchainservices@gmail.com',
];

// Email account setup and login. You need to pass in your email credentials and use this app to control it.
export const transporter = nodeMailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: MAIL_ADDRESS,
    pass: MAIL_PASSWORD,
  },
});

export async function renderMailTemplate(templatePath: string, data: object) {
  // Load the email template
  const emailTemplate = fs.readFileSync(templatePath, 'utf-8');

  // Compile the template
  return await handlebars.compile(emailTemplate)(data);
}

export async function sendMail(
  recipientEmail: string,
  mailHtmlBody: string | any,
  mailSubject: string
) {
  // This is where the actual email message is built. Things like CC, recipients, attachments, and so on are configured here.
  return await transporter.sendMail({
    from: `Support <${MAIL_ADDRESS}>`,
    to: recipientEmail,
    subject: mailSubject,
    html: mailHtmlBody,
  });
}

app.post('/send-newsletter', async (req: Request, res: Response) => {
  const { title, body } = req.body;

  if (!body || !title)
    return res.status(400).send({
      success: false,
      message: 'Required parameters: title and/or body is missing',
    });

  for (let i = 0; i < allUsers.length; i++) {
    const data = {
      title,
      body,
      unsubscribeLink: `${SITE_LINK}/newsletter-subscription/unsubscribe/${allUsers[i]}`,
    };
    const templatePath = 'base.html';
    const compiledTemplate = await renderMailTemplate(templatePath, data);

    await sendMail(allUsers[i], compiledTemplate, title);
    console.log(`Mail sent successfully to ${allUsers[i]}`);
  }

  return res.status(200).send({
    success: true,
    message: 'Newsletter sent to all subscribers successfully',
  });
});

//#region Server setup

// default message
app.get('/api', async (req: Request, res: Response) => {
  const result = await axios.get(baseURL);
  console.log(result.status);
  res.send({ message: 'Demo API called (httpbin.org)', data: result.status });
});

//default message
app.get('/', (req: Request, res: Response) =>
  res.send({ message: 'API is Live!' })
);

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(`${'\x1b[31m'}${err.message}${'\x1b[0m]'}`);
  return res
    .status(500)
    .send({ success: false, statusCode: 500, message: err.message });
});
//#endregion
