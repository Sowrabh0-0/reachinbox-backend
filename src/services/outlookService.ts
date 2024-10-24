import { msalClient } from '../utils/outlookUtils';
import axios from 'axios';
import { categorizeEmail } from './emailCategorizer';
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
            const subject = email.subject || 'No Subject';
            const body = email.body?.content || '';

            const emailCategory = await categorizeEmail(subject, body);
            return {
                ...email,
                category: emailCategory,
            };
        })
    );

    return categorizedEmails;
};
