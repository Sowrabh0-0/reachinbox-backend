import { setGmailClient, oauth2Client } from '../utils/oauthUtils'; 
import { gmail_v1 } from 'googleapis';

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
        format: 'full',
    });

    const emailData: gmail_v1.Schema$Message | undefined = res.data;
    
    if (!emailData || !emailData.payload) {
        return {
            id: emailId,
            subject: 'No subject',
            from: 'Unknown sender',
            date: 'Unknown date',
            body: 'No content',
        };
    }

    const headers = emailData.payload.headers;
    const subject = headers?.find((header: gmail_v1.Schema$MessagePartHeader) => header.name === 'Subject')?.value || 'No subject';
    const from = headers?.find((header: gmail_v1.Schema$MessagePartHeader) => header.name === 'From')?.value || 'Unknown sender';
    const date = headers?.find((header: gmail_v1.Schema$MessagePartHeader) => header.name === 'Date')?.value || 'Unknown date';


    let body = '';
    if (emailData.payload.parts) {
        const part = emailData.payload.parts.find((p: gmail_v1.Schema$MessagePart) => p.mimeType === 'text/plain');
        if (part && part.body?.data) {
            body = Buffer.from(part.body.data, 'base64').toString('utf-8');
        }
    } else if (emailData.payload.body?.data) {
        body = Buffer.from(emailData.payload.body.data, 'base64').toString('utf-8');
    }

    return {
        id: emailId,
        subject,
        from,
        date,
        body: body || 'No content',
    };
};

export const fetchAllEmailDetails = async (tokens: any): Promise<any[]> => {
    const emailIds = await getEmails(tokens);
    const fullEmailDetails = await Promise.all(
        emailIds.map((email: any) => getEmailById(tokens, email.id))
    );
    return fullEmailDetails;  
};
