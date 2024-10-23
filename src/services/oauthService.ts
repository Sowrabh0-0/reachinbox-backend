import { setGmailClient, oauth2Client } from '../utils/oauthUtils'; 

export const getAuthUrl = (): string => {
    const scopes = [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
    ];

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
    });
};

export const fetchTokens = async (code: string): Promise<any> => {
    const { tokens } = await oauth2Client.getToken(code);  
    oauth2Client.setCredentials(tokens);  
    return tokens; 
};

export const getEmails = async (tokens: any): Promise<any> => {
    const gmailClient = setGmailClient(tokens);
    const res = await gmailClient.users.messages.list({
        userId: 'me',  
        maxResults: 10,  
    });

    return res.data.messages || [];
};

export const getEmailById = async (tokens: any, emailId: string): Promise<any> => {
    const gmailClient = setGmailClient(tokens);
    const res = await gmailClient.users.messages.get({
        userId: 'me',
        id: emailId,
    });

    return res.data;  
};

export const fetchAllEmailDetails = async (tokens: any): Promise<any[]> => {
    const emailIds = await getEmails(tokens);
    const fullEmailDetails = await Promise.all(
        emailIds.map((email: any) => getEmailById(tokens, email.id))
    );
    return fullEmailDetails;  
};

