import { setGmailClient, oauth2Client } from '../utils/oauthUtils';
import { categorizeEmail } from './emailCategorizer';
import { isEmailProcessed } from '../utils/redisClient'; // No need to import markEmailAsProcessed here
import { emailQueue } from '../utils/bullMQ'; // Import BullMQ queue

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
    
    try {
        const res = await gmailClient.users.messages.list({
            userId: 'me',
            maxResults: 10,
        });

        const emails = res.data.messages || [];

        const categorizedEmails = await Promise.all(
            emails.map(async (email: any) => {
                if (await isEmailProcessed(email.id)) {
                    return null;
                }

                try {
                    const emailDetails = await gmailClient.users.messages.get({
                        userId: 'me',
                        id: email.id,
                        format: 'full',
                    });

                    const payload = emailDetails.data?.payload;
                    const headers = payload?.headers || [];
                    const subject = headers.find((header) => header.name === 'Subject')?.value || 'No Subject';
                    const from = headers.find((header) => header.name === 'From')?.value || 'Unknown Sender';
                    const date = headers.find((header) => header.name === 'Date')?.value || 'Unknown Date';

                    let body = '';
                    if (payload?.parts) {
                        const part = payload.parts.find((p) => p.mimeType === 'text/plain') || payload.parts.find((p) => p.mimeType === 'text/html');
                        if (part && part.body?.data) {
                            body = Buffer.from(part.body.data, 'base64').toString('utf-8');
                        }
                    } else if (payload?.body?.data) {
                        body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
                    }

                    const emailCategory = await categorizeEmail(subject, body);

                    // Add email to the BullMQ queue for processing and reply
                    await emailQueue.add('emailQueue', {
                        emailId: email.id,
                        subject,
                        body,
                        from,
                        category: emailCategory,
                        provider: 'gmail',
                        tokens: tokens, // Pass the tokens for sending email
                    });

                    return {
                        id: email.id,
                        category: emailCategory,
                        subject,
                        body,
                        from,
                        date,
                    };
                } catch (err) {
                    console.error(`Failed to process email ID ${email.id}: ${(err as Error).message}`);
                    return null;
                }
            })
        );

        return categorizedEmails.filter(email => email !== null);
    } catch (err) {
        console.error(`Error fetching Gmail emails: ${(err as Error).message}`);
        return [];
    }
};
