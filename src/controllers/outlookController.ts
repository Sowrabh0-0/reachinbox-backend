import { Request, Response } from 'express';
import { getAuthUrl, fetchTokens, fetchOutlookEmails } from '../services/outlookService';
import logger from '../utils/logger';
import 'express-session';


declare module 'express-session' {
    interface Session {
        outlookAccessToken?: string;
    }
}


export const startOutlookOAuth = async (req: Request, res: Response) => {
    const authUrl = getAuthUrl();
    res.redirect(await authUrl);
};


export const handleOutlookOAuthCallback = async (req: any, res: any, next: any): Promise<any> => {
    const code = req.query.code as string;

    if (!code) {
        return res.status(400).send('Authorization code not provided');
    }

    try {
        const accessToken = await fetchTokens(code);
        req.session.outlookAccessToken = accessToken;
        res.redirect('/dashboard');
    } catch (error) {
        logger.error('Error fetching Outlook tokens:', error);
        return res.status(500).send('Error fetching Outlook tokens');
    }
};


export const getOutlookEmails = async (req: Request, res: Response) => {
    const accessToken = req.session.outlookAccessToken; 

    if (!accessToken) {
        return res.status(401).send('Not authenticated');
    }

    try {
        const emails = await fetchOutlookEmails(accessToken);  
        return res.json(emails); 
    } catch (error) {
        logger.error('Error fetching Outlook emails:', error);
        return res.status(500).send('Error fetching Outlook emails');
    }
};