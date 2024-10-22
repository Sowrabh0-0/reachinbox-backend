import { google } from 'googleapis';
import { config } from '../config/env';

export const oauth2Client = new google.auth.OAuth2(
    config.googleClientId,
    config.googleClientSecret,
    config.googleRedirectUri
);


export const setGmailClient = (tokens: any) => {
    oauth2Client.setCredentials(tokens);
    return google.gmail({ version: 'v1', auth: oauth2Client });
};
