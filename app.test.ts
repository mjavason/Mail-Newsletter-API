import { renderMailTemplate, sendMail } from './app'; // Adjust the import to your actual file path
import fs from 'fs';
import nodeMailer from 'nodemailer';

jest.mock('fs');
// Create a mock for readFileSync and type it as a jest.Mock
const readFileSyncMock = fs.readFileSync as jest.Mock;

describe('renderMailTemplate', () => {
  it('should render the template with the provided data', async () => {
    const templateContent = '<h1>{{title}}</h1><p>{{body}}</p>';
    const templatePath = 'base.html';
    const data = { title: 'Test Title', body: 'Test Body' };

    readFileSyncMock.mockReturnValue(templateContent);

    const result = await renderMailTemplate(templatePath, data);

    expect(result).toBe('<h1>Test Title</h1><p>Test Body</p>');
    expect(fs.readFileSync).toHaveBeenCalledWith(templatePath, 'utf-8');
  });
});

describe('sendMail', () => {
  it('should send an email with the provided details', async () => {
    const recipientEmail = 'test@example.com';
    const mailHtmlBody = '<h1>Test Email</h1>';
    const mailSubject = 'Test Subject';

    // Call the actual sendMail function
    const result = await sendMail(recipientEmail, mailHtmlBody, mailSubject);

    // Assert that the result is truthy (assuming sendMail returns true on success)
    expect(result).toBeTruthy();
  });

});
