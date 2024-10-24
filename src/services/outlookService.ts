import { msalClient } from '../utils/outlookUtils';
import axios from 'axios';
import { categorizeEmail } from './emailCategorizer';
import { isEmailProcessed } from '../utils/redisClient'; // No need to import markEmailAsProcessed here
import { emailQueue } from '../utils/bullMQ';
import { config } from '../config/env';


const SCOPES = ['https://graph.microsoft.com/Mail.Read', 'https://graph.microsoft.com/Mail.Send'];

export const getOutlookAuthUrl = async (): Promise<string> => {
    const authUrl = await msalClient.getAuthCodeUrl({
        redirectUri: config.outlookRedirectUri,
        scopes: SCOPES,
    });
    return authUrl;
};

export const fetchOutlookTokens = async (code: string): Promise<string> => {
    const response = await msalClient.acquireTokenByCode({
        code,
        redirectUri: config.outlookRedirectUri,
        scopes: SCOPES,
    });

    return response.accessToken;
};

export const getOutlookEmails = async (accessToken: string): Promise<any[]> => {
    const res = await axios.get('https://graph.microsoft.com/v1.0/me/messages', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const emails = res.data.value || [];

    const categorizedEmails = await Promise.all(
        emails.map(async (email: any) => {
            if (await isEmailProcessed(email.id)) {
                return null;
            }

            try {
                const subject = email.subject || 'No Subject';
                const body = email.body?.content || '';
                const from = email.from?.emailAddress?.address || 'Unknown Sender';

                const emailCategory = await categorizeEmail(subject, body);

                // Add email to the BullMQ queue for processing and reply
                await emailQueue.add('emailQueue', {
                    emailId: email.id,
                    subject,
                    body,
                    from,
                    category: emailCategory,
                    provider: 'outlook',  
                    tokens: accessToken, // Pass the accessToken for sending email
                });

                return {
                    ...email,
                    category: emailCategory,
                };
            } catch (err) {
                if (err instanceof Error) {
                    console.error(`Failed to process email ID ${email.id}: ${err.message}`);
                } else {
                    console.error(`Failed to process email ID ${email.id}: Unknown error`);
                }
                return null;
            }
        })
    );

    return categorizedEmails.filter(email => email !== null);
};
