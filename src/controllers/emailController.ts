import { Request, Response, NextFunction } from 'express';
import { emailService } from '../services/emailService';

export const startOAuth = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authUrl = emailService.getAuthUrl(); 
        res.redirect(authUrl);  
    } catch (error) {
        res.status(500).send('Error starting OAuth process');
    }
};

export const handleOAuthCallback = async (req: any, res: any, next: any): Promise<any> => {
    const code = req.query.code as string;

    if (!code) {
        return res.status(400).send('Authorization code not provided');
    }

    try {
        const tokens = await emailService.fetchTokens(code);
        req.session.tokens = tokens;  
        res.redirect('/api/emails/fetchEmails');
    } catch (error) {
        return res.status(500).send('Error retrieving access tokens');
    }
};

export const fetchEmails = async (req: any, res: any, next: any): Promise<any> => {
    const tokens = req.session.tokens;

    if (!tokens) {
        return res.status(401).send('Not authenticated');
    }

    try {
        const emails = await emailService.fetchEmails(tokens);
        return res.json(emails);
    } catch (error) {
        return res.status(500).send('Error fetching emails');
    }
};
