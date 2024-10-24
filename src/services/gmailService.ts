import { setGmailClient, oauth2Client } from '../utils/oauthUtils';
import { gmail_v1 } from 'googleapis';
import { categorizeEmail } from './emailCategorizer';

export const getGmailAuthUrl = (): string => {
    const scopes = [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
    ];

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
    });
};

export const fetchGmailTokens = async (code: string): Promise<any> => {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    return tokens;
};

export const getGmailEmails = async (tokens: any): Promise<any[]> => {
    const gmailClient = setGmailClient(tokens);
    const res = await gmailClient.users.messages.list({
        userId: 'me',
        maxResults: 10,
    });

    const emails = res.data.messages || [];

    const categorizedEmails = await Promise.all(
        emails.map(async (email: any) => {
            const emailDetails = await gmailClient.users.messages.get({
                userId: 'me',
                id: email.id,
                format: 'full',
            });

            const payload = emailDetails.data.payload;

            if (!payload || !payload.headers) {
                return {
                    id: email.id,
                    category: 'No content',
                    subject: 'No Subject',
                    body: 'No Content',
                };
            }

            const headers = payload.headers;
            const subject = headers.find((header) => header.name === 'Subject')?.value || 'No Subject';

            // Extracting body content, first checking text/plain part or default to text/html
            let body = '';
            if (payload.parts) {
                const part = payload.parts.find((p) => p.mimeType === 'text/plain') || payload.parts.find((p) => p.mimeType === 'text/html');
                if (part && part.body?.data) {
                    body = Buffer.from(part.body.data, 'base64').toString('utf-8');
                }
            } else if (payload.body?.data) {
                body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
            }

            const emailCategory = await categorizeEmail(subject, body);
            return {
                id: email.id,
                category: emailCategory,
                subject,
                body,
            };
        })
    );

    return categorizedEmails;
};
