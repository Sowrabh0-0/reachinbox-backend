import { setGmailClient, oauth2Client } from '../utils/oauthUtils'; 

export const emailService = {
    getAuthUrl: (): string => {
        const scopes = [
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/gmail.send',
        ];

        return oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
        });
    },


    fetchTokens: async (code: string): Promise<any> => {
        const { tokens } = await oauth2Client.getToken(code);  
        oauth2Client.setCredentials(tokens);  

        return tokens; 
    },

    fetchEmails: async (tokens: any): Promise<any> => {
        const gmailClient = setGmailClient(tokens);


        const res = await gmailClient.users.messages.list({
            userId: 'me',  
            maxResults: 10,  
        });

        return res.data.messages || [];
    }
};
