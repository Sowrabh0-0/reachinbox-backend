import { Request, Response, NextFunction } from 'express';
import { emailService } from '../services/emailService';
import logger from '../utils/logger';

export const startOAuth = (req: Request, res: Response, next: NextFunction): void => {
    try {
        logger.info('Starting OAuth flow');
        const authUrl = emailService.getAuthUrl(); 
        res.redirect(authUrl);  
    } catch (error) {
        logger.error('Error starting OAuth process: ' + (error as Error).message);
        res.status(500).send('Error starting OAuth process');
    }
};

export const handleOAuthCallback = async (req: any, res: any, next: any): Promise<any> => {
    const code = req.query.code as string;

    if (!code) {
        logger.error('Authorization code not provided');
        return res.status(400).send('Authorization code not provided');
    }

    try {
        logger.info('OAuth callback received, fetching tokens');
        const tokens = await emailService.fetchTokens(code);
        req.session.tokens = tokens;  
        logger.info('Tokens successfully stored in session');
        res.redirect('/api/emails/fetchEmails');  
    } catch (error) {
        logger.error('Error retrieving access tokens: ' + (error as Error).message);
        return res.status(500).send('Error retrieving access tokens');
    }
};

export const fetchEmails = async (req: any, res: any, next: any): Promise<any> => {
    const tokens = req.session.tokens;  

    if (!tokens) {
        logger.warn('No tokens found in session');
        return res.status(401).send('Not authenticated');
    }

    try {
        logger.info('Fetching emails');
        const emails = await emailService.fetchEmails(tokens);  
        logger.info('Emails successfully fetched');
        return res.json(emails);  
    } catch (error) {
        logger.error('Error fetching emails: ' + (error as Error).message);
        return res.status(500).send('Error fetching emails');
    }
};
