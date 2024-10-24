import { gmail_v1 } from 'googleapis';


export const parseGmailEmail = (emailData: gmail_v1.Schema$Message) => {
    const headers = emailData.payload?.headers;
    const subjectHeader = headers?.find(header => header.name === 'Subject');
    const subject = subjectHeader ? subjectHeader.value : 'No Subject';
    let body = '';

    if (emailData.payload?.body?.data) {
        body = Buffer.from(emailData.payload.body.data, 'base64').toString('utf-8');
    } else if (emailData.payload?.parts) {
        emailData.payload.parts.forEach((part) => {
            if (part.mimeType === 'text/plain' && part.body?.data) {
                body = Buffer.from(part.body.data, 'base64').toString('utf-8');
            }
        });
    }

    return {
        subject,
        body,
    };
};
